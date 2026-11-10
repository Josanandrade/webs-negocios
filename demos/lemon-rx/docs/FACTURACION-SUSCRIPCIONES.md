# Lemon RX — Facturación y suscripciones (diseño de implementación)

Estado: **EN DESARROLLO — MIGRACIÓN BASE APLICADA EN SUPABASE; UI Y CONTROL DE ACCESO NO DESPLEGADOS**. Decisión funcional confirmada el 10-11-2026.

## Regla validada
- Una suscripción caducada NO desactiva la cuenta ni la sesión.
- El atleta conserva RM, evolución, historial, Home histórica y semanas ya accesibles.
- Regla A: si la suscripción vence durante una semana, esa semana completa continúa visible; se restringen las semanas siguientes.
- Una cortesía otorga acceso temporal sin considerarse pago ni ingreso.
- Recordatorio por correo cinco días antes del vencimiento, con idempotencia.

## Modelo de datos propuesto
1. `athlete_subscription_periods`: `id`, `user_id`, `starts_on`, `ends_on` (ambos inclusivos), `kind` (`payment`/`courtesy`), `amount_cents` (solo pago, nullable cortesía), `currency`, `paid_on`, `note`, `created_by`, `created_at`, `voided_at`. Sin eliminar registros: anulación auditada.
2. `subscription_reminder_deliveries`: `id`, `user_id`, `period_id`, `reminder_kind`, `due_on`, `status`, `provider_message_id`, `sent_at`, `created_at`; restricción única por periodo y tipo para evitar duplicados.
3. No almacenar información de tarjetas. Pagos inicialmente registrados manualmente.
4. RLS: atletas solo pueden consultar sus propios periodos, administradores pueden gestionarlos; escrituras exclusivamente vía acciones servidor autorizadas. Importes e información de otros usuarios nunca accesibles públicamente.

## Algoritmo de acceso
- Administradores: acceso completo por rol.
- Usuarios pendientes o bloqueados administrativamente: conservar la autorización de cuenta existente.
- Para atletas activos, buscar periodos de pago o cortesía no anulados que cubran la fecha consultada.
- Si hay acceso vigente, permitir semanas publicadas según la lógica normal.
- Si no hay acceso vigente, conservar todas las semanas cuyo lunes sea menor o igual al lunes de la semana en que terminó el último periodo válido (semana de vencimiento inclusive).
- Si el atleta no tiene nunca un periodo válido, no dar acceso a semanas nuevas por defecto. Los datos previos del atleta siguen disponibles.
- Si existen periodos discontinuos, conservar las semanas que alguna vez estuvieron cubiertas, además de la semana de vencimiento de cada periodo; no conceder automáticamente acceso a semanas intermedias no cubiertas.
- Definir explícitamente la política de publicación anticipada: una semana futura NO se considera histórica solo por haber sido publicada.
- Proteger lecturas en servidor y RLS/RPC de `weeks`, `days`, `workout_blocks`, resultados y rankings; no basta con ocultar enlaces.
- La Home histórica debe filtrarse por fecha de entrenamiento y preservar los posts ya visibles; impedir acceso a contenido nuevo restringido sin borrar posts anteriores.

## Compatibilidad
- `profiles.payment_status` y `app_settings.auto_block_unpaid` ya existen: revisar todos los puntos de lectura y escritura antes de introducir periodos, evitando dos fuentes de verdad.
- No modificar `access_status` al caducar. No borrar ni cambiar IDs de bloques, logs, resultados, posts ni RM.
- No activar el nuevo bloqueo hasta haber migrado o asignado de forma segura los derechos vigentes de los atletas actuales.
- Fecha mostrada DD-MM-AAAA; almacenamiento en DATE ISO.
- No enviar correos sin recuperar la plantilla de email de Lemon RX validada previamente.

## Panel admin propuesto
- Nueva sección `Facturación` con búsqueda, estado de acceso, vencimiento, próximo recordatorio, pagos y cortesías.
- Acciones: registrar pago (importe, fecha, periodo), conceder cortesía (inicio/fin, motivo), consultar historial y anular entrada con confirmación.
- Mostrar de forma distinta: al día, cortesía, próximo a vencer, caducado y sin historial.
- En ficha del atleta, resumen de suscripción y acceso al historial económico.
- En perfil del atleta, vencimiento y mensaje claro cuando la programación nueva está restringida.

## Recordatorios
- Proceso diario servidor con autenticación propia y Resend; enviar cuando `ends_on = fecha_local + 5 días` y no haya renovación posterior que evite el vencimiento.
- Idempotencia y gestión de errores/reintentos; no duplicar envíos.
- Mantener plantilla HTML/branding validado, no recrear.
- No asumir que se ha enviado sin respuesta confirmada del proveedor.

## Orden de trabajo y pruebas
1. Auditar acciones, páginas y RLS actuales de pagos y acceso; localizar plantilla Resend y cron existente.
2. Preparar migración reversible y pruebas sin activar restricciones.
3. Implementar lógica central de derechos y proteger todas las rutas/RPC pertinentes.
4. Crear panel admin y vista de atleta.
5. Añadir cron de avisos con modo de prueba sin envío real.
6. Migrar estados actuales con comprobación individual y activar mediante feature flag.
7. QA: vencimiento miércoles, domingo, cortesías, renovaciones anticipadas, semanas publicadas antes de tiempo, usuarios sin periodos, RM, Home, ranking, historial, rol admin, accesos directos y correos duplicados.
8. Validación del usuario en preview; después despliegue productivo con verificación de alias estable.

**Importante:** Este documento es especificación de desarrollo; no implica que migración, interfaz, cron o permisos estén desplegados.

