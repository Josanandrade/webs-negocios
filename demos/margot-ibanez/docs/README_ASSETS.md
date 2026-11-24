# Recursos visuales · Margot Ibáñez (v2, 2026-11-23)

## Usados

| Archivo | Origen | Dónde |
|---|---|---|
| `demo-host/assets/img/margot-retrato-{560,960}.webp` | Retrato en blanco y negro incluido en el Word de Margot (image1) | Portada |
| `demo-host/assets/img/margot-sonrisa-{560,960}.webp` | Retrato con gafas incluido en el Word de Margot (image2) | Sobre Margot |

Convertidos a escala de grises y WebP (calidad 78). Se asume que son de Margot y que autoriza su uso: confirmarlo.

Se han eliminado las ilustraciones SVG de la demo anterior (`assets/galeria/`).

## No hay galería

El Word no trae fotos de trabajos, así que no hay sección de galería ni antes/después. No se han generado ni usado imágenes de terceros.

## Pedir a Margot

1. 6 a 12 fotos de trabajos propios (cejas, labios, ojos y, si quiere, eliminación láser), con luz natural, mismo encuadre, y permiso de las clientas para publicarlas. Con ellas se añade una sección "Trabajos" tras los tratamientos.
2. Confirmar que los dos retratos son suyos y que se pueden publicar, y quién es el fotógrafo si quiere crédito.
3. 2 o 3 fotos del salón o la cabina (opcional).
4. Logotipo, si tiene.
5. Fotos de diplomas o premios, si quiere mostrarlos.

## Fotos de tratamientos (2026-11-24)

Recortadas del cartel "Lista de tratamientos" que envió Margot (16 fotos, unos 220 × 165 px cada una) y guardadas en `demo-host/assets/img/tratamientos/<nombre>.webp` (4:3). Para cambiar una foto basta con sustituir el archivo con el mismo nombre; si es más grande (por ejemplo 800 × 600) se verá más nítida.

Tres tratamientos del texto original no tienen foto en el cartel y siguen con su trazo dibujado dentro del mismo marco: Hollywood Peel, eliminación de micropigmentación de cejas y eliminación de micropigmentación de labios. Para añadirles foto, sustituye el `<svg>` de su ranura por un `<img>` como el de los demás.

Pedir a Margot: las fotos originales del cartel a más resolución, y fotos para esos tres tratamientos.

## Vídeos

La sección "En vídeo" está en `index.html`, entre "Sobre Margot" y "Preguntas", oculta con `hidden`. Dentro hay dos ejemplos comentados:

- **Vídeo propio (mp4):** guardar `video-1.mp4` (H.264, idealmente menos de 15 MB) y su portada `video-1-portada.webp` en `demo-host/assets/video/`. Se carga solo al pulsar play (`preload="none"`) y usa los controles del navegador.
- **YouTube o Vimeo:** basta el identificador (lo que va tras `v=` en YouTube o el número de Vimeo) en `data-id`, y `data-embed="youtube"` o `"vimeo"`. No se carga nada de esos servicios hasta que la visitante pulsa "Reproducir vídeo" (YouTube en modo sin cookies). Si no se pone portada en YouTube, se usa la miniatura del propio vídeo.
- **Vertical (reel):** añadir la clase `video--vertical` a la `<figure>`.

Para publicarla: copiar un ejemplo fuera del comentario, rellenarlo y quitar `hidden` de la `<section>`. Con JavaScript la sección también se muestra sola en cuanto tiene un vídeo.
