# Clínica del Pie Alquería · Auditoría interna (NO se despliega)

Documento interno de la campaña de prospección. Vive en `docs/`, fuera de
`public/` y de `src/`, así que no forma parte de la exportación estática.

- Negocio: **Clínica del Pie Alquería** (podología).
- Dirección: Ctra. Almensilla, 3 · 41110 Bollullos de la Mitación (Sevilla).
- Fecha de revisión: 14/10/2026.
- Demo no solicitada por el negocio.

## 1. Fuentes públicas consultadas

| Fuente | Qué aporta | Nota |
| --- | --- | --- |
| clinicaboreal.es/clinica-del-pie-alqueria-bollullos-de-la-mitacion/ | Nombre, "Podólogo", Ctra. Almensilla 3, tel. 685898265, horario, 5,0 en Google, atributos (entrada accesible, aseo, cita previa) | Copia de la ficha de Google. Texto promocional genérico ("podólogos altamente cualificados") no utilizable. |
| bollullos-de-la-mitacion-an.spain-web.com/clinica-del-pie-alqueria/ | Nombre, Carretera Almensilla 3, CP 41110, +34 685 89 82 65, horario, coordenadas 37.3353339, -6.1367212 | Sin reseñas ni servicios. |
| paginasamarillas.es (ficha 204811574) | Confirma nombre y "Carretera A Almensilla, 3" (título del resultado) | La página no se pudo abrir (bloqueada/vacía desde el entorno). |
| Búsquedas web (nombre, teléfono, Instagram/Facebook) | Sin web propia ni redes sociales localizadas | Instagram, Facebook y Google Maps están bloqueados desde el entorno: no se pudo confirmar al 100 %. |
| masquemedicos.com, doctoralia.es (Bollullos de la Mitación) | No listan la clínica | |

Conclusión: **no tiene web propia**; presencia limitada a ficha de Google y
directorios. Encaja en la campaña.

## 2. Datos confirmados y usados en la demo

| Dato | Valor | Confianza | Uso |
| --- | --- | --- | --- |
| Nombre | Clínica del Pie Alquería | Alta (3 fuentes) | Sí |
| Sector | Podología | Alta | Sí, solo como "podología" genérica |
| Dirección | Ctra. Almensilla, 3 · 41110 Bollullos de la Mitación | Alta (3 fuentes) | Sí |
| Teléfono | 685 89 82 65 | Alta (2 fuentes coinciden) | Sí, botón "Llamar" |
| Cita previa | Sí | Media (atributo de Google vía 1 directorio, y coherente con el sector) | Sí ("Atención con cita previa") |

## 3. Datos que deliberadamente NO se han usado

- **Horario**: dos fuentes se contradicen.
  - clinicaboreal (Google): L, M, J, V 10:00–13:30 · X 17:00–20:30 · S–D cerrado.
  - spain-web: L–J 9:30–13:30 y 17:30–20:30 · V 9:30–13:30.
  En la web no aparece ningún horario: se remite a la reserva online. Las
  horas del asistente son **de ejemplo** (mañana 10:00–13:00, tarde
  17:30–20:00, miércoles solo tarde por parecerse a la ficha de Google) y
  así se indica en pantalla. **Primer dato a confirmar con la clínica.**
- **Valoración 5,0 en Google**: sin número de reseñas ni textos; no se usa.
- **Entrada accesible / aseo neutro**: una sola fuente; no se usa.
- **Profesionales**: no hay ningún nombre público. No se nombra a nadie ni
  se habla de "equipo".
- **Servicios / tratamientos**: no hay ninguna fuente que liste
  tratamientos (quiropodia, estudio de la pisada, plantillas, uñas, pie
  diabético, etc.). **No se nombra ninguno.** Los tipos de cita son
  categorías genéricas de agenda: primera visita, revisión o seguimiento,
  consulta de podología.
- **Colegiación, titulaciones, años de experiencia, aparatología**: nada
  verificable; no aparece.
- **Precios, duración de las citas, formas de pago, seguros/mutuas**: no
  aparecen.
- **WhatsApp**: el teléfono es móvil, pero nada indica que atiendan por
  WhatsApp; no hay botón.
- **Email, redes sociales**: no encontrados.
- **Fotos**: ninguna disponible; ver `public/assets/clinica-del-pie-alqueria/README_ASSETS.md`.
- El origen del nombre "Alquería" no está documentado; no se interpreta.

## 4. Decisiones de diseño y contenido

- Dirección visual **sanitaria, limpia y moderna**: blanco y gris azulado,
  azul clínico (#1A5FD0) para acciones, azul marino (#123A6B / #0C2A50) para
  marca y bloques, verde (#2FA884) solo para "disponible / confirmado".
  IBM Plex Sans + IBM Plex Mono (horas, fechas y códigos con aspecto de
  agenda). Ni fotos de stock ni ilustraciones decorativas; fondo de
  cuadrícula muy tenue en el inicio. Tipografías no usadas en otras demos.
- Debe diferenciarse de la demo de **María Campos (podología, Pilas)**, que
  se construye en paralelo con línea personal/boutique. Aquí no hay figura
  de profesional: el protagonista es el sistema de cita.
- Prioridad comercial: **reservar sin llamar**. El inicio muestra ya las
  próximas horas libres (un toque lleva al asistente con el hueco elegido).
  Asistente en 4 pasos (tipo → día y hora → ficha básica → revisar) +
  confirmación con localizador.
- Sección **"Para la clínica"**: maqueta de la agenda interna donde aparece
  la reserva de prueba con su ficha (nombre, teléfono, email, fecha de
  nacimiento, tipo, motivo, avisos). Los demás huecos son "Ocupado"
  anónimos: no se inventan pacientes.
- Ficha básica: datos mínimos + consentimiento. No se piden datos de salud
  más allá de un "motivo" opcional en texto libre.
- Móvil: barra fija inferior "Llamar / Reservar cita", tiras de días con
  scroll horizontal, horas en rejilla de 3, botones de 44 px mínimo.
- Mapa: esquema SVG propio (no es un mapa real) + enlace "Cómo llegar" a
  Google Maps con la dirección. No hay embeds ni llamadas externas.
- Afirmaciones sobre recordatorios, SMS y cambios de cita describen el
  funcionamiento de la web propuesta, no algo que la clínica haga hoy, y en
  la confirmación se dice "con la web real, recibirías…".

## 5. Simulación y privacidad

- Ningún formulario se envía (`preventDefault`), no hay `fetch`, API,
  base de datos, email ni pagos. Comprobado con Playwright: 0 peticiones
  externas durante todo el flujo, también al confirmar.
- Avisos visibles: "Horarios de ejemplo", "Demostración: al confirmar no se
  crea ninguna cita", y pie "Web de demostración: no es la web oficial".
- `noindex, nofollow` en metadatos, cabecera `X-Robots-Tag` (serve.json) y
  `robots.txt` con `Disallow: /`.

## 6. Pendiente de confirmar con la clínica

1. Horario real y duración de cada tipo de cita.
2. Qué tratamientos quieren mostrar (para sustituir las categorías genéricas).
3. Nombre del profesional/es y si quieren aparecer.
4. Fotos del centro.
5. Si atienden por WhatsApp y si tienen email de contacto.
