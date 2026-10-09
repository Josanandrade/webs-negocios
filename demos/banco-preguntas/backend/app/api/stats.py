"""Estadísticas del alumno a partir de sus intentos (vista quiz_attempts).

Todo se calcula con la copia guardada en cada test: editar o borrar una pregunta después
no altera el historial.
"""
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.deps import current_user_id, db_session

router = APIRouter(prefix="/api/stats", tags=["stats"])

MASTERED_STREAK = 2   # "dominada": las 2 últimas veces se acertó


class Breakdown(BaseModel):
    key: str | None
    title: str | None
    answered: int
    correct: int
    wrong: int
    blank: int
    accuracy: float | None       # aciertos / respondidas (incluidas en blanco)


class ScorePoint(BaseModel):
    quiz_id: UUID
    title: str
    mode: str
    finished_at: datetime
    total: int
    score: float


class FailedQuestion(BaseModel):
    question_id: UUID | None
    stem: str
    top_section_title: str | None
    attempts: int
    wrong: int
    last_result: str


class Coverage(BaseModel):
    active_questions: int        # preguntas aprobadas en el banco (con los filtros)
    seen: int
    unseen: int
    mastered: int                # las últimas veces acertada
    to_review: int               # la última vez fallada o en blanco


class StatsOut(BaseModel):
    quizzes_finished: int
    quizzes_in_progress: int
    totals: Breakdown
    average_score: float | None
    best_score: float | None
    scores: list[ScorePoint]     # evolución, del más antiguo al más reciente
    by_topic: list[Breakdown]    # peor porcentaje primero: lo que hay que repasar
    by_difficulty: list[Breakdown]
    most_failed: list[FailedQuestion]
    coverage: Coverage


def _accuracy(correct: int, answered: int) -> float | None:
    return round(correct / answered, 4) if answered else None


def _breakdown(r) -> Breakdown:
    return Breakdown(key=str(r.key) if r.key is not None else None, title=r.title, answered=r.answered,
                     correct=r.correct, wrong=r.wrong, blank=r.blank, accuracy=_accuracy(r.correct, r.answered))


@router.get("", response_model=StatsOut)
def stats(document_id: UUID | None = None, last: int = 30, user_id: UUID = Depends(current_user_id),
          db: Session = Depends(db_session)) -> StatsOut:
    p = {"u": user_id, "d": document_id, "last": max(1, min(last, 200))}
    doc_filter = "(cast(:d as uuid) is null or a.document_id = :d)"
    counts = """count(*) as answered, count(*) filter (where result = 'correct') as correct,
                count(*) filter (where result = 'wrong') as wrong, count(*) filter (where result = 'blank') as blank"""

    totals = db.execute(text(f"select null as key, null as title, {counts} from quiz_attempts a where {doc_filter}"),
                        p).one()
    by_topic = db.execute(text(f"""
        select a.top_section_id as key,
               coalesce(max(s.title), max(a.snapshot ->> 'top_section_title'), 'Sin tema') as title, {counts}
        from quiz_attempts a left join document_sections s on s.id = a.top_section_id
        where {doc_filter} group by a.top_section_id"""), p).all()
    by_diff = db.execute(text(f"""
        select a.difficulty as key, a.difficulty as title, {counts} from quiz_attempts a
        where {doc_filter} group by a.difficulty order by array_position(array['easy','medium','hard'], a.difficulty)"""),
        p).all()

    # Un test cuenta para un documento si contiene alguna pregunta suya.
    quiz_filter = """(cast(:d as uuid) is null or exists (
        select 1 from quiz_questions qq where qq.quiz_id = z.id and qq.document_id = :d))"""
    scores = db.execute(text(f"""
        select * from (select z.id as quiz_id, z.title, z.mode, z.finished_at, z.total, z.score from quizzes z
                       where z.user_id = :u and z.status = 'finished' and {quiz_filter}
                       order by z.finished_at desc limit :last) t order by finished_at"""), p).mappings().all()
    agg = db.execute(text(f"""
        select count(*) filter (where status = 'finished') as finished,
               count(*) filter (where status = 'in_progress') as in_progress,
               avg(score) filter (where status = 'finished') as avg, max(score) as best
        from quizzes z where z.user_id = :u and {quiz_filter}"""), p).mappings().one()

    most_failed = db.execute(text(f"""
        select a.question_id, (array_agg(a.snapshot ->> 'stem' order by a.attempted_at desc))[1] as stem,
               (array_agg(a.snapshot ->> 'top_section_title' order by a.attempted_at desc))[1] as top_section_title,
               count(*) as attempts, count(*) filter (where result <> 'correct') as wrong,
               (array_agg(result order by a.attempted_at desc))[1] as last_result
        from quiz_attempts a where {doc_filter}
        group by a.question_id, case when a.question_id is null then a.id end
        having count(*) filter (where result <> 'correct') > 0
        order by 5 desc, 4 desc limit 10"""), p).mappings().all()

    coverage = db.execute(text(f"""
        with last_results as (
          select a.question_id, array_agg(result order by a.attempted_at desc) as results
          from quiz_attempts a where a.question_id is not null group by a.question_id
        )
        select count(*) as active,
               count(l.question_id) as seen,
               count(*) filter (where l.results[1:{MASTERED_STREAK}] = array_fill('correct'::text, array[{MASTERED_STREAK}]))
                 as mastered,
               count(*) filter (where l.results[1] in ('wrong', 'blank')) as to_review
        from questions q left join last_results l on l.question_id = q.id
        where q.user_id = :u and q.status in ('auto_validated', 'manually_reviewed')
          and (cast(:d as uuid) is null or q.document_id = :d)"""), p).mappings().one()

    topics = sorted((_breakdown(r) for r in by_topic), key=lambda b: (b.accuracy if b.accuracy is not None else 2, b.title or ""))
    return StatsOut(
        quizzes_finished=agg["finished"], quizzes_in_progress=agg["in_progress"], totals=_breakdown(totals),
        average_score=round(agg["avg"], 2) if agg["avg"] is not None else None,
        best_score=agg["best"], scores=[ScorePoint(**r) for r in scores], by_topic=topics,
        by_difficulty=[_breakdown(r) for r in by_diff],
        most_failed=[FailedQuestion(**r) for r in most_failed],
        coverage=Coverage(active_questions=coverage["active"], seen=coverage["seen"],
                          unseen=coverage["active"] - coverage["seen"], mastered=coverage["mastered"],
                          to_review=coverage["to_review"]))
