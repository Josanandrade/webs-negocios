"""Arranque en producción (idempotente):  python -m app.bootstrap

Si hay MIGRATIONS_DATABASE_URL (conexión del propietario del esquema):
  1. aplica las migraciones pendientes;
  2. crea, si no existe, el rol con el que se conecta la API (el usuario y la contraseña de
     DATABASE_URL), sin BYPASSRLS y miembro de banco_app, y le da acceso a la base de datos.
Sin MIGRATIONS_DATABASE_URL no hace nada (la base de datos se prepara aparte).
"""
import os
import sys

from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url

from app.config import psycopg_url
from app.migrate import run_migrations


def bootstrap() -> None:
    owner_url = psycopg_url(os.environ.get("MIGRATIONS_DATABASE_URL", ""))
    if not owner_url:
        print("bootstrap: sin MIGRATIONS_DATABASE_URL, no se toca la base de datos")
        return
    applied = run_migrations(owner_url)
    print("bootstrap: migraciones aplicadas:", ", ".join(applied) or "ninguna (al día)")

    api = make_url(psycopg_url(os.environ["DATABASE_URL"]))
    role = (api.username or "").split(".")[0]          # "rol.proyecto" en el pooler de Supabase
    if not role or not api.password:
        sys.exit("bootstrap: DATABASE_URL debe incluir usuario y contraseña")
    owner = create_engine(owner_url)
    try:
        with owner.begin() as conn:
            exists = conn.execute(text("select 1 from pg_roles where rolname = :r"), {"r": role}).first()
            quoted = conn.execute(text("select quote_ident(:r), quote_literal(:p)"), {"r": role, "p": api.password}).one()
            if not exists:
                conn.execute(text(f"create role {quoted[0]} login password {quoted[1]} nosuperuser nobypassrls"))
                print(f"bootstrap: creado el rol {role}")
            conn.execute(text(f"grant banco_app to {quoted[0]}"))
            db = conn.execute(text("select quote_ident(current_database())")).scalar_one()
            conn.execute(text(f"grant connect on database {db} to {quoted[0]}"))
    finally:
        owner.dispose()


if __name__ == "__main__":
    bootstrap()
