"""Detección de estructura con PDFs reales (outline, tipografía, índice, sin estructura)."""
import pymupdf as fitz

from app.ingestion.cleanup import normalize_text
from app.ingestion.extract import native_text
from app.ingestion.structure import build_sections, detect_headings, text_pattern_headings
from tests.factories import make_pdf, make_structured_pdf

P = ("La gestión de residuos sanitarios se rige por normas específicas que clasifican los residuos "
     "en grupos según su peligrosidad y establecen los requisitos de almacenamiento y transporte. ")


def analyze(data: bytes):
    pdf = fitz.open(stream=data, filetype="pdf")
    pages_text = {i + 1: normalize_text(native_text(pdf[i])) for i in range(pdf.page_count)}
    headings = detect_headings(pdf, pages_text, set())
    return headings, build_sections(headings, pdf.page_count, pages_text), pages_text


def test_outline_is_preferred_and_hierarchical():
    data = make_structured_pdf(
        [[("h1", "Tema 1. Residuos"), ("p", P * 3)],
         [("h2", "1.1 Clasificación"), ("p", P * 3)],
         [("h1", "Tema 2. Transporte"), ("p", P * 3)]],
        toc=[[1, "Tema 1. Residuos", 1], [2, "1.1 Clasificación", 2], [1, "Tema 2. Transporte", 3]])
    headings, sections, pages_text = analyze(data)
    assert [(s.level, s.title, s.start_page, s.end_page, s.source) for s in sections] == [
        (1, "Tema 1. Residuos", 1, 2, "outline"),
        (2, "1.1 Clasificación", 2, 2, "outline"),
        (1, "Tema 2. Transporte", 3, 3, "outline"),
    ]
    assert sections[1].parent == 0 and sections[2].parent is None
    assert pages_text[3][sections[2].start_char:].startswith("Tema 2")


def test_single_root_outline_is_promoted():
    data = make_structured_pdf([[("h1", "Tema 1. A"), ("p", P)], [("h1", "Tema 2. B"), ("p", P)]],
                               toc=[[1, "Manual completo", 1], [2, "Tema 1. A", 1], [2, "Tema 2. B", 2]])
    _, sections, _ = analyze(data)
    assert [(s.level, s.title) for s in sections] == [(1, "Tema 1. A"), (1, "Tema 2. B")]


def test_typographic_headings_without_outline():
    data = make_structured_pdf(
        [[("h1", "Tema 1. Introducción"), ("p", P * 2), ("h2", "1.1. Concepto"), ("p", P * 2)],
         [("p", P * 2), ("h2", "1.2. Tipos"), ("p", P * 2)],
         [("h1", "Tema 2. Normativa"), ("p", P * 3)]])
    _, sections, pages_text = analyze(data)
    assert [(s.level, s.title, s.start_page) for s in sections] == [
        (1, "Tema 1. Introducción", 1), (2, "1.1. Concepto", 1), (2, "1.2. Tipos", 2), (1, "Tema 2. Normativa", 3)]
    assert all(s.source == "heuristic" for s in sections)
    assert pages_text[2][sections[2].start_char:].startswith("1.2. Tipos")
    # 1.1 continúa al principio de la página 2 (1.2 empieza a mitad de página)
    assert sections[0].end_page == 2 and sections[1].end_page == 2


def test_table_of_contents_entries_are_not_headings():
    data = make_structured_pdf(
        [[("h1", "Índice"), ("p", "Tema 1. Introducción ........ 2\nTema 2. Normativa ........ 3")],
         [("h1", "Tema 1. Introducción"), ("p", P * 3)],
         [("h1", "Tema 2. Normativa"), ("p", P * 3)]])
    _, sections, _ = analyze(data)
    titles = [(s.title, s.start_page) for s in sections]
    assert ("Tema 1. Introducción", 2) in titles and ("Tema 2. Normativa", 3) in titles
    assert all(page != 1 or title == "Preliminares" for title, page in titles)


def test_no_structure_gives_whole_document():
    _, sections, _ = analyze(make_pdf([P * 4, P * 4]))
    assert [(s.title, s.source, s.start_page, s.end_page) for s in sections] == [
        ("Documento completo", "whole", 1, 2)]


def test_text_patterns_for_ocr_pages():
    pages = {1: "TEMA 1\nIntroducción\n" + P, 2: P + "\nTema 2 Normativa básica\n" + P,
             3: "Como se indica en el tema 3 de la normativa, " + P}
    found = text_pattern_headings(pages)
    assert [(h.title, h.page) for h in found] == [("TEMA 1", 1), ("Tema 2 Normativa básica", 2)]
    assert pages[2][found[1].offset:].startswith("Tema 2")


def test_unreliable_outline_and_multiline_chapter_titles():
    """Caso real: temas en bloques de varias líneas y un índice interno incompleto que
    solo recoge subapartados menores a partir de la mitad del documento."""
    long_title = ("Tema {n}.- Hojas de cálculo: principales funciones y utilidades. Libros, hojas y celdas. "
                  "Configuración. Introducción y edición de datos. Fórmulas y funciones.")
    pages = []
    for n in range(1, 4):
        pages.append([("h1", long_title.format(n=n)), ("p", P * 3)])
        pages.append([("h2", f"Apartado {n}A:"), ("p", P * 3), ("h2", f"Apartado {n}B:"), ("p", P * 2)])
    data = make_structured_pdf(pages, toc=[[1, "Apartado 2A:", 4], [1, "Apartado 3A:", 6]])
    _, sections, _ = analyze(data)
    top = [s for s in sections if s.level == 1]
    assert [s.title.split(".-")[0] for s in top] == ["Tema 1", "Tema 2", "Tema 3"]
    assert top[0].title.endswith("Fórmulas y funciones")            # título completo, no la primera línea
    assert all(s.source == "heuristic" for s in sections)
    subs = [s.title for s in sections if s.level == 2]
    assert subs == ["Apartado 1A", "Apartado 1B", "Apartado 2A", "Apartado 2B", "Apartado 3A", "Apartado 3B"]
