"""Banco de preguntas: consulta, auditoría de fuentes, edición, revisión y etiquetas.

Toda edición manual queda en `questions.history` (qué cambió, valor anterior y nuevo) y
marca la pregunta como revisada manualmente. Las fuentes originales no se pierden.
"""
import json
from datetime import UTC, datetime
from typing import Any, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.deps import current_user_id, db_session
from app.facts.pipeline import section_scope

router = APIRouter(prefix="/api/questions", tags=["questions"])

CONTEXT_CHARS = 500
Status = Literal["generated", "auto_validated", "manually_reviewed", "discarded"]
Difficulty = Literal["easy", "medium", "hard"]


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
    context_before: str | None = None   # texto de la página justo antes de la cita
    context_after: str | None = None    # y justo después ("ver fragmento original")


class QuestionOut(BaseModel):
    id: UUID
    seq: int
    document_id: UUID
    document_title: str
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
    reviewed_at: datetime | None
    edited_at: datetime | None
    options: list[OptionOut]
    sources: list[SourceOut] | None = None
    generation: dict[str, Any] | None = None
    history: list[dict[str, Any]] | None = None


class QuestionPage(BaseModel):
    items: list[QuestionOut]
    total: int
    limit: int
    offset: int


class OptionEdit(BaseModel):
    label: Literal["A", "B", "C", "D"]
    text: str = Field(min_length=1, max_length=500)


class QuestionPatch(BaseModel):
    stem: str | None = Field(default=None, min_length=10, max_length=600)
    explanation: str | None = Field(default=None, max_length=2000)
    difficulty: Difficulty | None = None
    status: Literal["auto_validated", "manually_reviewed", "discarded"] | None = None
    tags: list[str] | None = None
    options: list[OptionEdit] | None = None
    correct_label: Literal["A", "B", "C", "D"] | None = None

    @field_validator("tags")
    @classmethod
    def _clean_tags(cls, tags: list[str] | None) -> list[str] | None:
        if tags is None:
            return None
        cleaned = sorted({t.strip().lower()[:40] for t in tags if t and t.strip()})
        if len(cleaned) > 20:
            raise ValueError("Máximo 20 etiquetas")
        return cleaned


class BulkIn(BaseModel):
    ids: list[UUID] = Field(min_length=1, max_length=500)
    action: Literal["approve", "discard", "restore", "delete", "add_tag", "remove_tag", "set_difficulty"]
    tag: str | None = Field(default=None, max_length=40)
    difficulty: Difficulty | None = None


class BulkOut(BaseModel):
    affected: int


# ------------------------------------------------------------------ lectura
def _load(db: Session, user_id: UUID, ids: list[UUID], detail: bool) -> list[QuestionOut]:
    if not ids:
        return []
    params = {"u": user_id, "ids": [str(i) for i in ids]}
    rows = db.execute(text("""
        select q.id, q.seq, q.document_id, d.title as document_title, q.section_id, s.title as section_title,
               q.stem, q.question_type, q.difficulty, q.status, q.explanation, q.confidence, q.tags, q.created_at,
               q.reviewed_at, q.edited_at, q.generation, q.history
        from questions q join documents d on d.id = q.document_id
        left join document_sections s on s.id = q.section_id
        where q.user_id = :u and q.id = any(cast(:ids as uuid[]))"""), params).mappings().all()
    options: dict[UUID, list[OptionOut]] = {}
    for o in db.execute(text("select question_id, label, text, is_correct from question_options"
                             " where question_id = any(cast(:ids as uuid[])) order by label"), params).mappings():
        options.setdefault(o["question_id"], []).append(OptionOut(label=o["label"], text=o["text"],
                                                                  is_correct=o["is_correct"]))
    sources: dict[UUID, list[SourceOut]] = {}
    if detail:
        for r in db.execute(text("""
                select s.question_id, s.role, o.label as option_label, s.page_number, s.quote, s.char_start,
                       s.char_end, p.text as page_text
                from question_sources s
                left join question_options o on o.id = s.option_id
                join document_pages p on p.id = s.page_id
                where s.question_id = any(cast(:ids as uuid[]))
                order by case s.role when 'answer' then 0 else 1 end, o.label"""), params).mappings():
            before = after = None
            if r["char_start"] is not None and r["char_end"] is not None:
                before = r["page_text"][max(0, r["char_start"] - CONTEXT_CHARS):r["char_start"]]
                after = r["page_text"][r["char_end"]:r["char_end"] + CONTEXT_CHARS]
            sources.setdefault(r["question_id"], []).append(SourceOut(
                role=r["role"], option_label=r["option_label"], page_number=r["page_number"], quote=r["quote"],
                char_start=r["char_start"], char_end=r["char_end"], context_before=before, context_after=after))
    out = {}
    for r in rows:
        out[r["id"]] = QuestionOut(
            **{k: v for k, v in r.items() if k not in ("generation", "history")},
            options=options.get(r["id"], []),
            sources=sources.get(r["id"]) if detail else None,
            generation=r["generation"] if detail else None,
            history=r["history"] if detail else None)
    return [out[i] for i in ids if i in out]


