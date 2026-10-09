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
