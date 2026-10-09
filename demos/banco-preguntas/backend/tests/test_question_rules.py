"""Reglas del motor de preguntas (unitarias, sin IA)."""
import uuid
from collections import Counter

from app.generation.positions import LABELS, arrange, choose_correct_label
from app.generation.validation import DocumentContext, OptionDraft, QuestionDraft, validate_draft

PAGE = ("El medicamento Alfa se administra a una dosis de 20 mg. El medicamento Beta se administra a una dosis "
        "de 40 mg. El medicamento Gamma se administra a una dosis de 10 mg. El medicamento Delta se administra a "
        "una dosis de 5 mg. La técnica estéril de lavado quirúrgico prolongado se aplica en quirófano.")
DOC = DocumentContext.from_pages({1: PAGE})


def opt(value, correct, subject):
    sentence = next(s + "." for s in PAGE.split(". ") if subject in s and value in s)
    start = PAGE.index(sentence.rstrip("."))
    quote = PAGE[start:start + len(sentence) - 1]
    return OptionDraft(value, correct, uuid.uuid4(), quote, uuid.uuid4(), 1, uuid.uuid4(), start, start + len(quote))


def draft(stem="¿Cuál es la dosis del medicamento Alfa?", options=None, kind="quantity"):
    options = options or [opt("20 mg", True, "Alfa"), opt("40 mg", False, "Beta"), opt("10 mg", False, "Gamma"),
                          opt("5 mg", False, "Delta")]
    return QuestionDraft(uuid.uuid4(), uuid.uuid4(), None, "medicamento Alfa", kind, "datum", "medium", stem, options)


def test_valid_question_passes():
    assert validate_draft(draft(), DOC) == []


def test_zero_or_two_correct_and_wrong_option_count():
    d = draft()
    d.options[0].is_correct = False
    assert "no_hay_exactamente_1_correcta" in validate_draft(d, DOC)
    d = draft()
    d.options[1].is_correct = True
    assert "no_hay_exactamente_1_correcta" in validate_draft(d, DOC)
    d = draft()
    d.options = d.options[:3]
    assert "no_hay_4_opciones" in validate_draft(d, DOC)


def test_duplicate_options_detected():
    d = draft()
    d.options[1] = opt("20 mg", False, "Alfa")
    assert "opciones_duplicadas" in validate_draft(d, DOC)


def test_option_must_come_from_its_quote_and_quote_from_page():
    d = draft()
    d.options[2].text = "32 mg"                       # cifra inventada
    assert "opcion_no_esta_en_su_cita" in validate_draft(d, DOC)
    d = draft()
    d.options[0].char_start += 3                      # referencia de página incorrecta
    assert "cita_no_corresponde_a_pagina" in validate_draft(d, DOC)


def test_banned_formulas_with_word_boundaries():
    assert "formula_prohibida" in validate_draft(draft("¿Según el documento, cuál es la dosis del medicamento Alfa?"), DOC)
    # "solo a" dentro de "solo afecta" no es la fórmula prohibida "solo A"
    assert "formula_prohibida" not in validate_draft(draft("¿Cuál es la dosis del medicamento Alfa que solo afecta?"), DOC)


def test_answer_leaked_in_stem_and_external_terms():
    assert "enunciado_contiene_una_opcion" in validate_draft(draft("¿Es 20 mg la dosis del medicamento Alfa?"), DOC)
    reasons = validate_draft(draft("¿Cuál es la dosis pediátrica del medicamento Alfa?"), DOC)
    assert any(r.startswith("termino_ajeno_al_documento") for r in reasons)
    assert "cifra_del_enunciado_no_esta_en_documento" in validate_draft(
        draft("¿Cuál es la dosis del medicamento Alfa cada 8 horas?"), DOC)


def test_length_giveaway_rejected():
    d = draft("¿Qué se aplica en quirófano según la técnica del medicamento Alfa?", kind="characteristic")
    d.options = [opt("La técnica estéril de lavado quirúrgico prolongado", True, "técnica"),
                 opt("20 mg", False, "Alfa"), opt("40 mg", False, "Beta"), opt("10 mg", False, "Gamma")]
    assert "longitud_delata_la_correcta" in validate_draft(d, DOC)


def test_correct_label_distribution_is_balanced():
    counts: Counter[str] = Counter()
    for _ in range(100):
        counts[choose_correct_label(counts, uuid.uuid4())] += 1
    assert counts == Counter({"A": 25, "B": 25, "C": 25, "D": 25})


def test_label_choice_is_deterministic_and_arrange_keeps_one_correct():
    seed = uuid.uuid4()
    assert choose_correct_label(Counter(), seed) == choose_correct_label(Counter(), seed)
    for label in LABELS:
        ordered = arrange(draft().options, label, seed)
        assert [o.label for o in ordered] == list(LABELS)
        assert [o.label for o in ordered if o.is_correct] == [label]
    import copy

    options = draft().options
    first = [o.text for o in arrange(copy.deepcopy(options), "C", seed)]
    assert first == [o.text for o in arrange(copy.deepcopy(options), "C", seed)]   # mismo orden siempre
