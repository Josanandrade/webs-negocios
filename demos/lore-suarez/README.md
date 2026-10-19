# Lore Suárez Peluquería y Estética · demo comercial (Bormujos)

Demo no indexable para **LORE SUÁREZ Peluquería y Estética** (C/ Pablo Coso Calero, 5 · 41930 Bormujos, Sevilla).

- **Versión publicable:** `demo-host/` en la raíz del repo (HTML + CSS + JS estáticos, sin build). Cloudflare Pages publica esa carpeta y crea la preview de la rama `demo/lore-suarez`.
- **Esta carpeta** solo guarda documentación interna. Nada de aquí se publica.
- Sin Railway, sin Wrangler, sin analytics, sin formularios que envíen datos: la cita y el "laboratorio de balayage" preparan un mensaje de WhatsApp en el navegador.
- No indexable: `<meta name="robots">` + `googlebot`, `demo-host/robots.txt` (Disallow: /) y `demo-host/_headers` (X-Robots-Tag noindex, nofollow, noarchive).

## Probar en local

```bash
python3 -m http.server 8080 -d demo-host
```

## Cambiar datos

- Teléfono: buscar `698932596` / `698 93 25 96` en `demo-host/index.html`.
- WhatsApp: constante `WA_NUMBER` en `demo-host/main.js` (móvil público, WhatsApp sin confirmar).
- Horario e indicador "Abierto ahora": bloque `#hoursList` en `index.html` y constante `HOURS` en `main.js`.
- Galería: sustituir los SVG de `demo-host/assets/galeria/` por fotos reales (ver [docs/README_ASSETS.md](docs/README_ASSETS.md)).
- Opiniones: las tres tarjetas son huecos marcados como "Ejemplo de diseño"; sustituir por reseñas reales de Google con permiso.

Investigación en [docs/INTERNAL_AUDIT.md](docs/INTERNAL_AUDIT.md).
