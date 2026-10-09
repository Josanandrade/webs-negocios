"""Modo producción en un solo servicio: la API sirve la web y ejecuta el worker en un hilo."""
import importlib
import threading
import time

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text


@pytest.fixture
def web_app(tmp_path, monkeypatch):
    (tmp_path / "assets").mkdir()
    (tmp_path / "index.html").write_text("<html>app</html>")
    (tmp_path / "assets" / "app-123.js").write_text("console.log(1)")
    (tmp_path / "sw.js").write_text("// sw")
    (tmp_path.parent / "secreto.txt").write_text("no")
    monkeypatch.setenv("WEB_DIR", str(tmp_path))
    from app.config import get_settings

    get_settings.cache_clear()
    import app.main

    module = importlib.reload(app.main)
    yield TestClient(module.app)
    monkeypatch.delenv("WEB_DIR")
    get_settings.cache_clear()
    importlib.reload(app.main)


def test_api_serves_the_web_with_spa_fallback(web_app):
    r = web_app.get("/tests/123")                                   # ruta de la app → index.html
    assert r.status_code == 200 and "app" in r.text and r.headers["cache-control"] == "no-cache"
    js = web_app.get("/assets/app-123.js")
    assert "immutable" in js.headers["cache-control"]
    assert web_app.get("/sw.js").headers["cache-control"] == "no-cache"
    assert web_app.get("/api/health").json() == {"status": "ok"}     # la API no queda tapada
    assert web_app.get("/api/no-existe").status_code == 404
    assert web_app.get("/%2e%2e/secreto.txt").text != "no"           # no se sale de la carpeta


def test_worker_thread_processes_jobs_and_stops(client, alice):
    from app.jobs.runner import run_forever
    from tests.factories import make_structured_pdf

    data = make_structured_pdf([[("h1", "Tema 1. Prueba"), ("p", "El plazo general es de diez días hábiles. " * 20)]])
    doc = client.post("/api/documents", headers=alice["headers"], files={"file": ("p.pdf", data, "application/pdf")}).json()
    stop = threading.Event()
    worker = threading.Thread(target=run_forever, kwargs={"poll_seconds": 0.1, "stop": stop}, daemon=True)
    worker.start()
    deadline = time.time() + 30
    status = None
    while time.time() < deadline and status != "ready":
        status = client.get(f"/api/documents/{doc['id']}", headers=alice["headers"]).json()["status"]
        time.sleep(0.2)
    stop.set()
    worker.join(timeout=5)
    assert status == "ready"
    assert not worker.is_alive()
