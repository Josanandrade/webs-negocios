"""La verificación determinista de hechos: lo que la IA propone solo entra si se demuestra."""
import uuid

from app.facts.extract import ChunkForFacts, PageRef, verify_fact

P1 = "Tema 1. Fármacos\n\nEl medicamento Alfa se administra a una dosis de 20 mg cada ocho horas."
P2 = "El medicamento Beta requiere una dosis de 40 mg. Este fármaco se\nretira si hay hipotensión."
PAGES = {1: PageRef(uuid.uuid4(), P1), 2: PageRef(uuid.uuid4(), P2)}
CHUNK = ChunkForFacts(uuid.uuid4(), None, P1 + "\n" + P2, "Tema 1. Fármacos",
                      [{"page": 1, "start": 0, "end": len(P1)}, {"page": 2, "start": 0, "end": len(P2)}])


def fact(**kw):
    base = {"kind": "quantity", "subject": "medicamento Beta", "attribute": "dosis", "value": "40 mg",
            "quote": "El medicamento Beta requiere una dosis de 40 mg."}
    return {**base, **kw}


def test_valid_fact_is_located_on_its_exact_page():
    f = verify_fact(fact(), CHUNK, PAGES)
    assert not isinstance(f, str)
    assert f.page_number == 2 and f.page_id == PAGES[2].id
    assert P2[f.char_start:f.char_end] == "El medicamento Beta requiere una dosis de 40 mg."
    assert (f.value_number, f.unit, f.slot) == (40.0, "mg", "quantity|dosis|mg")


def test_quote_tolerates_case_accents_and_line_breaks_but_stores_canonical_text():
    f = verify_fact(fact(subject="Beta", kind="characteristic", attribute="retirada", value="hipotension",
                         quote="este farmaco se retira si hay hipotension"), CHUNK, PAGES)
    assert not isinstance(f, str)
    assert f.quote == "Este fármaco se\nretira si hay hipotensión"


def test_paraphrased_quote_rejected():
    assert verify_fact(fact(quote="La dosis de Beta es de cuarenta miligramos."), CHUNK, PAGES) == "cita_no_encontrada"


def test_invented_value_rejected():
    assert verify_fact(fact(value="45 mg"), CHUNK, PAGES) == "valor_no_en_cita"


def test_invented_subject_rejected():
    assert verify_fact(fact(subject="medicamento Gamma"), CHUNK, PAGES) == "sujeto_no_en_texto"


def test_quote_crossing_pages_rejected():
    quote = "cada ocho horas.\nEl medicamento Beta"
    assert verify_fact(fact(quote=quote, value="Beta", kind="name"), CHUNK, PAGES) == "cita_cruza_paginas"


def test_quantity_without_number_rejected():
    assert verify_fact(fact(value="dosis"), CHUNK, PAGES) == "valor_sin_cifra"


def test_value_must_be_written_as_in_the_quote():
    f = verify_fact(fact(value="40 miligramos"), CHUNK, PAGES)
    assert f == "valor_no_en_cita"   # "miligramos" no aparece en la cita: no se acepta


def test_too_short_quote_and_unknown_kind_rejected():
    assert verify_fact(fact(quote="40 mg"), CHUNK, PAGES) == "cita_longitud"
    assert verify_fact(fact(kind="opinion"), CHUNK, PAGES) == "tipo_invalido"
