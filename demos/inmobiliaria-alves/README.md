# Inmobiliaria Alves · demo comercial

Web estática publicada por Cloudflare Pages desde `demo-host/` en la rama `demo/inmobiliaria-alves`.
Esta carpeta guarda solo documentación y fuentes; no se despliega.

- `docs/INTERNAL_AUDIT.md`: datos verificados, contenido de ejemplo y dudas para el cliente.
- `tools/gen-images.mjs`: genera las ilustraciones SVG de `demo-host/assets/img/` (`node demos/inmobiliaria-alves/tools/gen-images.mjs`).

## Estructura publicada (`demo-host/`)

| Ruta | Qué es |
| --- | --- |
| `index.html`, `styles.css`, `main.js` | Portada: hero con buscador, destacados, listado con filtros, captación, valoración, servicios y contacto |
| `inmueble/?id=<id>` | Ficha de inmueble (galería con visor, características, solicitud de visita, similares) |
| `assets/data.js` | Configuración (teléfono, WhatsApp) e inmuebles de ejemplo |
| `assets/app.js` | Tarjetas, favoritos (localStorage), toast, enlaces de contacto, aparición al hacer scroll |
| `robots.txt`, `_headers`, `<meta name="robots">` | noindex en toda la preview |

Para cambiar teléfono o WhatsApp basta con editar `CONFIG` en `assets/data.js`.
