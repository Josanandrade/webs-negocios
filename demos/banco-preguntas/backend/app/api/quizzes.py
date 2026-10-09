"""Tests del alumno: crear, responder, entregar, corregir y repetir los fallos.

La respuesta correcta nunca sale del servidor antes de tiempo: en práctica se revela al
responder cada pregunta; en examen, solo al entregar. El tiempo límite se comprueba en el
servidor: un examen caducado se entrega solo con lo respondido hasta entonces.
"""
import json
import random
from datetime import UTC, datetime, timedelta
from typing import Any, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.deps import current_user_id, db_session
from app.quiz import Filters, candidate_rows, choose, score, scope_for_sections, snapshots, top_sections_for

router = APIRouter(prefix="/api/quizzes", tags=["quizzes"])

Label = Literal["A", "B", "C", "D"]


class QuizCreate(BaseModel):
    title: str | None = Field(default=None, max_length=120)
    document_ids: list[UUID] | None = None
    section_ids: list[UUID] | None = Field(default=None, description="Incluye sus subapartados")
    difficulties: list[Literal["easy", "medium", "hard"]] | None = None
    tags: list[str] | None = None
    only_reviewed: bool = Field(default=False, description="Solo preguntas revisadas a mano")
    selection: Literal["random", "unseen", "failed", "weak"] = "random"
    count: int = Field(default=20, ge=1, le=200)
    mode: Literal["practice", "exam"] = "practice"
    penalty: float = Field(default=1 / 3, ge=0, le=1, description="Fracción de acierto que resta cada fallo")
    time_limit_minutes: int | None = Field(default=None, ge=1, le=600, description="Solo en modo examen")
    shuffle_options: bool = False

    @field_validator("tags")
    @classmethod
    def _tags(cls, v: list[str] | None) -> list[str] | None:
        return [t.strip().lower() for t in v if t.strip()] or None if v else None


class AnswerIn(BaseModel):
    selected_label: Label | None = Field(description="null = dejar en blanco")


class QuizOption(BaseModel):
    label: str
    text: str


class QuizQuestionOut(BaseModel):
    ordinal: int
    question_id: UUID | None
    stem: str
    options: list[QuizOption]
    difficulty: str
    document_title: str
    section_title: str | None
    top_section_title: str | None
    selected_label: str | None
    answered: bool
    revealed: bool
    # Solo cuando revealed = true:
    is_correct: bool | None = None
    correct_label: str | None = None
    explanation: str | None = None
    source_page: int | None = None
    source_quote: str | None = None


class QuizSummary(BaseModel):
    id: UUID
    title: str
    mode: str
    status: str
    penalty: float
    total: int
    answered: int
    correct: int | None
    wrong: int | None
    blank: int | None
    net: float | None
    score: float | None
    time_limit_seconds: int | None
    expires_at: datetime | None
    remaining_seconds: int | None
    started_at: datetime
    finished_at: datetime | None
    source_quiz_id: UUID | None
    config: dict[str, Any]


class QuizOut(QuizSummary):
    questions: list[QuizQuestionOut]


class QuizPage(BaseModel):
    items: list[QuizSummary]
    total: int


# ---------------------------------------------------------------- utilidades
def _get_quiz(db: Session, user_id: UUID, quiz_id: UUID) -> dict[str, Any]:
    row = db.execute(text("select * from quizzes where id = :id and user_id = :u"),
                     {"id": quiz_id, "u": user_id}).mappings().first()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Test no encontrado")
    return dict(row)


def _finish(db: Session, quiz: dict[str, Any]) -> None:
    counts = db.execute(text("""
        select count(*) filter (where selected_label is not null and is_correct) as correct,
               count(*) filter (where selected_label is not null and not is_correct) as wrong,
               count(*) filter (where selected_label is null) as blank
        from quiz_questions where quiz_id = :q"""), {"q": quiz["id"]}).mappings().one()
    net, nota = score(counts["correct"], counts["wrong"], quiz["total"], quiz["penalty"])
    db.execute(text("""
        update quizzes set status = 'finished', finished_at = now(), correct = :c, wrong = :w, blank = :b,
               net = :net, score = :s where id = :id and status = 'in_progress'"""),
               {"c": counts["correct"], "w": counts["wrong"], "b": counts["blank"], "net": net, "s": nota,
                "id": quiz["id"]})
    quiz.update(status="finished")


