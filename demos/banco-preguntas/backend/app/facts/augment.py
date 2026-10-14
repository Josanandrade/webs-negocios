"""Extracción complementaria de hechos para temas con poca cobertura.

La extracción normal se ejecuta una sola vez por fragmento. Eso es eficiente, pero puede
quedarse corta para un tema concreto: si la primera pasada solo encontró unos pocos hechos,
las generaciones posteriores no volvían a mirar el texto. Este módulo hace una pasada
complementaria SOLO cuando una generación pide más preguntas de las que el tema puede
alimentar.

La seguridad no cambia: la IA solo propone hechos y ``verify_fact`` exige que sujeto, valor
y cita existan literalmente en el documento y que la cita corresponda a una página real.
Los hechos repetidos se ignoran por la restricción única de la base de datos.
"""
from __future__ import annotations

from collections import defaultdict
from typing import TYPE_CHECKING, Any
from uuid import UUID

from sqlalchemy import text

from app.facts.extract import ChunkForFacts, PageRef, SCHEMA, verify_fact
from app.llm.base import LLMError, QuotaExhausted
from app.llm.client import call_llm

if TYPE_CHECKING:
    from app.jobs.runner import JobContext

AUGMENT_BATCH_CHARS = 5500
AUGMENT_MAX_FACTS_PER_FRAGMENT = 16
MAX_AUGMENT_PASSES = 2

AUGMENT_SYSTEM = """Eres un extractor EXHAUSTIVO de datos para crear preguntas de examen.
Trabajas únicamente con el texto entregado. Nunca añades conocimiento propio, nunca deduces
y nunca completas información que no esté escrita de forma explícita.

Tu objetivo es encontrar hechos NUEVOS que no estén ya en la lista «YA EXTRAÍDOS» de cada
fragmento. Extrae tantos hechos útiles para examen como permita el texto, hasta un máximo de
16 por fragmento en esta pasada. Un mismo párrafo puede contener varios hechos distintos.

Para cada hecho devuelve:
- fragment: F1, F2... del que procede.
- kind: definition, characteristic, classification, quantity, date, name, requirement,
  deadline, procedure_step, exception o relation.
- subject: concepto del que trata, escrito como aparece en el fragmento; nunca pronombres.
- attribute: propiedad breve y reutilizable (definición, característica, dosis, plazo, etc.).
- value: dato concreto copiado del texto.
- quote: cita LITERAL, CONTIGUA y suficiente para demostrar el hecho, de una o dos frases.

No extraigas títulos aislados, índices, ejemplos hipotéticos, opiniones, referencias a tablas
sin contenido ni frases incompletas. No repitas hechos incluidos en «YA EXTRAÍDOS».
Prioriza variedad: definiciones, características, relaciones, requisitos, excepciones,
clasificaciones, nombres, cifras, fechas y pasos cuando existan."""


def _scope_params(scope: list[UUID] | None) -> list[str] | None:
    return [str(x) for x in scope] if scope is not None else None


def _candidate_count(ctx: "JobContext", scope: list[UUID] | None) -> int:
    """Hechos que todavía pueden alimentar una pregunta en futuras generaciones."""
    with ctx.session() as s:
        return int(s.execute(text("""
            select count(*) from facts f
            where f.document_id = :d
              and (cast(:scope as uuid[]) is null or f.section_id = any(cast(:scope as uuid[])))
              and not exists (
                select 1 from questions q where q.fact_id = f.id and q.status <> 'discarded'
              )
              and not exists (
                select 1 from question_candidates c
                where c.fact_id = f.id and c.status = 'rejected_duplicate'
              )
              and (
                select count(*) from question_candidates c
                where c.fact_id = f.id
                  and c.status in ('rejected_no_distractors', 'rejected_generation',
                                   'rejected_deterministic', 'rejected_verification')
              ) < 4
        """), {"d": ctx.document_id, "scope": _scope_params(scope)}).scalar_one())


def _chunks(ctx: "JobContext", scope: list[UUID] | None) -> list[ChunkForFacts]:
    """Todos los fragmentos aptos del ámbito, aunque ya se procesaran en la primera pasada."""
    with ctx.session() as s:
        rows = s.execute(text("""
            select c.id, c.section_id, c.text, c.context_header, c.spans, c.flags,
                   lag(c.text) over (partition by c.section_id order by c.ordinal) as previous_text
            from document_chunks c
            where c.document_id = :d and c.is_eligible
              and (cast(:scope as uuid[]) is null or c.section_id = any(cast(:scope as uuid[])))
            order by c.ordinal
        """), {"d": ctx.document_id, "scope": _scope_params(scope)}).mappings().all()
    out: list[ChunkForFacts] = []
    for r in rows:
        previous = r["previous_text"] if "necesita_contexto_previo" in (r["flags"] or []) else None
        out.append(ChunkForFacts(r["id"], r["section_id"], r["text"], r["context_header"], r["spans"], previous))
    return out


def _pages(ctx: "JobContext") -> dict[int, PageRef]:
    with ctx.session() as s:
        return {r.page_number: PageRef(r.id, r.text) for r in s.execute(
            text("select id, page_number, text from document_pages where document_id = :d"),
            {"d": ctx.document_id})}


