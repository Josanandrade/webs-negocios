# Peñaflor Inmobiliaria · notas internas (no se publica)

Fecha: 2026-10-21. Encargo de Jose en el proyecto Webs Negocios.

## Datos del negocio

| Dato | Valor | Fuente | Estado |
| --- | --- | --- | --- |
| Nombre | Peñaflor Inmobiliaria | Jose | Dado por Jose |
| Zona | Camas / Aljarafe | Jose | Dado por Jose |
| Teléfono / WhatsApp | +34 652 825 432 | Jose | Dado por Jose; confirmar que tiene WhatsApp activo |
| Dirección, email, horario, equipo, años, opiniones | — | Búsqueda web sin resultados del negocio | **No se muestran** |

Búsquedas hechas: "Peñaflor Inmobiliaria Camas" y con el teléfono. Solo aparecen el municipio de Peñaflor (Sevilla), Peñaflor (Chile) y una "Calle Peñaflor" en Camas (RealAdvisor). Puede que la agencia tome el nombre de esa calle, pero no está verificado y no se usa.

Desde el contenedor no se pueden consultar Google Maps, Instagram, Facebook ni portales que bloquean el proxy. Antes de enviar conviene revisar a mano si tienen ficha en Idealista/Fotocasa/Google para no chocar con una web existente y para sustituir los inmuebles de ejemplo por los suyos.

## Qué es de ejemplo
- Los 12 inmuebles (refs PF-104…PF-133), precios, superficies y descripciones son **ficticios**.
- Las imágenes son ilustraciones propias generadas con `tools/gen-images.mjs` (nada de fotos de terceros).
- Los textos de servicios describen el trabajo habitual de una agencia (valoración, visitas, negociación, notaría). No afirman cifras, certificaciones ni colaboraciones concretas. Confirmar con el cliente.
- La calculadora de cuota es orientativa y lo dice; el interés es editable por el usuario.
- La valoración no inventa precios: recoge datos y los envía por WhatsApp.
- Formularios simulados: no se guarda nada; todo termina en WhatsApp con el mensaje ya escrito.

## Identidad: "a este lado del río"
Camas mira a Sevilla desde la otra orilla del Guadalquivir. La demo se construye sobre esa idea.
- Paleta: verde río profundo `#0E2A30`, lima `#D7F25C`, bruma `#EAF0EC`, papel `#F7F7F3`, río `#2F7D84`, y en las ilustraciones cal y albero.
- Tipografía: Geologica (titulares e interfaz) + Hedvig Letters Serif (palabras de acento).
- Distinta de las otras inmobiliarias del proyecto: Villalón (albero/añil, mapa), Julio Puig (marisma/arena, arco), Inmomairena (malva/coral, palabra rotatoria), Hogar (crema/teja, casa). Se hizo en paralelo a Hogasur e Inmo Ángel Machuca.

## Movimiento (principios de Emil Kowalski)
La skill de Emil Kowalski no estaba instalada en la sesión; se aplicaron sus principios a mano:
- Curvas ease-out fuertes (`cubic-bezier(.23,1,.32,1)`), curva tipo iOS para la ficha (`.32,.72,0,1`), duraciones de 160–450 ms.
- Solo `transform`, `opacity` y `filter`; nunca escalar desde 0 (mínimo .6 en el check de éxito, .96 en menús).
- `:active` con `scale(.97)` en botones; hover solo con `(hover: hover) and (pointer: fine)`.
- Transiciones CSS interrumpibles (píldora de los segmentados, panel de filtros, ficha) en vez de keyframes.
- Gestos con velocidad: el mazo del hero se lanza por distancia (>90 px) o por velocidad (>0,45 px/ms); la ficha se cierra arrastrando hacia abajo (25 % de su altura o >0,6 px/ms).
- Menú con `transform-origin` en la esquina del botón; entradas con ligera difuminación; escalonado corto (40–70 ms).
- `prefers-reduced-motion` desactiva desplazamientos y animaciones.

## QA hecho
Chromium (Playwright) a 390×844 y 1440×900: sin errores de consola ni scroll horizontal. Probado: buscador del hero (contador en vivo y salto al catálogo), mazo arrastrable y botón siguiente, chips de zona, filtros (tipo, precio, dormitorios, zona, extras, orden, limpiar), favoritos con persistencia en el navegador, ficha con galería, miniaturas, calculadora, enlace directo `/#PF-117` y botón atrás, valoración en 4 pasos con validación y mensaje de WhatsApp, pestañas de servicios y formulario de contacto.

## Pendiente de confirmar antes de enviar
1. Que el 652 825 432 tiene WhatsApp.
2. Si tienen inmuebles publicados, sustituir los de ejemplo.
3. Si quieren mostrar dirección u horario de oficina.
