"""Ejecuta las migraciones SQL de `migrations/` en orden, una sola vez cada una.

Uso:  python -m app.migrate            (usa MIGRATIONS_DATABASE_URL)
"""
import sys
from pathlib import Path

from sqlalchemy import create_engine, text

MIGRATIONS_DIR = Path(__file__).resolve().parent.parent / "migrations"


def run_migrations(url: str) -> list[str]:
    engine = create_engine(url)
    applied: list[str] = []
    try:
        with engine.begin() as conn:
            conn.execute(text(
                "create table if not exists schema_migrations ("
                " name text primary key, applied_at timestamptz not null default now())"
            ))
            conn.execute(text("lock table schema_migrations in exclusive mode"))
            done = {r[0] for r in conn.execute(text("select name from schema_migrations"))}
            for path in sorted(MIGRATIONS_DIR.glob("*.sql")):
                if path.name in done:
                    continue
                # Sin parámetros: psycopg no interpreta los "%" del SQL.
                conn.connection.driver_connection.execute(path.read_text(encoding="utf-8"))
                conn.execute(text("insert into schema_migrations (name) values (:n)"), {"n": path.name})
                applied.append(path.name)
    finally:
        engine.dispose()
    return applied


if __name__ == "__main__":
    from app.config import get_settings

    names = run_migrations(get_settings().migrations_database_url)
    print("Migraciones aplicadas:", ", ".join(names) if names else "ninguna (al día)")
    sys.exit(0)
