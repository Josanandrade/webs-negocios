"""La selección rota preguntas entre baterías sin prohibir reutilizarlas para siempre."""
import random
from uuid import uuid4

from app.quiz import choose


def _row(section, shown=0, seen=0):
    return {
        "id": uuid4(),
        "document_id": uuid4(),
        "section_id": section,
        "shown_n": shown,
        "seen": seen,
        "right_n": 0,
        "last_result": None,
    }


def test_random_avoids_repeats_between_batteries_until_needed():
    section = uuid4()
    rows = [_row(section) for _ in range(6)]
    tops = {section: section}

    first = choose(rows, "random", 3, tops, random.Random(1))
    first_ids = {r["id"] for r in first}
    assert len(first_ids) == 3

    # Simula que esas tres ya aparecieron en una batería, aunque todavía no se hayan respondido.
    for row in rows:
        if row["id"] in first_ids:
            row["shown_n"] += 1

    second = choose(rows, "random", 3, tops, random.Random(2))
    second_ids = {r["id"] for r in second}
    assert len(second_ids) == 3
    assert not first_ids & second_ids

    # Cuando todas han aparecido, repetir vuelve a estar permitido.
    for row in rows:
        if row["id"] in second_ids:
            row["shown_n"] += 1
    third = choose(rows, "random", 3, tops, random.Random(3))
    assert len({r["id"] for r in third}) == 3


def test_same_question_never_appears_twice_inside_one_battery():
    section = uuid4()
    rows = [_row(section, shown=i % 2) for i in range(8)]
    chosen = choose(rows, "random", 8, {section: section}, random.Random(4))
    assert len(chosen) == 8
    assert len({r["id"] for r in chosen}) == 8
