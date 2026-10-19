# Peluquería Elena Vázquez · demo comercial (Gines)

Demo no indexable para **Peluquería Elena Vázquez** (C. Fray Ramón de Ginés · 41960 Gines, Sevilla).

- **Versión publicable:** `demo-host/` en la raíz del repo (HTML + CSS + JS estáticos, sin build). Cloudflare Pages publica solo esa carpeta y crea la preview de la rama `demo/elena-vazquez`.
- **Esta carpeta** solo guarda documentación interna. Nada de aquí se publica.
- Sin Railway, sin Wrangler, sin analytics, sin formularios que envíen datos: la solicitud de cita prepara un mensaje de WhatsApp en el navegador.
- No indexable por triple vía: `<meta name="robots" content="noindex, nofollow, noarchive">`, `demo-host/robots.txt` (`Disallow: /`) y `demo-host/_headers` (`X-Robots-Tag`).

## Probar en local

```bash
python3 -m http.server 8080 -d demo-host
```

## Cambiar datos

- Teléfono: buscar `633095519` / `633 09 55 19` en `demo-host/index.html`.
- WhatsApp: constante `WA_NUMBER` en `demo-host/main.js` (ahora el móvil de Fresha, sin confirmar que tenga WhatsApp).
- Nota de Google: constante `GOOGLE` en `demo-host/main.js` (`{ rating: "4,9", count: 120 }`); con `null` se muestra el texto genérico.
- Reseñas: las tres tarjetas de `#resenas` en `index.html` son de ejemplo; sustituir por reseñas reales con permiso.
- Galería: SVG en `demo-host/assets/galeria/`; cambiar por fotos reales (ver [docs/README_ASSETS.md](docs/README_ASSETS.md)).

Investigación completa en [docs/INTERNAL_AUDIT.md](docs/INTERNAL_AUDIT.md).
