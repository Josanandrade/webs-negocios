"""Robustez de los jobs: reanudación tras fallo, worker caído y reintento manual."""
from sqlalchemy import text

import app.ingestion.pipeline as pipeline
from app.ingestion.extract import extract_page as real_extract_page
from app.jobs.runner import run_one
from tests.factories import make_pdf

TEXTO = "La hipertensión arterial se diagnostica con cifras iguales o superiores a 140/90 mmHg. " * 3


def upload(client, user, n_pages=6):
    pages = [f"{TEXTO} Página {i} con contenido propio." for i in range(1, n_pages + 1)]
    r = client.post("/api/documents", headers=user["headers"],
                    files={"file": ("t.pdf", make_pdf(pages), "application/pdf")})
    return r.json()


def test_resume_after_failure_does_not_reextract_pages(client, alice, monkeypatch):
    doc = upload(client, alice)
    calls: list[int] = []
    state = {"fail": True}

    def flaky(pdf, index, **kw):
        if index == 3 and state["fail"]:
            state["fail"] = False
            raise RuntimeError("fallo simulado en la página 4")
        calls.append(index + 1)
        return real_extract_page(pdf, index, **kw)

    monkeypatch.setattr(pipeline, "extract_page", flaky)

    run_one("w1", retry_delay_seconds=0)
    job = client.get(f"/api/jobs/{doc['latest_job']['id']}", headers=alice["headers"]).json()
    assert job["status"] == "pending"                    # se reintentará
    assert "fallo simulado" in job["last_error"]
    assert calls == [1, 2, 3]

    run_one("w1", retry_delay_seconds=0)
    assert calls == [1, 2, 3, 4, 5, 6]                   # continúa en la 4, no repite 1-3
    d = client.get(f"/api/documents/{doc['id']}", headers=alice["headers"]).json()
    assert d["status"] == "ready"
    assert d["latest_job"]["status"] == "succeeded"
    assert d["latest_job"]["attempts"] == 2
    assert len(client.get(f"/api/documents/{doc['id']}/pages", headers=alice["headers"]).json()) == 6


def test_crashed_worker_lease_expires_and_another_worker_resumes(client, alice, owner_engine):
    doc = upload(client, alice)
    # Simulamos un worker que reclamó el job, extrajo 2 páginas y murió.
    with owner_engine.begin() as conn:
        conn.execute(text("select * from app.claim_job('worker-muerto', 300)"))
    assert run_one("w2") is None                         # lease vigente: nadie más lo toma
    with owner_engine.begin() as conn:
        conn.execute(text("update processing_jobs set lease_expires_at = now() - interval '1 second'"))
    assert run_one("w2", retry_delay_seconds=0) is not None
    d = client.get(f"/api/documents/{doc['id']}", headers=alice["headers"]).json()
    assert d["status"] == "ready"
    assert d["latest_job"]["status"] == "succeeded"


def test_lost_lease_stops_writing(client, alice, owner_engine, monkeypatch):
    doc = upload(client, alice)

    def steal_after_first_page(pdf, index, **kw):
        if index == 1:
            with owner_engine.begin() as conn:
                conn.execute(text("update processing_jobs set locked_by = 'otro-worker'"))
        return real_extract_page(pdf, index, **kw)

    monkeypatch.setattr(pipeline, "extract_page", steal_after_first_page)
    run_one("w3", retry_delay_seconds=0)
    with owner_engine.begin() as conn:
        status, locked_by = conn.execute(text("select status, locked_by from processing_jobs")).one()
    assert (status, locked_by) == ("running", "otro-worker")   # w3 no marca nada como terminado


def test_exhausted_crashed_job_becomes_failed_and_can_be_retried(client, alice, owner_engine):
    doc = upload(client, alice)
    with owner_engine.begin() as conn:
        conn.execute(text("update processing_jobs set status = 'running', attempts = 3, locked_by = 'muerto',"
                          " lease_expires_at = now() - interval '1 minute'"))
    assert run_one("w4") is None
    job = client.get(f"/api/jobs/{doc['latest_job']['id']}", headers=alice["headers"]).json()
    assert job["status"] == "failed"

    r = client.post(f"/api/jobs/{job['id']}/retry", headers=alice["headers"])
    assert r.status_code == 200 and r.json()["status"] == "pending"
    run_one("w4", retry_delay_seconds=0)
    d = client.get(f"/api/documents/{doc['id']}", headers=alice["headers"]).json()
    assert d["status"] == "ready"


def test_retry_only_failed_jobs_and_only_own(client, alice, bob):
    doc = upload(client, alice)
    job_id = doc["latest_job"]["id"]
    assert client.post(f"/api/jobs/{job_id}/retry", headers=alice["headers"]).status_code == 409
    assert client.post(f"/api/jobs/{job_id}/retry", headers=bob["headers"]).status_code == 404
