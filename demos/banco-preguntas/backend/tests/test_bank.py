"""Banco de preguntas: filtros, búsqueda, fuentes, edición auditada, estados, etiquetas y lote."""
import pytest

from tests.test_generation import NAMES, DOSES, drain, generate, upload_doc  # noqa: F401
from tests.test_generation import providers  # noqa: F401  (fixture)


@pytest.fixture
def bank(client, alice, providers):  # noqa: F811
    meds = list(zip(NAMES, DOSES))
    doc = upload_doc(client, alice, [meds[:6], meds[6:9], meds[9:]])
    generate(client, alice, doc["id"])
    items = client.get("/api/questions", params={"document_id": doc["id"], "limit": 100},
                       headers=alice["headers"]).json()["items"]
    assert len(items) == len(NAMES)
    return doc, items


def get(client, user, path, **params):
    r = client.get(path, params=params, headers=user["headers"])
    assert r.status_code == 200, r.text
    return r.json()


def test_detail_has_audit_trail_and_original_fragment(client, alice, bank):
    doc, items = bank
    q = get(client, alice, f"/api/questions/{items[0]['id']}")
    assert q["seq"] >= 1 and q["document_title"] == "t"
    answer = next(s for s in q["sources"] if s["role"] == "answer")
    page = get(client, alice, f"/api/documents/{doc['id']}/pages/{answer['page_number']}")
    start = answer["char_start"]
    assert page["text"][start - len(answer["context_before"]):start] == answer["context_before"]
    assert page["text"][answer["char_end"]:answer["char_end"] + len(answer["context_after"])] == answer["context_after"]
    assert {s["option_label"] for s in q["sources"]} == {"A", "B", "C", "D"}   # origen de cada opción
    assert q["generation"]["verifier_report"]["answer"] == next(o["label"] for o in q["options"] if o["is_correct"])


def test_filters_search_and_pagination(client, alice, bank):
    doc, items = bank
    sections = get(client, alice, f"/api/documents/{doc['id']}/sections")
    tema2 = sections[1]
    by_section = get(client, alice, "/api/questions", section_id=tema2["id"])
    assert by_section["total"] == 3 and all(i["section_id"] == tema2["id"] for i in by_section["items"])
    found = get(client, alice, "/api/questions", q="lambda")          # sin mayúsculas
    assert found["total"] == 1 and "Lambda" in found["items"][0]["stem"]
    by_option = get(client, alice, "/api/questions", q="90 MG")       # busca también en opciones
    assert by_option["total"] >= 1
    page1 = get(client, alice, "/api/questions", limit=5, offset=0)
    page2 = get(client, alice, "/api/questions", limit=5, offset=5)
    assert page1["total"] == len(NAMES) and len(page1["items"]) == 5
    assert not {i["id"] for i in page1["items"]} & {i["id"] for i in page2["items"]}
    for level in ("easy", "medium", "hard"):
        r = get(client, alice, "/api/questions", difficulty=level)
        assert all(i["difficulty"] == level for i in r["items"])


def test_approve_discard_restore_and_filter_by_status(client, alice, bank):
    _, items = bank
    qid = items[0]["id"]
    r = client.patch(f"/api/questions/{qid}", json={"status": "manually_reviewed"}, headers=alice["headers"]).json()
    assert r["status"] == "manually_reviewed" and r["reviewed_at"]
    client.patch(f"/api/questions/{items[1]['id']}", json={"status": "discarded"}, headers=alice["headers"])
    assert get(client, alice, "/api/questions")["total"] == len(NAMES) - 1          # descartadas ocultas por defecto
    assert get(client, alice, "/api/questions", status="discarded")["total"] == 1
    assert get(client, alice, "/api/questions", include_discarded=True)["total"] == len(NAMES)
    client.patch(f"/api/questions/{items[1]['id']}", json={"status": "auto_validated"}, headers=alice["headers"])
    assert get(client, alice, "/api/questions")["total"] == len(NAMES)


