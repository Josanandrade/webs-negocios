# Animalex — fotografías y assets

> Este archivo no se sirve en la preview: `src/proxy.ts` devuelve 404 para
> cualquier `.md` bajo `/assets/`.

Estado actual: **ninguna foto real en la demo.** No se ha encontrado material
fotográfico oficial accesible: la ficha de Google Business (donde estarían las
fotos de la tienda) y la antigua web `negocio.site` están bloqueadas desde el
entorno de trabajo, y no se ha localizado Instagram ni Facebook propios. No se
usa stock ni imágenes generadas que puedan pasar por la tienda real.

El diseño no depende de fotos: la identidad se apoya en rótulos de pasillo,
colores de categoría, la etiqueta de precio del logotipo y el «tique» de la
consulta. Las fotos, cuando lleguen, suman; no tapan huecos.

## Fotos que pedir al negocio (por prioridad)

| # | Qué foto | Formato | Mínimo | Dónde iría |
| --- | --- | --- | --- | --- |
| 1 | Fachada de C. Lisboa 49 con el rótulo, de día | Horizontal 3:2 | 1600 × 1066 px | Sección «Visítanos», junto a la placa de la calle |
| 2 | Pasillo o estantería de alimentación, ordenada y bien iluminada | Vertical 4:5 | 1200 × 1500 px | Hero, detrás o junto al directorio «En tienda» |
| 3 | El dueño detrás del mostrador o atendiendo (si quiere salir) | Vertical 4:5 | 1000 × 1250 px | Bloque «Aquí no solo te despachan. Te asesoran.» |
| 4 | Una foto por pasillo (alimentación, higiene, juguetes, correas, transportines, accesorios) | Cuadrada 1:1 | 800 × 800 px | Tarjetas de «Seis pasillos» |
| 5 | Logotipo original en vectorial (SVG/PDF/AI) si existe | — | — | Cabecera, favicon y pie |

Opcionales: mascotas de clientes **solo con permiso escrito** de sus dueños;
marcas que más venden (para un bloque de marcas con sus logotipos oficiales).

## Cómo integrarlas

1. Dejar las imágenes en esta carpeta (`public/assets/animalex/`), en JPG o
   WebP de buena calidad; `next/image` genera AVIF/WebP y tamaños.
2. Añadir el `alt` descriptivo en el componente donde se usen.
3. No incluir datos personales ni caras de clientes sin permiso.
