"""Invariantes del banco garantizadas por la propia base de datos.

Aunque un bug en el motor intentara guardar una pregunta defectuosa, Postgres la rechaza.
"""
import pytest
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError, IntegrityError

from app.db import user_session
from tests.factories import insert_document_with_pages, insert_question


@pytest.fixture
def doc(alice):
    doc_id, page_ids = insert_document_with_pages(alice["id"], ["El medicamento A se administra a dosis de 20 mg", "Otra página"])
    return {"user": alice["id"], "id": doc_id, "pages": page_ids}


def test_valid_question_is_stored(doc):
    with user_session(doc["user"]) as s:
        qid, _ = insert_question(s, doc["user"], doc["id"], doc["pages"][0], 1)
    with user_session(doc["user"]) as s:
        assert s.execute(text("select count(*) from question_options where question_id = :q"), {"q": qid}).scalar_one() == 4


def test_zero_correct_answers_rejected(doc):
    opts = [("A", "20 mg", False), ("B", "40 mg", False), ("C", "10 mg", False), ("D", "5 mg", False)]
    with pytest.raises(DBAPIError, match="exactamente 1 respuesta correcta"):
        with user_session(doc["user"]) as s:
            insert_question(s, doc["user"], doc["id"], doc["pages"][0], 1, options=opts)


def test_two_correct_answers_rejected(doc):
    opts = [("A", "20 mg", True), ("B", "40 mg", True), ("C", "10 mg", False), ("D", "5 mg", False)]
    with pytest.raises(IntegrityError):
        with user_session(doc["user"]) as s:
            insert_question(s, doc["user"], doc["id"], doc["pages"][0], 1, options=opts)


def test_three_options_rejected(doc):
    opts = [("A", "20 mg", True), ("B", "40 mg", False), ("C", "10 mg", False)]
    with pytest.raises(DBAPIError, match="exactamente 4 opciones"):
        with user_session(doc["user"]) as s:
            insert_question(s, doc["user"], doc["id"], doc["pages"][0], 1, options=opts)


def test_fifth_option_rejected(doc):
    opts = [("A", "20 mg", True), ("B", "40 mg", False), ("C", "10 mg", False), ("D", "5 mg", False), ("E", "1 mg", False)]
    with pytest.raises(IntegrityError):
        with user_session(doc["user"]) as s:
            insert_question(s, doc["user"], doc["id"], doc["pages"][0], 1, options=opts)


def test_duplicate_option_text_rejected(doc):
    opts = [("A", "20 mg", True), ("B", " 20  MG ", False), ("C", "10 mg", False), ("D", "5 mg", False)]
    with pytest.raises(IntegrityError):
        with user_session(doc["user"]) as s:
            insert_question(s, doc["user"], doc["id"], doc["pages"][0], 1, options=opts)


def test_question_without_evidence_rejected(doc):
    with pytest.raises(DBAPIError, match="no tiene evidencia"):
        with user_session(doc["user"]) as s:
            insert_question(s, doc["user"], doc["id"], doc["pages"][0], 1, sources=False)


def test_cited_page_must_belong_to_question_document(doc):
    other_doc, other_pages = insert_document_with_pages(doc["user"], ["Página de otro documento"])
    with pytest.raises(IntegrityError):
        with user_session(doc["user"]) as s:
            insert_question(s, doc["user"], doc["id"], other_pages[0], 1)


def test_page_number_must_match_referenced_page(doc):
    with pytest.raises(DBAPIError, match="no corresponde"):
        with user_session(doc["user"]) as s:
            insert_question(s, doc["user"], doc["id"], doc["pages"][0], 2)


def test_removing_an_option_from_saved_question_rejected(doc):
    with user_session(doc["user"]) as s:
        qid, opts = insert_question(s, doc["user"], doc["id"], doc["pages"][0], 1)
    with pytest.raises(DBAPIError, match="exactamente 4 opciones"):
        with user_session(doc["user"]) as s:
            s.execute(text("delete from question_options where id = :id"), {"id": opts["D"]})


def test_moving_correct_flag_atomically_is_allowed(doc):
    with user_session(doc["user"]) as s:
        qid, opts = insert_question(s, doc["user"], doc["id"], doc["pages"][0], 1)
    with user_session(doc["user"]) as s:
        s.execute(text("update question_options set is_correct = false where id = :id"), {"id": opts["A"]})
        s.execute(text("update question_options set is_correct = true where id = :id"), {"id": opts["B"]})


def test_distractor_source_must_reference_option_of_same_question(doc):
    with user_session(doc["user"]) as s:
        q1, opts1 = insert_question(s, doc["user"], doc["id"], doc["pages"][0], 1)
        q2, _ = insert_question(s, doc["user"], doc["id"], doc["pages"][0], 1, stem="¿Cuál es la dosis del medicamento B?")
    with pytest.raises(IntegrityError):
        with user_session(doc["user"]) as s:
            s.execute(text("insert into question_sources (question_id, user_id, document_id, option_id, role, page_id, page_number, quote)"
                           " values (:q, :u, :d, :o, 'distractor', :p, 1, 'cita')"),
                      {"q": q2, "u": doc["user"], "d": doc["id"], "o": opts1["B"], "p": doc["pages"][0]})


def test_sequence_number_per_user(doc, bob):
    with user_session(doc["user"]) as s:
        q1, _ = insert_question(s, doc["user"], doc["id"], doc["pages"][0], 1)
        q2, _ = insert_question(s, doc["user"], doc["id"], doc["pages"][0], 1, stem="¿Qué dosis corresponde al medicamento C?")
        seqs = s.execute(text("select seq from questions order by seq")).scalars().all()
    assert seqs == [1, 2]
    bob_doc, bob_pages = insert_document_with_pages(bob["id"], ["Dosis de 20 mg"])
    with user_session(bob["id"]) as s:
        insert_question(s, bob["id"], bob_doc, bob_pages[0], 1)
        assert s.execute(text("select seq from questions")).scalar_one() == 1


def test_deleting_document_cascades_cleanly(doc):
    with user_session(doc["user"]) as s:
        insert_question(s, doc["user"], doc["id"], doc["pages"][0], 1)
    with user_session(doc["user"]) as s:
        s.execute(text("delete from documents where id = :d"), {"d": doc["id"]})
        assert s.execute(text("select count(*) from questions")).scalar_one() == 0
        assert s.execute(text("select count(*) from question_sources")).scalar_one() == 0
