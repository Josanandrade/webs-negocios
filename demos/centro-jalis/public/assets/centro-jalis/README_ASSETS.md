# Fotografías de Jalis — guía de sustitución

La demo funciona sin fotos: cada hueco muestra una composición de identidad
(fondo verde o piedra, la «J» del sello y una etiqueta «Foto real · …» que
deja claro qué imagen falta). No se presenta nada como si fuera del centro.

## Estado actual

**No se ha incluido ninguna fotografía ni el logotipo del centro.**

- No tiene web propia de la que tomar material.
- Booksy, Fresha y Facebook (/centrojalis) son las únicas fuentes con
  imágenes, pero desde el entorno de trabajo esas plataformas no eran
  accesibles y, además, su material no puede reutilizarse sin permiso del
  centro ni garantía de autoría.
- No se ha localizado un Instagram oficial.
- No se ha usado stock, fotos de otros centros ni imágenes generadas con IA.

El sello «J» y el logotipo «Jalis · Belleza y bienestar» son una **propuesta
de identidad para la demo**, no el logotipo oficial. Si el centro tiene logo,
pedirlo en vector (SVG/PDF/AI) y sustituir `src/components/Brand.tsx`.

## Cómo sustituir una foto

1. Copiar el archivo en esta carpeta con el nombre indicado.
2. En `src/content/photos.ts`, cambiar `src: null` por
   `src: "/assets/centro-jalis/<archivo>"` (el `alt` ya está escrito).
3. `npm run build`. `next/image` genera AVIF/WebP y tamaños responsive.

## Sesión mínima a pedir (5 fotos + 3 opcionales)

| Hueco (`photos.ts`) | Archivo | Qué mostrar | Ratio · tamaño | Dónde aparece |
|---|---|---|---|---|
| `hero` | `hero-cabina.webp` | Cabina principal preparada, luz natural, camilla vestida, aparatología al fondo. Sin personas o profesional de espaldas | 4:5 vertical · 1600×2000 | Portada (es la primera impresión) |
| `facial` | `tratamiento-facial.webp` | Tratamiento facial en curso: manos de la profesional y clienta real **con consentimiento escrito** | 4:5 · 1600×2000 | «El centro» |
| `centro` | `recepcion.webp` | Recepción / zona de espera, ordenada | 4:3 horizontal · 2000×1500 | «El centro» (foto grande) |
| `equipo` | `equipo.webp` | Retrato del equipo en el centro, uniforme, mirada a cámara | 4:5 · 1600×2000 | «El centro» |
| `fachada` | `fachada.webp` | Fachada con el rótulo en C/ Zambra, de día | 4:3 · 2000×1500 | «Visítanos» |

Opcionales (para una segunda versión):

- Detalle de la aparatología real (radiofrecuencia, dermapen, láser) para la
  sección «Tratamiento estrella».
- Detalle de manicura / cejas terminadas, para la carta.
- Antes/después **solo** con consentimiento escrito, misma luz y encuadre, y
  sin prometer resultados.

## Criterios

- WebP, calidad 80–85, sRGB, < 500 KB por archivo.
- Luz natural o continua cálida; sin filtros que alteren la piel.
- Dejar aire alrededor del motivo: los huecos recortan con `object-fit: cover`
  (en móvil la portada pasa a ~1:1.1).
- Nada de marcas visibles salvo las que el centro use de verdad.
