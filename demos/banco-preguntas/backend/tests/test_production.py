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


def test_database_urls_from_providers_use_psycopg3():
    from app.config import psycopg_url

    assert psycopg_url("postgresql://u:p_!@h:5432/db") == "postgresql+psycopg://u:p_!@h:5432/db"
    assert psycopg_url("postgres://u:p@h/db") == "postgresql+psycopg://u:p@h/db"
    assert psycopg_url("postgresql+psycopg://u:p@h/db") == "postgresql+psycopg://u:p@h/db"


def test_bootstrap_creates_the_restricted_api_role(database, monkeypatch):
    import os

    from sqlalchemy import create_engine

    from app.bootstrap import bootstrap

    owner = os.environ["MIGRATIONS_DATABASE_URL"].replace("postgresql+psycopg://", "postgresql://")
    api = owner.replace(owner.split("//")[1].split("@")[0], "banco_boot.proyecto:Clave_Larga_42!")
    monkeypatch.setenv("MIGRATIONS_DATABASE_URL", owner)
    monkeypatch.setenv("DATABASE_URL", api)
    bootstrap()
    bootstrap()                                              # idempotente
    with database.connect() as conn:
        role = conn.execute(text("select rolbypassrls, rolsuper, pg_has_role('banco_boot', 'banco_app', 'member')"
                                 " from pg_roles where rolname = 'banco_boot'")).one()
    assert tuple(role) == (False, False, True)
    eng = create_engine(api.replace("postgresql://", "postgresql+psycopg://").replace("banco_boot.proyecto", "banco_boot"))
    with eng.connect() as conn:                              # puede entrar con su contraseña
        assert conn.execute(text("select current_user")).scalar_one() == "banco_boot"
    eng.dispose()
    with database.begin() as conn:
        db = conn.execute(text("select quote_ident(current_database())")).scalar_one()
        conn.execute(text(f"revoke connect on database {db} from banco_boot"))
        conn.execute(text("drop role banco_boot"))
