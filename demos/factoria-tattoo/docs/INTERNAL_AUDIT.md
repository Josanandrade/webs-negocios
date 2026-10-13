# Factoría Tattoo · Auditoría interna (NO PUBLICAR)

> Documento interno de AvanttAI. No forma parte del build (`dist/`) ni se sirve
> en la preview. No enlazar desde la web.

Fecha de investigación: 13/10/2026.
Contexto: demo comercial **no solicitada** por el negocio.

## Limitaciones de la investigación

El entorno de trabajo no permite abrir directamente linktr.ee, instagram.com,
google.com ni los directorios (bloqueo de red). Toda la información procede de
**resultados indexados de buscador** (títulos, descripciones y extractos de
página). Antes de enseñar la demo conviene revisar a mano Linktree, Instagram y
la ficha de Google.

## 1. Canales oficiales localizados

| Canal | URL | Estado |
|---|---|---|
| Linktree | https://linktr.ee/factoriatattoo_ | Facilitado en el brief. Contenido no legible desde el entorno |
| Instagram del estudio | https://www.instagram.com/factoriatattoo_/ | Confirmado. Nombre: "FACTORIA • TATTOO SEVILLA". ~3.482 seguidores, ~111 publicaciones |
| Bio de Instagram | Diseños exclusivos, todos los estilos, tel. 604902057, "C/ Balbino Marrón, 3 \| Av. Andalucía, 10", "Pide tu cita por aquí" (→ Linktree) | Confirmado vía extracto indexado |
| Teléfono | 604 90 20 57 (+34 604 90 20 57) | Confirmado (bio IG + varios directorios) |
| Instagram de Sebas Pérez | https://www.instagram.com/inkieto_tattoo/ (también @inkieto.tattooer) | Confirmado: se presenta como co-propietario de Factoría Tattoo, neotradicional |
| Facebook de Inkieto | https://www.facebook.com/inkieto.tattoo/ | Localizado |
| Fresha | https://www.fresha.com/lvp/factoria-tattoo-avenida-de-andalucia-sevilla-Bo0BD3 | Ficha de terceros ("lvp" = listado, no necesariamente gestionado por el estudio) |
| WhatsApp | — | **No confirmado.** Probablemente el link "Pide tu cita" del Linktree, pero no verificable |
| Google Business | — | No se pudo abrir la ficha. Los directorios citan valoraciones de Google |

## 2. ¿Web corporativa propia?

**No se ha localizado.** Ningún resultado devuelve dominio propio. Todos los
directorios remiten a Instagram. Presencia = Instagram + Linktree + fichas de
directorios (Fresha, Cylex, Dónde Tatuarme, Tatuadoresen, oopiniones…).

## 3. Artistas

| Nombre | Fuente | Estilo | Nivel | ¿Publicado en la demo? |
|---|---|---|---|---|
| **Sebas Pérez, "Inkieto"** | Su propio Instagram: "co-propietario de Factoría Tattoo", neotradicional | Neotradicional | **Verificado** | Sí |
| Juanxo (@juanxotattoo?) | Reseña en Wanderboat y agregador tatuadoresen ("desde Claudia hasta Juanxo") | Una nota de un proveedor (cnc-tattoo) habla de color; fuente débil | Indicio | **No** |
| Claudia | Reseñas en agregador (~590 días) | Desconocido | Indicio | **No** |
| Fredo | Reseña en oopiniones | Desconocido. Los perfiles @fredo.ink / @fredo_ink NO parecen ser él (Colombia/EE. UU.) | Indicio | **No** |

Acción: pedir al estudio el roster actual con estilo + Instagram de cada artista.
El sistema (`src/data.ts` → `artists` y `styles[].artistId`) está preparado
para añadirlos: cada artista nuevo aparece automáticamente en el buscador, el
índice de estilos, el equipo, el portfolio y el mensaje de consulta.

## 4. Estilos

Fuente: texto del propio estudio en Dónde Tatuarme: *"un estudio lleno de
diferentes artistas, cada uno especializado en un estilo diferente…
Neotradicional, Tradicional, Fine line, Realismo y más!!!"* + bio IG "todos
los estilos".

Publicados: Neotradicional, Tradicional, Fine line, Realismo + "Otro estilo".
Solo Neotradicional tiene artista nominal asignado (Inkieto).

## 5. Servicios

