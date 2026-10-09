"""Validación DETERMINISTA de una pregunta candidata (sin IA).

Cualquier motivo devuelto descarta la pregunta. Ante la duda, se descarta.
"""
import re
from dataclasses import dataclass, field
from uuid import UUID

from app.facts.normalize import norm_value, numbers_in
from app.ingestion.textmatch import fold

STOPWORDS = set("""
a al algo algun alguna algunas alguno algunos ante antes aquel aquella aquellas aquellos aqui asi aun bajo bien
cada como con contra cual cuales cualquier cuando cuanta cuantas cuanto cuantos de del desde donde dos durante e el
ella ellas ello ellos en entre era es esa esas ese eso esos esta estas este esto estos fue fueron ha han hasta hay la
las le les lo los mas me mediante mi mientras muy ni no nos o otra otras otro otros para pero poco por porque que
quien quienes se segun ser si sin sobre son su sus tal tambien tan tanto te tiene tienen todo todos tras tu un una
unas uno unos y ya
""".split())

# Palabras propias de la formulación de una pregunta (no tienen por qué estar en el temario).
QUESTION_WORDS = set("""
cual cuales siguiente siguientes opcion opciones afirmacion afirmaciones respuesta correcta correctamente correcto
define definicion definen describe caracteristica caracteristicas propia propio pertenece pertenecen grupo grupos
tipo tipos clasifica clasificacion considera consideran indica senala corresponde corresponden relacion relaciona
existe dato valor cantidad cifra porcentaje fecha ano plazo nombre requisito requisitos paso pasos siguiente
despues antes primero excepcion excepciones constituye situacion situaciones establece establecido recoge
dosis duracion maximo minimo exacto habitual cuanto cuantos cuanta cuantas cuando donde quien quienes
""".split())

BANNED = [
    "segun el documento", "segun el texto", "segun el temario", "de acuerdo con el documento",
    "de acuerdo con el texto", "segun el manual", "segun el autor", "todas las anteriores",
    "ninguna de las anteriores", "todas son correctas", "ninguna es correcta", "ambas son correctas",
    "a y b", "b y c", "solo a", "solo b",
]
_BANNED_RE = re.compile(r"\b(" + "|".join(re.escape(b) for b in BANNED) + r")\b")
DANGLING_STEM = re.compile(
    r"\b(lo anterior|lo citado|lo expuesto|lo mencionado|dich[oa]s?|(el|la|los|las) (mencionad|citad|anterior)\w*|"
    r"(este|esta|estos|estas) (procedimiento|tecnica|tratamiento|farmaco|medicamento|metodo|proceso|caso|paciente|"
    r"enfermedad|norma|ley|articulo|apartado|tipo|grupo|sistema|modelo|concepto|termino|fenomeno|elemento))\b")
_WORD = re.compile(r"[a-zñ]{4,}")

MAX_LENGTH_RATIO = 1.6
MIN_LENGTH_RATIO = 0.5


@dataclass
class OptionDraft:
    text: str
    is_correct: bool
    fact_id: UUID
    quote: str
    page_id: UUID
    page_number: int
    chunk_id: UUID
    char_start: int
    char_end: int
    label: str | None = None


@dataclass
class QuestionDraft:
    fact_id: UUID
    document_id: UUID
    section_id: UUID | None
    subject: str
    kind: str
    question_type: str
    difficulty: str
    stem: str
    options: list[OptionDraft]
    explanation: str = ""
    reasons: list[str] = field(default_factory=list)

    @property
    def correct(self) -> OptionDraft:
        return next(o for o in self.options if o.is_correct)

    @property
    def distractors(self) -> list[OptionDraft]:
        return [o for o in self.options if not o.is_correct]


@dataclass
class DocumentContext:
    pages: dict[int, str]
    vocabulary: set[str]
    numbers: set[float]

    @classmethod
    def from_pages(cls, pages: dict[int, str]) -> "DocumentContext":
        joined = "\n".join(pages.values())
        folded = fold(joined)
        return cls(pages, set(_WORD.findall(folded)), numbers_in(joined))


def content_words(text: str) -> set[str]:
    return {w for w in _WORD.findall(fold(text)) if w not in STOPWORDS}


def _norm_option(text: str) -> str:
    return re.sub(r"\s+", " ", fold(text)).strip(" .;:")


def validate_draft(d: QuestionDraft, doc: DocumentContext) -> list[str]:
    reasons: list[str] = []
    stem = d.stem.strip()
    fstem = fold(stem)

    # --- estructura ---
    if len(d.options) != 4:
        reasons.append("no_hay_4_opciones")
    if sum(o.is_correct for o in d.options) != 1:
        reasons.append("no_hay_exactamente_1_correcta")
    if len({_norm_option(o.text) for o in d.options}) != len(d.options) or \
            len({norm_value(o.text) for o in d.options}) != len(d.options):
        reasons.append("opciones_duplicadas")
    if reasons:
        return reasons

    # --- evidencias: cada opción sale literalmente de su cita, y la cita de su página ---
    for o in d.options:
        page = doc.pages.get(o.page_number, "")
        if page[o.char_start:o.char_end] != o.quote:
            reasons.append("cita_no_corresponde_a_pagina")
        if fold(o.text) not in fold(o.quote):
            reasons.append("opcion_no_esta_en_su_cita")
    if any(r.startswith("cita") or r.startswith("opcion_no") for r in reasons):
        return sorted(set(reasons))

    # --- enunciado ---
    if not (15 <= len(stem) <= 300):
        reasons.append("enunciado_longitud")
    if not stem.endswith(("?", ":")):
        reasons.append("enunciado_sin_pregunta")
    if _BANNED_RE.search(fstem) or any(_BANNED_RE.search(fold(o.text)) for o in d.options):
        reasons.append("formula_prohibida")
    if DANGLING_STEM.search(fstem):
        reasons.append("referente_perdido_en_enunciado")
    if any(_norm_option(o.text) in fstem for o in d.options if len(_norm_option(o.text)) >= 3):
        reasons.append("enunciado_contiene_una_opcion")
    subject_words = content_words(d.subject)
    if subject_words and len(subject_words & content_words(stem)) / len(subject_words) < 0.6:
        reasons.append("enunciado_no_menciona_el_sujeto")
    unknown = {w for w in content_words(stem) if w not in doc.vocabulary and w not in QUESTION_WORDS}
    if unknown:
        reasons.append("termino_ajeno_al_documento:" + ",".join(sorted(unknown)[:5]))
    if not numbers_in(stem) <= doc.numbers:
        reasons.append("cifra_del_enunciado_no_esta_en_documento")

    # --- opciones homogéneas y sin pistas ---
    correct, distractors = d.correct, d.distractors
    mean_d = sum(len(o.text) for o in distractors) / len(distractors)
    ratio = len(correct.text) / max(mean_d, 1)
    if ratio > MAX_LENGTH_RATIO or ratio < MIN_LENGTH_RATIO:
        reasons.append("longitud_delata_la_correcta")
    if d.kind in ("quantity", "date", "deadline"):
        if not all(numbers_in(o.text) for o in d.options):
            reasons.append("opciones_no_homogeneas")
    stem_words = content_words(stem) - subject_words
    overlap_correct = len(content_words(correct.text) & stem_words)
    if overlap_correct and all(not (content_words(o.text) & stem_words) for o in distractors):
        reasons.append("pista_lexica_en_enunciado")
    return reasons
