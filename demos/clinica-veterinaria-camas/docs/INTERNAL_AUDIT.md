# Clínica Veterinaria Camas — auditoría interna

> Documento interno. Vive en `docs/`, fuera de `src/app` y de `public/`: Next.js
> no lo sirve y no existe ninguna ruta, enlace ni referencia a él desde la web.

Fecha de la investigación: 13/10/2026.

Limitación técnica: el entorno de trabajo solo tenía acceso a búsqueda web, sin
navegación directa a Google Maps, Instagram, Facebook, negocio.site ni la web
del dominio. Todo lo de abajo sale de los resultados indexados de esas fuentes.
Ningún dato se ha comprobado aún por teléfono.

## 1. Fuentes investigadas

| Fuente | URL | Qué aporta |
| --- | --- | --- |
| Ficha de Google (web automática) | https://clinica-veterinaria-camas.negocio.site | Nombre, categoría «Hospital Veterinario en Camas», teléfono, horario, botones de llamar / cómo llegar / WhatsApp / pedir cita, reseñas |
| Web propia (antigua) | https://clinicaveterinariacamas.com | Especialidades, campañas, blog, fichas de razas, pie con dirección |
| Instagram oficial | https://www.instagram.com/clinicaveterinariacamas/ | ~534 seguidores, ~58 publicaciones. Bio: «Cita previa: 691 30 46 13 · C/ Santa Paula nº 6 (Camas, Sevilla)» |
| Facebook oficial | https://www.facebook.com/ClinicaVeterinariaCamas/ | Email clinicaveterinariacamas6@gmail.com, 8 reseñas |
| Yelp (no reclamada) | https://www.yelp.com/biz/clinica-veterinaria-camas-santa-paula-6-camas | Horario distinto, 1 reseña (2/5) |
| Páginas Amarillas | https://www.paginasamarillas.es/f/camas/clinicas-veterinarias-camas_010448785_000000001.html | Mismo domicilio, sábado como cerrado |
| Directorios de terceros | peludosyfelices.com, horsepital.es, clinicaveterinaria.es, qdq.com, buscalis, spain-web, veterinarioinfo7, clinicasveterinarias.one, foursquare | Valoración (4,4 · ~112 reseñas), resumen de reseñas, listados de servicios no verificables |

## 2. Presencia digital actual

- **Web principal de facto:** la página automática de Google Business en
  `negocio.site`. Plantilla genérica, sin servicios explicados, sin equipo,
  sin fotos propias trabajadas. Google retiró estas webs en 2024, así que su
  continuidad no está garantizada: es un argumento de venta claro.
- **Web propia:** `clinicaveterinariacamas.com` sigue indexada con
  especialidades, campañas y blog, pero una copia indexada mostraba página de
  aparcamiento del registrador. Estado actual incierto → preguntar.
- **Instagram:** activo, poca escala (≈58 posts). Es el canal donde publican
  el número de cita previa.
- **Facebook:** página con pocas reseñas.
- **Google Business:** la pieza fuerte: 4,4/5 con más de 100 opiniones.
- **Inconsistencias:** tres horarios distintos según la fuente, dos
  teléfonos, dos emails y dos «webs». La nueva web debe unificar todo.

## 3. Datos verificados (usados en la demo)

| Dato | Valor | Fuente |
| --- | --- | --- |
| Nombre | Clínica Veterinaria Camas | Todas |
| Dirección | Calle Santa Paula, 6 · 41900 Camas (Sevilla) | Instagram, web propia, Google |
| Teléfono fijo | 954 39 23 03 | Google / negocio.site, web propia |
| Cita previa (WhatsApp) | 691 30 46 13 | Bio de Instagram; negocio.site tiene botón de WhatsApp |
| Horario | L–V 10:00–13:30 y 17:00–20:00 · S 10:00–13:00 · D cerrado | negocio.site (ficha de Google) |
| Valoración | 4,4/5, «más de 100 opiniones» | Directorios que replican Google (112–115) |

### Servicios verificados en la web propia de la clínica

- Especialidades listadas en el pie: **Cardiología, Cirugía, Dermatología,
  Odontología, Oftalmología.**
- **Reproducción asistida:** citología vaginal, biopsias, estudios hormonales,
  ecografía, evaluación del esperma; monta natural o inseminación artificial.
  (En la demo no se menciona «biopsias» ni «inseminación» para no saturar.)
- **Oftalmología:** párpados, conjuntivitis, úlceras corneales, cataratas,
  glaucoma.
- **Comportamiento:** «extensa experiencia en etología animal».
- **Peluquería** (campaña de corte de primavera para perros). Directorios
  hablan de peluquería canina y felina.
