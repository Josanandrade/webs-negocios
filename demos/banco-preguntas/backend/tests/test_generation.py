"""Motor de preguntas de extremo a extremo (con proveedores de IA de prueba)."""
from collections import Counter

import pytest
from sqlalchemy import text

from app.db import user_session
from app.jobs.runner import run_one
from app.llm.client import clear_overrides, override_task
from tests.factories import make_structured_pdf
from tests.fakes import ScriptedProvider, dose_extractor, honest_generator, honest_verifier

NAMES = ["Alfa", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta", "Iota", "Kappa", "Lambda", "Sigma"]
DOSES = [20, 40, 15, 35, 60, 80, 12, 45, 70, 90, 25, 55]


def tema(n, meds, repeat=1):
    body = " ".join(f"El medicamento {m} se administra a una dosis de {d} mg en pacientes adultos." for m, d in meds)
    body = " ".join([body] * repeat)
    return [("h1", f"Tema {n}. Farmacología {n}"), ("p", body)]


def drain():
    while run_one("w", retry_delay_seconds=0):
        pass


@pytest.fixture
def providers(monkeypatch):
    monkeypatch.setattr("app.llm.client._pace", lambda key: None)
    p = {"extraction": ScriptedProvider(dose_extractor), "generation": ScriptedProvider(honest_generator),
         "verification": ScriptedProvider(honest_verifier)}
    for task, prov in p.items():
        override_task(task, prov, f"fake-{task}")
    yield p
    clear_overrides()


def upload_doc(client, user, layout, repeat=1):
    data = make_structured_pdf([tema(i + 1, meds, repeat) for i, meds in enumerate(layout)])
    doc = client.post("/api/documents", headers=user["headers"], files={"file": ("t.pdf", data, "application/pdf")}).json()
    drain()
    return doc


@pytest.fixture
def doc(client, alice, providers):
    meds = list(zip(NAMES, DOSES))
    return upload_doc(client, alice, [meds[:6], meds[6:9], meds[9:]])


def generate(client, user, doc_id, **body):
    r = client.post(f"/api/documents/{doc_id}/generate", json=body, headers=user["headers"])
    assert r.status_code == 202, r.text
    drain()
    return client.get(f"/api/jobs/{r.json()['id']}", headers=user["headers"]).json()


def questions(client, user, doc_id):
    listed = client.get("/api/questions", params={"document_id": doc_id}, headers=user["headers"]).json()["items"]
    return [client.get(f"/api/questions/{q['id']}", headers=user["headers"]).json() for q in listed]


def test_generates_verified_traceable_questions(client, alice, doc):
    job = generate(client, alice, doc["id"], count=6, difficulty="mixed")
    assert job["status"] == "succeeded", job
    qs = questions(client, alice, doc["id"])
    assert len(qs) == 6
    for q in qs:
        assert q["status"] == "auto_validated"
        assert len(q["options"]) == 4 and sum(o["is_correct"] for o in q["options"]) == 1
        assert len({o["text"] for o in q["options"]}) == 4
        correct = next(o for o in q["options"] if o["is_correct"])
        answer = [s for s in q["sources"] if s["role"] == "answer"]
        assert len(answer) == 1 and answer[0]["option_label"] == correct["label"]
        page = client.get(f"/api/documents/{doc['id']}/pages/{answer[0]['page_number']}", headers=alice["headers"]).json()
        assert page["text"][answer[0]["char_start"]:answer[0]["char_end"]] == answer[0]["quote"]
        assert correct["text"].lower() in answer[0]["quote"].lower()
        distractor_sources = [s for s in q["sources"] if s["role"] == "distractor"]
        assert len(distractor_sources) == 3                      # cada distractor tiene su origen
        for s in distractor_sources:
            opt = next(o for o in q["options"] if o["label"] == s["option_label"])
            assert opt["text"].lower() in s["quote"].lower() and not opt["is_correct"]
        assert f"página {answer[0]['page_number']}" in q["explanation"]
        assert q["generation"]["verifier"] == "scripted:fake-verification"
        assert "según el documento" not in q["stem"].lower()
    assert {q["difficulty"] for q in qs} == {"easy", "medium", "hard"}
    labels = Counter(next(o["label"] for o in q["options"] if o["is_correct"]) for q in qs)
    assert max(labels.values()) - min(labels.get(x, 0) for x in "ABCD") <= 1     # A/B/C/D equilibradas


def test_coverage_is_spread_across_sections(client, alice, doc):
    generate(client, alice, doc["id"], count=6)
    cov = client.get(f"/api/documents/{doc['id']}/coverage", headers=alice["headers"]).json()
    per_section = [s["questions"] for s in cov["sections"]]
    assert cov["total_questions"] == 6
    assert all(n >= 1 for n in per_section), per_section             # ningún tema queda vacío
    assert per_section[0] >= per_section[1]                          # el tema con más contenido recibe más
    assert sum(cov["correct_label_distribution"].values()) == 6


def test_max_mode_and_no_duplicates_on_second_run(client, alice, doc):
    first = generate(client, alice, doc["id"])
    n = len(questions(client, alice, doc["id"]))
    assert n == len(NAMES)                    # un dato por medicamento: una pregunta por dato
    second = generate(client, alice, doc["id"])
    assert second["status"] == "succeeded"
    assert len(questions(client, alice, doc["id"])) == n          # no repite datos ya preguntados
    with user_session(alice["id"]) as s:
        facts = s.execute(text("select fact_id from questions")).scalars().all()
    assert len(facts) == len(set(facts))


def test_verifier_disagreement_discards_question(client, alice, doc, providers):
    def stubborn(prompt):
        out = honest_verifier(prompt)
        for item in out["items"]:
            item["answer"] = "NINGUNA" if "Alfa" in prompt.split(f"### Pregunta {item['item']}")[1][:200] else item["answer"]
        return out

    providers["verification"].behaviour = stubborn
    job = generate(client, alice, doc["id"])
    stems = [q["stem"] for q in questions(client, alice, doc["id"])]
    assert not any("Alfa" in s for s in stems)
    summary = client.get(f"/api/jobs/{job['id']}/candidates", headers=alice["headers"]).json()
    assert summary["by_status"]["rejected_verification"] >= 1
    assert any(r[0].startswith("verificador_respondio") for r in summary["top_reasons"])


@pytest.mark.parametrize("template,reason", [
    ("¿Según el documento, cuál es la {attribute} del {subject}?", "formula_prohibida"),
    ("¿Cuál es la {attribute} oncológica pediátrica del {subject}?", "termino_ajeno_al_documento"),
    ("¿Cuál es la {attribute} de este medicamento?", "referente_perdido_en_enunciado"),
    ("¿Cuál es la {attribute} del {subject}", "enunciado_sin_pregunta"),
])
def test_bad_stems_are_rejected_deterministically(client, alice, doc, providers, template, reason):
    providers["generation"].behaviour = lambda p: honest_generator(p, template)
    job = generate(client, alice, doc["id"], count=3)
    assert questions(client, alice, doc["id"]) == []
    assert job["status"] == "succeeded"
    assert "0 preguntas" in job["message"] and "No hay más contenido" in job["message"]
    with user_session(alice["id"]) as s:
        reasons = s.execute(text("select reasons from question_candidates")).scalars().all()
    assert reasons and all(any(r.startswith(reason) for r in rs) for rs in reasons)
    assert len(providers["verification"].calls) == 0           # no se gasta cuota en verificar


def test_corrupt_generator_output_is_rejected_and_audited(client, alice, doc, providers):
    providers["generation"].behaviour = lambda p: honest_generator(p, "\x13\x14Qu\x00é {attribute} del {subject}?")
    job = generate(client, alice, doc["id"], count=2)
    assert job["status"] == "succeeded" and job["attempts"] == 1       # sin reintentos por error de BD
    assert questions(client, alice, doc["id"]) == []
    with user_session(alice["id"]) as s:
        reasons = s.execute(text("select reasons from question_candidates")).scalars().all()
    assert reasons and all(rs == ["salida_corrupta_del_generador"] for rs in reasons)


def test_invalid_distractor_choice_rejected(client, alice, doc, providers):
    def wrong_ids(prompt):
        out = honest_generator(prompt)
        for it in out["items"]:
            it["distractor_ids"] = ["D1", "D1", "D9"]
        return out

    providers["generation"].behaviour = wrong_ids
    generate(client, alice, doc["id"], count=2)
    assert questions(client, alice, doc["id"]) == []


def test_without_three_document_distractors_no_llm_call_is_made(client, alice, providers):
    small = upload_doc(client, alice, [[("Alfa", 20), ("Beta", 40)], [("Gamma", 10)]], repeat=4)
    job = generate(client, alice, small["id"])
    assert questions(client, alice, small["id"]) == []
    assert providers["generation"].calls == []
    summary = client.get(f"/api/jobs/{job['id']}/candidates", headers=alice["headers"]).json()
    assert set(summary["by_status"]) == {"rejected_no_distractors"}


def test_quota_pause_during_generation_resumes_without_duplicates(client, alice, doc, providers, owner_engine):
    from datetime import datetime, timedelta, timezone

    from app.llm.base import QuotaExhausted

    calls = {"n": 0}

    def flaky_verifier(prompt):
        calls["n"] += 1
        if calls["n"] == 2:
            raise QuotaExhausted("cuota", datetime.now(timezone.utc) + timedelta(hours=3))
        return honest_verifier(prompt)

    providers["verification"].behaviour = flaky_verifier
    # 12 preguntas = dos llamadas al verificador (lotes de 8): la segunda agota la cuota.
    r = client.post(f"/api/documents/{doc['id']}/generate", json={"count": 12}, headers=alice["headers"])
    drain()
    job = client.get(f"/api/jobs/{r.json()['id']}", headers=alice["headers"]).json()
    assert job["status"] == "pending" and "En pausa" in job["message"]
    paused_count = len(questions(client, alice, doc["id"]))
    assert 0 < paused_count < 12
    with owner_engine.begin() as conn:
        conn.execute(text("update processing_jobs set run_after = now()"))
    drain()
    job = client.get(f"/api/jobs/{r.json()['id']}", headers=alice["headers"]).json()
    assert job["status"] == "succeeded"
    qs = questions(client, alice, doc["id"])
    assert len(qs) == 12
    assert len({q["stem"] for q in qs}) == 12


def test_generation_and_questions_are_private(client, alice, bob, doc):
    generate(client, alice, doc["id"], count=1)
    qid = questions(client, alice, doc["id"])[0]["id"]
    assert client.post(f"/api/documents/{doc['id']}/generate", json={}, headers=bob["headers"]).status_code == 404
    assert client.get(f"/api/questions/{qid}", headers=bob["headers"]).status_code == 404
    assert client.get("/api/questions", headers=bob["headers"]).json()["items"] == []
    assert client.get(f"/api/documents/{doc['id']}/coverage", headers=bob["headers"]).status_code == 404


def test_verifier_is_called_in_full_batches_and_target_is_not_exceeded(client, alice, doc, providers):
    job = generate(client, alice, doc["id"], count=10)
    assert job["status"] == "succeeded"
    assert len(questions(client, alice, doc["id"])) == 10                  # ni una más de las pedidas
    assert len(providers["verification"].calls) == 2                      # 8 + 2, no una llamada por cada 4
    assert len(providers["generation"].calls) == 2                        # lotes fijos de 8 hechos
    with user_session(alice["id"]) as s:
        recorded = s.execute(text("select count(*) from question_candidates")).scalar_one()
    assert recorded == 10      # los borradores sobrantes no se registran: sus hechos quedan para otra vez


def test_facts_are_extracted_right_after_upload_and_generation_queues_behind(client, alice, providers, monkeypatch):
    from app.config import get_settings

    monkeypatch.setenv("AUTO_EXTRACT_FACTS", "true")
    get_settings.cache_clear()
    try:
        data = make_structured_pdf([tema(1, list(zip(NAMES, DOSES))[:6])])
        doc = client.post("/api/documents", headers=alice["headers"], files={"file": ("t.pdf", data, "application/pdf")}).json()
        assert run_one("w", retry_delay_seconds=0)                       # ingestión
        with user_session(alice["id"]) as s:
            kinds = s.execute(text("select kind, status from processing_jobs order by created_at")).all()
        assert [tuple(k) for k in kinds] == [("ingest", "succeeded"), ("extract_facts", "pending")]
        # «Generar» se acepta aunque la extracción no haya empezado: espera su turno.
        r = client.post(f"/api/documents/{doc['id']}/generate", json={"count": 2}, headers=alice["headers"])
        assert r.status_code == 202
        assert client.post(f"/api/documents/{doc['id']}/generate", json={"count": 2},
                           headers=alice["headers"]).status_code == 409    # pero no dos generaciones a la vez
        drain()
        with user_session(alice["id"]) as s:
            order = s.execute(text("select kind from processing_jobs where status = 'succeeded' order by finished_at")).scalars().all()
        assert order == ["ingest", "extract_facts", "generate"]
        assert len(questions(client, alice, doc["id"])) == 2
        assert len(providers["extraction"].calls) == 1                   # la generación no repite la extracción
    finally:
        get_settings.cache_clear()
