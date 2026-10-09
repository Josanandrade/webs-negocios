from functools import lru_cache
from pathlib import Path

import re

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def psycopg_url(url: str) -> str:
    """Acepta "postgresql://" o "postgres://" (como los da Supabase o Railway) y usa psycopg 3."""
    return re.sub(r"^postgres(ql)?://", "postgresql+psycopg://", url)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://banco_api:banco_api@localhost:5432/banco"
    migrations_database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/banco"

    @field_validator("database_url", "migrations_database_url")
    @classmethod
    def _psycopg_driver(cls, url: str) -> str:
        return psycopg_url(url)

    jwt_secret: str = Field(min_length=16)
    jwt_ttl_minutes: int = 60 * 12

    # Orígenes de la web autorizados a llamar a la API (separados por comas).
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Producción en un solo servicio: el worker corre dentro del proceso de la API y la API
    # sirve también la web compilada (misma dirección, sin CORS).
    run_worker: bool = False
    web_dir: Path | None = None

    storage_dir: Path = Path("./data/storage")
    max_upload_mb: int = 150

    # IA: "proveedor:modelo" por tarea. Por defecto, plan gratuito de Gemini. Las tareas
    # usan modelos distintos: cada modelo tiene su propia cuota diaria gratuita y el
    # verificador no es el mismo modelo que redacta. Tras la coma, modelos de reserva para
    # cuando el principal está saturado (503) o sin cuota.
    llm_extraction: str = "gemini:gemini-flash-lite-latest,gemini:gemini-3.1-flash-lite"
    llm_generation: str = "gemini:gemini-flash-lite-latest,gemini:gemini-3.1-flash-lite"
    llm_verification: str = "gemini:gemini-flash-latest,gemini:gemini-3.6-flash,gemini:gemini-3.5-flash,gemini:gemini-3-flash-preview,gemini:gemini-3.7-flash"
    llm_requests_per_minute: int = 8          # por modelo; por debajo del límite gratuito
    llm_max_retries: int = 6
    gemini_api_key: str = ""
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    ollama_base_url: str = "http://localhost:11434/v1"


@lru_cache
def get_settings() -> Settings:
    return Settings()
