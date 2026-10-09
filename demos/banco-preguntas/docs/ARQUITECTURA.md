# Banco de Preguntas — Auditoría y arquitectura

> Documento vivo. Describe el diseño acordado antes de implementar y se actualiza
> al cerrar cada bloque. Principio rector: **ante la duda, NO generar la pregunta.**

---

## 1. Análisis del problema

Convertir un temario de ~300 páginas en un banco de preguntas tipo test **fiable y
auditable**. El reto no es "que un LLM escriba preguntas" (eso es trivial), sino:

| Problema | Por qué es difícil | Consecuencia de diseño |
|---|---|---|
| Alucinación en enunciado / respuesta | El LLM completa huecos con conocimiento de entrenamiento | Toda afirmación debe anclarse a una **cita literal** verificable por código |
| Alucinación en distractores | Lo "natural" para un LLM es inventar cifras plausibles | Los distractores se **seleccionan** de un catálogo de valores extraídos del documento; el LLM no los crea |
| Ambigüedad (2 respuestas correctas) | Un distractor puede ser cierto en otra parte del documento | Búsqueda en todo el documento de co-ocurrencias sujeto+distractor y verificación ciega independiente |
| Trazabilidad de página | Al trocear se pierde la relación texto↔página | Cada fragmento guarda *spans* `(página, inicio, fin)` sobre el texto canónico de cada página |
| PDFs escaneados | OCR introduce errores (un "40 mg" puede ser "4O mg") | Calidad por página; páginas con OCR pobre quedan **no elegibles** |
| Documentos largos y coste | No se pueden mandar 300 páginas por pregunta | Indexado + retrieval; cada llamada al LLM recibe solo un "paquete de evidencia" pequeño |
| Procesos largos | Una petición HTTP no puede esperar minutos | Jobs persistentes en Postgres con etapas, progreso, *lease* y reanudación |
| Sesgos de formato | Posición fija, respuesta correcta más larga, patrones | Posición asignada por el backend con balanceo; filtros de longitud y estilo deterministas |

**Decisión clave:** el LLM se usa como *redactor y verificador*, nunca como *fuente*.
La fuente es siempre el texto extraído y almacenado; todo lo que el LLM produce se
contrasta contra ese texto con comprobaciones deterministas antes y después de la
verificación por LLM.

---

## 2. Arquitectura propuesta

```
┌────────────┐   HTTP/JSON   ┌──────────────────────┐       ┌──────────────────────┐
│  Frontend  │ ────────────▶ │  API (FastAPI)       │──────▶│ PostgreSQL 16        │
│  React+Vite│ ◀──────────── │  auth, CRUD, jobs    │       │  + pgvector          │
└────────────┘               └──────────┬───────────┘       │  + FTS 'spanish'     │
                                        │ crea job          │  + RLS por usuario   │
                                        ▼                   └──────────▲───────────┘
                             ┌──────────────────────┐                  │
                             │  Worker (proceso)    │──────────────────┘
                             │  ingestión/generación│     claim con SKIP LOCKED + lease
                             └──────────┬───────────┘
                                        │ interfaz LLMProvider / EmbeddingProvider
                         ┌──────────────┼──────────────┐
                     Anthropic        OpenAI         Google      (configurable por tarea)
```

**Stack:**

- **Backend:** Python 3.12+ · FastAPI · SQLAlchemy 2 · psycopg 3. Python tiene el mejor
  ecosistema para PDF/OCR (PyMuPDF, Tesseract, python-docx).
- **Base de datos:** PostgreSQL 16 con `pgvector` y búsqueda de texto completo en
  español. Compatible 1:1 con Supabase (las migraciones son SQL plano).
- **Cola de trabajos:** la propia tabla `processing_jobs` con `FOR UPDATE SKIP LOCKED`
  y *lease* con caducidad. Sin Redis ni Celery en el MVP (menos piezas, misma robustez
  para un usuario o pocos). Si en SaaS hiciera falta escalar, se sustituye el *claim*
  sin tocar la lógica de etapas.
- **Almacenamiento de ficheros:** interfaz `Storage` con implementación en disco local;
  la siguiente implementación natural es Supabase Storage / S3.
- **Frontend:** React + Vite + TypeScript + Tailwind (bloque posterior).
- **OCR:** Tesseract 5 (`spa`) con confianza por palabra.

**Autenticación y autorización (dos capas):**

1. La API emite JWT propios (email + contraseña con Argon2). La verificación de token
   está aislada para poder sustituirla por Supabase Auth sin tocar el resto.
