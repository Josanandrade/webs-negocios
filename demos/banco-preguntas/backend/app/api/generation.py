import json
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.documents import JobOut, _require_document, get_job
from app.deps import current_user_id, db_session
from app.facts.distractors import _top_sections

router = APIRouter(prefix="/api", tags=["generation"])


class GenerateIn(BaseModel):
    section_ids: list[UUID] | None = None                 # None = documento completo
    count: int | None = Field(default=None, ge=1, le=500)  # None = máximo de preguntas de calidad
    difficulty: Literal["easy", "medium", "hard", "mixed"] = "mixed"


class SectionCoverageOut(BaseModel):
    section_id: UUID | None
    title: str
    start_page: int | None
    end_page: int | None
    questions: int
    facts: int
    facts_unused: int
    eligible_chunks: int
    questions_per_10_pages: float


class CoverageOut(BaseModel):
    total_questions: int
    sections: list[SectionCoverageOut]
    correct_label_distribution: dict[str, int]
    correct_is_longest_ratio: float | None
    low_coverage_sections: list[str]


class CandidateSummaryOut(BaseModel):
    by_status: dict[str, int]
    top_reasons: list[tuple[str, int]]


@router.post("/documents/{document_id}/generate", response_model=JobOut, status_code=status.HTTP_202_ACCEPTED)
def start_generation(document_id: UUID, body: GenerateIn, user_id: UUID = Depends(current_user_id),
                     db: Session = Depends(db_session)) -> JobOut:
    doc = db.execute(text("select status from documents where id = :d and user_id = :u"),
                     {"d": document_id, "u": user_id}).first()
    if doc is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Documento no encontrado")
    if doc.status != "ready":
        raise HTTPException(status.HTTP_409_CONFLICT, "El documento aún no está procesado")
    # Una extracción de datos en curso no impide generar: los trabajos de un documento se
    # ejecutan en orden (app.claim_job) y la generación aprovecha lo ya extraído.
    active = db.execute(text("select id from processing_jobs where document_id = :d and kind = 'generate'"
                             " and status in ('pending', 'running')"), {"d": document_id}).first()
    if active:
        raise HTTPException(status.HTTP_409_CONFLICT, {"message": "Ya hay una generación en curso", "job_id": str(active.id)})
    if body.section_ids:
        found = db.execute(text("select count(*) from document_sections where document_id = :d"
                                " and id = any(cast(:ids as uuid[]))"),
                           {"d": document_id, "ids": [str(i) for i in body.section_ids]}).scalar_one()
        if found != len(set(body.section_ids)):
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Alguna sección no pertenece al documento")
    payload = {"section_ids": [str(i) for i in body.section_ids] if body.section_ids else None,
               "count": body.count, "difficulty": body.difficulty}
    job_id = db.execute(text("insert into processing_jobs (user_id, document_id, kind, payload, message)"
                             " values (:u, :d, 'generate', cast(:p as jsonb), 'En cola') returning id"),
                        {"u": user_id, "d": document_id, "p": json.dumps(payload)}).scalar_one()
    return get_job(job_id, user_id, db)


@router.get("/documents/{document_id}/coverage", response_model=CoverageOut)
def coverage(document_id: UUID, user_id: UUID = Depends(current_user_id), db: Session = Depends(db_session)) -> CoverageOut:
    _require_document(db, user_id, document_id)
    tops = _top_sections(db, document_id)
    sections = {r.id: r for r in db.execute(text(
        "select id, title, start_page, end_page, ordinal from document_sections where document_id = :d and parent_id is null"),
        {"d": document_id})}
    agg: dict = {sid: {"questions": 0, "facts": 0, "facts_unused": 0, "eligible_chunks": 0} for sid in sections}

    def add(section_id, key, n):
        top = tops.get(section_id)
        if top in agg:
            agg[top][key] += n

    for sid, n in db.execute(text("select section_id, count(*) from questions where document_id = :d"
                                  " and status <> 'discarded' group by section_id"), {"d": document_id}):
        add(sid, "questions", n)
    for sid, n, unused in db.execute(text("""
            select f.section_id, count(*), count(*) filter (where not exists
              (select 1 from questions q where q.fact_id = f.id and q.status <> 'discarded'))
            from facts f where f.document_id = :d group by f.section_id"""), {"d": document_id}):
        add(sid, "facts", n)
        add(sid, "facts_unused", unused)
    for sid, n in db.execute(text("select section_id, count(*) from document_chunks where document_id = :d"
                                  " and is_eligible group by section_id"), {"d": document_id}):
        add(sid, "eligible_chunks", n)

    out = []
    for sid, sec in sorted(sections.items(), key=lambda kv: kv[1].ordinal):
        pages = max(sec.end_page - sec.start_page + 1, 1)
        a = agg[sid]
        out.append(SectionCoverageOut(section_id=sid, title=sec.title, start_page=sec.start_page, end_page=sec.end_page,
                                      questions_per_10_pages=round(a["questions"] * 10 / pages, 2), **a))
    total = sum(s.questions for s in out)
    mean_density = (sum(s.questions_per_10_pages for s in out) / len(out)) if out else 0
    low = [s.title for s in out if s.eligible_chunks and s.questions_per_10_pages < 0.5 * mean_density]

    labels = dict(db.execute(text("""
        select o.label, count(*) from question_options o join questions q on q.id = o.question_id
        where q.document_id = :d and q.status <> 'discarded' and o.is_correct group by o.label"""), {"d": document_id}).all())
    longest = db.execute(text("""
        select avg(case when c.len > (select max(length(o2.text)) from question_options o2
                                      where o2.question_id = q.id and not o2.is_correct) then 1.0 else 0.0 end)
        from questions q join lateral (select length(text) as len from question_options
                                       where question_id = q.id and is_correct) c on true
        where q.document_id = :d and q.status <> 'discarded'"""), {"d": document_id}).scalar()
    return CoverageOut(total_questions=total, sections=out,
                       correct_label_distribution={label: int(labels.get(label, 0)) for label in "ABCD"},
                       correct_is_longest_ratio=round(float(longest), 3) if longest is not None else None,
                       low_coverage_sections=low)


@router.get("/jobs/{job_id}/candidates", response_model=CandidateSummaryOut)
def candidates_summary(job_id: UUID, user_id: UUID = Depends(current_user_id),
                       db: Session = Depends(db_session)) -> CandidateSummaryOut:
    get_job(job_id, user_id, db)
    by_status = dict(db.execute(text("select status, count(*) from question_candidates where job_id = :j group by status"),
                                {"j": job_id}).all())
    reasons = db.execute(text("""
        select split_part(r, ':', 1) as reason, count(*) as n
        from question_candidates, unnest(reasons) r where job_id = :j group by 1 order by 2 desc limit 15"""),
        {"j": job_id}).all()
    return CandidateSummaryOut(by_status=by_status, top_reasons=[(r.reason, r.n) for r in reasons])
