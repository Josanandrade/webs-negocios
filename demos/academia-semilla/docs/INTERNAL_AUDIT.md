# Academia Semilla — investigación interna (2026-10-21)

Documento interno. No se publica.

## Datos usados (solo del brief de Jose)
| Dato | Valor |
|---|---|
| Nombre | Academia de Apoyo Escolar Semilla |
| Teléfono / WhatsApp | +34 645 177 628 |
| Zona | Bollullos de la Mitación (Sevilla) |
| Sector | Apoyo escolar |

## Búsqueda pública
- Búsqueda web por nombre + municipio y por teléfono: sin resultados indexados (ni web, ni fichas, ni reseñas).
- Redes sociales y Google Maps bloqueados desde el contenedor.
- Por tanto NO se publican: dirección exacta, horarios, precios, profesorado, titulaciones, número de alumnos, resultados ni reseñas.

## Decisiones de la demo
- Primaria / ESO / Bachillerato se usan como estructura visual (pestañas y colores). El texto habla de "qué necesita cada etapa", no de asignaturas concretas impartidas, y remite a confirmar el curso.
- Horarios y grupos: tablero semanal con franjas genéricas y etiqueta "grupo · por publicar" + aviso "Distribución orientativa para la maqueta". Filtro por etapa.
- "Cuaderno de seguimiento" y "Nota para la familia" del hero marcados como "Ejemplo".
- FAQ de precios y dirección: "te informamos / te damos la dirección al escribirnos".
- CTA "Pide información": formulario que compone un mensaje y abre WhatsApp (34645177628). Nada se envía ni se guarda.
- Sin mapa (no hay dirección verificada).

## Identidad visual
Papel #FAF8F3, tinta pino #102A26, brote #4FB072, sol #F4B942, cielo #6E9FCB (color por etapa: sol = Primaria, brote = ESO, cielo = Bachillerato).
Hedvig Letters Serif (titulares) + Geist (texto) + Geist Mono (etiquetas).
Hero = hoja "Plan de estudio" con un brote que crece y cruza las líneas de las tres etapas.
Distinta de Academia Diversidad (papel/tinta azul + mandarina, Lexend).

## Animación (principios de Emil Kowalski aplicados a mano; la skill no está instalada en el entorno)
- Curvas ease-out propias (cubic-bezier(.23,1,.32,1)), nada de ease-in; UI < 300 ms, entradas 600–900 ms.
- Solo transform/opacity (y stroke-dashoffset en los trazos SVG).
- Botones con scale(.97) al pulsar; hovers solo con `@media (hover: hover)`.
- Indicador de pestañas que se desliza, acordeón con grid-template-rows, menú móvil con transform-origin en la esquina.
- Reveals escalonados (70 ms); `prefers-reduced-motion` desactiva todo.

## Confirmar antes de contactar
1. Que el 645 177 628 tiene WhatsApp.
2. Qué etapas y cursos atienden de verdad (y si hacen grupos, clases individuales o ambas).
3. Horarios reales para rellenar el tablero.
4. Dirección exacta (para añadir mapa) y si tienen logo/colores propios.
5. Fotos reales del espacio, si las hay.
