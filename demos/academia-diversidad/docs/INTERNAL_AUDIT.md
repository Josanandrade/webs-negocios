# Academia Diversidad — notas internas de la demo

Documento interno. No se sirve en la web (está fuera de `public/` y el `postbuild` falla si aparece cualquier `.md` o texto interno en `out/`).

Fecha: 2026-10-14.

## 1. Fuentes públicas consultadas

| Fuente | Resultado |
| --- | --- |
| Buscador web: «"Academia Diversidad" Aznalcázar», «Academia Diversidad Aznalcázar Sevilla clases», «… opiniones teléfono», «… dirección calle» | Ningún resultado sobre esta academia. Aparecen homónimos sin relación (Academia Diversa, Moralzarzal; «Academia Diversidad» del Club Deportivo Avanza Jaén). |
| Buscador web: «680 990 641», «680990641», «"680 99 06 41"» | Sin coincidencias indexadas (solo páginas genéricas de prefijos 68099…). |
| Directorios filtrados (Páginas Amarillas, Cylex, infoisinfo, academias.com, tusclasesparticulares, Firmania, Guialocal, Empresite, eInforma, Axesor, Yelp, Nicelocal…) | Sin ficha localizable desde el buscador. |
| aznalcazar.es, dipusevilla.es, Facebook e Instagram (filtrados por dominio) | Sin mención a la academia. |
| Google Maps / ficha de Google, Instagram, Facebook directos | **Bloqueados** desde el entorno de trabajo. No se ha podido abrir la ficha ni las reseñas. |
| DuckDuckGo / Bing directos | Bloqueados (proxy 403 / robots). |

Conclusión: la información pública **verificable desde aquí** es prácticamente nula. La demo se apoya en lo que Jose aportó en el encargo y se limita a ello.

## 2. Datos utilizados

| Dato | Estado | Uso |
| --- | --- | --- |
| Nombre: Academia Diversidad | Aportado por Jose (ficha pública localizada previamente). No reverificado desde aquí. | Marca, título, textos. |
| Localidad: Aznalcázar (Sevilla) | Aportado por Jose. No reverificado. | Portada, contacto, FAQ. |
| Teléfono móvil: 680 990 641 | Aportado por Jose como público. No reverificado (no aparece indexado). | Botones de llamada (`tel:+34680990641`), contacto, FAQ. |

**Antes de enseñar la demo, comprobar en la ficha de Google que nombre y teléfono coinciden.**

## 3. Información dudosa (no usada)

- **Actividad presencial y online**: mencionada en el encargo, no confirmada. No se dice en ningún sitio que haya clases online ni presenciales; la solicitud no pregunta modalidad.
- **Buenas valoraciones**: no se han podido leer las reseñas (Google bloqueado). No se muestran estrellas, puntuación, número de reseñas ni citas.
- **Dirección exacta / calle**: no localizada. Solo se muestra «Aznalcázar, Sevilla» y un enlace de búsqueda en Google Maps por nombre (enlace, no mapa incrustado). La FAQ dice «llámanos y te indicamos cómo llegar».
- **Horario**: no localizado. No aparece.
- **WhatsApp**: el número es móvil, pero no consta que atiendan por WhatsApp. No se ofrece como canal.
- **Email**: no localizado. No hay email de la academia en la web.

## 4. Datos deliberadamente no utilizados

Ningún curso, nivel, asignatura, etapa ni edad: ni primaria, ESO, bachillerato, selectividad, apoyo escolar, clases particulares, idiomas (B1/B2/C1), oposiciones ni formación online. Tampoco número de profesores, titulaciones, metodología, porcentajes de aprobados, tarifas, matrícula, promociones, años de experiencia ni fotos.

Los textos son neutros: «Formación adaptada a cada alumno», «Consulta nuestras opciones formativas», «Cuéntanos qué necesitas».

La sección «Opciones formativas» no enumera nada: invita a contar el caso y a que la academia explique qué encaja.

Las etiquetas de la ilustración («No sé por dónde empezar», «Me está costando», «Voy bien, quiero más», «Empiezo de nuevo») describen situaciones de quien llega, no servicios.

