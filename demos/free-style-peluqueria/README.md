# Free Style Peluquería y Estética · demo comercial

Demo estática (HTML + CSS + JS, sin build ni backend) para **Free Style: Peluquería y estética**, C/ del Mocho, 32, San José de la Rinconada (Sevilla).

- La versión publicable vive en `demo-host/` (raíz del repo). Cloudflare Pages publica solo esa carpeta en cada push de la rama `demo/free-style-peluqueria`. No se usa Railway, Wrangler ni proyectos de Cloudflare propios.
- No indexable: `<meta name="robots">`, `demo-host/robots.txt` y cabecera `X-Robots-Tag` en `demo-host/_headers`.
- Sin reservas reales: el formulario solo compone un mensaje y abre WhatsApp (`wa.me/34658472580`). No envía ni guarda nada.
- Galería con ilustraciones SVG propias (no hay fotos públicas accesibles del salón). Se regeneran con `node demos/free-style-peluqueria/tools/generate-art.mjs`, que escribe en `demo-host/assets/`.
- Investigación y decisiones en `docs/INTERNAL_AUDIT.md` (fuera de `demo-host/`, no se publica).

## Ver en local

```bash
cd demo-host && python3 -m http.server 8080
```

Todas las rutas son relativas a la raíz de `demo-host/`.
