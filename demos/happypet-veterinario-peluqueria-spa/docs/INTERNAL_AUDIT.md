# HappyPet · Auditoría interna (NO se despliega)

Documento interno de la campaña de prospección. Vive en `docs/`, fuera de
`public/` y de `src/`, así que no forma parte de la exportación estática.

- Negocio: **HAPPYPET Centro Veterinario · Peluquería & Spa**
  (en un directorio: "Consultorio y Centro Veterinario Happypet").
- Dirección: C. Virgen de la Soledad, 8, 41110 Bollullos de la Mitación (Sevilla).
- Fecha de revisión: 14/10/2026.
- Demo no solicitada por el negocio.

## 1. Presencia digital actual

| Canal | Estado | Fuente / nota |
| --- | --- | --- |
| Web propia | **No existe** | Ningún directorio enlaza web propia; solo Facebook. Búsquedas de nombre + localidad sin resultados de dominio propio. `happypet.es` es otro negocio (paseo de perros en Torrevieja). |
| Google Business | Existe | Datos vistos a través de clinicaveterinariawaksman.es (copia de la ficha, publicada 08/09/2025): 4,6 ★ con 10 reseñas. clinicaveterinaria.es indica 5,0 con 9. Atributos: "propiedad de mujeres", entrada accesible, cita previa. |
| Facebook | Existe: "HAPPY PET" | https://www.facebook.com/Veterinariahappypet76/ · no se pudo abrir (bloqueado). Actividad desconocida. |
| Instagram | **No encontrado** | Las cuentas "happypet" encontradas son de otros países/ciudades (p. ej. @happypets.sevilla es otra peluquería canina). Instagram está bloqueado desde el entorno: no se pudo confirmar al 100 %. |
| WhatsApp | **No verificado** | Existe un móvil (639 871 141) en un único directorio, sin indicación de WhatsApp. No se ha puesto botón de WhatsApp. |
| Directorios | clinicaveterinaria.es, clinicaveterinariawaksman.es, es.michigatitos.com, aljarafe5sentidos.com | |

Conclusión: **no tiene web propia moderna**; presencia limitada a ficha de
Google, Facebook y directorios con datos contradictorios. Se continúa.

## 2. Datos de contacto

| Dato | Valor | Confianza | Uso en la demo |
| --- | --- | --- | --- |
| Teléfono fijo | 955 27 71 19 | Alta (4 fuentes) | Sí, CTA principal |
| Móvil | 639 871 141 | Baja (1 fuente: aljarafe5sentidos.com) | No |
| Email | happypet.clinicaveterinaria1@gmail.com | Baja (1 fuente) | No |
| Dirección | C. Virgen de la Soledad, 8 | Alta | Sí |

## 3. Horario (CONTRADICTORIO, confirmar)

| Fuente | Horario |
| --- | --- |
| Google (vía waksman, 09/2025) | L–V 9:30–14:00 y 17:00–19:30 · S–D cerrado |
| clinicaveterinaria.es | L–V 10–14 y 17:30–20:30 · S 10–13 · D cerrado |
| es.michigatitos.com | L–V 9:30–15:00 · S–D cerrado |

En la demo se usa el de Google (la fuente más directa y reciente). Está en
`src/content/site.ts` y es el primer dato a confirmar con el negocio.

## 4. Servicios

