"""Prueba REAL contra Gemini. Solo se ejecuta si existe GEMINI_API_KEY en el entorno.

    GEMINI_API_KEY=... .venv/bin/pytest tests/test_live_gemini.py -s
"""
import os
import uuid

import pytest

from app.facts.extract import SCHEMA, SYSTEM, ChunkForFacts, PageRef, build_prompt, verify_fact
from app.llm.client import call_llm

pytestmark = pytest.mark.skipif(not os.environ.get("GEMINI_API_KEY"), reason="Sin GEMINI_API_KEY: prueba real omitida")

TEXT = ("Tema 4. Residuos sanitarios\n\nLos residuos sanitarios se clasifican en cuatro grupos. "
        "Los residuos del grupo III deben almacenarse en contenedores rígidos de color amarillo durante "
        "un máximo de 72 horas. El transporte externo lo realiza un gestor autorizado. "
        "Los residuos citotóxicos pertenecen al grupo IV.")


def test_real_fact_extraction_produces_verifiable_facts(alice):
    page = PageRef(uuid.uuid4(), TEXT)
    chunk = ChunkForFacts(uuid.uuid4(), None, TEXT, "Tema 4. Residuos sanitarios",
                          [{"page": 1, "start": 0, "end": len(TEXT)}])
    result = call_llm(task="extraction", system=SYSTEM, prompt=build_prompt([chunk]), schema=SCHEMA,
                      user_id=alice["id"])
    outcomes = [verify_fact(f, chunk, {1: page}) for f in result.data["facts"]]
    accepted = [o for o in outcomes if not isinstance(o, str)]
    print(f"\nModelo: {result.model_version} · propuestos {len(outcomes)} · aceptados {len(accepted)}")
    for o in outcomes:
        print("  ", o if isinstance(o, str) else f"{o.kind}: {o.subject} → {o.value}  «{o.quote}»")
    assert accepted, "el modelo real no produjo ningún hecho verificable"
    assert all(a.quote in TEXT for a in accepted)
