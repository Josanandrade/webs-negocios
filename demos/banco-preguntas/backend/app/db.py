"""Acceso a base de datos.

Toda operación con datos de usuario se hace dentro de `user_session`, que fija
`app.user_id` para la transacción: las políticas RLS de Postgres filtran con él.
"""
from collections.abc import Iterator
from contextlib import contextmanager
from functools import lru_cache
from uuid import UUID

from sqlalchemy import Engine, create_engine, text
from sqlalchemy.orm import Session

from app.config import get_settings


@lru_cache
def get_engine() -> Engine:
    return create_engine(get_settings().database_url, pool_pre_ping=True)


def set_rls_user(session: Session, user_id: UUID | None) -> None:
    session.execute(
        text("select set_config('app.user_id', :uid, true)"),
        {"uid": str(user_id) if user_id else ""},
    )


@contextmanager
def user_session(user_id: UUID, engine: Engine | None = None) -> Iterator[Session]:
    """Transacción con RLS activa para `user_id`. Hace COMMIT al salir sin errores."""
    with Session(engine or get_engine()) as session, session.begin():
        set_rls_user(session, user_id)
        yield session


@contextmanager
def anonymous_session(engine: Engine | None = None) -> Iterator[Session]:
    """Transacción sin usuario: RLS no devuelve filas; solo sirve para funciones de app.*"""
    with Session(engine or get_engine()) as session, session.begin():
        set_rls_user(session, None)
        yield session
