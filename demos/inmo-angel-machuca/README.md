# Inmo Ángel Machuca · demo

Demo comercial de una web inmobiliaria renovada para Inmo Ángel Machuca (Sanlúcar la Mayor, Sevilla).

## Dónde está cada cosa

- **La web publicada** está en `demo-host/` (raíz de la rama). Cloudflare Pages ya está conectado al repositorio y publica una preview por rama desde esa carpeta. No hay build, ni Railway, ni Wrangler.
- **Esta carpeta** (`demos/inmo-angel-machuca/`) guarda la documentación interna y las fuentes:
  - `docs/INTERNAL_AUDIT.md`: datos usados, decisiones y dudas (no se publica).
  - `tools/gen-images.mjs`: generador de las ilustraciones SVG de `demo-host/assets/img/`.

## Estructura de `demo-host/`

```
index.html        Página única: hero con buscador, destacados, listado con filtros, ficha, vender, proceso, contacto
styles.css        Identidad y animaciones
main.js           Filtros, ficha (drawer / bottom sheet), favoritos, asistente de venta, WhatsApp
assets/data.js    Datos del negocio + inmuebles DE EJEMPLO
assets/img/       Ilustraciones propias (SVG)
assets/favicon.svg
robots.txt, _headers   noindex (meta + robots + X-Robots-Tag)
```

## Probar en local

```
cd demo-host && python3 -m http.server 8000
```

Regenerar imágenes: `node demos/inmo-angel-machuca/tools/gen-images.mjs`.

Ficha directa de un inmueble: `/#ref=AM-102`.
