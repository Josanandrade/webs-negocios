"""Consulta de preguntas con sus fuentes (el banco completo llega en el bloque 6)."""
from datetime import datetime
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.deps import current_user_id, db_session

router = APIRouter(prefix="/api/questions", tags=["questions"])


class OptionOut(BaseModel):
    label: str
    text: str
    is_correct: bool


class SourceOut(BaseModel):
    role: str
    option_label: str | None
    page_number: int
    quote: str
    char_start: int | None
    char_end: int | None


class QuestionOut(BaseModel):
    id: UUID
    seq: int
    document_id: UUID
    section_id: UUID | None
    section_title: str | None
    stem: str
    question_type: str
    difficulty: str
    status: str
    explanation: str | None
    confidence: float | None
    tags: list[str]
    created_at: datetime
    options: list[OptionOut]
    sources: list[SourceOut] | None = None
    generation: dict[str, Any] | None = None


def _load(db: Session, user_id: UUID, ids: list[UUID], with_sources: bool) -> list[QuestionOut]:
    if not ids:
        return []
    rows = db.execute(text("""
        select q.id, q.seq, q.document_id, q.section_id, s.title as section_title, q.stem, q.question_type,
               q.difficulty, q.status, q.explanation, q.confidence, q.tags, q.created_at, q.generation
        from questions q left join document_sections s on s.id = q.section_id
        where q.user_id = :u and q.id = any(cast(:ids as uuid[]))"""),
        {"u": user_id, "ids": [str(i) for i in ids]}).mappings().all()
    options: dict[UUID, list[OptionOut]] = {}
    for o in db.execute(text("select question_id, label, text, is_correct from question_options"
                             " where question_id = any(cast(:ids as uuid[])) order by label"),
                        {"ids": [str(i) for i in ids]}).mappings():
        options.setdefault(o["question_id"], []).append(OptionOut(**{k: o[k] for k in ("label", "text", "is_correct")}))
    sources: dict[UUID, list[SourceOut]] = {}
    if with_sources:
        for r in db.execute(text("""
                select s.question_id, s.role, o.label as option_label, s.page_number, s.quote, s.char_start, s.char_end
                from question_sources s left join question_options o on o.id = s.option_id
                where s.question_id = any(cast(:ids as uuid[])) order by s.role, o.label"""),
                {"ids": [str(i) for i in ids]}).mappings():
            sources.setdefault(r["question_id"], []).append(SourceOut(**{k: v for k, v in r.items() if k != "question_id"}))
    by_id = {r["id"]: QuestionOut(**{**r, "generation": r["generation"] if with_sources else None},
                                  options=options.get(r["id"], []),
                                  sources=sources.get(r["id"]) if with_sources else None) for r in rows}
    return [by_id[i] for i in ids if i in by_id]


@router.get("", response_model=list[QuestionOut])
def list_questions(document_id: UUID | None = None, section_id: UUID | None = None, status_: str | None = Query(None, alias="status"),
                   limit: int = Query(50, ge=1, le=500), offset: int = Query(0, ge=0),
                   user_id: UUID = Depends(current_user_id), db: Session = Depends(db_session)) -> list[QuestionOut]:
    ids = db.execute(text("""
        select id from questions where user_id = :u
          and (cast(:d as uuid) is null or document_id = :d)
          and (cast(:s as uuid) is null or section_id = :s)
          and (cast(:st as text) is null or status = :st)
        order by seq limit :lim offset :off"""),
        {"u": user_id, "d": document_id, "s": section_id, "st": status_, "lim": limit, "off": offset}).scalars().all()
    return _load(db, user_id, list(ids), with_sources=False)


@router.get("/{question_id}", response_model=QuestionOut)
def get_question(question_id: UUID, user_id: UUID = Depends(current_user_id), db: Session = Depends(db_session)) -> QuestionOut:
    found = _load(db, user_id, [question_id], with_sources=True)
    if not found:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pregunta no encontrada")
    return found[0]
