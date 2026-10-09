"""Infraestructura de tests: base de datos Postgres REAL y efímera por sesión de tests.

Requiere un Postgres accesible con un usuario administrador (por defecto
postgres:postgres@localhost:5432). Se crea una base de datos nueva, se aplican las
migraciones como propietario y la aplicación se conecta con el rol restringido
`banco_api` (sin BYPASSRLS), igual que en producción.
"""
import os
import tempfile
import uuid
from pathlib import Path

import pytest
from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url

ADMIN_URL = os.environ.get("TEST_ADMIN_DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/postgres")
APP_ROLE, APP_PASSWORD = "banco_api", "banco_api"
TEST_DB = f"banco_test_{uuid.uuid4().hex[:10]}"
STORAGE_TMP = tempfile.mkdtemp(prefix="banco_storage_")

_db_url = make_url(ADMIN_URL).set(database=TEST_DB)
os.environ["DATABASE_URL"] = _db_url.set(username=APP_ROLE, password=APP_PASSWORD).render_as_string(hide_password=False)
os.environ["MIGRATIONS_DATABASE_URL"] = _db_url.render_as_string(hide_password=False)
os.environ["JWT_SECRET"] = "secreto-de-tests-suficientemente-largo"
os.environ["STORAGE_DIR"] = STORAGE_TMP


@pytest.fixture(scope="session", autouse=True)
def database():
    admin = create_engine(ADMIN_URL, isolation_level="AUTOCOMMIT")
    with admin.connect() as conn:
        conn.execute(text(f'create database "{TEST_DB}"'))
        conn.execute(text(
            "do $$ begin if not exists (select 1 from pg_roles where rolname = 'banco_api') then "
            f"create role banco_api login password '{APP_PASSWORD}' nosuperuser nobypassrls; end if; end $$"
        ))
    from app.migrate import run_migrations

    run_migrations(os.environ["MIGRATIONS_DATABASE_URL"])
    owner = create_engine(os.environ["MIGRATIONS_DATABASE_URL"])
    with owner.begin() as conn:
        conn.execute(text("grant banco_app to banco_api"))
        conn.execute(text(f'grant connect on database "{TEST_DB}" to banco_api'))
    yield owner
    from app.db import get_engine

    get_engine().dispose()
    owner.dispose()
    with admin.connect() as conn:
        conn.execute(text(f'drop database if exists "{TEST_DB}" with (force)'))
    admin.dispose()


@pytest.fixture(autouse=True)
def clean_tables(database):
    yield
    with database.begin() as conn:
        conn.execute(text("truncate users, documents, processing_jobs, quizzes cascade"))


@pytest.fixture
def owner_engine(database):
    return database


@pytest.fixture
def app_engine():
    from app.db import get_engine

    return get_engine()


@pytest.fixture
def storage_dir() -> Path:
    return Path(STORAGE_TMP)


@pytest.fixture
def client():
    from fastapi.testclient import TestClient

    from app.main import app

    with TestClient(app) as c:
        yield c


def _register(client, email: str) -> dict:
    r = client.post("/api/auth/register", json={"email": email, "password": "contraseña-segura"})
    assert r.status_code == 201, r.text
    data = r.json()
    return {"id": uuid.UUID(data["user_id"]), "headers": {"Authorization": f"Bearer {data['access_token']}"}}


@pytest.fixture
def alice(client):
    return _register(client, "alice@example.com")


@pytest.fixture
def bob(client):
    return _register(client, "bob@example.com")
