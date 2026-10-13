# Evelyn Centro de Estética — demo

Web estática (Next.js 16, `output: "export"`) para Evelyn Centro de Estética, Pino Montano (Sevilla). Demo comercial privada: `noindex`, sin analytics y sin peticiones a terceros.

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

- `src/content/site.ts`: todos los datos del negocio (dirección, teléfono, horario, tratamientos, fotos).
- `src/app/`: única ruta pública, `/`.
- `public/assets/evelyn-centro-estetica/`: fotografías (ver `README_ASSETS.md`, no se publica).
- `docs/INTERNAL_AUDIT.md`: investigación, fuentes y datos descartados. **No se despliega.**

## Despliegue

Cualquier hosting estático sirviendo `out/`, o `npm start` (Railway/Nixpacks). `serve.json` añade `X-Robots-Tag: noindex`.
