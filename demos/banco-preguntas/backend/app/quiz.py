"""Tests del alumno: selección de preguntas, copia inmutable y corrección (sin IA).

Selección:
  * solo preguntas aprobadas (auto_validated / manually_reviewed), nunca descartadas;
  * modos: 'random' (prefiere las menos vistas, sin quedarse corto), 'unseen' (nunca respondidas), 'failed' (la última vez se fallaron o
    se dejaron en blanco) y 'weak' (primero las falladas, luego las de peor porcentaje y
    las menos vistas);
  * reparto equilibrado: turnos entre temas principales para que ninguno acapare el test
    (salvo en 'weak', donde manda la urgencia de repaso).

Puntuación: neto = aciertos − fallos × penalización; nota = max(neto, 0) / total × 10.
"""
import random
from collections import defaultdict
from dataclasses import dataclass
from typing import Any
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.facts.distractors import _top_sections
from app.facts.pipeline import section_scope

ACTIVE_STATUSES = ("auto_validated", "manually_reviewed")
LABELS = ("A", "B", "C", "D")


@dataclass
class Filters:
    document_ids: list[UUID] | None = None
    section_ids: list[UUID] | None = None
    difficulties: list[str] | None = None
    tags: list[str] | None = None
    only_reviewed: bool = False


def scope_for_sections(db: Session, user_id: UUID, section_ids: list[UUID]) -> list[UUID] | None:
    """Secciones pedidas y todos sus subapartados (pueden ser de documentos distintos).
    Devuelve None si alguna no existe."""
    rows = db.execute(text("select id, document_id from document_sections where user_id = :u and id = any(cast(:ids as uuid[]))"),
                      {"u": user_id, "ids": [str(s) for s in section_ids]}).all()
    if len(rows) != len(set(section_ids)):
        return None
    by_doc: dict[UUID, list[UUID]] = defaultdict(list)
    for sid, doc in rows:
        by_doc[doc].append(sid)
    return [s for doc, sids in by_doc.items() for s in section_scope(db, doc, sids)]


def candidate_rows(db: Session, user_id: UUID, f: Filters, scope: list[UUID] | None) -> list[dict[str, Any]]:
    """Preguntas que cumplen los filtros, con su historial de intentos."""
    statuses = ["manually_reviewed"] if f.only_reviewed else list(ACTIVE_STATUSES)
    return [dict(r) for r in db.execute(text("""
        with hist as (
          select question_id, count(*) as seen,
                 count(*) filter (where result = 'correct') as right_n,
                 (array_agg(result order by attempted_at desc))[1] as last_result
          from quiz_attempts where question_id is not null group by question_id
        )
        select q.id, q.document_id, q.section_id, coalesce(h.seen, 0) as seen, coalesce(h.right_n, 0) as right_n,
               h.last_result
        from questions q left join hist h on h.question_id = q.id
        where q.user_id = :u and q.status = any(cast(:st as text[]))
          and (cast(:docs as uuid[]) is null or q.document_id = any(cast(:docs as uuid[])))
          and (cast(:scope as uuid[]) is null or q.section_id = any(cast(:scope as uuid[])))
          and (cast(:diffs as text[]) is null or q.difficulty = any(cast(:diffs as text[])))
          and (cast(:tags as text[]) is null or q.tags && cast(:tags as text[]))
        order by q.seq"""),
        {"u": user_id, "st": statuses,
         "docs": [str(d) for d in f.document_ids] if f.document_ids else None,
         "scope": [str(s) for s in scope] if scope is not None else None,
         "diffs": f.difficulties or None, "tags": [t.lower() for t in f.tags] if f.tags else None}).mappings()]


