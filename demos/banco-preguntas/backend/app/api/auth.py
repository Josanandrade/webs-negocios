from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db import anonymous_session
from app.deps import current_user_id, db_session
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=256)
    display_name: str | None = Field(default=None, max_length=120)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: UUID


class MeOut(BaseModel):
    id: UUID
    email: str
    display_name: str | None


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(body: RegisterIn) -> TokenOut:
    try:
        with anonymous_session() as s:
            user_id = s.execute(
                text("select app.register_user(:e, :h, :d)"),
                {"e": body.email, "h": hash_password(body.password), "d": body.display_name},
            ).scalar_one()
    except IntegrityError:
        raise HTTPException(status.HTTP_409_CONFLICT, "Ya existe una cuenta con ese email") from None
    return TokenOut(access_token=create_access_token(user_id), user_id=user_id)


@router.post("/login", response_model=TokenOut)
def login(body: LoginIn) -> TokenOut:
    with anonymous_session() as s:
        row = s.execute(text("select id, password_hash from app.lookup_user_for_login(:e)"),
                        {"e": body.email}).first()
    if row is None or not verify_password(row.password_hash, body.password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Email o contraseña incorrectos")
    return TokenOut(access_token=create_access_token(row.id), user_id=row.id)


@router.get("/me", response_model=MeOut)
def me(user_id: UUID = Depends(current_user_id), db: Session = Depends(db_session)) -> MeOut:
    row = db.execute(text("select id, email, display_name from users where id = :id"), {"id": user_id}).one()
    return MeOut(id=row.id, email=row.email, display_name=row.display_name)
