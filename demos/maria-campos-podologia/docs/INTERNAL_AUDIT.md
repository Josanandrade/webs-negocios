# María Campos Rodríguez · Podología (Pilas) · Investigación interna

> Documento interno. No se despliega: está fuera de `public/` y `src/app/`, y `scripts/postbuild.mjs` elimina cualquier `.md` y falla si se cuela texto interno en la exportación.

Fecha de la investigación: 14/10/2026. Demo no solicitada por el negocio (campaña de prospección).

## 1. Fuentes públicas consultadas

| Fuente | Qué aporta | Estado |
|---|---|---|
| Doctoralia, listado «Podólogos en Pilas» (doctoralia.es/podologo/pilas) | «María Campos Rodríguez», podólogo, «Consultorio privado», «AV. ALJARAFE 19 BJ 3, Pilas». Única podóloga con dirección en Pilas en ese listado. | Consultada |
| Doctuo, ficha «Maria Campos Rodriguez» (doctuo.es/medicos/maria-campos-rodriguez) | Podóloga, «Av. Aljarafe 19 Bj 3, 41840, Pilas, Sevilla», teléfono parcialmente oculto «954 750…», «Experto en Podología Deportiva», seguro MAPFRE. Sin horario, servicios, colegiado ni reseñas. | Consultada |
| Doctuo, cuadro médico MAPFRE, pág. 10 | Misma dirección, asociada a MAPFRE. | Consultada |
| Páginas Amarillas, «MARIA CAMPOS RODRIGUEZ - Pilas - Avenida Aljarafe, 19 BAJO-3» | Dirección (visible en el título del resultado de búsqueda). La página no devolvió contenido al abrirla. | Solo título |
| QDQ, «CLINICA DEL PIE PILAS MARIA CAMPOS RODRIGUEZ» (qdq.com/…-196905) | Nombre comercial «Clínica del Pie Pilas», categoría Podólogos, «Plaza América 1, 41840, Pilas», teléfono 954 750 555 (enlace tel:954750555). Sin horario, servicios ni web. | Consultada |
| Junta de Andalucía, «Listado de podólogos de la provincia de Sevilla» (enero 2025) | No incluye Pilas (listado parcial). Sin datos. | Consultada |
| masquemedicos.com, Saludonnet, Doctoralia (centros) en Pilas | No la listan. | Consultadas |
| Búsquedas de web propia, Instagram, Facebook | No aparece web propia ni redes en buscadores. Instagram/Facebook/Google Maps bloqueados desde el entorno. | Sin resultado |

**Conclusión: no se ha encontrado web propia. Su presencia pública son fichas de directorios → encaja con la campaña.**

## 2. Datos confirmados y usados

- Nombre: María Campos Rodríguez. Profesión: podóloga (Doctoralia, Doctuo, QDQ).
- Dirección: Avenida Aljarafe, 19, bajo 3, 41840 Pilas (Sevilla). Coinciden Doctoralia, Doctuo (×2) y Páginas Amarillas.
- Teléfono: 954 750 555. Completo en QDQ; Doctuo muestra el mismo prefijo «954 750…». Una sola fuente con el número entero: **confirmarlo antes de enseñar la demo** (si no coincide, cambiar `src/content/site.ts`).
- Consulta privada (Doctoralia: «Consultorio privado»).

## 3. Datos que deliberadamente NO se usan

- **Plaza América 1** (QDQ): contradice a las otras tres fuentes. Puede ser la misma esquina o una dirección antigua; no se usa.
- **Nombre comercial «Clínica del Pie Pilas»** (solo QDQ). Además, otra demo en paralelo es «Clínica del Pie Alquería»: usarlo confundiría. La web va con su nombre propio.
- **«Podología deportiva»** (Doctuo, campo genérico de directorio, sin otra fuente). No se presenta como especialidad.
- **MAPFRE** (Doctuo): cuadro médico sin fecha, no confirmado. No se menciona ningún seguro.
- Horario: no publicado en ninguna fuente. La web dice «Consúltalo por teléfono o elige un hueco en la agenda».
- Tratamientos, precios, años de experiencia, número de colegiada, formación, reseñas, fotos de la consulta o de ella: no hay nada público. No se inventa.
- Mapa embebido de Google: se evita (llamada a terceros). Solo enlace «Cómo llegar».

## 4. Decisiones de contenido

- Los «motivos de cita» son genéricos y no describen tratamientos: Primera visita, Revisión o seguimiento, Tengo una molestia, Otro motivo.
- La agenda (días laborables, huecos de 9:30–13:30 y 17:00–19:30) es **de ejemplo** y así se indica junto al título «Pide tu cita». Huecos ocupados generados de forma estable a partir de la fecha.
- La reserva es 100 % local (estado de React): sin red, sin base de datos, sin correo. Comprobado con Playwright: cero peticiones al confirmar. El código de cita se genera en el navegador.
- La confirmación enseña dos caras: la tarjeta de cita del paciente y «Así le llega a María» (agenda del día con la cita nueva + ficha básica del paciente con motivo y nota). Es el argumento comercial: menos llamadas para cuadrar horas y la ficha hecha antes de la visita.
- Sección «De la tarjetita de papel a la agenda»: describe lo que haría la web (reserva a cualquier hora, ficha previa, recordatorio con enlace para cambiar o anular), no afirma nada sobre cómo trabaja hoy la consulta.

## 5. Dirección visual (y por qué es distinta de Clínica del Pie Alquería)

- Línea «consulta con nombre propio»: el hero es el nombre de la profesional en grande, acompañado de dos objetos de papel (su tarjeta de visita y la clásica tarjetita «Próxima cita · Día ___ Hora ___»), sin fotos ni iconografía sanitaria.
- Paleta: avena #F2ECE1, papel #FBF8F2, tinta café #2B231E, miel #C98A2B (texto #8C5D14). No repite ninguna paleta de demos anteriores.
- Tipografía: Young Serif (titulares) + Atkinson Hyperlegible Next (texto e interfaz, pensada para leerse bien con vista cansada). No usadas en otras demos.
- Reserva como **frase a completar** («Quiero pedir cita para ___ el ___ a las ___»), con días en tira horizontal y horas por mañana/tarde. Navegación mínima de texto; en móvil, barra inferior Llamar / Pedir cita.
- Sin tarjetas de servicios, sin iconos de especialidades, sin hero con foto.

## 6. Pendiente de confirmar con la clienta

Teléfono completo, horario real, dirección exacta (Av. Aljarafe vs Plaza América), si atiende sola o con equipo, servicios que quiere mostrar, foto suya y de la consulta.
