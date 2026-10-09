"""Instrucciones para la IA: redacción del enunciado (generador) y verificación independiente.

El generador NO escribe las opciones: las opciones son valores literales del documento
(el dato correcto y distractores del catálogo). Solo redacta el enunciado y elige qué 3
distractores encajan mejor. El verificador no sabe cuál es la correcta.
"""
from dataclasses import dataclass
from typing import Any

GEN_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "items": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "item": {"type": "string"},
                    "skip": {"type": "boolean"},
                    "skip_reason": {"type": "string"},
                    "stem": {"type": "string"},
                    "distractor_ids": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["item", "skip", "skip_reason", "stem", "distractor_ids"],
            },
        }
    },
    "required": ["items"],
}

GEN_SYSTEM = """Redactas enunciados de preguntas tipo test a partir de un dato EXACTO de un temario.

Para cada ítem recibes: el dato (sujeto, atributo, respuesta correcta), la cita literal del
temario que lo demuestra, contexto, y una lista de posibles respuestas incorrectas (D1, D2...)
que también proceden del temario.

Tu tarea:
1. Escribe UN enunciado en español cuya única respuesta correcta sea exactamente la respuesta
   correcta indicada, y que pueda responderse solo con la cita.
2. Elige exactamente 3 ids de respuestas incorrectas de la lista, las que mejor encajen
   gramatical y temáticamente como alternativas plausibles. No inventes otras.
3. Si no es posible hacer una buena pregunta (el dato es trivial, ambiguo, depende de una
   interpretación, es solo un título, o no hay 3 alternativas que encajen), pon skip=true
   y explica el motivo en skip_reason. Es preferible omitir a hacer una pregunta dudosa.

Reglas del enunciado:
- Nombra el sujeto explícitamente, tal como aparece en el dato. Nunca uses "este", "dicho",
  "lo anterior", "el mencionado".
- No escribas "según el documento", "según el texto" ni fórmulas similares.
- No incluyas la respuesta ni ninguna de las alternativas dentro del enunciado.
- No añadas datos, cifras, nombres o términos que no estén en la cita o en el contexto.
- Termina con signo de interrogación (o con dos puntos si es una frase para completar).
- Formas habituales: "¿Cuál es la dosis de X?", "¿Cuál de las siguientes opciones define
  correctamente X?", "¿A qué grupo pertenece X?", "¿Cuál de las siguientes es una
  característica de X?", "¿Cuál es el plazo para X?", "¿Qué paso sigue a X?".
- Varía la redacción; no empieces todas igual."""

VER_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "items": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "item": {"type": "string"},
                    "answer": {"type": "string", "enum": ["A", "B", "C", "D", "NINGUNA", "VARIAS"]},
                    "answerable_from_evidence": {"type": "boolean"},
                    "single_correct": {"type": "boolean"},
                    "correct_explicitly_supported": {"type": "boolean"},
                    "distractors_are_incorrect": {"type": "boolean"},
                    "distractors_from_evidence": {"type": "boolean"},
                    "ambiguous": {"type": "boolean"},
                    "two_could_be_correct": {"type": "boolean"},
                    "subjective": {"type": "boolean"},
                    "needs_external_knowledge": {"type": "boolean"},
                    "clear_wording": {"type": "boolean"},
                    "page_reference_correct": {"type": "boolean"},
                    "confidence": {"type": "number"},
                    "issues": {"type": "string"},
                },
                "required": ["item", "answer", "answerable_from_evidence", "single_correct",
                             "correct_explicitly_supported", "distractors_are_incorrect", "distractors_from_evidence",
                             "ambiguous", "two_could_be_correct", "subjective", "needs_external_knowledge",
                             "clear_wording", "page_reference_correct", "confidence", "issues"],
            },
        }
    },
    "required": ["items"],
}

