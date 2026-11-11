# Mapi de Paz · Consulta de Psicología — demo

Web estática (Next.js 16, `output: "export"`) para la consulta de psicología de Mapi de Paz en Bollullos de la Mitación (Sevilla). Demo comercial privada: `noindex`, sin analytics y sin peticiones a terceros. La solicitud de cita es una simulación en el navegador: no envía ni guarda datos.

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

- `src/content/site.ts`: datos públicos de la consulta.
- `src/app/`: única ruta pública, `/`.
- `src/components/`: cabecera, reserva simulada, acuarelas SVG, botón móvil.
- `docs/INTERNAL_AUDIT.md`: fuentes, datos usados y descartados. **No se despliega.**

## Despliegue

Railway (Railpack) con raíz `demos/mapi-de-paz-psicologia`, o cualquier hosting estático sirviendo `out/`.
