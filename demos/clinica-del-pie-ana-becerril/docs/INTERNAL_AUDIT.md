# Clínica del Pie · Podóloga Ana Mª Becerril (Pilas) · Investigación interna

> Documento interno. No se despliega: está fuera de `public/` y `src/app/`, y `scripts/postbuild.mjs` elimina cualquier `.md` y falla si se cuela texto interno en la exportación.

Fecha de la investigación: 14/10/2026. Demo no solicitada por el negocio (campaña de prospección).

## 1. Fuentes consultadas

| Fuente | Qué aporta | Estado |
|---|---|---|
| Encargo de Jose (datos localizados por él) | Nombre «Clínica del Pie — Podóloga Ana Mª Becerril», C. Médico José Manuel Bolaños Custodio, 40, tel. 954 751 875, sin web ni reservas online. | Punto de partida |
| QDQ, «BECERRIL GONZÁLEZ, A.M.» (qdq.com/becerril-gonzalez-am-1022513) | Categoría Podólogos, «Calle Pedro Parias 40, Local, 41840, Pilas, Sevilla», teléfono **954751875**, coordenadas 37.302738, -6.304316. Sin horario, servicios ni web. | Consultada |
| Callejero.net, «Calle Médico José Manuel Bolaños Custodio» (pilas.callejero.net) | La calle existe en Pilas, CP 41840. Coordenadas del mapa: 37.30223, -6.30417. | Consultada |
| Colegio de Podólogos de Andalucía (colegiopodologosandalucia.org/clinicas/detalle.php?id=193) | Un buscador lo devuelve para «Médico José Manuel Bolaños Custodio» + podología, lo que apunta a una clínica colegiada en esa calle. La URL redirige a copoan.es y el directorio no se renderiza sin JavaScript; el proxy del entorno bloquea el acceso directo. **No se ha podido leer la ficha.** | Sin contenido |
| Doctoralia, «Podólogos en Pilas» | No aparece Ana Mª Becerril. | Consultada |
| masquemedicos.com, Saludonnet | No la listan. | Consultadas |
| Junta de Andalucía, listado de podólogos de Sevilla (enero 2025) | No incluye Becerril ni Pilas (listado parcial). | Consultada |
| Ayuntamiento de Pilas y Aljarafe y Más (noticias sobre el Dr. José Manuel Bolaños Custodio, 2013 y 2025) | Médico homenajeado del pueblo; no mencionan la calle ni un cambio de nombre. | Consultadas |
| Búsquedas de web propia, Instagram, Facebook, Google Maps | Sin web propia. Instagram, Facebook y Google Maps bloqueados desde el entorno. | Sin resultado |

## 2. Datos confirmados (y usados)

- **Profesión y apellido**: podóloga Becerril («BECERRIL GONZÁLEZ, A.M.», categoría Podólogos en QDQ). Cuadra con «Ana Mª Becerril» del encargo; se usa la forma del encargo.
- **Teléfono 954 751 875**: coincide exactamente entre el encargo y QDQ.
- **Localidad**: Pilas (Sevilla), CP 41840.
- **Dirección**: «C. Médico José Manuel Bolaños Custodio, 40». Ver dudas abajo.

## 3. Datos dudosos

- **Dirección / nombre de la calle.** QDQ dice «Calle Pedro Parias 40, Local»; el encargo, «C. Médico José Manuel Bolaños Custodio, 40». Mismo número, y las coordenadas de QDQ y de la calle en el callejero están a unos 55 m. Lo más probable es que la calle se haya renombrado en honor al médico y QDQ conserve el nombre antiguo, pero no se ha encontrado el acuerdo municipal. La web usa el nombre actual (el del encargo). **Confirmar con la clienta.**
- **Nombre comercial «Clínica del Pie».** Solo procede del encargo (probablemente su ficha de Google). Ojo: QDQ asigna «Clínica del Pie **Pilas**» a María Campos Rodríguez (Plaza América 1, tel. 954 750 555), otra podóloga del pueblo. No es el mismo negocio (otra dirección y otro teléfono). En esta demo se usa «Clínica del Pie» sin «Pilas» detrás y siempre junto al nombre de Ana Mª Becerril.
- **Nombre completo**: QDQ da «A.M.» y segundo apellido González; no se ha visto «Ana María» escrito en ninguna fuente accesible. Se usa «Ana Mª Becerril» como en el encargo.
- **Ficha del Colegio**: existe un resultado del Colegio de Podólogos de Andalucía ligado a esa calle, pero no se ha podido leer. No se usa nada de ella (ni número de colegiada).

