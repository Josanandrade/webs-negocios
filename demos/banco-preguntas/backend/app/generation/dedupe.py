"""Detección de preguntas duplicadas antes de guardar (sin IA).

Duplicada si:
  1. ya existe una pregunta sobre el mismo hecho;
  2. ya existe una pregunta que evalúa el mismo dato (mismo sujeto y misma ranura);
  3. mismo enunciado y respuesta normalizados (huella);
  4. misma respuesta correcta y enunciado equivalente (palabras clave o texto muy parecido).
El parecido del texto por sí solo NO basta: "¿Dosis de Alfa?" y "¿Dosis de Beta?" se
parecen mucho y son preguntas distintas (lo que las distingue es el dato evaluado).
"""
import hashlib
import re
from difflib import SequenceMatcher
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.generation.validation import content_words
from app.ingestion.textmatch import fold

SIMILAR_WORDS = 0.6    # Jaccard de palabras con contenido
SIMILAR_TEXT = 0.75    # parecido de texto


def fingerprint(stem: str, correct: str) -> str:
    norm = lambda s: re.sub(r"[^\w]+", " ", fold(s)).strip()  # noqa: E731
    return hashlib.sha256(f"{norm(stem)}|{norm(correct)}".encode()).hexdigest()


def duplicate_reason(session: Session, document_id: UUID, fact_id: UUID, *, stem: str | None = None,
                     correct: str | None = None) -> str | None:
    """Devuelve el motivo si es duplicada. Sin `stem` solo comprueba el dato evaluado."""
    same_fact = session.execute(text("""
        select 1 from questions q where q.document_id = :d and q.status <> 'discarded' and q.fact_id = :f
        limit 1"""), {"d": document_id, "f": fact_id}).first()
    if same_fact:
        return "mismo_hecho"
    same_datum = session.execute(text("""
        select 1 from questions q join facts qf on qf.id = q.fact_id
        join facts f on f.id = :f
        where q.document_id = :d and q.status <> 'discarded'
          and qf.subject_norm = f.subject_norm and qf.slot = f.slot
        limit 1"""), {"d": document_id, "f": fact_id}).first()
    if same_datum:
        return "mismo_dato"
    if stem is None or correct is None:
        return None
    if session.execute(text("select 1 from questions where document_id = :d and status <> 'discarded'"
                            " and fingerprint = :fp limit 1"),
                       {"d": document_id, "fp": fingerprint(stem, correct)}).first():
        return "enunciado_identico"
    # Misma respuesta correcta y enunciado equivalente (mismas palabras clave o texto muy parecido).
    target_words = content_words(stem)
    rows = session.execute(text("""
        select q.stem, o.text as answer
        from questions q join question_options o on o.question_id = q.id and o.is_correct
        where q.document_id = :d and q.status <> 'discarded'"""), {"d": document_id}).all()
    for row in rows:
        if fold(row.answer).strip(" .") != fold(correct).strip(" ."):
            continue
        words = content_words(row.stem)
        jaccard = len(words & target_words) / max(len(words | target_words), 1)
        ratio = SequenceMatcher(None, fold(row.stem), fold(stem)).ratio()
        if jaccard >= SIMILAR_WORDS or ratio >= SIMILAR_TEXT:
            return "misma_pregunta_reformulada"
    return None
