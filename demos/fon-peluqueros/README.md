# Fon Peluqueros · demo comercial (Benacazón)

Demo no indexable para **Fon Peluqueros / Peluquería Fon** (C/ Cabo de Gata, 1, local 7 · 41805 Benacazón, Sevilla).

- **Versión publicable:** `demo-host/` en la raíz del repo (HTML + CSS + JS estáticos, sin build). Cloudflare Pages publica esa carpeta y crea la preview de la rama `demo/fon-peluqueros`.
- **Esta carpeta** solo guarda documentación interna. Nada de aquí se publica.
- Sin Railway, sin Wrangler, sin analytics, sin formularios que envíen datos: la solicitud de cita prepara un mensaje de WhatsApp en el navegador.

## Probar en local

```bash
python3 -m http.server 8080 -d demo-host
```

## Cambiar datos

- Teléfono: buscar `651611780` / `651 61 17 80` en `demo-host/index.html`.
- WhatsApp: constante `WA_NUMBER` en `demo-host/main.js` (apunta al móvil público; WhatsApp sin confirmar).
- Horario: `SLOTS` en `demo-host/main.js` (estado "Abierto ahora") y la tarjeta semanal del hero + tarjeta "Horario" en Contacto.

Investigación en [docs/INTERNAL_AUDIT.md](docs/INTERNAL_AUDIT.md) y recursos visuales en [docs/README_ASSETS.md](docs/README_ASSETS.md).
