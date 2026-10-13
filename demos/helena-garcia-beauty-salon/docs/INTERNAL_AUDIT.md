# INTERNO · Auditoría comercial — Helena García Beauty Salon

> Documento interno de AvanttAI. **No forma parte de la web**: vive fuera de
> `src/app` y de `public/`, así que Next.js no lo sirve en ninguna ruta.
> No enlazar desde la demo ni enviarlo al salón.

Última revisión: octubre de 2026 (segunda pasada).

## Enfoque comercial

- Mensaje de fondo para la conversación con Helena: **no depender solo de una
  plataforma para presentar el negocio, la marca y los servicios.** Booksy es
  buena agenda, pero su escaparate es de Booksy: comparte pantalla con otros
  salones de Bormujos (incluida Pura Bellezza), con su diseño y sus reglas.
- La web propuesta no sustituye la agenda: la reserva termina en el sistema
  actual. Lo que aporta es marca propia, jerarquía de servicios, prueba social
  visible y un enlace propio para Instagram, campañas y tarjetas.

## Presencia digital encontrada

| Canal | Qué hay | Fiabilidad |
| --- | --- | --- |
| Booksy (ficha 86162, categoría "salón de uñas") | Carta con precios, reserva online, 5,0 con 106–131 reseñas según captura, "solo con cita previa" | Fuente principal |
| Instagram @salon.helenagarcia | ~255 seguidores, ~32 publicaciones; bio "la salud es sinónimo de belleza"; menciona @wiki.helenagarcia (no localizada) | Oficial |
| Facebook helenagarcianailss | Solo enlazado desde Páginas Amarillas; actividad sin confirmar | Baja |
| Páginas Amarillas, Cylex, Fresha | Dirección, teléfono, horario | Directorios |
| Web propia / TikTok / Google Business | No localizados (Google Maps no accesible desde el entorno) | — |

**Dependencia de plataformas: alta.** Booksy concentra escaparate, carta,
reseñas y reserva.

## Servicios verificados (Booksy salvo indicación)

- **Uñas:** rusa express 12 € (20 min); manicura rusa con semipermanente y
  refuerzo (1 h 15 min, precio no fiable); mantenimiento 15 días 23 € (50 min);
  primera visita desde otro salón 30 € (1 h); retirada de semipermanente desde
  8 €; diseño en uñas largas desde 10 €.
- **Pedicura:** básica sin esmaltado 15 € (30 min); rusa express sin esmaltado
  30 € (55 min).
- **Pestañas y cejas:** lifting 32 € (1 h 30); pack "Glamor" lifting +
  laminado de cejas 52 € (1 h 30). Reseña pública sobre lifting.
- **Tratamientos faciales:** AQUAPURE hidratación intensiva 42 € (1 h);
  SENSASKIN pieles sensibles 45 € (1 h 15). Existe un grupo "Tratamientos –
  Faciales" con más opciones (higiene facial con peeling, fotorrejuvenecimiento,
  cóctel de vitaminas, hilos), pero las capturas no permiten asociar precios.
  En la web solo se muestra "Higiene facial" sin precio.
- **Depilación láser:** prueba gratuita; zona pequeña 7 € (30 min); packs desde
  20 € (40 min); "casi todo el cuerpo" con precios contradictorios (30 € / 99 €)
  → "Consultar".
- **Depilación tradicional:** categoría facial y corporal en Booksy. Un resumen
  de búsqueda daba 5 € (facial) a 18 € (piernas), sin confirmar → "Consultar".

## Descartado por falta de confirmación

- **Modelado / remodelación corporal:** no aparece un menú corporal en la ficha.
- **Fotorrejuvenecimiento, hilos, cóctel de vitaminas:** precios no asociables;
  además rozan lo médico. No se muestran.
- **Microblading (200 €), extensiones de pestañas, masaje kobido:** solo en
  listados agregados de Booksy, sin poder atribuirlos a este salón.
- **Depilación con hilo y maquillaje:** vienen de Fresha, ligados a otra marca
  del mismo local (ver abajo).
- **Horario:** Booksy (10:00–20:30 entre semana, viernes hasta 14:30, según
  resumen de búsqueda) y Páginas Amarillas (10–15 y 17–20, sábado 10–14) no
  coinciden. La web dice "atención con cita previa" y remite a la agenda.
- **Teléfono fijo 955 712 105:** solo en una captura de Páginas Amarillas. Se
  usa el móvil 644 69 43 28 (coinciden Páginas Amarillas, Fresha y Cylex).
- **WhatsApp:** sin evidencia pública. Desactivado.
- **Nombres y textos completos de reseñas:** solo fragmentos breves sin autora.

## A confirmar con el salón

1. **Local 12 del Cerro Colarte:** Fresha lo asocia a "DOBLE-L Centro de
   estética" (tel. 610 46 56 69) y Cylex a "Fernanda Barahona Centro Estética".
   ¿Comparten espacio, es un nombre anterior o es otro negocio? Aclarar antes
   de contactar.
2. Horario real.
3. Precios vigentes de manicura con semipermanente, láser corporal y cera.
4. Carta completa de faciales.
5. Si usan WhatsApp.
6. Permiso para usar fragmentos de reseñas y fotos de Instagram.
7. Logo (no hay uno publicado; el de la demo es tipográfico).

## Privacidad de la demo

- `robots.txt` con `Disallow: /`, meta `noindex, nofollow` y cabecera
  `X-Robots-Tag` en todas las rutas.
- Sin analítica, cookies, píxeles ni mapas embebidos (solo un enlace a Google
  Maps).
- El asistente de reserva no envía datos: abre una hoja "modo demo" con enlace
  a la ficha pública de Booksy.
- Sin rutas internas: `/propuesta` eliminada (responde 404).

Fotos pendientes: ver `docs/README_ASSETS.md`.
