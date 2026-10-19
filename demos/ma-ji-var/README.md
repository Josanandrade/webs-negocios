# Ma Ji Var · demo comercial (Umbrete)

Demo no indexable para **Peluquería y Belleza Ma Ji Var** (C. Baldomero Muñoz, 30 · 41806 Umbrete, Sevilla).

- **Versión publicable:** `demo-host/` en la raíz del repo (HTML + CSS + JS estáticos, sin build). Cloudflare Pages publica solo esa carpeta y crea la preview de la rama `demo/ma-ji-var`.
- **Esta carpeta** solo guarda documentación interna. Nada de aquí se publica.
- Sin Railway, sin Wrangler, sin analytics, sin formularios que envíen datos: la solicitud de cita prepara un mensaje de WhatsApp en el navegador.

## Probar en local

```bash
python3 -m http.server 8080 -d demo-host
```

## Cambiar datos de contacto

- Teléfono: buscar `955715970` / `955 71 59 70` en `demo-host/index.html`.
- WhatsApp: constante `WA_NUMBER` en `demo-host/main.js` (ahora apunta al fijo, sin confirmar).
- Horario del indicador "Abierto ahora": final de `demo-host/main.js`.

Detalle de la investigación en [docs/INTERNAL_AUDIT.md](docs/INTERNAL_AUDIT.md) y recursos visuales en [docs/README_ASSETS.md](docs/README_ASSETS.md).