@router.get("", response_model=QuestionPage)
def list_questions(
    document_id: UUID | None = None,
    section_id: UUID | None = None,
    status_: Status | None = Query(None, alias="status"),
    difficulty: Difficulty | None = None,
    tag: str | None = None,
    q: str | None = Query(None, max_length=200, description="Texto a buscar en enunciado y opciones"),
    include_discarded: bool = False,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    user_id: UUID = Depends(current_user_id),
    db: Session = Depends(db_session),
) -> QuestionPage:
    scope = None
    if section_id is not None:
        doc = db.execute(text("select document_id from document_sections where id = :s and user_id = :u"),
                         {"s": section_id, "u": user_id}).scalar()
        if doc is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Sección no encontrada")
        scope = section_scope(db, doc, [section_id])   # incluye subapartados
    where = """
        q.user_id = :u
        and (cast(:d as uuid) is null or q.document_id = :d)
        and (cast(:scope as uuid[]) is null or q.section_id = any(cast(:scope as uuid[])))
        and (cast(:st as text) is null or q.status = :st)
        and (cast(:st as text) is not null or :incl or q.status <> 'discarded')
        and (cast(:diff as text) is null or q.difficulty = :diff)
        and (cast(:tag as text) is null or :tag = any(q.tags))
        and (cast(:q as text) is null or app.fold(q.stem) like '%' || app.fold(:q) || '%'
             or exists (select 1 from question_options o where o.question_id = q.id
                        and app.fold(o.text) like '%' || app.fold(:q) || '%'))"""
    params = {"u": user_id, "d": document_id, "scope": [str(s) for s in scope] if scope else None,
              "st": status_, "incl": include_discarded, "diff": difficulty, "tag": tag.lower() if tag else None,
              "q": q.strip() if q and q.strip() else None, "lim": limit, "off": offset}
    total = db.execute(text(f"select count(*) from questions q where {where}"), params).scalar_one()
    ids = db.execute(text(f"select q.id from questions q where {where} order by q.seq limit :lim offset :off"),
                     params).scalars().all()
    return QuestionPage(items=_load(db, user_id, list(ids), detail=False), total=total, limit=limit, offset=offset)


@router.get("/tags", response_model=list[tuple[str, int]])
def list_tags(document_id: UUID | None = None, user_id: UUID = Depends(current_user_id),
              db: Session = Depends(db_session)) -> list[tuple[str, int]]:
    rows = db.execute(text("""
        select t, count(*) from questions, unnest(tags) t
        where user_id = :u and (cast(:d as uuid) is null or document_id = :d) group by t order by 2 desc, 1"""),
        {"u": user_id, "d": document_id}).all()
    return [(r[0], r[1]) for r in rows]


@router.get("/{question_id}", response_model=QuestionOut)
def get_question(question_id: UUID, user_id: UUID = Depends(current_user_id), db: Session = Depends(db_session)) -> QuestionOut:
    found = _load(db, user_id, [question_id], detail=True)
    if not found:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pregunta no encontrada")
    return found[0]


# ---------------------------------------------------------------- escritura
def _now() -> str:
    return datetime.now(UTC).isoformat()


