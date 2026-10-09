"""Fragmentación: trazabilidad exacta, límites de sección, elegibilidad."""
from app.ingestion.chunking import MAX_CHARS, Boundary, PageText, chunk_document

S = "El sistema de clasificación distingue cuatro grupos de residuos con requisitos propios. "


def reconstruct(chunk, pages):
    by = {p.number: p for p in pages}
    return "\n".join(by[p].text[s:e] for p, s, e in chunk.spans)


def test_spans_reconstruct_text_exactly_and_cover_everything():
    pages = [PageText(i, "\n\n".join(f"Párrafo {i}.{k}. " + S * 6 for k in range(5)), True) for i in range(1, 5)]
    chunks = chunk_document(pages, [Boundary(0, 1, 0)])
    assert len(chunks) > 4
    for c in chunks:
        assert c.text == reconstruct(c, pages)
        assert len(c.text) <= MAX_CHARS
    joined = "\n".join(c.text for c in chunks)
    for p in pages:
        for k in range(5):
            assert joined.count(f"Párrafo {p.number}.{k}. ") == 1   # cada párrafo exactamente una vez


def test_chunks_never_cross_section_boundaries():
    text1 = "Tema 1. Residuos\n\n" + S * 5 + "\n\nTema 2. Transporte\n\n" + S * 5
    pages = [PageText(1, text1, True)]
    t2 = text1.index("Tema 2")
    chunks = chunk_document(pages, [Boundary(0, 1, 0), Boundary(1, 1, t2)])
    assert [c.section for c in chunks] == [0, 1]
    assert "Tema 2" not in chunks[0].text and chunks[1].text.startswith("Tema 2")


def test_paragraph_split_across_pages_stays_together():
    pages = [PageText(1, S * 15 + "\n\nLa dosis máxima recomendada en adultos es de", True),
             PageText(2, "cuarenta miligramos al día según la ficha técnica. " + S * 15, True)]
    chunks = chunk_document(pages, [Boundary(0, 1, 0)])
    joined = [c for c in chunks if "dosis máxima" in c.text][0]
    assert "cuarenta miligramos" in joined.text
    assert [s[0] for s in joined.spans] == [1, 2]
    assert joined.page_start == 1 and joined.page_end == 2


def test_long_paragraph_is_split_by_sentences():
    pages = [PageText(1, (S * 80).strip(), True)]
    chunks = chunk_document(pages, [Boundary(0, 1, 0)])
    assert len(chunks) >= 2
    assert all(c.text.endswith(".") for c in chunks)
    assert all(c.text == reconstruct(c, pages) for c in chunks)


def test_ineligible_page_makes_chunk_ineligible():
    pages = [PageText(1, S * 10, True), PageText(2, S * 10, False)]
    chunks = chunk_document(pages, [Boundary(0, 1, 0), Boundary(1, 2, 0)])
    assert chunks[0].eligible
    assert not chunks[1].eligible and chunks[1].reason == "pagina_no_elegible"


def test_lost_referent_at_section_start_is_ineligible():
    body = "Este procedimiento se aplica únicamente en quirófano y requiere autorización. " * 6
    pages = [PageText(1, body + "\n\n" + S * 30 + "\n\nDicho protocolo se revisa anualmente. " + S * 5, True)]
    chunks = chunk_document(pages, [Boundary(0, 1, 0)])
    assert not chunks[0].eligible and chunks[0].reason == "referente_perdido"
    later = [c for c in chunks[1:] if c.text.startswith("Dicho")]
    assert later and later[0].eligible and "necesita_contexto_previo" in later[0].flags


def test_short_heading_only_chunk_is_not_eligible():
    pages = [PageText(1, "Tema 9. Anexos", True)]
    chunks = chunk_document(pages, [Boundary(0, 1, 0)])
    assert not chunks[0].eligible and chunks[0].reason == "demasiado_corto"


def test_chain_of_page_continuations_respects_max_size():
    # Cada página termina a mitad de frase y la siguiente empieza en minúscula.
    pages = [PageText(i, "continuación del texto. " + S * 14 + "La normativa establece que", True) for i in range(1, 8)]
    chunks = chunk_document(pages, [Boundary(0, 1, 0)])
    assert all(len(c.text) <= MAX_CHARS for c in chunks)
    assert all(c.text == reconstruct(c, pages) for c in chunks)
    assert any("necesita_contexto_previo" in c.flags for c in chunks[1:])
