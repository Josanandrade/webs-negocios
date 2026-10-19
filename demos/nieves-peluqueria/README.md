# Nieve's Peluquería · demo comercial (Umbrete)

Demo no indexable para **Nieve's Peluquería** (C/ Manuel el Sacristán, 5 · 41806 Umbrete, Sevilla).

- **Versión publicable:** `demo-host/` en la raíz del repo (HTML + CSS + JS estáticos, sin build). Cloudflare Pages publica solo esa carpeta y crea la preview de la rama `demo/nieves-peluqueria`.
- **Esta carpeta** solo guarda documentación interna. Nada de aquí se publica.
- Sin Railway, sin Wrangler, sin analytics, sin formularios que envíen datos: la solicitud de cita prepara un mensaje de WhatsApp en el navegador.

## Probar en local

```bash
python3 -m http.server 8080 -d demo-host
```

## Cambiar datos de contacto

- Teléfono: buscar `627277440` / `627 277 440` en `demo-host/index.html`.
- WhatsApp: constante `WA_NUMBER` en `demo-host/main.js` (apunta al móvil público, sin confirmar que tenga WhatsApp).
- Horario: tarjeta "Horario" en la sección Contacto (ahora "Con cita previa", sin horario real).

Investigación en [docs/INTERNAL_AUDIT.md](docs/INTERNAL_AUDIT.md) y recursos visuales en [docs/README_ASSETS.md](docs/README_ASSETS.md).
