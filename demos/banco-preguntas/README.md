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
| 7 | Tests del alumno (práctica/examen, tiempo límite, penalización), corrección, repaso de fallos, estadísticas | ✅ |
| 8 | Web responsive (PC y móvil), instalable como app (PWA), modo claro/oscuro | ✅ |
| 9 | Despliegue: un servicio en Railway (API + worker + web) y base de datos en Supabase | ✅ |

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

cd ../frontend
npm install
npm run dev                                # web en http://localhost:5173 (reenvía /api a :8000)
```

## Web (`frontend/`)

React + TypeScript + Vite + Tailwind. Funciona en PC y móvil y se puede **instalar como app**
(en el móvil: «Añadir a pantalla de inicio»). Modo claro u oscuro según el sistema.

| Pantalla | Qué hace |
|---|---|
| Tests | Tests en curso (continuar) y realizados (nota) |
| Nuevo test | Modo práctica/examen, temas, dificultad, número, al azar/no vistas/falladas/puntos débiles, penalización, tiempo límite, barajar opciones |
| Hacer test | Una pregunta por pantalla, navegador de preguntas, temporizador, teclado (1-4 / A-D, flechas); en práctica, corrección inmediata con página y cita |
| Resultados | Nota, neto, aciertos/fallos/en blanco, corrección filtrable, «Repasar fallos» |
| Banco | Filtros (documento, tema, estado, dificultad, etiqueta), búsqueda, acciones en lote |
| Pregunta | Opciones con su cita y página, contexto resaltado en el temario, cómo se generó, historial, editar/aprobar/descartar |
| Documentos | Subida con progreso, procesamiento en vivo, temas, calidad del texto, generar preguntas, informe de descartes, cobertura por tema |
| Estadísticas | Nota media, evolución, aciertos por tema y dificultad, cobertura del banco, preguntas más falladas |

```bash
cd frontend
npm test                                   # tests de componentes (vitest)
npm run build                              # web estática en dist/ (define VITE_API_URL)
E2E_EMAIL=... E2E_PASSWORD=... node e2e/recorrido.mjs   # recorrido real en PC y móvil (API y web en marcha)
```

En producción la web es estática y llama a la API indicada en `VITE_API_URL`; la API debe
incluir el origen de la web en `CORS_ORIGINS`.

## IA

Por defecto usa el **plan gratuito de Gemini** (crea una clave en Google AI Studio y ponla
en `GEMINI_API_KEY`). Cada tarea puede usar otro proveedor/modelo cambiando
`LLM_EXTRACTION`, `LLM_GENERATION`, `LLM_VERIFICATION` (`gemini:…`, `anthropic:…`,
`openai:…`, `ollama:…`). Cada variable admite modelos de reserva separados por comas
(`gemini:gemini-flash-latest,gemini:gemini-3.6-flash`): si uno está saturado (503), limitado
por minuto, retirado (404) o sin cuota diaria, se usa el siguiente sin esperar. El
verificador nunca usa un modelo de la lista del generador. Si todos agotan la cuota diaria,
el trabajo se pausa y se reanuda solo al día siguiente.

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
| POST | `/api/quizzes` | Crear test: filtros (`document_ids`, `section_ids`, `difficulties`, `tags`, `only_reviewed`), `selection` (`random`/`unseen`/`failed`/`weak`), `count`, `mode` (`practice`/`exam`), `penalty` (por defecto 1/3), `time_limit_minutes` (examen), `shuffle_options` |
| GET | `/api/quizzes` · `/api/quizzes/{id}` | Tests realizados y en curso; la respuesta correcta solo aparece cuando ya se puede ver |
| PUT | `/api/quizzes/{id}/questions/{n}` | Responder (`selected_label` o `null` = en blanco). En práctica devuelve la corrección al momento |
| POST | `/api/quizzes/{id}/finish` | Entregar: aciertos, fallos, en blanco, neto y nota sobre 10, con página y cita de cada respuesta |
| POST | `/api/quizzes/{id}/retry` | Nuevo test con los fallos y las preguntas en blanco |
| DELETE | `/api/quizzes/{id}` | Borrar un test (deja de contar en las estadísticas) |
| GET | `/api/stats` | Estadísticas (opcional `document_id`): evolución de notas, por tema (peor primero), por dificultad, más falladas, cobertura del banco (vistas, sin ver, dominadas, a repasar) |
| GET | `/api/jobs/{id}` | Progreso real del trabajo |
| POST | `/api/jobs/{id}/retry` | Reanudar un trabajo fallido desde donde se quedó |

## Despliegue (producción)

Un único servicio Docker (`Dockerfile`) con la API, el worker de trabajos largos y la web
compilada (misma dirección, sin CORS). Base de datos en Supabase; ficheros en un volumen.

| Pieza | Dónde |
|---|---|
| API + worker + web | Railway, servicio `app` del proyecto `banco-preguntas` (región Europa), raíz `demos/banco-preguntas` |
| Ficheros originales | Volumen de Railway montado en `/data` |
| Base de datos | Supabase (Postgres con pgvector), conexión directa por IPv6 (activada en el servicio) |

Variables del servicio:

| Variable | Valor |
|---|---|
| `MIGRATIONS_DATABASE_URL` | Conexión del usuario `postgres` de Supabase. Al arrancar se aplican las migraciones pendientes y se crea el rol restringido |
| `DATABASE_URL` | Mismo servidor con el rol `banco_api` (sin BYPASSRLS) y una contraseña aleatoria propia |
| `JWT_SECRET` | Secreto aleatorio largo |
| `GEMINI_API_KEY` | Clave de Google AI Studio |
| `CORS_ORIGINS` | La dirección pública del servicio |
| `RUN_WORKER=true`, `WEB_DIR=/app/web`, `STORAGE_DIR=/data/storage`, `PORT=8000` | Modo de un solo servicio |
| `AUTO_EXTRACT_FACTS=true` | Al terminar de procesar un temario, extrae ya sus datos en segundo plano (así «Generar» no espera esa fase) |

Cada push a la rama conectada que toque `demos/banco-preguntas/` vuelve a desplegar. La
comprobación de salud es `GET /api/health`.
