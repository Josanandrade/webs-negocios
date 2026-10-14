# Marta Benítez · Belleza & Barbería — auditoría interna

> Documento interno. **No se despliega**: vive fuera de `public/` y de `src/app/`, así que no genera ruta. Además `scripts/postbuild.mjs` borra cualquier `.md` de la exportación y falla el build si aparece contenido interno en `out/`.

Fecha de investigación: 14/10/2026.

## Limitaciones

La red del entorno bloquea Instagram, Facebook, Threads, Google Maps, `*.negocio.site`, `*.firebaseapp.com` (vía `curl`), Booksy (vía `curl`) y la prensa local (vía `curl`). Se usaron el buscador y un lector web que sí alcanzó Booksy, la landing de Firebase, *Periódico La Semana* y varios directorios. **No se ha podido abrir la ficha de Google Business ni el perfil de Instagram/Facebook**, ni descargar ninguna imagen.

## 1. Presencia digital encontrada

| Canal | Estado | Fuente |
|---|---|---|
| `salon-de-belleza-marta-benitez.negocio.site` | **Caído.** Es la «web» que enlazan los directorios (mariospeluqueros.es). Google cerró los sitios de Perfil de Empresa en 2024; la URL ya no responde (error del cliente al leerla). | mariospeluqueros.es |
| `martabenitez-landing.firebaseapp.com` | **Obsoleta.** Gatsby 2.19, «© 2020 Marta Benitez · Estética avanzada». Una sola pantalla de contacto: logo, dirección, dos teléfonos, email, enlace a WhatsApp, Facebook e Instagram. Sin servicios, sin precios, sin horario, sin reserva, sin fotos. No es una web moderna funcional. | lector web |
| Booksy | **Activa.** Canal de reserva online real. 4,6 ★ con 106 reseñas (95 de 5★, 2 de 4★, 9 de 1★). Carta con precios. | https://booksy.com/es-es/129298_salon-de-belleza-marta-benitez_peluqueria_29946_dos-hermanas |
| Google Business | Existe (directorios la copian): 4,7 con 66 reseñas (solymas.es) o 4,6 con 65 (mariospeluqueros.es). ⚠️ No verificado directamente. | solymas.es, mariospeluqueros.es |
| Instagram | `@salondebellezamartabenitez` (enlazado desde su propia landing y ComercioSevilla). Contenido no accesible. | — |
| Facebook | `facebook.com/SalondeBellezaMB` (enlazado desde su landing). Contenido no accesible. | — |
| Threads | `@salondebellezamartabenitez` existe. | buscador |
| Prensa | *Periódico La Semana* (2016, inauguración) y *Cadena DH* (26/09/2019, «Belleza para ella y él en el Salón de Belleza Marta Benítez»; el texto no se pudo leer). | periodicolasemana.es, cadenadh.com |

**Conclusión: prospecto válido.** No tiene web propia moderna. La URL que aparece en directorios es un `negocio.site` muerto y la única página propia es una tarjeta de contacto de 2020. Quien la busca termina en Booksy o en agregadores con datos contradictorios.

## 2. Datos usados en la demo

| Dato | Valor | Confianza |
|---|---|---|
| Nombre comercial | Salón de belleza Marta Benítez & Barbería especializada | Alta (Google vía directorios, Booksy, landing) |
| Dirección | C/ Alarcón, 7, Local A, esquina C/ Zurbarán, 41701 Dos Hermanas | Alta (Booksy, landing, prensa 2016) |
| Teléfono fijo | 854 70 58 94 | Alta (landing, directorios) |
| WhatsApp | 654 42 06 22 | Alta: su propia landing enlaza `api.whatsapp.com/send?phone=34654420622` |
| Email | salondebellezamb@gmail.com | Alta (landing) |
| Reserva | Booksy (enlace anterior) | Alta |
| Horario | L 17:00–20:30 · M–V 10:00–13:30 y 17:00–20:30 · S 9:00–14:00 · D cerrado | Media ⚠️ (Google vía solymas.es). Booksy mostraba hoy, miércoles, 10:00–13:30 / 17:30–21:00. Prensa 2016: otro horario (obsoleto). **Confirmar con el negocio.** |
| Valoración | 4,6 ★ · 106 reseñas en Booksy | Alta (leída hoy) |
| Fundación | Diciembre de 2016 | Alta (prensa) |
| Formación de Marta | Estética, maquillaje profesional, técnico de láser IPL y diodo | Media (prensa 2016) |
| Accesibilidad / pagos | Entrada accesible, tarjeta y pago móvil | Media (Google vía dos directorios) |

## 3. Áreas reales del negocio

Descripción del propio negocio en Booksy: *«Depilación láser, eliminación de tatuajes, micropigmentación, estética, uñas, peluquería de señora y barbería especializada.»*

- **Peluquería de señora** (17 servicios en Booksy): corte, corte de niña, flequillo, peinados, tinte, mechas, contorno, matizadores, Olaplex, alisados, permanente, recogidos y semirrecogidos.
- **Barbería**: forma parte del nombre comercial y de las categorías de Google. **En Booksy no hay ningún servicio de barbería con precio**; solo consta «Corte caballero» en una reseña. Servicios masculinos sí listados: depilación hombre (axilas, brazos, espalda, pecho, piernas), cejas hombre y perfilado de barba con láser.
- **Estética** (27 servicios): cejas (hilo, henna, laminado), lifting de pestañas, manicura, esmalte permanente, pedicura, higiene facial, punta de diamante, Probiome Peel, depilación con cera.
- **Láser y técnica**: depilación láser médica por zonas, eliminación de tatuajes, micropigmentación.
- **Maquillaje**: maquillaje permanente y profesional en la prensa de 2016; no aparece en Booksy. No se publica como servicio.