## 4. Información no utilizada (no existe en fuentes públicas o no se ha podido verificar)

- Horario: no publicado. La web dice «El horario se confirma por teléfono» y la agenda de la reserva se marca como **de ejemplo**.
- Servicios, tratamientos, patologías, especialidades: ninguna fuente los da. No hay sección de servicios.
- Número de colegiada, formación, años de experiencia, seguros/mutuas, precios, reseñas o testimonios: nada.
- Fotos de la consulta o de la profesional: ninguna. La web no usa fotos.
- Mapa embebido de Google: se evita (petición a terceros). Solo botón «Abrir en el mapa».

## 5. Decisiones de contenido

- Trato de **usted** en toda la web: público adulto y tono tradicional (las otras dos demos tutean).
- Motivos de cita genéricos, sin tratamientos: «Primera consulta», «Volver a consulta», «Otro motivo».
- Reserva 100 % local (estado de React): sin red, sin base de datos, sin correo, sin pagos. Comprobado con Playwright: cero peticiones al enviar. La referencia «AB-####» se genera en el navegador.
- Las preguntas frecuentes solo hablan de cómo pedir, cambiar o anular la cita, el horario (pendiente) y la dirección. Nada sanitario.
- Sección «Por teléfono / Desde la web»: compara los dos canales en general, sin afirmar cómo trabaja hoy la consulta.
- Pie con «Web de demostración: no es la web oficial…».

## 6. Decisiones de diseño (y por qué es distinta de las otras dos demos de podología)

Comparación hecha con capturas en escritorio y móvil de las cuatro demos de podología. La de **María del Carmen Espinosa** (Benacazón, rama `demo/maria-del-carmen-espinosa-podologia-9wss9c`) se construyó en paralelo; se comparó con su primer commit (5e71130). Al verla, esta demo dejó el verde (Espinosa usa una puerta verde con placa «MC» y el lema «sin esperar al teléfono») y pasó a pizarra + latón, con otro titular.

| | Ana Mª Becerril (esta) | Clínica del Pie Alquería | María Campos | Mª del Carmen Espinosa |
|---|---|---|---|---|
| Línea | Consulta clásica, tranquila, de toda la vida | Clínica moderna/corporativa | Boutique personal | Consulta de barrio, cercana |
| Paleta | Pizarra #2B3A44, marfil #F4F3EF, latón #B38B45 | Blanco + azul acción #1A5FD0 + marino, menta para disponible | Avena #F2ECE1, café #2B231E, miel #C98A2B | Crema, verde puerta, frambuesa en botones |
| Tipos | Literata (serif de lectura) + Lexend | IBM Plex Sans + Plex Mono | Young Serif + Atkinson Hyperlegible | Serif con cursiva |
| Hero | Banda pizarra con titular de acción y **placa de latón** de la puerta + 3 pasos | Lista de «Próximas horas libres» sobre rejilla | Nombre enorme + tarjeta de visita y tarjetita de cita | Titular claro + ilustración de puerta con placa y maceta |
| Navegación | Barra superior fija con Llamar / Pedir cita + fila de secciones con texto visible y botón «Letra más grande» | Menú hamburguesa + barra inferior fija en móvil | Navegación mínima + barra inferior fija en móvil | Mínima, botón frambuesa |
| Reserva | Formulario vertical de 4 preguntas numeradas con **calendario mensual** (estilo almanaque) y resumen «Su cita» al lado | Asistente de 4 pasos | Frase a completar con tira de días | Huecos libres |
| Confirmación | Resguardo imprimible con sello | Agenda «Para la clínica» | Tarjeta + «Así le llega a María» | (ver su rama) |

Accesibilidad: base de 18 px (21 px con «Letra más grande», recordado en el navegador si se puede), botones de 48–58 px de alto, contraste alto, foco visible en latón, enlaces de salto, al enviar con errores la página baja al primer paso pendiente.

## 7. Pendiente de confirmar con la clienta

Nombre exacto de la calle (Pedro Parias vs Médico José Manuel Bolaños Custodio), nombre comercial que quiere usar, horario real, servicios que quiere mostrar, si atiende con cita previa, fotos suyas y de la consulta.
