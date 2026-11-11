# Pérez Bilbao Psicología — demo

Web estática (Next.js 16, `output: "export"`) para la consulta de psicología Pérez Bilbao en Bollullos de la Mitación (Sevilla). Demo comercial privada: `noindex`, sin analytics y sin peticiones a terceros. La solicitud de cita es una simulación en el navegador: no envía ni guarda datos.

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
- `src/components/`: tablero-índice de portada y reserva simulada.
- `docs/INTERNAL_AUDIT.md`: fuentes, datos usados y descartados. **No se despliega.**

## Despliegue

Railway (Railpack) con raíz `demos/perez-bilbao-psicologia`, o cualquier hosting estático sirviendo `out/`.
