"""Pipeline de ingestión de un documento (job 'ingest').

Etapas (cada una idempotente y reanudable):
  1. extracting           texto por página (nativo u OCR); una transacción por página
  2. cleaning             normalización, cabeceras/pies repetidos, calidad y elegibilidad
  3. analyzing_structure  temas/capítulos/apartados (outline del PDF o heurística)
  4. indexing             fragmentos con spans exactos a página + índice de texto completo

Las etapas 3 y 4 se ejecutan cada una en UNA transacción y se saltan si ya existen sus
resultados: un fallo a mitad no deja datos parciales.
"""
import json
from collections import Counter

from app.ingestion.chunking import Boundary, PageText, chunk_document
from app.ingestion.structure import build_sections, detect_headings

from sqlalchemy import text

from app.ingestion.cleanup import normalize_text, remove_repeated_margins
from app.ingestion.extract import ExtractedPage, docx_to_pdf, extract_page, open_pdf
from app.ingestion.quality import assess_page
from app.jobs.runner import JobContext
from app.storage import get_storage

DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


def _load_pdf_bytes(ctx: JobContext, doc_row) -> bytes:
    storage = get_storage()
    if doc_row.mime_type != DOCX_MIME:
        return storage.read(doc_row.storage_key)
    converted_key = doc_row.storage_key.rsplit(".", 1)[0] + ".converted.pdf"
    try:
        return storage.read(converted_key)
    except FileNotFoundError:
        pdf = docx_to_pdf(storage.read(doc_row.storage_key))
        storage.save(converted_key, pdf)
        return pdf


def run_ingest(ctx: JobContext) -> None:
    with ctx.session() as s:
        doc = s.execute(text("select id, mime_type, storage_key from documents where id = :id"),
                        {"id": ctx.document_id}).one()
        s.execute(text("update documents set status = 'processing', error = null where id = :id"), {"id": doc.id})

    pdf = open_pdf(_load_pdf_bytes(ctx, doc))
    try:
        _extract_pages(ctx, pdf)
        _clean_and_assess(ctx)
        _analyze_structure(ctx, pdf)
    finally:
        pdf.close()
    _index_chunks(ctx)
    with ctx.session() as s:
        s.execute(text("update documents set status = 'ready' where id = :id"), {"id": ctx.document_id})


def _extract_pages(ctx: JobContext, pdf) -> None:
    total = pdf.page_count
    with ctx.session() as s:
        s.execute(text("update documents set page_count = :n where id = :id"), {"n": total, "id": ctx.document_id})
        done = set(s.execute(text("select page_number from document_pages where document_id = :d"),
                             {"d": ctx.document_id}).scalars())
    ctx.update(stage="extracting", current=len(done), total=total,
               message=f"Extrayendo texto ({len(done)}/{total} páginas)")
    for index in range(total):
        number = index + 1
        if number in done:
            continue  # reanudación: esta página ya se extrajo en un intento anterior
        page = extract_page(pdf, index)
        _store_page(ctx, page)
        ctx.update(current=number, message=f"Extrayendo texto ({number}/{total} páginas)",
                   checkpoint={"last_extracted_page": number})


def _store_page(ctx: JobContext, page: ExtractedPage) -> None:
    provisional = normalize_text(page.raw_text)
    with ctx.session() as s:
        s.execute(
            text("""
                insert into document_pages (document_id, user_id, page_number, raw_text, text, char_count,
                  extraction_method, ocr_confidence, image_coverage, quality_flags)
                values (:d, :u, :n, :raw, :txt, :c, :m, :conf, :cov, :flags)
                on conflict (document_id, page_number) do nothing"""),
            {"d": ctx.document_id, "u": ctx.user_id, "n": page.page_number, "raw": page.raw_text, "txt": provisional,
             "c": len(provisional), "m": page.method, "conf": page.ocr_confidence, "cov": page.image_coverage,
             "flags": page.flags},
        )


def _clean_and_assess(ctx: JobContext) -> None:
    with ctx.session() as s:
        rows = s.execute(text("select id, page_number, raw_text, extraction_method, ocr_confidence, quality_flags"
                              " from document_pages where document_id = :d order by page_number"),
                         {"d": ctx.document_id}).all()
    ctx.update(stage="cleaning", current=0, total=len(rows), message="Limpiando cabeceras, pies y evaluando calidad")
    cleaned, removed_patterns = remove_repeated_margins([normalize_text(r.raw_text) for r in rows])

    methods: Counter[str] = Counter()
    eligible = 0
    with ctx.session() as s:
        for row, body in zip(rows, cleaned, strict=True):
            report = assess_page(body, row.extraction_method, row.ocr_confidence)
            extraction_flags = [f for f in row.quality_flags if f in ("imagen_con_capa_de_texto", "ocr_descartado", "ocr_no_disponible")]
            flags = sorted(set(extraction_flags + report.flags))
            is_eligible = report.eligible and "ocr_no_disponible" not in flags
            s.execute(
                text("update document_pages set text = :t, char_count = :c, quality_score = :q, is_eligible = :e,"
                     " quality_flags = :f where id = :id"),
                {"t": body, "c": len(body), "q": report.score, "e": is_eligible, "f": flags, "id": row.id},
            )
            methods[row.extraction_method] += 1
            eligible += is_eligible

        n = len(rows)
        if methods["ocr"] == 0:
            layer = "native"
        elif methods["ocr"] == n:
            layer = "scanned"
        else:
            layer = "partial"
        ocr_conf = s.execute(text("select avg(ocr_confidence) from document_pages where document_id = :d"
                                  " and extraction_method = 'ocr'"), {"d": ctx.document_id}).scalar()
        stats = {
            "pages": n,
            "pages_native": methods["native"],
            "pages_ocr": methods["ocr"],
            "pages_eligible": eligible,
            "pages_not_eligible": n - eligible,
            "ocr_mean_confidence": round(float(ocr_conf), 1) if ocr_conf is not None else None,
            "removed_margin_patterns": removed_patterns[:20],
        }
        s.execute(text("update documents set text_layer = :l, stats = stats || cast(:st as jsonb) where id = :id"),
                  {"l": layer, "st": json.dumps(stats, ensure_ascii=False), "id": ctx.document_id})
    ctx.update(current=len(rows), checkpoint={"cleaned": True})


