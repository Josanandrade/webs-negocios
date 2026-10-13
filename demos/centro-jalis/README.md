# Jalis · Centro de belleza y bienestar (Castilleja de la Cuesta) — demo comercial privada

Propuesta de web **no solicitada** para Jalis / «Centro Jalis» (C/ Zambra,
locales 6 y 7 · 41950 Castilleja de la Cuesta, Sevilla). No es la web oficial
del negocio ni está afiliada a él.

- `/` — la web propuesta.
- `/propuesta` — documento interno: presencia digital encontrada, qué está
  verificado y qué no, dirección visual y qué pedir al centro.

Idea central: **«Tu experiencia y tu recorrido merecen una web que los
represente»** — más de 18 años de trayectoria y 5,0 en Booksy, sin web propia.

## Stack

Next.js 16 (App Router, 100 % estática) + React 19 + CSS propio. Fuentes
autoalojadas (Bodoni Moda y Hanken Grotesk, OFL). Sin Tailwind, sin
dependencias de UI, sin analytics, sin píxeles, sin cookies, sin peticiones a
terceros.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint
npm run typecheck
```

## Privacidad de la demo

- `robots.txt` → `Disallow: /`, metadatos `noindex, nofollow, nocache` y
  cabecera `X-Robots-Tag` en todas las rutas (`next.config.ts`).
- Barra superior y pie identifican la página como propuesta no oficial.
- Sin formularios que envíen datos: el asistente de cita solo prepara un
  mensaje y termina en los canales públicos que el centro ya usa (su perfil
  de Booksy y su teléfono). No crea reservas.
- WhatsApp desactivado (`whatsappEnabled: false` en `src/content/jalis.ts`)
  hasta que el centro confirme que lo usa.
- Enlaces externos con `rel="noopener noreferrer nofollow"`.

## Estructura

```text
src/
  app/            layout (metadata, fuentes), page, propuesta/, robots, icon
  components/     Header (+ menú móvil), TreatmentMenu (carta por pestañas),
                  Planner (asistente de cita), Dock (barra móvil), Reveal,
                  Photo (foto real ↔ composición), Brand (sello y logotipo)
  content/jalis.ts   TODOS los datos y textos del negocio (fuente única)
  content/photos.ts  huecos de fotografía (null = composición)
public/assets/centro-jalis/README_ASSETS.md   qué fotos pedir y cómo cambiarlas
```

## Preview

Servicio Railway independiente con *Root Directory* = `demos/centro-jalis`,
rama `demo/centro-jalis`, build `npm run build`, start `npm start` (usa
`PORT`). Sin dominio propio: solo el `*.up.railway.app` generado.

## Antes de convertirla en web real

1. Validar carta, precios, horario, año de apertura y canal de reserva.
2. Sustituir composiciones por las fotos de la sesión (README_ASSETS).
3. Logotipo real si existe; permiso para citar reseñas y nombrar al equipo.
4. Quitar barra de demo, `/propuesta` y el bloqueo a buscadores; añadir
   datos estructurados (BeautySalon), aviso legal y privacidad.
5. Migrar a `client-centro-jalis-web` según el flujo del repositorio.
