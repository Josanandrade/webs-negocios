# Celia García Studio · demo comercial

Demo estática (HTML + CSS + JS, sin build ni backend) para **Celia García Studio**, estudio de uñas, tatuajes y pestañas en Sanlúcar la Mayor (Sevilla).

- No indexable: `<meta name="robots">`, `public/robots.txt` y cabecera `X-Robots-Tag` en `public/_headers`.
- Sin reservas reales: el formulario solo compone un mensaje y abre WhatsApp (`wa.me`). No envía ni guarda nada.
- Galería con ilustraciones SVG propias (no hay fotos públicas accesibles del negocio). Se regeneran con `node tools/generate-art.mjs`; para la web final se sustituyen por fotos reales de su Instagram.
- Investigación y decisiones en `docs/INTERNAL_AUDIT.md` (fuera de `public/`, no se publica).

## Despliegue en Cloudflare Pages (no Railway)

El repositorio tiene un único proyecto de Cloudflare Pages que publica siempre la carpeta `demo-host/` de la raíz.
En la rama `demo/celia-garcia-studio`, `demo-host/` es una copia de `public/`. Tras cambiar la demo:

```bash
rm -rf demo-host && cp -r demos/celia-garcia-studio/public demo-host
```

Cloudflare genera la preview al detectar el commit en la rama. No se usa Wrangler ni proyectos propios.

## Ver en local

```bash
cd public && python3 -m http.server 8080
```
