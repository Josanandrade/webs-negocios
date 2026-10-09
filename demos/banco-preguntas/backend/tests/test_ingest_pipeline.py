"""Flujo real: subir documento -> worker -> páginas extraídas, limpias y evaluadas."""
import pytest
from sqlalchemy import text

from app.db import user_session
from app.ingestion.ocr import tesseract_available
from app.jobs.runner import run_one
from tests.factories import make_docx, make_noise_pdf, make_pdf, make_scanned_pdf, merge_pdfs

PARRAFO = ("La insuficiencia renal aguda se define como la pérdida brusca de la función renal. "
           "Se clasifica en prerrenal, renal y postrenal según su origen. "
           "El tratamiento inicial consiste en corregir la causa desencadenante.")


def upload(client, user, data, name="temario.pdf", mime="application/pdf"):
    r = client.post("/api/documents", headers=user["headers"], files={"file": (name, data, mime)})
    assert r.status_code == 201, r.text
    return r.json()


def drain():
    while run_one("test-worker", retry_delay_seconds=0) is not None:
        pass


def test_native_pdf_end_to_end(client, alice):
    pages = [f"Manual de Nefrología\n{PARRAFO} Apartado {chr(64 + i)}.\n{i}" for i in range(1, 6)]
    doc = upload(client, alice, make_pdf(pages))
    drain()
    d = client.get(f"/api/documents/{doc['id']}", headers=alice["headers"]).json()
    assert d["status"] == "ready"
    assert d["page_count"] == 5
    assert d["text_layer"] == "native"
    assert d["stats"]["pages_eligible"] == 5
    assert d["latest_job"]["status"] == "succeeded"
    assert d["latest_job"]["progress_current"] == d["latest_job"]["progress_total"]

    page3 = client.get(f"/api/documents/{doc['id']}/pages/3", headers=alice["headers"]).json()
    assert "Apartado C." in page3["text"]
    assert "Manual de Nefrología" not in page3["text"]   # cabecera repetida eliminada
    assert page3["extraction_method"] == "native"


@pytest.mark.skipif(not tesseract_available(), reason="Tesseract no instalado")
def test_partially_scanned_pdf(client, alice):
    data = merge_pdfs(make_pdf([PARRAFO]), make_scanned_pdf([PARRAFO]), make_noise_pdf())
    doc = upload(client, alice, data)
    drain()
    d = client.get(f"/api/documents/{doc['id']}", headers=alice["headers"]).json()
    assert d["status"] == "ready"
    assert d["text_layer"] == "partial"
    assert d["stats"]["pages_ocr"] == 2
    pages = client.get(f"/api/documents/{doc['id']}/pages", headers=alice["headers"]).json()
    assert [p["extraction_method"] for p in pages] == ["native", "ocr", "ocr"]
    assert pages[0]["is_eligible"] and pages[1]["is_eligible"]
    assert "ocr" in pages[1]["quality_flags"]
    assert pages[1]["ocr_confidence"] > 80
    assert not pages[2]["is_eligible"]                    # ruido: nunca generará preguntas


@pytest.mark.skipif(not tesseract_available(), reason="Tesseract no instalado")
def test_fully_scanned_pdf(client, alice):
    doc = upload(client, alice, make_scanned_pdf([PARRAFO, PARRAFO + " Segunda página."]))
    drain()
    d = client.get(f"/api/documents/{doc['id']}", headers=alice["headers"]).json()
    assert d["text_layer"] == "scanned"
    assert d["stats"]["ocr_mean_confidence"] > 80