@router.patch("/{question_id}", response_model=QuestionOut)
def update_question(question_id: UUID, body: QuestionPatch, user_id: UUID = Depends(current_user_id),
                    db: Session = Depends(db_session)) -> QuestionOut:
    current = get_question(question_id, user_id, db)
    changes: dict[str, Any] = {}
    fields: dict[str, Any] = {}

    for name in ("stem", "explanation", "difficulty", "tags", "status"):
        value = getattr(body, name)
        if value is not None and value != getattr(current, name):
            changes[name] = [getattr(current, name), value]
            fields[name] = value

    by_label = {o.label: o for o in current.options}
    if body.options:
        texts = {o.label: o.text for o in current.options} | {o.label: o.text.strip() for o in body.options}
        if len({t.lower() for t in texts.values()}) != 4:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Las 4 opciones deben ser distintas")
        for edit in body.options:
            if edit.text.strip() != by_label[edit.label].text:
                changes[f"option_{edit.label}"] = [by_label[edit.label].text, edit.text.strip()]
                db.execute(text("update question_options set text = :t where question_id = :q and label = :l"),
                           {"t": edit.text.strip(), "q": question_id, "l": edit.label})

    old_correct = next(o.label for o in current.options if o.is_correct)
    if body.correct_label and body.correct_label != old_correct:
        changes["correct_label"] = [old_correct, body.correct_label]
        # Dos pasos: el índice "como mucho una correcta" se comprueba fila a fila, y la BD
        # vuelve a exigir exactamente una correcta al hacer COMMIT (comprobación diferida).
        db.execute(text("update question_options set is_correct = false where question_id = :q"), {"q": question_id})
        db.execute(text("update question_options set is_correct = true where question_id = :q and label = :l"),
                   {"l": body.correct_label, "q": question_id})
        # Las evidencias acompañan a su opción: la de la nueva correcta pasa a ser la de la respuesta.
        db.execute(text("""
            update question_sources s set role = case when o.is_correct then 'answer' else 'distractor' end
            from question_options o where o.id = s.option_id and s.question_id = :q and s.role <> 'context'"""),
                   {"q": question_id})
        has_answer = db.execute(text("select count(*) from question_sources where question_id = :q and role = 'answer'"),
                                {"q": question_id}).scalar_one()
        if not has_answer:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT,
                                "La nueva respuesta correcta no tiene evidencia en el documento")

    if not changes:
        return current
    content_edit = any(k not in ("status", "tags", "difficulty") for k in changes)
    if "status" not in fields and content_edit:
        fields["status"] = "manually_reviewed"     # una edición de contenido implica revisión manual
    sets = [f"{k} = :{k}" for k in fields]
    if fields.get("status") == "manually_reviewed":
        sets.append("reviewed_at = now()")
    if content_edit:
        sets.append("edited_at = now()")
    sets.append("history = history || cast(:hist as jsonb)")
    db.execute(text(f"update questions set {', '.join(sets)} where id = :id and user_id = :u"),
               {**fields, "id": question_id, "u": user_id,
                "hist": json.dumps([{"at": _now(), "changes": changes}], ensure_ascii=False, default=str)})
    db.flush()
    return get_question(question_id, user_id, db)


@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: UUID, user_id: UUID = Depends(current_user_id), db: Session = Depends(db_session)) -> None:
    """Borrado definitivo. Los tests ya realizados conservan su copia de la pregunta."""
    if db.execute(text("delete from questions where id = :id and user_id = :u"),
                  {"id": question_id, "u": user_id}).rowcount == 0:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pregunta no encontrada")


@router.post("/bulk", response_model=BulkOut)
def bulk(body: BulkIn, user_id: UUID = Depends(current_user_id), db: Session = Depends(db_session)) -> BulkOut:
    ids = [str(i) for i in set(body.ids)]
    p = {"ids": ids, "u": user_id, "hist": json.dumps([{"at": _now(), "changes": {"bulk": body.action}}])}
    base = "where user_id = :u and id = any(cast(:ids as uuid[]))"
    hist = "history = history || cast(:hist as jsonb)"
    if body.action == "approve":
        sql = f"update questions set status = 'manually_reviewed', reviewed_at = now(), {hist} {base} and status <> 'manually_reviewed'"
    elif body.action == "discard":
        sql = f"update questions set status = 'discarded', {hist} {base} and status <> 'discarded'"
    elif body.action == "restore":
        sql = f"update questions set status = 'auto_validated', {hist} {base} and status = 'discarded'"
    elif body.action == "delete":
        sql = f"delete from questions {base}"
    elif body.action in ("add_tag", "remove_tag"):
        if not body.tag or not body.tag.strip():
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Falta la etiqueta")
        p["tag"] = body.tag.strip().lower()
        sql = (f"update questions set tags = array(select distinct unnest(tags || cast(:tag as text))) {base}"
               " and not (:tag = any(tags))" if body.action == "add_tag" else
               f"update questions set tags = array_remove(tags, :tag) {base} and :tag = any(tags)")
    else:
        if body.difficulty is None:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, "Falta la dificultad")
        p["diff"] = body.difficulty
        sql = f"update questions set difficulty = :diff, {hist} {base} and difficulty <> :diff"
    return BulkOut(affected=db.execute(text(sql), p).rowcount)
