"""Perfil de producción orientado a reducir la latencia de generación.

Mantiene exactamente el pipeline y los filtros de :mod:`app.generation.pipeline`,
pero ajusta únicamente parámetros de rendimiento:

* 12 hechos por llamada al generador (antes 8).
* 12 preguntas por llamada al verificador (antes 8).
* Ventana de contexto de redacción limitada a 500 caracteres por lado.
* El verificador añade como máximo 2 fragmentos de búsqueda extra; conserva además
  las evidencias literales de las cuatro opciones.
* Registra la duración real de cada lote para poder medir producción sin adivinar.

El generador y el verificador siguen siendo modelos distintos y todas las validaciones,
deduplicación, evidencias y reglas de aceptación del pipeline original permanecen activas.
"""
from __future__ import annotations

import logging
import time
from collections import Counter

from app.generation import pipeline as base
from app.generation.validation import DocumentContext
from app.jobs.runner import JobContext

log = logging.getLogger("generation.performance")

# Dos llamadas suelen bastar para producir/verificar 20 preguntas, manteniendo lotes lo
# bastante pequeños para conservar fiabilidad en la salida JSON del modelo gratuito.
base.GEN_BATCH = 12
base.VER_BATCH = 12

_original_context_window = base._context_window
_original_search_chunks = base.search_chunks
_original_draft_batch = base._draft_batch
_original_verify_batch = base._verify_batch


def _fast_context_window(page_text: str, start: int, end: int, radius: int = 500) -> str:
    """Evita enviar contexto redundante al generador sin tocar la cita literal del hecho."""
    return _original_context_window(page_text, start, end, radius=min(radius, 500))


def _fast_search_chunks(session, document_id, query: str, limit: int = 3):
    """Dos apoyos extra son suficientes: las cuatro opciones ya aportan sus propias citas."""
    return _original_search_chunks(session, document_id, query, limit=min(limit, 2))


def _timed_draft_batch(ctx: JobContext, batch, doc: DocumentContext, counters: Counter):
    started = time.monotonic()
    result = _original_draft_batch(ctx, batch, doc, counters)
    log.info(
        "draft_batch attempted=%s survivors=%s elapsed_ms=%s",
        len(batch),
        len(result),
        int((time.monotonic() - started) * 1000),
    )
    return result


def _timed_verify_batch(ctx: JobContext, survivors, counters: Counter):
    started = time.monotonic()
    accepted = _original_verify_batch(ctx, survivors, counters)
    log.info(
        "verify_batch submitted=%s accepted=%s elapsed_ms=%s",
        len(survivors),
        len(accepted),
        int((time.monotonic() - started) * 1000),
    )
    return accepted


# Las funciones originales resuelven estos nombres en el módulo ``base`` en tiempo de
# ejecución, así que los ajustes se aplican también a los lotes lanzados por su executor.
base._context_window = _fast_context_window
base.search_chunks = _fast_search_chunks
base._draft_batch = _timed_draft_batch
base._verify_batch = _timed_verify_batch


def run_generate(ctx: JobContext) -> None:
    """Ejecuta el pipeline original con el perfil rápido y mide el tiempo total del job."""
    started = time.monotonic()
    try:
        base.run_generate(ctx)
    finally:
        log.info(
            "generation_job job_id=%s elapsed_ms=%s",
            ctx.job_id,
            int((time.monotonic() - started) * 1000),
        )
