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
| 4 | IA intercambiable (Gemini gratuito por defecto), cuotas, hechos verificados, catálogo de distractores | ✅ |
| 5 | Generación + validación determinista + verificación independiente + duplicados + cobertura | ✅ |
| 6 | Banco de preguntas: filtros, búsqueda, fuentes, edición auditada, estados, etiquetas, lote | ✅ |
| 7 | Tests del alumno, corrección, estadísticas | pendiente |
| 8 | Frontend web responsive (PC y móvil, instalable) | pendiente |
| 9 | Despliegue gratuito (Render + Supabase + web estática) | pendiente |

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

## IA

Por defecto usa el **plan gratuito de Gemini** (crea una clave en Google AI Studio y ponla
en `GEMINI_API_KEY`). Cada tarea puede usar otro proveedor/modelo cambiando
`LLM_EXTRACTION`, `LLM_GENERATION`, `LLM_VERIFICATION` (`gemini:…`, `anthropic:…`,
`openai:…`, `ollama:…`). Si se agota la cuota diaria gratuita, el trabajo se pausa y se
reanuda solo al día siguiente.

## Tests

Se ejecutan contra un Postgres real (se crea y destruye una base de datos temporal):

```bash
cd backend
TEST_ADMIN_DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/postgres .venv/bin/pytest
```

`tests/test_live_gemini.py` hace una llamada REAL a Gemini y solo se ejecuta si existe `GEMINI_API_KEY`.

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
| POST | `/api/documents/{id}/facts/extract` | Extraer hechos verificados (todo el documento o `section_ids`) |
| GET | `/api/documents/{id}/facts` | Hechos con su cita literal y página |
| GET | `/api/documents/{id}/facts/{fact_id}/distractors` | Candidatos a distractor (con cita y página) |
| POST | `/api/documents/{id}/generate` | Generar preguntas: `section_ids`, `count` (o vacío = máximo de calidad), `difficulty` (`easy`/`medium`/`hard`/`mixed`) |
| GET | `/api/documents/{id}/coverage` | Preguntas por tema, temas poco cubiertos, reparto A/B/C/D |
| GET | `/api/jobs/{id}/candidates` | Informe de la generación: aceptadas y motivos de descarte |
| GET | `/api/questions` | Banco con filtros `document_id`, `section_id` (incluye subapartados), `status`, `difficulty`, `tag`, búsqueda `q` (enunciado y opciones, sin acentos) y paginación |
| GET | `/api/questions/{id}` | Detalle y auditoría: opciones, fuentes de la correcta y de cada distractor (página, cita y texto de alrededor), modelos, informe del verificador, historial de ediciones |
| PATCH | `/api/questions/{id}` | Editar enunciado, opciones, respuesta correcta, explicación, dificultad, etiquetas o estado (aprobar/descartar/restaurar); queda en el historial |
| DELETE | `/api/questions/{id}` | Eliminar (los tests ya hechos conservan su copia) |
| POST | `/api/questions/bulk` | Lote: aprobar, descartar, restaurar, eliminar, añadir/quitar etiqueta, cambiar dificultad |
| GET | `/api/questions/tags` | Etiquetas usadas y cuántas preguntas tiene cada una |
| GET | `/api/jobs/{id}` | Progreso real del trabajo |
| POST | `/api/jobs/{id}/retry` | Reanudar un trabajo fallido desde donde se quedó |
