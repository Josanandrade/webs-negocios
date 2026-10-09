"""Pipeline de ingestión de un documento (job 'ingest').

Etapas (cada una idempotente y reanudable):
  1. extracting           texto por página (nativo u OCR); una transacción por página
  2. cleaning             normalización, cabeceras/pies repetidos, calidad y elegibilidad
  (bloque 3 añadirá: analyzing_structure, indexing)
"""
import json
from collections import Counter

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
    finally:
        pdf.close()
    _clean_and_assess(ctx)
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


def on_ingest_failed(ctx: JobContext, error: str) -> None:
    with ctx.session() as s:
        s.execute(text("update documents set status = 'error', error = :e where id = :id"),
                  {"e": error, "id": ctx.document_id})
