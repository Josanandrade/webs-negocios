from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.documents import _require_document
from app.deps import current_user_id, db_session
from app.search import search_chunks

router = APIRouter(prefix="/api/documents", tags=["structure"])


class SectionOut(BaseModel):
    id: UUID
    parent_id: UUID | None
    level: int
    ordinal: int
    title: str
    start_page: int
    end_page: int
    source: str
    chunks: int            # incluye subsecciones
    eligible_chunks: int   # incluye subsecciones
    children: list["SectionOut"] = []


class ChunkOut(BaseModel):
    id: UUID
    ordinal: int
    section_id: UUID | None
    context_header: str
    page_start: int
    page_end: int
    spans: list[dict[str, int]]
    text: str
    is_eligible: bool
    ineligible_reason: str | None
    flags: list[str]


class SearchHitOut(BaseModel):
    chunk_id: UUID
    section_id: UUID | None
    context_header: str
    page_start: int
    page_end: int
    score: float
    snippet: str


@router.get("/{document_id}/sections", response_model=list[SectionOut])
def get_sections(document_id: UUID, user_id: UUID = Depends(current_user_id),
                 db: Session = Depends(db_session)) -> list[SectionOut]:
    _require_document(db, user_id, document_id)
    rows = db.execute(text("""
        select s.id, s.parent_id, s.level, s.ordinal, s.title, s.start_page, s.end_page, s.source,
               count(c.id) as own_chunks, count(c.id) filter (where c.is_eligible) as own_eligible
        from document_sections s
        left join document_chunks c on c.section_id = s.id
        where s.document_id = :d and s.user_id = :u
        group by s.id order by s.ordinal"""), {"d": document_id, "u": user_id}).mappings().all()
    nodes: dict[UUID, dict[str, Any]] = {
        r["id"]: {**{k: v for k, v in r.items() if not k.startswith("own_")},
                  "chunks": r["own_chunks"], "eligible_chunks": r["own_eligible"], "children": []}
        for r in rows}
    roots = []
    for r in rows:  # ordenadas por ordinal: los padres van antes que los hijos
        node = nodes[r["id"]]
        (nodes[r["parent_id"]]["children"] if r["parent_id"] else roots).append(node)

    def total(node: dict[str, Any]) -> None:
        for child in node["children"]:
            total(child)
            node["chunks"] += child["chunks"]
            node["eligible_chunks"] += child["eligible_chunks"]

    for root in roots:
        total(root)
    return [SectionOut.model_validate(r) for r in roots]


@router.get("/{document_id}/chunks", response_model=list[ChunkOut])
def list_chunks(document_id: UUID, section_id: UUID | None = None, eligible_only: bool = False,
                limit: int = Query(50, ge=1, le=500), offset: int = Query(0, ge=0),
                user_id: UUID = Depends(current_user_id), db: Session = Depends(db_session)) -> list[ChunkOut]:
    _require_document(db, user_id, document_id)
    rows = db.execute(text("""
        select id, ordinal, section_id, context_header, page_start, page_end, spans, text,
               is_eligible, ineligible_reason, flags
        from document_chunks
        where document_id = :d and user_id = :u
          and (cast(:sec as uuid) is null or section_id = :sec)
          and (not :elig or is_eligible)
        order by ordinal limit :lim offset :off"""),
        {"d": document_id, "u": user_id, "sec": section_id, "elig": eligible_only, "lim": limit, "off": offset},
    ).mappings().all()
    return [ChunkOut(**r) for r in rows]


@router.get("/{document_id}/search", response_model=list[SearchHitOut])
def search(document_id: UUID, q: str = Query(min_length=2, max_length=300),
           limit: int = Query(10, ge=1, le=50),
           user_id: UUID = Depends(current_user_id), db: Session = Depends(db_session)) -> list[SearchHitOut]:
    _require_document(db, user_id, document_id)
    return [SearchHitOut(**h.__dict__) for h in search_chunks(db, document_id, q, limit=limit)]


