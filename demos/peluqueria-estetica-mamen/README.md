# Peluquería & Estética Mamen · demo comercial (Umbrete)

Demo no indexable para **Peluquería & Estética Mamen** (Camino de los Malaguíes, 41806 Umbrete, Sevilla).

- **Versión publicable:** `demo-host/` en la raíz del repo (HTML + CSS + JS estáticos, sin build). Cloudflare Pages publica esa carpeta y crea la preview de la rama `demo/peluqueria-estetica-mamen`.
- **Esta carpeta** solo guarda documentación interna. Nada de aquí se publica.
- Sin Railway, sin Wrangler, sin analytics, sin formularios que envíen datos: "Pide tu cita" prepara un mensaje de WhatsApp en el navegador.
- No indexable: `<meta name="robots" content="noindex, nofollow, noarchive">`, `demo-host/robots.txt` (Disallow: /) y `demo-host/_headers` (X-Robots-Tag).

## Probar en local

```bash
python3 -m http.server 8080 -d demo-host
```

## Cambiar datos de contacto

- Teléfono: buscar `628857439` / `628 85 74 39` en `demo-host/index.html`.
- WhatsApp: constante `WA_NUMBER` en `demo-host/main.js` (ahora el móvil de Fresha, sin confirmar que tenga WhatsApp).
- Galería: sustituir los SVG de `demo-host/assets/galeria/` por fotos reales (mismo nombre o actualizar `index.html`).

Investigación en [docs/INTERNAL_AUDIT.md](docs/INTERNAL_AUDIT.md) y recursos visuales en [docs/README_ASSETS.md](docs/README_ASSETS.md).
