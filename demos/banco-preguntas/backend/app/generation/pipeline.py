"""Job 'generate': genera preguntas verificadas con cobertura equilibrada por tema.

Por cada hecho elegido:
  1. ¿duplicado (mismo hecho / mismo dato)?           -> descartar         (sin IA)
  2. catálogo de distractores; < 3                    -> descartar         (sin IA)
  3. la IA redacta el enunciado y elige 3 distractores (las opciones son valores literales)
  4. validación determinista + duplicados por enunciado                 (sin IA)
  5. posición de la correcta equilibrada A/B/C/D                        (sin IA)
  6. verificación independiente por otro modelo, a ciegas
  7. guardado transaccional (la BD vuelve a exigir 4 opciones, 1 correcta, evidencias)
Cada intento queda en question_candidates con su motivo. Reanudable: un hecho ya
intentado en este job no se repite.
"""
import hashlib
import html
import json
import re
from collections import Counter, defaultdict
from concurrent.futures import Future, ThreadPoolExecutor, wait
from dataclasses import dataclass
from typing import Any
from uuid import UUID

from sqlalchemy import text

from app.facts.distractors import Candidate, _top_sections, distractor_candidates
from app.facts.pipeline import extract_facts_for_scope, section_scope
from app.generation.dedupe import duplicate_reason, fingerprint
from app.generation.positions import LABELS, arrange, choose_correct_label
from app.generation.prompts import (GEN_SCHEMA, GEN_SYSTEM, VER_SCHEMA, VER_SYSTEM, GenItem, VerItem,
                                    build_gen_prompt, build_ver_prompt, verification_passes)
from app.generation.validation import (DocumentContext, OptionDraft, QuestionDraft, prescreen_candidates,
                                       validate_draft)
from app.jobs.runner import JobContext
from app.llm.client import call_llm
from app.search import search_chunks

GEN_BATCH = 8          # hechos por llamada al redactor (lotes fijos: no se encogen al final)
VER_BATCH = 8          # preguntas por llamada al verificador (el recurso más escaso del plan gratuito)
_CONTROL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
MIN_CONFIDENCE = 0.8
DIFFICULTY_CYCLE = ("easy", "medium", "hard")
QUESTION_TYPE = {"definition": "definition", "characteristic": "characteristic", "classification": "classification",
                 "relation": "relation", "procedure_step": "procedure", "exception": "exception",
                 "quantity": "datum", "date": "datum", "name": "datum", "requirement": "datum", "deadline": "datum"}


@dataclass
class Work:
    fact: dict[str, Any]
    top: UUID | None
    difficulty: str
    candidates: list[Candidate] | None = None
    draft: QuestionDraft | None = None
    gen_raw: dict[str, Any] | None = None
    gen_spec: str | None = None
    gen_version: str | None = None


