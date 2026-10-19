# Espacio de Belleza Rosa · demo comercial (Umbrete)

Demo no indexable para **Espacio de Belleza Rosa** (Paseo 1º de Mayo, 21 · 41806 Umbrete, Sevilla).

- **Versión publicable:** `demo-host/` en la raíz del repo (HTML + CSS + JS estáticos, sin build). Cloudflare Pages publica solo esa carpeta y crea la preview de la rama.
- **Esta carpeta** solo guarda documentación interna. Nada de aquí se publica.
- Sin Railway, sin Wrangler, sin analytics, sin formularios que envíen datos: la solicitud de cita prepara un mensaje de WhatsApp en el navegador.
- No indexable por triple vía: `<meta name="robots" content="noindex, nofollow, noarchive">`, `demo-host/robots.txt` (`Disallow: /`) y `demo-host/_headers` (`X-Robots-Tag: noindex, nofollow, noarchive`).

## Probar en local

```bash
python3 -m http.server 8080 -d demo-host
```

## Cambiar datos

- Teléfono: buscar `955717096` / `955 71 70 96` en `demo-host/index.html`.
- WhatsApp: constante `WA_NUMBER` en `demo-host/main.js` (ahora apunta al fijo, sin confirmar).
- Horario del indicador "Abierto ahora": constante `HOURS` al final de `demo-host/main.js`.
- Tratamientos: cada categoría es un `<section class="panel">` en `index.html`; cada tratamiento es un `<li class="item">` con `data-k` (palabras para el buscador). Si se añade o quita uno, actualizar también el contador del índice del hero (`.index__c`) y el `<select id="servicio">` del formulario.
- Galería: sustituir los SVG de `demo-host/assets/galeria/` por fotos reales (ver [docs/README_ASSETS.md](docs/README_ASSETS.md)).

Detalle de la investigación en [docs/INTERNAL_AUDIT.md](docs/INTERNAL_AUDIT.md).
