# Marta Benítez · Belleza & Barbería — demo

Web estática (Next.js 16, `output: "export"`) para el Salón de belleza Marta Benítez & Barbería especializada, Dos Hermanas (Sevilla). Demo comercial privada: `noindex`, sin analytics y sin peticiones a terceros.

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

- `src/content/site.ts`: datos del negocio (dirección, teléfono, horario, carta, reseñas, fotos).
- `src/app/`: única ruta pública, `/`.
- `src/components/`: carta con pestañas, horario, «abierto ahora», barra móvil, paneles de imagen.
- `public/assets/marta-benitez-belleza-barberia/`: fotografías (ver `README_ASSETS.md`, no se publica).
- `docs/INTERNAL_AUDIT.md`: investigación, fuentes y descartes. **No se despliega.**

## Despliegue

Railway (Railpack) con raíz `demos/marta-benitez-belleza-barberia`, o cualquier hosting estático sirviendo `out/`. `serve.json` añade `X-Robots-Tag: noindex`.
