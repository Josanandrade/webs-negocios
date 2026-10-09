"""Job de extracción de hechos: solo se guardan hechos verificados; cuotas y reanudación."""
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import text

from app.db import user_session
from app.jobs.runner import run_one
from app.llm.base import QuotaExhausted
from app.llm.client import clear_overrides, override_task
from tests.factories import make_structured_pdf
from tests.fakes import ScriptedProvider, dose_extractor

MEDS = [("Alfa", 20), ("Beta", 40), ("Gamma", 10), ("Delta", 5)]


def tema(n: int, meds) -> list[tuple[str, str]]:
    body = " ".join(f"El medicamento {m} se administra a una dosis de {d} mg en pacientes adultos." for m, d in meds)
    return [("h1", f"Tema {n}. Farmacología {n}"), ("p", (body + " ") * 3)]


@pytest.fixture
def ready_doc(client, alice, monkeypatch):
    monkeypatch.setattr("app.llm.client._pace", lambda key: None)
    data = make_structured_pdf([tema(1, MEDS[:2]), tema(2, MEDS[2:])])
    doc = client.post("/api/documents", headers=alice["headers"],
                      files={"file": ("f.pdf", data, "application/pdf")}).json()
    while run_one("w", retry_delay_seconds=0):
        pass
    yield doc
    clear_overrides()


def drain():
    while run_one("w", retry_delay_seconds=0):
        pass


def test_only_verified_facts_are_stored(client, alice, ready_doc):
    provider = ScriptedProvider()
    override_task("extraction", provider, "fake-model")
    r = client.post(f"/api/documents/{ready_doc['id']}/facts/extract", json={}, headers=alice["headers"])
    assert r.status_code == 202
    drain()
    job = client.get(f"/api/jobs/{r.json()['id']}", headers=alice["headers"]).json()
    assert job["status"] == "succeeded"

    facts = client.get(f"/api/documents/{ready_doc['id']}/facts", headers=alice["headers"]).json()
    assert sorted((f["subject"], f["value"]) for f in facts) == sorted(
        (f"medicamento {m}", f"{d} mg") for m, d in MEDS)
    for f in facts:   # la cita guardada es texto real de la página indicada
        page = client.get(f"/api/documents/{ready_doc['id']}/pages/{f['page_number']}", headers=alice["headers"]).json()
        assert f["quote"] in page["text"]
    stats = client.get(f"/api/documents/{ready_doc['id']}", headers=alice["headers"]).json()["stats"]
    assert stats["facts"] == 4, stats
    assert stats["facts_extraction"]["rechazo_cita_no_encontrada"] >= 1    # cita parafraseada
    assert stats["facts_extraction"]["rechazo_sujeto_no_en_texto"] >= 1     # "medicamento Zeta" inventado
    with user_session(alice["id"]) as s:
        assert s.execute(text("select count(*) from llm_calls where task = 'extraction' and ok")).scalar_one() == len(provider.calls)


def test_extraction_limited_to_selected_sections(client, alice, ready_doc):
    override_task("extraction", ScriptedProvider(), "fake-model")
    tree = client.get(f"/api/documents/{ready_doc['id']}/sections", headers=alice["headers"]).json()
    tema2 = [s for s in tree if s["title"].startswith("Tema 2")][0]
    client.post(f"/api/documents/{ready_doc['id']}/facts/extract", json={"section_ids": [tema2["id"]]},
                headers=alice["headers"])
    drain()
    facts = client.get(f"/api/documents/{ready_doc['id']}/facts", headers=alice["headers"]).json()
    assert sorted(f["subject"] for f in facts) == ["medicamento Delta", "medicamento Gamma"]


def test_daily_quota_pauses_job_and_resumes_without_repeating(client, alice, ready_doc, owner_engine):
    state = {"calls": 0}

    def behaviour(prompt):
        state["calls"] += 1
        if state["calls"] == 2:
            raise QuotaExhausted("Cuota diaria gratuita de Gemini agotada",
                                 datetime.now(timezone.utc) + timedelta(hours=5))
        return dose_extractor(prompt)

    provider = ScriptedProvider(behaviour)
    override_task("extraction", provider, "fake-model")
    from app.facts import pipeline
    pipeline.BATCH_CHARS, old = 10, pipeline.BATCH_CHARS     # un fragmento por llamada
    try:
        job_id = client.post(f"/api/documents/{ready_doc['id']}/facts/extract", json={},
                             headers=alice["headers"]).json()["id"]
        drain()
        job = client.get(f"/api/jobs/{job_id}", headers=alice["headers"]).json()
        assert job["status"] == "pending" and "En pausa" in job["message"]
        assert job["attempts"] == 0                                   # la pausa no gasta intentos
        prompts_before = list(provider.calls)

        with owner_engine.begin() as conn:                           # "llega" el día siguiente
            conn.execute(text("update processing_jobs set run_after = now()"))
        drain()
        job = client.get(f"/api/jobs/{job_id}", headers=alice["headers"]).json()
        assert job["status"] == "succeeded"
        assert provider.calls[len(prompts_before)] != prompts_before[0]   # no repite el primer lote
        assert len(client.get(f"/api/documents/{ready_doc['id']}/facts", headers=alice["headers"]).json()) == 4
    finally:
        pipeline.BATCH_CHARS = old


def test_extraction_requires_ready_document_and_no_duplicate_jobs(client, alice, ready_doc, bob):
    override_task("extraction", ScriptedProvider(), "fake-model")
    first = client.post(f"/api/documents/{ready_doc['id']}/facts/extract", json={}, headers=alice["headers"])
    second = client.post(f"/api/documents/{ready_doc['id']}/facts/extract", json={}, headers=alice["headers"])
    assert first.status_code == 202 and second.status_code == 409
    assert client.post(f"/api/documents/{ready_doc['id']}/facts/extract", json={},
                       headers=bob["headers"]).status_code == 404
    assert client.get(f"/api/documents/{ready_doc['id']}/facts", headers=bob["headers"]).status_code == 404
    bad = client.post(f"/api/documents/{ready_doc['id']}/facts/extract",
                      json={"section_ids": ["00000000-0000-0000-0000-000000000000"]}, headers=alice["headers"])
    assert bad.status_code in (409, 422)
