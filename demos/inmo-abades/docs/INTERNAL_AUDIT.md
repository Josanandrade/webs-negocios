# Inmo Abades · auditoría interna (NO desplegada)

Fecha: 2026-10-23. Lote de 6 inmobiliarias sin grandes portales.

## Verificación de portales
- Búsquedas: "Inmo Abades" Sevilla, "Inmobiliaria Abades" Sevilla, "inmoabades", Inmo Abades + Idealista/Fotocasa/Habitaclia/Yaencontre.
- Resultado: ninguna ficha de agencia "Inmo Abades" en Idealista, Fotocasa, Habitaclia ni Yaencontre. Los resultados de Idealista son páginas de la *calle* Abades (Santa Cruz, 41004) y del municipio Abades (Segovia), no de la agencia.
- Aparece un "ABADES Gestión Inmobiliaria" en tucasa.com (portal menor), sin poder confirmar ciudad ni relación (robots bloquea la lectura). No se ha usado.
- No se ha encontrado web propia ni datos de contacto públicos (teléfono, dirección, email, horario, reseñas).
- Límite: Google Maps, Instagram y Facebook están bloqueados desde el entorno; Jose debe comprobarlo a mano.

## Datos usados en la demo
- Solo nombre y zona (Sevilla Centro) dados por Jose.
- Teléfono/WhatsApp: vacíos en `demo-host/assets/data.js` (CONFIG.phone / CONFIG.whatsapp). Si se rellenan, aparecen botones de llamada y WhatsApp.
- Todos los inmuebles, consultas, propietarios y visitas son ficticios y están etiquetados ("Inmueble de ejemplo", "Datos de demostración"). Teléfonos del panel enmascarados.

## Identidad
"Cancela y patio": cal #FBF7EF, tinta #1B1714, almagra #9A3B26, ocre #C9973F, azulejo #2D5C9A, forja #2F4A3F. EB Garamond + Golos Text + Azeret Mono. Logotipo como placa de azulejo de calle. Hero: cancela de forja que se abre sobre un patio ilustrado.

## Panel /panel-demo
Estático, sin login, sin backend, sin almacenamiento. Cambios solo en memoria con aviso "Simulación"; al recargar vuelve al estado inicial.
