"""Bloque 7: tests del alumno, corrección y estadísticas."""
from collections import Counter

import pytest
from sqlalchemy import text

from tests.test_bank import bank  # noqa: F401  (fixture: 12 preguntas en 3 temas de 6, 3 y 3)
from tests.test_generation import providers  # noqa: F401  (fixture)


def api(client, user, method, path, expected=200, **kw):
    r = client.request(method, path, headers=user["headers"], **kw)
    assert r.status_code == expected, r.text
    return r.json() if r.content else None


def new_quiz(client, user, expected=201, **body):
    return api(client, user, "POST", "/api/quizzes", expected, json=body)


def correct_label(client, user, qq):
    """Letra correcta de una pregunta del test, consultando el banco (el test no la revela)."""
    q = api(client, user, "GET", f"/api/questions/{qq['question_id']}")
    right = next(o["text"] for o in q["options"] if o["is_correct"])
    return next(o["label"] for o in qq["options"] if o["text"] == right)


def wrong_label(client, user, qq):
    return next(label for label in "ABCD" if label != correct_label(client, user, qq))


def answer(client, user, quiz, ordinal, label, expected=200):
    return api(client, user, "PUT", f"/api/quizzes/{quiz['id']}/questions/{ordinal}", expected,
               json={"selected_label": label})


def test_practice_reveals_each_answer_and_scores_with_penalty(client, alice, bank):
    quiz = new_quiz(client, alice, count=5)
    assert quiz["mode"] == "practice" and quiz["total"] == 5 and quiz["status"] == "in_progress"
    assert all(not q["revealed"] and q["correct_label"] is None for q in quiz["questions"])
    qs = quiz["questions"]

    first = answer(client, alice, quiz, 1, correct_label(client, alice, qs[0]))
    assert first["revealed"] and first["is_correct"] is True and first["source_page"] and first["source_quote"]
    answer(client, alice, quiz, 1, "A", expected=409)                # no se puede cambiar tras ver la corrección
    answer(client, alice, quiz, 2, correct_label(client, alice, qs[1]))
    answer(client, alice, quiz, 3, correct_label(client, alice, qs[2]))
    bad = answer(client, alice, quiz, 4, wrong_label(client, alice, qs[3]))
    assert bad["is_correct"] is False and bad["correct_label"] != bad["selected_label"]
    # la 5 se deja sin responder

    done = api(client, alice, "POST", f"/api/quizzes/{quiz['id']}/finish")
    assert (done["correct"], done["wrong"], done["blank"]) == (3, 1, 1)
    assert done["net"] == pytest.approx(3 - 1 / 3, abs=0.01)
    assert done["score"] == pytest.approx((3 - 1 / 3) / 5 * 10, abs=0.01)
    assert all(q["revealed"] and q["correct_label"] for q in done["questions"])
    answer(client, alice, quiz, 5, "A", expected=409)                # entregado: no admite respuestas
    assert api(client, alice, "POST", f"/api/quizzes/{quiz['id']}/finish")["score"] == done["score"]  # idempotente


def test_exam_hides_answers_until_finished_and_allows_changes(client, alice, bank):
    quiz = new_quiz(client, alice, count=4, mode="exam", penalty=0)
    qs = quiz["questions"]
    r = answer(client, alice, quiz, 1, wrong_label(client, alice, qs[0]))
    assert not r["revealed"] and r["is_correct"] is None and r["correct_label"] is None
    answer(client, alice, quiz, 1, correct_label(client, alice, qs[0]))          # cambiar de opinión
    answer(client, alice, quiz, 2, wrong_label(client, alice, qs[1]))
    answer(client, alice, quiz, 2, None)                                          # volver a dejarla en blanco
    current = api(client, alice, "GET", f"/api/quizzes/{quiz['id']}")
    assert current["answered"] == 1 and all(q["correct_label"] is None for q in current["questions"])
    done = api(client, alice, "POST", f"/api/quizzes/{quiz['id']}/finish")
    assert (done["correct"], done["wrong"], done["blank"]) == (1, 0, 3)
    assert done["score"] == pytest.approx(2.5)                                    # sin penalización
    assert done["questions"][0]["is_correct"] is True and done["questions"][1]["is_correct"] is None


def test_exam_time_limit_is_enforced_by_the_server(client, alice, bank, owner_engine):
    quiz = new_quiz(client, alice, count=3, mode="exam", time_limit_minutes=30)
    assert quiz["time_limit_seconds"] == 1800 and 1790 <= quiz["remaining_seconds"] <= 1800
    answer(client, alice, quiz, 1, correct_label(client, alice, quiz["questions"][0]))
    with owner_engine.begin() as conn:
        conn.execute(text("update quizzes set expires_at = now() - interval '1 second'"))
    answer(client, alice, quiz, 2, "A", expected=409)
    done = api(client, alice, "GET", f"/api/quizzes/{quiz['id']}")
    assert done["status"] == "finished" and (done["correct"], done["blank"]) == (1, 2)
    # el tiempo límite solo aplica a exámenes
    assert new_quiz(client, alice, count=2, time_limit_minutes=30)["expires_at"] is None


