"""Búsqueda tolerante (mayúsculas, acentos, espacios) que devuelve posiciones del texto ORIGINAL."""
import unicodedata


def _fold_char(c: str) -> str:
    base = unicodedata.normalize("NFKD", c)
    return "".join(ch for ch in base if not unicodedata.combining(ch)).lower()


def fold_with_map(text: str) -> tuple[str, list[int]]:
    """Texto plegado (minúsculas, sin acentos, espacios colapsados) + índice original de cada carácter."""
    out: list[str] = []
    index: list[int] = []
    prev_space = True
    for i, c in enumerate(text):
        if c.isspace():
            if not prev_space:
                out.append(" ")
                index.append(i)
            prev_space = True
            continue
        for f in _fold_char(c):
            out.append(f)
            index.append(i)
        prev_space = False
    return "".join(out), index


def fold(text: str) -> str:
    return fold_with_map(text)[0].strip()


def find_folded(haystack: str, needle: str, start: int = 0) -> tuple[int, int] | None:
    """Localiza `needle` en `haystack` ignorando mayúsculas/acentos/espacios.

    Devuelve (inicio, fin) en coordenadas de `haystack`, o None.
    """
    folded, index = fold_with_map(haystack)
    target = fold(needle)
    if not target:
        return None
    folded_start = next((k for k, i in enumerate(index) if i >= start), len(folded))
    pos = folded.find(target, folded_start)
    if pos < 0:
        return None
    return index[pos], index[pos + len(target) - 1] + 1