- **Campañas:** desparasitación externa (pulgas y garrapatas), limpieza dental
  con preanestesia, primera visita gratuita para cachorros (exploración,
  consejos de alimentación y educación; solo se cobra el antiparasitario),
  cambio de cartilla andaluza a pasaporte por 8,50 €.
- **Blog:** parásitos intestinales, administrar medicamentos, golpe de calor,
  bienestar del gato, alimentación del cachorro.

## 4. Datos descartados o pendientes (NO aparecen en la web)

| Dato | Motivo |
| --- | --- |
| Nombres de veterinarios | No aparecen en ninguna fuente. Un directorio cita a «Dra. Esperanza Jiménez López» pero con otra dirección → descartado |
| Urgencias 24 h | Un directorio lo atribuye a un centro con nombre parecido; nada en fuentes propias. La web solo dice qué hacer y remite a un servicio 24 h fuera de horario |
| Hospitalización | Solo categoría de Google («Hospital Veterinario») y directorios. Una reseña habla de dejar al animal la noche anterior. No se afirma |
| Radiología / análisis / laboratorio | Solo directorios. Ecografía sí consta en la web propia, pero solo dentro de reproducción |
| Consultas a domicilio | Un único directorio → descartado |
| Exóticos | Sin evidencia. La web dice «perros y gatos» y «si tienes otra especie, llámanos» |
| Primera visita gratuita | Campaña antigua, quizá no vigente. Se describe la revisión del cachorro sin hablar de precio |
| Precio del pasaporte (8,50 €) | Campaña antigua. No se publica |
| Email | Hay dos (`info@clinicaveterinariacamas.com` y `clinicaveterinariacamas6@gmail.com`). No se publica ninguno hasta confirmar |
| Horarios alternativos | Yelp: L–V 10–13:30 / 17–20:30 y S 10–13:30. Otro: L–V 10–20 continuo. Páginas Amarillas: sábado cerrado |
| Reseñas literales | No se han podido leer completas con autor y fecha. La web resume temas recurrentes (trato cercano, profesionalidad en esterilizaciones, atención el mismo día) sin citas inventadas |
| Logo | No localizado. La demo usa una marca provisional (cruz redondeada + sol) |
| Reseñas negativas | Hay una muy dura sobre una gata y quejas por la dificultad de conseguir cita por teléfono/WhatsApp. Argumento de venta: el bloque de WhatsApp con mensaje preparado y la información clara de horario reducen llamadas perdidas |

Otras clínicas en Camas que NO hay que confundir: Salud Animal Camas (calle
José Payán), Vitalcan (consultorio en Camas), Baloo.

## 5. Preguntas para la reunión

1. ¿Horario exacto actual, sábados incluidos?
2. ¿El 691 30 46 13 es el WhatsApp oficial de citas?
3. ¿Atendéis urgencias fuera de horario o tenéis un centro de referencia?
4. ¿Hospitalización, radiografía, analíticas en clínica?
5. Nombres, titulación y foto de cada veterinario/a y del personal.
6. ¿Exóticos?
7. ¿Logo en vectorial?
8. ¿Qué pasa con clinicaveterinariacamas.com? ¿Sigue siendo vuestro el dominio?
9. ¿Alguna campaña vigente (cachorros, dental, antiparasitarios)?

## 6. Concepto visual

«Luz de mañana»: blanco frío, cobalto (#2346E8) como color de confianza, un
amarillo sol (#FFC23D) como acento cálido y tinta azul noche para los bloques
de contraste. Tipografía Gabarito (titulares, redonda y amable sin ser
infantil) + Figtree (texto). Sin huellas, sin dibujos, sin beige ni verdes
pastel. Los animales reales protagonizan los huecos fotográficos: mientras no
haya fotos, se ven composiciones de color con la proporción final.

Decisiones mobile-first:
- Barra fija inferior con Llamar · WhatsApp · Cómo llegar.
- Estado «Abierto ahora / Cerrado · abre a las…» calculado en hora de Camas.
- Horario con el día de hoy resaltado.
- Mensaje de WhatsApp preparado (motivo + animal + nombre), sin guardar nada.

## 7. Notas de QA

- Lint, typecheck y build limpios.
- axe-core (WCAG 2.2 AA + buenas prácticas): 0 violaciones en desktop y móvil.
- Lighthouse móvil: rendimiento 97, accesibilidad 100, buenas prácticas 100.
  SEO 63 a propósito (noindex).
- Sin desbordamiento horizontal a 375, iPhone 13 (390) ni Pixel 7 (412).
- Sin errores ni avisos en consola.
- `prefers-reduced-motion`: se desactivan entradas, revelados y el pulso del
  estado.
- Rutas internas comprobadas con 404: /propuesta, /auditoria, /audit, /fuentes,
  /docs/INTERNAL_AUDIT.md, /README_ASSETS.md, /sitemap.xml.
