"""OCR con Tesseract (proceso externo) devolviendo texto y confianza media."""
import csv
import io
import shutil
import subprocess
from dataclasses import dataclass


class OcrUnavailable(RuntimeError):
    pass


@dataclass
class OcrResult:
    text: str
    confidence: float  # 0-100, media ponderada por longitud de palabra
    words: int


def tesseract_available() -> bool:
    return shutil.which("tesseract") is not None


def ocr_png(png: bytes, lang: str = "spa", timeout: int = 180) -> OcrResult:
    if not tesseract_available():
        raise OcrUnavailable("Tesseract no está instalado")
    proc = subprocess.run(
        ["tesseract", "stdin", "stdout", "-l", lang, "--psm", "3", "tsv"],
        input=png, capture_output=True, timeout=timeout, check=False,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"Tesseract falló: {proc.stderr.decode(errors='replace')[:500]}")
    return parse_tsv(proc.stdout.decode("utf-8", errors="replace"))


def parse_tsv(tsv: str) -> OcrResult:
    """Reconstruye el texto respetando bloques/párrafos/líneas y calcula la confianza."""
    lines: dict[tuple[int, int, int], list[str]] = {}
    order: list[tuple[int, int, int]] = []
    weighted, weight, words = 0.0, 0, 0
    for row in csv.DictReader(io.StringIO(tsv), delimiter="\t", quoting=csv.QUOTE_NONE):
        if row.get("level") != "5":
            continue
        word = (row.get("text") or "").strip()
        conf = float(row.get("conf") or -1)
        if not word or conf < 0:
            continue
        key = (int(row["block_num"]), int(row["par_num"]), int(row["line_num"]))
        if key not in lines:
            lines[key] = []
            order.append(key)
        lines[key].append(word)
        weighted += conf * len(word)
        weight += len(word)
        words += 1
    out: list[str] = []
    prev_par: tuple[int, int] | None = None
    for key in order:
        par = key[:2]
        if prev_par is not None and par != prev_par:
            out.append("")
        out.append(" ".join(lines[key]))
        prev_par = par
    return OcrResult(text="\n".join(out), confidence=round(weighted / weight, 2) if weight else 0.0, words=words)
