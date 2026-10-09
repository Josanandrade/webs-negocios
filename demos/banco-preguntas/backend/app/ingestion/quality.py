"""Calidad del texto de una página (sin LLM).

Una página es elegible para generar preguntas solo si su texto es fiable. Preferimos
marcar como no elegible una página dudosa antes que generar preguntas sobre texto
corrupto u OCR erróneo.
"""
import re
from dataclasses import dataclass, field

MIN_CHARS_FOR_CONTENT = 120         # menos que esto: portada, página en blanco, separador
MIN_QUALITY_SCORE = 0.70
MIN_OCR_CONFIDENCE = 80.0           # media ponderada de confianza de Tesseract (0-100)

_WORD = re.compile(r"[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,}")
_TOKEN = re.compile(r"\S+")


@dataclass
class QualityReport:
    score: float
    eligible: bool
    flags: list[str] = field(default_factory=list)


def text_quality(text: str) -> float:
    """0..1: proporción de tokens que parecen palabras/números legibles y de caracteres válidos."""
    tokens = _TOKEN.findall(text)
    if not tokens:
        return 0.0
    good = sum(1 for t in tokens if _WORD.search(t) or re.fullmatch(r"[\d.,:%/()\-–ºª°]+", t))
    token_ratio = good / len(tokens)
    chars = [c for c in text if not c.isspace()]
    bad_chars = sum(1 for c in chars if c == "�" or (not c.isprintable()))
    char_ratio = 1 - bad_chars / max(len(chars), 1)
    # Muchos tokens de 1 carácter suelen indicar texto troceado o OCR roto.
    singles = sum(1 for t in tokens if len(t) == 1 and t.isalpha() and t.lower() not in "aeoyu")
    single_penalty = min(singles / len(tokens) * 2, 0.5)
    return max(0.0, min(1.0, token_ratio * char_ratio - single_penalty))


def assess_page(text: str, method: str, ocr_confidence: float | None) -> QualityReport:
    flags: list[str] = []
    score = text_quality(text)
    n_chars = len(text.strip())
    if n_chars < MIN_CHARS_FOR_CONTENT:
        flags.append("poco_texto")
    if score < MIN_QUALITY_SCORE:
        flags.append("texto_ilegible")
    if method == "ocr":
        flags.append("ocr")
        if ocr_confidence is None or ocr_confidence < MIN_OCR_CONFIDENCE:
            flags.append("ocr_baja_confianza")
    eligible = not ({"poco_texto", "texto_ilegible", "ocr_baja_confianza", "ocr_no_disponible"} & set(flags))
    return QualityReport(score=round(score, 3), eligible=eligible, flags=flags)