# --------------------------------------------------------------------------- plan
def _plan(ctx: JobContext, scope: list[UUID] | None, target: int | None):
    """Hechos disponibles agrupados por tema principal y cuota por tema."""
    with ctx.session() as s:
        tops = _top_sections(s, ctx.document_id)
        facts = s.execute(text("""
            select f.* from facts f
            where f.document_id = :d
              and (cast(:scope as uuid[]) is null or f.section_id = any(cast(:scope as uuid[])))
              and not exists (select 1 from question_candidates c where c.fact_id = f.id)
              and not exists (select 1 from questions q where q.fact_id = f.id and q.status <> 'discarded')
            order by f.page_number, f.char_start"""),
            {"d": ctx.document_id, "scope": [str(x) for x in scope] if scope is not None else None}).mappings().all()
        weights = dict(s.execute(text("""
            select section_id, sum(char_count) from document_chunks
            where document_id = :d and is_eligible group by section_id"""), {"d": ctx.document_id}).all())
        already = Counter(dict(s.execute(text("""
            select c.section_id, count(*) from question_candidates c
            where c.job_id = :j and c.status = 'accepted' group by c.section_id"""), {"j": ctx.job_id}).all()))

    by_top: dict[UUID | None, list[dict[str, Any]]] = defaultdict(list)
    for f in facts:
        by_top[tops.get(f["section_id"])].append(dict(f))
    for top, items in by_top.items():   # alternar tipos de dato y repartir por páginas
        by_kind: dict[str, list] = defaultdict(list)
        for f in items:
            by_kind[f["kind"]].append(f)
        interleaved = []
        while any(by_kind.values()):
            for kind in sorted(by_kind):
                if by_kind[kind]:
                    interleaved.append(by_kind[kind].pop(0))
        by_top[top] = interleaved

    top_weight: Counter = Counter()
    for sid, w in weights.items():
        top_weight[tops.get(sid)] += int(w or 0)
    accepted_by_top: Counter = Counter()
    for sid, n in already.items():
        accepted_by_top[tops.get(sid)] += n

    quotas: dict[UUID | None, int | None] = {}
    if target is None:
        quotas = {top: None for top in by_top}
    else:
        total_w = sum(top_weight[t] for t in by_top) or 1
        for top in by_top:
            quotas[top] = max(1, round(target * top_weight[top] / total_w))
    return by_top, quotas, accepted_by_top


# --------------------------------------------------------------------- utilidades
def _context_window(page_text: str, start: int, end: int, radius: int = 700) -> str:
    return page_text[max(0, start - radius): min(len(page_text), end + radius)]