VER_SYSTEM = """Eres un revisor independiente y muy estricto de preguntas tipo test.
Solo puedes usar las EVIDENCIAS proporcionadas (fragmentos literales de un temario, con su
página). Ignora lo que sepas por tu cuenta: si algo no está en las evidencias, no cuenta.

Para cada pregunta:
1. Resuélvela tú mismo usando solo las evidencias: answer = la letra correcta, "NINGUNA" si
   ninguna opción está respaldada, o "VARIAS" si más de una podría ser correcta.
2. Responde con rigor:
   - answerable_from_evidence: ¿se puede responder únicamente con las evidencias?
   - single_correct: ¿hay una y solo una opción correcta?
   - correct_explicitly_supported: ¿la opción correcta está dicha explícitamente en una evidencia?
   - distractors_are_incorrect: ¿las otras tres opciones son realmente incorrectas para ESTA pregunta?
   - distractors_from_evidence: ¿las opciones incorrectas aparecen en las evidencias (aunque referidas a otra cosa)?
   - ambiguous: ¿el enunciado o las opciones admiten más de una lectura?
   - two_could_be_correct: ¿podrían considerarse correctas dos opciones?
   - subjective: ¿depende de una interpretación u opinión?
   - needs_external_knowledge: ¿hace falta información que no está en las evidencias?
   - clear_wording: ¿la redacción es clara y correcta en español?
   - page_reference_correct: ¿la página indicada como fuente de la respuesta contiene de verdad la evidencia que la justifica?
   - confidence: tu seguridad global (0 a 1) de que la pregunta es correcta y no ambigua.
   - issues: problemas detectados (vacío si no hay).
Ante cualquier duda, marca el problema: es preferible rechazar una pregunta buena que
aceptar una dudosa."""


@dataclass
class GenItem:
    ref: str
    subject: str
    attribute: str
    correct: str
    quote: str
    context_header: str
    context: str
    candidates: list[tuple[str, str]]   # (id, valor)
    kind: str


def build_gen_prompt(items: list[GenItem]) -> str:
    blocks = []
    for it in items:
        cands = "\n".join(f"  {cid}: {value}" for cid, value in it.candidates)
        blocks.append(
            f"### Ítem {it.ref}\nTipo de dato: {it.kind}\nSección: {it.context_header}\n"
            f"Sujeto: {it.subject}\nAtributo: {it.attribute}\nRespuesta correcta: {it.correct}\n"
            f"Cita literal: «{it.quote}»\nContexto:\n{it.context}\n"
            f"Posibles respuestas incorrectas:\n{cands}")
    return "Redacta los enunciados de estos ítems.\n\n" + "\n\n".join(blocks)


@dataclass
class VerItem:
    ref: str
    stem: str
    options: list[tuple[str, str]]          # (letra, texto)
    answer_page: int
    evidences: list[tuple[int, str]]        # (página, texto) — sin indicar cuál es la correcta


def build_ver_prompt(items: list[VerItem]) -> str:
    blocks = []
    for it in items:
        opts = "\n".join(f"  {label}) {txt}" for label, txt in it.options)
        evid = "\n".join(f"  [E{i} · página {page}] {txt}" for i, (page, txt) in enumerate(it.evidences, start=1))
        blocks.append(f"### Pregunta {it.ref}\n{it.stem}\n{opts}\n"
                      f"Página indicada como fuente de la respuesta: {it.answer_page}\nEVIDENCIAS:\n{evid}")
    return "Revisa estas preguntas.\n\n" + "\n\n".join(blocks)


def verification_passes(v: dict[str, Any], expected_label: str, min_confidence: float) -> list[str]:
    """Traduce el informe del verificador en motivos de rechazo (vacío = aprobada)."""
    reasons = []
    if v.get("answer") != expected_label:
        reasons.append(f"verificador_respondio_{v.get('answer')}")
    must_true = ["answerable_from_evidence", "single_correct", "correct_explicitly_supported",
                 "distractors_are_incorrect", "distractors_from_evidence", "clear_wording", "page_reference_correct"]
    must_false = ["ambiguous", "two_could_be_correct", "subjective", "needs_external_knowledge"]
    reasons += [f"falla_{k}" for k in must_true if v.get(k) is not True]
    reasons += [f"falla_{k}" for k in must_false if v.get(k) is not False]
    try:
        confidence = float(v.get("confidence", 0))
    except (TypeError, ValueError):
        confidence = 0.0
    if confidence < min_confidence:
        reasons.append("confianza_insuficiente")
    return reasons
