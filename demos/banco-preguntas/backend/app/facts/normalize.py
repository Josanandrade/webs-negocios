"""Normalización de sujetos, valores y cifras para comparar hechos (sin LLM)."""
import re

from app.ingestion.textmatch import fold

_ARTICLES = re.compile(r"^(el|la|los|las|un|una|unos|unas|lo|del|de la|de los|de las)\s+")
_NUMBER = re.compile(r"(?<![\w.,])(-?\d{1,3}(?:\.\d{3})+(?:,\d+)?|-?\d+(?:[.,]\d+)?)(?![\w])")
_QUANTITY = re.compile(
    r"(-?\d{1,3}(?:\.\d{3})+(?:,\d+)?|-?\d+(?:[.,]\d+)?)\s*(%|‰|[a-zA-ZµμºªáéíóúñÁÉÍÓÚÑ/°]+(?:/[a-zA-Zµμ]+)?)?")

UNIT_ALIASES = {
    "miligramos": "mg", "miligramo": "mg", "gramos": "g", "gramo": "g", "kilogramos": "kg", "kilos": "kg",
    "microgramos": "mcg", "µg": "mcg", "μg": "mcg", "mililitros": "ml", "mililitro": "ml", "litros": "l",
    "litro": "l", "por ciento": "%", "porcentaje": "%", "horas": "h", "hora": "h", "minutos": "min",
    "minuto": "min", "segundos": "s", "dias": "dias", "dia": "dias", "días": "dias", "día": "dias",
    "semanas": "semanas", "semana": "semanas", "meses": "meses", "mes": "meses", "años": "anos",
    "año": "anos", "anos": "anos", "ano": "anos", "euros": "eur", "euro": "eur", "€": "eur",
}


def norm_subject(text: str) -> str:
    folded = fold(text)
    folded = re.sub(r"[^\w\s%/.-]", " ", folded)
    folded = re.sub(r"\s+", " ", folded).strip()
    return _ARTICLES.sub("", folded)


def parse_number(raw: str) -> float | None:
    raw = raw.strip()
    if re.fullmatch(r"-?\d{1,3}(\.\d{3})+(,\d+)?", raw):      # 1.500,25
        raw = raw.replace(".", "").replace(",", ".")
    else:
        raw = raw.replace(",", ".")
    try:
        return float(raw)
    except ValueError:
        return None


def parse_quantity(value: str) -> tuple[float | None, str | None]:
    m = _QUANTITY.search(value)
    if not m:
        return None, None
    number = parse_number(m.group(1))
    unit = m.group(2)
    if unit:
        unit_f = fold(unit)
        unit = UNIT_ALIASES.get(unit_f, UNIT_ALIASES.get(unit, unit_f))
    return number, unit


def numbers_in(text: str) -> set[float]:
    found = set()
    for m in _NUMBER.finditer(text):
        n = parse_number(m.group(1))
        if n is not None:
            found.add(n)
    return found


def norm_value(value: str) -> str:
    number, unit = parse_quantity(value)
    folded = re.sub(r"\s+", " ", fold(value)).strip(" .;:")
    if number is not None and re.fullmatch(r"[\d.,\s]+[^\s]*(\s+\w+)?", folded or ""):
        return f"{number:g} {unit or ''}".strip()
    return _ARTICLES.sub("", folded)


def slot_for(kind: str, attribute: str, unit: str | None) -> str:
    return f"{kind}|{norm_subject(attribute)}|{unit or ''}"