| Servicio | Evidencia | Decisión |
|---|---|---|
| Tatuaje | Todas las fuentes | Publicado |
| Piercing | Cylex "Tatuajes y Piercings"; Fresha "Body piercing" con precios desde 30 €; Katozz Piercing listado en C/ Balbino Marrón 3 (misma dirección que la bio) | Publicado solo en FAQ ("Sí, consulta disponibilidad"), sin precios. **Confirmar** |
| Eliminación de tatuajes | Solo etiqueta de categoría en Fresha | **Descartado** |
| Micropigmentación / maquillaje permanente | Solo etiqueta de categoría en Fresha / Katozz | **Descartado** |

## 6. Ubicaciones

| Dirección | Fuente | Estado |
|---|---|---|
| Av. de Andalucía, 10 · 41005 Sevilla | Bio IG + Fresha + Cylex + Dónde Tatuarme + Tatuadoresen | Verificada |
| C/ Balbino Marrón, 3 · 41018 Sevilla | Bio IG | Publicada como segunda dirección. **Confirmar** relación (¿segundo local? ¿piercing/Katozz?). Un agregador cita "nº 16" en Av. Andalucía: descartado |

## 7. Horarios

Contradictorios: Fresha L–V 10:00–21:00, S 10:00–14:00; Cylex cierre 20:00 L–V;
domingo cerrado en todas. **No publicados.** La web dice "Se trabaja con cita
previa. Escríbenos para confirmar horario."

## 8. Reseñas

| Fuente | Valoración |
|---|---|
| Dónde Tatuarme | 5,0 · 252 valoraciones |
| Cylex | 5/5 · 217 opiniones |
| Fresha | 4,9 · 442 votos |
| piercings.com.es | 5,0 · 147 opiniones |
| oopiniones | 5/5 · 9 reseñas |

Tono: trato profesional, limpieza, diseños. **No publicadas** (cifras
contradictorias y de terceros). Propuesta: integrar valoración de Google
cuando el estudio la confirme.

## 9. Identidad gráfica

- Nombre en IG con tipografía **sans bold italic** (𝙁𝘼𝘾𝙏𝙊𝙍𝙄𝘼 • 𝙏𝘼𝙏𝙏𝙊𝙊 𝙎𝙀𝙑𝙄𝙇𝙇𝘼).
- No se ha podido descargar logotipo ni avatar.
- Concepto de la demo: "stencil". Papel blanco, tinta negra y el violeta del
  papel de transfer térmico con el que se calca el diseño en la piel. Archivo
  variable (ancho expandido + itálica) para replicar el tono del nombre en IG.
  El wordmark del hero tiene una copia violeta descolocada (el calco bajo la
  tinta) que se "imprime" una sola vez al cargar.

## 10. Datos descartados

- Eliminación de tatuajes y micropigmentación (solo categorías de Fresha).
- Horarios (contradictorios).
- Cifras de reseñas y "más de 10 años de experiencia" (texto promocional en directorio).
- Nombres Juanxo, Claudia, Fredo (no confirmados como plantilla actual).
- Precios de piercing (Fresha, antigüedad ~540 días).
- Handle alternativo `instagram.com/factoriatattoo` (sin guion bajo) citado por un directorio.
- Dirección "Av. de Andalucía 16".
- WhatsApp (no confirmado; `studio.whatsapp` = null en `src/data.ts`).

## 11. Pendiente de validar con el estudio

1. Roster de artistas con estilo e Instagram.
2. Fotos reales del portfolio por artista (ver `public/assets/factoria-tattoo/README_ASSETS.md`).
3. Número de WhatsApp de citas.
4. Papel de C/ Balbino Marrón 3.
5. Horario.
6. Piercing: servicio propio o colaborador.
7. Logotipo en vectorial.

## Fuentes

- https://www.instagram.com/factoriatattoo_/
- https://www.instagram.com/inkieto_tattoo/
- https://www.facebook.com/inkieto.tattoo/
- https://www.fresha.com/lvp/factoria-tattoo-avenida-de-andalucia-sevilla-Bo0BD3
- https://www.cylex.es/sevilla/factor%C3%ADa-tattoo-14254146.html
- https://dondetatuarme.es/andalucia/sevilla/sevilla/factoria-tattoo/
- https://tatuadoresen.com/factoria-tattoo-sevilla/
- https://piercings.com.es/sevilla/opiniones-factoria-tattoo/
- https://oopiniones.com/tatuajes-sevilla-factoria-tattoo-434588
- https://wanderboat.ai/local-businesses/spain/seville/factor%C3%ADa-tattoo/Mdac4QrnRXqv-oQxnjKvQg
- https://www.cnc-tattoo.com/news/juanxotattoo-189764.html (fuente débil)
