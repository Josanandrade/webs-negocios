# Pura Bellezza · Bormujos — demo comercial privada

Propuesta de web **no solicitada** para Pura Bellezza, centro de estética y
bienestar en Av. de la Constitución, 9, local A · 41930 Bormujos (Sevilla).
No es la web oficial del negocio ni está afiliada a él.

- `/` — la web propuesta.
- `/propuesta` — notas internas: presencia digital encontrada, qué está
  verificado y qué no, y lo que habría que pedir al centro.

## Preview (Railway, como el resto de demos)

**URL:** https://pura-bellezza-web-preview.up.railway.app · proyecto Railway
`pura-bellezza-demo`, entorno `preview`, servicio `pura-bellezza-web`, rama
`demo/pura-bellezza`, directorio raíz `/demos/pura-bellezza`. Sin dominio
propio ni entorno de producción.

## Stack

Next.js 16 (App Router, todo estático) + React 19 + CSS propio. Sin Tailwind,
sin librerías de UI ni de animación, sin analytics, sin píxeles, sin cookies.
Fuentes Bodoni Moda y Jost vía `next/font` (autoalojadas en el build).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run lint
npm run typecheck
npm start          # usa PORT si existe (Railway)
```

## Dirección visual

«Tocador»: porcelana luminosa, rosa empolvado y un frambuesa profundo reservado
para la acción. Bodoni Moda (tipografía de revista de moda y belleza) para
titulares, Jost para leer en el móvil. El único motivo gráfico es el espejo
ovalado de tocador, que enmarca fotos y composiciones. Nada de negro y dorado,
nada de arcos ni del papel cálido de otras demos.

Movimiento: una sola secuencia de entrada en el hero (texto que sube, espejo que
se asienta y un destello que lo cruza una vez). El resto del movimiento responde
a acciones: botones que ceden al pulsar, indicador de pestañas con `clip-path`,
hoja de reserva con curva de cajón y salida más corta que la entrada. Solo se
animan `transform`, `opacity` y `clip-path`; los hover solo existen con puntero
fino, y `prefers-reduced-motion` desactiva todo.

## Privacidad de la demo

- `robots.txt` bloquea todo, `<meta name="robots" content="noindex, nofollow">`
  y cabecera `X-Robots-Tag` en todas las rutas.
- La hoja de reserva no crea citas: lleva a la agenda pública de Booksy que el
  centro ya usa, o a llamar al teléfono publicado.
- WhatsApp desactivado (`whatsappEnabled: false` en `src/content/site.ts`)
  hasta que el centro confirme que lo usa.
- Barra superior y pie identifican la página como propuesta no oficial.
- Sin mapa incrustado (evita cookies de terceros): enlace «Cómo llegar».

## Contenido

- Datos y textos: `src/content/site.ts`. Solo servicios que aparecen en fuentes
  públicas. Sin precios (los publicados en plataformas no se han podido
  comprobar al día), sin nombres del equipo ni años de experiencia.
- Fotografías: `src/content/photos.ts` + `public/assets/pura-bellezza/`.
  Ver `public/assets/pura-bellezza/README_ASSETS.md`.

## Antes de convertirla en web real

1. Validar servicios, horario, canal de reserva y WhatsApp con el centro.
2. Sustituir las composiciones por las 6 fotos pedidas.
3. Quitar la barra de demo, `/propuesta` y el bloqueo a buscadores; añadir
   metadatos locales (LocalBusiness), aviso legal y política de privacidad.
4. Migrar a `client-pura-bellezza-web` según el flujo del repositorio.
