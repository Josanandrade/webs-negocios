# Clínica Veterinaria Camas — demo

Web demo para Clínica Veterinaria Camas (Calle Santa Paula, 6 · Camas, Sevilla).
Next.js 16 · React 19 · CSS propio · sin dependencias de runtime extra.

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm run build && npm start
```

- Una sola ruta pública: `/` (más `robots.txt` e `icon.svg`).
- Privada: `noindex, nofollow` (meta + cabecera `X-Robots-Tag`), `robots.txt`
  bloquea todo. Sin analítica, cookies, píxeles ni formularios: el mensaje de
  WhatsApp se compone en el navegador y no se guarda nada.
- Contenido verificado en `src/content/clinic.ts`.
- Fotos: `public/assets/clinica-veterinaria-camas/` (ver `docs/README_ASSETS.md`).
- Investigación y datos pendientes: `docs/INTERNAL_AUDIT.md` (no se despliega).

Despliegue: Railway, proyecto `clinica-veterinaria-camas-demo`, rama
`demo/clinica-veterinaria-camas`, root `/demos/clinica-veterinaria-camas`.
