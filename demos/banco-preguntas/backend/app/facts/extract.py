"""Extracción de hechos atómicos con cita literal (IA) + verificación determinista (código).

La IA PROPONE hechos; el código decide. Un hecho solo se acepta si:
  * su cita aparece literalmente (salvo mayúsculas/acentos/espacios) en el fragmento,
  * la cita está dentro de una sola página (para poder citar la página exacta),
  * el valor aparece escrito tal cual dentro de la cita,
  * el sujeto aparece en el fragmento o en su ruta de sección.
La cita que se guarda es el texto canónico de la página, no lo que devolvió la IA.
"""
from dataclasses import dataclass
from typing import Any
from uuid import UUID

from app.facts.normalize import norm_subject, norm_value, numbers_in, parse_quantity, slot_for
from app.ingestion.textmatch import find_folded, fold

KINDS = ("definition", "characteristic", "classification", "quantity", "date", "name", "requirement",
         "deadline", "procedure_step", "exception", "relation")
MIN_QUOTE, MAX_QUOTE = 15, 600
MAX_FACTS_PER_FRAGMENT = 8

SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "facts": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "fragment": {"type": "string", "description": "Identificador del fragmento, p. ej. F1"},
                    "kind": {"type": "string", "enum": list(KINDS)},
                    "subject": {"type": "string"},
                    "attribute": {"type": "string"},
                    "value": {"type": "string"},
                    "quote": {"type": "string"},
                },
                "required": ["fragment", "kind", "subject", "attribute", "value", "quote"],
            },
        }
    },
    "required": ["facts"],
}

SYSTEM = """Eres un extractor de datos para crear preguntas de examen a partir de un temario.
Extraes SOLO afirmaciones que el texto del fragmento dice de forma explícita. Nunca añades
conocimiento propio, nunca deduces, nunca completas información que falte.

Para cada hecho devuelve:
- fragment: el identificador del fragmento (F1, F2...) del que procede.
- kind: uno de
  definition (qué es algo), characteristic (rasgo o propiedad de algo),
  classification (grupo/tipo/categoría al que pertenece algo), quantity (cifra, dosis,
  porcentaje, cantidad), date (fecha o año), name (nombre propio, autor, organismo),
  requirement (requisito o condición necesaria), deadline (plazo), procedure_step (paso
  de un procedimiento, con su orden), exception (excepción a una regla),
  relation (relación explícita entre dos conceptos).
- subject: el concepto del que trata el hecho, nombrado EXACTAMENTE como aparece en el
  fragmento. Nunca un pronombre ("este", "dicho", "lo anterior"). Si el texto solo usa
  un pronombre y el nombre no aparece en el fragmento, NO extraigas ese hecho.
- attribute: frase corta y genérica de la propiedad: "dosis diaria", "definición",
  "grupo al que pertenece", "plazo de presentación", "característica", "paso siguiente a X".
  Usa el mismo atributo para datos comparables (así se pueden comparar entre sí).
- value: el dato concreto, copiado del texto. Debe aparecer literalmente dentro de quote.
- quote: copia LITERAL y CONTIGUA del fragmento (carácter a carácter, sin resumir, sin
  cambiar palabras, sin unir trozos separados), de una o dos frases, que demuestra el hecho.

No extraigas: títulos o encabezados sueltos, índices, ejemplos hipotéticos, opiniones,
referencias a figuras o tablas que no están en el texto, frases incompletas.
Máximo 8 hechos por fragmento; prioriza los más relevantes para un examen.
Si un fragmento no contiene hechos claros, no devuelvas nada para él."""


@dataclass
class ChunkForFacts:
    id: UUID
    section_id: UUID | None
    text: str
    context_header: str
    spans: list[dict[str, int]]
    previous_text: str | None = None


@dataclass
class PageRef:
    id: UUID
    text: str


@dataclass
class VerifiedFact:
    chunk_id: UUID
    section_id: UUID | None
    page_id: UUID
    page_number: int
    kind: str
    subject: str
    attribute: str
    value: str
    value_number: float | None
    unit: str | None
    slot: str
    subject_norm: str
    value_norm: str
    quote: str
    char_start: int
    char_end: int


def build_prompt(chunks: list[ChunkForFacts]) -> str:
    parts = []
    for i, ch in enumerate(chunks, start=1):
        block = f"### Fragmento F{i}\nSección: {ch.context_header or '—'}\n"
        if ch.previous_text:
            block += ("CONTEXTO PREVIO (solo para entender a qué se refiere el texto; "
                      f"NO extraigas hechos de aquí):\n{ch.previous_text[-800:]}\n---\n")
        block += f"TEXTO:\n{ch.text}"
        parts.append(block)
    return "Extrae los hechos de los siguientes fragmentos.\n\n" + "\n\n".join(parts)


def _locate_in_page(chunk: ChunkForFacts, start: int, end: int) -> tuple[int, int, int] | None:
    """Convierte offsets en el texto del fragmento a (página, inicio, fin) en la página."""
    offset = 0
    for span in chunk.spans:
        length = span["end"] - span["start"]
        if offset <= start and end <= offset + length:
            return span["page"], span["start"] + (start - offset), span["start"] + (end - offset)
        offset += length + 1   # "\n" de unión entre spans
    return None


def verify_fact(raw: dict[str, Any], chunk: ChunkForFacts, pages: dict[int, PageRef]) -> VerifiedFact | str:
    """Devuelve el hecho verificado o el motivo de rechazo."""
    kind = raw.get("kind")
    subject = (raw.get("subject") or "").strip()
    attribute = (raw.get("attribute") or "").strip()
    value = (raw.get("value") or "").strip()
    quote = (raw.get("quote") or "").strip()
    if kind not in KINDS:
        return "tipo_invalido"
    if not subject or not attribute or not value:
        return "campos_vacios"
    if not (MIN_QUOTE <= len(quote) <= MAX_QUOTE):
        return "cita_longitud"
    hit = find_folded(chunk.text, quote)
    if hit is None:
        return "cita_no_encontrada"
    located = _locate_in_page(chunk, *hit)
    if located is None:
        return "cita_cruza_paginas"
    page_number, p_start, p_end = located
    page = pages[page_number]
    canonical = page.text[p_start:p_end]
    if fold(canonical) != fold(quote):
        return "cita_no_encontrada"

    folded_quote = fold(canonical)
    value_number, unit = parse_quantity(value)
    if fold(value) not in folded_quote:
        return "valor_no_en_cita"   # el valor debe estar escrito tal cual en la cita
    if kind in ("quantity", "date") and not numbers_in(value):
        return "valor_sin_cifra"
    subject_folded = fold(subject)
    if subject_folded not in fold(chunk.text) and subject_folded not in fold(chunk.context_header):
        return "sujeto_no_en_texto"
    if norm_subject(subject) == norm_value(value):
        return "sujeto_igual_a_valor"
    if kind not in ("quantity", "date", "deadline"):
        value_number, unit = None, None   # solo los datos numéricos se agrupan por cifra y unidad

    return VerifiedFact(
        chunk_id=chunk.id, section_id=chunk.section_id, page_id=page.id, page_number=page_number,
        kind=kind, subject=subject, attribute=attribute, value=value,
        value_number=value_number, unit=unit, slot=slot_for(kind, attribute, unit),
        subject_norm=norm_subject(subject), value_norm=norm_value(value),
        quote=canonical, char_start=p_start, char_end=p_end,
    )
