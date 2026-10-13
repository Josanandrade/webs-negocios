# Assets · Helena García Beauty Salon

Carpeta de fotografías de la demo. **Ahora mismo no contiene fotos reales del
salón**: no se han podido descargar las de Instagram ni Booksy desde el entorno
de trabajo, y no se usa stock haciéndolo pasar por propio.

Cada hueco de la web muestra una composición de marca con la etiqueta
"Foto real pendiente". Para sustituirla basta con dejar aquí el archivo con el
nombre exacto: la web lo detecta en el build y lo muestra con `next/image`
(AVIF/WebP, sin salto de layout porque la proporción ya está reservada).

| Archivo | Proporción | Dónde sale | Qué foto pedir |
| --- | --- | --- | --- |
| `hero-manos.jpg` | 4:5 (1080×1350) | Reservado para el hero | Manos con manicura terminada, luz natural, fondo limpio |
| `helena.jpg` | 4:5 (1080×1350) | "El salón" | Helena trabajando en su mesa (retrato vertical, cara visible) |
| `feed-rusa.jpg` | 9:16 (1080×1920) | Galería "Recién hechas" | Detalle de manicura rusa (cutícula) |
| `feed-salon.jpg` | 9:16 | Galería | Interior del salón, mesa y luz |
| `feed-lifting.jpg` | 9:16 | Galería | Lifting de pestañas, idealmente antes/después |
| `feed-pedicura.jpg` | 9:16 | Galería | Pedicura terminada |
| `feed-colores.jpg` | 9:16 | Galería | Carta de colores de semipermanente |

Además convendría pedir:

- **Logo** en vector (SVG/PDF) si existe. Si no, el wordmark tipográfico de la
  demo puede quedarse como logo.
- **Fachada / entrada** del Edificio Cerro Colarte (para "Dónde estamos").
- Permiso para usar 3–6 publicaciones de @salon.helenagarcia.

Formato recomendado: JPG, lado largo ≥ 1600 px, sin filtros fuertes, móvil en
vertical vale. Los slots se configuran en `src/content/photos.ts`.
