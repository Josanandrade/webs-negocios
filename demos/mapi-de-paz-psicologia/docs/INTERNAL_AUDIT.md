# Mapi de Paz · Consulta de Psicología — notas internas

Documento interno. No se publica (vive fuera de `public/` y `postbuild` falla si algo interno llega a `out/`).
Revisado el 14/10/2026.

## Fuentes públicas consultadas

| Fuente | Estado | Qué aporta |
| --- | --- | --- |
| Psicología Hoy (Psychology Today ES), perfil verificado 1575497 — psicologiahoy.com/es/psicologos-psicoterapeutas/mapi-de-paz-camprubi-bollullos-de-la-mitacion-se/1575497 | Leído | Fuente principal, redactada por la propia profesional |
| Mejor.es — mejor.es/@mapi-de-paz-consulta-de-psicologia/ | Leído | Dirección, teléfono, 5 reseñas de Google (5★) |
| Sevilla Hoy Digital (ficha) | Leído | Dirección, teléfono; enlace a un antiguo `negocio.site` |
| about.me/mapidepaz | Leído | "psicóloga, terapeuta y coach"; universidad (ver conflicto) |
| Facebook `mapidepazpsicologa` ("Consulta Psicologia Bollullos de la Mitacion") | Bloqueado desde el entorno | Solo se ve el título en buscadores |
| psicologosensevilla.com, todosbiz.es | Error al cargar | — |
| Doctoralia (Bollullos) | Leído | No aparece |
| `mapi-de-paz-consulta-de-psicologia.negocio.site` | Caído (Google cerró negocio.site en 2024) | — |

## Datos confirmados y usados

- Nombre comercial: **Mapi de Paz · Consulta de Psicología** (nombre completo: María Pía de Paz Camprubí; en la web solo se usa "Mapi de Paz").
- Psicóloga, Licenciada en Psicología, inscrita en el **Colegio Oficial de la Psicología de Andalucía Occidental** (COP-AO). Sin número de colegiada publicado → no se muestra número.
- Dirección: **Calle Larga, 76, Local 6, 41110 Bollullos de la Mitación** (Psicología Hoy dice "local 4 y 6"; se usa Local 6, que coincide en tres fuentes).
- Teléfono: **616 88 58 41** (tres fuentes).
- Modalidad: **presencial y online** ("Puedes hacer conmigo terapia presencial o bien online"; "Citas presenciales y virtuales disponibles"). Una reseña de Google también menciona sesiones online.
- Formatos: **individual, pareja, familia y grupos** ("Hago Terapia individual, de pareja, de familia y también grupos").
- Enfoque: **integrador** ("me he formado en gran variedad de técnicas y recursos"); recursos citados por ella: **Gestalt, sistémica, arteterapia, psicodrama**.
- **25 años de experiencia** (texto de su presentación) y **formadora y supervisora de profesionales**.
- Frase usada como titular y cita: "Procuro que estés cómodo/a y acompañarte con cuidado en tu proceso." (literal de su perfil).
- Áreas (selección prudente de su lista "Experiencia"): ansiedad y estrés, autoestima, duelo, relaciones de pareja (terapia de pareja), conflictos familiares, divorcio, orientación vocacional.
- Edades: preadolescentes, adolescentes, adultos y mayores de 65.
- Idiomas: el perfil indica catalán → "Castellano y catalán".
- Horario: no publicado; su perfil dice "variedad de horarios" → "Variedad de horarios. Se acuerda al pedir cita".
- Reseñas: tres frases literales de reseñas de Google (vía Mejor.es), firmadas solo con iniciales (A. L., E. E., V. C.).

## Datos deliberadamente NO usados

- **Precios**: el perfil dice 65 € individual / 80 € pareja, pero en otro párrafo dice 60 € la individual. Conflicto → no se muestra ningún precio.
- **Consulta inicial gratuita de 15 min**: aparece solo en un sitio y ligada a la tabla de precios contradictoria → no se usa.
- **Formas de pago** (efectivo, transferencia, Visa / Bizum): inconsistentes entre sí → no se usan.
- **Universidad**: Psicología Hoy dice Universidad de Barcelona (2000); about.me dice Universidad Autónoma de Barcelona → no se menciona.
- **Años exactos**: 25 vs 26 en el mismo perfil → se usa la frase literal "25 años de experiencia".
- **Lista completa de problemas/terapias** de Psicología Hoy (TLP, TOC, trauma, conducta suicida, autolesión, IFS, EFT, etc.): no se reproduce; son etiquetas de directorio, muy sensibles, y una web comercial no debe presentarlas como especialidades. Solo se usa la selección anterior, sin lenguaje diagnóstico.
- **"Coach" / coaching de vida**: aparece en about.me y en la lista; no se destaca para no mezclar con la terapia.
- **Otra profesional**: una reseña menciona a "María José" como terapeuta del centro. No hay más datos → no se menciona equipo.
- **Fotografías**: no hay ninguna descargable (Facebook bloqueado, sin web propia). La web es tipográfica, sin fotos ni retratos inventados.
- **Horarios reales de citas**: los del módulo de reserva son orientativos y lo dice la propia interfaz.

## Decisiones de diseño y contenido

- Dirección "revista serena": Cormorant Garamond (titulares, cursivas) + Albert Sans (texto/UI). Paleta lino `#F3F1EA`, tinta de bosque `#1F2A26`, ciruela apagada `#6E4A5E`, salvia `#7C8C7A`, ocre `#C8A46A`.
- Distinta de las otras demos de psicología: Maqui Martín (papel/arcilla, Newsreader + Hanken, arcos) y ABEPA (Bricolage + Atkinson). Y de las podologías del mismo encargo (sanitarias).
- Único recurso gráfico: manchas de acuarela en SVG generadas con filtros (guiño a la arteterapia, que ella cita). Sin iconos ni tarjetas tipo SaaS: índices numerados en romanos, filetes finos, cita destacada.
- Reserva en 4 pasos (sesión → modalidad → día y hora → datos) + confirmación. Discreta: se indica que no hace falta contar el motivo. Al confirmar se ve "Así lo vería la consulta", una agenda simulada con la solicitud ya ordenada: es el argumento de reducir gestión manual sin crear ninguna página de propuesta.
- Todo simulado: sin `fetch`, sin almacenamiento, sin emails. Comprobado con Playwright: cero peticiones a terceros al cargar y al completar la reserva.
- Pie: aviso de demostración y teléfonos 024 / 112 para crisis (práctica responsable en webs de salud mental, no es un dato del negocio).
- `noindex, nofollow` en metadatos, `robots.txt` y cabecera `X-Robots-Tag` (`serve.json`).
