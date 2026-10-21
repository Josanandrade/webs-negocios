# Peñaflor Inmobiliaria · demo comercial

- **Web publicada:** `demo-host/` (HTML, CSS y JS estáticos). Cloudflare Pages construye una preview por rama a partir de esa carpeta. Sin Railway, sin Wrangler, sin builds.
- **Esta carpeta:** documentación interna y fuentes (no se publica).
  - `docs/INTERNAL_AUDIT.md`: datos verificados, decisiones y puntos a confirmar.
  - `tools/gen-images.mjs`: genera las ilustraciones de `demo-host/assets/img/` (`node demos/penaflor-inmobiliaria/tools/gen-images.mjs`).

## Dónde se cambia cada cosa

| Qué | Dónde |
| --- | --- |
| Teléfono y WhatsApp | `demo-host/assets/data.js` → `CONFIG` (`whatsapp: ''` oculta todos los botones) |
| Inmuebles, zonas, tipos, etiquetas | `demo-host/assets/data.js` → `LIST`, `ZONES`, `TYPES`, `TAGS` |
| Textos de secciones | `demo-host/index.html` |
| Colores, tipografía, animaciones | `demo-host/styles.css` (tokens en `:root`) |
| Comportamiento | `demo-host/main.js` |

Las fichas se abren con enlace directo: `/#PF-117`.
