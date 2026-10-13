# Fotografías de MG&I — guía de sustitución

La demo funciona sin fotos: cada hueco muestra una composición editorial
(bloque de color, letra del nombre y la línea del "hilo"). En cuanto se copie
aquí un archivo con el **nombre exacto**, la web usará la foto real en ese
hueco tras un nuevo `npm run build`. No hace falta tocar código.

Los huecos y sus textos alternativos están en `src/content/photos.ts`.

## Estado actual

No se ha incluido **ninguna fotografía**. No hemos localizado perfiles
oficiales del negocio (Instagram, Facebook, Google) desde los que obtener
material propio verificable, y las imágenes de directorios de terceros no se
usan por no poder garantizar su procedencia ni sus derechos.

## Shooting mínimo (7 fotos)

| Archivo | Qué mostrar | Ratio | Tamaño recomendado | Dónde aparece |
|---|---|---|---|---|
| `hero-centro.webp` | Interior del centro o fachada con el nombre, luz natural, sin gente o con la profesional de espaldas | 4:5 vertical | 1600 × 2000 px | Portada (en móvil se recorta a ~1:1.1, dejar el motivo centrado) |
| `tratamiento-facial.webp` | Tratamiento facial en curso: manos de la profesional y rostro de una clienta real con permiso | 4:5 vertical | 1600 × 2000 px | Tarjeta "Tratamientos faciales" |
| `profesional.webp` | Retrato de la profesional (o del equipo) en su puesto de trabajo | 4:5 vertical | 1600 × 2000 px | Sección "El centro" |
| `detalle-01.webp` | Macro del trabajo con hilo en las cejas (el servicio estrella) | 4:5 vertical | 1200 × 1500 px | Sección "Cejas con hilo" |
| `detalle-02.webp` | Detalle de un tratamiento de piel: manos, textura, producto en uso (sin marcas visibles salvo que se usen realmente) | 4:5 vertical | 1200 × 1500 px | Tarjeta "Dermaplaning" |
| `instalaciones-01.webp` | Cabina de tratamientos, ordenada, con luz natural | 4:3 horizontal | 2000 × 1500 px | Sección "El centro" |
| `resultado-01.webp` | Resultado real de cejas (antes/después en una sola imagen, misma luz y encuadre) con consentimiento escrito | 1:1 cuadrado | 1600 × 1600 px | Sección "Resultados" |

## Criterios

- Formato **WebP**, calidad 80–85, sRGB, < 400 KB por archivo.
- Solo fotografías **del propio centro**. Nada de catálogo de marcas, stock,
  otras clínicas ni imágenes generadas con IA haciéndose pasar por clientas.
- Resultados y rostros de clientas **solo con consentimiento por escrito**.
- Luz natural o continua cálida; evitar flash directo y filtros que alteren la
  piel (no prometemos lo que una cita no puede dar).
- Si una foto tiene otra proporción, se recorta automáticamente (`object-fit:
  cover`); conviene dejar aire alrededor del motivo.
- Para añadir un hueco nuevo: crear la entrada en `src/content/photos.ts` y
  usar `<Photo slot="..." />`.

## Material de marca que pedir

- Logo original (vectorial si existe) o confirmación de que no lo hay.
- Perfiles oficiales (Instagram, Google Business) para enlazarlos.
