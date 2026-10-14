# Webs Negocios — Reglas de captación comercial

Documento vivo para evitar repetir errores y mantener criterios consistentes en la prospección.

## Fuente de verdad

- El estado de cada lead se guarda en **AvanttAI > Admin > Leads**.
- Los leads de esta campaña deben identificarse en `notes` con el prefijo **[Webs Negocios]**.
- Este documento guarda **criterios, decisiones y aprendizajes**, no sustituye al CRM.
- Cuando haya una respuesta, contacto, descarte o seguimiento, actualizar primero el lead en AvanttAI.

## Filtro previo obligatorio antes de crear una demo

Antes de invertir tiempo en una demo, comprobar siempre:

1. **Web propia**
   - Si el negocio ya tiene una web propia moderna y funcional, normalmente se descarta.
   - Una simple ficha en directorio, Facebook, Instagram o Google Sites no equivale necesariamente a una web propia útil; revisar caso por caso.
   - Si la web está “en construcción”, se descarta igualmente salvo decisión expresa.

2. **Sistema de reservas**
   - Comprobar expresamente Booksy, Fresha, Treatwell, Doctoralia u otras plataformas relevantes del sector.
   - Si tiene una plataforma con reserva real de servicio + fecha + hora y además parece activa, normalmente se descarta.
   - Si la ficha solo dice “Llamar para reservar”, no resuelve la necesidad y el negocio puede seguir siendo buen lead.
   - Si la plataforma existe pero las reservas están desactivadas, puede ser un buen lead.

3. **Satisfacción con la solución actual**
   - Si el negocio confirma que ya usa Booksy u otra plataforma y que le funciona bien, **no insistir**.
   - Marcar como `lost` con motivo claro y sin seguimiento.

4. **Canal de contacto**
   - Priorizar WhatsApp cuando esté confirmado.
   - Si no hay WhatsApp, usar Instagram/Facebook cuando sea una presencia activa del negocio.
   - Si solo hay teléfono fijo o móvil sin WhatsApp, dejar como **pendiente de contactar por llamada**.
   - No inventar canales.

5. **Evitar duplicados**
   - Comprobar AvanttAI antes de contactar o preparar una demo.
   - No contactar dos veces al mismo negocio por error.

## Perfil prioritario de lead

Buscamos principalmente negocios locales que:

- no tengan web propia;
- no tengan un sistema de reservas online bien resuelto;
- gestionen citas, reservas o solicitudes manualmente por teléfono, WhatsApp, Instagram o Facebook;
- tengan suficiente actividad/reputación como para que una web propia pueda aportar valor;
- puedan beneficiarse de automatizar parte de la gestión.

No limitar la búsqueda a peluquerías. Rotar sectores:

- clínicas y salud;
- psicología;
- fisioterapia;
- podología;
- veterinaria;
- estética;
- academias;
- restauración;
- deporte/fitness;
- mascotas;
- otros negocios locales con un problema claro que resolver.

## Propuesta comercial

No vender “una web” como producto aislado.

Mensaje principal:

> La web debe trabajar por el negocio, no convertirse en otra herramienta que gestionar.

Valor que debemos transmitir según sector:

- **Negocios con citas:** menos llamadas y WhatsApps, disponibilidad visible, reserva automática, datos organizados y más tiempo atendiendo clientes.
- **Restauración:** presencia propia, carta/contenido, reservas de mesa, información centralizada.
- **Academias:** información clara, solicitudes de matrícula/información y captación organizada.
- **Profesionales:** espacio propio, confianza, independencia de directorios y solicitudes/citas más ordenadas.

## Demos

- La demo debe prepararse **antes del contacto** cuando decidamos usar estrategia demo-first.
- Debe ser una base orientativa, no presentarla como producto cerrado.
- Explicar que la web final sería a medida.
- No inventar precios, servicios, horarios, profesionales, tratamientos, titulaciones ni capacidades.
- Verificar información pública antes de incluirla.
- Las reservas/formularios de demos son simulados salvo que se decida expresamente otra cosa.
- Añadir `noindex, nofollow`.
- Evitar que todas las demos parezcan la misma plantilla con colores distintos.
- El diseño debe ser coherente con el sector y el negocio.

## Mensajería

- Personalizar cada mensaje según la presencia online real del negocio.
- Mensajes relativamente cortos; evitar textos genéricos o demasiado largos.
- Dar valor a la gestión automática cuando exista ese dolor.
- No mencionar herramientas o situaciones que no estén verificadas.
- Si ya trabajan bien con una solución equivalente, cerrar con educación y no presionar.

## Seguimiento

Regla base de seguimiento:

- **Contacto frío sin respuesta:** primer seguimiento a los **2 días**.
- **Respondió y la conversación quedó a medias:** seguimiento al **día siguiente**.
- **Lead pendiente de llamada:** fijar fecha de acción para el **siguiente día hábil**.
- **Puerta abierta pero no interesado ahora:** seguimiento largo, aproximadamente **90 días**, salvo que la conversación indique otra cosa.
- **Rechazo claro / solución actual les funciona bien:** marcar `lost` y **sin seguimiento**.
- Si leen y no responden, no interpretar automáticamente como rechazo.
- No hacer seguimiento inmediato tras enviar el primer mensaje.

Tras un primer seguimiento sin respuesta:

- dejar otros **5–7 días** antes de un último intento;
- si tampoco responde, archivar o marcar como perdido por falta de respuesta según el caso;
- evitar cadenas de mensajes insistentes.

Casos actuales con seguimiento acortado:

- **Salón de Belleza Marta Benítez:** respondió inicialmente, revisó la demo y después dejó de contestar → seguimiento al día siguiente.
- **Centro de Belleza Carmen:** respondió al saludo pero no avanzó en la propuesta → seguimiento al día siguiente.

## Aprendizajes concretos

### Cristina García Peluquería y Estética — 14/10/2026

Respuesta recibida por Instagram:

> “Hola, muchas gracias por la información, pero ya trabajamos con Booksy y nos va muy bien.”

Decisión:

- Estado en AvanttAI: `lost`.
- Motivo: **Booksy activo y satisfechos**.
- No hacer seguimiento.
- Aprendizaje: **comprobar Booksy antes de preparar la demo**.

### Animalex — 14/10/2026

- Negocio pequeño, gestionado por una sola persona.
- Lleva 23 años con su sistema actual y dice que le funciona bien.
- Valora la propuesta y deja la puerta abierta para el futuro.
- No marcar como perdido definitivo; mantener como `contacted` con nota “puerta abierta”.
- Seguimiento largo: aproximadamente 90 días.

## Regla operativa a partir de ahora

Cada vez que ocurra algo relevante con un lead:

1. actualizar AvanttAI;
2. asignar o revisar `next_follow_up_at` cuando corresponda;
3. si el caso deja un aprendizaje reutilizable, añadirlo a este documento;
4. usar estos criterios en las siguientes búsquedas antes de proponer nuevos negocios o crear demos.
