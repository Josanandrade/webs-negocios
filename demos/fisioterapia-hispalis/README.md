# Fisioterapia Híspalis · Web demo

Propuesta comercial de nueva web para [Fisioterapia Híspalis](https://www.fisioterapiahispalis.com/),
clínica de fisioterapia y rehabilitación de Angélica Argüello en Dos Hermanas (Sevilla).

> **Demo privada.** No es la web oficial. Se publica con `noindex, nofollow`
> (meta, cabecera `X-Robots-Tag` y `robots.txt` con `Disallow: /`), sin
> canonical hacia el dominio del negocio y sin analítica.

## Stack

Next.js 16 (App Router) + React 19 + TypeScript estricto. CSS global con tokens
+ CSS Modules (sin Tailwind). Fuentes Fraunces y Figtree vía `next/font`
(autoalojadas en el build). Sin librerías de animación: un único
`IntersectionObserver` y transiciones CSS que respetan `prefers-reduced-motion`.
Dependencias de ejecución: solo `next`, `react` y `react-dom`.

## Puesta en marcha

```bash
cd demos/fisioterapia-hispalis
npm install
npm run dev          # http://localhost:3000
npm run lint
npm run typecheck
npm run build && npm start   # usa PORT si existe (Railway)
```

Versión 100 % estática (para cualquier hosting estático privado):

```bash
STATIC_EXPORT=1 npm run build   # genera out/
```

## Estructura

```text
business.config.ts        ← datos del negocio, cada uno con su fuente (única fuente de verdad)
lib/content.ts            ← textos: áreas, método, técnicas, FAQ, selector de casos
lib/assets.ts             ← registro de fotografías (hoy vacías, preparado para sustituir)
app/                      ← layout (metadata noindex), página, robots, icono, OG
components/
  sections/               ← Hero, CaseFinder, Areas, Professional, Method, Reviews, Faq, Visit, FinalCta
  SiteHeader / SiteFooter / StickyCta / ArchFrame / Logo / Icons
public/assets/fisioterapia-hispalis/README_ASSETS.md  ← fotos y logo pendientes
```

## Decisiones

- **Conversión:** el canal real verificado es teléfono + WhatsApp (679 355 828).
  El CTA principal es WhatsApp con mensaje prellenado según la situación del
  paciente; llamada como secundario. En móvil hay una barra fija con ambos.
- **Datos no verificados ocultos:** horario (fuentes contradictorias) y precios
  (publicados, pero sin fecha de vigencia). Se activan desde `business.config.ts`.
- **Sin fotos ajenas:** composición en arco con textura sutil hasta tener fotos reales.
