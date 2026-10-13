# Maqui Martín Hernández · Psicóloga en Dos Hermanas — Demo privada

Demo comercial **privada y no solicitada** de presencia web para Maqui Martín
Hernández, psicóloga en Dos Hermanas (Sevilla). No es su web oficial.

- Sin indexación: `robots` noindex/nofollow en metadatos, cabecera `X-Robots-Tag`
  y `public/robots.txt` con `Disallow: /`.
- Sin analítica, sin cookies, sin scripts ni fuentes de terceros (fuentes
  servidas localmente, OFL).
- El formulario es **solo visual**: no hay endpoint ni almacenamiento, pide
  únicamente nombre, teléfono y franja horaria, y avisa de no incluir datos de salud.
- No desplegar a producción. Solo previews aisladas.

## Ejecutar

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint
npm run typecheck
```

Stack: Next.js 16.4 (App Router, página estática), React 19.3, CSS propio.

## Información verificada (fuentes públicas, octubre 2026)

Coincide en varias fichas de directorio que heredan los datos de su antigua
ficha de Google Business:

- Nombre profesional: Maqui Martín Hernández, psicóloga.
- Dirección: C. Luis Ortega Bru, 4, 41704 Dos Hermanas, Sevilla.
- Teléfono: 617 40 83 80.
- Web anterior: `maqui-psicologa.negocio.site` (web automática de Google Business
  Profile). Google cerró todos los sitios `business.site`/`negocio.site` en 2024;
  el dominio ya no resuelve.

Pendiente de confirmar con ella antes de publicar nada: que el teléfono y la
dirección siguen vigentes.

## Información NO usada (no verificada)

- Descripciones tipo «psicoterapeuta con amplia experiencia en psicología
  clínica online»: textos genéricos generados por directorios.
- Modalidad online, horarios, tarifas, duración de sesiones.
- Especialidades, población atendida, terapia de pareja/familia, enfoque terapéutico.
- Formación, años de experiencia y número de colegiada.
- Número y contenido de reseñas (los directorios citan «más de 57 valoraciones,
  5/5» con datos de hace años). No hay testimonios en la web.

La web está diseñada para funcionar sin esos datos; donde harían falta hay un
bloque «Espacio reservado» marcado como nota de demo.

## Assets

Ver `public/assets/maqui-martin-psicologia/README_ASSETS.md`.
