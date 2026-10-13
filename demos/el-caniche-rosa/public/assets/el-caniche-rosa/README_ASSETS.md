# El Caniche Rosa — fotografías y assets

> Este archivo no se sirve en la preview: `src/proxy.ts` devuelve 404 para
> cualquier `.md` bajo `/assets/`.

Estado actual: **ninguna foto real en la demo.** El material propio del negocio
está en Instagram (@elcanicherosa.tomares), TikTok (@elcanicherosa), Facebook y
su ficha de Booksy, pero ninguna de esas plataformas es accesible desde el
entorno de trabajo y no usamos fotos cuya autoría y permiso no podamos
confirmar. Tampoco hay stock ni imágenes generadas por IA haciéndose pasar por
trabajo real.

Cada hueco muestra un «pompón»: un círculo de color de la marca con un
encuadre del caniche geométrico del logotipo. Es decorativo (`aria-hidden`) y
no lleva texto de relleno. Al llegar las fotos, basta con dejarlas en esta
carpeta y rellenar `src` en `src/content/photos.ts`; el marco circular, el
`alt` y el tamaño responsive ya están preparados.

## Fotos que pedir al negocio

| Clave (`photos.ts`) | Qué foto | Formato | Mínimo | Dónde se usa |
| --- | --- | --- | --- | --- |
| `hero` | Un perro recién arreglado, mirando a cámara, sobre fondo limpio (idealmente un caniche) | Cuadrada 1:1, sujeto centrado | 1200 × 1200 px | Círculo grande del inicio |
| `look1` | Corte terminado de un perro de pelo rizado (caniche, bichón) | 1:1 | 900 × 900 px | Bloque «Lo que dicen», círculo grande |
| `look2` | Perro de doble capa tras el deslanado (golden, pastor) | 1:1 | 700 × 700 px | Bloque «Lo que dicen», círculo mediano |
| `look3` | Perro pequeño recién bañado y peinado | 1:1 | 600 × 600 px | Bloque «Lo que dicen», círculo pequeño |

Fotos opcionales para una segunda versión (no tienen hueco todavía):

- **Antes / después** del mismo perro, mismo encuadre y luz (pareja 1:1).
- **La peluquería por dentro**: mesa de trabajo, bañera, secador. Sin clientes.
- **Fachada** con el rótulo, para el bloque «Dónde y cuándo».
- **La persona o el equipo** trabajando, solo si quieren aparecer (4:5).

Recomendaciones:

- Luz natural, fondo claro y sin objetos alrededor: el encuadre es circular,
  conviene dejar aire alrededor del perro.
- JPG o WebP de calidad alta; Next.js genera AVIF/WebP optimizados.
- Pedir permiso por escrito a los dueños de los perros que aparezcan, aunque
  sean fotos ya publicadas en sus redes.

## Otros assets

- **Logotipo**: el negocio usa el nombre con emojis (🐩💖) en redes; no se ha
  encontrado un logotipo vectorial. La demo usa un logotipo propio (caniche
  hecho de pompones + nombre en Bricolage Grotesque). Si tienen logo, pedirlo
  en SVG o PDF y decidir con ellos si se mantiene o se evoluciona.
- **Favicon**: `src/app/icon.svg`, derivado del mismo caniche.
