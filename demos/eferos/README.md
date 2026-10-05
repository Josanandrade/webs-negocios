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
│   │                           Conditions, Spaces, Team, Visit), cada una con su .module.css
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
- tratamientos: nombre, categoría, resumen, texto de la ficha e indicaciones. Añadir un tratamiento aquí crea su página en `/especialidades/<slug>`, su fila en la home, su enlace en el pie y su entrada en el sitemap.

### Fotografías

La web está preparada para fotos reales, pero esta versión no las incluye. Desde el entorno de desarrollo no fue posible descargar las imágenes de eferos.es ni de Setmore, y no se han puesto fotos de stock genéricas. Mientras no haya foto se muestra un hueco diseñado con la retícula de la marca.

Para poner una foto:

1. Copia la imagen en `public/images/…`, por ejemplo `public/images/equipo/cristina-leon.jpg`.
2. En `business.config.ts`, cambia `photo: null` por la ruta, por ejemplo `photo: "/images/equipo/cristina-leon.jpg"`.

Huecos disponibles: retratos del equipo (proporción 3:4) y los tres espacios del centro (4:5 en escritorio, 4:3 en móvil). `next/image` optimiza el tamaño y el formato (AVIF/WebP).

### Logotipo

`components/Logo.tsx` es un logotipo **provisional** (wordmark "eferos" + retícula de medición). Sustitúyelo por el oficial (idealmente un SVG) en ese único componente. El favicon está en `app/icon.svg`.

## Decisiones de diseño

- **Concepto: "precisión que se ve".** Lo que diferencia a Eferos frente a otras clínicas de la zona son las técnicas guiadas por ecografía (EPI®) combinadas con terapia manual. La firma visual es una ecografía generada en código (`ScanPanel`), con escala de profundidad, aguja y calipers. Las marcas de medición (`+`) y los datos en monoespaciada se repiten por toda la web como lenguaje propio.
- **Paleta:** blanco mineral frío, tinta verde pino y cobalto solo como acento de medición y foco. Se evitan los tópicos de clínica (azul sanitario, blanco puro) y los de plantilla (crema y terracota, degradados).
- **Tipografía:** Archivo en anchura estrecha para titulares y anchura normal para el texto. Newsreader cursiva aparece solo en una palabra clave por bloque. IBM Plex Mono se usa para datos clínicos (NICA, colegiado, horarios).
- **Sin tarjetas por defecto:** los tratamientos son un índice de filas tipográficas, las lesiones una lista, el contacto filas de acción. Solo la caja de reserva de las fichas tiene fondo propio.
- **Móvil:** la ecografía pasa a formato apaisado bajo el titular, la ficha del hero se convierte en lista de pares, la historia sticky de "El centro" se convierte en foto + texto por espacio, el menú es un panel a pantalla completa y todos los objetivos táctiles miden al menos 44 px.

## Notas técnicas

- **Rendimiento.** Todas las rutas son estáticas. El CSS se incrusta en el HTML (`experimental.inlineCss`) porque es pequeño (~35 KB) y así no bloquea el renderizado. La ecografía se pinta por tramos en `requestIdleCallback`, así que no genera tareas largas. El titular del hero entra con una máscara (sin opacidad) para no penalizar el LCP. Lighthouse móvil con conexión 4G lenta simulada, en local: Performance 93, Accessibility 100, Best Practices 100 y SEO 100 con indexación activada (66 en modo demo por el `noindex`, que es intencionado).
- **Movimiento.** Revisado con las skills de Emil Kowalski (`emil-design-eng`, `review-animations`, `mobile-native`). Tokens en `styles/globals.css`: `--ease-out` para entradas y respuestas, `--ease-in-out` para cambios de forma en pantalla, `--dur-press` (120 ms) y `--dur-hover` (240 ms). Las interacciones de interfaz se quedan por debajo de 300 ms; solo las entradas de contenido (hero, scroll) son más largas. Todo `:hover` va dentro de `@media (hover: hover) and (pointer: fine)` y cada elemento pulsable tiene su estado `:active`.
- **Animaciones sin riesgo.** Los elementos con `data-reveal` son visibles por defecto. Solo se ocultan si un script inline confirma, antes del primer pintado, que hay `IntersectionObserver` y que el usuario no pide movimiento reducido. Sin JavaScript se ve todo.
- **Accesibilidad.** HTML semántico, enlace "Saltar al contenido", foco visible en cobalto, menú móvil con `aria-expanded`, cierre con Escape y foco atrapado, contraste AA y `alt` en las imágenes reales.
- **SEO.** Metadata por página, Open Graph con imagen generada, canonical, `sitemap.xml`, `robots.txt` y JSON-LD `MedicalClinic`/`Physiotherapy` con dirección, horario, servicios y equipo. Las URLs `/especialidades/epi` y `/especialidades/terapia-manual` mantienen las de la web actual.

## Pendiente de validar con Eferos

Busca `TODO(verificar)` en `business.config.ts`:

- **Horario:** eferos.es indica L–J 9:30–20:30 y V 9:30–13:30. Otros directorios publican 9:00–21:00 / 9:00–14:00.
- **Nombre exacto del máster** de Alfonso Canto.
- **Textos de las fichas de tratamiento:** las definiciones parten de la web actual. Los bloques "Cómo la usamos" y similares son redacción propuesta.
- **Perfiles de Instagram y Facebook:** no se han podido confirmar las URLs.
- **Fotografías reales** del equipo y del centro, y **logotipo oficial**.
- **Páginas legales** (aviso legal, privacidad y cookies): necesarias antes de publicar en producción.
