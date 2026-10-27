# Registro de subencargados y transferencias — AvanttAI Health

Fecha de revisión: 27/10/2026

## Regla

AvanttAI debe mantener una lista viva de proveedores que puedan procesar datos personales por cuenta de las clínicas. Antes de producción, cada proveedor debe tener:
- contrato/DPA aplicable;
- rol documentado;
- categorías de datos minimizadas;
- localización/transferencias revisadas;
- mecanismo válido para transferencias internacionales cuando proceda;
- procedimiento de aviso de cambios de subencargados.

## Registro inicial

| Proveedor | Función | Datos que debería recibir | Estado contractual | Transferencias / notas | Estado go-live |
|---|---|---|---|---|---|
| Supabase | Base de datos, Auth/Storage/Edge según configuración | Datos de pacientes y clínica necesarios para el servicio | DPA oficial disponible; AvanttAI debe conservar evidencia de aceptación/versión | DPA contempla subencargados y SCC; proyecto TEST actual en `eu-west-2` | PENDIENTE evidencia contractual de producción |
| Railway | Hosting/runtime de aplicación | Requests, metadatos operativos y datos transitorios procesados por la app | DPA oficial disponible | Lista de subencargados y aviso previo; producción debe fijarse en región europea cuando sea posible | PENDIENTE cierre contractual/producción |
| Resend | Email transaccional | Solo identidad/contacto y contenido mínimo imprescindible | DPA oficial disponible | DPA incorpora SCC para transferencias fuera del EEE cuando proceda | PENDIENTE minimizar plantillas y conservar evidencia DPA |
| Stripe | Pagos | Identidad mínima, importe y referencia de operación; no historia clínica | DPA incorporado al acuerdo de servicios | Stripe puede actuar como encargado y/o responsable según la operación | PENDIENTE cuenta de producción y revisión de flujo |
| Setmore | Fuente legacy de migración | Datos existentes a migrar | Depende del contrato de la clínica | Uso temporal; documentar exportación, importación y cierre | PENDIENTE plan de migración |

## Proveedores no incluidos automáticamente

Cloudflare, Vercel, proveedores de IA, analítica, soporte, almacenamiento adicional o mensajería no deben añadirse al flujo de datos clínicos por el mero hecho de que AvanttAI los use en otros productos. Si llegan a procesar datos de Health, deben incorporarse antes a este registro y superar revisión legal/técnica.

## Minimización por proveedor

### Resend

No incluir diagnósticos, notas clínicas ni motivos de consulta en asunto/cuerpo de correo. Preferir:
- nombre de la clínica;
- fecha/hora de cita;
- enlace seguro de gestión;
- códigos de verificación con caducidad.

### Stripe

No enviar diagnóstico, tratamiento ni notas clínicas. Usar referencias internas opacas y descripciones de pago genéricas.

### Railway

No registrar payloads clínicos completos en logs. Mantener logs con IDs técnicos, estado, ruta y errores sanitizados.

### Supabase

Mantener región europea para producción salvo decisión documentada distinta. Aplicar RLS/ACL, mínimo privilegio y separación de entornos.

## Cambios de subencargados

Proceso interno:
1. detectar nuevo proveedor o cambio material;
2. revisar DPA, subencargados y transferencias;
3. evaluar impacto de seguridad y privacidad;
4. actualizar este registro;
5. notificar a los Responsables cuando proceda según contrato;
6. respetar periodo de oposición aplicable;
7. activar solo después de completar los pasos anteriores.

## Evidencias a guardar

Por proveedor:
- copia/PDF o hash/fecha de la versión del DPA aceptada;
- fecha de aceptación;
- lista de subencargados vigente o enlace versionado;
- ubicación/región contratada;
- mecanismo de transferencia;
- evaluación de riesgo/TIA cuando resulte necesaria;
- contacto de seguridad y privacidad.

## Fuentes oficiales revisadas

- Supabase DPA: https://supabase.com/legal/customer-resources/data-processing-addendum
- Railway DPA: https://railway.com/legal/dpa
- Resend DPA: https://resend.com/legal/dpa
- Stripe DPA: https://stripe.com/legal/dpa
