from fastapi import FastAPI
from sqlalchemy import text

from app.api import auth, documents, facts, generation, questions, structure
from app.db import get_engine

app = FastAPI(title="Banco de Preguntas", version="0.1.0")
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(structure.router)
app.include_router(facts.router)
app.include_router(generation.router)
app.include_router(questions.router)


@app.get("/api/health")
def health() -> dict[str, str]:
    with get_engine().connect() as conn:
        conn.execute(text("select 1"))
    return {"status": "ok"}
