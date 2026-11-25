# Margot Ibáñez · Micropigmentación facial (web v2)

Web estática y no indexable para Margot Ibáñez, rehecha el 2026-11-23 a partir de los textos que ella misma facilitó (documento "Textos página web"). Sustituye a la demo de prospección del 2026-10-19.

- Versión publicada: `demo-host/` (index.html, styles.css, tokens.css, base.css, main.js, assets/img/, favicon.svg, robots.txt, _headers).
- Cloudflare Pages construye una preview por rama desde `demo-host/`.
- No indexable: meta robots, `robots.txt` (`Disallow: /`) y `_headers` (`X-Robots-Tag`). Quitar las tres cosas al pasar a producción.

## Cambiar el número de WhatsApp

Está pendiente. Editar la constante al principio de `demo-host/main.js`:

```js
const WHATSAPP_NUMBER = '34XXXXXXXXX'; // solo dígitos, con prefijo 34
```

Todos los botones (cabecera, portada, cada tratamiento, banda tras tratamientos, cierre, pie y barra fija en móvil) usan esa constante. Mientras esté vacía, WhatsApp se abre con el mensaje escrito y pide elegir el contacto.

Documentación interna (fuera de `demo-host/`, no se publica):

- `docs/INTERNAL_AUDIT.md`: fuentes, datos confirmados y pendientes.
- `docs/README_ASSETS.md`: fotos usadas y material que hay que pedir.
