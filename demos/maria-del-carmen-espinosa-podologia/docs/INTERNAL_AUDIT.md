# Clínica Podológica María del Carmen Espinosa — notas internas

Documento interno. No se publica: `scripts/postbuild.mjs` elimina cualquier `.md` de la exportación y falla si aparece texto interno.

Revisión hecha el 14/10/2026 desde el entorno de trabajo (red con bloqueos: Facebook, Instagram y Google Maps no se pueden abrir desde aquí).

## Fuentes consultadas

| Fuente | Resultado |
|---|---|
| Búsqueda web: nombre del negocio, teléfono, calle | Pocos resultados: dos directorios y una página de Facebook. |
| sevillahoydigital.com — ficha «Clínica Podológica María del Carmen Espinosa, Benacazón» | Nombre, dirección C. Agramonte 10, 41805 Benacazón, teléfono 649109757, categoría «Podólogo». Sin horario («aún no se ha indicado»), 0 opiniones, sin servicios. Enlaza a una página de Facebook. |
| podologia-podologo.es (ficha 230735466) | Título indexado: «Clínica Podológica María Del Carmen Espinosa – Calle Agramonte (Urb. Velasco II), 10 BAJO – Benacazón». La ficha redirige a Páginas Amarillas y no se pudo leer entera. |
| paginasamarillas.es (podólogos en Benacazón) | Página vacía para el lector automático. |
| Facebook (dos URL distintas: `/people/…/100063015562966/` y `…-109424530607748/`) | Bloqueado por robots/red. Existe al menos una página con el nombre del negocio; no se ha podido leer contenido. |
| Doctoralia y masquemedicos (podólogos en Benacazón) | No aparece. Doctoralia lista otra consulta de Benacazón (Clínica del Pie Sánchez Ramos, C/ San Sebastián 35): **no confundir**. |
| Google Maps / ficha de Google | Bloqueado desde el entorno. sevillahoydigital cita un place_id de Google (ChIJ7TFabCAREg0RNbMPimzpNqQ). |

## Datos confirmados (usados en la web)

- Nombre: **Clínica Podológica María del Carmen Espinosa** (dos directorios).
- Actividad: podología (categoría «Podólogo» y el propio nombre).
- Dirección: **Calle Agramonte, 10, bajo — Urbanización Velasco II — 41805 Benacazón (Sevilla)**. Calle y número en dos fuentes; «bajo» y «Urb. Velasco II» en una (podologia-podologo.es).
- Teléfono: **649 109 757** (sevillahoydigital, coincide con el dato de Jose).
- No se ha localizado web propia ni reserva online (coincide con lo que dice Jose).

## Información dudosa o no verificable

- **Reputación online positiva**: no se ha podido comprobar. Google Maps está bloqueado y el único directorio legible muestra 0 opiniones. No se muestran estrellas, notas ni testimonios. Jose debería comprobarlo en Google antes de usarlo en la visita.
- **Horario**: ninguna fuente lo publica. La web usa días y horas de demostración (lun–vie, 9:30–13:30 y 17:00–20:00) y lo dice junto al calendario.
- **Que María del Carmen Espinosa sea podóloga y atienda en persona**: se deduce del nombre del negocio, pero no hay ficha profesional ni número de colegiada localizados. La web solo dice que la consulta lleva su nombre; no le atribuye titulación ni experiencia.
- **WhatsApp**: el teléfono es móvil, pero no consta que use WhatsApp. No se ofrece.
- **Facebook**: hay dos URL distintas; no se sabe cuál está activa. No se enlaza.

## Datos no utilizados (a propósito)

- Tratamientos concretos (uñas, durezas, plantillas, biomecánica, pie diabético, cirugía, infantil…): **ninguno** confirmado. Solo existe un tipo de cita: «Consulta de podología».
- Precios, aseguradoras, titulaciones, colegiación, años de experiencia: nada publicado.
- Fotos: no hay fotos accesibles. Se usa una ilustración (puerta del bajo con número y maceta) y un monograma «MC», sin retrato inventado.
- Precios de la competencia vistos en Doctoralia: solo como contexto, no aparecen en la web.

## Decisiones de diseño

- **Idea**: consulta de barrio. Una puerta de bajo con su número 10, placa de latón y maceta de geranios; nada de recepción ni aspecto de clínica grande.
- **Paleta**: cal (#F6F4EE), salvia (#C9D6C1 / #5E7A5C), verde tinta (#24382C) y geranio (#BF3852) como único color de acción. Sin azules.
- **Tipografía**: Literata (titulares, con cursiva) + Albert Sans (texto y formularios). No se repiten en otras demos.
- **Diferencias con Clínica del Pie Alquería** (blanco, azul de acción, navy, IBM Plex + mono, próximas horas libres en portada, reserva en 4 pasos, barra inferior en móvil): aquí no hay azul ni mono, la portada es la puerta y la profesional, la reserva es de 3 pasos con un resguardo de cita que se rellena al lado, y no hay barra inferior fija.
- **Diferencias con María Campos** (avena/café/miel, Young Serif, nombre gigante + tarjeta de visita, reserva como frase a completar): aquí el héroe es una frase sobre la cita sin llamadas + ilustración; la reserva es un calendario por semanas con huecos contados.
- **Foco comercial**: reducir llamadas para preguntar disponibilidad. Por eso el botón principal es «Ver huecos libres», cada día muestra cuántas horas quedan libres, y la sección verde enseña la agenda del lado de la consulta: la cita de prueba aparece en ella con los datos del paciente.
- **Reserva**: día (3 semanas, lun–vie) → hora (mañana/tarde) → datos (nombre, apellidos, móvil, correo opcional, primera vez sí/no, nota opcional, consentimiento) → revisión → confirmación con código, botón para el calendario (.ics local) y enlace a la agenda.
- **Todo simulado**: los huecos se generan en el navegador a partir de la fecha; no hay fetch, formulario con action, email, base de datos ni pagos. Comprobado con Playwright: la única petición externa es el mapa embebido de Google.
- **Privacidad**: noindex/nofollow en meta, cabecera X-Robots-Tag y robots.txt. Pie de página: «Web de demostración: no es la web oficial…».
