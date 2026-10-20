# Salón de Peluquería Toñi Garrido · demo comercial (Benacazón)

Demo no indexable para **Salón de Peluquería Toñi Garrido** (C/ Juan Ramón Jiménez, 15 · 41805 Benacazón, Sevilla).

- **Versión publicable:** `demo-host/` en la raíz del repo (HTML + CSS + JS estáticos, sin build). Cloudflare Pages publica esa carpeta como preview de la rama `demo/toni-garrido`.
- **Esta carpeta** es solo documentación interna. No se publica.
- Sin Railway, sin Wrangler, sin analytics, sin formularios que envíen datos: la cita se prepara como mensaje de WhatsApp en el navegador.

## Probar en local

```bash
python3 -m http.server 8080 -d demo-host
```

## Cambiar datos

- Teléfono: buscar `618745554` / `618 74 55 54` en `demo-host/index.html`.
- WhatsApp: constante `WA_NUMBER` en `demo-host/main.js` (móvil público, sin confirmar que tenga WhatsApp).
- Horario: tabla "Horario" en El salón, tarjeta de Contacto y constante `HOURS` en `main.js`.

Investigación en [docs/INTERNAL_AUDIT.md](docs/INTERNAL_AUDIT.md) y recursos en [docs/README_ASSETS.md](docs/README_ASSETS.md).
