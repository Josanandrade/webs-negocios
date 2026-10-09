"""Normalización del texto y eliminación de cabeceras/pies de página repetidos (sin LLM)."""
import re
import unicodedata
from collections import Counter

_MARGIN_LINES = 2
_PAGE_NUMBER = re.compile(r"^(p[áa]g(ina)?\.?\s*)?[-–]?\s*\d{1,4}\s*[-–]?(\s*(de|/)\s*\d{1,4})?$", re.IGNORECASE)


def normalize_text(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    text = text.replace("­", "").replace("​", "").replace("\r\n", "\n").replace("\r", "\n")
    # Palabra partida por guion al final de línea: "medica-\nmento" -> "medicamento"
    text = re.sub(r"(\w)-\n(?=[a-záéíóúüñ])", r"\1", text)
    text = re.sub(r"[ \t ]+", " ", text)
    text = "\n".join(line.strip() for line in text.split("\n"))
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _exact_key(line: str) -> str:
    return re.sub(r"\s+", " ", line.strip().lower())


def _counter_key(line: str) -> str:
    """Plantilla de contador: solo se sustituye el ÚLTIMO número ("Tema 2 · 45" -> "tema 2 · #").

    Así "Tema 1. Farmacología 1", "Tema 2. Farmacología 2"... (títulos de tema que
    empiezan página tras página) no se confunden con un contador de páginas.
    """
    return re.sub(r"\d+(?!.*\d)", "#", _exact_key(line))


def _margin_indices(lines: list[str]) -> list[int]:
    non_empty = [i for i, l in enumerate(lines) if l.strip()]
    k = _MARGIN_LINES if len(non_empty) >= 3 * _MARGIN_LINES else 1
    return sorted(set(non_empty[:k] + non_empty[-k:]))


def remove_repeated_margins(pages: list[str]) -> tuple[list[str], list[str]]:
    """Quita cabeceras/pies repetidos y numeración de página.

    Solo se eliminan líneas situadas en los márgenes (primeras/últimas líneas) que:
      * se repiten literalmente en muchas páginas (título del libro, del capítulo), o
      * son un contador de página: misma plantilla y un número que avanza a la par que
        la página ("Tema 2 · 45", "Página 3 de 10"), o
      * son solo un número de página.
    Devuelve (páginas limpias, plantillas eliminadas).
    """
    split = [p.split("\n") for p in pages]
    margins = [_margin_indices(lines) for lines in split]
    threshold = max(3, int(0.4 * len(pages) + 0.999))

    exact: Counter[str] = Counter()
    offsets: dict[str, Counter[int]] = {}
    for page_idx, (lines, idxs) in enumerate(zip(split, margins)):
        exact.update({_exact_key(lines[i]) for i in idxs})
        for i in idxs:
            numbers = re.findall(r"\d+", lines[i])
            if numbers:
                offsets.setdefault(_counter_key(lines[i]), Counter())[int(numbers[-1]) - page_idx] += 1

    repeated = {k for k, c in exact.items() if k and c >= threshold}
    counters = {}
    for key, counter in offsets.items():
        offset, count = counter.most_common(1)[0]
        if count >= threshold:
            counters[key] = offset

    cleaned = []
    for page_idx, (lines, idxs) in enumerate(zip(split, margins)):
        drop = set()
        for i in idxs:
            line = lines[i]
            numbers = re.findall(r"\d+", line)
            is_counter = (bool(numbers) and _counter_key(line) in counters
                          and int(numbers[-1]) - page_idx == counters[_counter_key(line)])
            if _exact_key(line) in repeated or is_counter or _PAGE_NUMBER.match(line.strip()):
                drop.add(i)
        kept = [l for i, l in enumerate(lines) if i not in drop]
        cleaned.append(re.sub(r"\n{3,}", "\n\n", "\n".join(kept)).strip())
    return cleaned, sorted(repeated | set(counters))
