"""Punto único de llamada a la IA: elige proveedor por tarea, respeta límites de ritmo,
reintenta errores transitorios y registra cada llamada (tokens, coste, latencia).

Cada tarea admite una cadena de modelos de reserva separados por comas, p. ej.
LLM_VERIFICATION="gemini:gemini-flash-latest,gemini:gemini-2.5-flash": si un modelo está
saturado (503), limitado por minuto (429) o sin cuota diaria, se prueba el siguiente."""
import dataclasses
import threading
import time
from dataclasses import dataclass
from typing import Any
from uuid import UUID

from sqlalchemy import Engine, text

from app.config import get_settings
from app.db import user_session
from app.llm.base import TASKS, LLMError, LLMProvider, LLMResult, ModelUnavailable, QuotaExhausted, RateLimited

# Precio orientativo por millón de tokens (entrada, salida). Plan gratuito = 0.
PRICES_USD_PER_MTOK: dict[tuple[str, str], tuple[float, float]] = {}

_overrides: dict[str, list[tuple[LLMProvider, str]]] = {}
_providers: dict[str, LLMProvider] = {}
_lock = threading.Lock()
_last_call: dict[str, float] = {}


@dataclass
class TaskModel:
    provider: LLMProvider
    model: str

    @property
    def spec(self) -> str:
        return f"{self.provider.name}:{self.model}"


def _build_provider(name: str) -> LLMProvider:
    s = get_settings()
    if name == "gemini":
        from app.llm.gemini import GeminiProvider

        return GeminiProvider(s.gemini_api_key)
    if name == "anthropic":
        from app.llm.anthropic_provider import AnthropicProvider

        return AnthropicProvider(s.anthropic_api_key or None)
    if name in ("openai", "ollama"):
        from app.llm.openai_compat import OpenAICompatibleProvider

        if name == "openai":
            return OpenAICompatibleProvider("openai", s.openai_base_url, s.openai_api_key)
        return OpenAICompatibleProvider("ollama", s.ollama_base_url, None)
    raise LLMError(f"Proveedor de IA desconocido: {name}")


def _parse_chain(task: str) -> list[tuple[str, str]]:
    raw = getattr(get_settings(), f"llm_{task}")
    chain = []
    for spec in (p.strip() for p in raw.split(",") if p.strip()):
        name, _, model = spec.partition(":")
        if not model:
            raise LLMError(f"Configuración LLM_{task.upper()} inválida: use 'proveedor:modelo[,proveedor:modelo…]'")
        chain.append((name, model))
    if not chain:
        raise LLMError(f"Configuración LLM_{task.upper()} vacía")
    return chain


def task_models(task: str) -> list[TaskModel]:
    """Cadena de modelos de la tarea, en orden de preferencia.

    El verificador nunca usa un modelo de la cadena del generador: si coinciden, ese
    modelo se elimina de la verificación (y si no queda ninguno, es un error de configuración)."""
    if task not in TASKS:
        raise ValueError(task)
    if task in _overrides:
        return [TaskModel(p, m) for p, m in _overrides[task]]
    chain = _parse_chain(task)
    if task == "verification":
        generators = set(_parse_chain("generation"))
        chain = [c for c in chain if c not in generators]
        if not chain:
            raise LLMError("LLM_VERIFICATION debe incluir algún modelo distinto de los de LLM_GENERATION")
    with _lock:
        for name, _ in chain:
            if name not in _providers:
                _providers[name] = _build_provider(name)
        return [TaskModel(_providers[name], model) for name, model in chain]


def task_model(task: str) -> TaskModel:
    """Modelo preferido de la tarea."""
    return task_models(task)[0]


def override_task(task: str, provider: LLMProvider, model: str, *fallbacks: tuple[LLMProvider, str]) -> None:
    """Permite inyectar un proveedor concreto (tests, scripts de evaluación)."""
    _overrides[task] = [(provider, model), *fallbacks]


def clear_overrides() -> None:
    _overrides.clear()


