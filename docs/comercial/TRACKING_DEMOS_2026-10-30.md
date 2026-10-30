# Webs Negocios — Tracking obligatorio de demos

Fecha de fijación: 30/10/2026

Este documento fija como requisito permanente el tracking de todas las demos nuevas usadas en prospección comercial.

## Objetivo

Saber qué lead ha visitado su demo y diferenciar una visita superficial de una interacción real, sin guardar IP, email, teléfono ni identidad personal del visitante.

## Infraestructura

- Script común: `/shared/demo-tracking.js`
- Base de datos: AvanttAI / Supabase
- Tabla: `public.lead_demo_events`
- RLS activado.
- El cliente público únicamente tiene permiso de INSERT; no puede leer eventos.

## Eventos

- `demo_view`: la demo permanece visible al menos ~1,2 segundos.
- `demo_engaged`: existe interacción y el usuario alcanza al menos un 25% de scroll.
- `deep_scroll`: alcanza al menos un 60% de scroll.
- `cta_click`: pulsa un CTA, botón o enlace de contacto rastreable.

## Regla de URL

Cada enlace enviado a un lead debe llevar un identificador CRM único.

Instagram:

`?utm_source=instagram&utm_campaign=YYYY-MM-DD&utm_content=lead_ID`

Email:

`?utm_source=email&utm_campaign=YYYY-MM-DD&utm_content=lead_ID`

Facebook:

`?utm_source=facebook&utm_campaign=YYYY-MM-DD&utm_content=lead_ID`

Nunca incluir email, teléfono, nombre de persona u otro dato personal en la URL.

## Regla de implementación

Toda demo nueva de prospección debe cargar antes de `</body>`:

```html
<script src="/shared/demo-tracking.js"></script>
```

Una demo no se considera lista para enviar si no incluye este script y no dispone de su `lead_id` real en AvanttAI.

## Privacidad

No registrar:

- IP;
- email del visitante;
- teléfono;
- nombre;
- contenido de formularios;
- datos personales introducidos por el visitante.

El tracking solo almacena lead CRM, canal, campaña, sesión anónima, ruta, referrer, tipo de evento y metadatos técnicos mínimos del evento.

## Criterio comercial

Prioridad de seguimiento:

1. `cta_click`
2. `deep_scroll`
3. `demo_engaged`
4. `demo_view`
5. sin eventos

El objetivo es priorizar el seguimiento de negocios que realmente han interactuado con la demo, no basarse en aperturas de email.

## Regla permanente

Este flujo se aplica a todas las demos nuevas de Webs Negocios a partir del 30/10/2026 salvo indicación expresa de Jose para un caso concreto.