def _load_pages(ctx: JobContext):
    with ctx.session() as s:
        return s.execute(text("select page_number, text, is_eligible, extraction_method from document_pages"
                              " where document_id = :d order by page_number"), {"d": ctx.document_id}).all()


def _analyze_structure(ctx: JobContext, pdf) -> None:
    with ctx.session() as s:
        if s.execute(text("select 1 from document_sections where document_id = :d limit 1"),
                     {"d": ctx.document_id}).first():
            return  # ya hecho en un intento anterior
    ctx.update(stage="analyzing_structure", current=0, total=1, message="Detectando temas y apartados")
    rows = _load_pages(ctx)
    pages_text = {r.page_number: r.text for r in rows}
    ocr_pages = {r.page_number for r in rows if r.extraction_method == "ocr"}
    specs = build_sections(detect_headings(pdf, pages_text, ocr_pages), pdf.page_count, pages_text)

    with ctx.session() as s:
        ids: list = []
        for ordinal, spec in enumerate(specs):
            ids.append(s.execute(
                text("insert into document_sections (document_id, user_id, parent_id, level, ordinal, title,"
                     " start_page, start_char, end_page, source)"
                     " values (:d, :u, :p, :lvl, :o, :t, :sp, :sc, :ep, :src) returning id"),
                {"d": ctx.document_id, "u": ctx.user_id, "p": ids[spec.parent] if spec.parent is not None else None,
                 "lvl": spec.level, "o": ordinal, "t": spec.title, "sp": spec.start_page, "sc": spec.start_char,
                 "ep": spec.end_page, "src": spec.source},
            ).scalar_one())
    ctx.update(current=1, message=f"{len(specs)} secciones detectadas", checkpoint={"structured": True})


def _index_chunks(ctx: JobContext) -> None:
    with ctx.session() as s:
        if s.execute(text("select 1 from document_chunks where document_id = :d limit 1"),
                     {"d": ctx.document_id}).first():
            return
        sections = s.execute(text("select id, level, title, parent_id, start_page, start_char, source"
                                  " from document_sections where document_id = :d order by ordinal"),
                             {"d": ctx.document_id}).all()
    ctx.update(stage="indexing", current=0, total=len(sections), message="Dividiendo en fragmentos e indexando")
    rows = _load_pages(ctx)
    pages = [PageText(r.page_number, r.text, r.is_eligible) for r in rows]
    boundaries = [Boundary(i, sec.start_page, sec.start_char) for i, sec in enumerate(sections)]
    chunks = chunk_document(pages, boundaries)

    by_id = {sec.id: sec for sec in sections}

    def header(sec) -> str:
        path = [sec.title]
        while sec.parent_id is not None:
            sec = by_id[sec.parent_id]
            path.append(sec.title)
        return " › ".join(reversed(path))

    with ctx.session() as s:
        for ordinal, ch in enumerate(chunks):
            sec = sections[ch.section]
            s.execute(
                text("insert into document_chunks (document_id, user_id, section_id, ordinal, text, context_header,"
                     " page_start, page_end, spans, token_estimate, char_count, is_eligible, ineligible_reason, flags)"
                     " values (:d, :u, :sec, :o, :t, :h, :ps, :pe, cast(:spans as jsonb), :tok, :cc, :e, :r, :f)"),
                {"d": ctx.document_id, "u": ctx.user_id, "sec": sec.id, "o": ordinal, "t": ch.text, "h": header(sec),
                 "ps": ch.page_start, "pe": ch.page_end,
                 "spans": json.dumps([{"page": p, "start": a, "end": b} for p, a, b in ch.spans]),
                 "tok": len(ch.text) // 4, "cc": len(ch.text), "e": ch.eligible, "r": ch.reason, "f": ch.flags},
            )
        eligible = sum(c.eligible for c in chunks)
        stats = {"sections": len(sections), "top_level_sections": sum(1 for x in sections if x.level == 1),
                 "structure_source": sections[0].source if sections else None,
                 "chunks": len(chunks), "chunks_eligible": eligible}
        s.execute(text("update documents set stats = stats || cast(:st as jsonb) where id = :id"),
                  {"st": json.dumps(stats), "id": ctx.document_id})
    ctx.update(current=len(sections), message=f"{len(chunks)} fragmentos indexados", checkpoint={"indexed": True})


def on_ingest_failed(ctx: JobContext, error: str) -> None:
    with ctx.session() as s:
        s.execute(text("update documents set status = 'error', error = :e where id = :id"),
                  {"e": error, "id": ctx.document_id})
