# HappyPet · demo

Web estática (Next.js 16, `output: "export"`) para HappyPet, centro veterinario
y peluquería & spa en Bollullos de la Mitación.

```bash
npm install
npm run dev        # desarrollo
npm run build      # exporta a out/ y comprueba que no hay contenido interno
npm start          # sirve out/ con cabeceras noindex (serve.json)
npm run lint && npm run typecheck
```

- Contenido editable: `src/content/site.ts`.
- Documentación interna (no se publica): `docs/INTERNAL_AUDIT.md` y
  `public/assets/happypet-veterinario-peluqueria-spa/README_ASSETS.md`
  (eliminado de `out/` por `scripts/postbuild.mjs`).
- Privacidad: `noindex, nofollow` en meta, cabecera `X-Robots-Tag` y
  `robots.txt`. Sin analítica, píxeles ni formularios.
