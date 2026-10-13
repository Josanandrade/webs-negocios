# Assets de Factoría Tattoo

Este archivo no se publica: el build elimina cualquier `.md` de `dist/` y el
servidor solo sirve tipos de archivo conocidos.

## Estado

No hay fotos reales en la demo. No se han usado imágenes de stock, de otros
estudios ni generadas por IA. Cada pieza del portfolio se muestra como una
"placa" gráfica del estilo (patrón + sigla) que se sustituye en cuanto haya foto.

## Cómo añadir trabajos reales

1. Exporta la foto en **WebP** (o AVIF), lado largo 1600 px, calidad ~80.
2. Guárdala aquí con el patrón `<artista>-<estilo>-<nn>.webp`,
   p. ej. `inkieto-neotradicional-01.webp`.
3. En `src/data.ts`, en la entrada de `works`, añade
   `src: "/assets/factoria-tattoo/inkieto-neotradicional-01.webp"` y un `alt`
   descriptivo (qué se ve, no "tatuaje").
4. Ajusta `shape` (`tall` 4:5, `square`, `wide` 2:1) al encuadre de la foto.

## Necesario del estudio

| Asset | Uso | Formato |
|---|---|---|
| Logotipo | Cabecera y pie (hoy es tipográfico) | SVG |
| 3+ trabajos por artista | Equipo + portfolio | WebP 1600 px |
| Retrato o foto trabajando de cada artista | Ficha del equipo (opcional) | WebP 1200 px |
| 1–2 fotos del local | Sección "Ven al estudio" (opcional) | WebP 1600 px |

Todas las fotos deben contar con permiso del estudio y del cliente tatuado.