def _clean_json(value: Any) -> Any:
    """Quita caracteres de control (Postgres no admite \\u0000 en jsonb) de lo que guardamos."""
    if isinstance(value, str):
        return _CONTROL.sub("", value)
    if isinstance(value, dict):
        return {k: _clean_json(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_clean_json(v) for v in value]
    return value


def _record(ctx: JobContext, w: Work, status: str, reasons: list[str], verifier: dict | None = None,
            question_id: UUID | None = None) -> None:
    draft_json = {}
    if w.draft:
        draft_json = {"stem": w.draft.stem, "options": [{"label": o.label, "text": o.text, "correct": o.is_correct,
                                                          "page": o.page_number} for o in w.draft.options]}
    if w.gen_raw:
        draft_json["generator"] = w.gen_raw
    with ctx.session() as s:
        s.execute(text("""
            insert into question_candidates (user_id, document_id, job_id, fact_id, section_id, status, reasons,
                                             draft, verifier, question_id)
            values (:u, :d, :j, :f, :sec, :st, :r, cast(:dr as jsonb), cast(:v as jsonb), :q)
            on conflict (job_id, fact_id) do nothing"""),
            {"u": ctx.user_id, "d": ctx.document_id, "j": ctx.job_id, "f": w.fact["id"], "sec": w.fact["section_id"],
             "st": status, "r": reasons, "dr": json.dumps(_clean_json(draft_json), ensure_ascii=False),
             "v": json.dumps(_clean_json(verifier or {}), ensure_ascii=False), "q": question_id})


def _fact_option(f: dict[str, Any], is_correct: bool) -> OptionDraft:
    return OptionDraft(text=f["value"], is_correct=is_correct, fact_id=f["id"], quote=f["quote"],
                       page_id=f["page_id"], page_number=f["page_number"], chunk_id=f["chunk_id"],
                       char_start=f["char_start"], char_end=f["char_end"])


# ------------------------------------------------------------------- un lote
def _draft_batch(ctx: JobContext, batch: list[Work], doc: DocumentContext, counters: Counter) -> list[Work]:
    """Pasos 1-4 (sin verificador): catálogo de distractores, redacción y validación
    determinista. Devuelve los borradores válidos, pendientes de verificar; los descartes
    quedan registrados."""
    # 1-2. duplicados por dato y catálogo de distractores (sin IA)
    ready: list[Work] = []
    with ctx.session() as s:
        for w in batch:
            dup = duplicate_reason(s, ctx.document_id, w.fact["id"])
            if dup:
                _record(ctx, w, "rejected_duplicate", [dup])
                counters[f"duplicada:{dup}"] += 1
                continue
            pool = distractor_candidates(s, w.fact["id"], difficulty=w.difficulty, limit=12)
            w.candidates = prescreen_candidates(w.fact["subject"], w.fact["value"], pool)[:6]
            if len(w.candidates) < 3:
                _record(ctx, w, "rejected_no_distractors", [f"solo_{len(w.candidates)}_distractores"])
                counters["sin_3_distractores_del_documento"] += 1
                continue
            ready.append(w)
        if not ready:
            return []
        headers = dict(s.execute(text("select id, context_header from document_chunks where document_id = :d"),
                                 {"d": ctx.document_id}).all())

    # 3. redacción del enunciado (IA generadora)
    items = []
    for i, w in enumerate(ready, start=1):
        f = w.fact
        items.append(GenItem(
            ref=f"P{i}", subject=f["subject"], attribute=f["attribute"], correct=f["value"], quote=f["quote"],
            context_header=headers.get(f["chunk_id"], ""),
            context=_context_window(doc.pages[f["page_number"]], f["char_start"], f["char_end"]),
            candidates=[(f"D{k}", c.value, c.subject) for k, c in enumerate(w.candidates, start=1)], kind=f["kind"]))
    gen = call_llm(task="generation", system=GEN_SYSTEM, prompt=build_gen_prompt(items), schema=GEN_SCHEMA,
                   user_id=ctx.user_id, job_id=ctx.job_id, engine=ctx.engine)
    gen_by_ref = {str(it.get("item", "")).strip(): it for it in gen.data.get("items", [])}

    # 4. construcción + validación determinista + duplicados por enunciado
    survivors: list[Work] = []
    with ctx.session() as s:
        for i, w in enumerate(ready, start=1):
            out = gen_by_ref.get(f"P{i}")
            w.gen_raw = out
            if out is None:
                _record(ctx, w, "rejected_generation", ["sin_respuesta_del_generador"])
                counters["generador:sin_respuesta"] += 1
                continue
            if out.get("skip"):
                _record(ctx, w, "rejected_generation", ["omitida_por_generador: " + str(out.get("skip_reason", ""))[:200]])
                counters["generador:omitida"] += 1
                continue
            if _CONTROL.search(str(out.get("stem", ""))):
                _record(ctx, w, "rejected_generation", ["salida_corrupta_del_generador"])
                counters["generador:salida_corrupta"] += 1
                continue
            ids = [str(x).strip() for x in out.get("distractor_ids", [])]
            by_id = {f"D{k}": c for k, c in enumerate(w.candidates, start=1)}
            if len(ids) != 3 or len(set(ids)) != 3 or any(x not in by_id for x in ids):
                _record(ctx, w, "rejected_generation", ["distractores_elegidos_invalidos"])
                counters["generador:distractores_invalidos"] += 1
                continue
            chosen = [by_id[x] for x in ids]
            rows = {r["id"]: dict(r) for r in s.execute(text("select * from facts where id = any(cast(:ids as uuid[]))"),
                                                        {"ids": [str(c.fact_id) for c in chosen]}).mappings()}
            f = w.fact
            w.draft = QuestionDraft(
                fact_id=f["id"], document_id=ctx.document_id, section_id=f["section_id"], subject=f["subject"],
                kind=f["kind"], question_type=QUESTION_TYPE[f["kind"]], difficulty=w.difficulty,
                stem=html.unescape(str(out.get("stem", ""))).strip(),   # a veces llega «acci&oacute;n»
                options=[_fact_option(f, True)] + [_fact_option(rows[c.fact_id], False) for c in chosen],
                explanation=f"La respuesta está en la página {f['page_number']}: «{f['quote']}»")
            reasons = validate_draft(w.draft, doc)
            if reasons:
                _record(ctx, w, "rejected_deterministic", reasons)
                for r in reasons:
                    counters[f"validacion:{r.split(':')[0]}"] += 1
                continue
            dup = duplicate_reason(s, ctx.document_id, f["id"], stem=w.draft.stem, correct=f["value"])
            if dup:
                _record(ctx, w, "rejected_duplicate", [dup])
                counters[f"duplicada:{dup}"] += 1
                continue
            w.gen_spec, w.gen_version = gen.model_spec, gen.model_version
            survivors.append(w)
    return survivors


def _verify_batch(ctx: JobContext, survivors: list[Work], counters: Counter) -> list[UUID]:
    """Pasos 5-7: posición equilibrada, verificación a ciegas y guardado. Devuelve los
    hechos cuyas preguntas se aceptaron."""
    with ctx.session() as s:
        # 5. posición de la correcta: equilibrio por documento
        label_counts = Counter(dict(s.execute(text("""
            select o.label, count(*) from question_options o join questions q on q.id = o.question_id
            where q.document_id = :d and q.status <> 'discarded' and o.is_correct group by o.label"""),
            {"d": ctx.document_id}).all()))
    for w in survivors:
        label = choose_correct_label(label_counts, w.fact["id"])
        label_counts[label] += 1
        w.draft.options = arrange(w.draft.options, label, w.fact["id"])

    # 6. verificación independiente (a ciegas)
    ver_items = []
    with ctx.session() as s:
        for i, w in enumerate(survivors, start=1):
            d = w.draft
            evidences = {(o.page_number, o.quote) for o in d.options}
            for hit in search_chunks(s, ctx.document_id, d.subject, limit=3):
                chunk_text = s.execute(text("select text from document_chunks where id = :id"),
                                       {"id": hit.chunk_id}).scalar_one()
                evidences.add((hit.page_start, chunk_text[:900]))
            ordered = sorted(evidences, key=lambda e: hashlib.sha256(f"{d.fact_id}{e}".encode()).hexdigest())
            ver_items.append(VerItem(ref=f"Q{i}", stem=d.stem, options=[(o.label, o.text) for o in d.options],
                                     answer_page=d.correct.page_number, evidences=ordered))
    ver = call_llm(task="verification", system=VER_SYSTEM, prompt=build_ver_prompt(ver_items), schema=VER_SCHEMA,
                   user_id=ctx.user_id, job_id=ctx.job_id, engine=ctx.engine)
    ver_by_ref = {str(it.get("item", "")).strip(): it for it in ver.data.get("items", [])}

    # 7. guardado
    accepted: list[UUID] = []
    for i, w in enumerate(survivors, start=1):
        report = ver_by_ref.get(f"Q{i}")
        if report is None:
            _record(ctx, w, "rejected_verification", ["sin_respuesta_del_verificador"])
            counters["verificador:sin_respuesta"] += 1
            continue
        reasons = verification_passes(report, w.draft.correct.label, MIN_CONFIDENCE)
        if reasons:
            _record(ctx, w, "rejected_verification", reasons, verifier=report)
            for r in reasons:
                counters[f"verificador:{r}"] += 1
            continue
        meta = {"job_id": str(ctx.job_id), "generator": w.gen_spec,
                "generator_version": w.gen_version, "verifier": ver.model_spec,
                "verifier_version": ver.model_version, "verifier_report": report,
                "distractor_tiers": {str(c.fact_id): c.tier for c in w.candidates}}
        question_id = _store_question(ctx, w, report, meta)
        if question_id is None:
            _record(ctx, w, "rejected_duplicate", ["duplicada_al_guardar"])
            counters["duplicada:al_guardar"] += 1
            continue
        _record(ctx, w, "accepted", [], verifier=report, question_id=question_id)
        counters["aceptadas"] += 1
        accepted.append(w.fact["id"])
    return accepted


def _store_question(ctx: JobContext, w: Work, report: dict[str, Any], meta: dict[str, Any]) -> UUID | None:
    d = w.draft
    with ctx.session() as s:
        s.execute(text("select pg_advisory_xact_lock(hashtext('questions:' || cast(:d as text)))"), {"d": ctx.document_id})
        if duplicate_reason(s, ctx.document_id, d.fact_id, stem=d.stem, correct=d.correct.text):
            return None
        qid = s.execute(text("""
            insert into questions (user_id, document_id, section_id, stem, question_type, difficulty, status,
                                   explanation, confidence, fingerprint, generation, fact_id)
            values (:u, :d, :sec, :stem, :qt, :diff, 'auto_validated', :exp, :conf, :fp, cast(:gen as jsonb), :f)
            returning id"""),
            {"u": ctx.user_id, "d": ctx.document_id, "sec": d.section_id, "stem": d.stem, "qt": d.question_type,
             "diff": d.difficulty, "exp": d.explanation, "conf": min(max(float(report.get("confidence", 0)), 0), 1),
             "fp": fingerprint(d.stem, d.correct.text), "gen": json.dumps(meta, ensure_ascii=False, default=str),
             "f": d.fact_id}).scalar_one()
        for o in d.options:
            option_id = s.execute(text("""
                insert into question_options (question_id, user_id, label, text, is_correct)
                values (:q, :u, :l, :t, :c) returning id"""),
                {"q": qid, "u": ctx.user_id, "l": o.label, "t": o.text[:1].upper() + o.text[1:],
                 "c": o.is_correct}).scalar_one()
            s.execute(text("""
                insert into question_sources (question_id, user_id, document_id, option_id, role, page_id, page_number,
                                              chunk_id, quote, char_start, char_end, fact_id)
                values (:q, :u, :d, :o, :role, :p, :pn, :c, :quote, :cs, :ce, :f)"""),
                {"q": qid, "u": ctx.user_id, "d": ctx.document_id, "o": option_id,
                 "role": "answer" if o.is_correct else "distractor", "p": o.page_id, "pn": o.page_number,
                 "c": o.chunk_id, "quote": o.quote, "cs": o.char_start, "ce": o.char_end, "f": o.fact_id})
    return qid


# ---------------------------------------------------------------------- job
def run_generate(ctx: JobContext) -> None:
    payload = ctx.payload
    target: int | None = payload.get("count")
    difficulty: str = payload.get("difficulty", "mixed")
    with ctx.session() as s:
        scope = section_scope(s, ctx.document_id, [UUID(x) for x in payload.get("section_ids") or []])

    extract_facts_for_scope(ctx, scope)

    by_top, quotas, accepted_by_top = _plan(ctx, scope, target)
    with ctx.session() as s:
        pages = dict(s.execute(text("select page_number, text from document_pages where document_id = :d"),
                               {"d": ctx.document_id}).all())
    doc = DocumentContext.from_pages(pages)
    counters: Counter[str] = Counter(ctx.checkpoint.get("generation", {}))
    accepted_total = sum(accepted_by_top.values())
    attempted = int(ctx.checkpoint.get("attempted", 0))
    total = target if target is not None else attempted + sum(len(v) for v in by_top.values())
    ctx.update(stage="generating", current=accepted_total if target else attempted, total=total,
               message=f"Generando preguntas ({accepted_total} aceptadas)")

    cursor = {top: 0 for top in by_top}
    index = attempted

    def next_batch() -> list[Work]:
        """Siguiente lote en round-robin entre temas que aún tienen cuota y hechos."""
        nonlocal index
        while True:
            batch: list[Work] = []
            progressed = True
            while len(batch) < GEN_BATCH and progressed:
                progressed = False
                for top in sorted(by_top, key=lambda t: (accepted_by_top[t], str(t))):
                    quota = quotas.get(top)
                    in_batch = sum(1 for w in batch if w.top == top)
                    if quota is not None and accepted_by_top[top] + in_batch >= quota:
                        continue
                    if cursor[top] >= len(by_top[top]) or len(batch) >= GEN_BATCH:
                        continue
                    fact = by_top[top][cursor[top]]
                    cursor[top] += 1
                    diff = DIFFICULTY_CYCLE[index % 3] if difficulty == "mixed" else difficulty
                    index += 1
                    batch.append(Work(fact, top, diff))
                    progressed = True
            if batch or target is None or not any(cursor[t] < len(by_top[t]) for t in by_top):
                return batch
            # Temas agotados con cuota pendiente: el resto se reparte entre los que tienen hechos.
            for t in by_top:
                if cursor[t] < len(by_top[t]):
                    quotas[t] = (quotas.get(t) or 0) + (target - accepted_total)

    # Dos etapas en paralelo: el redactor prepara el lote siguiente mientras el verificador
    # (otro modelo, con su propio límite) revisa el anterior. Los borradores válidos se
    # acumulan y se verifican de VER_BATCH en VER_BATCH. Si el trabajo se corta, los borradores
    # aún sin verificar no quedan registrados y sus hechos se vuelven a intentar.
    queue: list[Work] = []
    inflight: Future | None = None
    inflight_n = 0
    exhausted = False

    def collect(future: Future) -> None:
        nonlocal accepted_total
        for fid in future.result():
            accepted_by_top[next(w.top for w in sent if w.fact["id"] == fid)] += 1
            accepted_total += 1

    def report() -> None:
        ctx.update(current=accepted_total if target else attempted,
                   message=f"Generando preguntas ({accepted_total} aceptadas, {attempted - accepted_total - len(queue) - inflight_n} descartadas)",
                   checkpoint={"generation": dict(counters), "attempted": attempted})

    sent: list[Work] = []
    with ThreadPoolExecutor(max_workers=1, thread_name_prefix="verificador") as pool:
        try:
            while True:
                if inflight is not None and inflight.done():
                    collect(inflight)
                    inflight, inflight_n = None, 0
                    report()
                if target is not None and accepted_total >= target:
                    break
                needed = None if target is None else target - accepted_total
                want_more = not exhausted and (needed is None or len(queue) + inflight_n < needed)
                if want_more:
                    batch = next_batch()
                    if batch:
                        queue += _draft_batch(ctx, batch, doc, counters)
                        attempted += len(batch)
                        report()
                    else:
                        exhausted = True
                    want_more = not exhausted and (needed is None or len(queue) + inflight_n < needed)
                if inflight is None and queue and (len(queue) >= VER_BATCH or not want_more):
                    size = min(VER_BATCH, len(queue)) if needed is None else min(VER_BATCH, len(queue), needed)
                    chunk, queue = queue[:size], queue[size:]
                    sent += chunk
                    inflight, inflight_n = pool.submit(_verify_batch, ctx, chunk, counters), len(chunk)
                elif inflight is not None and not want_more:
                    wait([inflight])                    # nada más que redactar: esperar al verificador
                elif inflight is None and not queue and not want_more:
                    break
        finally:
            if inflight is not None:
                wait([inflight])
                if not inflight.exception():
                    collect(inflight)
                inflight_n = 0
    attempted -= len(queue)                             # borradores sin verificar: se reintentarán
    ctx.update(checkpoint={"generation": dict(counters), "attempted": attempted})

    note = ""
    if target is not None and accepted_total < target:
        note = (f" No hay más contenido que supere todos los filtros: se generan {accepted_total} de {target}"
                " antes que incluir preguntas dudosas.")
    ctx.update(stage="done", current=accepted_total if target else attempted,
               message=f"{accepted_total} preguntas verificadas añadidas al banco ({attempted} intentos).{note}",
               checkpoint={"generation": dict(counters), "attempted": attempted, "accepted": accepted_total})
