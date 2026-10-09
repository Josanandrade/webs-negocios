"""Proveedores de IA: formato de petición, interpretación de respuestas, cuotas y reintentos."""
import json
from datetime import datetime
from zoneinfo import ZoneInfo

import httpx
import pytest
from sqlalchemy import text

from app.db import user_session
from app.llm.base import LLMError, LLMResult, ModelUnavailable, QuotaExhausted, RateLimited
from app.llm.client import call_llm, clear_overrides, override_task, task_models
from app.llm.gemini import GeminiProvider, next_quota_reset, to_gemini_schema

SCHEMA = {"type": "object", "properties": {"x": {"type": "array", "items": {"type": "string", "enum": ["a", "b"]}}},
          "required": ["x"]}


def gemini_ok(data, finish="STOP"):
    return json.dumps({
        "candidates": [{"finishReason": finish, "content": {"parts": [
            {"text": "razonando...", "thought": True}, {"text": json.dumps(data)}]}}],
        "usageMetadata": {"promptTokenCount": 120, "candidatesTokenCount": 30, "thoughtsTokenCount": 10},
        "modelVersion": "gemini-x-001"})


def test_gemini_request_shape_and_success():
    seen = {}

    def handler(request: httpx.Request):
        seen["url"] = str(request.url)
        seen["key"] = request.headers.get("x-goog-api-key")
        seen["body"] = json.loads(request.content)
        return httpx.Response(200, text=gemini_ok({"x": ["a"]}))

    provider = GeminiProvider("clave", client=httpx.Client(transport=httpx.MockTransport(handler)))
    result = provider.generate_json(model="gemini-flash-lite-latest", system="S", prompt="P", schema=SCHEMA,
                                    max_output_tokens=100)
    assert result.data == {"x": ["a"]}
    assert (result.input_tokens, result.output_tokens, result.model_version) == (120, 40, "gemini-x-001")
    assert seen["url"].endswith("/models/gemini-flash-lite-latest:generateContent")
    assert seen["key"] == "clave"
    cfg = seen["body"]["generationConfig"]
    assert cfg["responseMimeType"] == "application/json"
    assert cfg["responseSchema"]["properties"]["x"]["items"] == {"type": "STRING", "enum": ["a", "b"]}


def test_gemini_schema_conversion():
    out = to_gemini_schema(SCHEMA)
    assert out["type"] == "OBJECT" and out["required"] == ["x"] and out["propertyOrdering"] == ["x"]


def test_gemini_per_minute_limit():
    body = json.dumps({"error": {"code": 429, "message": "too many", "details": [
        {"@type": "type.googleapis.com/google.rpc.QuotaFailure",
         "violations": [{"quotaId": "GenerateRequestsPerMinutePerProjectPerModel-FreeTier"}]},
        {"@type": "type.googleapis.com/google.rpc.RetryInfo", "retryDelay": "17s"}]}})
    with pytest.raises(RateLimited) as exc:
        GeminiProvider.parse_response(429, body)
    assert exc.value.retry_after == 17


def test_gemini_daily_quota():
    body = json.dumps({"error": {"code": 429, "details": [
        {"@type": "type.googleapis.com/google.rpc.QuotaFailure",
         "violations": [{"quotaId": "GenerateRequestsPerDayPerProjectPerModel-FreeTier"}]}]}})
    with pytest.raises(QuotaExhausted) as exc:
        GeminiProvider.parse_response(429, body)
    assert exc.value.resume_at > datetime.now(ZoneInfo("UTC"))


def test_quota_reset_is_next_pacific_midnight():
    tz = ZoneInfo("America/Los_Angeles")
    assert next_quota_reset(datetime(2026, 3, 10, 23, 50, tzinfo=tz)) == datetime(2026, 3, 11, 0, 5, tzinfo=tz)


def test_gemini_errors():
    with pytest.raises(RateLimited):
        GeminiProvider.parse_response(503, "{}")
    with pytest.raises(LLMError, match="incompleta"):
        GeminiProvider.parse_response(200, gemini_ok({"x": []}, finish="MAX_TOKENS"))
    with pytest.raises(LLMError, match="400"):
        GeminiProvider.parse_response(400, json.dumps({"error": {"message": "API key not valid"}}))
    bad = json.dumps({"candidates": [{"finishReason": "STOP", "content": {"parts": [{"text": "{no json"}]}}]})
    with pytest.raises(LLMError, match="JSON"):
        GeminiProvider.parse_response(200, bad)


class Flaky:
    name = "flaky"

    def __init__(self, failures):
        self.failures = list(failures)

    def generate_json(self, **kw):
        if self.failures:
            raise self.failures.pop(0)
        return LLMResult({"ok": True}, "flaky-1", 10, 5)


