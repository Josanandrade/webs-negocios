"""Proveedor de IA DE PRUEBA (solo para tests). Responde de forma determinista leyendo
los fragmentos del prompt, e incluye a propósito errores típicos de un modelo real
(citas parafraseadas, sujetos inventados) para comprobar que el código los rechaza."""
import re
from collections.abc import Callable
from typing import Any

from app.llm.base import LLMResult

DOSE = re.compile(r"El\s+medicamento\s+(\w+)\s+se\s+administra\s+a\s+una\s+dosis\s+de\s+(\d+\s+mg)[^.]*\.")


class ScriptedProvider:
    name = "scripted"

    def __init__(self, behaviour: Callable[[str], dict[str, Any]] | None = None):
        self.calls: list[str] = []
        self.behaviour = behaviour or dose_extractor

    def generate_json(self, *, model, system, prompt, schema, max_output_tokens) -> LLMResult:
        self.calls.append(prompt)
        return LLMResult(self.behaviour(prompt), f"{model}-test", len(prompt) // 4, 50)


def fragments(prompt: str) -> list[tuple[str, str]]:
    parts = re.split(r"### Fragmento (F\d+)\n", prompt)[1:]
    return [(parts[i], parts[i + 1].split("TEXTO:\n", 1)[1]) for i in range(0, len(parts), 2)]


def dose_extractor(prompt: str) -> dict[str, Any]:
    facts = []
    for ref, body in fragments(prompt):
        seen = set()
        for m in DOSE.finditer(body):
            if m.group(1) in seen:
                continue
            seen.add(m.group(1))
            facts.append({"fragment": ref, "kind": "quantity", "subject": f"medicamento {m.group(1)}",
                          "attribute": "dosis", "value": re.sub(r"\s+", " ", m.group(2)),
                          "quote": m.group(0).strip()})
        if "medicamento" in body:
            # Errores que un modelo real puede cometer y el código debe rechazar:
            facts.append({"fragment": ref, "kind": "quantity", "subject": "medicamento Zeta",
                          "attribute": "dosis", "value": "77 mg",
                          "quote": "El medicamento Zeta se administra a una dosis de 77 mg."})
            facts.append({"fragment": ref, "kind": "quantity", "subject": "medicamento Alfa",
                          "attribute": "dosis", "value": "20 mg",
                          "quote": "La dosis de Alfa es de veinte miligramos diarios."})
            first = DOSE.search(body)
            if first:   # cita real pero atribuida a un sujeto que no aparece en el texto
                facts.append({"fragment": ref, "kind": "quantity", "subject": "medicamento Omega",
                              "attribute": "dosis", "value": re.sub(r"\s+", " ", first.group(2)),
                              "quote": first.group(0).strip()})
    return {"facts": facts}


# ---------------------------------------------------------------- generación
def gen_items(prompt: str) -> list[dict[str, str]]:
    items = []
    for block in re.split(r"### Ítem ", prompt)[1:]:
        ref = block.split("\n", 1)[0].strip()
        get = lambda key: re.search(rf"^{key}: (.*)$", block, re.M).group(1).strip()  # noqa: E731
        cands = re.findall(r"^  (D\d+): (.*)$", block, re.M)
        items.append({"ref": ref, "subject": get("Sujeto"), "attribute": get("Atributo"), "candidates": cands})
    return items


def honest_generator(prompt: str, stem_template: str = "¿Cuál es la {attribute} del {subject}?") -> dict[str, Any]:
    return {"items": [{"item": it["ref"], "skip": False, "skip_reason": "",
                       "stem": stem_template.format(**it),
                       "distractor_ids": [c[0] for c in it["candidates"][:3]]} for it in gen_items(prompt)]}


def ver_items(prompt: str) -> list[dict[str, Any]]:
    items = []
    for block in re.split(r"### Pregunta ", prompt)[1:]:
        ref = block.split("\n", 1)[0].strip()
        options = re.findall(r"^  ([ABCD])\) (.*)$", block, re.M)
        evidences = [re.sub(r"\s+", " ", e) for e in re.findall(r"\[E\d+ · página \d+\] (.*?)(?=\n  \[E|\Z)", block, re.S)]
        stem = block.split("\n")[1]
        items.append({"ref": ref, "stem": stem, "options": options, "evidences": evidences})
    return items


def honest_verifier(prompt: str) -> dict[str, Any]:
    """Revisor simulado: da por buena la opción que aparece en una evidencia junto al sujeto."""
    out = []
    for it in ver_items(prompt):
        subject = re.search(r"medicamento (\w+)", it["stem"]).group(1)
        hits = [label for label, txt in it["options"]
                if any(re.search(rf"medicamento {subject}\b[^.]*\b{re.escape(txt)}", e, re.I) for e in it["evidences"])]
        answer = hits[0] if len(hits) == 1 else ("VARIAS" if hits else "NINGUNA")
        ok = len(hits) == 1
        out.append({"item": it["ref"], "answer": answer, "answerable_from_evidence": ok, "single_correct": ok,
                    "correct_explicitly_supported": ok, "distractors_are_incorrect": ok,
                    "distractors_from_evidence": True, "distractors_plausible": True, "ambiguous": not ok,
                    "two_could_be_correct": len(hits) > 1,
                    "subjective": False, "needs_external_knowledge": False, "clear_wording": True,
                    "page_reference_correct": True, "confidence": 0.95 if ok else 0.3, "issues": ""})
    return {"items": out}