def test_selection_is_balanced_across_topics(client, alice, bank):
    def topics(quiz):
        return Counter(q["top_section_title"] for q in quiz["questions"])

    assert sorted(topics(new_quiz(client, alice, count=3)).values()) == [1, 1, 1]
    assert sorted(topics(new_quiz(client, alice, count=6)).values()) == [2, 2, 2]
    full = new_quiz(client, alice, count=50)
    assert full["total"] == 12 and full["config"]["requested"] == 50          # no se rellena
    assert len({q["question_id"] for q in full["questions"]}) == 12


def test_filters_and_errors(client, alice, bob, bank):
    doc, items = bank
    sections = api(client, alice, "GET", f"/api/documents/{doc['id']}/sections")
    tema2 = sections[1]
    quiz = new_quiz(client, alice, section_ids=[tema2["id"]], count=10)
    assert quiz["total"] == 3 and {q["top_section_title"] for q in quiz["questions"]} == {tema2["title"]}

    level = items[0]["difficulty"]
    quiz = new_quiz(client, alice, difficulties=[level], count=20)
    assert all(q["difficulty"] == level for q in quiz["questions"])

    api(client, alice, "POST", "/api/questions/bulk", json={"ids": [i["id"] for i in items[1:]], "action": "discard"})
    quiz = new_quiz(client, alice, count=20)
    assert [q["question_id"] for q in quiz["questions"]] == [items[0]["id"]]   # nunca descartadas
    assert new_quiz(client, alice, expected=422, only_reviewed=True)["detail"]
    api(client, alice, "POST", "/api/questions/bulk", json={"ids": [items[0]["id"]], "action": "add_tag", "tag": "repaso"})
    assert new_quiz(client, alice, tags=["Repaso"])["total"] == 1
    assert new_quiz(client, alice, expected=422, tags=["otra"])

    new_quiz(client, bob, expected=404, section_ids=[tema2["id"]])          # sección ajena
    new_quiz(client, bob, expected=404, document_ids=[doc["id"]])
    assert "Tu banco aún no tiene preguntas" in new_quiz(client, bob, expected=422)["detail"]


def test_unseen_failed_and_weak_modes(client, alice, bank):
    _, items = bank
    first = new_quiz(client, alice, count=4)
    qs = first["questions"]
    answer(client, alice, first, 1, correct_label(client, alice, qs[0]))
    answer(client, alice, first, 2, wrong_label(client, alice, qs[1]))
    # 3 y 4 en blanco al entregar
    api(client, alice, "POST", f"/api/quizzes/{first['id']}/finish")
    seen = {q["question_id"] for q in qs}

    unseen = new_quiz(client, alice, selection="unseen", count=50)
    assert unseen["total"] == 8 and not seen & {q["question_id"] for q in unseen["questions"]}

    failed = new_quiz(client, alice, selection="failed", count=50, mode="exam")
    assert {q["question_id"] for q in failed["questions"]} == {qs[1]["question_id"], qs[2]["question_id"],
                                                               qs[3]["question_id"]}
    # un examen sin entregar no cuenta: siguen siendo las mismas falladas
    assert new_quiz(client, alice, selection="failed", count=50)["total"] == 3

    weak = new_quiz(client, alice, selection="weak", count=4)                 # primero las falladas
    assert {q["question_id"] for q in weak["questions"][:3]} == {qs[1]["question_id"], qs[2]["question_id"],
                                                                 qs[3]["question_id"]}
    assert weak["questions"][3]["question_id"] != qs[0]["question_id"]       # luego las nunca vistas

    # Acertarla después la saca de "falladas"
    redo = api(client, alice, "POST", f"/api/quizzes/{first['id']}/retry", 201)
    assert redo["source_quiz_id"] == first["id"] and redo["total"] == 3
    for q in redo["questions"]:
        answer(client, alice, redo, q["ordinal"], correct_label(client, alice, q))
    assert new_quiz(client, alice, selection="failed", expected=422)["detail"].endswith("(no hay preguntas falladas)")


def test_quiz_keeps_its_copy_when_bank_changes(client, alice, bank):
    quiz = new_quiz(client, alice, count=2, mode="exam")
    q1, q2 = quiz["questions"]
    right = correct_label(client, alice, q1)
    new_correct = next(label for label in "ABCD" if label != right)
    # el banco usa sus propias letras: editar la correcta allí y el enunciado
    bank_q = api(client, alice, "GET", f"/api/questions/{q1['question_id']}")
    bank_new = next(o["label"] for o in bank_q["options"] if not o["is_correct"])
    api(client, alice, "PATCH", f"/api/questions/{q1['question_id']}", json={"stem": "Enunciado cambiado después del test?",
                                                                               "correct_label": bank_new})
    api(client, alice, "DELETE", f"/api/questions/{q2['question_id']}", 204)
    answer(client, alice, quiz, 1, right)
    done = api(client, alice, "POST", f"/api/quizzes/{quiz['id']}/finish")
    assert done["questions"][0]["stem"] == q1["stem"] and done["questions"][0]["is_correct"] is True
    assert done["questions"][0]["correct_label"] == right != new_correct
    assert done["questions"][1]["question_id"] is None and done["questions"][1]["stem"] == q2["stem"]