def _expire_if_needed(db: Session, quiz: dict[str, Any]) -> bool:
    """Entrega automáticamente un examen cuyo tiempo ha terminado. Devuelve True si caducó."""
    if quiz["status"] == "in_progress" and quiz["expires_at"] and quiz["expires_at"] <= datetime.now(UTC):
        _finish(db, quiz)
        return True
    return False


def _summary(db: Session, quiz: dict[str, Any]) -> dict[str, Any]:
    answered = db.execute(text("select count(*) from quiz_questions where quiz_id = :q and answered_at is not null"),
                          {"q": quiz["id"]}).scalar_one()
    remaining = None
    if quiz["status"] == "in_progress" and quiz["expires_at"]:
        remaining = max(0, int((quiz["expires_at"] - datetime.now(UTC)).total_seconds()))
    return {k: quiz[k] for k in QuizSummary.model_fields if k in quiz} | {"answered": answered,
                                                                        "remaining_seconds": remaining}


def _question_out(row: dict[str, Any], quiz: dict[str, Any]) -> QuizQuestionOut:
    snap = row["snapshot"]
    answered = row["answered_at"] is not None
    revealed = quiz["status"] == "finished" or (quiz["mode"] == "practice" and answered)
    out = QuizQuestionOut(
        ordinal=row["ordinal"], question_id=row["question_id"], stem=snap["stem"],
        options=[QuizOption(**o) for o in snap["options"]], difficulty=snap["difficulty"],
        document_title=snap["document_title"], section_title=snap["section_title"],
        top_section_title=snap.get("top_section_title"), selected_label=row["selected_label"],
        answered=answered, revealed=revealed)
    if revealed:
        out.is_correct = bool(row["is_correct"]) if row["selected_label"] else None
        out.correct_label = snap["correct_label"]
        out.explanation = snap["explanation"]
        out.source_page = snap["source_page"]
        out.source_quote = snap["source_quote"]
    return out


def _load(db: Session, user_id: UUID, quiz_id: UUID) -> QuizOut:
    quiz = _get_quiz(db, user_id, quiz_id)
    _expire_if_needed(db, quiz)
    quiz = _get_quiz(db, user_id, quiz_id)
    rows = db.execute(text("select * from quiz_questions where quiz_id = :q order by ordinal"),
                      {"q": quiz_id}).mappings().all()
    return QuizOut(**_summary(db, quiz), questions=[_question_out(dict(r), quiz) for r in rows])


def _create(db: Session, user_id: UUID, *, title: str, mode: str, penalty: float, time_limit_minutes: int | None,
            config: dict[str, Any], snaps: list[dict[str, Any]], source_quiz_id: UUID | None = None) -> UUID:
    limit_s = time_limit_minutes * 60 if time_limit_minutes and mode == "exam" else None
    quiz_id = db.execute(text("""
        insert into quizzes (user_id, title, mode, penalty, time_limit_seconds, expires_at, total, config,
                             source_quiz_id)
        values (:u, :t, :m, :p, cast(:lim as int),
                case when cast(:lim as int) is null then null else now() + make_interval(secs => cast(:lim as int)) end,
                :n, cast(:cfg as jsonb), :src)
        returning id"""),
        {"u": user_id, "t": title, "m": mode, "p": penalty, "lim": limit_s, "n": len(snaps),
         "cfg": json.dumps(config, ensure_ascii=False, default=str), "src": source_quiz_id}).scalar_one()
    for i, snap in enumerate(snaps, start=1):
        db.execute(text("""
            insert into quiz_questions (quiz_id, user_id, question_id, ordinal, snapshot, document_id,
                                        top_section_id, difficulty)
            values (:q, :u, :qid, :o, cast(:s as jsonb), :d, :top, :diff)"""),
            {"q": quiz_id, "u": user_id, "qid": snap["question_id"], "o": i,
             "s": json.dumps(snap, ensure_ascii=False), "d": snap["document_id"], "top": snap["top_section_id"],
             "diff": snap["difficulty"]})
    return quiz_id


