from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://banco_api:banco_api@localhost:5432/banco"
    migrations_database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/banco"

    jwt_secret: str = Field(min_length=16)
    jwt_ttl_minutes: int = 60 * 12

    storage_dir: Path = Path("./data/storage")
    max_upload_mb: int = 150


@lru_cache
def get_settings() -> Settings:
    return Settings()
