# Cristina García Peluquería & Estética — demo

Web estática (Next.js 16, `output: "export"`) para Cristina García Peluquería & Estética, Bollullos de la Mitación (Sevilla). Demo comercial privada: `noindex`, sin analytics, sin formularios y sin peticiones a terceros.

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

- `src/content/site.ts`: datos del centro (dirección, teléfono, horario, carta, reseñas, equipo, fotos).
- `src/app/`: única ruta pública, `/`.
- `src/components/`: carta por áreas, horario, «abierto ahora», barra móvil.
- `public/assets/cristina-garcia-peluqueria-estetica/`: fotografías (ver `README_ASSETS.md`, no se publica).
- `docs/INTERNAL_AUDIT.md`: investigación, fuentes y descartes. **No se despliega.**

## Despliegue

Railway (Railpack) con raíz `demos/cristina-garcia-peluqueria-estetica`, o cualquier hosting estático sirviendo `out/`. `serve.json` añade `X-Robots-Tag: noindex`.