# --------------------------------------------------------------------- rutas
@router.post("", response_model=QuizOut, status_code=status.HTTP_201_CREATED)
def create_quiz(body: QuizCreate, user_id: UUID = Depends(current_user_id), db: Session = Depends(db_session)) -> QuizOut:
    scope = None
    if body.section_ids:
        scope = scope_for_sections(db, user_id, body.section_ids)
        if scope is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Sección no encontrada")
    if body.document_ids:
        found = db.execute(text("select count(*) from documents where user_id = :u and id = any(cast(:ids as uuid[]))"),
                           {"u": user_id, "ids": [str(d) for d in body.document_ids]}).scalar_one()
        if found != len(set(body.document_ids)):
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Documento no encontrado")
    filters = Filters(body.document_ids, body.section_ids, body.difficulties, body.tags, body.only_reviewed)
    rows = candidate_rows(db, user_id, filters, scope)
    tops = top_sections_for(db, {r["document_id"] for r in rows})
    rng = random.Random()
    chosen = choose(rows, body.selection, body.count, tops, rng)
    if not chosen:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT,
                            "No hay preguntas que cumplan los filtros" +
                            {"unseen": " (todas se han respondido ya)", "failed": " (no hay preguntas falladas)"}
                            .get(body.selection, ""))
    snaps = snapshots(db, user_id, [r["id"] for r in chosen], tops, body.shuffle_options, rng)
    config = body.model_dump(exclude={"title", "mode", "penalty", "time_limit_minutes"}) | {"requested": body.count}
    title = body.title or ("Examen" if body.mode == "exam" else "Práctica") + f" · {len(snaps)} preguntas"
    quiz_id = _create(db, user_id, title=title, mode=body.mode, penalty=body.penalty,
                      time_limit_minutes=body.time_limit_minutes, config=config, snaps=snaps)
    return _load(db, user_id, quiz_id)


@router.get("", response_model=QuizPage)
def list_quizzes(status_: Literal["in_progress", "finished"] | None = Query(None, alias="status"),
                 limit: int = Query(50, ge=1, le=200), offset: int = Query(0, ge=0),
                 user_id: UUID = Depends(current_user_id), db: Session = Depends(db_session)) -> QuizPage:
    for q in db.execute(text("select * from quizzes where user_id = :u and status = 'in_progress' and expires_at <= now()"),
                        {"u": user_id}).mappings().all():
        _finish(db, dict(q))
    where = "user_id = :u and (cast(:st as text) is null or status = :st)"
    p = {"u": user_id, "st": status_, "lim": limit, "off": offset}
    total = db.execute(text(f"select count(*) from quizzes where {where}"), p).scalar_one()
    rows = db.execute(text(f"select * from quizzes where {where} order by started_at desc limit :lim offset :off"),
                      p).mappings().all()
    return QuizPage(items=[QuizSummary(**_summary(db, dict(r))) for r in rows], total=total)


@router.get("/{quiz_id}", response_model=QuizOut)
def get_quiz(quiz_id: UUID, user_id: UUID = Depends(current_user_id), db: Session = Depends(db_session)) -> QuizOut:
    return _load(db, user_id, quiz_id)


