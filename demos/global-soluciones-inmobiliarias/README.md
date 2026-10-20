# Global Soluciones Inmobiliarias · Umbrete (demo comercial)

Demo estática publicada por Cloudflare Pages desde `demo-host/` en la rama `demo/global-soluciones-inmobiliarias`.
No indexable: meta robots noindex, `robots.txt` Disallow y `_headers` con `X-Robots-Tag: noindex`.

- `/` web pública · `/inmueble/?ref=gs101` ficha · `/admin-demo/` vista demo del panel de gestión.
- Inmuebles ficticios en `demo-host/data.js` (marcados como demo). Imágenes: ilustraciones SVG propias generadas con `docs/gen_svgs.py`.
- WhatsApp: una sola variable, `CONFIG.whatsapp` en `demo-host/data.js`.
- El panel demo guarda los cambios en `localStorage` del navegador para que la web pública los refleje; no hay backend.

Documentación interna (no se despliega): `docs/INTERNAL_AUDIT.md`.
