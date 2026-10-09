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


def test_real_end_to_end_generation(client, alice):
    """Documento real -> hechos -> preguntas con Gemini (generador y verificador reales)."""
    from app.jobs.runner import run_one
    from tests.factories import make_structured_pdf

    meds = [("Amoxicilina", "500 mg cada 8 horas"), ("Ibuprofeno", "400 mg cada 6 horas"),
            ("Paracetamol", "1 g cada 8 horas"), ("Omeprazol", "20 mg cada 24 horas"),
            ("Metformina", "850 mg cada 12 horas")]
    body = " ".join(f"La dosis habitual de {m} en adultos es de {d}." for m, d in meds)
    data = make_structured_pdf([[("h1", "Tema 1. Posología"), ("p", body + " " + body)]])
    doc = client.post("/api/documents", headers=alice["headers"], files={"file": ("p.pdf", data, "application/pdf")}).json()
    while run_one("w", retry_delay_seconds=0):
        pass
    job = client.post(f"/api/documents/{doc['id']}/generate", json={"count": 3}, headers=alice["headers"]).json()
    while run_one("w", retry_delay_seconds=0):
        pass
    job = client.get(f"/api/jobs/{job['id']}", headers=alice["headers"]).json()
    print("\n", job["message"])
    print(client.get(f"/api/jobs/{job['id']}/candidates", headers=alice["headers"]).json())
    for q in client.get("/api/questions", params={"document_id": doc["id"]}, headers=alice["headers"]).json():
        print(q["stem"], [(o["label"], o["text"], o["is_correct"]) for o in q["options"]])
    assert job["status"] == "succeeded"
