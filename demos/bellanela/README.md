# Bellanela · demo comercial (Gines)

Demo no indexable para **Bellanela Estética y Belleza** (Gines, Sevilla).

- **Versión publicable:** `demo-host/` en la raíz del repo (HTML + CSS + JS estáticos, sin build). Cloudflare Pages publica esa carpeta y crea la preview de la rama `demo/bellanela`.
- **Esta carpeta** solo guarda documentación interna. Nada de aquí se publica.
- Sin Railway, sin Wrangler, sin analytics, sin formularios que envíen datos: la solicitud de cita prepara un mensaje de WhatsApp en el navegador.
- No indexable por tres vías: `<meta name="robots">` en `index.html`, `demo-host/robots.txt` (`Disallow: /`) y `demo-host/_headers` (`X-Robots-Tag: noindex, nofollow, noarchive`).

## Probar en local

```bash
python3 -m http.server 8080 -d demo-host
```

## Cambiar datos

- Teléfono: buscar `653595206` / `653 59 52 06` en `demo-host/index.html`.
- WhatsApp: constante `WA_NUMBER` en `demo-host/main.js` (se asume el mismo móvil, sin confirmar).
- Horario: tabla `.hours` en `index.html`, `HOURS` en `main.js` (indicador "Abierto ahora") y regla de "tarde solo jueves" en `syncFranja`.
- Dirección: buscar `Salvador Dalí` en `index.html` (hay una segunda dirección posible, ver auditoría).
- Buscador "¿Qué le pasa a tu piel?": objeto `CONCERNS` en `main.js`. Solo usa tratamientos confirmados.

Detalle de la investigación en [docs/INTERNAL_AUDIT.md](docs/INTERNAL_AUDIT.md) y recursos visuales en [docs/README_ASSETS.md](docs/README_ASSETS.md).
