"""Catálogo de distractores: solo valores reales del documento, nunca correctos para el sujeto."""
import hashlib
import uuid

from sqlalchemy import text

from app.db import user_session
from app.facts.distractors import distractor_candidates
from app.facts.normalize import norm_subject, norm_value, slot_for


def setup_doc(user_id, sentences_by_section: list[list[str]]):
    """Documento con una sección y un fragmento por bloque de frases."""
    doc_id = uuid.uuid4()
    with user_session(user_id) as s:
        s.execute(text("insert into documents (id, user_id, title, original_filename, mime_type, size_bytes, sha256,"
                       " storage_key, status) values (:id, :u, 'd', 'd.pdf', 'application/pdf', 1, :h, 'k', 'ready')"),
                  {"id": doc_id, "u": user_id, "h": hashlib.sha256(doc_id.bytes).hexdigest()})
        sections = []
        for i, sentences in enumerate(sentences_by_section, start=1):
            body = " ".join(sentences)
            page_id = s.execute(text("insert into document_pages (document_id, user_id, page_number, text,"
                                     " extraction_method, is_eligible) values (:d, :u, :n, :t, 'native', true)"
                                     " returning id"), {"d": doc_id, "u": user_id, "n": i, "t": body}).scalar_one()
            sec = s.execute(text("insert into document_sections (document_id, user_id, level, ordinal, title,"
                                 " start_page, end_page, source) values (:d, :u, 1, :o, :t, :n, :n, 'manual')"
                                 " returning id"), {"d": doc_id, "u": user_id, "o": i, "t": f"Tema {i}", "n": i}).scalar_one()
            chunk = s.execute(text("insert into document_chunks (document_id, user_id, section_id, ordinal, text,"
                                   " page_start, page_end, spans) values (:d, :u, :sec, :o, :t, :n, :n,"
                                   " cast(:sp as jsonb)) returning id"),
                              {"d": doc_id, "u": user_id, "sec": sec, "o": i, "t": body, "n": i,
                               "sp": f'[{{"page": {i}, "start": 0, "end": {len(body)}}}]'}).scalar_one()
            sections.append((sec, chunk, page_id, i, body))
    return doc_id, sections


def add_fact(user_id, doc_id, section, kind, subject, attribute, value, number=None, unit=None):
    sec, chunk, page_id, page_number, body = section
    quote = next(x for x in body.split(". ") if value in x and subject.split()[-1] in x)
    start = body.index(quote)
    with user_session(user_id) as s:
        return s.execute(text("""
            insert into facts (user_id, document_id, chunk_id, section_id, page_id, page_number, kind, subject,
              attribute, value, value_number, unit, slot, subject_norm, value_norm, quote, char_start, char_end)
            values (:u, :d, :c, :sec, :p, :pn, :k, :sub, :att, :val, :num, :unit, :slot, :sn, :vn, :q, :cs, :ce)
            returning id"""),
            {"u": user_id, "d": doc_id, "c": chunk, "sec": sec, "p": page_id, "pn": page_number, "k": kind,
             "sub": subject, "att": attribute, "val": value, "num": number, "unit": unit,
             "slot": slot_for(kind, attribute, unit), "sn": norm_subject(subject), "vn": norm_value(value),
             "q": quote, "cs": start, "ce": start + len(quote)}).scalar_one()


def test_doses_example_uses_only_document_values(alice):
    u = alice["id"]
    doc, secs = setup_doc(u, [
        ["El medicamento A se administra a 20 mg.", "El medicamento B se administra a 40 mg.",
         "El medicamento A alcanza un máximo de 60 mg."],
        ["El medicamento C se administra a 10 mg.", "El medicamento D se administra a 5 mg.",
         "El medicamento E se administra a 2 g."],
    ])
    target = add_fact(u, doc, secs[0], "quantity", "medicamento A", "dosis", "20 mg", 20, "mg")
    add_fact(u, doc, secs[0], "quantity", "medicamento B", "dosis", "40 mg", 40, "mg")
    add_fact(u, doc, secs[0], "quantity", "medicamento A", "dosis máxima", "60 mg", 60, "mg")
    add_fact(u, doc, secs[1], "quantity", "medicamento C", "dosis", "10 mg", 10, "mg")
    add_fact(u, doc, secs[1], "quantity", "medicamento D", "dosis", "5 mg", 5, "mg")
    add_fact(u, doc, secs[1], "quantity", "medicamento E", "dosis", "2 g", 2, "g")

    with user_session(u) as s:
        cands = distractor_candidates(s, target)
    values = {c.value for c in cands}
    assert values == {"40 mg", "10 mg", "5 mg"}          # 60 mg es del propio A; 2 g es otra unidad
    for c in cands:
        assert c.value in c.quote and c.page_number in (1, 2)
    assert all(c.tier == "misma_ranura" for c in cands)


def test_value_cooccurring_with_subject_is_excluded(alice):
    u = alice["id"]
    doc, secs = setup_doc(u, [[
        "El fármaco X pertenece al grupo de los betabloqueantes.",
        "El fármaco Y pertenece al grupo de los diuréticos.",
        "El fármaco Z pertenece al grupo de los antagonistas del calcio.",
        "El fármaco W pertenece al grupo de los vasodilatadores.",
        "En algunos casos el fármaco X actúa junto con los diuréticos.",
    ]])
    target = add_fact(u, doc, secs[0], "classification", "fármaco X", "grupo", "betabloqueantes")
    add_fact(u, doc, secs[0], "classification", "fármaco Y", "grupo", "diuréticos")
    add_fact(u, doc, secs[0], "classification", "fármaco Z", "grupo", "antagonistas del calcio")
    add_fact(u, doc, secs[0], "classification", "fármaco W", "grupo", "vasodilatadores")
    with user_session(u) as s:
        values = {c.value for c in distractor_candidates(s, target)}
    assert values == {"antagonistas del calcio", "vasodilatadores"}   # "diuréticos" podría ser correcta


