# Pura Bellezza — fotografías y assets

Estado actual: **ninguna foto real en la demo.** No hemos podido descargar ni
verificar material propio del centro (Instagram, Booksy y Google no son
accesibles desde el entorno de trabajo, y no usamos fotos cuya autoría no
podamos confirmar). Tampoco hay stock ni imágenes generadas por IA.

Cada hueco muestra una composición de línea fina sobre el degradado de la marca,
dentro del «espejo» ovalado. Al llegar las fotos, basta con dejarlas aquí y
rellenar `src` en `src/content/photos.ts`.

## Fotos que pedir al centro

| Clave (`photos.ts`) | Qué foto | Formato | Tamaño mínimo | Dónde se usa |
| --- | --- | --- | --- | --- |
| `hero` | Cabina de tratamiento con luz natural, sin personas o con la profesional de espaldas | Vertical 3:4 | 1200 × 1600 px | Espejo grande del hero |
| `facial` | Higiene facial en curso (manos, producto, piel), sin rostro identificable salvo permiso | Vertical 3:4 | 900 × 1200 px | Favoritos, rostro |
| `lashes` | Detalle de pestañas pelo a pelo terminadas | Vertical 3:4 | 900 × 1200 px | Favoritos, mirada |
| `nails` | Manos con semipermanente en tono nude o rosado | Vertical 3:4 | 900 × 1200 px | Favoritos, manos y pies |
| `body` | Aparato de radiofrecuencia o cabina corporal preparada | Vertical 3:4 | 900 × 1200 px | Favoritos, cuerpo |
| `space` | Fachada o recepción del local en Av. de la Constitución, 9 | Horizontal 5:4 | 1500 × 1200 px | Bloque «Visítanos» |

Recomendaciones:

- Luz natural o cálida suave; fondos claros. Evitar flash directo.
- El encuadre se recorta en óvalo: dejar aire alrededor del sujeto principal.
- JPG o WebP de calidad alta; Next.js genera AVIF/WebP optimizados.
- Si aparece una clienta reconocible, pedir autorización de imagen por escrito.

## Otros assets

- **Logotipo** en SVG o PDF vectorial. Mientras tanto se usa un logotipo
  tipográfico (Bodoni Moda) que no pretende ser su marca.
- **Retrato** de la responsable o del equipo, si desean aparecer (4:5,
  1200 × 1500 px). No incluido: no hay nombres confirmados públicamente.
