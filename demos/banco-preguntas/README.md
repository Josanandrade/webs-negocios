# Banco de Preguntas

Herramienta para convertir temarios extensos (PDF/DOCX, ~300 páginas) en un banco de
preguntas tipo test **verificables y estrictamente basadas en el documento**.

- Diseño completo y auditoría: [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md)
- Principio rector: ante la duda, **no** generar la pregunta.

## Estado

| Bloque | Contenido | Estado |
|---|---|---|
| 1 | Esquema SQL, RLS, invariantes de preguntas en BD, auth, subida | ✅ |
| 2 | Worker con jobs reanudables, extracción por página, OCR, limpieza, calidad | ✅ |
| 3 | Estructura (temas), fragmentación con trazabilidad exacta, búsqueda | ✅ |
| 4 | Abstracción LLM (Ollama local gratuito por defecto), hechos verificados, catálogo de distractores | pendiente |
| 5 | Generación + validación determinista + verificación LLM + duplicados | pendiente |
| 6 | API del banco | pendiente |
| 7 | Tests del alumno, corrección, estadísticas | pendiente |
| 8 | Frontend | pendiente |

## Requisitos

- Python 3.11+
- PostgreSQL 15+ con la extensión `pgvector` (Supabase sirve)
- Tesseract 5 con idioma `spa` (OCR de páginas escaneadas)
- LibreOffice (`soffice`) para convertir DOCX a PDF con páginas reales

## Puesta en marcha (local)

```bash
cd backend
python3 -m venv .venv && .venv/bin/pip install -e ".[dev]"
cp .env.example .env                       # ajusta credenciales y JWT_SECRET
./scripts/bootstrap_local_db.sh            # crea BD, rol restringido y aplica migraciones
.venv/bin/uvicorn app.main:app --reload    # API en http://localhost:8000/docs
.venv/bin/python -m app.worker             # worker de procesamiento (otra terminal)
```

## Tests

Se ejecutan contra un Postgres real (se crea y destruye una base de datos temporal):

```bash
cd backend
TEST_ADMIN_DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/postgres .venv/bin/pytest
```

## API disponible

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` · `/api/auth/login` | Alta e inicio de sesión (JWT) |
| GET | `/api/auth/me` | Usuario actual |
| POST | `/api/documents` | Subir PDF/DOCX (multipart `file`); crea job de ingestión |
| GET | `/api/documents` · `/api/documents/{id}` | Documentos propios con estado del último job |
| DELETE | `/api/documents/{id}` | Borra documento, páginas, preguntas y fichero |
| GET | `/api/documents/{id}/pages` | Páginas: método (nativo/OCR), confianza, calidad, elegibilidad |
| GET | `/api/documents/{id}/pages/{n}` | Texto canónico de una página |
| GET | `/api/documents/{id}/sections` | Árbol de temas/apartados con nº de fragmentos (aptos y totales) |
| GET | `/api/documents/{id}/chunks` | Fragmentos con sus spans `(página, inicio, fin)`; filtros `section_id`, `eligible_only` |
| GET | `/api/documents/{id}/search?q=` | Búsqueda en el documento (texto completo en español, tolerante a erratas) |
| GET | `/api/jobs/{id}` | Progreso real del trabajo |
| POST | `/api/jobs/{id}/retry` | Reanudar un trabajo fallido desde donde se quedó |
