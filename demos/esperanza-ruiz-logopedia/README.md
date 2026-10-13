# Centro de Logopedia Esperanza Ruiz — Demo comercial privada

Propuesta de rediseño **no encargada** para el Centro de Logopedia Esperanza
Ruiz (Paseo de las Delicias 1, Sevilla). No sustituye ni enlaza como propia a la
web oficial (https://www.esperanzaruizlogopedia.com/).

**Stack:** Next.js 16 (App Router, 100 % estática) · TypeScript · Tailwind 4 ·
fuentes autoalojadas. Sin backend, sin cookies, sin analítica, sin píxeles.

## Privacidad de la demo

- `<meta name="robots" content="noindex, nofollow, nocache">` + `googlebot` sin snippet ni imágenes.
- Cabecera `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet, noimageindex` en todas las rutas (`next.config.ts`).
- `robots.txt` → `Disallow: /`. Sin `sitemap`.
- Pie de página: "Propuesta de diseño privada… No es la web oficial del centro".
- Enlaces externos (Google, web oficial) con `rel="noopener noreferrer nofollow"`.

## Estructura

```text
src/
  app/            layout (metadata, fuentes), page (todas las secciones), OG image, robots
  components/     Header + menú móvil, MobileCta, AudienceCards, AreaExplorer,
                  ContactForm, PhotoSlot (foto real ↔ composición), Wave, Wordmark
  lib/site.ts     TODOS los datos del negocio y textos de servicios (fuente única)
  lib/photos.ts   huecos de fotografía (null = composición de identidad)
public/assets/esperanza-ruiz-logopedia/README_ASSETS.md   qué pedir al negocio
```

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint
npm run typecheck
```

## Preview (Railway, igual que el resto de demos)

Servicio independiente conectado a este repo con *Root Directory* =
`demos/esperanza-ruiz-logopedia` y rama `demo/esperanza-ruiz-logopedia`.
Build `npm run build`, start `npm start` (usa `PORT`). Variable opcional
`SITE_URL` (si no, se usa `RAILWAY_PUBLIC_DOMAIN`) para la imagen OG.
No asignar dominio propio: usar el `*.up.railway.app` generado.

## Formulario de cita

No hay servidor: valida en cliente y abre el correo del visitante con el
mensaje preparado para `esperanzaruiz78@gmail.com`. No se almacena nada. Si el
centro pasa a cliente, se conecta a un envío real (Resend o similar) sin cambiar
la interfaz.

## Fuentes de los datos (verificados en octubre de 2026)

| Dato | Fuente |
|---|---|
| Nombre, servicios (habla, comprensión/expresión, anomalías dento-faciales y ortodoncia, daño neurológico, alimentación, voz) | Web oficial (home y subpáginas `/dano-neurologico`, `/alteracion-de-la-alimentacion`) |
| Daño neurológico: afasias, disartrias, Parkinson, ELA, ictus | Web oficial `/dano-neurologico` |
| Alimentación: masticación y deglución atípica | Web oficial `/alteracion-de-la-alimentacion` |
| Esperanza Ruiz Naranjo, colegiada nº 29/1210 | Web oficial + Doctoralia |
| Edificio Cristina, Paseo de las Delicias 1, 41001 | Web oficial + directorios |
| Junto a Puerta Jerez, Metro y parking | Web oficial `/contacto` |
| Teléfono 625 903 387 · esperanzaruiz78@gmail.com | Web oficial `/contacto` |
| Atención privada | Doctoralia ("solo acepta pacientes privados") |
| Valoración 5,0 | Coincidente en varios directorios (milogopeda.es, mejoresdesevilla.com, places.leadset.ai) |
| Temas de reseñas (trato, eficacia, familias, flexibilidad) | Resúmenes de reseñas públicas en directorios; sin citas literales |

## Datos dudosos que NO se usan

- **Número de reseñas**: 69 en un directorio, 21 en otro, 35 en un tercero → no se muestra recuento.
- **Horario**: un perfil de terceros (ueniweb) dice L–V 9:00–21:00; Doctoralia dice que no lo ha indicado → no se publica horario.
- **Sesiones online**: la web oficial las reforzó por el COVID-19; Doctoralia dice que no ofrece consulta online → solo "puede valorarse, pregúntanos".
- **Autismo/TEA**: aparece en Doctoralia pero no en la web oficial → no se anuncia.
- **Terapia miofuncional** (como término): no aparece literalmente → se habla de "boca, lengua y ortodoncia / deglución atípica", que sí está publicado.
- **Equipo**: la web habla de "logopedas colegiados" en plural, pero no nombra a nadie más → solo se presenta a Esperanza.
- **Años de experiencia, formación, titulaciones**: no publicados → no se inventan.
- **Castilleja de Guzmán**: un directorio la sitúa allí sin dirección → se ignora.
- **WhatsApp**: el teléfono es móvil, pero no consta como canal oficial → no hay botón de WhatsApp.
- Perfiles homónimos (una neuropsicóloga, una investigadora, una actriz "Esperanza Ruiz") → descartados.

Los textos del proceso de trabajo ("Cómo trabajamos") son redacción comercial
genérica basada en "pruebas, diagnósticos y tratamientos" de la web oficial;
conviene validarlos con Esperanza antes de publicar.
