# La Pelu de Maca · Dos Hermanas — demo privada

Web demo **no solicitada** para La Pelu de Maca (Av. Reyes Católicos, 1, 1B ·
Dos Hermanas, Sevilla). No es la web oficial del salón ni está afiliada a él.

- `/` es la única ruta pública.
- `docs/` es **interno y no se despliega**: `INTERNAL_AUDIT.md` (investigación,
  fuentes, descartes, QA) y `README_ASSETS.md` (fotos a pedir).

## Preview (Railway)

**URL:** https://la-pelu-de-maca-web-preview.up.railway.app · proyecto Railway
`la-pelu-de-maca-demo`, entorno `preview`, servicio `la-pelu-de-maca-web`, rama
`demo/la-pelu-de-maca`, directorio raíz `/demos/la-pelu-de-maca`. Sin dominio
propio ni entorno de producción.

## Stack

Next.js 16 (App Router, estático) + React 19 + CSS propio. Sin Tailwind, sin
librerías de UI ni de animación, sin analytics, sin cookies, sin mapas
embebidos. Fuentes locales: Fraunces (eje SOFT), Onest y Caveat (OFL).

```bash
npm install
npm run dev
npm run build && npm start   # usa PORT si existe
npm run lint
npm run typecheck
```

## Contenido

`src/content/salon.ts`: datos, horario, equipo, servicios y reseñas. Solo lo
verificado. El estado "Abierto / Cerrado" se calcula en el navegador con la
hora de Madrid.

## Movimiento

Solo `transform`/`opacity`/`translate`, curvas ease-out, entradas ≤ 760 ms,
pulsación de botones a 140 ms, hovers solo con puntero fino. Con
`prefers-reduced-motion` no hay entradas, subrayado animado ni revelado.