### Veterinaria
- **Verificado**: es centro/consultorio veterinario (nombre en todas las
  fuentes); atienden gatos (reseña de Claudio: "nos resolvieron el problema de
  nuestra gata"); reseñas que valoran la parte veterinaria (Raquel).
- **Descrito por directorio (texto genérico, confianza media)**: "consultas
  preventivas, diagnósticos y tratamientos".
- **Inferido y presentado de forma genérica**: vacunación, desparasitación,
  revisiones (medicina preventiva básica de cualquier consultorio). Confirmar.
- **NO incluido por no estar verificado**: cirugía, análisis/laboratorio,
  ecografía/radiología, hospitalización, urgencias 24 h (michigatitos lista
  "urgencias 24 h" como servicio genérico de la zona, no de HappyPet).
- En la web, para urgencias fuera de horario se remite a "un servicio de
  urgencias veterinarias", sin prometer nada propio.

### Peluquería & Spa
- **Verificado**: peluquería (nombre del negocio; reseña de Raquel:
  "Peluquería y veterinaria perfectas"); también gatos (reseña negativa de
  Fany: "Les han cortado los bigotes a mi gata").
- **Spa**: solo consta en el nombre; sin detalle. En la demo se describe de
  forma genérica ("un baño más mimado y un cuidado extra de piel y pelo").
- **Presentado como habitual, confirmar**: baño y secado, corte/arreglo,
  higiene (uñas, oídos).
- Sin precios publicados: la demo no muestra precios.

## 5. Equipo
- Se nombra a **Yngrid** en una reseña (sin función conocida). No se usa su
  nombre fuera de la cita literal de la reseña.
- Google marca el negocio como "propiedad de mujeres"; la demo dice "llevado
  por mujeres". Confirmar que les parece bien.
- Ningún veterinario identificado (nombre ni número de colegiado).

## 6. Reseñas usadas (texto literal, Google)
Eva C., Raquel M., Claudio V. (recortada la primera frase "Todo bien."),
Coral E. (añadida coma), Tania M. No se muestra la nota media porque las
fuentes no coinciden (4,6/10 vs 5,0/9). Reseña negativa (Fany, 1★, bigotes
de la gata) no se usa; conviene tenerla en cuenta en la conversación comercial
(la web explica que en peluquería "lo hablamos antes de empezar").

## 7. Datos descartados
- Horarios de clinicaveterinaria.es y michigatitos (contradicen Google).
- "Urgencias 24 h", "cirugía", "laboratorio clínico" (listas genéricas del
  directorio para toda la localidad).
- Móvil y email (una sola fuente).
- Nota media de reseñas.
- Reseña de Christopher ("…y una mujer hermosa"): inadecuada.
- Cuentas de Instagram "happypet" de otros negocios.
- Dominio happypet.es (otro negocio).

## 8. Fotos
Ver `public/assets/happypet-veterinario-peluqueria-spa/README_ASSETS.md`.
Ninguna foto real descargable desde el entorno; no se usa stock.

## 9. Por qué necesita web (argumentario comercial)
- Datos públicos contradictorios (3 horarios distintos): la gente llama o va
  cuando está cerrado.
- Sin web, nadie entiende que son **dos servicios** (veterinaria + peluquería)
  ni cuál elegir; la demo resuelve eso con dos accesos y un selector.
- Todo el contacto depende del teléfono fijo; una web con horario, "abierto
  ahora" y cómo llegar reduce llamadas perdidas.
- Facebook como único canal propio, sin actividad verificable.

## 10. Bloqueos de verificación
Desde el contenedor están bloqueados Google Maps, Instagram, Facebook, CDN de
imágenes de Google y de los directorios. Lo visto de Google procede de copias
en directorios (WebFetch). Pendiente de que Jose lo revise a mano:
ficha de Google (horario real, fotos), Facebook (actividad, WhatsApp) e
Instagram.

## 11. Decisiones de diseño
- Concepto "Dos puertas, una casa": Salud (verde petróleo #17524F) y Cuidado
  (albaricoque #E39A72) siempre con color, icono y nombre propios.
- Tipografía: Young Serif (titulares) + Atkinson Hyperlegible Next (texto).
  No usadas en otras demos.
- Sin huellas ni ilustraciones infantiles; arco de puerta como único motivo.
- Conversión: llamada (cabecera, portada, cada sección, barra móvil),
  selector "¿Qué le pasa hoy?" que orienta y termina en llamada, cómo llegar.
- Sin formularios: el selector no envía ni guarda datos.
