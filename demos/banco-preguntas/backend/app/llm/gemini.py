"""Proveedor Google Gemini (API REST de Google AI Studio; admite el plan gratuito)."""
import json
import re
from datetime import datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

import httpx

from app.llm.base import LLMError, LLMResult, QuotaExhausted, RateLimited

API = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
_TYPES = {"object": "OBJECT", "array": "ARRAY", "string": "STRING", "integer": "INTEGER",
          "number": "NUMBER", "boolean": "BOOLEAN"}


def to_gemini_schema(schema: dict[str, Any]) -> dict[str, Any]:
    """JSON Schema (subconjunto) -> esquema OpenAPI que acepta Gemini."""
    out: dict[str, Any] = {"type": _TYPES[schema["type"]]}
    if "enum" in schema:
        out["enum"] = schema["enum"]
    if "description" in schema:
        out["description"] = schema["description"]
    if schema.get("nullable"):
        out["nullable"] = True
    if schema["type"] == "object":
        out["properties"] = {k: to_gemini_schema(v) for k, v in schema["properties"].items()}
        out["required"] = schema.get("required", list(schema["properties"]))
        out["propertyOrdering"] = list(schema["properties"])
    if schema["type"] == "array":
        out["items"] = to_gemini_schema(schema["items"])
        for key in ("minItems", "maxItems"):
            if key in schema:
                out[key] = schema[key]
    return out


def next_quota_reset(now: datetime | None = None) -> datetime:
    """Las cuotas diarias de Gemini se reinician a medianoche (hora del Pacífico)."""
    tz = ZoneInfo("America/Los_Angeles")
    now = (now or datetime.now(tz)).astimezone(tz)
    return (now + timedelta(days=1)).replace(hour=0, minute=5, second=0, microsecond=0)


def _retry_delay(details: list[dict[str, Any]]) -> float | None:
    for d in details:
        if d.get("@type", "").endswith("RetryInfo"):
            m = re.match(r"([\d.]+)s", d.get("retryDelay", ""))
            if m:
                return float(m.group(1))
    return None


def _is_daily(details: list[dict[str, Any]]) -> bool:
    for d in details:
        for v in d.get("violations", []) or []:
            if "PerDay" in (v.get("quotaId") or "") or "per_day" in (v.get("quotaMetric") or "").lower():
                return True
    return False


class GeminiProvider:
    name = "gemini"

    def __init__(self, api_key: str, timeout: float = 180.0, client: httpx.Client | None = None):
        if not api_key:
            raise LLMError("Falta GEMINI_API_KEY")
        self._key = api_key
        self._client = client or httpx.Client(timeout=timeout)

    def generate_json(self, *, model: str, system: str, prompt: str, schema: dict[str, Any],
                      max_output_tokens: int) -> LLMResult:
        body = {
            "systemInstruction": {"parts": [{"text": system}]},
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "responseSchema": to_gemini_schema(schema),
                "maxOutputTokens": max_output_tokens,
                "temperature": 0.2,
            },
        }
        try:
            resp = self._client.post(API.format(model=model), json=body,
                                     headers={"x-goog-api-key": self._key})
        except httpx.HTTPError as exc:
            raise RateLimited(f"Error de red con Gemini: {exc}", retry_after=10) from exc
        return self.parse_response(resp.status_code, resp.text)

    @staticmethod
    def parse_response(status: int, text: str) -> LLMResult:
        try:
            payload = json.loads(text)
        except json.JSONDecodeError as exc:
            if status >= 500:
                raise RateLimited(f"Gemini {status}", retry_after=15) from exc
            raise LLMError(f"Respuesta no JSON de Gemini ({status})") from exc
        if status == 429:
            error = payload.get("error", {})
            details = error.get("details", [])
            if _is_daily(details):
                raise QuotaExhausted("Cuota diaria gratuita de Gemini agotada", next_quota_reset())
            raise RateLimited(error.get("message", "Límite por minuto de Gemini"), _retry_delay(details) or 30)
        if status >= 500:
            raise RateLimited(f"Gemini no disponible ({status})", retry_after=20)
        if status != 200:
            raise LLMError(f"Gemini {status}: {payload.get('error', {}).get('message', text[:300])}")

        candidates = payload.get("candidates") or []
        if not candidates:
            reason = payload.get("promptFeedback", {}).get("blockReason", "sin candidatos")
            raise LLMError(f"Gemini no devolvió respuesta ({reason})")
        cand = candidates[0]
        if cand.get("finishReason") not in (None, "STOP"):
            raise LLMError(f"Respuesta incompleta de Gemini: {cand.get('finishReason')}")
        out = "".join(p.get("text", "") for p in cand.get("content", {}).get("parts", []) if not p.get("thought"))
        try:
            data = json.loads(out)
        except json.JSONDecodeError as exc:
            raise LLMError("Gemini devolvió JSON inválido") from exc
        usage = payload.get("usageMetadata", {})
        return LLMResult(
            data=data,
            model_version=payload.get("modelVersion"),
            input_tokens=int(usage.get("promptTokenCount", 0)),
            output_tokens=int(usage.get("candidatesTokenCount", 0)) + int(usage.get("thoughtsTokenCount", 0)),
        )
