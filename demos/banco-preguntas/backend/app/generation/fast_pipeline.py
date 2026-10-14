"""Perfil de producción orientado a reducir la latencia sin sacrificar cobertura ni calidad.

Mantiene el pipeline y sus filtros de calidad, con ajustes de producción:

* 12 hechos por llamada al generador y 12 preguntas por llamada al verificador.
* Ventanas de contexto más pequeñas para evitar texto redundante.
* Los hechos descartados por una mala redacción, falta temporal de distractores o
  verificación pueden volver a intentarse con límite prudente.
* Si el tema seleccionado tiene pocos hechos disponibles, se vuelve a leer su texto de
  forma exhaustiva para extraer hechos adicionales antes de empezar a redactar preguntas.
* Si un tema pequeño no aporta tres alternativas locales, la generación puede completar
  con valores del mismo tipo de otros temas del MISMO documento; siguen pasando todos los
  filtros y la verificación independiente.
* Registra la duración real de cada lote para poder medir producción sin adivinar.

El generador y el verificador siguen siendo modelos distintos y todas las validaciones,
deduplicación, evidencias y reglas de aceptación del pipeline original permanecen activas.
"""
from __future__ import annotations

import logging
import time
from collections import Counter

from app.facts.augment import augment_facts_for_scope
from app.generation import pipeline as base
from app.generation.retry_plan import plan_with_retries
from app.generation.validation import DocumentContext
from app.jobs.runner import JobContext

log = logging.getLogger("generation.performance")

# Dos llamadas suelen bastar para producir/verificar 20 preguntas, manteniendo lotes lo
# bastante pequeños para conservar fiabilidad en la salida JSON del modelo gratuito.
base.GEN_BATCH = 12
base.VER_BATCH = 12

_original_context_window = base._context_window
_original_search_chunks = base.search_chunks
_original_distractor_candidates = base.distractor_candidates
_original_draft_batch = base._draft_batch
_original_verify_batch = base._verify_batch
_original_extract_facts_for_scope = base.extract_facts_for_scope


def _fast_context_window(page_text: str, start: int, end: int, radius: int = 500) -> str:
    """Evita enviar contexto redundante al generador sin tocar la cita literal del hecho."""
    return _original_context_window(page_text, start, end, radius=min(radius, 500))


def _fast_search_chunks(session, document_id, query: str, limit: int = 3):
    """Dos apoyos extra son suficientes: las cuatro opciones ya aportan sus propias citas."""
    return _original_search_chunks(session, document_id, query, limit=min(limit, 2))


def _generation_distractors(session, fact_id, *, difficulty: str = "medium", limit: int = 8):
    """Fallback de generación: permite completar alternativas con otros temas del documento."""
    return _original_distractor_candidates(
        session,
        fact_id,
        difficulty=difficulty,
        limit=limit,
        allow_cross_topic=True,
    )


def _extract_with_coverage(ctx: JobContext, scope) -> None:
    """Extracción normal + refuerzo solo cuando el tema no tiene margen para lo pedido."""
    _original_extract_facts_for_scope(ctx, scope)
    target = ctx.payload.get("count")
    if not isinstance(target, int) or target <= 0:
        return
    started = time.monotonic()
    added = augment_facts_for_scope(ctx, scope, target)
    if added:
        log.info(
            "fact_augmentation job_id=%s target=%s added=%s elapsed_ms=%s",
            ctx.job_id,
            target,
            added,
            int((time.monotonic() - started) * 1000),
        )


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
base._plan = plan_with_retries
base._context_window = _fast_context_window
base.search_chunks = _fast_search_chunks
base.distractor_candidates = _generation_distractors
base.extract_facts_for_scope = _extract_with_coverage
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
