# Academia Diversidad — demo

Web estática (Next.js 16, `output: "export"`) para Academia Diversidad, en Aznalcázar (Sevilla). Demo comercial privada: `noindex`, sin analytics y sin peticiones a terceros. La solicitud de información o matrícula es una simulación en el navegador: no envía, no guarda y no registra nada.

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

- `src/content/site.ts`: datos públicos de la academia (solo nombre, localidad y teléfono).
- `src/app/`: única ruta pública, `/`.
- `src/components/`: ilustración de portada, selector familia/alumno y solicitud simulada en tres pasos.
- `docs/INTERNAL_AUDIT.md`: fuentes, datos usados y descartados. **No se despliega.**

## Despliegue

Railway (Railpack) con raíz `demos/academia-diversidad`, o cualquier hosting estático sirviendo `out/`.
