# Mar Mejías Peluquería · Amanda Ferrer Uñas · demo comercial (Mairena del Aljarafe)

Demo no indexable para **Mar Mejías Peluquería y Amanda Ferrer Uñas** (C. Tiguantepe, 19 · Cavaleri · 41927 Mairena del Aljarafe, Sevilla).

Enfoque comercial: **web propia + Booksy**. El negocio ya reserva con Booksy y la web no lo sustituye: presenta marca, servicios, equipo, trabajos y reseñas, y todos los botones «Reservar» abren su perfil de Booksy.

- **Versión publicable:** `demo-host/` en la raíz del repo (HTML + CSS + JS estáticos, sin build). Cloudflare Pages publica esa carpeta y crea la preview de la rama `demo/mar-mejias-amanda-ferrer`.
- **Esta carpeta** solo guarda documentación interna. Nada de aquí se publica.
- Sin Railway, sin Wrangler, sin analytics, sin formularios ni motor de reservas propio.
- No indexable: `<meta name="robots">` en `index.html`, `demo-host/robots.txt` y `demo-host/_headers` con `X-Robots-Tag: noindex, nofollow, noarchive`.

## Probar en local

```bash
python3 -m http.server 8080 -d demo-host
```

## Cambiar la URL de Booksy

Constante `BOOKSY_URL` al principio de `demo-host/main.js`. Todos los enlaces con atributo `data-booksy` la usan.

Detalle de la investigación en [docs/INTERNAL_AUDIT.md](docs/INTERNAL_AUDIT.md) y recursos visuales en [docs/README_ASSETS.md](docs/README_ASSETS.md).