**Posicionamiento real:** un salón de barrio de servicio completo «para ella y para él» con una base técnica poco habitual (láser médico, tatuajes, micropigmentación). La demo lo cuenta así: cuatro puertas (Cabello, Barbería, Estética, Láser) en lugar de una lista única.

## 4. Concepto visual: «Doble ancho»

- Una sola familia tipográfica, **Archivo variable**, usada en dos extremos de su eje de anchura: estrecha y negra (62) frente a ancha y ligera (125). Es la metáfora de marca: una sola casa, dos registros, sin recurrir a femenino/masculino.
- Dos superficies, **tinta** (#141414) y **cal** (#ECE8E1), con un **corte vertical** pistacho que atraviesa el titular: la palabra cambia de color al cruzarlo (dos copias recortadas con `clip-path`).
- Un único acento, **pistacho** (#C9D86A), solo para lo accionable.
- Las áreas se alternan tinta/cal en damero, no por género.
- Hero: «Corte. Barba. Piel. Láser.» comunica en cuatro palabras que es más que una peluquería.

### Por qué no se parece a las demás demos

| Demo | Lo suyo | Aquí |
|---|---|---|
| Helena García | Leche, cereza y lila; Bricolage | Sin rosa ni rojo; Archivo de anchura variable |
| Evelyn | Porcelana fría, cobalto, Instrument Serif, «estudio de luz» | Sin serif, contraste tinta/cal duro, corte gráfico |
| Pura Bellezza | Rubor y baya, Bodoni | Sin serif, sin pasteles |
| Jalis | Bosque, marfil y vino, Bodoni | Sin verde oscuro ni vino |
| MG&I | Boutique | Sistema gráfico, no boutique |
| Los Ángeles (en paralelo) | Urbano, fotográfico, energía | Tipográfico y de índice, sin fotos a sangre |
| La Pelu de Maca (en paralelo) | Cálida, personal, de autora | Fría, gráfica, de estudio |

Evitado: rosa/azul, bigotes, tijeras, poste de barbero, negro y dorado.

## 5. Fotografía

No se ha descargado ni usado **ninguna** foto: los dominios con material propio están bloqueados. No hay stock. Los huecos de imagen son **paneles tipográficos** (pistacho con una palabra recortada) que no fingen ser fotos. Para sustituirlos: añadir entradas en `photos` de `src/content/site.ts`. Lista de fotos a pedir en `public/assets/marta-benitez-belleza-barberia/README_ASSETS.md`.

## 6. Información descartada

- **Precios de láser**: la tabla de Booksy está desalineada (cada zona muestra el precio de otra). Se publican las zonas sin precio.
- **Servicios «incremento» (1 €) y «sorteo» (2 €)** de Booksy: no son servicios.
- **Barbería con precios, arreglo de barba, afeitado, degradados**: no constan. Solo «Corte caballero» (reseña) y «Perfilado de barba con láser» (zona de láser). ComercioSevilla dice «cortes y afeitados» pero es texto genérico de agregador.
- **Equipo**: Silvia y Julián aparecen en reseñas sin rol; Nazaret Ortiz (estilista) es de 2016 y puede no seguir. No se nombra a nadie salvo Marta.
- **Maquillaje permanente/profesional, uñas esculpidas, masaje, extensiones**: solo en la prensa de 2016; no están en la carta actual.
- **Nota de Google (4,6–4,7, 65–66 reseñas)**: no verificada; se usa la de Booksy.
- **Reseñas negativas** (Booksy 9 de 1★; Google dos de 1★ sobre cejas y uñas): no se publican; se mencionan aquí para preparar la conversación comercial.
- **Horario de Booksy y de la prensa**: contradicen al de Google; ver tabla.
- **Reseñas citadas**: se corrigieron tildes y espacios («muchísimas», «sobre todo»); el resto es literal.
- **Logo**: la landing tiene logo, pero no se pudo descargar. Se usa un logotipo tipográfico provisional.

## 7. Privacidad

- `noindex, nofollow` en meta, cabecera `X-Robots-Tag` (serve.json) y `robots.txt` con `Disallow: /`.
- Sin analytics, cookies, píxeles, mapas incrustados ni fuentes externas: 0 peticiones a terceros al cargar.
- Sin sistema de reservas propio: los botones llevan a su Booksy real, a su WhatsApp y a su teléfono.
- Sin JSON-LD ni sitemap.

## 8. QA (14/10/2026)

- `npm run build`, `npm run lint`, `npm run typecheck`: OK. Postbuild: «exportación pública limpia».
- Playwright/Chromium en 375 px, iPhone 13, Pixel 7, 820, 1100, 1280, 1440 y 1920: sin overflow horizontal, consola limpia, 0 peticiones externas.
- axe-core (WCAG 2.1 AA + best practices): 0 violaciones en los 8 tamaños.
- `prefers-reduced-motion: reduce`: 0 animaciones activas.
- Interacción: accesos de portada abren su pestaña y llevan a la carta; flechas, Inicio y Fin en las pestañas; enlaces directos `#laser`; «Ver los N» expande; barra móvil aparece al dejar la portada y se esconde en «Visítanos».
- Rendimiento (Pixel 7, 4G lento + CPU ×4): LCP ≈ 2,1 s, CLS 0, ~247 KB transferidos en 9 peticiones.
- Revisión de movimiento con criterios de Emil Kowalski (las skills no están instaladas en este entorno; se aplicaron sus criterios): un único momento orquestado al cargar (titular por líneas + corte), resto solo como respuesta; solo `transform`/`opacity`; curvas ease-out propias; UI ≤ 280 ms; `:active` con escala 0,97; hover solo con puntero fino; nada animado al cambiar de pestaña con teclado más allá de un fundido de 200 ms; transición de `padding` sustituida por color.
