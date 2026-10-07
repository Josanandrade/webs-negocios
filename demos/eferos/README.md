# Eferos Fisioterapia · Web demo

Rediseño completo de la web de [Eferos Fisioterapia](https://www.eferos.es/) (Mairena del Aljarafe, Sevilla). Es una aplicación Next.js autónoma: todo lo que necesita vive en esta carpeta y puede extraerse tal cual a un repositorio propio (`client-eferos-web`).

## Stack

| Pieza | Elección | Por qué |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) + React 19 | Páginas estáticas (SSG), metadata/SEO nativos, `next/image` y `next/font`. |
| Lenguaje | TypeScript estricto | Los datos del negocio están tipados (`lib/types.ts`). |
| Estilos | CSS global con tokens + CSS Modules | El diseño es editorial y muy específico. Con un sistema de tokens propio y un módulo por componente el acabado se controla mejor que con utilidades. **No se usa Tailwind** a propósito. |
| Animación | CSS + un único `IntersectionObserver` | Sin librerías de animación. Solo `transform`, `opacity` y `clip-path`, siempre respetando `prefers-reduced-motion`. |
| Fuentes | Archivo (variable, ejes de peso y anchura), Newsreader cursiva e IBM Plex Mono | Autoalojadas en `app/fonts/` (licencia SIL OFL). No dependen de Google Fonts en el build ni en tiempo de ejecución. |

Dependencias de ejecución: solo `next`, `react` y `react-dom`.

## Puesta en marcha

Requiere Node.js 20.9 o superior.

```bash
cd demos/eferos
npm install
npm run dev        # http://localhost:3000
```

Producción:

```bash
npm run build
npm start
```

Comprobaciones:

```bash
npm run lint
npm run typecheck
```

### Variables de entorno

Copia `.env.example` a `.env.local` si necesitas cambiarlas:

| Variable | Por defecto | Uso |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | dominio de Vercel/Railway, si no `http://localhost:3000` | URL base para canonical, sitemap y Open Graph. Poner `https://www.eferos.es` solo al publicar en el dominio del cliente. |
| `NEXT_PUBLIC_ALLOW_INDEXING` | `false` | Con `false` la web se publica con `noindex` y `robots.txt` bloquea a los buscadores, para que la demo no compita con la web real de Eferos. Ponerlo a `true` solo cuando esta web pase a producción en el dominio del cliente. |
| `GOOGLE_PLACES_API_KEY` | vacía | Clave de Google Cloud para leer las reseñas (Places API, New). Solo servidor: nunca con prefijo `NEXT_PUBLIC_`. |
| `GOOGLE_PLACE_ID` | vacía | Identificador de la ficha de Eferos en Google Maps. |

Las dos variables de Google se leen en cada petición a `/api/google-reviews`: no hace falta recompilar para activarlas, aunque Railway redespliega el servicio al cambiar variables.

## Estructura

```text
demos/eferos/
├── business.config.ts        ← datos del negocio (única fuente de verdad)
├── app/
│   ├── layout.tsx            ← <html>, fuentes, metadata global, JSON-LD, cabecera y pie
│   ├── page.tsx              ← home: compone las secciones
│   ├── especialidades/[slug] ← una página estática por tratamiento
│   ├── fonts.ts + fonts/     ← fuentes autoalojadas (next/font/local)
│   ├── opengraph-image.tsx   ← imagen social generada en build
│   ├── icon.svg              ← favicon
│   ├── sitemap.ts, robots.ts
│   └── not-found.tsx
├── components/
│   ├── sections/             ← secciones de la home (Hero, Approach, Treatments,
│   │                           Conditions, Spaces, Team, Reviews, Visit), cada una con su .module.css
│   ├── SiteHeader.tsx        ← navegación + menú móvil (cliente)
│   ├── SiteFooter.tsx
│   ├── ScanPanel.tsx         ← ilustración generativa de ecografía (firma visual)
│   ├── PhotoFrame.tsx        ← foto real o hueco diseñado si aún no hay foto
│   ├── BookingActions.tsx    ← botones Reservar + WhatsApp
│   ├── HoursTable.tsx        ← horario con el día actual resaltado
│   ├── BrandName.tsx         ← "®" como superíndice en titulares
│   ├── Logo.tsx              ← logotipo provisional
│   └── RevealObserver.tsx    ← animaciones de entrada al hacer scroll
├── lib/
│   ├── types.ts              ← tipos de business.config
│   ├── site.ts               ← URL, indexación y helpers (tel:, mailto:)
│   └── jsonld.ts             ← datos estructurados schema.org (MedicalClinic / Physiotherapy)
├── styles/globals.css        ← tokens, tipografía, retícula, botones y movimiento
└── public/images/            ← aquí van las fotografías reales
```

