# Helena García · Beauty Salon (Bormujos) — demo comercial privada

Propuesta de web **no solicitada** para Helena García · Beauty Salon
(Av. del Aljarafe 65, Ed. Cerro Colarte, Local 12 · 41930 Bormujos, Sevilla).
No es la web oficial del salón ni está afiliada a él.

- `/` — la web propuesta (única ruta pública).
- `docs/` — **documentación interna, no se publica**: `INTERNAL_AUDIT.md`
  (investigación, fuentes, datos descartados y pendientes) y
  `README_ASSETS.md` (fotos a pedir). No crear rutas en `src/app` ni ficheros
  en `public/` con contenido interno: todo lo que hay ahí se sirve en la web.

## Stack

Next.js 16 (App Router, todo estático) + React 19 + CSS propio. Sin Tailwind,
sin librerías de UI ni de animación, sin analytics, sin cookies, sin mapas
embebidos. Tipografías locales (Bricolage Grotesque + Plus Jakarta Sans, OFL).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint
npm run typecheck
```

## Privacidad de la demo

- `robots.txt` bloquea todo, meta `noindex, nofollow` y cabecera `X-Robots-Tag`.
- El asistente de reserva no crea citas: el último paso abre una hoja
  "Modo demo" que explica a dónde llevaría y enlaza al perfil público de Booksy.
- Sin mapas embebidos: "Cómo llegar" es un enlace a Google Maps.
- WhatsApp desactivado (`whatsappEnabled: false`) hasta confirmar que lo usan.
- Barra superior y pie identifican la página como propuesta en versión demo.

## Contenido

- Datos, carta y reseñas: `src/content/salon.ts`. Solo servicios y precios
  publicados en Booksy; donde las fuentes se contradicen, "Consultar".
- Fotos: `src/content/photos.ts` + `public/assets/helena-garcia-beauty-salon/`
  (ver `docs/README_ASSETS.md`).

## Movimiento

Todo con `transform`/`opacity` y curvas ease-out; entradas cortas
(≤ 640 ms), feedback de pulsación a 160 ms, hovers solo con puntero fino,
nada se escala desde 0. Con `prefers-reduced-motion` se desactivan entradas,
abanico, ticker (pasa a texto estático) y el revelado al hacer scroll.

## Antes de convertirla en web real

1. Validar con el salón lo pendiente de `docs/INTERNAL_AUDIT.md`.
2. Subir las fotos de `docs/README_ASSETS.md`.
3. Conectar el botón final a la agenda real (Booksy con servicio preseleccionado
   o la herramienta que elija el salón).
4. Quitar la barra demo y el bloqueo a buscadores; añadir
   LocalBusiness, aviso legal y política de privacidad.
5. Migrar a `client-helena-garcia-beauty-salon-web` según el flujo del repo.