def test_shuffled_options_keep_the_right_answer(client, alice, bank):
    quiz = new_quiz(client, alice, count=12, shuffle_options=True, mode="exam")
    for q in quiz["questions"]:
        answer(client, alice, quiz, q["ordinal"], correct_label(client, alice, q))
    done = api(client, alice, "POST", f"/api/quizzes/{quiz['id']}/finish")
    assert done["correct"] == 12 and done["score"] == 10


def test_statistics(client, alice, bank, owner_engine):
    doc, items = bank
    assert api(client, alice, "GET", "/api/stats")["totals"]["answered"] == 0

    # Test 1: todo bien salvo el tema con 6 preguntas, donde se falla todo.
    quiz = new_quiz(client, alice, count=12, mode="exam")
    big_topic = Counter(q["top_section_title"] for q in quiz["questions"]).most_common(1)[0][0]
    for q in quiz["questions"]:
        label = wrong_label if q["top_section_title"] == big_topic else correct_label
        answer(client, alice, quiz, q["ordinal"], label(client, alice, q))
    api(client, alice, "POST", f"/api/quizzes/{quiz['id']}/finish")
    # Test 2: práctica sin entregar: lo respondido cuenta; un examen sin entregar, no.
    practice = new_quiz(client, alice, count=12)
    target = next(q for q in practice["questions"] if q["top_section_title"] != big_topic)
    answer(client, alice, practice, target["ordinal"], correct_label(client, alice, target))
    exam = new_quiz(client, alice, count=2, mode="exam")
    answer(client, alice, exam, 1, "A")

    s = api(client, alice, "GET", "/api/stats")
    assert s["quizzes_finished"] == 1 and s["quizzes_in_progress"] == 2
    assert s["totals"] == {"key": None, "title": None, "answered": 13, "correct": 7, "wrong": 6, "blank": 0,
                           "accuracy": round(7 / 13, 4)}
    assert s["by_topic"][0]["title"] == big_topic and s["by_topic"][0]["accuracy"] == 0   # lo peor, primero
    assert all(t["accuracy"] == 1 for t in s["by_topic"][1:])
    assert sum(d["answered"] for d in s["by_difficulty"]) == 13
    assert [p["score"] for p in s["scores"]] == [pytest.approx((6 - 6 / 3) / 12 * 10, abs=0.01)]
    assert len(s["most_failed"]) == 6 and all(f["last_result"] == "wrong" for f in s["most_failed"])
    cov = s["coverage"]
    assert (cov["active_questions"], cov["seen"], cov["unseen"], cov["to_review"]) == (12, 12, 0, 6)
    assert cov["mastered"] == 1                     # acertada dos veces seguidas

    assert api(client, alice, "GET", "/api/stats", params={"document_id": doc["id"]})["totals"]["answered"] == 13
    with owner_engine.begin() as conn:
        other = conn.execute(text("select gen_random_uuid()")).scalar_one()
    empty = api(client, alice, "GET", "/api/stats", params={"document_id": str(other)})
    assert empty["totals"]["answered"] == 0 and empty["scores"] == []

    api(client, alice, "DELETE", f"/api/quizzes/{quiz['id']}", 204)     # borrar un test lo saca de las estadísticas
    assert api(client, alice, "GET", "/api/stats")["totals"]["answered"] == 1


def test_quizzes_are_private(client, alice, bob, bank):
    quiz = new_quiz(client, alice, count=3)
    api(client, bob, "GET", f"/api/quizzes/{quiz['id']}", 404)
    answer(client, bob, quiz, 1, "A", expected=404)
    api(client, bob, "POST", f"/api/quizzes/{quiz['id']}/finish", 404)
    api(client, bob, "DELETE", f"/api/quizzes/{quiz['id']}", 404)
    assert api(client, bob, "GET", "/api/quizzes")["total"] == 0
    assert api(client, bob, "GET", "/api/stats")["coverage"]["active_questions"] == 0
    listed = api(client, alice, "GET", "/api/quizzes")
    assert listed["total"] == 1 and listed["items"][0]["answered"] == 0


def test_documents_report_their_question_count(client, alice, bank):
    doc, items = bank
    listed = api(client, alice, "GET", "/api/documents")
    assert listed[0]["question_count"] == len(items)
    api(client, alice, "PATCH", f"/api/questions/{items[0]['id']}", json={"status": "discarded"})
    assert api(client, alice, "GET", f"/api/documents/{doc['id']}")["question_count"] == len(items) - 1


def test_random_prefers_questions_not_seen_in_previous_tests(client, alice, bank):
    first = new_quiz(client, alice, count=6, mode="exam")
    api(client, alice, "POST", f"/api/quizzes/{first['id']}/finish")
    seen = {q["question_id"] for q in first["questions"]}
    second = new_quiz(client, alice, count=6)                  # quedan justo 6 sin ver
    assert not seen & {q["question_id"] for q in second["questions"]}
    third = new_quiz(client, alice, count=12)                  # no hay 12 sin ver: no se queda corto
    assert third["total"] == 12