## Dónde cambiar cada cosa

Todo el contenido del negocio está en **`business.config.ts`**:

- nombre, descripción y año de apertura;
- teléfono, WhatsApp, email y enlace de reserva (Setmore);
- dirección, referencia ("frente al parque infantil") y enlace a Google Maps;
- horario (`hours`), que alimenta la tabla, la ficha del hero y el JSON-LD;
- registros sanitarios (NICA, Colegio);
- redes sociales (las que tienen `url` vacía no se muestran);
- navegación;
- equipo, con número de colegiado, resumen, formación y foto;
- espacios del centro (gabinetes, sala, domicilio);
- fotografías de la tira de «El centro» (`gallery`);
- tratamientos: nombre, categoría, resumen, texto de la ficha e indicaciones. Añadir un tratamiento aquí crea su página en `/especialidades/<slug>`, su fila en la home, su enlace en el pie y su entrada en el sitemap.

### Fotografías

Las fotos de la tira de «El centro» son fotografías reales de la clínica facilitadas por Eferos (`public/images/centro/`, sin metadatos). No hay fotos de stock. Donde todavía no hay foto (el retrato del equipo) se muestra un hueco diseñado con la retícula de la marca.

**Tira de «El centro»** (`gallery` en `business.config.ts`):

1. Copia las fotos en `public/images/centro/`. Basta con JPG de buena calidad, unos 2000 px por el lado largo: `next/image` genera AVIF/WebP en los tamaños necesarios.
2. En cada entrada de `gallery`, pon la ruta en `src` y las dimensiones reales del archivo en `width` y `height`. Fijan la proporción y evitan saltos de layout.
3. Escribe un `alt` que describa la foto. `caption` es el pie de foto visible.

Se pueden añadir o quitar entradas: la tira se adapta. Funciona mejor mezclando verticales y horizontales.

**Retratos del equipo:** copia la foto en `public/images/equipo/` y pon la ruta en `photo` (proporción 3:4).

### Logotipo

`components/Logo.tsx` es un logotipo **provisional**: el símbolo de retícula seguido del nombre «eferos». Se usa solo en los puntos de firma de marca (cabecera, menú móvil y pie), nunca dentro del texto. Para poner el oficial, sustituye el SVG del símbolo en ese único componente, idealmente por el SVG original, manteniendo el orden símbolo + nombre. Actualiza también el favicon en `app/icon.svg`.

### Reseñas de Google

La sección «Opiniones» (`components/sections/Reviews.tsx`) muestra reseñas **reales** mediante la API oficial **Places API (New)**:

- La consulta la hace el servidor en `/api/google-reviews` (`lib/googleReviews.ts`). La API key nunca llega al navegador.
- La sección pide las reseñas cuando el visitante se acerca a ella. La portada sigue siendo estática.
- Google devuelve **como máximo 5 reseñas**, elegidas y ordenadas por Google por relevancia, más la nota media y el total.
- Se cumplen las atribuciones de Google: autor con foto y enlace a su perfil, enlace a cada reseña en Google Maps, enlace para denunciarla, aviso de que la selección y el orden son de Google, y atribución «Google Maps».
- **Sin caché:** los términos de Google Maps Platform prohíben almacenar el contenido de Places (solo se puede guardar el Place ID). Cada visita que llega a la sección hace una consulta. Hay un tope de 60 consultas cada 10 minutos por instancia.
- **Sin credenciales, o si Google falla, no se muestra ninguna reseña**: solo un enlace a la ficha real en Google Maps. No hay reseñas de ejemplo ni contenido de relleno.

Para activarla:

1. Proyecto en Google Cloud **con facturación activada** (obligatorio aunque se quede en la franja gratuita).
2. Habilitar **Places API (New)**.
3. Crear una API key **restringida** a «Places API (New)». Como la llama el servidor, la restricción por web (HTTP referrer) no sirve; basta con la restricción de API y una **cuota diaria** limitada en la consola.
4. Obtener el **Place ID** de la ficha de Eferos, con el buscador de Place ID de Google o con una búsqueda «Text Search» de la propia API.
5. Definir `GOOGLE_PLACES_API_KEY` y `GOOGLE_PLACE_ID` en Railway y redesplegar.

