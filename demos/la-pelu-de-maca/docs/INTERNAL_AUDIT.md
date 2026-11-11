# INTERNO · Auditoría — La Pelu de Maca (Dos Hermanas)

> Documento interno de AvanttAI. **No forma parte de la web**: vive fuera de
> `src/app` y de `public/`, así que Next.js no lo sirve (comprobado: 404).
> No enlazar desde la demo ni enviarlo al salón.

Revisión: 14 de octubre de 2026. Demo **no encargada** por el negocio.

## 1. Comprobación de necesidad

| Pregunta | Resultado | Cómo se comprobó |
| --- | --- | --- |
| ¿Sigue usando `lapeludemaca.negocio.site`? | **No puede**: Google cerró las webs de Perfil de Empresa (`business.site` / `negocio.site`) en marzo de 2024 y la redirección al perfil terminó el 10 de junio de 2024; desde entonces dan "página no encontrada". | TechRadar y otras fuentes sobre el cierre. El dominio no se pudo abrir desde el entorno (proxy bloquea `negocio.site`). |
| ¿Dominio propio? | No localizado. Ningún directorio enlaza web propia (Volumus: "solo Google Maps"). | Búsquedas por nombre, teléfono y dirección. `lapeludemaca.com/.es` no comprobables (bloqueados por el proxy). |
| ¿Otra web moderna? | No localizada. | Búsquedas web. |
| Redes | Instagram **@lodemaca.pelu** ("La pelu de Maca✨️✂️") y Facebook `lodemaca.pelu` ("Lo Maca") + perfil "La pelu de Maca" (id 100048914605862). | Solo títulos en buscador: Instagram y Facebook bloquean la lectura (robots). **No verificado** que sean de este salón (nombre coincide; ubicación no visible). |
| Booksy / Fresha / Treatwell | No aparece en Booksy Dos Hermanas (páginas 1–2 revisadas) ni en búsquedas de Fresha/Treatwell. | WebFetch Booksy + búsquedas. |
| WhatsApp | Sin evidencia. El teléfono es fijo (954…), no sirve para WhatsApp. | — |
| Canal de reserva actual | **Teléfono** (fijo). Posible DM de Instagram, sin confirmar. | — |

**Conclusión:** necesidad real. Sin web operativa desde 2024; la presencia
depende de Google Maps, directorios y redes sin verificar.

## 2. Datos verificados (fuente única: Volumus, que copia la ficha de Google)

- **Dirección:** Av. Reyes Católicos, 1, 1B · 41702 Dos Hermanas, Sevilla.
- **Teléfono:** 954 03 45 88.
- **Horario:** L–J 9:30–13:30 y 16:30–20:30 · V 9:30–20:00 · S 9:00–14:00 · D cerrado.
- **Reputación:** 4,8 / 5 con 70 opiniones en Google (fecha de captura desconocida;
  actualizar antes de enseñar).
- **Equipo:** Maca (dueña; "Macarena" en una reseña, se asume la misma persona
  — Maca es diminutivo de Macarena, **inferido**), Carmen y Mari Carmen ("compis").
- **Servicios:** las reseñas citan corte, color y peinado; la ficha añade
  "cuidado capilar". No hay carta ni precios publicados.

Fuente: https://www.volumus.es/peluqueria/la-pelu-de-maca-dos-hermanas/
Otros directorios (peluqueriasdeprimera.es, peluquerialolas.es, solymas.es)
aparecen en buscador pero no se pudieron leer. mejorsevilla.com ha caducado.

## 3. Reseñas usadas (fragmentos públicos de Google vía Volumus, sin autora)

1. «La mejor peluquería. Dueña muy simpática, cuando vas, repites seguro por lo acogedoras que son. Risas aseguradas» → origen del hero.
2. «Maca y si [su] equipo al completo son únicas. No sólo te peinan, dan color o cortan con muchísimo estilo,…» (cortada; se corrige la errata "si"→"su").
3. «Macarena es una chica muy profesional, al igual que sus compis Carmen y Mari Carmen.…» (cortada).
4. «Ambiente agradable,muy buenas profesionales,calidad precio inmejorable. La mejor peluquería!!!» (se normaliza puntuación).

Pedir permiso al salón para mostrarlas y, si es posible, nombre de pila de la autora.

## 4. Descartado o no mostrado

- Precios: no hay ninguno publicado → la web dice "pregúntanos al llamar".
- Novias / eventos, estética, uñas, alisados, mechas concretas, marcas de producto: sin evidencia.
- Años de experiencia, fecha de apertura: sin evidencia ("de toda la vida" eliminado del texto).
- WhatsApp y reserva online: sin evidencia → solo llamada.
- Roles de Carmen y Mari Carmen (estilista, colorista…): sin evidencia → "compi".
- Fotos de Google Maps que reproduce Volumus: sin permiso, no se usan.
- Fotos de Instagram: no accesibles desde el entorno y cuenta sin verificar → no se usan.

## 5. Por qué no se parece a otras demos

- **Los Ángeles** (hilo paralelo): urbana, enérgica, centrada en la
  transformación. **Maca**: cercana, de barrio, centrada en las personas y en
  "repetir"; sin antes/después, sin negro dominante, sin ritmo agresivo.
- **Helena García / Pura Bellezza / Evelyn / Centro Jalis**: estética de salón
  (beauty premium, editorial, serif de lujo). **Maca**: papel crema, rojo
  tomate, notas a mano (Caveat), etiquetas "Hola, soy", tarjeta de cita y
  post-its. Tipografías nuevas en el repo: Fraunces (SOFT) + Onest + Caveat.

## 6. A confirmar con el salón

1. Que @lodemaca.pelu y los Facebook sean suyos.
2. Si tienen móvil / WhatsApp y si aceptan citas por DM.
3. Servicios concretos (técnicas de color, tratamientos, novias/eventos) y precios orientativos.
4. Valoración y número de reseñas actuales.
5. Fotos del equipo, del local y de trabajos (ver `docs/README_ASSETS.md`).
6. Si Maca y Macarena son la misma persona.

## 7. QA (14/10/2026)

- `npm run build`, `npm run lint`, `npm run typecheck`: limpios.
- Playwright (Chromium): 1440 px, 320 px, 375 px, iPhone 13, Pixel 7 y
  `prefers-reduced-motion`: sin overflow horizontal, sin errores ni avisos de consola.
- axe-core: 0 violaciones en todas las vistas.
- Lighthouse móvil (simulado): rendimiento 92, accesibilidad 100, buenas
  prácticas 100. SEO 63 por `noindex` (intencionado). LCP 3,0 s (el H1 espera
  a Fraunces; CLS 0).
- Privacidad: `robots.txt` Disallow /, meta robots noindex, cabecera
  X-Robots-Tag, sin analytics ni píxeles ni cookies; `/docs/...` da 404.
