"""Proveedor compatible con la API de OpenAI (OpenAI, Ollama, Groq, OpenRouter...)."""
import json
from typing import Any

import httpx

from app.llm.base import LLMError, LLMResult, RateLimited


def _strict(schema: dict[str, Any]) -> dict[str, Any]:
    out = {k: v for k, v in schema.items() if k not in ("nullable",)}
    if schema.get("nullable"):
        out["type"] = [schema["type"], "null"]
    if schema["type"] == "object":
        out["properties"] = {k: _strict(v) for k, v in schema["properties"].items()}
        out["required"] = list(schema["properties"])
        out["additionalProperties"] = False
    if schema["type"] == "array":
        out["items"] = _strict(schema["items"])
    return out


class OpenAICompatibleProvider:
    def __init__(self, name: str, base_url: str, api_key: str | None, timeout: float = 300.0,
                 client: httpx.Client | None = None):
        self.name = name
        self._url = base_url.rstrip("/") + "/chat/completions"
        self._headers = {"Authorization": f"Bearer {api_key}"} if api_key else {}
        self._client = client or httpx.Client(timeout=timeout)

    def generate_json(self, *, model: str, system: str, prompt: str, schema: dict[str, Any],
                      max_output_tokens: int) -> LLMResult:
        body = {
            "model": model,
            "messages": [{"role": "system", "content": system}, {"role": "user", "content": prompt}],
            "response_format": {"type": "json_schema",
                                "json_schema": {"name": "respuesta", "schema": _strict(schema), "strict": True}},
            "max_tokens": max_output_tokens,
            "temperature": 0.2,
        }
        try:
            resp = self._client.post(self._url, json=body, headers=self._headers)
        except httpx.HTTPError as exc:
            raise RateLimited(f"Error de red con {self.name}: {exc}", retry_after=10) from exc
        if resp.status_code == 429 or resp.status_code >= 500:
            raise RateLimited(f"{self.name} {resp.status_code}", float(resp.headers.get("retry-after", 20)))
        if resp.status_code != 200:
            raise LLMError(f"{self.name} {resp.status_code}: {resp.text[:300]}")
        payload = resp.json()
        choice = payload["choices"][0]
        if choice.get("finish_reason") not in (None, "stop"):
            raise LLMError(f"Respuesta incompleta: {choice.get('finish_reason')}")
        try:
            data = json.loads(choice["message"]["content"])
        except (json.JSONDecodeError, TypeError) as exc:
            raise LLMError("JSON inválido en la respuesta") from exc
        usage = payload.get("usage", {})
        return LLMResult(data, payload.get("model"), int(usage.get("prompt_tokens", 0)),
                         int(usage.get("completion_tokens", 0)))
