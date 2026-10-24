# Mari Paz Vela · demo comercial (Umbrete)

Demo no indexable para **Mari Paz Vela Centro de Estética** (C. Ruperto Escobar, 10, local 2 · 41806 Umbrete, Sevilla).

- **Versión publicable:** `demo-host/` en la raíz del repo (HTML + CSS + JS estáticos, sin build). Cloudflare Pages publica esa carpeta y crea la preview de la rama `demo/mari-paz-vela`.
- **Esta carpeta** solo guarda documentación interna. Nada de aquí se publica.
- Sin Railway, sin Wrangler, sin analytics, sin formularios que envíen datos: la solicitud de cita prepara un mensaje de WhatsApp en el navegador.

## Probar en local

```bash
python3 -m http.server 8080 -d demo-host
```

## Cambiar datos

- Teléfono: buscar `691847764` / `691 84 77 64` en `demo-host/index.html`.
- WhatsApp: constante `WA_NUMBER` en `demo-host/main.js` (ahora el mismo móvil; WhatsApp sin confirmar).
- Horario e indicador "Abierto ahora": objeto `HOURS` en `demo-host/main.js` y tabla `.today__week` en el HTML.
- Reseñas: sección `#opiniones` (ahora ejemplos marcados como "Ejemplo").
- Galería: `demo-host/assets/galeria/*.svg` (ilustraciones propias; sustituir por fotos reales).

Investigación en [docs/INTERNAL_AUDIT.md](docs/INTERNAL_AUDIT.md) y recursos en [docs/README_ASSETS.md](docs/README_ASSETS.md).
