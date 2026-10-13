"""Planificador de hechos reutilizables entre generaciones.

Un hecho aceptado no se vuelve a usar porque ya existe una pregunta sobre él. Los descartes
que pueden mejorar con otra redacción/verificación se pueden reintentar en trabajos futuros,
con un límite prudente de tres intentos. Los descartes permanentes no se vuelven a probar.
"""
from collections import Counter, defaultdict
from typing import Any
from uuid import UUID

from sqlalchemy import text

from app.facts.distractors import _top_sections
from app.jobs.runner import JobContext

MAX_RETRYABLE_ATTEMPTS = 3


def plan_with_retries(ctx: JobContext, scope: list[UUID] | None, target: int | None):
    """Hechos disponibles agrupados por tema principal y cuota por tema."""
    with ctx.session() as s:
        tops = _top_sections(s, ctx.document_id)
        facts = s.execute(text("""
            select f.* from facts f
            where f.document_id = :d
              and (cast(:scope as uuid[]) is null or f.section_id = any(cast(:scope as uuid[])))
              and not exists (
                select 1 from questions q
                where q.fact_id = f.id and q.status <> 'discarded'
              )
              and not exists (
                select 1 from question_candidates c
                where c.fact_id = f.id
                  and c.status in ('rejected_duplicate', 'rejected_no_distractors')
              )
              and (
                select count(*) from question_candidates c
                where c.fact_id = f.id
                  and c.status in ('rejected_generation', 'rejected_deterministic', 'rejected_verification')
              ) < :max_attempts
            order by f.page_number, f.char_start"""),
            {
                "d": ctx.document_id,
                "scope": [str(x) for x in scope] if scope is not None else None,
                "max_attempts": MAX_RETRYABLE_ATTEMPTS,
            }).mappings().all()
        weights = dict(s.execute(text("""
            select section_id, sum(char_count) from document_chunks
            where document_id = :d and is_eligible group by section_id"""), {"d": ctx.document_id}).all())
        already = Counter(dict(s.execute(text("""
            select c.section_id, count(*) from question_candidates c
            where c.job_id = :j and c.status = 'accepted' group by c.section_id"""), {"j": ctx.job_id}).all()))

    by_top: dict[UUID | None, list[dict[str, Any]]] = defaultdict(list)
    for f in facts:
        by_top[tops.get(f["section_id"])].append(dict(f))
    for top, items in by_top.items():
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
