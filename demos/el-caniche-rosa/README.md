# El Caniche Rosa · Tomares — demo comercial privada

Web demo **no solicitada** para El Caniche Rosa, peluquería y estética canina en
Tomares (Sevilla). No es la web oficial del negocio ni está afiliada a él.

La web se sirve en `/` y es la única ruta pública. La investigación y las notas
de trabajo están en `docs/INTERNAL_AUDIT.md`, que no se despliega como página.

## Preview (Railway)

**URL:** https://el-caniche-rosa-web-preview.up.railway.app · proyecto Railway
`el-caniche-rosa-demo`, entorno `preview`, servicio `el-caniche-rosa-web`, rama
`demo/el-caniche-rosa`, directorio raíz `/demos/el-caniche-rosa`. Sin dominio
propio ni entorno de producción.

## Stack

Next.js 16 (App Router, todo estático) + React 19 + CSS propio. Sin Tailwind,
sin librerías de UI ni de animación, sin analytics, sin píxeles, sin cookies.
Fuentes Bricolage Grotesque y Figtree vía `next/font` (autoalojadas).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run lint
npm run typecheck
npm start          # usa PORT si existe (Railway)
```

## Estructura

- `src/content/site.ts` — datos y textos (solo lo verificado en fuentes públicas).
- `src/content/photos.ts` — huecos de foto (todos vacíos por ahora).
- `src/components/` — logotipo (`Mark`), marcos circulares (`Pompom`), sello,
  selector «¿Qué le toca?».
- `src/proxy.ts` — 404 para cualquier `.md` bajo `/assets/`.
- `public/assets/el-caniche-rosa/README_ASSETS.md` — fotos que pedir.
- `docs/INTERNAL_AUDIT.md` — fuentes, verificaciones, descartes, QA.

## Privacidad de la demo

- `robots.txt` bloquea todo; `meta robots` noindex y cabecera `X-Robots-Tag`.
- No crea citas: «Reservar» lleva a la ficha pública de Booksy; «Llamar», a `tel:`.
- WhatsApp desactivado hasta confirmarlo con el negocio.
- Sin dirección exacta (las fuentes se contradicen): solo «Tomares, Sevilla».

## Antes de convertirla en web real

1. Validar dirección, horario, WhatsApp y los textos marcados en la auditoría.
2. Añadir las fotos pedidas en `README_ASSETS.md`.
3. Quitar el bloqueo a buscadores y el aviso de demo; añadir LocalBusiness,
   aviso legal y privacidad.
4. Migrar a `client-el-caniche-rosa-web` según el flujo del repositorio.
