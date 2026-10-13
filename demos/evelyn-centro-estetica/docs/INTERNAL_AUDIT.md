# Evelyn Centro de Estética — auditoría interna

> Documento interno. **No se despliega**: vive fuera de `public/` y fuera de `src/app/`, por lo que no genera ruta. El script `scripts/postbuild.mjs` además falla el build si aparece contenido interno en `out/`.

Fecha de investigación: 13/10/2026.

## Limitaciones de la investigación

El entorno de trabajo solo tenía acceso a un buscador web. Las conexiones directas a Fresha, Facebook, Instagram, Google Maps, Treatwell, Booksy y `*.negocio.site` fueron **bloqueadas por la política de red** (403 en el proxy). Todo lo de abajo procede de los extractos indexados por el buscador. Antes de enseñar la demo conviene abrir a mano la ficha de Fresha y Google Maps y confirmar los datos marcados con ⚠️.

## Presencia digital actual

| Canal | Estado | Fuente |
|---|---|---|
| Web propia | **No encontrada** | Búsquedas por nombre, teléfono y dirección |
| `negocio.site` / `business.site` | **No encontrada.** Google cerró los sitios de Perfil de Empresa en marzo de 2024 (redirección hasta junio de 2024), así que aunque existiera ya no está en línea | Búsqueda + cierre del producto de Google |
| Fresha | **Activa.** Canal principal de reserva en línea. Valoración mostrada 5,0 (nº de reseñas no visible en los extractos) | https://www.fresha.com/lvp/evelyn-centro-de-estetica-avenida-de-pino-montano-sevilla-JQwaR6 |
| Facebook | Página "Evelyn centro de estética" (slug `janelynpeluqueriayestetica`), ~94 «me gusta». El slug sugiere un nombre anterior (peluquería y estética) | https://www.facebook.com/janelynpeluqueriayestetica/ |
| Instagram | **No encontrado.** La cuenta `@centrodeesteticaevelyna` es de *Evelyn Aguas*, en Sevilla la Nueva (Madrid): **otro negocio**, descartada | — |
| TikTok | No encontrado | — |
| Booksy / Treatwell | No encontrado para Sevilla (los resultados de Treatwell son de *Evelyn Aliques*, Viladecans: otro negocio) | — |
| Directorios | `spa.massage.ivof.com`, `beauty.es.wwwcafe.de` (agregadores de baja calidad, horarios contradictorios) | — |

**Conclusión comercial:** el negocio no tiene web propia. Su presencia se reduce a la ficha de Fresha, una página de Facebook pequeña y agregadores con datos que se contradicen (horarios distintos, número de portal 3 vs 12). Cualquiera que la busque por Google aterriza en terceros. La demo le enseña lo que sería tener un sitio propio, con su carta ordenada, su horario correcto y la reserva a un toque.

## Datos usados en la demo

| Dato | Valor | Confianza |
|---|---|---|
| Nombre | Evelyn Centro de Estética | Alta (Fresha, Facebook) |
| Dirección | Av. de Pino Montano, 3, 41008 Sevilla | Media ⚠️: algún listado indica «Pino Montano, 12» |
| Teléfono | +34 623 42 94 64 | Alta (Fresha + directorios) |
| Reserva | Fresha (enlace anterior) | Alta |
| Horario | L 10:30–18:30 · M 10:30–19:30 · S 10:30–14:00 · D cerrado (Fresha) | Media ⚠️ |
| Horario X/J/V | X 10:30–18:30, J y V 10:30–19:30 | **Inferido** ⚠️: Fresha agrupa «lunes, miércoles y sábado más cortos; martes, jueves y viernes hasta 19:30». La hora de apertura de X/J/V se asume 10:30 |

## Servicios confirmados (ficha de Fresha)

- Facial · Acne Facial · Chemical Peel · Dermaplaning · Facial Extractions · Men's Facial → grupo **Facial** (6)
- Body Sculpting · Back Massage → grupo **Corporal** (2)
- Threading → grupo **Cejas** (1)
- Makeup Service → grupo **Maquillaje** (1)

