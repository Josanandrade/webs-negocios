"""Un usuario nunca puede ver ni tocar datos de otro: ni por API ni directamente en BD (RLS)."""
import uuid

import pytest
from sqlalchemy import text
from sqlalchemy.exc import DBAPIError

from app.db import anonymous_session, user_session
from tests.factories import insert_document_with_pages, insert_question, make_pdf


def test_api_hides_other_users_documents_and_jobs(client, alice, bob):
    doc = client.post("/api/documents", headers=alice["headers"],
                      files={"file": ("a.pdf", make_pdf(["Privado de Alice"]), "application/pdf")}).json()
    assert client.get("/api/documents", headers=bob["headers"]).json() == []
    assert client.get(f"/api/documents/{doc['id']}", headers=bob["headers"]).status_code == 404
    assert client.get(f"/api/jobs/{doc['latest_job']['id']}", headers=bob["headers"]).status_code == 404
    assert client.delete(f"/api/documents/{doc['id']}", headers=bob["headers"]).status_code == 404
    # Sigue existiendo para su dueña
    assert client.get(f"/api/documents/{doc['id']}", headers=alice["headers"]).status_code == 200


def test_rls_filters_even_without_where_clause(alice, bob):
    doc_id, _ = insert_document_with_pages(alice["id"], ["Página de Alice"])
    with user_session(bob["id"]) as s:
        for table in ("documents", "document_pages", "processing_jobs", "questions"):
            assert s.execute(text(f"select count(*) from {table}")).scalar_one() == 0
        assert s.execute(text("select count(*) from users")).scalar_one() == 1  # solo él mismo
    with user_session(alice["id"]) as s:
        assert s.execute(text("select count(*) from document_pages")).scalar_one() == 1


def test_anonymous_session_sees_nothing(alice):
    insert_document_with_pages(alice["id"], ["Página"])
    with anonymous_session() as s:
        assert s.execute(text("select count(*) from documents")).scalar_one() == 0
        assert s.execute(text("select count(*) from users")).scalar_one() == 0


def test_cannot_insert_rows_owned_by_someone_else(alice, bob):
    with pytest.raises(DBAPIError, match="row-level security"):
        with user_session(bob["id"]) as s:
            s.execute(text("insert into documents (user_id, title, original_filename, mime_type, size_bytes, sha256, storage_key)"
                           " values (:u, 't', 't.pdf', 'application/pdf', 1, :sha, 'k')"),
                      {"u": alice["id"], "sha": "0" * 64})


def test_cannot_attach_page_to_other_users_document(alice, bob):
    doc_id, _ = insert_document_with_pages(alice["id"], ["Página"])
    with pytest.raises(DBAPIError):
        with user_session(bob["id"]) as s:
            s.execute(text("insert into document_pages (document_id, user_id, page_number, extraction_method)"
                           " values (:d, :u, 2, 'native')"), {"d": doc_id, "u": bob["id"]})


def test_cannot_update_or_delete_other_users_rows(alice, bob):
    doc_id, page_ids = insert_document_with_pages(alice["id"], ["Dosis de 20 mg"])
    with user_session(alice["id"]) as s:
        insert_question(s, alice["id"], doc_id, page_ids[0], 1)
    with user_session(bob["id"]) as s:
        assert s.execute(text("update documents set title = 'hackeado'")).rowcount == 0
        assert s.execute(text("delete from questions")).rowcount == 0
        assert s.execute(text("delete from question_options")).rowcount == 0
    with user_session(alice["id"]) as s:
        assert s.execute(text("select title from documents")).scalar_one() == "Temario"
        assert s.execute(text("select count(*) from question_options")).scalar_one() == 4


def test_app_role_cannot_bypass_rls(app_engine):
    with app_engine.connect() as conn:
        row = conn.execute(text("select rolsuper, rolbypassrls from pg_roles where rolname = current_user")).one()
        assert row == (False, False)
        with pytest.raises(DBAPIError):
            conn.execute(text("alter table documents disable row level security"))


def test_forged_token_for_unknown_user_is_rejected(client):
    from app.security import create_access_token

    token = create_access_token(uuid.uuid4())
    assert client.get("/api/documents", headers={"Authorization": f"Bearer {token}"}).status_code == 401