def _existing(ctx: "JobContext", chunk_ids: list[UUID]) -> dict[UUID, list[str]]:
    hints: dict[UUID, list[str]] = defaultdict(list)
    if not chunk_ids:
        return hints
    with ctx.session() as s:
        rows = s.execute(text("""
            select chunk_id, subject, attribute, value from facts
            where chunk_id = any(cast(:ids as uuid[]))
            order by page_number, char_start
        """), {"ids": [str(x) for x in chunk_ids]}).all()
    for chunk_id, subject, attribute, value in rows:
        hints[chunk_id].append(f"{subject} | {attribute} | {value}")
    return hints


def _batches(chunks: list[ChunkForFacts]) -> list[list[ChunkForFacts]]:
    batches: list[list[ChunkForFacts]] = []
    current: list[ChunkForFacts] = []
    size = 0
    for ch in chunks:
        if current and size + len(ch.text) > AUGMENT_BATCH_CHARS:
            batches.append(current)
            current, size = [], 0
        current.append(ch)
        size += len(ch.text)
    if current:
        batches.append(current)
    return batches


def _prompt(batch: list[ChunkForFacts], existing: dict[UUID, list[str]]) -> str:
    parts: list[str] = []
    for i, ch in enumerate(batch, start=1):
        block = f"### Fragmento F{i}\nSección: {ch.context_header or '—'}\n"
        known = existing.get(ch.id, [])
        if known:
            block += "YA EXTRAÍDOS (no repetir):\n" + "\n".join(f"- {x}" for x in known[-40:]) + "\n---\n"
        if ch.previous_text:
            block += ("CONTEXTO PREVIO (solo para resolver referencias; NO extraigas hechos de aquí):\n"
                      f"{ch.previous_text[-800:]}\n---\n")
        block += f"TEXTO:\n{ch.text}"
        parts.append(block)
    return "Busca hechos adicionales verificables en estos fragmentos.\n\n" + "\n\n".join(parts)


def _store(ctx: "JobContext", facts: list[Any], model: str | None) -> int:
    stored = 0
    if not facts:
        return 0
    with ctx.session() as s:
        for f in facts:
            stored += s.execute(text("""
                insert into facts (user_id, document_id, chunk_id, section_id, page_id, page_number, kind, subject,
                  attribute, value, value_number, unit, slot, subject_norm, value_norm, quote, char_start, char_end,
                  extraction_model)
                values (:u, :d, :c, :sec, :p, :pn, :k, :sub, :att, :val, :num, :unit, :slot, :sn, :vn, :q,
                        :cs, :ce, :m)
                on conflict (document_id, kind, subject_norm, slot, value_norm) do nothing
            """), {
                "u": ctx.user_id, "d": ctx.document_id, "c": f.chunk_id, "sec": f.section_id, "p": f.page_id,
                "pn": f.page_number, "k": f.kind, "sub": f.subject, "att": f.attribute, "val": f.value,
                "num": f.value_number, "unit": f.unit, "slot": f.slot, "sn": f.subject_norm, "vn": f.value_norm,
                "q": f.quote, "cs": f.char_start, "ce": f.char_end, "m": model,
            }).rowcount
    return stored


def augment_facts_for_scope(ctx: "JobContext", scope: list[UUID] | None, target: int) -> int:
    """Añade hechos si el ámbito no tiene margen suficiente para el número pedido.

    Se busca aproximadamente el doble de hechos que preguntas porque algunos no tendrán tres
    distractores suficientemente buenos o no superarán la redacción/verificación. Nunca se
    fuerza una pregunta: si el texto no soporta el hecho, ``verify_fact`` lo rechaza.
    """
    if target <= 0:
        return 0
    available = _candidate_count(ctx, scope)
    desired = min(max(target * 2, target + 12), target + 80)
    if available >= desired:
        return 0

    chunks = _chunks(ctx, scope)
    if not chunks:
        return 0
    pages = _pages(ctx)
    added_total = 0

    for _pass in range(MAX_AUGMENT_PASSES):
        if _candidate_count(ctx, scope) >= desired:
            break
        before_pass = added_total
        existing = _existing(ctx, [c.id for c in chunks])
        for batch in _batches(chunks):
            if _candidate_count(ctx, scope) >= desired:
                break
            by_ref = {f"F{i}": ch for i, ch in enumerate(batch, start=1)}
            try:
                result = call_llm(task="extraction", system=AUGMENT_SYSTEM, prompt=_prompt(batch, existing),
                                  schema=SCHEMA, user_id=ctx.user_id, job_id=ctx.job_id, engine=ctx.engine)
            except QuotaExhausted:
                raise
            except LLMError:
                continue

            verified = []
            per_fragment: dict[UUID, int] = defaultdict(int)
            for raw in result.data.get("facts", []):
                chunk = by_ref.get(str(raw.get("fragment", "")).strip())
                if chunk is None:
                    continue
                per_fragment[chunk.id] += 1
                if per_fragment[chunk.id] > AUGMENT_MAX_FACTS_PER_FRAGMENT:
                    continue
                outcome = verify_fact(raw, chunk, pages)
                if not isinstance(outcome, str):
                    verified.append(outcome)
            added = _store(ctx, verified, result.model_version)
            added_total += added
        if added_total == before_pass:
            break

    return added_total
