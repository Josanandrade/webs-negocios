# Inmobiliaria Alves · auditoría interna (no se publica)

Fecha: 2026-10-21.

## Datos verificados

Solo los facilitados por Jose:

- Nombre: Inmobiliaria Alves
- Teléfono y WhatsApp: +34 619 214 928
- Zona: Sevilla
- Sector: inmobiliaria

Búsqueda web (nombre + Sevilla, número de teléfono, portales inmobiliarios): sin resultados que se puedan atribuir con seguridad a este negocio. Redes sociales y Google Maps están bloqueados desde el entorno de trabajo, así que no se han podido revisar.

## Qué NO se muestra por no estar contrastado

Dirección, email, horario, años de experiencia, número de operaciones, reseñas, valoraciones de Google, nombres del equipo, logotipo real, colegiación/API, portales en los que anuncia.

## Contenido de ejemplo (marcado como tal en la web)

- 10 inmuebles ficticios (venta y alquiler) en barrios de Sevilla y el Aljarafe, con precios y superficies inventados. La web lo indica en el listado, en cada ficha y en el pie.
- Imágenes: ilustraciones SVG propias generadas por `tools/gen-images.mjs`. Ninguna foto de terceros.
- Textos de servicios y del proceso de captación: redacción genérica de lo que hace una inmobiliaria. Confirmar con el cliente qué servicios ofrece realmente (por ejemplo, si gestiona alquileres, si acompaña a notaría, si ayuda con financiación).
- La valoración no da cifras automáticas a propósito: recoge datos y abre WhatsApp con la solicitud.

## Formularios

Contacto, valoración y solicitud de visita no envían a ningún servidor: componen un mensaje y abren WhatsApp al +34 619 214 928. Los favoritos se guardan solo en el navegador (`alves-demo-favs`).

## Identidad visual

Cal #F6F2EA, tinta #14181C, naranja (naranjo sevillano) #E8692A, hoja #1F4D36. Tipografías Funnel Display + Funnel Sans. Hero con marco en arco, buscador en tarjeta y tarjeta de inmueble viva que rota entre destacados. Distinta de Villalón, Julio Puig, Inmomairena, Hogar y del resto de inmobiliarias del repositorio.

## Movimiento (principios de Emil Kowalski)

La skill de Emil Kowalski no estaba disponible en el entorno; se han aplicado sus principios a mano:

- Curvas ease-out fuertes (`cubic-bezier(.23,1,.32,1)`), duraciones de 160–300 ms en la interfaz.
- Solo `transform`, `opacity` y `filter`; nada parte de `scale(0)`.
- `scale(.97)` al pulsar botones; hover solo en dispositivos con puntero fino.
- Pastilla deslizante en Comprar/Alquilar, hoja inferior de filtros en móvil, pasos del asistente con dirección, check dibujado al terminar.
- Entrada escalonada del hero y aparición al hacer scroll una sola vez.
- `prefers-reduced-motion` desactiva desplazamientos y rotación automática.

## Dudas para el cliente

1. ¿Tiene oficina a pie de calle? Dirección y horario.
2. Email de contacto.
3. Logotipo y fotos reales de inmuebles en cartera.
4. Barrios y municipios en los que trabaja.
5. Servicios exactos (venta, alquiler, gestión de alquileres, tasaciones, financiación…).
