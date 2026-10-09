"""Catálogo de distractores sacados del propio documento (sin IA).

Para un hecho objetivo ("dosis diaria del medicamento A = 20 mg") se buscan valores que
aparecen en el documento para OTROS sujetos y son comparables (misma ranura: tipo,
atributo y unidad). Cada candidato conserva su cita y su página.

Se descarta un candidato si podría ser también correcto:
  * el sujeto de la pregunta tiene ese mismo valor en algún hecho;
  * el sujeto y el valor aparecen juntos en una misma frase en cualquier parte del documento.
Si al final no hay al menos 3 candidatos, la pregunta no se generará.
"""
import math
import re
from dataclasses import dataclass
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.ingestion.textmatch import fold

NUMERIC_KINDS = {"quantity", "date", "deadline"}
OPEN_KINDS = {"definition", "classification", "name", "characteristic", "requirement", "exception",
              "procedure_step", "relation"}
_SENTENCE = re.compile(r"(?<=[.!?;:])\s+|\n+")


@dataclass
class Candidate:
    fact_id: UUID
    value: str
    value_norm: str
    subject: str
    quote: str
    page_number: int
    section_id: UUID | None
    tier: str          # 'misma_ranura' | 'mismo_tipo'
    score: float


class _Cooccurrence:
    """Frases del documento ya normalizadas, para detectar sujeto+valor juntos."""

    def __init__(self, session: Session, document_id: UUID):
        chunks = session.execute(text("select text from document_chunks where document_id = :d"),
                                 {"d": document_id}).scalars()
        self.sentences = [fold(s) for t in chunks for s in _SENTENCE.split(t) if s.strip()]

    def together(self, subject: str, value: str) -> bool:
        a, b = fold(subject), fold(value)
        return bool(a and b) and any(a in s and b in s for s in self.sentences)


def _top_sections(session: Session, document_id: UUID) -> dict[UUID, UUID]:
    rows = session.execute(text("select id, parent_id from document_sections where document_id = :d"),
                           {"d": document_id}).all()
    parent = {r.id: r.parent_id for r in rows}

    def top(sid: UUID) -> UUID:
        while parent.get(sid):
            sid = parent[sid]
        return sid

    return {sid: top(sid) for sid in parent}


def distractor_candidates(session: Session, fact_id: UUID, *, difficulty: str = "medium",
                          limit: int = 8) -> list[Candidate]:
    target = session.execute(text("select * from facts where id = :id"), {"id": fact_id}).mappings().one()
    doc = target["document_id"]
    tops = _top_sections(session, doc)
    target_top = tops.get(target["section_id"])

    # Todo lo que el documento afirma del sujeto objetivo: esos valores NO pueden ser distractores.
    own_values = set(session.execute(text("select value_norm from facts where document_id = :d and subject_norm = :s"),
                                     {"d": doc, "s": target["subject_norm"]}).scalars())

    if target["kind"] in NUMERIC_KINDS:
        pool = session.execute(text("""
            select * from facts where document_id = :d and id <> :id and kind = :k
              and coalesce(unit, '') = coalesce(:unit, '') and value_number is not null"""),
            {"d": doc, "id": fact_id, "k": target["kind"], "unit": target["unit"]}).mappings().all()
    else:
        pool = session.execute(text("select * from facts where document_id = :d and id <> :id and kind = :k"),
                               {"d": doc, "id": fact_id, "k": target["kind"]}).mappings().all()

    cooc = _Cooccurrence(session, doc)
    best: dict[str, Candidate] = {}
    for f in pool:
        if f["subject_norm"] == target["subject_norm"] or f["value_norm"] in own_values:
            continue
        if f["value_norm"] == target["value_norm"]:
            continue
        if target["kind"] in NUMERIC_KINDS and f["value_number"] == target["value_number"]:
            continue
        if cooc.together(target["subject"], f["value"]):
            continue   # podría ser también correcto para este sujeto

        same_slot = f["slot"] == target["slot"]
        if not same_slot and target["kind"] not in OPEN_KINDS and target["kind"] not in NUMERIC_KINDS:
            continue
        proximity = 0.0
        if f["section_id"] and f["section_id"] == target["section_id"]:
            proximity = 1.0
        elif target_top and tops.get(f["section_id"]) == target_top:
            proximity = 0.6
        closeness = 0.0
        if target["kind"] in NUMERIC_KINDS and target["value_number"] and f["value_number"]:
            ratio = abs(math.log(abs(float(f["value_number"])) + 1e-9) - math.log(abs(float(target["value_number"])) + 1e-9))
            closeness = 1 / (1 + ratio)
        similarity = (2.0 if same_slot else 0.0) + proximity + closeness
        score = {"easy": -proximity - closeness + (2.0 if same_slot else 0.0),
                 "hard": similarity * 1.5}.get(difficulty, similarity)
        cand = Candidate(f["id"], f["value"], f["value_norm"], f["subject"], f["quote"], f["page_number"],
                         f["section_id"], "misma_ranura" if same_slot else "mismo_tipo", round(score, 4))
        if cand.value_norm not in best or best[cand.value_norm].score < cand.score:
            best[cand.value_norm] = cand

    return sorted(best.values(), key=lambda c: (-c.score, c.page_number))[:limit]
