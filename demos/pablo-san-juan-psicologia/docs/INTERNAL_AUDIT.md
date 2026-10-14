# Pablo San Juan | Psicología — documento interno

> Uso interno. Este fichero no se despliega (vive fuera de `public/` y el `postbuild` falla si aparece contenido interno en `out/`).
> Investigación hecha el 14/10/2026.

## Resumen

La huella pública verificable es mínima. Desde este entorno **no he encontrado ninguna fuente indexada** que mencione «Pablo San Juan | Psicología», a Pablo San Juan como psicólogo en Aznalcázar ni el teléfono 618 201 313. Los tres datos que usa la web (nombre, localidad, teléfono) proceden del brief de Jose y deben confirmarse antes de enseñar la demo como «datos suyos».

## Fuentes consultadas

| Fuente | Resultado |
| --- | --- |
| Búsquedas web: «Pablo San Juan» + psicología/psicólogo + Aznalcázar/Sevilla, «Pablo Sanjuan» psicólogo, «San Juan Psicología» Aznalcázar, «618 201 313», «618201313» | Sin resultados relevantes. Solo homónimos o municipios parecidos (Alcázar de San Juan, San Juan de Aznalfarache). |
| Doctoralia, «Psicólogos en Aznalcázar» | Leída. 26 fichas, ninguna en Aznalcázar (Benacazón, Pilas y online). No aparece Pablo San Juan ni el teléfono. |
| masquemedicos.com, psicólogos en Aznalcázar | Leída. Ningún profesional en Aznalcázar; todos en Mairena, Tomares, Gines, Sevilla… No aparece. |
| Psychology Today / Psicología Hoy, El Aljarafe | Leída. No aparece ni hay nadie en Aznalcázar. |
| Revista municipal de Aznalcázar (n.º 113, febrero 2026) | Leída. No menciona psicología, a Pablo San Juan ni el teléfono. |
| LinkedIn «Pablo San Juan – Hospital San Juan Bosco» | Aparece en búsquedas; no legible (robots). **No hay nada que lo relacione** con Aznalcázar ni con la psicología: descartado. |
| arteinformado.com «Pablo San Juan. Artista» | Homónimo, descartado. |
| Google / Google Maps, Instagram, Facebook, MundoPsicologos, Páginas Amarillas, Cylex, Infoisinfo, psicologiaymente | **Bloqueados o con error desde el entorno.** No verificados. Es probable que el brief venga de una ficha de Google Maps que no he podido abrir. |

## Datos confirmados y usados

| Dato | Base | Uso |
| --- | --- | --- |
| Marca «Pablo San Juan \| Psicología» | Brief de Jose (forma exacta con barra) | Cabecera, título, pie |
| Localidad: Aznalcázar, Sevilla | Brief | Portada, «Dónde» |
| Teléfono 618 201 313 | Brief | Botones «Llamar», ficha, preguntas |

Ninguno de los tres ha podido contrastarse con una segunda fuente independiente. **Confirmar con el propio Pablo o con su ficha de Google Maps.**

## Datos dudosos / pendientes de confirmar

- Teléfono: además, no se sabe si admite WhatsApp; por eso la web solo ofrece «Llamar».
- Dirección exacta: desconocida. La web dice que se indica al confirmar la cita y enlaza a una búsqueda de «Aznalcázar, Sevilla» en Google Maps (no a una dirección).
- Horario: desconocido. La agenda usa **horas de ejemplo** (10:00–12:00 y 16:30–19:30, lunes a viernes), marcadas como tales en la web.
- Si usa «psicólogo» o «psicólogo general sanitario» como título: no verificado; la web solo dice «psicología» / «consulta de psicología».

## Información descartada (no aparece en la web)

- Especialidades, áreas de acompañamiento, patologías, público (infantil/adultos/parejas).
- Titulaciones, n.º de colegiado, años de experiencia, orientación o metodología.
- Terapia online, visitas a domicilio, tarifas, primera consulta gratuita, formas de pago.
- Testimonios u opiniones (no se han encontrado).
- Fotografía: no hay ninguna pública utilizable. La portada usa una lámina tipográfica (monograma) en lugar de retrato.

## Contenido redactado sin atribuir características

- «Cómo trabaja» describe el **recorrido práctico** (eliges hueco → Pablo confirma por teléfono → primera conversación), no técnicas ni enfoque terapéutico. El paso «Pablo te confirma» es cómo funcionaría el sistema propuesto.
- Preguntas frecuentes: proceso de cita, cancelación (avisar por teléfono), confidencialidad como principio ético general de la profesión, y tarifas «se informan por teléfono» (sin cifras).
- Tipo de cita: «Solicitar cita» (no hay servicios verificados).

## Decisiones de diseño

- **Concepto: «perfil con nombre propio»**. Composición editorial donde el nombre es el titular: «Pablo / *San Juan*» a gran cuerpo en Petrona, y a la derecha una lámina de retrato en oliva con la P en cursiva mantequilla y «SJ», más pie de foto y texto vertical «Aznalcázar — Sevilla». La lámina reserva el lugar del retrato real: **pedirle una foto** para sustituirla.
- Paleta: hueso cálido `#F6F3EA`, tinta `#1C1E17`, oliva profundo `#3F4A26`, mantequilla `#EADF8E`. Tipos: Petrona (serif, con cursiva) + Familjen Grotesk. Ninguno se usa en otras demos del repo.
- **Diferencias con Mapi de Paz** (lino, verde bosque oscuro, ciruela, Cormorant Garamond, acuarelas, reserva en 4 pasos con vista de la consulta): sin ilustraciones ni manchas orgánicas, el profesional es el titular, reserva en una sola vista de tres columnas.
- **Diferencias con Pérez Bilbao** (tablero de letras oscuro, violeta tinta, Source Serif 4 + Mona Sans, capítulos numerados, rejilla semanal de huecos con resguardo): fondo claro, sin capítulos numerados (etiquetas con filete), calendario mensual tipo «calendario de pared» con puntos de disponibilidad por día, confirmación como nota de agenda amarilla.
- También distinta de ABEPA (añil + teja) y Maqui Martín (Newsreader + Hanken, papel/arcilla).
- Evitado: estética clínica, hojas, piedras, manos, siluetas, iconos SaaS, rejillas de tarjetas.
- Móvil: titular a 21vw, lámina apaisada, calendario de 5 columnas, horas en 3 columnas, barra fija «Llamar / Pedir cita».
- Sin peticiones a terceros (fuentes locales, sin mapa embebido, sin analytics). Único enlace externo: búsqueda de Aznalcázar en Google Maps.

## Reserva simulada

Todo en estado de React: sin `fetch`, sin almacenamiento, sin emails, sin calendarios. Días generados en el navegador (tres semanas laborables desde el lunes actual; hoy y días pasados deshabilitados). Ocupación de ejemplo determinista por fecha/hora. Avisos visibles: «Demostración: no se reserva, no se envía y no se guarda nada», casilla de aceptación y texto en la confirmación.

## Para la reunión

Confirmar: teléfono (¿WhatsApp?), dirección, horario, cómo quiere presentarse (titulación, colegiación), áreas de trabajo, modalidades (presencial/online), tarifas y una foto para la portada.