def test_docx_is_converted_and_paginated(client, alice):
    data = make_docx([PARRAFO, "Segunda parte. " + PARRAFO], page_break_after={0})
    doc = upload(client, alice, data, name="temario.docx",
                 mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    drain()
    d = client.get(f"/api/documents/{doc['id']}", headers=alice["headers"]).json()
    assert d["status"] == "ready", d
    assert d["page_count"] == 2
    p2 = client.get(f"/api/documents/{doc['id']}/pages/2", headers=alice["headers"]).json()
    assert p2["text"].startswith("Segunda parte.")


def test_corrupt_pdf_fails_after_retries_with_visible_error(client, alice):
    doc = upload(client, alice, b"%PDF-1.4\nesto no es un pdf valido")
    drain()
    d = client.get(f"/api/documents/{doc['id']}", headers=alice["headers"]).json()
    assert d["status"] == "error"
    assert "PDF" in d["error"]
    job = d["latest_job"]
    assert job["status"] == "failed" and job["attempts"] == 3


def test_pages_of_other_user_not_accessible(client, alice, bob):
    doc = upload(client, alice, make_pdf([PARRAFO]))
    drain()
    assert client.get(f"/api/documents/{doc['id']}/pages", headers=bob["headers"]).status_code == 404
    assert client.get(f"/api/documents/{doc['id']}/pages/1", headers=bob["headers"]).status_code == 404
    with user_session(bob["id"]) as s:
        assert s.execute(text("select count(*) from document_pages")).scalar_one() == 0


def test_structure_chunks_and_search_end_to_end(client, alice):
    from tests.factories import make_structured_pdf

    p = ("Los residuos del grupo III son residuos sanitarios específicos que requieren tratamiento "
         "especial. Deben almacenarse en contenedores rígidos de color amarillo durante un máximo de 72 horas. ")
    q = "El transporte externo de residuos lo realiza un gestor autorizado con vehículos homologados. "
    data = make_structured_pdf(
        [[("h1", "Tema 1. Clasificación"), ("p", p * 4)],
         [("h2", "1.1. Grupo III"), ("p", p * 4)],
         [("h1", "Tema 2. Transporte"), ("p", q * 6)]],
        toc=[[1, "Tema 1. Clasificación", 1], [2, "1.1. Grupo III", 2], [1, "Tema 2. Transporte", 3]])
    doc = upload(client, alice, data)
    drain()
    h = alice["headers"]
    d = client.get(f"/api/documents/{doc['id']}", headers=h).json()
    assert d["status"] == "ready"
    assert d["stats"]["sections"] == 3 and d["stats"]["top_level_sections"] == 2
    assert d["stats"]["chunks"] >= 3 and d["stats"]["chunks_eligible"] >= 3

    tree = client.get(f"/api/documents/{doc['id']}/sections", headers=h).json()
    assert [s["title"] for s in tree] == ["Tema 1. Clasificación", "Tema 2. Transporte"]
    assert [c["title"] for c in tree[0]["children"]] == ["1.1. Grupo III"]
    assert tree[0]["chunks"] >= tree[0]["children"][0]["chunks"] >= 1

    chunks = client.get(f"/api/documents/{doc['id']}/chunks", headers=h).json()
    for c in chunks:   # trazabilidad: cada span reproduce el texto de su página
        parts = []
        for span in c["spans"]:
            page = client.get(f"/api/documents/{doc['id']}/pages/{span['page']}", headers=h).json()
            parts.append(page["text"][span["start"]:span["end"]])
        assert "\n".join(parts) == c["text"]
    assert any(c["context_header"] == "Tema 1. Clasificación › 1.1. Grupo III" for c in chunks)

    hits = client.get(f"/api/documents/{doc['id']}/search", params={"q": "vehículos homologados"}, headers=h).json()
    assert hits and hits[0]["page_start"] == 3 and "Tema 2" in hits[0]["context_header"]
    assert "«" in hits[0]["snippet"]
    fuzzy = client.get(f"/api/documents/{doc['id']}/search", params={"q": "contenedores amarilo"}, headers=h).json()
    assert fuzzy, "la búsqueda debe tolerar pequeñas erratas"


def test_structure_endpoints_are_private(client, alice, bob):
    doc = upload(client, alice, make_pdf([PARRAFO * 3]))
    drain()
    for path in ("sections", "chunks", "search?q=renal"):
        assert client.get(f"/api/documents/{doc['id']}/{path}", headers=bob["headers"]).status_code == 404


def test_failure_during_indexing_leaves_no_partial_chunks(client, alice, monkeypatch):
    import app.ingestion.pipeline as pipeline
    from app.ingestion.chunking import chunk_document as real

    state = {"fail": True}

    def flaky(pages, boundaries):
        chunks = real(pages, boundaries)
        if state["fail"]:
            state["fail"] = False
            chunks[1].spans = None   # provoca error en mitad de la inserción
        return chunks

    monkeypatch.setattr(pipeline, "chunk_document", flaky)
    doc = upload(client, alice, make_pdf([PARRAFO * 12, PARRAFO * 12]))
    run_one("w", retry_delay_seconds=0)
    with user_session(alice["id"]) as s:
        assert s.execute(text("select count(*) from document_chunks")).scalar_one() == 0
        assert s.execute(text("select count(*) from document_sections")).scalar_one() == 1
    drain()
    d = client.get(f"/api/documents/{doc['id']}", headers=alice["headers"]).json()
    assert d["status"] == "ready" and d["latest_job"]["attempts"] == 2
    with user_session(alice["id"]) as s:
        n = s.execute(text("select count(*) from document_chunks")).scalar_one()
        ordinals = s.execute(text("select array_agg(ordinal order by ordinal) from document_chunks")).scalar_one()
    assert n >= 2 and ordinals == list(range(n))