def test_difficulty_orders_by_proximity(alice):
    u = alice["id"]
    doc, secs = setup_doc(u, [
        ["La técnica P se define como la limpieza de la herida.", "La técnica Q se define como el cierre de la herida."],
        ["La técnica R se define como la medición del pulso."],
    ])
    target = add_fact(u, doc, secs[0], "definition", "técnica P", "definición", "la limpieza de la herida")
    add_fact(u, doc, secs[0], "definition", "técnica Q", "definición", "el cierre de la herida")
    add_fact(u, doc, secs[1], "definition", "técnica R", "definición", "la medición del pulso")
    with user_session(u) as s:
        hard = distractor_candidates(s, target, difficulty="hard")
        easy = distractor_candidates(s, target, difficulty="easy")
    assert hard[0].value == "el cierre de la herida"     # mismo apartado: más parecido
    # Una definición de otro tema se descarta a simple vista: nunca es candidata.
    assert "la medición del pulso" not in {c.value for c in hard + easy}


def test_numeric_candidates_may_come_from_other_topics(alice):
    u = alice["id"]
    doc, secs = setup_doc(u, [["El plazo P es de 10 días."], ["El plazo Q es de 30 días."]])
    target = add_fact(u, doc, secs[0], "deadline", "plazo P", "duración", "10 días", 10, "dias")
    add_fact(u, doc, secs[1], "deadline", "plazo Q", "duración", "30 días", 30, "dias")
    with user_session(u) as s:
        assert [c.value for c in distractor_candidates(s, target)] == ["30 días"]


def test_not_enough_candidates_returns_fewer_than_three(alice):
    u = alice["id"]
    doc, secs = setup_doc(u, [["El plazo P es de 10 días.", "El plazo Q es de 30 días."]])
    target = add_fact(u, doc, secs[0], "deadline", "plazo P", "duración", "10 días", 10, "dias")
    add_fact(u, doc, secs[0], "deadline", "plazo Q", "duración", "30 días", 30, "dias")
    with user_session(u) as s:
        assert len(distractor_candidates(s, target)) < 3   # la generación descartará esta pregunta


def test_duplicate_questions_are_detected(alice):
    """Idéntica, reformulada con la misma respuesta, o mismo dato con distinta redacción."""
    from app.generation.dedupe import duplicate_reason, fingerprint

    u = alice["id"]
    doc, secs = setup_doc(u, [["El medicamento A se administra a 20 mg.", "El medicamento B se administra a 40 mg.",
                               "El medicamento A se administra a 20 mg en adultos."]])
    f1 = add_fact(u, doc, secs[0], "quantity", "medicamento A", "dosis", "20 mg", 20, "mg")
    f2 = add_fact(u, doc, secs[0], "quantity", "medicamento A", "dosis", "20 mg en adultos", 20, "mg")
    f3 = add_fact(u, doc, secs[0], "quantity", "medicamento B", "dosis", "40 mg", 40, "mg")
    stem = "¿Cuál es la dosis del medicamento A?"
    with user_session(u) as s:
        page = s.execute(text("select id from document_pages where document_id = :d"), {"d": doc}).scalar_one()
        qid = s.execute(text("insert into questions (user_id, document_id, stem, question_type, difficulty, status,"
                             " fingerprint, fact_id) values (:u, :d, :s, 'datum', 'medium', 'auto_validated', :fp, :f)"
                             " returning id"), {"u": u, "d": doc, "s": stem, "fp": fingerprint(stem, "20 mg"), "f": f1}).scalar_one()
        for label, value, ok in [("A", "20 mg", True), ("B", "40 mg", False), ("C", "10 mg", False), ("D", "5 mg", False)]:
            s.execute(text("insert into question_options (question_id, user_id, label, text, is_correct)"
                           " values (:q, :u, :l, :t, :c)"), {"q": qid, "u": u, "l": label, "t": value, "c": ok})
        s.execute(text("insert into question_sources (question_id, user_id, document_id, role, page_id, page_number, quote)"
                       " values (:q, :u, :d, 'answer', :p, 1, 'El medicamento A se administra a 20 mg')"),
                  {"q": qid, "u": u, "d": doc, "p": page})
    with user_session(u) as s:
        assert duplicate_reason(s, doc, f1) == "mismo_hecho"
        assert duplicate_reason(s, doc, f2) == "mismo_dato"            # mismo sujeto y misma ranura
        assert duplicate_reason(s, doc, f3, stem="¿Cuál es la dosis del medicamento B?", correct="40 mg") is None
        assert duplicate_reason(s, doc, f3, stem="¿Cuál es la dosis del medicamento A?", correct="20 mg") == "enunciado_identico"
        assert duplicate_reason(s, doc, f3, stem="¿Qué dosis se indica para el medicamento A?",
                                correct="20 mg") == "misma_pregunta_reformulada"
