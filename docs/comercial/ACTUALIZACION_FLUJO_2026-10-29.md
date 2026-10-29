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

## Estado campaña 60

Los 60 negocios quedan registrados o referenciados en AvanttAI, incluidos los pendientes, para impedir que vuelvan a aparecer en futuras rondas como leads nuevos. Los enviados quedan como `contacted`, los descartados como `lost` y los todavía no contactados permanecen como `new` con una nota explícita de reserva/no reproponer.
