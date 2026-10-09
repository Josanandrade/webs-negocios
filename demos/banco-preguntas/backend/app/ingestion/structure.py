"""Detección de la estructura del documento (temas, capítulos, apartados) sin LLM.

Orden de preferencia:
  1. Marcadores/índice interno del PDF (outline): lo más fiable.
  2. Heurística tipográfica: líneas cortas en fuente mayor/negrita, con patrones
     "Tema 3", "Capítulo II", "1.2 ...". Incluye OCR (solo por patrón de texto).
  3. Sin estructura reconocible: una única sección "Documento completo".

Cada encabezado se localiza en el texto canónico (ya limpio) de su página para obtener
la posición exacta de inicio. Un encabezado que no aparece en el texto limpio (p. ej.
una cabecera repetida que se eliminó) no crea sección.
"""
import re
from collections import Counter
from dataclasses import dataclass

import pymupdf as fitz

from app.ingestion.textmatch import find_folded

MAX_LEVELS = 2
KEYWORD = re.compile(
    r"^(tema|cap[ií]tulo|unidad(\s+did[aá]ctica)?|bloque|parte|m[óo]dulo|lecci[óo]n|t[íi]tulo)\s+"
    r"([0-9]{1,3}|[ivxlc]{1,7})\b", re.IGNORECASE)
NUMBERED = re.compile(r"^\d{1,2}(\.\d{1,2}){0,3}\.?\s+[A-Za-zÁÉÍÓÚÑáéíóúñ¿¡]")
DOT_LEADER = re.compile(r"(\.{3,}|…|\s\.\s\.)\s*\d*\s*$")
TRAILING_PAGE = re.compile(r"\s\d{1,4}\s*$")


@dataclass
class Heading:
    level: int
    title: str
    page: int        # 1-based
    offset: int      # carácter de inicio en el texto canónico de la página
    source: str      # 'outline' | 'heuristic'


@dataclass
class SectionSpec:
    level: int
    title: str
    start_page: int
    start_char: int
    end_page: int
    source: str
    parent: int | None   # índice de la sección padre en la lista


def _clean_title(title: str) -> str:
    return re.sub(r"\s+", " ", title).strip(" .:-–—\t")[:300]


def _locate(pages_text: dict[int, str], page: int, title: str) -> int | None:
    text = pages_text.get(page, "")
    hit = find_folded(text, title)
    if hit is None:
        return None
    start = hit[0]
    # Debe estar al inicio de una línea (no en mitad de un párrafo).
    if start > 0 and text[start - 1] != "\n":
        line_start = text.rfind("\n", 0, start) + 1
        prefix = text[line_start:start]
        if not re.fullmatch(r"[\s\dIVXLCivxlc.·–\-]*", prefix):
            return None
        start = line_start
    return start


def _promote(headings: list[Heading]) -> list[Heading]:
    """Si el nivel superior tiene una sola entrada (título del libro), sube un nivel el resto."""
    while headings:
        top = min(h.level for h in headings)
        tops = [h for h in headings if h.level == top]
        deeper = [h for h in headings if h.level > top]
        if len(tops) == 1 and len(deeper) >= 2:
            headings = [Heading(h.level - 1, h.title, h.page, h.offset, h.source) for h in deeper]
        else:
            break
    if not headings:
        return headings
    top = min(h.level for h in headings)
    return [Heading(h.level - top + 1, h.title, h.page, h.offset, h.source)
            for h in headings if h.level - top + 1 <= MAX_LEVELS]


def outline_headings(pdf: fitz.Document, pages_text: dict[int, str]) -> list[Heading]:
    result = []
    for level, title, page, *_ in pdf.get_toc(simple=False):
        title = _clean_title(title)
        if page < 1 or not title:
            continue
        offset = _locate(pages_text, page, title)
        result.append(Heading(level, title, page, offset or 0, "outline"))
    return _promote(result)


def _line_records(pdf: fitz.Document):
    """(página, texto, tamaño, negrita) por bloque de texto con tamaño homogéneo."""
    for index in range(pdf.page_count):
        page = pdf[index]
        for block in page.get_text("dict")["blocks"]:
            if block.get("type") != 0:
                continue
            lines = []
            for line in block["lines"]:
                spans = [s for s in line["spans"] if s["text"].strip()]
                if not spans:
                    continue
                text = "".join(s["text"] for s in spans).strip()
                size = round(max(s["size"] for s in spans) * 2) / 2
                bold = all((s["flags"] & 16) or "bold" in s["font"].lower() for s in spans)
                lines.append((text, size, bold, sum(len(s["text"]) for s in spans)))
            if not lines:
                continue
            sizes = {l[1] for l in lines}
            if len(sizes) == 1 and len(lines) <= 6:   # título de varias líneas
                yield index + 1, " ".join(l[0] for l in lines), lines[0][1], all(l[2] for l in lines), sum(l[3] for l in lines)
            else:
                for text, size, bold, n in lines:
                    yield index + 1, text, size, bold, n


def _looks_like_title(text: str) -> bool:
    max_len = 350 if KEYWORD.match(text) else 140   # "Tema 4.- …" suele ocupar varias líneas
    if not (3 <= len(text) <= max_len) or not re.search(r"[A-Za-zÁÉÍÓÚÑáéíóúñ]{3}", text):
        return False
    if DOT_LEADER.search(text) or (TRAILING_PAGE.search(text) and not KEYWORD.match(text)):
        return False  # entradas del índice: "Tema 1. Introducción ...... 5"
    if text.endswith((".", ",", ";")) and not KEYWORD.match(text) and len(text) > 60:
        return False
    return True