2. **RLS en Postgres** en *todas* las tablas de usuario con `FORCE ROW LEVEL SECURITY`.
   La API se conecta con un rol sin privilegios (`banco_app`, sin `BYPASSRLS`, que no es
   dueño de las tablas) y en cada transacción fija `app.user_id`. Aunque un endpoint
   olvidara un `WHERE user_id = …`, la base de datos no devolvería filas ajenas.
   Además, claves foráneas compuestas `(id, user_id)` / `(id, document_id)` impiden por
   construcción que una página citada pertenezca a otro documento o a otro usuario.

---

## 3. Cómo garantizamos que el sistema NO invente información

Defensa en profundidad: **cinco barreras**, cualquiera de ellas descarta.

1. **Material de partida verificado (sin LLM generador aún).** Antes de generar, se
   extraen del texto "hechos atómicos" (*facts*): `sujeto`, `atributo`, `valor`, tipo y
   **cita literal**. Un *fact* solo se acepta si su cita aparece *literalmente* (tras
   normalizar espacios/guiones) en el fragmento y en la página que dice, y si su `valor`
   está contenido en la cita. Los hechos inventados por el extractor mueren aquí.
2. **Generación restringida.** El generador recibe UN hecho objetivo, su contexto
   inmediato y una **lista cerrada de candidatos a distractor** (con id, valor, cita y
   página). Debe devolver: enunciado, respuesta correcta, los **ids** de 3 distractores
   elegidos de la lista y una explicación. No puede proponer distractores fuera de ella.
   Si no hay 3 candidatos válidos, el pipeline **no llama al LLM** y descarta.
3. **Validación determinista (código, sin LLM).** Ver §8.2: citas existentes, página
   correcta, números/fechas/nombres presentes en sus fuentes, vocabulario del enunciado y
   opciones presente en el documento, opciones distintas, filtros de estilo, etc.
4. **Verificación independiente por LLM.** Otro modelo (configurable, idealmente de
   otro proveedor) recibe **solo** la pregunta, las 4 opciones *sin marcar cuál es la
   correcta* y el paquete de evidencias. Primero **resuelve a ciegas**; si no llega a la
   misma respuesta o detecta más de una correcta, se descarta. Después responde la lista
   de 11 comprobaciones; cualquier fallo descarta.
5. **Deduplicación y revisión humana.** Lo que llega al banco queda como
   `auto_validated`; el usuario puede marcarlo `manually_reviewed` o descartarlo, y
   siempre ve la fuente.

Reglas adicionales:

- **Nunca se "arregla" una pregunta** que falla: se registra el motivo y se descarta.
- Todo descarte queda auditado (tabla de candidatos) para poder medir la tasa de rechazo
  por motivo y ajustar prompts sin sacrificar fiabilidad.
