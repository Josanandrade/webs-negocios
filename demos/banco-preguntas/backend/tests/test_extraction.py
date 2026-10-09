"""Extracción por página, OCR y calidad — con PDFs reales y Tesseract real."""
import pytest

from app.ingestion.cleanup import normalize_text, remove_repeated_margins
from app.ingestion.extract import UnsupportedDocument, extract_page, open_pdf
from app.ingestion.ocr import parse_tsv, tesseract_available
from app.ingestion.quality import assess_page
from tests.factories import make_noise_pdf, make_pdf, make_scanned_pdf

TEXTO = ("El medicamento Alfa se administra a una dosis de 20 mg cada ocho horas. "
         "El medicamento Beta requiere una dosis de 40 mg diarios. "
         "La administración debe suspenderse si aparece hipotensión grave.")

needs_tesseract = pytest.mark.skipif(not tesseract_available(), reason="Tesseract no instalado")


def test_native_page_uses_text_layer():
    pdf = open_pdf(make_pdf([TEXTO]))
    page = extract_page(pdf, 0, ocr=lambda png: pytest.fail("no debe hacer OCR en una página nativa"))
    assert page.method == "native"
    assert "20 mg" in page.raw_text
    assert page.ocr_confidence is None


@needs_tesseract
def test_scanned_page_is_ocred_with_confidence():
    pdf = open_pdf(make_scanned_pdf([TEXTO]))
    page = extract_page(pdf, 0)
    assert page.method == "ocr"
    assert page.image_coverage > 0.9
    assert page.ocr_confidence is not None and page.ocr_confidence > 80
    assert "20 mg" in page.raw_text and "40 mg" in page.raw_text
    report = assess_page(normalize_text(page.raw_text), page.method, page.ocr_confidence)
    assert report.eligible and "ocr" in report.flags


@needs_tesseract
def test_noise_image_is_not_eligible():
    pdf = open_pdf(make_noise_pdf())
    page = extract_page(pdf, 0)
    report = assess_page(normalize_text(page.raw_text), page.method, page.ocr_confidence)
    assert not report.eligible


def test_ocr_unavailable_marks_page_not_eligible():
    from app.ingestion.ocr import OcrUnavailable

    def no_ocr(png):
        raise OcrUnavailable("sin tesseract")

    pdf = open_pdf(make_scanned_pdf(["Texto escaneado de prueba"]))
    page = extract_page(pdf, 0, ocr=no_ocr)
    assert "ocr_no_disponible" in page.flags


def test_low_ocr_confidence_is_not_eligible():
    report = assess_page(TEXTO, "ocr", 62.0)
    assert not report.eligible
    assert "ocr_baja_confianza" in report.flags


def test_garbled_text_is_not_eligible():
    garbage = " ".join(["x", "q", "%%", "��", "z", "k", "#"] * 40)
    assert not assess_page(garbage, "native", None).eligible


def test_blank_or_tiny_page_is_not_eligible():
    assert not assess_page("Tema 3", "native", None).eligible


def test_invalid_pdf_rejected():
    with pytest.raises(UnsupportedDocument):
        open_pdf(b"%PDF-1.4 roto")


def test_normalize_joins_hyphenated_words_and_spaces():
    assert normalize_text("medica-\nmento   de  uso\n\n\n\nhospitalario") == "medicamento de uso\n\nhospitalario"
    # Un guion legítimo seguido de mayúscula no se une
    assert normalize_text("Norte-\nSur") == "Norte-\nSur"


def test_repeated_headers_footers_and_page_numbers_removed():
    pages = [f"Manual de Farmacología\nContenido único {i}\nmás texto {i}\nPágina {i} de 6" for i in range(1, 7)]
    cleaned, removed = remove_repeated_margins(pages)
    for i, body in enumerate(cleaned, start=1):
        assert "Manual de Farmacología" not in body
        assert "Página" not in body
        assert f"Contenido único {i}" in body
    assert "manual de farmacología" in removed


def test_body_lines_with_numbers_are_kept():
    pages = [f"Libro\nLa dosis del fármaco {i} es de {10 * i} mg.\nTexto propio {i}\nOtro párrafo\nFin" for i in range(1, 7)]
    cleaned, _ = remove_repeated_margins(pages)
    for i, body in enumerate(cleaned, start=1):
        assert f"es de {10 * i} mg" in body


def test_page_counter_with_offset_removed():
    pages = [f"Cuerpo de la página {chr(65 + i)} con texto suficiente\nTema 2 · {44 + i}" for i in range(6)]
    cleaned, _ = remove_repeated_margins(pages)
    assert all("Tema 2" not in body and body.startswith("Cuerpo") for body in cleaned)


def test_parse_tsv_confidence_weighted():
    tsv = ("level\tpage_num\tblock_num\tpar_num\tline_num\tword_num\tleft\ttop\twidth\theight\tconf\ttext\n"
           "5\t1\t1\t1\t1\t1\t0\t0\t1\t1\t90\tDosis\n"
           "5\t1\t1\t1\t1\t2\t0\t0\t1\t1\t60\tde\n"
           "5\t1\t1\t2\t1\t1\t0\t0\t1\t1\t-1\t\n"
           "5\t1\t1\t2\t1\t2\t0\t0\t1\t1\t95\t20mg\n")
    r = parse_tsv(tsv)
    assert r.text == "Dosis de\n\n20mg"
    assert r.words == 3
    assert r.confidence == round((90 * 5 + 60 * 2 + 95 * 4) / 11, 2)
