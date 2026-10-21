# Inmo Ángel Machuca · notas internas (no se publica)

Fecha: 2026-10-21

## Datos reales usados

Solo los que facilitó Jose:

- Nombre: Inmo Ángel Machuca
- Teléfono / WhatsApp: +34 650 870 711
- Zona: Sanlúcar la Mayor (Sevilla)
- Sector: inmobiliaria. Ya tiene una presencia web básica (no revisada desde la nube).

Búsqueda web sin resultados útiles sobre el negocio. Aparece una "Inmo Fernando Machuca" en Sanlúcar la Mayor en realadvisor.es: **no se ha usado ningún dato suyo**; conviene confirmar con Jose si hay relación (mismo apellido y pueblo).

## Lo que NO se ha inventado

- Sin testimonios, sin reseñas, sin métricas ("+X años", "X ventas"), sin dirección, sin email, sin horario.
- Los inmuebles, precios, superficies y textos de las fichas son **de ejemplo** y así se indica en el listado, en cada ficha y en el pie.
- Las zonas de los ejemplos son genéricas ("Centro", "Casco histórico", "Zona residencial", "Afueras").

## Identidad: "luz de Sanlúcar"

- Cal `#F7F4EE`, espresso `#1E1813`, cielo `#D7E7F3`, sol `#EE6A2F`, olivo `#5F6C45`, WhatsApp `#1FA855`.
- Tipografías: Hedvig Letters Serif (titulares), Wix Madefor Text (texto), Fragment Mono (referencias y etiquetas).
- Guiño local: las ilustraciones del hero y de la terraza incluyen las dos torres solares de Sanlúcar la Mayor al fondo; el titular juega con eso ("Casas con luz propia").
- Distinta de las inmobiliarias anteriores (Villalón añil/albero, Julio Puig verde marisma, Inmomairena malva/coral, Hogar azul noche/teja, Jesús Losada noche/albero, Global Soluciones grafito/jade). Hogasur y Peñaflor se hacen en paralelo hoy: revisar que no coincidan en naranja sol + espresso.

## Funcionalidad

- Hero con buscador (Comprar/Alquilar, tipo, precio máximo, habitaciones) que rellena los filtros y baja al listado.
- Destacados en carrusel con scroll-snap.
- Listado con filtros fijos al hacer scroll: operación, tipo (solo los que existen para esa operación), precio máx., habitaciones, orden y "Solo guardados". En móvil, precio/habitaciones/orden se pliegan en un botón con contador.
- Favoritos con corazón (localStorage, clave `inmo-am-favs-v1`), contador en cabecera.
- Ficha: panel lateral en escritorio y bottom sheet arrastrable en móvil; galería deslizable con miniaturas, características, "Me interesa" por WhatsApp con la referencia, pedir visita, llamar, compartir enlace (`#ref=AM-xxx`).
- Captación: asistente de 3 pasos "Quiero vender mi vivienda" que compone el mensaje y abre WhatsApp. No guarda nada.
- Proceso para comprador y vendedor (5 pasos cada uno).
- Contacto: WhatsApp destacado, llamada y mensaje rápido que abre WhatsApp. Botón flotante de WhatsApp tras el hero.

## Animación (principios de Emil Kowalski)

La skill de Emil Kowalski no está instalada en esta sesión; se han aplicado sus principios a mano:

- Curvas ease-out fuertes (`cubic-bezier(.23,1,.32,1)`) y la curva de drawer tipo Vaul (`cubic-bezier(.32,.72,0,1)`).
- Duraciones cortas en UI (150–320 ms); el drawer 500 ms.
- Nada entra desde `scale(0)`: como mucho `scale(.96–.985)` + opacidad.
- `:active` con `scale(.97)` en botones para feedback táctil.
- Hover solo en `(hover: hover) and (pointer: fine)`.
- Transiciones CSS interrumpibles para controles (píldora del segmentado, chips, filtros).
- Bottom sheet con cierre por distancia (25 %) o velocidad (> 0,5 px/ms) y resistencia al arrastrar hacia arriba.
- Stagger corto (40–70 ms, máximo ~8 elementos).
- `prefers-reduced-motion`: se quitan desplazamientos y se dejan solo fundidos.

## Dudas para Jose

1. Confirmar que el 650 870 711 tiene WhatsApp.
2. ¿Relación con "Inmo Fernando Machuca"?
3. Dirección de oficina, email y horario, si quiere mostrarlos.
4. Su web actual: no se pudo revisar desde la nube. Si hay inmuebles reales, se pueden cargar en `assets/data.js`.