@router.put("/{quiz_id}/questions/{ordinal}", response_model=QuizQuestionOut)
def answer(quiz_id: UUID, ordinal: int, body: AnswerIn, user_id: UUID = Depends(current_user_id),
           db: Session = Depends(db_session)) -> QuizQuestionOut:
    quiz = _get_quiz(db, user_id, quiz_id)
    if _expire_if_needed(db, quiz):
        raise HTTPException(status.HTTP_409_CONFLICT, "Se acabó el tiempo: el examen se ha entregado")
    if quiz["status"] != "in_progress":
        raise HTTPException(status.HTTP_409_CONFLICT, "El test ya está entregado")
    row = db.execute(text("select * from quiz_questions where quiz_id = :q and ordinal = :o for update"),
                     {"q": quiz_id, "o": ordinal}).mappings().first()
    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pregunta no encontrada en este test")
    if quiz["mode"] == "practice" and row["answered_at"] is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Ya respondida: en práctica la corrección es inmediata")
    selected = body.selected_label
    is_correct = None if selected is None else selected == row["snapshot"]["correct_label"]
    # En examen, dejar en blanco una pregunta ya contestada la devuelve a "sin responder".
    answered = selected is not None or quiz["mode"] == "practice"
    updated = db.execute(text("""
        update quiz_questions set selected_label = :s, is_correct = :c,
               answered_at = case when :a then now() else null end
        where id = :id returning *"""), {"s": selected, "c": is_correct, "a": answered, "id": row["id"]}).mappings().one()
    return _question_out(dict(updated), quiz)


@router.post("/{quiz_id}/finish", response_model=QuizOut)
def finish(quiz_id: UUID, user_id: UUID = Depends(current_user_id), db: Session = Depends(db_session)) -> QuizOut:
    quiz = _get_quiz(db, user_id, quiz_id)
    if quiz["status"] == "in_progress":
        _finish(db, quiz)
    return _load(db, user_id, quiz_id)


@router.post("/{quiz_id}/retry", response_model=QuizOut, status_code=status.HTTP_201_CREATED)
def retry_failed(quiz_id: UUID, user_id: UUID = Depends(current_user_id), db: Session = Depends(db_session)) -> QuizOut:
    """Nuevo test con las preguntas falladas o en blanco de un test entregado (versión actual
    de cada pregunta; se omiten las borradas o descartadas desde entonces)."""
    quiz = _get_quiz(db, user_id, quiz_id)
    _expire_if_needed(db, quiz)
    if quiz["status"] != "finished":
        raise HTTPException(status.HTTP_409_CONFLICT, "Entrega el test antes de repetir los fallos")
    ids = db.execute(text("""
        select qq.question_id from quiz_questions qq join questions q on q.id = qq.question_id
        where qq.quiz_id = :z and (qq.selected_label is null or not qq.is_correct)
          and q.status in ('auto_validated', 'manually_reviewed')
        order by qq.ordinal"""), {"z": quiz_id}).scalars().all()
    if not ids:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "No hay fallos que repetir")
    docs = set(db.execute(text("select document_id from questions where id = any(cast(:ids as uuid[]))"),
                          {"ids": [str(i) for i in ids]}).scalars())
    rng = random.Random()
    snaps = snapshots(db, user_id, list(ids), top_sections_for(db, docs), quiz["config"].get("shuffle_options", False), rng)
    new_id = _create(db, user_id, title=f"Repaso de fallos · {quiz['title']}"[:120], mode=quiz["mode"],
                     penalty=quiz["penalty"],
                     time_limit_minutes=quiz["time_limit_seconds"] // 60 if quiz["time_limit_seconds"] else None,
                     config=quiz["config"] | {"selection": "retry", "requested": len(snaps)}, snaps=snaps,
                     source_quiz_id=quiz_id)
    return _load(db, user_id, new_id)


@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quiz(quiz_id: UUID, user_id: UUID = Depends(current_user_id), db: Session = Depends(db_session)) -> None:
    """Borra el test y sus respuestas (dejan de contar en las estadísticas)."""
    if db.execute(text("delete from quizzes where id = :id and user_id = :u"), {"id": quiz_id, "u": user_id}).rowcount == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Test no encontrado")