Coste: pedir reseñas usa el SKU «Place Details Enterprise + Atmosphere», con 1.000 consultas gratuitas al mes y unos 25 USD por cada 1.000 adicionales (precios de 2026; comprobar la tabla vigente de Google).

**Alternativa sin el límite de 5 reseñas:** la API de Google Business Profile (`accounts.locations.reviews.list`) devuelve todas las reseñas, pero exige que el propietario de la ficha autorice con OAuth (permiso `business.manage`) y una solicitud de acceso aprobada por Google. Solo compensa si se quieren mostrar más de 5 reseñas o responderlas desde la web.

## Decisiones de diseño

- **Concepto: "precisión que se ve".** Lo que diferencia a Eferos frente a otras clínicas de la zona son las técnicas guiadas por ecografía (EPI®) combinadas con terapia manual. La firma visual es una ecografía generada en código (`ScanPanel`), con escala de profundidad, aguja y calipers. Las marcas de medición (`+`) y los datos en monoespaciada se repiten por toda la web como lenguaje propio.
- **Paleta:** fondo blanco, bandas en blanco mineral frío (equipo, caja de reserva, marcos de foto) para dar ritmo, tinta verde pino y cobalto solo como acento de medición y foco. Se evitan los tópicos de clínica (azul sanitario) y los de plantilla (crema y terracota, degradados).
- **Tipografía:** Archivo en anchura estrecha para titulares y anchura normal para el texto. Newsreader cursiva aparece solo en una palabra clave por bloque. IBM Plex Mono se usa para datos clínicos (NICA, colegiado, horarios).
- **Sin tarjetas por defecto:** los tratamientos son un índice de filas tipográficas, las lesiones una lista, el contacto filas de acción. Solo la caja de reserva de las fichas tiene fondo propio.
- **«El centro»:** una tira editorial horizontal de fotografías a sangre. En escritorio se desplaza lateralmente al ritmo del scroll de la página, con CSS puro (`animation-timeline: view()`, por GPU y sin JavaScript). En móvil, en navegadores sin soporte y con movimiento reducido es una fila con scroll horizontal nativo e imán (`scroll-snap`), accesible con teclado. No hay animaciones infinitas.
- **Móvil:** la ecografía pasa a formato apaisado bajo el titular, la ficha del hero se convierte en lista de pares, el menú es un panel a pantalla completa con el botón de reserva siempre visible en la cabecera, y todos los objetivos táctiles miden al menos 44 px.

## Notas técnicas

- **Rendimiento.** Todas las rutas son estáticas. El CSS se incrusta en el HTML (`experimental.inlineCss`) porque es pequeño (~35 KB) y así no bloquea el renderizado. La ecografía se pinta por tramos en `requestIdleCallback`, así que no genera tareas largas. El titular del hero entra con una máscara (sin opacidad) para no penalizar el LCP. Lighthouse móvil con conexión 4G lenta simulada, en local: Performance 90–96 según la ejecución (LCP 2,6–3,5 s, CLS 0, TBT < 150 ms), Accessibility 100, Best Practices 100 y SEO 100 con indexación activada (66 en modo demo por el `noindex`, que es intencionado).
- **Movimiento.** Revisado con las skills de Emil Kowalski (`emil-design-eng`, `review-animations`, `mobile-native`). Tokens en `styles/globals.css`: `--ease-out` para entradas y respuestas, `--ease-in-out` para cambios de forma en pantalla, `--dur-press` (120 ms) y `--dur-hover` (240 ms). Las interacciones de interfaz se quedan por debajo de 300 ms; solo las entradas de contenido (hero, scroll) son más largas. Todo `:hover` va dentro de `@media (hover: hover) and (pointer: fine)` y cada elemento pulsable tiene su estado `:active`.
- **Animaciones sin riesgo.** Los elementos con `data-reveal` son visibles por defecto. Solo se ocultan si un script inline confirma, antes del primer pintado, que hay `IntersectionObserver` y que el usuario no pide movimiento reducido. Sin JavaScript se ve todo.
- **Accesibilidad.** HTML semántico, enlace "Saltar al contenido", foco visible en cobalto, menú móvil con `aria-expanded`, cierre con Escape y foco atrapado, contraste AA y `alt` en las imágenes reales.
- **SEO.** Metadata por página, Open Graph con imagen generada, canonical, `sitemap.xml`, `robots.txt` y JSON-LD `MedicalClinic`/`Physiotherapy` con dirección, horario, servicios y equipo. Las URLs `/especialidades/epi` y `/especialidades/terapia-manual` mantienen las de la web actual.