def test_edit_content_is_audited_and_marks_manual_review(client, alice, bank):
    _, items = bank
    qid = items[0]["id"]
    before = get(client, alice, f"/api/questions/{qid}")
    r = client.patch(f"/api/questions/{qid}", json={"stem": "¿Qué dosis tiene indicada este fármaco en adultos?",
                                                    "difficulty": "hard", "tags": ["Repaso", "repaso", " dosis "]},
                     headers=alice["headers"])
    assert r.status_code == 200
    q = r.json()
    assert q["status"] == "manually_reviewed" and q["edited_at"]
    assert q["difficulty"] == "hard" and q["tags"] == ["dosis", "repaso"]
    last = q["history"][-1]["changes"]
    assert last["stem"] == [before["stem"], "¿Qué dosis tiene indicada este fármaco en adultos?"]
    assert q["sources"] == before["sources"]                     # las evidencias originales se conservan


def test_change_correct_answer_moves_evidence_roles(client, alice, bank):
    _, items = bank
    qid = items[0]["id"]
    q = get(client, alice, f"/api/questions/{qid}")
    old = next(o["label"] for o in q["options"] if o["is_correct"])
    new = next(label for label in "ABCD" if label != old)
    q2 = client.patch(f"/api/questions/{qid}", json={"correct_label": new}, headers=alice["headers"]).json()
    assert [o["label"] for o in q2["options"] if o["is_correct"]] == [new]
    answer = [s for s in q2["sources"] if s["role"] == "answer"]
    assert [s["option_label"] for s in answer] == [new]
    assert q2["history"][-1]["changes"]["correct_label"] == [old, new]


def test_invalid_edits_are_rejected(client, alice, bank):
    _, items = bank
    q = get(client, alice, f"/api/questions/{items[0]['id']}")
    other = next(o for o in q["options"] if not o["is_correct"])
    dup = client.patch(f"/api/questions/{q['id']}", json={"options": [{"label": other["label"],
                       "text": next(o["text"] for o in q["options"] if o["is_correct"])}]}, headers=alice["headers"])
    assert dup.status_code == 422
    assert client.patch(f"/api/questions/{q['id']}", json={"stem": "corto"}, headers=alice["headers"]).status_code == 422
    assert client.patch(f"/api/questions/{q['id']}", json={"difficulty": "imposible"},
                        headers=alice["headers"]).status_code == 422
    assert get(client, alice, f"/api/questions/{q['id']}")["options"] == q["options"]   # nada cambió


def test_tags_and_bulk_actions(client, alice, bank):
    _, items = bank
    ids = [i["id"] for i in items[:4]]
    h = alice["headers"]
    assert client.post("/api/questions/bulk", json={"ids": ids, "action": "add_tag", "tag": "Examen"},
                       headers=h).json()["affected"] == 4
    assert get(client, alice, "/api/questions/tags") == [["examen", 4]]
    assert get(client, alice, "/api/questions", tag="examen")["total"] == 4
    assert client.post("/api/questions/bulk", json={"ids": ids[:2], "action": "approve"}, headers=h).json()["affected"] == 2
    assert get(client, alice, "/api/questions", status="manually_reviewed")["total"] == 2
    assert client.post("/api/questions/bulk", json={"ids": ids[2:], "action": "set_difficulty", "difficulty": "easy"},
                       headers=h).json()["affected"] >= 0
    assert all(i["difficulty"] == "easy" for i in get(client, alice, "/api/questions", tag="examen")["items"][2:])
    assert client.post("/api/questions/bulk", json={"ids": ids, "action": "remove_tag", "tag": "examen"},
                       headers=h).json()["affected"] == 4
    assert client.post("/api/questions/bulk", json={"ids": ids[:1], "action": "delete"}, headers=h).json()["affected"] == 1
    assert client.get(f"/api/questions/{ids[0]}", headers=h).status_code == 404


def test_other_user_cannot_read_or_modify(client, alice, bob, bank):
    _, items = bank
    qid = items[0]["id"]
    hb = bob["headers"]
    assert client.get(f"/api/questions/{qid}", headers=hb).status_code == 404
    assert client.patch(f"/api/questions/{qid}", json={"status": "discarded"}, headers=hb).status_code == 404
    assert client.delete(f"/api/questions/{qid}", headers=hb).status_code == 404
    assert client.post("/api/questions/bulk", json={"ids": [qid], "action": "delete"}, headers=hb).json()["affected"] == 0
    assert get(client, alice, f"/api/questions/{qid}")["status"] == "auto_validated"
