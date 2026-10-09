"""Abstracción de proveedores de IA.

La lógica de la aplicación solo conoce `LLMProvider.generate_json`. Qué proveedor y
qué modelo se usa para cada tarea (extracción, generación, verificación) se decide por
configuración, p. ej. LLM_GENERATION="gemini:gemini-flash-lite-latest".
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Protocol

TASKS = ("extraction", "generation", "verification")


@dataclass
class LLMResult:
    data: dict[str, Any]
    model_version: str | None
    input_tokens: int
    output_tokens: int


class LLMError(RuntimeError):
    """Error no recuperable de la llamada (respuesta inválida, bloqueo, etc.)."""


class RateLimited(LLMError):
    """Límite por minuto: reintentar tras `retry_after` segundos."""

    def __init__(self, message: str, retry_after: float):
        super().__init__(message)
        self.retry_after = retry_after


class QuotaExhausted(LLMError):
    """Cuota diaria agotada: el trabajo debe pausarse hasta `resume_at`."""

    def __init__(self, message: str, resume_at: datetime):
        super().__init__(message)
        self.resume_at = resume_at


class LLMProvider(Protocol):
    name: str

    def generate_json(self, *, model: str, system: str, prompt: str, schema: dict[str, Any],
                      max_output_tokens: int) -> LLMResult: ...
