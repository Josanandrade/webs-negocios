from tests.factories import make_pdf


def upload(client, user, data: bytes, name="temario.pdf"):
    return client.post("/api/documents", headers=user["headers"], files={"file": (name, data, "application/pdf")})


def test_upload_pdf_creates_document_and_pending_job(client, alice, storage_dir):
    r = upload(client, alice, make_pdf(["Tema 1. Introducción", "Contenido de la página dos"]))
    assert r.status_code == 201, r.text
    doc = r.json()
    assert doc["status"] == "uploaded"
    assert doc["mime_type"] == "application/pdf"
    assert doc["title"] == "temario"
    assert doc["latest_job"]["kind"] == "ingest"
    assert doc["latest_job"]["status"] == "pending"
    assert (storage_dir / str(alice["id"]) / f"{doc['id']}.pdf").exists()

    listed = client.get("/api/documents", headers=alice["headers"]).json()
    assert [d["id"] for d in listed] == [doc["id"]]
    job = client.get(f"/api/jobs/{doc['latest_job']['id']}", headers=alice["headers"])
    assert job.status_code == 200


def test_same_file_twice_is_rejected(client, alice):
    data = make_pdf(["Contenido único"])
    first = upload(client, alice, data)
    second = upload(client, alice, data)
    assert second.status_code == 409
    assert second.json()["detail"]["document_id"] == first.json()["id"]


def test_same_file_by_two_users_is_allowed(client, alice, bob):
    data = make_pdf(["Contenido compartido"])
    assert upload(client, alice, data).status_code == 201
    assert upload(client, bob, data).status_code == 201


def test_rejects_non_pdf_even_with_pdf_extension(client, alice):
    r = upload(client, alice, b"esto no es un pdf", name="falso.pdf")
    assert r.status_code == 415


def test_rejects_empty_file(client, alice):
    assert upload(client, alice, b"").status_code == 400


def test_delete_document_removes_file(client, alice, storage_dir):
    doc = upload(client, alice, make_pdf(["Para borrar"])).json()
    path = storage_dir / str(alice["id"]) / f"{doc['id']}.pdf"
    assert path.exists()
    assert client.delete(f"/api/documents/{doc['id']}", headers=alice["headers"]).status_code == 204
    assert not path.exists()
    assert client.get(f"/api/documents/{doc['id']}", headers=alice["headers"]).status_code == 404
