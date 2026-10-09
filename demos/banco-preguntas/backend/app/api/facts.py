import json
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.documents import JobOut, _require_document, get_job
from app.deps import current_user_id, db_session
from app.facts.distractors import distractor_candidates

router = APIRouter(prefix="/api/documents", tags=["facts"])


class ExtractIn(BaseModel):
    section_ids: list[UUID] | None = None   # None = documento completo


class FactOut(BaseModel):
    id: UUID
    section_id: UUID | None
    kind: str
    subject: str
    attribute: str
    value: str
    quote: str
    page_number: int


class CandidateOut(BaseModel):
    fact_id: UUID
    value: str
    subject: str
    quote: str
    page_number: int
    tier: str
    score: float


@router.post("/{document_id}/facts/extract", response_model=JobOut, status_code=status.HTTP_202_ACCEPTED)
def start_extraction(document_id: UUID, body: ExtractIn, user_id: UUID = Depends(current_user_id),
                     db: Session = Depends(db_session)) -> JobOut:
    doc = db.execute(text("select status from documents where id = :d and user_id = :u"),
                     {"d": document_id, "u": user_id}).first()
    if doc is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Documento no encontrado")
    if doc.status != "ready":
        raise HTTPException(status.HTTP_409_CONFLICT, "El documento aún no está procesado")
    active = db.execute(text("select id from processing_jobs where document_id = :d and kind = 'extract_facts'"
                             " and status in ('pending', 'running')"), {"d": document_id}).first()
    if active:
        raise HTTPException(status.HTTP_409_CONFLICT, {"message": "Ya hay una extracción en curso", "job_id": str(active.id)})
    if body.section_ids:
        found = db.execute(text("select count(*) from document_sections where document_id = :d"
                                " and id = any(cast(:ids as uuid[]))"),
                           {"d": document_id, "ids": [str(i) for i in body.section_ids]}).scalar_one()
        if found != len(set(body.section_ids)):
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Alguna sección no pertenece al documento")
    job_id = db.execute(
        text("insert into processing_jobs (user_id, document_id, kind, payload, message)"
             " values (:u, :d, 'extract_facts', cast(:p as jsonb), 'En cola') returning id"),
        {"u": user_id, "d": document_id,
         "p": json.dumps({"section_ids": [str(i) for i in body.section_ids] if body.section_ids else None})},
    ).scalar_one()
    return get_job(job_id, user_id, db)


@router.get("/{document_id}/facts", response_model=list[FactOut])
def list_facts(document_id: UUID, section_id: UUID | None = None, kind: str | None = None,
               limit: int = Query(100, ge=1, le=1000), offset: int = Query(0, ge=0),
               user_id: UUID = Depends(current_user_id), db: Session = Depends(db_session)) -> list[FactOut]:
    _require_document(db, user_id, document_id)
    rows = db.execute(text("""
        select id, section_id, kind, subject, attribute, value, quote, page_number from facts
        where document_id = :d and user_id = :u
          and (cast(:sec as uuid) is null or section_id = :sec) and (cast(:k as text) is null or kind = :k)
        order by page_number, char_start limit :lim offset :off"""),
        {"d": document_id, "u": user_id, "sec": section_id, "k": kind, "lim": limit, "off": offset}).mappings().all()
    return [FactOut(**r) for r in rows]


@router.get("/{document_id}/facts/{fact_id}/distractors", response_model=list[CandidateOut])
def get_distractors(document_id: UUID, fact_id: UUID, difficulty: str = Query("medium", pattern="^(easy|medium|hard)$"),
                    user_id: UUID = Depends(current_user_id), db: Session = Depends(db_session)) -> list[CandidateOut]:
    """Candidatos a distractor de un hecho, cada uno con su cita y página (auditoría)."""
    if db.execute(text("select 1 from facts where id = :f and document_id = :d and user_id = :u"),
                  {"f": fact_id, "d": document_id, "u": user_id}).first() is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Hecho no encontrado")
    return [CandidateOut(**{k: getattr(c, k) for k in CandidateOut.model_fields})
            for c in distractor_candidates(db, fact_id, difficulty=difficulty)]
