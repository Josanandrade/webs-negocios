# Animalex · Sevilla — demo comercial privada

Web demo **no solicitada** para Animalex, tienda de animales en C. Lisboa 49
(El Cerro, Sevilla). No es la web oficial del negocio ni está afiliada a él.

La web se sirve en `/` y es la única ruta pública. La investigación y las notas
de trabajo están en `docs/INTERNAL_AUDIT.md`, que no se despliega como página.

## Preview (Railway)

Proyecto Railway `animalex-demo`, entorno `preview`, servicio `animalex-web`,
rama `demo/animalex-wnwgs3`, directorio raíz `/demos/animalex`. Sin dominio
propio ni entorno de producción.

## Stack

Next.js 16 (App Router, todo estático) + React 19 + CSS propio. Sin Tailwind,
sin librerías de UI ni de animación, sin analytics, sin píxeles, sin cookies.
Fuente Archivo (variable, eje de anchura) vía `next/font` (autoalojada).

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
- `src/lib/hours.ts` — horario y estado abierto/cerrado en hora de Madrid.
- `src/components/` — logotipo (`Mark`), estado (`OpenStatus`), consulta
  (`Consulta`) y botones que la rellenan (`AskButton`).
- `src/proxy.ts` — 404 para cualquier `.md` bajo `/assets/`.
- `public/assets/animalex/README_ASSETS.md` — fotos que pedir.
- `docs/INTERNAL_AUDIT.md` — fuentes, verificaciones, descartes.

## Privacidad de la demo

- `robots.txt` bloquea todo; `meta robots` noindex y cabecera `X-Robots-Tag`.
- No vende ni simula una tienda online: la consulta compone un mensaje y abre
  WhatsApp o una llamada; la web no envía ni guarda nada.
- WhatsApp activado sobre el móvil del negocio **sin confirmar**:
  `whatsappEnabled` en `src/content/site.ts`.

## Antes de convertirla en web real

1. Validar WhatsApp, horario, reparto y los textos marcados en la auditoría.
2. Añadir las fotos pedidas en `README_ASSETS.md` y el logotipo real.
3. Quitar el bloqueo a buscadores y el aviso de demo; añadir LocalBusiness,
   aviso legal y privacidad.
4. Migrar a `client-animalex-web` según el flujo del repositorio.