## Avance 10-11-2026
- Migración `lemon_rx_billing_periods_foundation` aplicada al proyecto Supabase Lemon RX (`ugkkiihuyuaatulykkba`).
- Creadas `athlete_subscription_periods` y `subscription_reminder_deliveries`, con RLS, políticas y restricciones.
- Verificada existencia de ambas tablas y que no hay periodos introducidos.
- Sin cambio de `has_program_access`, `can_view_week`, `payment_status` ni `access_status`; por tanto no se activa bloqueo nuevo.
- El advisor de seguridad sigue señalando avisos de funciones SECURITY DEFINER preexistentes que requieren revisión separada, sin atribuirlos a las tablas nuevas.
- Pendiente: frontend, acciones admin, validación de migración de usuarios, avisos Resend y protección completa de acceso.

## Avance interfaz 10-11-2026
- Rama de desarrollo: `feat/lemon-rx-billing-subscriptions`.
- Nueva ruta admin `/admin/facturacion` con formulario de pago/cortesía, listado de últimos 300 movimientos y anulación auditada.
- Acciones servidor con `requireAdmin`, validación de fechas, importe y atleta; escritura a tabla con RLS.
- Acceso desde `/admin/usuarios` mediante enlace a Facturación.
- Sin despliegue a producción ni ejecución de pagos reales de prueba.
- Pendiente: build/typecheck y QA visual en preview; mejorar confirmación de anulación y filtros, evitar solapamientos no deseados, decidir formato DD-MM-AAAA editable, y conectar permisos/cron.

## Avance 10-11-2026 — motor de acceso en modo prueba
- Se aplicó migración `lemon_rx_billing_entitlement_preview_only`: función `subscription_week_entitlement(user_id,week_start,today)` con acceso exclusivamente service_role.
- Evalúa periodos pagados/cortesía no anulados; conserva íntegra la semana del vencimiento y no habilita semanas posteriores sin cobertura. No se ha conectado a `can_view_week` ni al frontend: **no está activado**.
- Verificado en Supabase: 11 atletas actualmente `paid`, 0 periodos nuevos, 0 con acceso simulado para la semana del 16/11 sin periodos. `can_view_week` sigue utilizando el control anterior.
- **Bloqueante para activar:** migrar explícitamente a los 11 atletas vigentes con fechas reales, o una política transitoria de derechos que no invente vencimientos. No crear fechas arbitrarias.
- Pendientes antes de activación: pruebas con periodos ficticios en entorno aislado, proteger endpoints/RPC y datos históricos, confirmar Home y rankings, comprobar build y experiencia del panel.

## Decisión adicional 10-11-2026: Home bloqueada desde el día de vencimiento
- Regla confirmada: **programación** conserva la semana del vencimiento completa, pero **Home** no muestra contenido nuevo desde el mismo día de caducidad. Contenido histórico anterior a ese día, RM, estadísticas y acceso a cuenta se conservan.
- Función preview-only `subscription_home_entitlement(user_id,content_date,today)` añadida en Supabase; permite contenido Home con fecha `>= starts_on` y `< ends_on` para periodos no anulados. El día `ends_on` ya se considera restringido en Home. Admin exento.
- Función no conectada aún a Home ni a RLS. No afirmar bloqueo activo hasta auditar rutas/consultas y proteger servidor/RPC.
- **Punto de UX a revisar:** en formulario `ends_on` figura como 'fin de cobertura (inclusive)' para la programación; la Home utiliza el mismo día como fecha de corte. Mostrar esta diferencia claramente en el panel.
- Pendiente comprobar la implementación exacta de Home (ruta, tablas y APIs), y no restringir datos históricos/RM accidentalmente.

## Avance de integración en rama (10-11-2026)
- Añadido `src/lib/subscription-access.ts` con interruptor `LEMON_RX_SUBSCRIPTION_ENFORCEMENT` **desactivado por defecto**.
- Preparadas comprobaciones de acceso en la página `/` (semanas), `/home` y acciones sociales (reacciones, comentarios, carga diferida), condicionadas al interruptor.
- Interpretación de la última petición: desde el día de vencimiento **no se puede abrir Home**, no solo ocultar posts recientes. La programación mantiene acceso a la semana completa. Confirmar esta interpretación antes de activar si se desea consultar Home histórica.
- **NO activar el interruptor aún**: faltan migración de fechas de los 11 atletas, RLS y protección de RPC/tablas relacionadas, y pruebas de compilación, seguridad y UX. La restricción de página por sí sola no protege acceso directo a datos vía API.
- Recordatorios Resend aún no implementados ni activados.

## CORRECCIÓN EXPLÍCITA 10-11-2026 — Home congelada, nunca cerrada
- La instrucción confirmada del usuario **sustituye** cualquier mención anterior de bloqueo total de `/home`.
- El atleta caducado puede **abrir Home siempre** y leer publicaciones publicadas antes de las 00:00 (Europe/Madrid) de `ends_on`. No ve publicaciones nuevas desde ese día.
- Filtrar por `first_completed_at`, **no** por `training_date` ni por `updated_at`, para que una publicación nueva de entrenamiento antiguo no se cuele. Los posts antiguos siguen visibles; reacciones/comentarios sobre ellos no se bloquean.
- Código corregido en `src/app/(app)/home/page.tsx`, `home/actions.ts`, `src/lib/subscription-access.ts`; detrás de feature flag apagada.
- **Pendiente de seguridad antes de activar**: proteger las consultas directas de Supabase, RPC de comentarios y el acceso a posts por ID; comprobar si ediciones y comentarios nuevos de publicaciones antiguas deben congelarse también. La lógica actual filtra posts, pero no congela sus comentarios ni reacciones.
- La función preview-only `subscription_home_entitlement` en Supabase sigue siendo experimental y **no representa el acceso a la página Home**; no conectarla como guardia de ruta.
