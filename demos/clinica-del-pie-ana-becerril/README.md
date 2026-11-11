# Clínica del Pie · Ana Mª Becerril (demo)

Demo estática (Next.js 16, `output: "export"`) para la consulta de podología de Ana Mª Becerril en Pilas.

- `npm run dev`: desarrollo.
- `npm run build`: exporta a `out/` y ejecuta `scripts/postbuild.mjs` (copia `serve.json`, quita `.md`, falla si hay texto interno).
- `npm start`: sirve `out/` con `serve` (cabecera `X-Robots-Tag: noindex, nofollow`).

Datos de la consulta en `src/content/site.ts`. Investigación y decisiones en `docs/INTERNAL_AUDIT.md` (no se publica).
La reserva es simulada: no envía ni guarda nada.
