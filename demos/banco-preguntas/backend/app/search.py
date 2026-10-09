"""Búsqueda dentro de un documento: texto completo en español (+ trigramas como respaldo).

Sin coste ni servicios externos. Se usará para recuperar evidencias y candidatos a
distractor (bloques 4-5). La sesión debe tener RLS activa del usuario.
"""
from dataclasses import dataclass
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session


@dataclass
class SearchHit:
    chunk_id: UUID
    section_id: UUID | None
    context_header: str
    page_start: int
    page_end: int
    score: float
    snippet: str


def search_chunks(session: Session, document_id: UUID, query: str, *, limit: int = 10,
                  section_ids: list[UUID] | None = None, eligible_only: bool = False,
                  exclude_chunk_ids: list[UUID] | None = None) -> list[SearchHit]:
    params = {"d": document_id, "q": query, "lim": limit, "secs": section_ids, "excl": exclude_chunk_ids or [],
              "elig": eligible_only}
    filters = """
        c.document_id = :d
        and (cast(:secs as uuid[]) is null or c.section_id = any(cast(:secs as uuid[])))
        and not (c.id = any(cast(:excl as uuid[])))
        and (not :elig or c.is_eligible)"""
    rows = session.execute(text(f"""
        with q as (select websearch_to_tsquery('public.es_unaccent', :q) as tsq)
        select c.id as chunk_id, c.section_id, c.context_header, c.page_start, c.page_end,
               ts_rank_cd(c.tsv, q.tsq, 32) as score,
               ts_headline('public.es_unaccent', c.text, q.tsq,
                           'MaxWords=35, MinWords=12, StartSel=«, StopSel=», MaxFragments=2') as snippet
        from document_chunks c, q
        where {filters} and c.tsv @@ q.tsq
        order by score desc, c.ordinal limit :lim"""), params).mappings().all()
    if not rows:
        rows = session.execute(text(f"""
            select c.id as chunk_id, c.section_id, c.context_header, c.page_start, c.page_end,
                   word_similarity(:q, c.text) as score, left(c.text, 240) as snippet
            from document_chunks c
            where {filters} and :q <% c.text
            order by score desc, c.ordinal limit :lim"""), params).mappings().all()
    return [SearchHit(**{**r, "score": float(r["score"])}) for r in rows]
