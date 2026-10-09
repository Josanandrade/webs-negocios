"""Extracción de texto por página de un PDF, con OCR cuando la página es una imagen."""
import shutil
import subprocess
import tempfile
from collections.abc import Callable
from dataclasses import dataclass, field
from pathlib import Path

import pymupdf as fitz

from app.ingestion.cleanup import normalize_text
from app.ingestion.ocr import OcrResult, OcrUnavailable, ocr_png
from app.ingestion.quality import text_quality

OCR_DPI = 300
MIN_NATIVE_CHARS = 50          # por debajo, la capa de texto no basta
MIN_NATIVE_QUALITY = 0.5       # texto nativo corrupto (fuentes mal codificadas) -> OCR
MIN_IMAGE_COVERAGE_FOR_OCR = 0.05

OcrFn = Callable[[bytes], OcrResult]


@dataclass
class ExtractedPage:
    page_number: int
    raw_text: str
    method: str                       # 'native' | 'ocr'
    ocr_confidence: float | None
    image_coverage: float
    flags: list[str] = field(default_factory=list)


class UnsupportedDocument(ValueError):
    pass


def open_pdf(data: bytes) -> fitz.Document:
    try:
        doc = fitz.open(stream=data, filetype="pdf")
    except Exception as exc:  # noqa: BLE001 - PyMuPDF lanza varios tipos
        raise UnsupportedDocument(f"El PDF no se puede abrir: {exc}") from exc
    if doc.needs_pass:
        raise UnsupportedDocument("El PDF está protegido con contraseña")
    if doc.page_count == 0:
        raise UnsupportedDocument("El PDF no tiene páginas")
    return doc


def image_coverage(page: fitz.Page) -> float:
    area = abs(page.rect)
    if not area:
        return 0.0
    covered = 0.0
    for info in page.get_image_info():
        bbox = fitz.Rect(info["bbox"]) & page.rect
        covered += abs(bbox)
    return round(min(covered / area, 1.0), 3)


def native_text(page: fitz.Page) -> str:
    blocks = page.get_text("blocks", sort=True)
    return "\n\n".join(b[4].strip() for b in blocks if b[6] == 0 and b[4].strip())


def _count_chars(text: str) -> int:
    return sum(1 for c in text if not c.isspace())


def extract_page(doc: fitz.Document, index: int, ocr: OcrFn = ocr_png) -> ExtractedPage:
    page = doc[index]
    text = native_text(page)
    coverage = image_coverage(page)
    n_chars = _count_chars(text)
    flags: list[str] = []

    native_ok = n_chars >= MIN_NATIVE_CHARS and text_quality(normalize_text(text)) >= MIN_NATIVE_QUALITY
    if native_ok:
        if coverage > 0.8:
            flags.append("imagen_con_capa_de_texto")
        return ExtractedPage(index + 1, text, "native", None, coverage, flags)

    needs_ocr = coverage >= MIN_IMAGE_COVERAGE_FOR_OCR or n_chars > 0
    if not needs_ocr:
        return ExtractedPage(index + 1, text, "native", None, coverage, flags)

    png = page.get_pixmap(dpi=OCR_DPI, colorspace=fitz.csGRAY).tobytes("png")
    try:
        result = ocr(png)
    except OcrUnavailable:
        flags.append("ocr_no_disponible")
        return ExtractedPage(index + 1, text, "native", None, coverage, flags)
    if _count_chars(result.text) < n_chars:
        # El OCR recupera menos que la capa de texto existente: nos quedamos con ésta.
        flags.append("ocr_descartado")
        return ExtractedPage(index + 1, text, "native", None, coverage, flags)
    return ExtractedPage(index + 1, result.text, "ocr", result.confidence, coverage, flags)


def docx_to_pdf(data: bytes, timeout: int = 300) -> bytes:
    """Convierte DOCX a PDF con LibreOffice para obtener páginas reales y citables."""
    soffice = shutil.which("soffice") or shutil.which("libreoffice")
    if soffice is None:
        raise UnsupportedDocument("Para procesar DOCX es necesario LibreOffice (soffice) en el servidor")
    with tempfile.TemporaryDirectory() as tmp:
        src = Path(tmp) / "documento.docx"
        src.write_bytes(data)
        proc = subprocess.run(
            [soffice, "--headless", "--norestore", f"-env:UserInstallation=file://{tmp}/profile",
             "--convert-to", "pdf", "--outdir", tmp, str(src)],
            capture_output=True, timeout=timeout, check=False,
        )
        out = Path(tmp) / "documento.pdf"
        if proc.returncode != 0 or not out.exists():
            raise UnsupportedDocument("No se pudo convertir el DOCX a PDF: "
                                      + proc.stderr.decode(errors="replace")[:300])
        return out.read_bytes()