Frases de tono que son interpretación y no dato: «una academia de pueblo, cercana» (coherente con el encargo «academia local y cercana») y la lectura del nombre «no hay dos alumnos iguales». Si Jose prefiere, se pueden suavizar.

## 5. Servicios / cursos que no se han podido verificar

Todos. No hay ninguna oferta formativa confirmada.

## 6. Conversión (todo simulado)

- CTA principal visible desde el inicio: «Solicita información» (portada), «Quiero apuntarme» (cabecera) y barra fija en móvil «Llamar / Solicitar información».
- Solicitud en 3 pasos con barra de progreso: quién escribe (familia o alumno/a, nombre y nombre del alumno opcional) → qué necesita (opciones genéricas: Conocer las opciones / Resolver una duda / Empezar cuanto antes / Otra cosa + mensaje) → cómo contactar (llamada o email, franja mañana/tarde, consentimiento).
- Dos modos: «Pedir información» y «Quiero apuntarme» (los enlaces `#apuntarme` activan el segundo).
- Confirmación visual con referencia aleatoria `AD-XXXX` y resumen, más la nota «Esto es una simulación: no se ha enviado ni guardado ningún dato».
- Verificado con Playwright (escritorio 1366 px y móvil 390 px): validaciones, envío y **cero peticiones de red** durante el formulario; cero peticiones a terceros en toda la página. No hay `fetch`, backend, base de datos, emails ni pagos.
- Sección «Para la academia»: maqueta de panel (solicitudes, grupos, avisos a familias) marcada como «Ejemplo ilustrativo», con datos genéricos (Grupo A/B/C). Muestra la posibilidad futura sin atribuir nada real.

## 7. Decisiones de diseño

- **Concepto**: «caminos distintos, mismo destino». El nombre Diversidad se traduce en cuatro trazos de colores que salen de puntos diferentes y convergen en «Tu siguiente paso». El mismo degradado reaparece en el recorrido de «Cómo empezar», en la barra de progreso del formulario y en el logotipo (cuatro puntos). Sensación de acompañamiento y progreso sin lápices, libros ni birretes.
- **Paleta**: papel cálido `#F4F2EC`, tinta azul noche `#1C2340`, mandarina `#F26B3A` para acciones; acentos suaves cielo `#7FA7E8`, lima `#B9D36C`, lila `#B79CE6`, arena `#F2C46D`. Colores optimistas pero apagados, no chillones ni infantiles.
- **Tipografía**: Gabarito (geométrica, redonda, pesos 800–900) para titulares; Rethink Sans para lectura. Ninguna se ha usado en otras demos del repo.
- **Composición**: secciones con fondos distintos (papel, blanco, mandarina a sangre, tinta) para que cada bloque se reconozca; selector «Soy familia / Soy alumno/a» que cambia contenido y color; recorrido de pasos horizontal en escritorio y vertical en móvil; contacto con el nombre del pueblo en grande.
- **Sin fotos**: no hay material gráfico verificable de la academia; no se usan imágenes de banco que puedan pasar por el negocio.
- **Privacidad técnica**: `noindex, nofollow` en meta, `robots.txt` y cabecera `X-Robots-Tag`; fuentes locales; sin analytics.

## 8. Por qué es distinta del resto de demos

- Frente a clínicas y psicología (Pérez Bilbao, Mapi de Paz, podologías, veterinarias): no hay reserva de cita, agenda, huecos ni horarios; el objetivo es una solicitud de información/matrícula. Nada de tonos sanitarios (blancos fríos, azules clínicos, verdes menta) ni serifas sobrias.
- Frente a peluquerías y estética: sin fotografía, sin carta de precios, sin estética de salón.
- Identidad propia: ilustración de caminos que convergen, logotipo de cuatro puntos, Gabarito + Rethink Sans, mandarina + tinta azul noche, botones con «escalón» inferior, selector familia/alumno y formulario por pasos con barra de progreso. Ninguno de estos recursos se repite en otra demo.

## 9. Pendiente de confirmar con la academia (si avanza)

Dirección, horario, oferta formativa real (cursos, niveles, modalidades), email, si atienden por WhatsApp, fotos propias y reseñas que quieran mostrar.
