# María Campos Rodríguez · Podología (Pilas) — demo

Web estática (Next.js 16, `output: "export"`) para la consulta de podología de María Campos Rodríguez en Pilas (Sevilla). Demo comercial privada: `noindex`, sin analytics y sin peticiones a terceros. La reserva es simulada: no envía ni guarda nada.

## Comandos

```bash
npm install
npm run dev        # desarrollo
npm run build      # exporta a out/ y valida que no se cuele contenido interno
npm start          # sirve out/ (usa $PORT, por defecto 3000)
npm run lint
npm run typecheck
```

## Estructura

- `src/content/site.ts`: datos de la consulta y motivos de cita.
- `src/app/`: única ruta pública, `/`.
- `src/components/Booking.tsx`: reserva simulada (motivo, día, hora, datos, confirmación + vista de agenda y ficha).
- `docs/INTERNAL_AUDIT.md`: fuentes, datos confirmados y descartes. **No se despliega.**

## Despliegue

Railway (Railpack) con raíz `demos/maria-campos-podologia`, o cualquier hosting estático sirviendo `out/`. `serve.json` añade `X-Robots-Tag: noindex`.
