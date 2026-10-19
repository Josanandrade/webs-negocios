# Centro Naturláser · demo comercial (Espartinas)

Demo no indexable para **Centro Naturláser Estética Avanzada** (Av. Pago Marqués 2, Espartinas, Sevilla).

- **Versión publicable:** `demo-host/` en la raíz del repo (HTML + CSS + JS estáticos, sin build). Cloudflare Pages publica esa carpeta y crea la preview de la rama `demo/naturlaser-espartinas`.
- **Esta carpeta** solo guarda documentación interna. Nada de aquí se publica.
- Sin Railway, sin Wrangler, sin analytics, sin formularios que envíen datos: la solicitud de cita y el selector de zonas preparan un mensaje de WhatsApp en el navegador.
- No indexable por tres vías: `<meta name="robots">` en `index.html`, `demo-host/robots.txt` (`Disallow: /`) y `demo-host/_headers` (`X-Robots-Tag: noindex, nofollow, noarchive`).

## Probar en local

```bash
python3 -m http.server 8080 -d demo-host
```

## Cambiar datos

- Teléfono / WhatsApp: buscar `744635882` / `744 63 58 82` en `demo-host/index.html` y la constante `WA_NUMBER` en `demo-host/main.js`.
- Horario: tabla `.hours` en `index.html` y objeto `HOURS` en `main.js` (indicador "Abierto/Cerrado ahora").
- Zonas de láser: objeto `ZONES` en `main.js` y puntos `.body__pts` del SVG en `index.html`.
- Tratamientos: sección `#facial-corporal` en `index.html`. Solo se usan los que aparecen en el directorio (ver auditoría).

Detalle de la investigación en [docs/INTERNAL_AUDIT.md](docs/INTERNAL_AUDIT.md) y recursos visuales en [docs/README_ASSETS.md](docs/README_ASSETS.md).