def _pace(key: str) -> None:
    interval = 60.0 / max(get_settings().llm_requests_per_minute, 1)
    with _lock:
        wait = _last_call.get(key, 0) + interval - time.monotonic()
        _last_call[key] = max(time.monotonic(), _last_call.get(key, 0) + interval)
    if wait > 0:
        time.sleep(wait)


def _record(engine: Engine | None, user_id: UUID, job_id: UUID | None, task: str, tm: TaskModel,
            result: LLMResult | None, latency_ms: int, error: str | None) -> None:
    price_in, price_out = PRICES_USD_PER_MTOK.get((tm.provider.name, tm.model), (0.0, 0.0))
    tokens_in = result.input_tokens if result else 0
    tokens_out = result.output_tokens if result else 0
    with user_session(user_id, engine) as s:
        s.execute(text("""
            insert into llm_calls (user_id, job_id, task, provider, model, model_version, input_tokens,
                                   output_tokens, cost_usd, latency_ms, ok, error)
            values (:u, :j, :t, :p, :m, :mv, :ti, :to, :c, :l, :ok, :e)"""),
            {"u": user_id, "j": job_id, "t": task, "p": tm.provider.name, "m": tm.model,
             "mv": result.model_version if result else None, "ti": tokens_in, "to": tokens_out,
             "c": (tokens_in * price_in + tokens_out * price_out) / 1_000_000, "l": latency_ms,
             "ok": result is not None, "e": error})


def call_llm(*, task: str, system: str, prompt: str, schema: dict[str, Any], user_id: UUID,
             job_id: UUID | None = None, engine: Engine | None = None, max_output_tokens: int = 8192,
             sleep=time.sleep) -> LLMResult:
    """Llama al modelo configurado para `task`, pasando a los de reserva si está saturado.

    Solo espera cuando todos los modelos de la cadena están limitados. Propaga
    QuotaExhausted (el job se pausa) cuando ninguno tiene cuota diaria."""
    chain = task_models(task)
    retries = get_settings().llm_max_retries
    exhausted: dict[str, QuotaExhausted] = {}
    unavailable: dict[str, ModelUnavailable] = {}
    for attempt in range(retries + 1):
        waits: list[float] = []
        for tm in chain:
            if tm.spec in exhausted or tm.spec in unavailable:
                continue
            _pace(tm.spec)
            started = time.monotonic()
            try:
                result = tm.provider.generate_json(model=tm.model, system=system, prompt=prompt, schema=schema,
                                                   max_output_tokens=max_output_tokens)
            except QuotaExhausted as exc:
                _record(engine, user_id, job_id, task, tm, None, int((time.monotonic() - started) * 1000), str(exc))
                exhausted[tm.spec] = exc
                continue
            except RateLimited as exc:
                _record(engine, user_id, job_id, task, tm, None, int((time.monotonic() - started) * 1000), str(exc))
                waits.append(exc.retry_after)
                continue
            except ModelUnavailable as exc:
                _record(engine, user_id, job_id, task, tm, None, int((time.monotonic() - started) * 1000), str(exc))
                unavailable[tm.spec] = exc
                continue
            except LLMError as exc:
                _record(engine, user_id, job_id, task, tm, None, int((time.monotonic() - started) * 1000), str(exc))
                raise
            _record(engine, user_id, job_id, task, tm, result, int((time.monotonic() - started) * 1000), None)
            return dataclasses.replace(result, model_spec=tm.spec)
        if not waits:
            if exhausted:
                raise min(exhausted.values(), key=lambda e: e.resume_at)
            raise LLMError("Ningún modelo de la tarea está disponible: "
                           + "; ".join(str(e) for e in unavailable.values()))
        if attempt == retries:
            raise LLMError("Límite de ritmo persistente en todos los modelos de la tarea")
        sleep(min(min(waits) * (1 + attempt * 0.5), 300))
    raise LLMError("No se pudo completar la llamada")
