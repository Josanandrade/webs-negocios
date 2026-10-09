"""Proveedor Anthropic (Claude) con salida estructurada."""
import json
from typing import Any

import anthropic

from app.llm.base import LLMError, LLMResult, RateLimited
from app.llm.openai_compat import _strict


class AnthropicProvider:
    name = "anthropic"

    def __init__(self, api_key: str | None = None):
        self._client = anthropic.Anthropic(api_key=api_key) if api_key else anthropic.Anthropic()

    def generate_json(self, *, model: str, system: str, prompt: str, schema: dict[str, Any],
                      max_output_tokens: int) -> LLMResult:
        try:
            response = self._client.messages.create(
                model=model,
                max_tokens=max_output_tokens,
                system=system,
                messages=[{"role": "user", "content": prompt}],
                output_config={"format": {"type": "json_schema", "schema": _strict(schema)}},
            )
        except (anthropic.RateLimitError, anthropic.InternalServerError, anthropic.APIConnectionError) as exc:
            raise RateLimited(f"Anthropic temporalmente no disponible: {exc}", retry_after=30) from exc
        except anthropic.APIStatusError as exc:
            raise LLMError(f"Anthropic {exc.status_code}: {exc.message}") from exc
        if response.stop_reason != "end_turn":
            raise LLMError(f"Respuesta incompleta de Anthropic: {response.stop_reason}")
        text = next((b.text for b in response.content if b.type == "text"), "")
        try:
            data = json.loads(text)
        except json.JSONDecodeError as exc:
            raise LLMError("JSON inválido en la respuesta") from exc
        return LLMResult(data, response.model, response.usage.input_tokens, response.usage.output_tokens)
