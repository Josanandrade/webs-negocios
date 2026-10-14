# Los Ángeles · Dos Hermanas — demo comercial privada

Propuesta de web **no solicitada** para Peluquería y Estética Los Ángeles,
Av. de España, 110 N · 41702 Dos Hermanas (Sevilla). No es la web oficial del
salón ni está afiliada a él.

Una sola página pública en `/`. La investigación interna está en
`docs/INTERNAL_AUDIT.md` y las notas de fotos en
`public/assets/peluqueria-estetica-los-angeles/README_ASSETS.md` (los `.md`
nunca se sirven: `next.config.ts` los reescribe a 404).

## Preview

**URL:** https://los-angeles-web-preview.up.railway.app

Railway, proyecto aislado `los-angeles-peluqueria-demo` (servicio `los-angeles-web`), entorno
`preview`, rama `demo/peluqueria-estetica-los-angeles`, directorio raíz
`/demos/peluqueria-estetica-los-angeles`. Sin dominio propio ni producción.

## Stack

Next.js 16 (App Router, estático) + React 19 + CSS propio. Sin librerías de UI
ni de animación, sin analytics, sin píxeles, sin cookies. Fuentes autoalojadas
(Anton, Instrument Serif, Figtree; licencias OFL en `src/app/fonts/`).

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
npm start          # usa PORT si existe (Railway)
```

## Dirección visual: «carta de color»

Salón urbano con personalidad, no spa. Asfalto, papel frío y un bermellón solo
para la acción. Titulares de cartel (Anton) con un acento en itálica serif.
Sin fotos propias disponibles, el motivo es un abanico de mechones en SVG que
muestra qué hace cada técnica (antes, coloración, mechas, balayage), rotulado
como ilustración.

Movimiento: entrada única del hero (líneas que suben, mechones que caen
escalonados), mechones que cambian de color con `stop-color` y un escalonado de
22 ms, hoja de cita con curva de cajón y salida más corta que la entrada,
botones que ceden a `scale(0.97)`. Solo `transform`, `opacity` y colores; hover
solo con puntero fino; `prefers-reduced-motion` lo desactiva.

## Privacidad

- `robots.txt` bloquea todo, meta `noindex, nofollow` y cabecera `X-Robots-Tag`.
- La hoja «Pide tu cita» no envía datos: prepara la frase y llama al salón.
- WhatsApp desactivado (`whatsappEnabled` en `src/content/salon.ts`) hasta que
  el salón lo confirme.
- Barra superior y pie identifican la página como propuesta no oficial.
- Sin mapa incrustado: enlace «Cómo llegar».

## Contenido

Todo en `src/content/salon.ts`. Solo servicios con fuente pública.
