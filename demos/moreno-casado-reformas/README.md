# Moreno & Casado · Reformas y Proyectos — demo

Demo comercial estática. La web publicada vive en `demo-host/` (Cloudflare Pages construye una preview por rama desde esa carpeta). Esta carpeta guarda solo fuentes y documentación interna; no se publica.

- `tools/gen-images.mjs`: genera las escenas interiores SVG de `demo-host/assets/img/` (perspectiva cónica propia, sin fotos de terceros). `node demos/moreno-casado-reformas/tools/gen-images.mjs`
- `docs/INTERNAL_AUDIT.md`: datos usados, decisiones y pendientes.

Sin Railway, sin Wrangler, sin proyectos Cloudflare nuevos. `noindex` en meta, `robots.txt` y `_headers`.
