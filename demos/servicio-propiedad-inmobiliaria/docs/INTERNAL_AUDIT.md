# Servicio Propiedad Inmobiliaria S.L. (Coria del Río): auditoría interna

Documento interno. No se despliega (vive fuera de `demo-host/`).

## Datos verificados (23/10/2026)

| Dato | Valor | Fuente |
|---|---|---|
| Razón social | SERVICIO PROPIEDAD INMOBILIARIA S.L. | qdq.com, paginasamarillas.es |
| Dirección | C/ Agrupación Artística Coriana, 29 · Casa 2, 41100 Coria del Río (Sevilla) | qdq.com, paginasamarillas.es |
| Teléfono | 954 77 84 51 (fijo) | qdq.com |
| Web propia | No encontrada | búsquedas web |
| Email, horario, redes, WhatsApp | No encontrados | — |

Es un teléfono fijo, así que no hay WhatsApp confirmado. Según REGLAS_CAPTACION, queda **pendiente de contactar por llamada**.

## Comprobación de portales

- Búsquedas por nombre comercial, razón social y teléfono, también restringidas a idealista.com, fotocasa.es, habitaclia.com y yaencontre.com: **sin resultados de esta agencia**. Solo aparece en directorios (qdq, Páginas Amarillas).
- El proxy del contenedor bloquea el acceso directo a los portales (403), así que no se pudo consultar su buscador de agencias. Antes de llamar, conviene revisar a mano en Idealista y Fotocasa la sección de profesionales de Coria del Río.

## Lo que la demo NO afirma

- Inmuebles, consultas, solicitudes de propietarios y cifras del panel: **datos de ejemplo**, etiquetados como tales en todas las vistas.
- Bloque "Cómo trabajamos" (valoración, ficha, visitas, notaría): texto genérico del sector, pendiente de validar con el negocio.
- Zonas del entorno (Gelves, La Puebla del Río, Almensilla) solo en datos de ejemplo.
- Sin horario: se muestra "Llámenos para concertar cita".

## Dirección de arte: "el fichero"

- Concepto: cada casa tiene su ficha. Las tarjetas de archivo con pestaña REF llevan del fichero de papel a un portal propio.
- Paleta: papel #F3EEE3 / carbón #1C1B18 + lacre #9A2E22 + río #4F6D78 + latón #B48A3C.
- Tipografía: Besley (display) + Work Sans + Martian Mono (referencias).
- Hero: pila de fichas que rota sola, sello de lacre giratorio y un río punteado animado.
- Distinta de Julio Puig (también en Coria: marfil, verde marisma, arcos, Ibarra Real).

## Panel /panel-demo/

Es una vista previa estática, sin login, backend ni persistencia. Los botones cambian el estado solo en memoria y muestran un aviso de "Simulación". Al recargar, todo vuelve a su estado inicial.
Vistas: Resumen, Inmuebles (tabla o tarjetas), Nuevo inmueble (vista previa en vivo y "Rellenar con un ejemplo"), Consultas y Propietarios.
Desde la web pública, los formularios de consulta y de captación no envían nada: enseñan cómo llegaría el mensaje al panel.
