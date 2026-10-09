"""Ejecución robusta de trabajos largos.

* Un worker reclama un job con `app.claim_job` (FOR UPDATE SKIP LOCKED + lease).
* Cada actualización de progreso renueva el lease (latido). Si el worker muere, el
  lease caduca y otro worker retoma el job.
* Los handlers son idempotentes y guardan su avance en BD: un reintento continúa
  donde se quedó, no empieza de cero.
"""
import logging
import os
import socket
import time
from collections.abc import Callable
from typing import Any
from uuid import UUID

from sqlalchemy import Engine, text

from app.db import anonymous_session, get_engine, user_session
from app.llm.base import QuotaExhausted

log = logging.getLogger("worker")

DEFAULT_LEASE_SECONDS = 300
DEFAULT_RETRY_DELAY_SECONDS = 30


class LeaseLost(RuntimeError):
    """Otro worker ha tomado el job (nuestro lease caducó)."""


class JobContext:
    def __init__(self, job: dict[str, Any], worker_id: str, engine: Engine, lease_seconds: int):
        self.job_id: UUID = job["id"]
        self.user_id: UUID = job["user_id"]
        self.document_id: UUID | None = job["document_id"]
        self.kind: str = job["kind"]
        self.payload: dict[str, Any] = job["payload"]
        self.checkpoint: dict[str, Any] = dict(job["checkpoint"])
        self.worker_id = worker_id
        self.engine = engine
        self.lease_seconds = lease_seconds

    def session(self):
        return user_session(self.user_id, self.engine)

    def update(self, *, stage: str | None = None, current: int | None = None, total: int | None = None,
               message: str | None = None, checkpoint: dict[str, Any] | None = None) -> None:
        """Guarda progreso y renueva el lease. Lanza LeaseLost si ya no somos dueños del job."""
        if checkpoint:
            self.checkpoint.update(checkpoint)
        with self.session() as s:
            row = s.execute(
                text("""
                    update processing_jobs set
                      stage = coalesce(:stage, stage),
                      progress_current = coalesce(:cur, progress_current),
                      progress_total = coalesce(:tot, progress_total),
                      message = coalesce(:msg, message),
                      checkpoint = cast(:cp as jsonb),
                      lease_expires_at = now() + make_interval(secs => :lease)
                    where id = :id and locked_by = :w and status = 'running'
                    returning id"""),
                {"stage": stage, "cur": current, "tot": total, "msg": message,
                 "cp": _json(self.checkpoint), "lease": self.lease_seconds, "id": self.job_id, "w": self.worker_id},
            ).first()
        if row is None:
            raise LeaseLost(f"El job {self.job_id} ya no pertenece a {self.worker_id}")


def _json(value: Any) -> str:
    import json

    return json.dumps(value, ensure_ascii=False, default=str)


Handler = Callable[[JobContext], None]
FailureHook = Callable[[JobContext, str], None]


def _handlers() -> dict[str, tuple[Handler, FailureHook | None]]:
    from app.facts.pipeline import run_extract_facts
    from app.ingestion.pipeline import on_ingest_failed, run_ingest

    return {"ingest": (run_ingest, on_ingest_failed), "extract_facts": (run_extract_facts, None)}


def default_worker_id() -> str:
    return f"{socket.gethostname()}:{os.getpid()}"


def run_one(worker_id: str | None = None, *, engine: Engine | None = None,
            lease_seconds: int = DEFAULT_LEASE_SECONDS,
            retry_delay_seconds: int = DEFAULT_RETRY_DELAY_SECONDS) -> UUID | None:
    """Reclama y ejecuta un job. Devuelve su id, o None si no había trabajo."""
    engine = engine or get_engine()
    worker_id = worker_id or default_worker_id()
    with anonymous_session(engine) as s:
        s.execute(text("select app.fail_exhausted_jobs()"))
        claimed = s.execute(text("select job_id, job_user_id from app.claim_job(:w, :l)"),
                            {"w": worker_id, "l": lease_seconds}).first()
    if claimed is None:
        return None

    with user_session(claimed.job_user_id, engine) as s:
        job = s.execute(text("select id, user_id, document_id, kind, payload, checkpoint, attempts, max_attempts"
                             " from processing_jobs where id = :id"), {"id": claimed.job_id}).mappings().one()
    ctx = JobContext(dict(job), worker_id, engine, lease_seconds)
    handler, on_failed = _handlers()[ctx.kind]
    try:
        handler(ctx)
    except LeaseLost:
        log.warning("Lease perdido en job %s; otro worker continuará", ctx.job_id)
        return ctx.job_id
    except QuotaExhausted as exc:
        # No es un fallo: se pausa hasta que se renueve la cuota y no consume intento.
        with ctx.session() as s:
            s.execute(text("""
                update processing_jobs set status = 'pending', locked_by = null, lease_expires_at = null,
                  attempts = greatest(attempts - 1, 0), run_after = :resume,
                  message = :msg
                where id = :id and locked_by = :w"""),
                {"resume": exc.resume_at, "id": ctx.job_id, "w": worker_id,
                 "msg": f"En pausa: {exc}. Se reanudará automáticamente el "
                        f"{exc.resume_at.astimezone().strftime('%d/%m a las %H:%M')}"})
        return ctx.job_id
    except Exception as exc:  # noqa: BLE001 - cualquier fallo se registra y se reintenta
        log.exception("Fallo en job %s", ctx.job_id)
        error = f"{type(exc).__name__}: {exc}"[:2000]
        final = job["attempts"] >= job["max_attempts"]
        with ctx.session() as s:
            s.execute(text("""
                update processing_jobs set
                  status = :status, locked_by = null, lease_expires_at = null, last_error = :err,
                  run_after = now() + make_interval(secs => :delay),
                  finished_at = case when :final then now() else null end,
                  message = :msg
                where id = :id and locked_by = :w"""),
                {"status": "failed" if final else "pending", "err": error, "delay": retry_delay_seconds * job["attempts"],
                 "final": final, "id": ctx.job_id, "w": worker_id,
                 "msg": "Error: se agotaron los reintentos" if final else "Error; se reintentará automáticamente"})
        if final and on_failed:
            on_failed(ctx, error)
        return ctx.job_id

    with ctx.session() as s:
        s.execute(text("""
            update processing_jobs set status = 'succeeded', stage = 'done', finished_at = now(),
              locked_by = null, lease_expires_at = null, message = 'Finalizado'
            where id = :id and locked_by = :w"""), {"id": ctx.job_id, "w": worker_id})
    return ctx.job_id


def run_forever(poll_seconds: float = 2.0) -> None:
    worker_id = default_worker_id()
    log.info("Worker %s iniciado", worker_id)
    while True:
        try:
            if run_one(worker_id) is None:
                time.sleep(poll_seconds)
        except Exception:  # noqa: BLE001 - el bucle no debe morir por un error de BD puntual
            log.exception("Error en el bucle del worker")
            time.sleep(poll_seconds * 5)
