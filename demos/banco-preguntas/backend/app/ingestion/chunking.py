"""Fragmentación semántica con trazabilidad exacta a página (sin LLM).

Invariante central (comprobada en tests):
    chunk.text == "\\n".join(pages[p].text[start:end] for (p, start, end) in chunk.spans)

Así cualquier cita dentro de un fragmento se puede localizar en su página exacta.
Reglas:
  * Un fragmento nunca cruza el límite de una sección.
  * Se corta por párrafos; un párrafo largo se corta por frases.
  * Un párrafo que continúa en la página siguiente no se separa.
  * Fragmento con alguna página no elegible (OCR pobre, texto ilegible) -> no elegible.
  * Fragmento que empieza con un referente ("Este procedimiento…") al inicio de una
    sección, sin texto previo que lo resuelva -> no elegible.
"""
import re
from dataclasses import dataclass, field

TARGET_CHARS = 1800       # ~400-450 tokens
MAX_CHARS = 3000
MIN_TAIL_CHARS = 400
MIN_ELIGIBLE_CHARS = 200

_SENTENCE_END = re.compile(r"(?<=[.!?…])\s+(?=[\"«(¿¡]?[A-ZÁÉÍÓÚÑ0-9])")
_DANGLING = re.compile(
    r"^(est[eao]s?|es[eao]s?|dich[oa]s?|tal(es)?|aquel(la|los|las)?|lo anterior|"
    r"el mencionado|la mencionada|los mencionados|las mencionadas|el citado|la citada|"
    r"ambos|ambas|el primero|el segundo|la primera|la segunda)\b", re.IGNORECASE)


@dataclass
class PageText:
    number: int
    text: str
    eligible: bool


@dataclass
class Boundary:
    """Inicio de una sección: (página, carácter). Las secciones se dan en orden."""
    section: int
    page: int
    offset: int


@dataclass
class Unit:
    page: int
    start: int
    end: int
    glue_next: bool = False   # continúa en la siguiente unidad (párrafo partido entre páginas)


@dataclass
class Chunk:
    section: int
    text: str
    spans: list[tuple[int, int, int]]
    eligible: bool
    reason: str | None = None
    flags: list[str] = field(default_factory=list)

    @property
    def page_start(self) -> int:
        return self.spans[0][0]

    @property
    def page_end(self) -> int:
        return self.spans[-1][0]


def _paragraph_units(text: str, page: int, start: int, end: int) -> list[Unit]:
    units = []
    cursor = start
    bounds = [(m.start(), m.end()) for m in re.finditer(r"\n\s*\n", text[start:end])]
    for sep_start, sep_end in bounds + [(end - start, end - start)]:
        s, e = cursor, start + sep_start
        cursor = start + sep_end
        while s < e and text[s].isspace():
            s += 1
        while e > s and text[e - 1].isspace():
            e -= 1
        if e > s:
            units.extend(_split_long(text, page, s, e))
    return units


def _split_long(text: str, page: int, s: int, e: int) -> list[Unit]:
    if e - s <= MAX_CHARS:
        return [Unit(page, s, e)]
    pieces, cur = [], s
    for m in _SENTENCE_END.finditer(text, s, e):
        if m.start() - cur >= TARGET_CHARS:
            pieces.append(Unit(page, cur, m.start()))
            cur = m.end()
    pieces.append(Unit(page, cur, e))
    # Frases larguísimas sin puntos: corte duro por espacios para respetar MAX_CHARS.
    result = []
    for u in pieces:
        while u.end - u.start > MAX_CHARS:
            cut = text.rfind(" ", u.start, u.start + MAX_CHARS)
            cut = cut if cut > u.start else u.start + MAX_CHARS
            result.append(Unit(page, u.start, cut))
            u = Unit(page, cut + 1 if text[cut:cut + 1] == " " else cut, u.end)
        result.append(u)
    return result


def _continues(prev_text: str, next_text: str) -> bool:
    return bool(prev_text) and bool(next_text) and not re.search(r"[.:;!?)»\"”]\s*$", prev_text) \
        and next_text[0].islower()


def _section_units(pages: dict[int, PageText], start: Boundary, end: Boundary | None) -> list[Unit]:
    last_page = end.page if end else max(pages)
    units: list[Unit] = []
    for number in range(start.page, last_page + 1):
        page = pages.get(number)
        if page is None:
            continue
        s = start.offset if number == start.page else 0
        e = end.offset if (end and number == end.page) else len(page.text)
        if e <= s:
            continue
        page_units = _paragraph_units(page.text, number, s, e)
        if units and page_units:
            prev = units[-1]
            if prev.page != number and _continues(pages[prev.page].text[prev.start:prev.end],
                                                  page.text[page_units[0].start:page_units[0].end]):
                prev.glue_next = True
        units.extend(page_units)
    return units


def _build(section: int, units: list[Unit], pages: dict[int, PageText]) -> Chunk:
    spans: list[tuple[int, int, int]] = []
    for u in units:
        if spans and spans[-1][0] == u.page:
            spans[-1] = (u.page, spans[-1][1], u.end)
        else:
            spans.append((u.page, u.start, u.end))
    text = "\n".join(pages[p].text[s:e] for p, s, e in spans)
    eligible = all(pages[p].eligible for p, _, _ in spans)
    reason = None if eligible else "pagina_no_elegible"
    if eligible and len(text) < MIN_ELIGIBLE_CHARS:
        eligible, reason = False, "demasiado_corto"
    return Chunk(section, text, spans, eligible, reason)


def chunk_document(pages: list[PageText], boundaries: list[Boundary]) -> list[Chunk]:
    by_number = {p.number: p for p in pages}
    chunks: list[Chunk] = []
    for i, b in enumerate(boundaries):
        nxt = boundaries[i + 1] if i + 1 < len(boundaries) else None
        units = _section_units(by_number, b, nxt)
        groups: list[list[Unit]] = []
        current: list[Unit] = []
        size = 0
        for u in units:
            length = u.end - u.start
            glued = bool(current) and current[-1].glue_next
            # Un párrafo partido entre páginas no se separa, salvo que supere el máximo.
            if current and size + length > TARGET_CHARS and (not glued or size + length > MAX_CHARS):
                groups.append(current)
                current, size = [], 0
            current.append(u)
            size += length + 1
        if current:
            if groups and size < MIN_TAIL_CHARS and \
                    sum(x.end - x.start + 1 for x in groups[-1]) + size <= MAX_CHARS:
                groups[-1].extend(current)
            else:
                groups.append(current)

        for k, group in enumerate(groups):
            chunk = _build(b.section, group, by_number)
            if _DANGLING.match(chunk.text):
                if k == 0:
                    chunk.eligible, chunk.reason = False, "referente_perdido"
                    chunk.flags.append("referente_perdido")
                else:
                    chunk.flags.append("necesita_contexto_previo")
            elif chunk.text[:1].islower():
                chunk.flags.append("necesita_contexto_previo")   # empieza a mitad de frase
            chunks.append(chunk)
    return chunks
