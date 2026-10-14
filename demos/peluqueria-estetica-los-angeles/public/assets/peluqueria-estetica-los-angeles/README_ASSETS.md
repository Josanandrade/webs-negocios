# Assets — Peluquería y Estética Los Ángeles (interno, no se publica)

> Este archivo no se sirve en la preview: `next.config.ts` reescribe cualquier
> `*.md` a una ruta inexistente (404).

## Estado (14/10/2026)

La demo **no usa ninguna fotografía**. No se ha podido incorporar material
propio del salón:

- Instagram y Facebook: bloqueados desde el entorno de trabajo (no se pudo ver
  ni descargar nada). Además, la cuenta `@peluqueria_los_angeles` que aparece
  en buscadores no se ha podido vincular con seguridad a este salón.
- Google Business: bloqueado. Solo se ha visto una miniatura de 426×240 que
  reproducen directorios (volumus.es, peluqueriadechicas.es): demasiado pequeña.
- negocio.site: el servicio de Google está cerrado; no hay galería accesible.
- Periódico La Semana (26/12/2018, publirreportaje): tiene 2 fotos del salón,
  pero son de 2018, de un medio de terceros y no se pudieron descargar. No usar
  sin permiso.
- Fresha: solo imágenes genéricas de la plataforma (placeholders), descartadas.

En su lugar, la web usa una ilustración propia (mechones en SVG,
`src/components/Strands.tsx`) rotulada como «Ilustración orientativa · no es un
trabajo del salón». No hay stock ni imágenes generadas por IA.

## Qué pedir al salón (por prioridad)

1. **Antes/después de color** — 3 a 5 parejas (mechas, balayage, cambio de
   color). Mismo encuadre y luz, de espaldas o sin cara si la clienta lo
   prefiere. Con permiso escrito de la clienta. Formato vertical 4:5, ≥1600 px.
2. **Trabajos terminados** — 6 a 9 fotos de cortes, color y peinados (vertical
   4:5). Son el núcleo de una galería «Trabajos» que hoy no existe en la demo.
3. **Salón por dentro** — 2 fotos horizontales (puestos de trabajo, lavacabezas)
   con luz natural, sin clientes identificables.
4. **Fachada** — 1 foto horizontal de Av. de España, 110 N (ayuda a encontrarlo).
5. **Equipo** — foto de grupo o retratos, solo si quieren aparecer, con nombres
   y especialidad de cada una.
6. **Uñas/estética** — 2 o 3 fotos de manicura o uñas terminadas (cuadradas).
7. **Logotipo** en vector (SVG/PDF), si existe.

## Dónde irán

- Antes/después → nueva sección entre «Servicios» y «Carta de color» (slider
  accesible con teclado).
- Trabajos → galería a sangre después de la carta de color.
- Fachada → bloque «Visítanos».
- Las imágenes se guardarán aquí (`public/assets/peluqueria-estetica-los-angeles/`)
  en AVIF/WebP, con `next/image` y textos alternativos descriptivos.
