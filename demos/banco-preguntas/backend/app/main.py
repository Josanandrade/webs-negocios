from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api import auth, documents, facts, generation, questions, quizzes, stats, structure
from app.config import get_settings
from app.db import get_engine

app = FastAPI(title="Banco de Preguntas", version="0.1.0")
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
