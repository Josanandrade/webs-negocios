# Muah By Amparo Salado · demo comercial (Umbrete)

Demo no indexable para **Muah By Amparo Salado** (belleza, maquillaje, peinados para eventos, uñas y estética · Umbrete, Sevilla).

- **Versión publicable:** `demo-host/` en la raíz del repo (HTML + CSS + JS estáticos, sin build). Cloudflare Pages publica esa carpeta y crea la preview de la rama `demo/muah-amparo-salado`.
- **Esta carpeta** solo guarda documentación interna. Nada de aquí se publica.
- Sin Railway, sin Wrangler, sin analytics, sin formularios que envíen datos: la solicitud de cita prepara un mensaje de WhatsApp en el navegador.

## Probar en local

```bash
python3 -m http.server 8080 -d demo-host
```

## Rellenar datos de contacto (pendientes)

Todo está en el objeto `CONFIG` al principio de `demo-host/main.js`:

- `PHONE` / `PHONE_LABEL`: móvil de WhatsApp y teléfono. Vacío = WhatsApp abre el mensaje sin destinatario y se ocultan el botón "Llamar" y la fila de teléfono.
- `ADDRESS`: dirección exacta. Vacío = se muestra "Umbrete, Sevilla" y "Cómo llegar" busca el nombre del negocio en Google Maps.
- `INSTAGRAM`: usuario sin @. Vacío = no se muestra.

Detalle de la investigación en [docs/INTERNAL_AUDIT.md](docs/INTERNAL_AUDIT.md) y recursos visuales en [docs/README_ASSETS.md](docs/README_ASSETS.md).