@pytest.fixture(autouse=True)
def _reset():
    yield
    clear_overrides()


def test_call_llm_retries_rate_limits_and_records_calls(alice, monkeypatch):
    monkeypatch.setattr("app.llm.client._pace", lambda key: None)
    override_task("generation", Flaky([RateLimited("x", 1), RateLimited("x", 1)]), "m")
    slept = []
    result = call_llm(task="generation", system="s", prompt="p", schema=SCHEMA, user_id=alice["id"], sleep=slept.append)
    assert result.data == {"ok": True}
    assert len(slept) == 2
    with user_session(alice["id"]) as s:
        rows = s.execute(text("select ok, task, model from llm_calls order by created_at")).all()
    assert [r.ok for r in rows] == [False, False, True]


def test_call_llm_propagates_daily_quota(alice, monkeypatch):
    monkeypatch.setattr("app.llm.client._pace", lambda key: None)
    override_task("extraction", Flaky([QuotaExhausted("cuota", next_quota_reset())]), "m")
    with pytest.raises(QuotaExhausted):
        call_llm(task="extraction", system="s", prompt="p", schema=SCHEMA, user_id=alice["id"], sleep=lambda s: None)


def test_default_configuration_uses_free_gemini_and_distinct_verifier():
    from app.config import get_settings

    s = get_settings()
    assert all(getattr(s, f"llm_{t}").startswith("gemini:") for t in ("extraction", "generation", "verification"))
    assert s.llm_generation != s.llm_verification


def test_gemini_retired_model_is_unavailable():
    with pytest.raises(ModelUnavailable):
        GeminiProvider.parse_response(404, json.dumps({"error": {"code": 404, "message": "no longer available"}}))


def test_call_llm_falls_back_to_next_model_without_waiting(alice, monkeypatch):
    monkeypatch.setattr("app.llm.client._pace", lambda key: None)
    busy = Flaky([RateLimited("Gemini no disponible (503)", 20)])
    override_task("verification", busy, "principal", (Flaky([]), "reserva"))
    slept = []
    result = call_llm(task="verification", system="s", prompt="p", schema=SCHEMA, user_id=alice["id"],
                      sleep=slept.append)
    assert result.model_spec == "flaky:reserva"
    assert slept == []


def test_call_llm_waits_only_when_every_model_is_limited(alice, monkeypatch):
    monkeypatch.setattr("app.llm.client._pace", lambda key: None)
    override_task("generation", Flaky([RateLimited("x", 30)]), "a", (Flaky([RateLimited("y", 5)]), "b"))
    slept = []
    result = call_llm(task="generation", system="s", prompt="p", schema=SCHEMA, user_id=alice["id"], sleep=slept.append)
    assert slept == [5] and result.model_spec == "flaky:a"


def test_call_llm_skips_retired_and_exhausted_models(alice, monkeypatch):
    monkeypatch.setattr("app.llm.client._pace", lambda key: None)
    override_task("extraction", Flaky([ModelUnavailable("retirado")]), "viejo",
                  (Flaky([QuotaExhausted("cuota", next_quota_reset())]), "sin-cuota"), (Flaky([]), "bueno"))
    result = call_llm(task="extraction", system="s", prompt="p", schema=SCHEMA, user_id=alice["id"], sleep=lambda s: None)
    assert result.model_spec == "flaky:bueno"


def test_call_llm_pauses_when_every_model_is_out_of_quota(alice, monkeypatch):
    monkeypatch.setattr("app.llm.client._pace", lambda key: None)
    override_task("extraction", Flaky([QuotaExhausted("cuota", next_quota_reset())]), "a",
                  (Flaky([ModelUnavailable("retirado")]), "b"))
    with pytest.raises(QuotaExhausted):
        call_llm(task="extraction", system="s", prompt="p", schema=SCHEMA, user_id=alice["id"], sleep=lambda s: None)


def test_verifier_chain_never_includes_a_generator_model(monkeypatch):
    from app.config import get_settings

    monkeypatch.setenv("GEMINI_API_KEY", "clave")
    monkeypatch.setenv("LLM_GENERATION", "gemini:lite,gemini:flash-b")
    monkeypatch.setenv("LLM_VERIFICATION", "gemini:flash-b,gemini:flash-a")
    get_settings.cache_clear()
    try:
        assert [m.model for m in task_models("verification")] == ["flash-a"]
        monkeypatch.setenv("LLM_VERIFICATION", "gemini:lite")
        get_settings.cache_clear()
        with pytest.raises(LLMError):
            task_models("verification")
    finally:
        get_settings.cache_clear()
