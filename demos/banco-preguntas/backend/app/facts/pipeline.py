"""Job 'extract_facts': extrae y verifica hechos de los fragmentos aptos (reanudable).

Cada lote de fragmentos se procesa en una transacción: hechos verificados + marca de
fragmento procesado. Si el proceso se interrumpe, solo se repite el lote en curso.
"""
import json
from collections import Counter
from uuid import UUID

from sqlalchemy import text

from app.facts.extract import MAX_FACTS_PER_FRAGMENT, SCHEMA, SYSTEM, ChunkForFacts, PageRef, VerifiedFact, build_prompt, verify_fact
from app.jobs.runner import JobContext
from app.llm.base import LLMError, QuotaExhausted
from app.llm.client import call_llm

BATCH_CHARS = 7000


def section_scope(session, document_id: UUID, section_ids: list[UUID] | None) -> list[UUID] | None:
    """Ids de las secciones pedidas y todas sus subsecciones (None = todo el documento)."""
    if not section_ids:
        return None
    rows = session.execute(text("""
        with recursive tree as (
          select id from document_sections where document_id = :d and id = any(cast(:ids as uuid[]))
          union
          select s.id from document_sections s join tree t on s.parent_id = t.id
        ) select id from tree"""), {"d": document_id, "ids": [str(i) for i in section_ids]}).scalars().all()
    return list(rows)


def _pending_chunks(ctx: JobContext, scope: list[UUID] | None) -> list[ChunkForFacts]:
    with ctx.session() as s:
        rows = s.execute(text("""
            select c.id, c.section_id, c.text, c.context_header, c.spans, c.flags,
                   lag(c.text) over (partition by c.section_id order by c.ordinal) as previous_text
            from document_chunks c
            where c.document_id = :d
            order by c.ordinal"""), {"d": ctx.document_id}).mappings().all()
        status = dict(s.execute(text("select id, facts_status from document_chunks where document_id = :d"),
                                {"d": ctx.document_id}).all())
        eligible = set(s.execute(text("select id from document_chunks where document_id = :d and is_eligible"),
                                 {"d": ctx.document_id}).scalars())
    result = []
    for r in rows:
        if r["id"] not in eligible or status[r["id"]] != "pending":
            continue
        if scope is not None and r["section_id"] not in scope:
            continue
        needs_context = "necesita_contexto_previo" in r["flags"]
        result.append(ChunkForFacts(r["id"], r["section_id"], r["text"], r["context_header"], r["spans"],
                                    r["previous_text"] if needs_context else None))
    return result


def _batches(chunks: list[ChunkForFacts]) -> list[list[ChunkForFacts]]:
    batches, current, size = [], [], 0
    for ch in chunks:
        if current and size + len(ch.text) > BATCH_CHARS:
            batches.append(current)
            current, size = [], 0
        current.append(ch)
        size += len(ch.text)
    if current:
        batches.append(current)
    return batches


def _pages(ctx: JobContext) -> dict[int, PageRef]:
    with ctx.session() as s:
        return {r.page_number: PageRef(r.id, r.text) for r in s.execute(
            text("select id, page_number, text from document_pages where document_id = :d"), {"d": ctx.document_id})}


def _store(ctx: JobContext, batch: list[ChunkForFacts], facts: list[VerifiedFact], model: str | None,
           status: str = "done") -> int:
    stored = 0
    with ctx.session() as s:
        for f in facts:
            stored += s.execute(text("""
                insert into facts (user_id, document_id, chunk_id, section_id, page_id, page_number, kind, subject,
                  attribute, value, value_number, unit, slot, subject_norm, value_norm, quote, char_start, char_end,
                  extraction_model)
                values (:u, :d, :c, :sec, :p, :pn, :k, :sub, :att, :val, :num, :unit, :slot, :sn, :vn, :q, :cs, :ce, :m)
                on conflict (document_id, kind, subject_norm, slot, value_norm) do nothing"""),
                {"u": ctx.user_id, "d": ctx.document_id, "c": f.chunk_id, "sec": f.section_id, "p": f.page_id,
                 "pn": f.page_number, "k": f.kind, "sub": f.subject, "att": f.attribute, "val": f.value,
                 "num": f.value_number, "unit": f.unit, "slot": f.slot, "sn": f.subject_norm, "vn": f.value_norm,
                 "q": f.quote, "cs": f.char_start, "ce": f.char_end, "m": model}).rowcount
        s.execute(text("update document_chunks set facts_status = :st where id = any(cast(:ids as uuid[]))"),
                  {"st": status, "ids": [str(c.id) for c in batch]})
    return stored


def run_extract_facts(ctx: JobContext) -> None:
    with ctx.session() as s:
        scope = section_scope(s, ctx.document_id, [UUID(x) for x in ctx.payload.get("section_ids") or []])
    chunks = _pending_chunks(ctx, scope)
    pages = _pages(ctx)
    counters: Counter[str] = Counter(ctx.checkpoint.get("counters", {}))
    done = int(ctx.checkpoint.get("chunks_done", 0))
    total = done + len(chunks)
    ctx.update(stage="extracting_facts", current=done, total=total,
               message=f"Extrayendo hechos verificables ({done}/{total} fragmentos)")

    queue = _batches(chunks)
    while queue:
        batch = queue.pop(0)
        by_ref = {f"F{i}": ch for i, ch in enumerate(batch, start=1)}
        try:
            result = call_llm(task="extraction", system=SYSTEM, prompt=build_prompt(batch), schema=SCHEMA,
                              user_id=ctx.user_id, job_id=ctx.job_id, engine=ctx.engine)
        except QuotaExhausted:
            raise   # el runner pausa el job hasta que se renueve la cuota
        except LLMError:
            if len(batch) > 1:   # aislar el fragmento problemático
                queue = [[ch] for ch in batch] + queue
                continue
            _store(ctx, batch, [], None, status="skipped")
            counters["fragmentos_omitidos_error_ia"] += 1
            done += 1
            ctx.update(current=done, checkpoint={"counters": dict(counters), "chunks_done": done})
            continue

        verified: list[VerifiedFact] = []
        per_fragment: Counter[str] = Counter()
        for raw in result.data.get("facts", []):
            chunk = by_ref.get(str(raw.get("fragment", "")).strip())
            if chunk is None:
                counters["rechazo_fragmento_desconocido"] += 1
                continue
            per_fragment[chunk.id] += 1
            if per_fragment[chunk.id] > MAX_FACTS_PER_FRAGMENT:
                counters["rechazo_exceso_por_fragmento"] += 1
                continue
            outcome = verify_fact(raw, chunk, pages)
            if isinstance(outcome, str):
                counters[f"rechazo_{outcome}"] += 1
            else:
                verified.append(outcome)
        counters["propuestos"] += sum(per_fragment.values())
        counters["aceptados"] += _store(ctx, batch, verified, result.model_version)
        done += len(batch)
        ctx.update(current=done, message=f"Extrayendo hechos verificables ({done}/{total} fragmentos)",
                   checkpoint={"counters": dict(counters), "chunks_done": done})

    with ctx.session() as s:
        n_facts = s.execute(text("select count(*) from facts where document_id = :d"), {"d": ctx.document_id}).scalar_one()
        s.execute(text("update documents set stats = stats || cast(:st as jsonb) where id = :id"),
                  {"st": json.dumps({"facts": n_facts, "facts_extraction": dict(counters)}), "id": ctx.document_id})
