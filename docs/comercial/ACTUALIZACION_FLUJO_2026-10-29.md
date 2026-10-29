# Actualización operativa — 29/10/2026

## Fuente de verdad para evitar duplicados

AvanttAI `public.leads` es la fuente de verdad antes de proponer cualquier negocio nuevo.

Antes de crear una demo o incluir un lead en una campaña:

1. Buscar el negocio en AvanttAI por nombre normalizado, no solo por coincidencia exacta.
2. Cruzar también teléfono, localidad y variantes evidentes del nombre comercial.
3. Si ya existe en `public.leads`, no volver a proponerlo como lead nuevo, independientemente de que su estado sea `new`, `contacted`, `qualified` o `lost`.
4. Si el registro es `new`, significa que está reservado/pendiente dentro del CRM, no que pueda volver a descubrirse como lead nuevo.
5. Si es `lost`, respetar el motivo de descarte y no volver a prospectar salvo decisión expresa del usuario.

Este control se añade después de detectar duplicados en la campaña de 60: Talleres Jesús García, Autotécnica Motor y Neumáticos Manuel Morales ya constaban previamente en AvanttAI.

## Canales de contacto

- No asumir que un número móvil tiene WhatsApp.
- Para esta campaña, cuando WhatsApp esté limitado o no exista, priorizar email público verificado.
- El panel debe usar el botón **Enviar mensaje** como enlace `mailto:` cuando exista email público, con destinatario, asunto y texto ya preparados.
- Si no se localiza un email fiable, el botón debe quedar deshabilitado; no inventar direcciones.
- Formularios o redes sociales se pueden usar como alternativa de investigación/contacto, pero no deben sustituirse automáticamente por un email inexistente.

## Texto comercial

Los mensajes demo-first del panel no deben incluir el precio de implantación ni mantenimiento en el primer contacto. El precio se facilita después si el negocio muestra interés o lo pregunta.

## Gate obligatorio de calidad para demos

A partir del 29/10/2026, ninguna demo nueva se considera terminada únicamente porque funcione técnicamente o contenga el nombre, colores y servicios del negocio.

El documento **`docs/comercial/REQUISITOS_DEMOS.md` es de cumplimiento obligatorio** antes de publicar o enviar cualquier demo.

Reglas críticas:

1. **La demo debe parecer la futura web real del negocio**, no una presentación comercial sobre cómo podría ser su web.
2. **Todo el copy de la demo habla al cliente final del negocio.** Está prohibido incluir dentro de la home frases dirigidas al propietario explicando por qué necesita una web, qué podría mostrar, qué conseguiría con ella o cómo funcionaría una sección.
3. **La demo no explica la web: la demo es la web.** Los argumentos sobre ventajas, rediseño o propuesta pertenecen al mensaje de prospección, nunca a la página.
4. **Diseño no-plantilla obligatorio.** No basta con cambiar nombre, color e imágenes sobre un renderer repetido.
5. La referencia de calidad visual buscada es un nivel similar al enfoque de Emil Kowalski: composición cuidada, movimiento útil, microinteracciones, identidad, jerarquía clara y sensación de producto terminado.
6. Cada negocio necesita una dirección artística propia basada en su identidad pública, sector, tipo de cliente, fotografía, tono y servicios.
7. En tandas grandes se deben comparar las demos entre sí antes de enviarlas. Si dos pueden confundirse al ocultar el nombre, hay que rediseñar.
8. Antes de publicar, pasar el QA definido en `REQUISITOS_DEMOS.md`, incluyendo escritorio, móvil, copy, interacción, CTA, contenido verificado y test anti-plantilla.

Ejemplo de error que no debe repetirse:

> “Quien busca neumáticos o mecánica necesita saber rápido qué resolvéis, dónde estáis y cómo pedir precio. Todo eso puede estar a un toque.”

Ese texto puede servir como razonamiento interno o argumento de prospección, pero **no tiene sentido dentro de la home de BLACKTIRE** porque habla al propietario sobre la utilidad de su propia web.

## Estado campaña 60

Los 60 negocios quedaron registrados o referenciados en AvanttAI para impedir que vuelvan a aparecer en futuras rondas como leads nuevos. Los enviados quedan como `contacted`, los descartados como `lost` y cualquier lead pendiente debe quedar identificado de forma explícita en CRM.

La campaña de 60 deja además un aprendizaje de diseño permanente: las siguientes tandas no deben optimizarse únicamente por volumen. La calidad visual y la sensación de que cada negocio está viendo **su posible futura web** son parte central de la propuesta comercial.
