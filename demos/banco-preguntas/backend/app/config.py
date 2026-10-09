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

    # IA: "proveedor:modelo" por tarea. Por defecto, plan gratuito de Gemini. Las tareas
    # usan modelos distintos: cada modelo tiene su propia cuota diaria gratuita y el
    # verificador no es el mismo modelo que redacta.
    llm_extraction: str = "gemini:gemini-flash-lite-latest"
    llm_generation: str = "gemini:gemini-flash-lite-latest"
    llm_verification: str = "gemini:gemini-flash-latest"
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