## Pendiente antes de producción

Ningún dato de esta lista se ha inventado: o falta, o hay que confirmarlo. Los datos están marcados con `TODO(verificar)` en `business.config.ts`.

### Datos que debe confirmar Eferos

- **Horario.** eferos.es indica L–J 9:30–20:30 y V 9:30–13:30. Otros directorios publican 9:00–21:00 y 9:00–14:00.
- **Formación de Cristina León.** Si tiene más formación que el grado, añadirla. Confirmar la formación directa con Chad Cook, Jo Gibson, Annina Schmid y Mark Laslett, que se muestra en su ficha.
- **Textos redactados para la demo:**
  - los bloques «Cómo la usamos», «Por qué ecoguiada», «Cuándo la proponemos» y «Dónde lo hacemos» de las fichas;
  - las descripciones de los tres espacios.
- **Afirmaciones que se extienden a todo el centro.** Dos frases salen de la biografía de Cristina León: el compromiso de explicar «con sinceridad» las posibilidades de recuperación, y «dolor agudo y crónico en adultos». Confirmar que valen para todo el centro (¿atienden a menores?).
- **Domicilio.** Zona de cobertura y condiciones.
- **Año de apertura.** Se usa 2022, sacado del copyright de su web, en los datos estructurados.
- **Reservas.** Confirmar que `eferosfisioterapia.setmore.com` es el canal oficial.
- **Redes sociales.** URLs de Instagram y Facebook.
- **Precios y duración de las sesiones.** La web no los muestra. Decidir si se quieren publicar.

### Material

- **Logotipo oficial**, en SVG si es posible, y colores de marca si los tienen. Sustituye el símbolo en `components/Logo.tsx` y `app/icon.svg`. No se pudo descargar de eferos.es porque el entorno de desarrollo no tiene acceso a ese dominio.
- **Fotografías reales:**
  - retrato de Cristina León (3:4);
  - si existen, versiones de mayor resolución de las fotos de la clínica: las actuales miden entre 800 y 1206 px de ancho, y la tira limita su altura a 400 px para no ampliarlas.
- **Reseñas de Google** (ver la sección «Reseñas de Google» más arriba): API key con facturación y el Place ID de la ficha. Ninguno de los dos los tiene que dar Eferos si el proyecto de Google Cloud es nuestro; lo que sí hay que pedirles es que confirmen cuál es su ficha oficial de Google Maps.
- **Opcional:**
  - fachada o acceso al local, para «Cómo llegar»;
  - imágenes o vídeo reales de ecografía, con consentimiento del paciente;
  - imagen Open Graph con foto real.

### Producción

- **Legal:** aviso legal, política de privacidad y política de cookies. Las reservas pasan por Setmore y el contacto por WhatsApp, y ambos tratan datos de salud, así que la política de privacidad tiene que cubrirlos. Conviene revisar los textos con la normativa de publicidad sanitaria.
- **Cookies:** hoy la web no instala cookies ni scripts de terceros, así que no necesita banner. Si se añade analítica no exenta, hace falta consentimiento previo.
- **Analítica:** no hay ninguna instalada. Decidir herramienta: una sin cookies evita el banner.
- **Dominio:** apuntar `www.eferos.es` al nuevo hosting y definir `NEXT_PUBLIC_SITE_URL=https://www.eferos.es`.
- **Indexación:** activar `NEXT_PUBLIC_ALLOW_INDEXING=true` solo al publicar en el dominio. Después, enviar el sitemap en Google Search Console.
- **Redirecciones 301 desde la web actual:**
  - `/conócenos` → `/#equipo`;
  - `/contacto-y-reservas` → `/#contacto`;
  - `/inicio/politica-de-cookies` → la nueva página de cookies.
  - Hay que obtener el listado completo de URLs antiguas. `/especialidades/epi` y `/especialidades/terapia-manual` ya se conservan.
- **Ficha de Google Business:** mantener dirección, teléfono y horario idénticos a la web.
- **Prueba en dispositivos reales** (iPhone y Android): menú, toques en filas, scroll de «El centro» y enlaces a WhatsApp y teléfono.
