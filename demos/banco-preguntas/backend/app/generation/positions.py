"""Posición de la respuesta correcta y orden de los distractores: decisión del backend,
nunca del modelo. Determinista (mismo hecho -> mismo orden) y equilibrada por documento."""
import hashlib
from collections import Counter
from uuid import UUID

from app.generation.validation import OptionDraft

LABELS = ("A", "B", "C", "D")


def _hash(*parts: object) -> int:
    return int(hashlib.sha256("|".join(map(str, parts)).encode()).hexdigest(), 16)


def choose_correct_label(counts: Counter[str], seed: UUID) -> str:
    """La letra menos usada hasta ahora; empate resuelto de forma determinista."""
    least = min(counts.get(label, 0) for label in LABELS)
    ties = [label for label in LABELS if counts.get(label, 0) == least]
    return ties[_hash(seed) % len(ties)]


def arrange(options: list[OptionDraft], correct_label: str, seed: UUID) -> list[OptionDraft]:
    correct = next(o for o in options if o.is_correct)
    distractors = sorted((o for o in options if not o.is_correct), key=lambda o: _hash(seed, o.fact_id))
    ordered: list[OptionDraft] = []
    for label in LABELS:
        option = correct if label == correct_label else distractors.pop(0)
        option.label = label
        ordered.append(option)
    return ordered
