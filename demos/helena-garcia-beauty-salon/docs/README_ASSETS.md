# Assets · Helena García Beauty Salon (interno)

> Documento interno. Vive en `docs/` (no en `public/`) para que no se publique.
> Las fotos se dejan en `public/assets/helena-garcia-beauty-salon/`.

Ahora mismo **no hay fotos reales del salón** en la demo: las de Instagram y
Booksy no se han podido descargar desde el entorno de trabajo, y no se usa stock,
imágenes generadas ni trabajos de otros centros haciéndolos pasar por propios.

Cada hueco muestra una composición de marca con la etiqueta "Foto real
pendiente". Para sustituirla basta con dejar el archivo con el nombre exacto en
`public/assets/helena-garcia-beauty-salon/`: la web lo detecta en el build y lo
muestra con `next/image`, sin salto de layout (la proporción ya está reservada).
Los huecos se configuran en `src/content/photos.ts`.

## Huecos actuales

| Archivo | Proporción | Dónde sale | Qué foto pedir |
| --- | --- | --- | --- |
| `hero-manos.jpg` | 4:5 (1080×1350) | Reservado para el hero | Manos con manicura terminada, luz natural, fondo limpio |
| `helena.jpg` | 4:5 | "El salón" | Retrato de Helena trabajando (cara visible, vertical) |
| `feed-rusa.jpg` | 9:16 (1080×1920) | "Recién hechas" | Manicura rusa terminada, detalle de cutícula |
| `feed-lifting.jpg` | 9:16 | "Recién hechas" | Lifting de pestañas o laminado de cejas, antes/después |
| `feed-salon.jpg` | 9:16 | "Recién hechas" | Salón por dentro: mesa de manicura y luz |
| `feed-pedicura.jpg` | 9:16 | "Recién hechas" | Pedicura terminada |
| `feed-facial.jpg` | 9:16 | "Recién hechas" | Cabina de tratamientos faciales (sin clienta o con permiso) |
| `feed-colores.jpg` | 9:16 | "Recién hechas" | Carta de colores de semipermanente |

## Material ideal si Helena responde

1. **Retrato de Helena** (2–3 opciones, vertical y horizontal).
2. **Manos realizando una manicura** (proceso, para "Así es venir a Helena").
3. **Manicura terminada** (varias: nude, color, diseño en uñas largas).
4. **Pedicura terminada.**
5. **Cejas / lifting de pestañas**, idealmente antes y después.
6. **Tratamiento facial** en cabina (o la cabina preparada).
7. **Equipo de láser / zona de depilación**, sin clientas.
8. **Salón y cabina**: mesa, sillón, luz, detalles de marca.
9. **Fachada y entrada** del Edificio Cerro Colarte, para "Dónde estamos".
10. **Logo** en vector (SVG/PDF) si existe.
11. **Permiso** para usar 3–6 publicaciones de @salon.helenagarcia y fragmentos
    de reseñas de Booksy.

Formato: JPG, lado largo ≥ 1600 px, sin filtros fuertes; vale móvil en vertical.
