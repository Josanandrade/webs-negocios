# Assets — Evelyn Centro de Estética

> Este archivo se elimina de la exportación en `scripts/postbuild.mjs`; no se publica.

No hay todavía fotografía propia verificada del centro. La web muestra paneles de luz abstractos (CSS) en su lugar, sin stock ni imágenes generadas.

## Fotos necesarias

| Hueco (`photos` en `src/content/site.ts`) | Qué foto | Formato recomendado |
|---|---|---|
| `hero` | Cabina o detalle de tratamiento facial con luz natural | Vertical 4:5, mín. 1600 px de alto |
| `facial` | Manos trabajando el rostro / producto en uso | Vertical 4:5 |
| `space` | Recepción, fachada en Av. de Pino Montano 3 o espacio | Horizontal 3:2 |

Opcionales: retrato de la profesional (solo con su permiso), logotipo en SVG, fachada.

## Cómo añadirlas

1. Guardar en esta carpeta como `.webp` o `.jpg` (p. ej. `hero.webp`).
2. En `src/content/site.ts`: `hero: { src: "/assets/evelyn-centro-estetica/hero.webp", alt: "Descripción real de la foto" }`.
3. `npm run build`.

## Reglas

- Solo material del propio centro y con su autorización.
- Nada de stock presentado como propio ni imágenes de IA simulando resultados.
- Nada de antes/después sin consentimiento escrito de la clienta.
