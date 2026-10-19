# Celia García Studio · demo comercial

Demo estática (HTML + CSS + JS, sin build ni backend) para **Celia García Studio**, estudio de uñas, tatuajes y pestañas en Sanlúcar la Mayor (Sevilla).

- No indexable: `<meta name="robots">`, `public/robots.txt` y cabecera `X-Robots-Tag` en `public/_headers`.
- Sin reservas reales: el formulario solo compone un mensaje y abre WhatsApp (`wa.me`). No envía ni guarda nada.
- Galería con ilustraciones SVG propias (no hay fotos públicas accesibles del negocio). Se regeneran con `node tools/generate-art.mjs`; para la web final se sustituyen por fotos reales de su Instagram.
- Investigación y decisiones en `docs/INTERNAL_AUDIT.md` (fuera de `public/`, no se publica).

## Despliegue en Cloudflare Pages (no Railway)

| Ajuste | Valor |
|---|---|
| Rama | `demo/celia-garcia-studio` |
| Root directory | `demos/celia-garcia-studio` |
| Build command | *(vacío)* |
| Build output directory | `public` |

`wrangler.toml` declara `pages_build_output_dir = "public"`. También se puede subir a mano:

```bash
npx wrangler pages deploy public --project-name celia-garcia-studio --branch demo-celia-garcia-studio
```

## Ver en local

```bash
cd public && python3 -m http.server 8080
```
