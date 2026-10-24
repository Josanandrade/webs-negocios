# Taberna Rincón de Eu (Pilas) — auditoría interna

> Documento interno. **No se despliega**: vive fuera de `public/` y de `src/app/`, así que no genera ruta. `scripts/postbuild.mjs` borra cualquier `.md` de la exportación y falla el build si aparece contenido interno en `out/`.

Fecha de investigación: 14/10/2026.

## Limitaciones

La red del entorno bloquea Instagram, Facebook, Google Maps y `*.railway.app`. No se ha podido abrir la ficha de Google ni posibles redes sociales, ni descargar ninguna foto. `laguiadelaljarafe.com` rechaza la lectura (robots). La búsqueda no encontró web propia ni perfil social enlazado en ninguna fuente.

## 1. Fuentes consultadas

| Fuente | Qué aporta | Fecha |
|---|---|---|
| [De Tapas con Chencho](https://www.detapasconchencho.es/taberna-rincon-eu/) | Reportaje con entrevista: Eustaquio Sánchez «Eu», casa de pueblo, barra en U, saloncitos, patio, sin carta ni QR, solo efectivo, platos | 11/10/2018 (mod. 2026) |
| [Cosas de Comé](https://sevilla.cosasdecome.es/establecimiento/taberna-rincon-de-eu/) | Ficha gastronómica: apertura en 1988, «Abre solo para almuerzos de lunes a sábados», solo efectivo, admite reservas, sin carta, cerca del parque José Suárez Cuesta, coordenadas, 30–40 €/persona | 03/10/2024 (act. 05/08/2025) |
| [GastroRanking](https://gastroranking.es/r/rincon-de-eu_107904/) | Agregador: dirección, teléfono, reseñas (solo efectivo, «no te olvides de reservar»), platos citados | — |
| [esopiniones.com](https://esopiniones.com/andalusia/taberna-rincon-de-eu-408280) | Agregador de reseñas de Google: L–V 13–19 h, patio interior, poco accesible con carritos | — |
| [restaurantecalamon.es](https://restaurantecalamon.es/taberna-rincon-de-eu/) | Agregador: L–S 13–18 h, platos | — |
| [rutaculinaria.com](https://rutaculinaria.com/restaurante-en-pilas-taberna-rincon-de-eu-47956) | Agregador: L–S 13–24 h, domingo cerrado | — |

## 2. Datos confirmados y usados

| Dato | Valor | Confianza |
|---|---|---|
| Nombre | Taberna Rincón de Eu (también «El Rincón de Eu») | Alta (todas) |
| Dirección | Calle Murillo, 14 · 41840 Pilas (Sevilla) | Alta (todas) |
| Teléfono | 636 38 52 71 | Alta (todas) |
| Cocinero / fundador | Eustaquio Sánchez (Perona), «Eu», cocinero de Pilas | Alta (dos medios gastronómicos) |
| Apertura | 1988 («más de treinta años») | Alta (Cosas de Comé; coherente con 2018) |
| Sin carta impresa, se canta en la mesa | Sí, precio a petición | Alta (prensa + reseñas) |
| Pago | Solo efectivo | Alta (prensa + muchas reseñas) |
| Reservas | Se admiten, recomendadas | Alta |
| Días | Lunes a sábado, mediodías; domingo cerrado | Media-alta (Cosas de Comé; el resto coinciden en L–S/domingo cerrado) |
| Espacios | Barra en U con cocina a la vista, saloncitos, vigas, muebles antiguos, fotos de familia, patio con plantas | Alta (prensa) |
| Referencia | Cerca del parque José Suárez Cuesta, centro de Pilas | Media (Cosas de Comé) |
| Platos (sin precios) | Tomate con ventresca / con jamón, hierbabuena y cebolleta; anchoas de Santoña; croquetas; tabla de quesos; mejillones de O Grove; boquerones; gambas rebozadas; calamares de potera; almejas de carril; bacalao con tomate; fabes; menudo; garbanzos con langostinos; habas con calamares; sangre encebollá; presa ibérica; pluma; flamenquines; brochetas de solomillo; churrasco de bellota | Alta-media: prensa 2018 y 2024, churrasco en dos agregadores. Se presentan como «platos que se han servido», no como carta |

## 3. Datos deliberadamente NO usados

- **Hora exacta de apertura/cierre**: las fuentes no coinciden (13–18, 13–19, 13–24). En la web solo «mediodías de lunes a sábado». Los turnos del simulador (13:00–15:30) se rotulan «de ejemplo». **Confirmar con el negocio.**
- **Precios** (30–40 €/persona en Cosas de Comé; 10–50 € en agregadores): no se publican; la casa da el precio en la mesa.
- **Valoraciones** (Google 4,7–4,8 / 386–546 reseñas según agregador; GastroRanking 9,0): cifras contradictorias y no verificadas directamente.
- **Saloncito «el Coiba», estufas en mesas, barra exterior**: solo en un agregador poco fiable.
- **Tickets restaurante, apto para niños**: solo un agregador.
- **«Cocina vegetariana»** (GastroRanking): claramente errónea.
- **Eventos/jornadas reales**: ninguno encontrado (un reseñista dice que no aceptaron un evento). El tablón muestra solo formatos de ejemplo.
- **Redes sociales / web propia**: no se encontraron enlaces verificables.
- **Fotos**: ninguna descargable; la demo no usa fotografías (ver `public/assets/taberna-rincon-de-eu/README_ASSETS.md`).

## 4. Decisiones de diseño y contenido

- **Concepto «La carta se canta»**: lo más diferencial del negocio es que no hay carta; la web lo convierte en identidad (pizarra con tiza, columnas «Lo que se canta») en vez de fingir una carta con precios.
- **Paleta**: cal cálida #F4ECDF, almagra #7D2A1A, madera #6B4128, pizarra #23281F, ocre #D9A441 y azul cobalto de azulejo #284A78. Tipos: Young Serif (letrero), Work Sans (texto), Kalam (tiza). No coinciden con demos anteriores.
- **Elementos propios**: letrero granate fijo, cenefa y placa de calle de azulejo dibujadas en SVG (sin mapa inventado), recorrido barra → saloncitos → patio, tablón de corcho con avisos, libreta de comandas para reservar y ticket con sello.
- **Información útil arriba**: «solo efectivo» y «sin carta» destacados, porque son lo que más sorprende al visitante en las reseñas.
- **Reserva simulada**: comensales (1–8; «más de 8» deriva a llamar), día (15 días, domingos cerrados), turno con ocupación ficticia, datos y confirmación. Sin red, sin almacenamiento. Tras confirmar se enseña «así le llegaría a la casa»: agenda del mediodía con reservas de ejemplo, que es el argumento de reducir llamadas en pleno servicio.
- **Mapa**: enlace «Cómo llegar» a Google Maps con las coordenadas publicadas por Cosas de Comé; no se incrusta mapa (evita servicios externos).
- **Privacidad**: `noindex, nofollow` (meta + `X-Robots-Tag` + `robots.txt`), sin analítica, fuentes locales.