def font_headings(pdf: fitz.Document, pages_text: dict[int, str]) -> list[Heading]:
    records = list(_line_records(pdf))
    if not records:
        return []
    weights: Counter[float] = Counter()
    for _, _, size, _, n in records:
        weights[size] += n
    body = weights.most_common(1)[0][0]

    candidates = []
    for page, text, size, bold, _ in records:
        text = _clean_title(text)
        if not _looks_like_title(text):
            continue
        strong = KEYWORD.match(text) or NUMBERED.match(text)
        if size >= body * 1.15 or (bold and strong and size >= body):
            candidates.append((page, text, size))

    keyword = [c for c in candidates if KEYWORD.match(c[1])]
    leveled: list[tuple[int, int, str]] = []
    if len(keyword) >= 2:
        key_size = Counter(c[2] for c in keyword).most_common(1)[0][0]
        for page, text, size in candidates:
            if KEYWORD.match(text):
                leveled.append((1, page, text))
            elif size < key_size and (size >= body * 1.15 or NUMBERED.match(text)):
                leveled.append((2, page, text))
    else:
        counts = Counter(c[2] for c in candidates)
        sizes = sorted((s for s, n in counts.items() if n >= 2), reverse=True)[:MAX_LEVELS]
        for page, text, size in candidates:
            if size in sizes:
                leveled.append((sizes.index(size) + 1, page, text))

    headings = []
    for level, page, text in leveled:
        offset = _locate(pages_text, page, text)
        if offset is not None:
            headings.append(Heading(level, text, page, offset, "heuristic"))
    return headings


def text_pattern_headings(pages_text: dict[int, str], pages: set[int] | None = None) -> list[Heading]:
    """Encabezados por patrón en el texto (páginas OCR, sin información tipográfica)."""
    result = []
    for page, text in sorted(pages_text.items()):
        if pages is not None and page not in pages:
            continue
        pos = 0
        for line in text.split("\n"):
            stripped = line.strip()
            if KEYWORD.match(stripped) and _looks_like_title(stripped) and len(stripped) <= 100 \
                    and not stripped.endswith("."):
                result.append(Heading(1, _clean_title(stripped), page, pos, "heuristic"))
            pos += len(line) + 1
    return result


def _outline_reliable(outline: list[Heading], pdf: fitz.Document, pages_text: dict[int, str]) -> bool:
    """Un índice interno solo se usa si parece completo: empieza al principio del documento
    y, si el texto tiene temas tipo "Tema 3"/"Capítulo II", también los incluye."""
    if len(outline) < 2:
        return False
    if min(h.page for h in outline) > max(2, int(0.1 * pdf.page_count)):
        return False   # empieza tarde: faltan los primeros temas
    keyword_in_text = sum(1 for h in text_pattern_headings(pages_text))
    keyword_in_outline = sum(1 for h in outline if KEYWORD.match(h.title))
    return not (keyword_in_text >= 2 and keyword_in_outline == 0)


def detect_headings(pdf: fitz.Document, pages_text: dict[int, str], ocr_pages: set[int]) -> list[Heading]:
    headings = outline_headings(pdf, pages_text)
    if not _outline_reliable(headings, pdf, pages_text):
        headings = font_headings(pdf, pages_text) + text_pattern_headings(pages_text, ocr_pages)
        if sum(1 for h in headings if h.level == 1) < 2:
            by_pattern = text_pattern_headings(pages_text)
            if len(by_pattern) >= 2:
                headings = by_pattern
        headings = _promote(headings)
    # Orden por posición; un encabezado por posición; evita ruido masivo.
    unique: dict[tuple[int, int], Heading] = {}
    for h in sorted(headings, key=lambda h: (h.page, h.offset, h.level)):
        unique.setdefault((h.page, h.offset), h)
    headings = list(unique.values())
    if sum(1 for h in headings if h.level == 1) > max(len(pages_text) * 0.8, 3) and headings[0].source != "outline":
        return []  # demasiados "títulos": la heurística no es fiable
    return headings


def build_sections(headings: list[Heading], page_count: int, pages_text: dict[int, str]) -> list[SectionSpec]:
    if not headings:
        return [SectionSpec(1, "Documento completo", 1, 0, page_count, "whole", None)]

    specs: list[SectionSpec] = []
    first = headings[0]
    preamble = "".join(pages_text.get(p, "") for p in range(1, first.page)) + pages_text.get(first.page, "")[:first.offset]
    if len(preamble.strip()) >= 200:
        specs.append(SectionSpec(1, "Preliminares", 1, 0, first.page, "heuristic", None))

    base = len(specs)
    stack: list[int] = []
    for i, h in enumerate(headings):
        # Fin: siguiente encabezado de nivel igual o superior.
        end_page = page_count
        for nxt in headings[i + 1:]:
            if nxt.level <= h.level:
                end_page = nxt.page if nxt.offset > 0 else nxt.page - 1
                break
        end_page = max(end_page, h.page)
        while stack and headings[stack[-1]].level >= h.level:
            stack.pop()
        parent = base + stack[-1] if stack else None
        specs.append(SectionSpec(h.level, h.title, h.page, h.offset, end_page, h.source, parent))
        stack.append(i)

    if specs[0].title == "Preliminares":
        specs[0].end_page = max(1, first.page if first.offset > 0 else first.page - 1)
    return specs
