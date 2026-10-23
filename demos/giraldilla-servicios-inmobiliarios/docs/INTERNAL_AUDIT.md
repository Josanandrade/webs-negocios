# Giraldilla Servicios Inmobiliarios — auditoría interna (NO desplegar)

Fecha: 2026-10-23. Lote de 6 inmobiliarias sin portales + preview de panel.

## Verificación de portales
- Búsquedas en Idealista, Fotocasa, Habitaclia y Yaencontre: **no aparece** ninguna ficha de "Giraldilla".
- Ojo con homónimos que sí usan portales y NO son este negocio: *Giralda Propiedades Inmobiliarias* (Idealista, Habitaclia, Yaencontre) y *Giralda Inmobiliaria* (Juan Rabadán 3, Páginas Amarillas).
- No se ha encontrado web propia, ficha de Google Business ni redes sociales. El contenedor no puede abrir Google Maps ni empresite (bloqueados).

## Señal de alerta
- BOE 13/09/2021 (BOE-A-2021-14881), anexo de NIF revocados por la AEAT:
  `B91090217 GIRALDILLA SERVICIOS INMOBILIARIOS SL. 25/06/2021 REGISTRO MERCANTIL DE SEVILLA`.
- La revocación de NIF suele aplicarse a sociedades sin cuentas depositadas en varios ejercicios: posible inactividad. Se ha preguntado a Jose antes de enviar la demo.
- Ficha existente (no consultable desde aquí): empresite.eleconomista.es/GIRALDILLA-SERVICIOS-INMOBILIARIOS.html

## Datos usados en la demo
- Solo el nombre y "Sevilla". Sin teléfono, WhatsApp, dirección, horario ni email (pendientes, se indica en la web).
- Los 8 inmuebles, las consultas y los propietarios son **datos de demostración** inventados y etiquetados como tales. Imágenes = ilustraciones SVG propias (assets/art.js), no fotos.

## Dirección de arte
"La veleta": la Giraldilla es la veleta de la Giralda. Hero = rosa de los vientos con la veleta apuntando al barrio elegido.
Marfil #F4EFE6 / tinta bronce #1C1712 + bronce #9A6B34 + pátina #3E9B8A. Noto Serif Display + Cinzel + Golos Text.
Distinto de Villalón (añil/albero, mapa), Julio Puig (verde marisma, arco), Inmomairena (malva/coral), Alves (naranjo), Ángel Machuca (solar).

## Rutas desplegadas
- `/` web pública (incluye sección "Gestiona tu cartera" marcada como simulación).
- `/panel-demo/` vista previa del área de gestión (sin login, sin persistencia; los cambios viven solo en memoria).