- Páginas con OCR de baja calidad o con texto corrupto no generan hechos.
- Fragmentos que empiezan con un referente perdido ("Este procedimiento…", "Lo
  anterior…") solo se usan si el fragmento anterior de la misma sección se incluye como
  contexto y el referente es resoluble; si no, se marcan no elegibles.

---

## 4. Distractores sin inventarlos

El núcleo es un **catálogo de valores del documento** construido una sola vez:

1. **Extracción de hechos** (LLM barato, una pasada por fragmento, ver §7.1). Cada
   hecho se tipifica: `numeric` (cifra+unidad), `date`, `percentage`, `term` (nombre,
   clasificación, grupo), `definition`, `characteristic`, `procedure_step`,
   `exception`, `relation`.
2. **Agrupación en "ranuras" (sin LLM).** Los hechos se agrupan por
   `(tipo, atributo normalizado, unidad)`. Ej.: `dosis·mg → {A:20, B:40, C:10, D:5}`.
   Los valores de la misma ranura y distinto sujeto son los **candidatos naturales**.
3. **Ampliación por similitud (sin LLM).** Si la ranura no basta, se buscan valores del
   mismo tipo en la misma sección/capítulo mediante embeddings + búsqueda de texto
   (definiciones de *otros* conceptos, características de *otros* elementos, otros pasos
   de *otro* procedimiento, otras clasificaciones de la misma taxonomía).
4. **Filtro de veracidad cruzada (sin LLM).** Se descarta un candidato si en algún
   lugar del documento aparece **junto al sujeto de la pregunta** en la misma frase (podría
   ser también correcto), o si es equivalente al valor correcto (normalización numérica:
   `20 mg` = `20 miligramos`; mismas fechas en distinto formato).
5. **Selección por dificultad.** De los supervivientes, se ordenan por similitud con la
   respuesta correcta: *fácil* = otra sección/menos parecidos; *medio* = mismo
   capítulo; *difícil* = misma ranura/sección y valores cercanos.
6. **El LLM elige y redacta mínimamente.** Solo puede elegir ids de la lista y ajustar
   concordancia gramatical. La validación determinista comprueba que las cifras, fechas
   y nombres propios de cada distractor estén en la cita de su origen y que al menos el
   ~85 % de sus palabras con contenido aparezcan en esa cita.
7. **Si quedan menos de 3 → se descarta la pregunta.** Nunca se rellena.

Cada opción incorrecta guarda en `question_sources` su página, fragmento y cita.

---

## 5. Modelo de datos

Todas las tablas de usuario tienen `user_id` (desnormalizado para que las políticas RLS
sean simples e indexables) y política `user_id = app.current_user_id()`.

| Tabla | Propósito | Claves / restricciones relevantes |
|---|---|---|
| `users` | Cuentas | email único (minúsculas), hash Argon2 |
| `documents` | Documento subido | `UNIQUE(user_id, sha256)`, estado, tipo de capa de texto (`native/partial/scanned`), estadísticas |
| `document_pages` | Texto canónico por página | `UNIQUE(document_id, page_number)`, método (`native/ocr`), confianza OCR, calidad, `is_eligible` |
| `document_sections` | Estructura (temas/apartados) | jerárquica (`parent_id`), rango de páginas, origen (`outline/heuristic/manual/whole`) |
| `document_chunks` | Fragmentos semánticos | `spans` JSON `[{page,start,end}]`, sección, elegibilidad, `tsvector` español, embedding (bloque 3) |
| `facts` *(bloque 4)* | Hechos atómicos con cita | cita + página + offsets verificados, ranura |
| `generation_runs` *(bloque 4)* | Petición de generación | secciones, objetivo, dificultad, contadores |
| `question_candidates` *(bloque 4)* | Todo intento, aceptado o no | motivos de rechazo, informe del verificador |
| `questions` | Banco | número correlativo por usuario, tipo, dificultad, estado, confianza, etiquetas, huella para duplicados |
| `question_options` | A–D | **trigger diferido**: exactamente 4 opciones y exactamente 1 correcta; opciones únicas |
| `question_sources` | Evidencias | FK compuesta: la página citada **debe** pertenecer al documento de la pregunta; ≥1 fuente `answer` obligatoria |
| `quizzes` / `quiz_questions` | Tests del alumno y respuestas | una fila por pregunta del test con opción elegida y corrección (fusiona `test_questions`+`test_answers`) |
| `processing_jobs` | Trabajos | estado, etapa, progreso, intentos, *lease*, `checkpoint` |
| `llm_calls` *(bloque 4)* | Contabilidad de coste | proveedor, modelo, propósito, tokens, coste |

> Nombré `quizzes` a los tests del alumno para no confundirlos con los tests
> automatizados del código. Es solo el nombre de la tabla.

Estados de pregunta: `generated` → `auto_validated` → `manually_reviewed`, o
`discarded`. Estados de job: `pending`, `running` (+ etapa: `extracting`,
`analyzing_structure`, `indexing`, `generating`, `validating`), `succeeded`, `failed`.

---

## 6. Pipeline de ingestión

| # | Paso | LLM | Detalle |
|---|---|---|---|
| 1 | Subida | No | Validación de tipo por *magic bytes*, tamaño máx., SHA-256 (no reprocesar duplicados), guardado en `Storage`, creación del job |
| 2 | Extracción por página | No | PyMuPDF: texto por bloques con tamaño de fuente. Clasificación de cada página: `native` si hay texto suficiente y legible; si no, **OCR** (Tesseract `spa`, 300 dpi) con confianza media por palabra |
| 3 | Calidad | No | Ratio de caracteres válidos, palabras de diccionario/documento, confianza OCR → `quality_score`, `is_eligible`, `quality_flags`. Documento: `native/partial/scanned` |
| 4 | Limpieza | No | Unicode NFKC, guiones de corte de línea, eliminación de cabeceras/pies repetidos y numeración de página (líneas que se repiten en >40 % de páginas) |
| 5 | Estructura | No | 1º marcadores/índice del PDF (`outline`); 2º heurística por tamaño de fuente + patrones (`Tema 3`, `Capítulo`, `1.2.`, `UNIDAD`). Fallback: una sección "Documento completo". Editable por el usuario |
| 6 | Fragmentación | No | Por párrafos dentro de cada sección (nunca cruza secciones), objetivo ~350–500 tokens, solape mínimo; cada fragmento guarda `spans` y cabecera de contexto (`Tema 3 › 3.2 Dosis`) |
| 7 | Indexado | Embeddings (opcional) | `tsvector` español siempre; embeddings si hay proveedor configurado (≈ céntimos por documento) |
| 8 | Hechos | **Sí** (modelo barato) | Ver §7.1 |

**Reanudación:** cada etapa es idempotente y escribe su resultado de forma
transaccional; el `checkpoint` del job registra la última etapa/unidad completada
(p. ej. página 143). Si el worker muere, el *lease* caduca, otro worker reclama el job y
continúa desde el checkpoint. Hasta 3 intentos; después `failed` con el error visible y
botón de reintento.

---

## 7. Pipeline de generación

1. **7.1 Extracción de hechos** (LLM, una vez por documento): por lotes de fragmentos
   elegibles, salida JSON estructurada. Cada hecho → verificación literal de la cita →
   se guarda o se descarta.
2. **7.2 Planificación de cobertura** (sin LLM): el usuario elige secciones y número
   (`N` o "máximo"). Cuota por sección ∝ hechos útiles de la sección (con mínimo por
   sección). Se recorre en *round-robin* para que ningún tema acapare el presupuesto. En
   modo "máximo" se intenta cada hecho elegible una vez.
3. **7.3 Selección de hecho** (sin LLM): prioriza hechos no usados, de tipos variados
   (evitar 20 preguntas seguidas de cifras), descarta hechos ya cubiertos por otra
   pregunta (deduplicación por hecho evaluado).
4. **7.4 Candidatos a distractor** (sin LLM): §4.
5. **7.5 Generación** (LLM generador): entrada ≈ 1,5–3 k tokens; salida JSON con
   enunciado, opción correcta, 3 ids de distractor, tipo, explicación.
6. **7.6 Validación determinista** → **7.7 Verificación LLM** → **7.8 Duplicados** (§8).
7. **7.9 Ordenación de opciones** (sin LLM): el backend asigna la posición de la
   correcta para mantener A/B/C/D equilibradas en el documento (contador por posición +
   desempate determinista por hash del id) y baraja los distractores de forma
   determinista.
8. **7.10 Guardado** transaccional: pregunta + 4 opciones + fuentes. Los *triggers*
   de la base de datos rechazan cualquier inconsistencia.

---

## 8. Pipeline de validación

### 8.1 Estructural (BD + código)
4 opciones, 1 correcta, opciones no repetidas (normalizadas), ≥1 evidencia, página del
mismo documento y del mismo usuario.

### 8.2 Determinista (código)
- La cita de la respuesta correcta existe literalmente en el texto de la página citada
  (y los offsets coinciden).
- Cada número, porcentaje, fecha y nombre propio de la opción correcta aparece en su cita;
  ídem para cada distractor con *su* cita.
- Números/fechas del enunciado existen en el documento.
- Vocabulario: toda palabra con contenido del enunciado y de las opciones existe en el
  vocabulario del documento (detecta términos inventados).
- Ninguna opción incorrecta co-ocurre con el sujeto en el documento (riesgo de 2
  correctas).
- Estilo: prohibido "Según el documento", "todas/ninguna de las anteriores", "ambas",
  referentes colgantes ("este procedimiento", "lo anterior") en el enunciado.
- Sesgo de longitud: la correcta no puede ser la única claramente más larga (ratio con
  la media de distractores fuera de [0,6–1,5] → descarta) ni la "más detallada" de forma
  sistemática (vigilado por métrica global).
- Pista léxica: la correcta no puede compartir con el enunciado palabras clave que los
  distractores no comparten.
- Pregunta basada en encabezado sin contenido (cita demasiado corta / solo título).

### 8.3 Verificación LLM independiente
Entrada: enunciado + 4 opciones (sin marcar) + evidencias (cita de la correcta, cita de
cada distractor, y top‑k pasajes del documento recuperados con búsqueda del sujeto y de
cada opción para detectar contradicciones). Salida JSON:
`blind_answer`, y booleanos para las 11 comprobaciones pedidas (respondible solo con el
documento, única correcta, respaldo explícito, distractores incorrectos, distractores
del documento, ambigüedad, dos correctas, subjetividad, información externa, claridad,
página correcta) + `confidence`. Se descarta si `blind_answer` ≠ clave o cualquier
comprobación falla o `confidence` < umbral.

### 8.4 Duplicados
1. Huella exacta (enunciado+respuesta normalizados).
2. Mismo hecho evaluado (`fact_id`) o mismo `(sujeto, atributo)` → duplicado aunque la
   redacción sea distinta.
3. Similitud semántica del enunciado+respuesta correcta (embeddings, coseno ≥ 0,90) o
   trigramas si no hay embeddings.

---

## 9. ¿Qué usa LLM y qué no?

| Operación | LLM | Alternativa / nota |
|---|---|---|
| Subida, hash, almacenamiento | No | |
| Extracción de texto por página | No | PyMuPDF |
| Detección de escaneado y OCR | No | Tesseract |
| Calidad de página, limpieza de cabeceras | No | Heurísticas |
| Estructura (temas) | No | Marcadores PDF + heurística tipográfica |
| Fragmentación e indexado FTS | No | |
| Embeddings | Modelo de embeddings (no generativo) | Opcional; muy barato |
| **Extracción de hechos** | **Sí** (barato) | Una pasada por documento |
| Ranuras y candidatos a distractor | No | SQL + similitud |
| Plan de cobertura, selección de hecho | No | |
| **Redacción de la pregunta** | **Sí** (generador) | |
| Validación determinista | No | |
| **Verificación independiente** | **Sí** (verificador) | Solo si pasa la determinista |
| Duplicados | No (embeddings opcionales) | |
| Barajado y posición A–D | No | |
| Tests, corrección, estadísticas | No | |

---

## 10. Estimación de costes (orden de magnitud)

Supuestos: 300 páginas × ~600 tokens = **~180 k tokens** de texto; objetivo **~300
preguntas aceptadas**; tasa de aceptación estimada 45–60 % → ~600 candidatos, ~420
llegan al verificador. Precios Anthropic por millón de tokens (entrada/salida):
Opus 5.5 4 $/20 $, Sonnet 5.5 2 $/10 $, Haiku 5.5 0,10 $/0,50 $. El *system prompt*
fijo va con *prompt caching*.

| Fase | Tokens aprox. | Opus 5.5 | Sonnet 5.5 | Haiku 5.5 |
|---|---|---|---|---|
| Hechos (1 vez/documento) | 250 k in · 100 k out (incl. razonamiento) | ~3 $ | ~1,5 $ | ~0,08 $ |
| Generación (600 candidatos) | 2,5 k in · 0,9 k out c/u | ~17 $ | ~8,5 $ | — |
| Verificación (420) | 3 k in · 0,7 k out c/u | ~11 $ | ~5,5 $ | — |
| Embeddings | ~250 k | < 0,01 $ | | |
| **Total por documento** | | **~30 $** | **~15 $** | |

- Combinación razonable: hechos con Haiku, generación con Sonnet, verificación con
  Opus (u otro proveedor) → **~15–20 $** por documento de 300 páginas y ~300 preguntas.
- La API de *Batches* (‑50 %) encaja con la generación por lotes → mejora futura.
- La aplicación **registra el coste real** de cada llamada (`llm_calls`) y lo mostrará
  por documento/ejecución; estas cifras son estimaciones a confirmar con datos reales.
- Por defecto la configuración usa `claude-opus-5-5` en todas las tareas; cambiar a
  Sonnet/Haiku es una variable de entorno (decisión tuya calidad/coste).

---

### 10.1 Modo gratuito (preferencia del usuario)

Todo lo que no es LLM ya es gratuito y de código abierto: PostgreSQL, Tesseract,
LibreOffice, PyMuPDF, búsqueda de texto completo y por trigramas. No hacen falta
embeddings de pago: la recuperación usa la búsqueda de Postgres (bloque 3).

Para las tres tareas con LLM (hechos, redacción, verificación) hay dos vías sin coste:

| Opción | Coste | Privacidad | Requisitos / límites |
|---|---|---|---|
| **Modelos locales con Ollama** (p. ej. Qwen 2.5, Llama 3.1, Mistral) | 0 € | Total: el documento no sale del ordenador | ≥16 GB de RAM para modelos de 7–8B; mucho más rápido con GPU o Apple Silicon. En CPU, decenas de segundos por pregunta |
| **Niveles gratuitos de APIs en la nube** (p. ej. Google Gemini) | 0 € dentro de cuota | En los niveles gratuitos el proveedor puede usar el contenido para mejorar sus productos: revisar condiciones antes de subir material privado | Límites de peticiones por minuto/día: un documento grande puede tardar horas o repartirse en varios días |

**Impacto en fiabilidad:** ninguno en el sentido de "preguntas peores", porque las
barreras deterministas no dependen del modelo. Un modelo más modesto producirá **más
descartes** (menos preguntas), no preguntas inventadas. El coste real pasa a ser tiempo
de cálculo.

Decisión final (ver 10.2): plan gratuito de **Gemini** por defecto. Ollama, Anthropic y
OpenAI quedan disponibles cambiando solo la configuración.

### 10.2 Decisión: web accesible desde PC y móvil, coste 0 €

Decisión del usuario: la herramienta debe estar **alojada en internet** (no en un PC
propio) y usarse desde ordenador y móvil; IA con el **plan gratuito de Gemini**.

| Pieza | Servicio gratuito propuesto | Limitaciones a tener en cuenta |
|---|---|---|
| Interfaz web (PWA instalable en el móvil) | Cloudflare Pages / Vercel / Netlify | Ninguna relevante para uso personal |
| API + worker (un único contenedor Docker con Tesseract y LibreOffice) | Render, plan gratuito | 512 MB de RAM; se **duerme tras ~15 min sin tráfico** y tarda ~1 min en despertar |
| Base de datos + ficheros | Supabase, plan gratuito | 500 MB de BD; almacenamiento de ficheros limitado (~0,5–1 GB); el proyecto **se pausa tras 7 días sin uso** y se reactiva desde su panel |
| IA | Gemini, plan gratuito (modelos Flash / Flash-Lite) | Límites por minuto y por día por modelo; en el plan gratuito Google puede usar el contenido para mejorar sus productos |

Consecuencias de diseño (ya implementadas o planificadas):

- **Cuotas de Gemini:** el cliente de IA respeta un ritmo por modelo, reintenta los
  límites por minuto y, si se agota la cuota **diaria**, el trabajo se **pausa** y se
  reanuda solo tras el reinicio de cuota, sin perder lo hecho ni gastar reintentos
  (bloque 4 ✅). Cada tarea usa un modelo distinto: cada modelo tiene cuota propia y el
  verificador no es el mismo modelo que redacta.
- **Servidor que se duerme:** el worker irá dentro del mismo proceso que la API. Mientras
  la web está abierta, la consulta de progreso mantiene el servidor despierto; si se
  duerme, los trabajos continúan donde se quedaron al despertar (leases + checkpoints).
- **Disco efímero del contenedor:** los ficheros originales irán a Supabase Storage.
  Opción para ahorrar espacio: borrar el PDF original tras procesarlo (el texto por
  página, que es lo que se cita, queda en la BD).
- **Memoria (512 MB):** OCR página a página; la conversión DOCX con LibreOffice es el
  punto más justo de memoria y se vigilará en el despliegue.
- Los planes gratuitos cambian a menudo: se verificarán en el momento de desplegar.
  Alternativa gratuita más potente pero más laboriosa: máquina "Always Free" de Oracle Cloud.

### 10.3 Decisiones de implementación del bloque 5

- **Las opciones nunca las escribe la IA.** Cada opción es el valor literal de un hecho
  verificado (la correcta, el hecho objetivo; los distractores, hechos de otros sujetos del
  catálogo). El generador solo redacta el enunciado y elige 3 ids de la lista cerrada.
- **La explicación tampoco la escribe la IA:** es la cita literal con su página.
- **Lotes de 4 preguntas por llamada** (generación y verificación) para ahorrar cuota gratuita.
- **Duplicados:** mismo hecho, mismo dato (sujeto + ranura), misma huella, o misma respuesta
  con enunciado equivalente. El parecido de texto por sí solo no basta ("¿Dosis de Alfa?" y
  "¿Dosis de Beta?" son preguntas distintas).
- **Cobertura:** cuota por tema proporcional al texto apto del tema; reparto en turnos entre
  temas; si un tema se agota, su cuota pasa a los demás. Si no se llega al número pedido,
  el trabajo termina diciendo cuántas se han podido generar: no se rellena.

### 10.4 Ajustes tras la primera prueba real (temario de ofimática, 62 páginas)

Primera pasada con Gemini real: 245 hechos verificados de 258 propuestos; 20 preguntas
aceptadas de 44 intentos. Al revisar las **aceptadas** a mano aparecieron defectos que los
filtros no veían. Se corrigieron endureciendo, nunca relajando:

| Defecto observado | Corrección |
|---|---|
| Distractores de otro tema (definiciones de hardware en una pregunta de Excel): se descartan a simple vista | Las respuestas abiertas (definiciones, características, pasos…) solo toman distractores del **mismo tema principal**; las cifras y fechas pueden seguir viniendo de cualquier tema |
| El generador no sabía de qué se dice cada alternativa | Cada candidato se le muestra con su sujeto; reglas explícitas: mismo tipo de respuesta, longitud y estilo parecidos, falsa para el sujeto preguntado; si no hay 3, omitir |
| Distractores que «desentonan» aprobados por el verificador | Nueva comprobación del verificador `distractors_plausible`; `two_could_be_correct` cubre también opciones aplicables al sujeto aunque el temario las diga de otra cosa |
| «Abre el Explorador» frente a «Abre una nueva ventana del Explorador» (ambas defendibles) | Regla determinista `opcion_contenida_en_otra` y `opciones_casi_iguales` |
| La correcta repite una palabra del sujeto (Almacenamiento óptico → «discos ópticos») | Regla determinista `correcta_repite_el_sujeto` (con singular/plural) |
| Sinónimos fuera del vocabulario («empezar» por «comienza», «siglas») | Instrucción de reutilizar el vocabulario de la cita; el filtro se mantiene igual |
| Acentos como entidades HTML («acci&oacute;n») | Se decodifican antes de validar (es codificación, no contenido) |
| Salida con caracteres de control (`\u0000`) rompía el guardado de la auditoría y forzaba un reintento | Se descarta como `salida_corrupta_del_generador` y la auditoría se limpia |
| Plan gratuito: 20 peticiones/día por modelo *flash*, 503 frecuentes | Cadena de modelos de reserva por tarea (§ README «IA»); verificación con 5 modelos *flash* ≈ 100 peticiones/día ≈ 400 preguntas |

Resultado con los ajustes: 20 preguntas aceptadas de 66 intentos (más descartes, como se
esperaba), repartidas por los 8 temas, posición correcta A/B/C/D 5-5-5-5.

### 10.5 Decisiones del bloque 7 (tests del alumno)

- **Dos modos.** *Práctica*: cada respuesta se corrige al momento y ya no puede cambiarse.
  *Examen*: se puede cambiar o dejar en blanco hasta entregar y nada se revela antes; tiempo
  límite opcional **comprobado en el servidor** (un examen caducado se entrega solo con lo
  respondido). La letra correcta nunca sale del servidor antes de tiempo.
- **Puntuación de oposición.** Neto = aciertos − fallos × penalización; nota = neto / total × 10
  (mínimo 0). Penalización configurable; por defecto 1/3 (corrección del azar con 4 opciones).
  Las preguntas en blanco no restan.
- **Copia inmutable.** Cada pregunta del test guarda su enunciado, opciones, correcta, tema,
  página y cita. Editar o borrar la pregunta en el banco no cambia ni la corrección ni las
  estadísticas pasadas.
- **Selección.** Solo preguntas aprobadas. Modos: al azar, no vistas, falladas (la última vez
  fallada o en blanco) y puntos débiles (falladas primero, luego peor porcentaje y menos
  vistas). Reparto en turnos entre temas, salvo en «puntos débiles», donde manda la urgencia.
  Si no hay suficientes, el test sale más corto: no se rellena.
- **Qué cuenta como intento** (vista `quiz_attempts`): todo test entregado (lo no respondido
  cuenta en blanco) y, en práctica, cada respuesta en cuanto se da. Un examen sin entregar no
  cuenta porque sus respuestas aún pueden cambiar.
- **Dominada** = acertada las 2 últimas veces; **a repasar** = la última vez fallada o en blanco.

### 10.6 Decisiones del bloque 8 (web)

- **Pocas dependencias:** React, React Router y Tailwind. Sin librería de gráficas (SVG propio,
  una sola serie, color validado para claro y oscuro) ni de PWA (manifest y service worker a
  mano). 95 KB comprimidos.
- **La web es estática** (Cloudflare Pages / Netlify) y habla con la API por `VITE_API_URL`;
  la API solo acepta los orígenes de `CORS_ORIGINS`. En desarrollo Vite reenvía `/api`.
- **Service worker:** guarda solo la interfaz; las llamadas a `/api` nunca se guardan, así que
  los datos (preguntas, respuestas, notas) son siempre los del servidor.
- **Sesión:** el token se guarda en el navegador (`localStorage`); al caducar se vuelve al
  acceso. Riesgo aceptado para uso personal: la web no muestra HTML ajeno, todo se pinta
  como texto.
- **Móvil primero:** barra de navegación inferior, botones grandes, una pregunta por
  pantalla, zonas seguras del iPhone. En PC, barra lateral y atajos de teclado.
- **Accesibilidad:** el color nunca es la única señal (iconos ✓/✗ y texto «correcta»/«tu
  respuesta»), lectores de pantalla en opciones y navegador de preguntas, foco visible,
  tabla alternativa para la gráfica.
- **Verificación:** recorrido automático con Chromium (PC y iPhone) que falla ante errores
  de consola, respuestas 5xx o desbordamiento horizontal, y comprueba que el examen no
  revela la corrección antes de entregar.

### 10.7 Decisión del bloque 9 (despliegue)

El plan inicial era 0 € (Render gratis + Supabase + web estática). Decisión del usuario:
**Railway** para la API (no se duerme y se despliega desde aquí) y **Supabase** en una cuenta
propia para la base de datos (la cuenta principal ya tenía 2 proyectos gratuitos activos).

- **Un solo servicio**: la API sirve la web compilada y ejecuta el worker en un hilo. Menos
  coste que tres servicios y sin CORS. Un trabajo largo a medias se retoma tras un reinicio
  o un nuevo despliegue (lease + checkpoint).
- **Migraciones al arrancar** (`python -m app.bootstrap`) con la conexión del propietario;
  la API usa siempre el rol restringido `banco_api`, creado con contraseña aleatoria.
- **Conexión directa por IPv6** a Supabase (salida IPv6 activada en el servicio), sin pooler.
- **Supabase endurecido**: `anon`/`authenticated` sin permisos sobre las tablas (migración 0008);
  la API REST de Supabase no se usa.
- Coste: consumo del servicio en Railway (sin volumen grande ni base de datos allí);
  Supabase en plan gratuito, que **se pausa tras 7 días sin uso** y se reactiva desde su panel.

## 11. Riesgos técnicos

| Riesgo | Mitigación |
|---|---|
| Tasa de rechazo alta → pocas preguntas | Es el comportamiento deseado; se mide el motivo de cada descarte para mejorar extracción/prompts sin relajar filtros |
| OCR de mala calidad | Umbral de confianza por página; esas páginas no generan preguntas y se señalan en la UI |
| Tablas y esquemas en PDF | La extracción por bloques puede desordenar tablas; marcamos páginas con alta densidad de tablas y, en MVP, son elegibles solo si la cita se verifica literalmente |
| Estructura mal detectada | Fallback a "documento completo" y edición manual de secciones |
| Verificador "complaciente" con el generador | Modelo/proveedor distinto, resolución a ciegas, prompt sin la clave ni el razonamiento del generador |
| Falsos negativos deterministas (p. ej. sinónimos) | Preferimos descartar; umbrales configurables y auditables |
| Paginación de DOCX (no existe en el formato) | Conversión a PDF con LibreOffice cuando esté disponible; si no, "páginas" lógicas por saltos de página, marcadas como aproximadas |
| Coste descontrolado | Presupuesto máximo por ejecución, contabilidad por llamada, sin llamada al LLM si no hay 3 distractores |
| Cambio de proveedor de IA | Interfaz `LLMProvider` + configuración por tarea (`extraction`, `generation`, `verification`) |
| Fuga entre usuarios | RLS forzada + FKs compuestas + filtros explícitos + tests de aislamiento |

---

## 12. MVP y plan por bloques

| Bloque | Contenido | Verificación |
|---|---|---|
| **1** ✅ | Esqueleto backend, migraciones SQL, RLS, invariantes de preguntas en BD, autenticación, subida de documentos | Tests: aislamiento entre usuarios, 0/2 correctas, ≠4 opciones, página de otro documento, pregunta sin evidencia |
| **2** ✅ | Worker + jobs reanudables; extracción por página; detección nativo/escaneado/parcial; OCR con confianza; limpieza | Tests con PDFs reales generados (nativo, escaneado, mixto), reanudación tras fallo |
| **3** ✅ | Estructura (outline + heurística + patrones OCR), fragmentación con spans exactos, búsqueda FTS + trigramas | Tests de spans ↔ páginas, secciones, reanudación |
| **4** ✅ | Abstracción LLM (Gemini gratuito por defecto; Anthropic, OpenAI, Ollama), cuotas y pausas, registro de llamadas, extracción de hechos verificados, catálogo de distractores | Tests con proveedor de prueba + test real con Gemini si hay clave |
| **5** ✅ | Generación + validación determinista + verificación LLM + duplicados + posición equilibrada + cobertura | Tests del motor (los pedidos) |
| **6** ✅ | API del banco de preguntas (filtros, edición, estados, fuentes) | Tests de API |
| **7** ✅ | Tests del alumno, corrección, estadísticas | Tests de API (práctica, examen, tiempo, modos de selección, copia inmutable, estadísticas, aislamiento) |
| **8** ✅ | Web: documentos, banco, tests, resultados, estadísticas; PWA | Tests de componentes + recorrido real con Chromium en PC y móvil |
| **9** ✅ | Despliegue en Railway (un servicio) + Supabase | Construcción y arranque en Railway, migraciones aplicadas, salud OK |
