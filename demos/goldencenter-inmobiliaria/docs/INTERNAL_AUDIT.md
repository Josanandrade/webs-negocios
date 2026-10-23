# Grupo Inmobiliario Goldencenter — auditoría interna (no se publica)

Fecha de revisión: 23/10/2026. Lote de 6 demos de inmobiliarias con preview estática del panel (`/panel-demo`).

## Datos del negocio

| Dato | Valor | Fuente | Confianza |
|---|---|---|---|
| Nombre | Grupo Inmobiliario Goldencenter / "Golden Center" | Empresite (sociedad), alquila2, Instagram @gc_goldencenter | Alta |
| Dirección | C/ Gerona, 17, Sevilla (Casco Antiguo) | Páginas Amarillas, anuario-horario, yaencontre | Alta. El código postal varía según directorio (41003/41010), así que en la web no se muestra. |
| Teléfono | 954 21 41 42 | anuario-horario y otros directorios | Media: no se ha podido verificar en su web |
| WhatsApp | 685 859 202 | Aparece enmascarado en yaencontre ("6.8. 5.8. 5.9. 2.0. 2.") | **Baja: confirmar antes de enviar** |
| Email | goldencenter_sl@yahoo.es | anuario-horario | Baja: no se muestra en la demo |
| Horario | L–V 9–20 según un directorio; otro dice "no disponible" | anuario-horario | No se muestra |

## ¿Usa grandes portales? **Sí**

- **yaencontre**: perfil "Golden center", Gerona 17, Sevilla, con **23 inmuebles activos** el 23/10/2026: pisos en San Julián, Nervión, La Salle, Feria, Santa Cruz y Arenal; naves en Torreblanca y Coria; casas en El Rocío y Carmona. https://www.yaencontre.com/inmobiliarias/golden-center-44017
- **Idealista**: el buscador muestra un perfil profesional "Golden center" (p29002778) con unos 7 inmuebles en venta y 7 en alquiler. No se pudo abrir la página para confirmar la dirección, porque Idealista bloquea el acceso automatizado.
- Fotocasa y Habitaclia: no aparecen en las búsquedas.

Esto contradice la premisa del lote ("inmobiliarias que no usan portales"). Se ha preguntado a Jose en el hilo; mientras tanto, la demo usa un mensaje que vale en ambos casos: tener la cartera en una web propia y gestionarla desde un panel, sin afirmar que no usan portales.

## goldencenter.es

- No se pudo abrir desde el contenedor: el proxy rechaza la conexión y robots.txt bloquea el acceso automatizado.
- El buscador solo indexa dos URLs: la portada ("Servicios de alquiler y venta de pisos en Sevilla" / "Inmobiliaria Golden Center") y /contacto. Parece una web mínima de presentación, sin cartera navegable.
- **No se puede afirmar si está actualizada, caída u obsoleta.** Jose tiene que abrirla en su navegador.

## Decisiones de la demo

- Los inmuebles son **de ejemplo** (GC-101…GC-112) y están etiquetados como tales en las tarjetas, la ficha, el pie y el panel. Las zonas y los precios están inspirados en el tipo de cartera que publican (centro, Nervión, La Salle, naves, El Rocío y Carmona), pero no copian ningún anuncio real.
- Las imágenes son ilustraciones SVG propias, generadas con `demos/goldencenter-inmobiliaria/tools/gen-images.mjs`.
- `/panel-demo/` es una preview visual. Funciona sin login y en memoria: los cambios de estado son visuales y se pierden al recargar. Una banda fija avisa de que es una "Demo visual — funcionalidad disponible en el desarrollo final".
- Las consultas y los propietarios del panel usan nombres y teléfonos ficticios (600 000 0xx). Las acciones de llamar y WhatsApp solo muestran un aviso.

## Identidad visual

"Lacre y pan de oro": papel #F4EFE6 / tinta #1A1714 + lacre #9B2C1F + oro #C8A24B (verdín #3F5A4F como acento en las ilustraciones). Tipografías Noto Serif Display (con itálica) + Geologica + Martian Mono. El logo es un sello de lacre "GC". El hero es una pila de llaveros con inmuebles: se puede arrastrar y rota sola. En la web, un mockup del panel con un cursor animado que marca un inmueble como reservado.
