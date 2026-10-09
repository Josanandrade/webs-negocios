from collections.abc import Iterator
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.db import user_session
from app.security import decode_access_token

_bearer = HTTPBearer(auto_error=False)


def current_user_id(creds: HTTPAuthorizationCredentials | None = Depends(_bearer)) -> UUID:
    user_id = decode_access_token(creds.credentials) if creds else None
    if user_id is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "No autenticado",
                            headers={"WWW-Authenticate": "Bearer"})
    return user_id


def db_session(user_id: UUID = Depends(current_user_id)) -> Iterator[Session]:
    """Sesión con RLS del usuario autenticado; COMMIT al terminar la petición."""
    with user_session(user_id) as session:
        exists = session.execute(text("select 1 from users where id = :id"), {"id": user_id}).first()
        if not exists:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Usuario no válido")
        yield session
