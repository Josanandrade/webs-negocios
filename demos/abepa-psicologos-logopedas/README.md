# Centro Abepa · Psicólogos y logopedas (Tomares) — Demo privada

Propuesta de web **privada y no solicitada** para Abepa Psicólogos y Logopedas,
Av. de los Olivos 25, Tomares (Sevilla). No es su web oficial ni la sustituye
(la oficial es `abepa.es`).

- Sin indexación: `robots` noindex/nofollow en metadatos, cabecera
  `X-Robots-Tag` en todas las rutas y `public/robots.txt` con `Disallow: /`.
- Sin analítica, sin cookies, sin scripts, mapas ni fuentes de terceros
  (fuentes autoalojadas, OFL). Cero peticiones externas al cargar.
- El formulario es **solo de demostración**: no envía ni guarda nada, pide lo
  mínimo (nombre, teléfono, para quién, área, franja) y avisa de no escribir
  datos de salud.
- Barra superior y pie indican que es una propuesta, no la web del centro.

## Ejecutar

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint
npm run typecheck
```

Stack: Next.js 16.4 (App Router, página 100 % estática), React 19.3, CSS propio.

```text
src/
  app/          layout (metadatos, fuentes), page (todas las secciones), globals.css
  components/   cabecera + menú móvil, pestañas «¿para quién?», formulario demo,
                barra fija móvil, marcas de área, PhotoSlot, logotipo provisional
  lib/site.ts   TODOS los datos y textos del centro (fuente única)
  lib/photos.ts huecos de fotografía (null = composición gráfica)
public/assets/abepa-psicologos-logopedas/README_ASSETS.md   qué pedir
```

## Dirección visual

«Una casa con tres áreas». Centro multidisciplinar, no consulta de autora:

- Retícula de «estancias» (el plano del hero) en lugar de arcos (Maqui) u
  ondas (Esperanza).
- Un color por área — añil (psicología), teja (logopedia), olivo (pedagogía) —
  sobre pared encalada y tinta añil oscura. Funciona como sistema de
  orientación en toda la página (tarjetas, equipo, pestañas).
- Sin serifas editoriales: Bricolage Grotesque (titulares, cálida y con
  carácter) + Atkinson Hyperlegible Next (texto, diseñada para máxima
  legibilidad).
- Movimiento contenido: entrada corta del plano, revelado por scroll solo con
  CSS, pulsación `scale(0.97)`, hover solo con puntero fino y todo anulado con
  `prefers-reduced-motion`.

## Información verificada (fuentes públicas, octubre 2026)

| Dato | Fuente |
|---|---|
| Nombre «Abepa Psicólogos y Logopedas» / «Centro Abepa» | Facebook oficial (`abepa.tomares`), abepa.es, directorios |
| Av. de los Olivos 25, 41940 Tomares | abepa.es (pág. Pedagogía) + Cylex, qdq, MundoPsicólogos, Moovit |
| Tel. 954 151 954 · 637 706 447 · secretaria@abepa.es | abepa.es + blog antiguo del centro + Cylex |
| «Más de 20 años» ofreciendo atención psicológica, logopédica y educativa | Portada de abepa.es |
| Psicología: trastornos emocionales, de la alimentación, del desarrollo, de conducta, psicosomáticos, terapia sexual, personalidad | abepa.es |
| Logopedia: voz, habla y lenguaje oral y escrito; niños, adolescentes y adultos; dislexia, retraso lector, dislalias, disfemia, disfonía | abepa.es/logopedia |
| Pedagogía: rendimiento académico desde el inicio de la escolarización hasta el final de los estudios; hábitos y técnicas de estudio; memoria y concentración; evaluación psicopedagógica; seguimiento; TDAH; reinserción de quien dejó los estudios | abepa.es/pedagogia |
| Apoyo escolar con TDAH, dificultades de aprendizaje y TEA | abepa.es |
| Equipo: Paloma Megina (psicóloga colegiada), Javier Rodríguez Pineda (psicólogo general sanitario colegiado), Eugenia Moreno (logopeda colegiada), Carmen Moreno (psicopedagoga), Elena Pérez (maestra de educación infantil) | abepa.es («Nuestro equipo») |
| Modalidad «presencial y online» | Menú de abepa.es (MundoPsicólogos solo dice presencial → se formula como «pregúntanos») |
| Cerrado fines de semana | Coinciden Cylex y yellow.place |

## Información descartada

- **Horario concreto**: Cylex (tardes hasta las 22:00) y yellow.place (solo
  mañanas 9:00–13:30) se contradicen → solo «de lunes a viernes, franjas por
  confirmar».
- **Valoraciones**: 4,84/5 con 23 opiniones (Cylex), 8,2/10 con 17 (TrustLocal),
  168 en Doctoralia (no queda claro si es del centro) → no se muestra ninguna
  cifra ni cita.
- **Precio** (60 € la consulta en un directorio) → no se publica.
- **Terapia de pareja / familiar, autismo como especialidad psicológica,
  estimulación temprana, ansiedad/depresión como etiquetas**: solo en
  directorios (psico.org, MundoPsicólogos), no en la web oficial → no se
  anuncian como servicios.
- **«Fundado en 1997»**: solo aparece en el perfil de X → se usa el «más de 20
  años» de la web oficial.
- **Talleres**: aparece en el menú de abepa.es sin detalle → fuera.
- Testimonios autopublicados en abepa.es → no se copian.
- Antigua oferta de empleo del SAE → irrelevante.

Los textos del proceso de «Primera cita» y las preguntas frecuentes son
redacción comercial genérica: validar con el centro antes de publicar.

## Preview

Ver la sección «Preview» del mensaje de entrega / Railway. No asignar dominio
propio ni publicar en producción.
