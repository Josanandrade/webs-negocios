# Pedagogía Lola Álvarez · demo

Web estática de demostración para Pedagogía Lola Álvarez (Pilas, Sevilla).

- **La web publicada vive en `demo-host/`** (index.html, styles.css, main.js, favicon.svg, robots.txt, _headers). Cloudflare Pages construye la preview de la rama `demo/pedagogia-lola-alvarez` desde esa carpeta. Sin build, sin Railway, sin Wrangler.
- Esta carpeta (`demos/pedagogia-lola-alvarez/`) guarda solo documentación interna. No se publica.
- Indexación bloqueada: meta `robots noindex`, `robots.txt` con `Disallow: /` y cabecera `X-Robots-Tag` en `_headers`.

## Identidad
- Papel cálido `#F6F2EA`, tinta `#23262F`, **azul lápiz** `#3F5D97` (acento principal), albaricoque `#EE9F72`, notas pastel (lavanda, menta, cielo, rosa, arena). Bloque de familias en azul noche `#262B3A`.
- Tipografías: Hedvig Letters Serif (titulares) + Commissioner (texto), vía Google Fonts.
- Motivo: un trazo de lápiz que empieza enredado y se va soltando ("cuaderno de acompañamiento"). Sin fotos; todo SVG propio.

## Animación (principios de Emil Kowalski, aplicados a mano)
La skill de Emil Kowalski no está instalada en el entorno; se aplicaron sus principios:
- Curvas propias: `cubic-bezier(.23,1,.32,1)` para entradas, `(.77,0,.175,1)` para el trazo, `(.32,.72,0,1)` para la píldora de pestañas.
- Solo `transform`, `opacity` y `filter`; entradas cortas desde 12–14 px y un leve blur, nunca desde `scale(0)`.
- Escalonado de 60–70 ms, botones con `scale(.97)` al pulsar, hover solo en dispositivos con puntero fino.
- Menú con `transform-origin` en la esquina del botón; FAQ con `grid-template-rows` animado también al cerrar.
- `prefers-reduced-motion` desactiva todo el movimiento.

## Contenido y límites
Ver `docs/INTERNAL_AUDIT.md`.
