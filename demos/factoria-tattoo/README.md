# Factoría Tattoo — Demo

Concepto de web para Factoría Tattoo (Sevilla). Demo comercial no oficial.

- Una sola página pública (`index.html`). Sin rutas adicionales, sin sitemap.
- `noindex` en meta, `robots.txt` (`Disallow: /`) y cabecera `X-Robots-Tag`.
- Sin analytics, cookies, formularios de envío ni peticiones a terceros.
- La investigación vive solo en `docs/INTERNAL_AUDIT.md` (no se despliega).

## Stack

Vite + TypeScript sin framework. Fuente Archivo variable autoalojada.
`server.mjs` sirve `dist/` con cabeceras de privacidad y CSP estricta.

## Scripts

```bash
npm install
npm run dev        # desarrollo
npm run lint
npm run typecheck
npm run build      # typecheck + build a dist/
npm start          # sirve dist/ en $PORT (preview / Railway)
```

## Contenido

Todo el contenido está en `src/data.ts`. Añadir un artista o asignar uno a un
estilo (`styles[].artistId`) actualiza buscador, índice de estilos, equipo,
portfolio y mensaje de consulta. Fotos: ver
`public/assets/factoria-tattoo/README_ASSETS.md`.