Las descripciones de la demo son genéricas y no prometen resultados. No se nombra maquinaria ni marcas: no hay datos.

## Datos descartados

- **Precios**: solo aparecen medias de categoría de Fresha para toda Sevilla (p. ej. «desde 8 €»), no precios propios. No se muestran.
- **Cejas con tinte / lifting de pestañas (6 € / 25 €)**: aparecen en una página de categoría del barrio sin atribución clara a Evelyn.
- **Sede en Mairena del Aljarafe** (extracciones, remodelación, celulitis, hilo): no se puede confirmar que sea el mismo negocio.
- **Horario 11:00–20:00 todos los días** (agregador spa) y **10:00–20:00 L–S** (otro directorio): contradicen a Fresha.
- **Reseñas de texto** («puntual», «limpio», «llevo años viniendo»): proceden de un agregador no fiable; no se publican. Tampoco se muestra la nota 5,0 al no conocerse el número de reseñas.
- **Profesionales**: no hay nombres ni perfiles verificados. No se presenta a «Evelyn» como persona.
- **Años de experiencia, formación, titulaciones**: sin datos.
- **WhatsApp**: el número es móvil, pero no consta que use WhatsApp Business. La demo usa solo llamada + Fresha. Si se confirma, añadir en `src/content/site.ts`.
- **Logo**: no localizado. Se usa un logotipo tipográfico provisional («Evelyn» en Instrument Serif).
- Instagram `@centrodeesteticaevelyna`, Treatwell «Evelyn Aliques», Booksy «Evelyn Aguas»: otros negocios.

## Fotografía

No se ha podido descargar ninguna foto (dominios bloqueados) y no se ha verificado material propio. Ver `public/assets/evelyn-centro-estetica/README_ASSETS.md`. La demo usa paneles de luz abstractos (CSS) que no fingen ser fotos del centro; cuando haya fotos se sustituyen desde `photos` en `src/content/site.ts` sin tocar el diseño.

## Concepto visual

**«Estudio de luz»**: porcelana fría (#F2F3F1), grafito (#1C1D20), piedra (#5F6166), niebla (#D9DBD7) y un único acento **cobalto** (#2435B0) para todo lo accionable. Tipografía Instrument Serif (titulares, condensada y editorial) + Hanken Grotesk (texto). Mucho aire, reglas finas, carta de tratamientos como índice tipográfico.

Por qué es diferente a MG&I, Pura Bellezza, Helena y Jalis: no hay beige, rosa ni dorado; la paleta es fría y neutra, el acento es azul (poco habitual en estética, lo aleja de lo «cursi» y de lo clínico a la vez, porque se combina con serif editorial y grano fotográfico). Composición de estudio: un panel vertical de luz como «foto» principal, firma tipográfica grande y la carta como índice.

Motion: un solo momento orquestado al cargar (titular que sube por líneas, luz que se asienta, firma). El resto solo responde a acciones (menú, pulsación de botones, barra móvil que aparece al pasar la portada). Todo se desactiva con `prefers-reduced-motion`.

## Privacidad

- `noindex, nofollow` en meta + cabecera `X-Robots-Tag` (serve.json) + `robots.txt` con `Disallow: /`.
- Sin analytics, sin cookies, sin fuentes de Google (autoalojadas), sin mapas embebidos: cero peticiones a terceros al cargar.
- Sin sistema de reservas propio: los botones llevan a su ficha real de Fresha o al teléfono.
- Sin JSON-LD ni sitemap, para no competir con sus fichas reales.

## QA (13/10/2026)

- `npm run build`, `npm run lint`, `npm run typecheck`: OK.
- Capturas en 375 px, iPhone 13, Pixel 7, 820 px y 1440 px: sin overflow horizontal, consola limpia.
- axe-core (WCAG 2.1 AA + best practices): 0 violaciones en escritorio y móvil.
- `prefers-reduced-motion: reduce`: 0 animaciones activas.
- LCP local ~0,1 s; ~240 KB transferidos en total (sin comprimir), 0 peticiones externas.
