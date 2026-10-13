# Assets — Centro de Logopedia Esperanza Ruiz

Carpeta reservada para el material **propio del centro**. Ahora mismo está vacía
a propósito: no se ha usado ninguna foto de stock, de otra clínica ni generada
por IA. Mientras falte una foto, la web muestra una composición de identidad
(ondas + formas en la paleta de marca) diseñada para ese hueco, nunca un
"foto pendiente".

## Qué se encontró

- La web oficial (esperanzaruizlogopedia.com; por sus URLs, como `/copia-de-contacto`,
  parece hecha con un constructor tipo Wix) y sus fichas en directorios no fueron accesibles para descargar imágenes desde
  el entorno de trabajo, y no se localizó un Instagram/Facebook oficial
  verificable. **No hay ningún asset original descargado en esta demo.**
- El logotipo de la demo es una marca tipográfica provisional
  (`src/components/Wordmark.tsx`), no el logo del centro.

## Qué pedir al negocio (por orden de impacto)

| Archivo | Uso en la web | Formato y tamaño recomendado |
|---|---|---|
| `logo.svg` (y `logo-claro.svg` si existe versión en blanco) | Cabecera, pie, favicon | SVG vectorial; si no, PNG transparente ≥ 1000 px de ancho |
| `esperanza-retrato.webp` | Hero (arco principal) | Vertical 4:5, **1200×1500 px** mínimo. Luz natural, fondo neutro o la consulta, mirando a cámara, sonrisa tranquila |
| `consulta-principal.webp` | Sección "Quién te atiende" | Horizontal 4:3 o vertical 4:5, **1600×1200 px**. La sala de terapia ordenada, con luz |
| `sesion-logopedia.webp` | Reserva para futuras páginas de servicio | 4:3, **1600×1200 px**. Esperanza trabajando con un paciente adulto o un familiar **con consentimiento por escrito**; si es un menor, sin cara reconocible |
| `detalle-materiales.webp` | Sección "Cómo trabajamos" | Cuadrado o 4:3, **1200×1200 px**. Materiales de trabajo (láminas, espejo, juegos, depresores…) en detalle |
| `fachada-edificio-cristina.webp` (opcional) | Contacto / cómo llegar | 4:3, 1600×1200 px. Portal del Edificio Cristina para que el paciente lo reconozca |

Recomendaciones generales:

- Enviar los originales (JPG/HEIC del móvil sirven); la conversión a WebP y el
  recorte se hacen aquí.
- Pedir consentimiento escrito de cualquier paciente que aparezca. Con menores,
  mejor manos, materiales o espaldas.

## Cómo sustituir un hueco

1. Guardar el archivo en esta carpeta con el nombre de la tabla.
2. Rellenar la entrada en `src/lib/photos.ts`, por ejemplo:

```ts
retrato: {
  src: "/assets/esperanza-ruiz-logopedia/esperanza-retrato.webp",
  alt: "Esperanza Ruiz en su consulta del Paseo de las Delicias",
  width: 1200,
  height: 1500,
},
```

El componente `PhotoSlot` cambia automáticamente de la composición a la foto
real (con `next/image`, tamaños responsivos y carga diferida).

## Otros datos útiles que pedir

- Horario actual de atención (las fuentes públicas no coinciden).
- Número exacto de reseñas en Google y permiso para citar 2–3 reseñas literales.
- Si atiende por WhatsApp en el 625 903 387 (se añadiría un botón directo).
- Si mantiene las sesiones online (la web actual las menciona en el contexto del
  COVID-19; Doctoralia indica que no ofrece consulta online).
- Formación, años de experiencia y especializaciones (por ejemplo, terapia
  miofuncional, TEA) para ampliar la sección "Quién te atiende".
- Si hay más logopedas en el equipo (la web actual habla de "logopedas
  colegiados" en plural).
