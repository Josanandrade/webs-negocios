import logging
import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy import text

from app.api import auth, documents, facts, generation, questions, quizzes, stats, structure
from app.config import get_settings
from app.db import get_engine


@asynccontextmanager
async def lifespan(_: FastAPI):
    stop = threading.Event()
    worker = None
    if get_settings().run_worker:
        from app.jobs.runner import run_forever

        logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
        worker = threading.Thread(target=run_forever, kwargs={"stop": stop}, name="worker", daemon=True)
        worker.start()
    yield
    stop.set()
    if worker:
        worker.join(timeout=10)


app = FastAPI(title="Banco de Preguntas", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in get_settings().cors_origins.split(",") if o.strip()],
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(structure.router)
app.include_router(facts.router)
app.include_router(generation.router)
app.include_router(questions.router)
app.include_router(quizzes.router)
app.include_router(stats.router)


@app.get("/api/health")
def health() -> dict[str, str]:
    with get_engine().connect() as conn:
        conn.execute(text("select 1"))
    return {"status": "ok"}


# ------------------------------------------------------------------ web compilada
_web = get_settings().web_dir
if _web and (_web / "index.html").is_file():
    WEB_ROOT = _web.resolve()
    NO_CACHE = {"Cache-Control": "no-cache"}

    @app.get("/{path:path}", include_in_schema=False)
    def web(path: str):
        """Ficheros de la web; cualquier otra ruta devuelve index.html (la app decide la página)."""
        if path.startswith("api/") or path == "api":
            raise HTTPException(404, "Not Found")
        target = (WEB_ROOT / path).resolve()
        if path and target.is_file() and target.is_relative_to(WEB_ROOT):
            if path.startswith("assets/"):   # nombre con huella: se puede guardar para siempre
                return FileResponse(target, headers={"Cache-Control": "public, max-age=31536000, immutable"})
            return FileResponse(target, headers=NO_CACHE)
        return FileResponse(WEB_ROOT / "index.html", headers=NO_CACHE)
