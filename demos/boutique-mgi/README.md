# MG&I · Boutique de belleza (Sevilla) — demo comercial privada

Propuesta de web **no solicitada** para Boutique de belleza MG&I
(C. José María de Pereda, 3, local 2 · 41006 Sevilla). No es la web oficial
del negocio ni está afiliada a él.

- `/` — la web propuesta.
- `/propuesta` — documento interno: presencia digital encontrada, qué está
  verificado y qué no, estrategia y lo que habría que pedir al centro.

## Stack

Next.js 16 (App Router, todo estático) + React 19 + CSS propio. Sin Tailwind,
sin dependencias de UI, sin analytics, sin píxeles, sin cookies.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run lint
npm run typecheck
```

## Privacidad de la demo

- `robots.txt` bloquea todo, `<meta name="robots" content="noindex, nofollow">`
  y cabecera `X-Robots-Tag` en todas las rutas.
- Sin formularios que envíen datos: el asistente de cita solo prepara un
  mensaje y termina en una llamada al teléfono publicado del centro.
- WhatsApp desactivado (`whatsappEnabled: false` en `src/content/mgi.ts`)
  hasta que el centro confirme que lo usa.
- Barra superior y pie identifican la página como propuesta no oficial.

## Contenido

- Datos y textos: `src/content/mgi.ts`. Solo servicios que aparecen en fuentes
  públicas; sin precios, duraciones, nombres de profesionales ni marcas, porque
  no se han podido verificar.
- Fotografías: `src/content/photos.ts` + `public/assets/boutique-mgi/`.
  Ver `public/assets/boutique-mgi/README_ASSETS.md`.

## Antes de convertirla en web real

1. Validar servicios, precios, horario y canal de reserva con el centro.
2. Sustituir las composiciones por las 7 fotos del shooting.
3. Quitar la barra de demo, `/propuesta` y el bloqueo a buscadores; añadir
   metadatos locales (LocalBusiness), aviso legal y política de privacidad.
4. Migrar a `client-boutique-mgi-web` según el flujo del repositorio.