def choose(rows: list[dict[str, Any]], mode: str, count: int, tops: dict[UUID, UUID],
           rng: random.Random) -> list[dict[str, Any]]:
    """Elige hasta `count` preguntas según el modo, repartiendo por temas en turnos."""
    if mode == "unseen":
        rows = [r for r in rows if r["seen"] == 0]
    elif mode == "failed":
        rows = [r for r in rows if r["last_result"] in ("wrong", "blank")]
    rows = list(rows)
    rng.shuffle(rows)                      # desempate aleatorio
    if mode == "weak":
        def priority(r):
            failed_last = r["last_result"] in ("wrong", "blank")
            accuracy = r["right_n"] / r["seen"] if r["seen"] else 0.5
            return (not failed_last, accuracy, r["seen"])
        rows.sort(key=priority)            # sort estable: conserva el desempate aleatorio
        return rows[:count]

    # Por niveles de uso: primero, en turnos entre temas, las que menos veces has visto (las
    # nunca vistas antes que ninguna); solo si no llegan se pasa al siguiente nivel. Así un test
    # nuevo no repite el anterior mientras queden preguntas sin ver, y nunca se queda corto.
    order: list[Any] = []
    for r in rows:
        key = tops.get(r["section_id"], r["section_id"])
        if key not in order:
            order.append(key)
    rng.shuffle(order)
    chosen: list[dict[str, Any]] = []
    for level in sorted({r["seen"] for r in rows}):
        groups: dict[Any, list[dict[str, Any]]] = defaultdict(list)
        for r in rows:
            if r["seen"] == level:
                groups[tops.get(r["section_id"], r["section_id"])].append(r)
        while len(chosen) < count and any(groups.values()):
            for g in order:
                if groups[g] and len(chosen) < count:
                    chosen.append(groups[g].pop(0))
    return chosen


def top_sections_for(db: Session, document_ids: set[UUID]) -> dict[UUID, UUID]:
    tops: dict[UUID, UUID] = {}
    for doc in document_ids:
        tops.update(_top_sections(db, doc))
    return tops


def snapshots(db: Session, user_id: UUID, question_ids: list[UUID], tops: dict[UUID, UUID],
              shuffle_options: bool, rng: random.Random) -> list[dict[str, Any]]:
    """Copia inmutable de cada pregunta tal como se presenta en el test."""
    p = {"u": user_id, "ids": [str(i) for i in question_ids]}
    qs = {r["id"]: r for r in db.execute(text("""
        select q.id, q.seq, q.stem, q.explanation, q.difficulty, q.document_id, d.title as document_title,
               q.section_id, s.title as section_title
        from questions q join documents d on d.id = q.document_id
        left join document_sections s on s.id = q.section_id
        where q.user_id = :u and q.id = any(cast(:ids as uuid[]))"""), p).mappings()}
    opts: dict[UUID, list[dict[str, Any]]] = defaultdict(list)
    for o in db.execute(text("select question_id, label, text, is_correct from question_options"
                             " where question_id = any(cast(:ids as uuid[])) order by label"), p).mappings():
        opts[o["question_id"]].append(dict(o))
    answer = {r["question_id"]: r for r in db.execute(text("""
        select distinct on (question_id) question_id, page_number, quote from question_sources
        where question_id = any(cast(:ids as uuid[])) and role = 'answer' order by question_id, page_number"""),
        p).mappings()}
    titles = dict(db.execute(text("select id, title from document_sections where user_id = :u"), {"u": user_id}).all())

    out = []
    for qid in question_ids:
        q, options = qs[qid], opts[qid]
        if shuffle_options:
            rng.shuffle(options)
        top = tops.get(q["section_id"], q["section_id"])
        out.append({
            "question_id": str(qid), "question_seq": q["seq"], "stem": q["stem"],
            "options": [{"label": LABELS[i], "text": o["text"]} for i, o in enumerate(options)],
            "correct_label": LABELS[next(i for i, o in enumerate(options) if o["is_correct"])],
            "explanation": q["explanation"], "difficulty": q["difficulty"],
            "document_id": str(q["document_id"]), "document_title": q["document_title"],
            "section_id": str(q["section_id"]) if q["section_id"] else None, "section_title": q["section_title"],
            "top_section_id": str(top) if top else None, "top_section_title": titles.get(top),
            "source_page": answer[qid]["page_number"] if qid in answer else None,
            "source_quote": answer[qid]["quote"] if qid in answer else None,
        })
    return out


def score(correct: int, wrong: int, total: int, penalty: float) -> tuple[float, float]:
    """(neto, nota sobre 10). La nota no baja de 0."""
    net = correct - wrong * penalty
    return round(net, 2), round(max(net, 0.0) / total * 10, 2) if total else 0.0
