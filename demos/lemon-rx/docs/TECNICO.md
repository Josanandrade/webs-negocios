# Lemon RX — Técnico

> Documento vivo de arquitectura, infraestructura, datos, seguridad e incidencias técnicas. Debe reflejar el estado real conocido del sistema y diferenciar claramente lo implementado de lo que solo es una dirección futura.

## 1. Línea base técnica

Auditoría inicial: 13/10/2026.

- Repo: `Josanandrade/webs-negocios`
- Ruta app: `demos/lemon-rx`
- Producción: rama `main`
- Rama documental: `docs/lemon-rx-continuidad`
- Framework: Next.js 16.4.0 App Router
- React: 19.3.0
- TypeScript: 5.x
- Tailwind CSS: 4.x
- Supabase JS: 2.117.3
- Supabase SSR: 0.12.7
- Web Push: 3.6.7
- Runtime observado: Node 20.20.2

## 2. Infraestructura

### Railway

Proyecto:
- `terrific-compassion`

Servicio:
- `Lemon Rx`

Entorno:
- production

Fuente:
- GitHub `Josanandrade/webs-negocios`
- branch `main`
- root `/demos/lemon-rx`

Dominio:
- `lemon-rx-production.up.railway.app`

### Supabase

Conexión `Lemon RX` disponible y verificada.

Reglas:
- cualquier cambio de esquema/RLS debe verificarse contra el proyecto Lemon RX correcto;
- leer la skill de Supabase antes de cualquier trabajo sobre Supabase;
- no reutilizar proyectos de AvanttAI;
- no exponer `service_role` en cliente;
- cualquier tabla expuesta debe mantener RLS adecuada.

### Resend

La aplicación utiliza Resend para comunicaciones propias cuando está configurado.

## 3. Variables de entorno sensibles

Esperadas:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SITE_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `PUSH_SECRET`
- `NEXT_TELEMETRY_DISABLED`

Reglas:
- no documentar valores secretos;
- no introducir `service_role` en cliente;
- mantener secretos de Resend/Push solo en servidor.

## 4. Arquitectura funcional

Rutas públicas/auth:
- `/login`
- `/registro`
- `/recuperar`
- `/auth/callback`
- `/auth/signout`
- `/nueva-contrasena`

Zona atleta:
- `/`
- `/ranking`
- `/historial`
- `/cuenta`

Administración:
- `/admin`
- `/admin/programacion`
- `/admin/programacion/[id]`
- `/admin/usuarios`
- `/admin/usuarios/[id]`
- `/admin/usuarios/[id]/historial`
- `/admin/ajustes`

## 5. Autenticación y autorización

- Supabase Auth mediante `@supabase/ssr`.
- El proxy/session middleware no sustituye la autorización real.
- Páginas y acciones servidor validan usuario/rol.
- RLS sigue siendo parte central del modelo de seguridad.
- Los atletas solo modifican su propia actividad/resultados.
- Los admins tienen acceso ampliado mediante funciones/policies controladas.
- No mover la seguridad exclusivamente a frontend.

## 6. Modelo de datos — estado validado

### `profiles`

Campos relevantes conocidos:
- `id`
- `full_name`
- `email`
- `role`
- `payment_status`
- `access_status`
- `sex`
- `show_evolution_as_athlete`
- timestamps

Reglas:
- `sex` se captura como Hombre/Mujer para nuevos usuarios; nunca inferirlo por nombre;
- `show_evolution_as_athlete` permite que un admin participe también como atleta en el panel de evolución;
- para admins el comportamiento vigente es activado por defecto, con desactivación individual voluntaria.

### Programación

Entidades base:
- `weeks`
- `days`
- `workout_blocks`

Regla técnica crítica:
- preservar IDs de `workout_blocks` al editar para no romper resultados e historial.

Riesgo conocido:
- `save_week_content` elimina bloques antiguos que desaparecen del payload;
- `block_logs` y `block_results` están vinculados al bloque y pueden desaparecer por `ON DELETE CASCADE`;
- por tanto, no sustituir IDs ni rehacer el guardado sin una migración explícita y segura.

### Actividad y resultados

Entidades base:
- `block_logs`
- `block_results`

El modelo cubre:
- tiempo;
- rondas/reps;
- reps/calorías;
- peso;
- intervalos;
- cargas de Strength/Weightlifting;
- `total_load`;
- detalle estructurado de series/rondas mediante `reps_detail` cuando corresponde.

### Strength / Weightlifting

Estado validado:
- catálogo de movimientos;
- `is_rm_eligible` para separar movimientos programables de movimientos válidos para RM;
- constructor unificado con `builder_sections`;
- series/reps;
- porcentajes sobre RM;
- Complex;
- EMOM;
- A.1/A.2/A.3…;
- accesorios;
- compatibilidad con bloques históricos;
- cálculo de `total_load`;
- ranking por carga total.

Regla:
- preservar compatibilidad con resultados existentes al cambiar estructura.

### RM e histórico

- `user_rms` mantiene el valor actual por usuario/movimiento.
- `user_rm_history` conserva snapshots históricos desde la implantación del motor de evolución.
- Se creó baseline de los RM existentes en el momento de implantar el histórico.
- No se reconstruye ni inventa la evolución exacta de RM previa a ese momento.

## 7. Ranking

Flujo protegido:
- resultados privados no se exponen abriendo tablas directamente;
- se usan funciones/lecturas controladas.

Comportamiento validado:
- ranking por bloque;
- RX/Intermedio donde aplica;
- ranking de Strength/Weightlifting por carga total;
- General / Masculina / Femenina;
- empates consistentes;
- clasificación diaria recalculada por resultado real;
- detalles expandibles de la sesión del atleta en Ranking.

Funciones relevantes existentes:
- `week_leaderboard_v2(p_week_id uuid)`
- `ranking_day_athlete_activity(p_week_id uuid, p_date date)`

La UI de General/Masculina/Femenina se filtra localmente una vez que los datos están cargados; no requiere nueva navegación al servidor.

## 8. Historial y contexto

### Historial de usuario

- `training_history_v2(p_user_id uuid)` aporta datos para historial con compatibilidad con `builder_sections`.
- La UI traduce `reps_detail`/JSON estructurado de fuerza a texto humano; no mostrar JSON técnico al usuario.

### Historial contextual de movimiento

- `movement_training_history(p_movement_id uuid, p_exclude_block_id uuid)`.
- Lectura del usuario autenticado.
- Recupera hasta los últimos 3 entrenamientos anteriores del mismo movimiento.
- Compatible con bloques antiguos y constructor unificado.
- Excluye el bloque actual.

## 9. Motor de evolución

Funciones principales:
- `athlete_evolution_metrics(p_user_id uuid, p_weeks integer, p_as_of date)`
- `coach_evolution_metrics(p_weeks integer, p_as_of date)`

Ventanas de UI vigentes:
- 4 semanas;
- 8 semanas;
- 12 semanas.

Métricas validadas:
- cumplimiento;
- WODs comparables;
- posición media del atleta en esos WODs;
- participantes medios en esos WODs;
- sesiones Strength/Weightlifting realizadas/programadas;
- volumen total;
- evolución de RM desde que hay histórico;
- número de notas, sin análisis semántico todavía.

Reglas:
- cumplimiento solo cuenta días hasta HOY en zona `Europe/Madrid`;
- no penalizar al atleta por días futuros;
- no penalizar por programación anterior a su alta;
- WOD se compara dentro de la misma división;
- la UI muestra posición media como `posición/participantes`, por ejemplo `5/14`;
- el motor calcula hechos; cualquier futura IA solo debe explicar métricas verificadas, no calcularlas ni prescribir entrenamiento.

## 10. Panel de evolución de coach/admin

- Panel admin consume `coach_evolution_metrics`.
- Muestra cumplimiento medio y métricas agregadas útiles.
- No se muestra una posición WOD media global porque no aporta contexto útil al coach.
- Incluye listado de usuarios con bloques pendientes, ordenados desde menor cumplimiento.
- Los admins con `show_evolution_as_athlete=true` aparecen como atletas en este panel.

## 11. Rendimiento — Fase 1 VALIDADA 16/10/2026

Cambios de frontend/navegación validados:

1. **Ranking local**
   - General/Masculina/Femenina se filtra en cliente con los datos ya cargados.
   - La URL se actualiza sin provocar una navegación completa para ese filtro.

2. **Semana progresiva**
   - Los bloques de cada día no se montan hasta que ese día se abre por primera vez.
   - Una vez montados se conservan para reaperturas rápidas.
   - Se conserva el comportamiento móvil ya validado de scroll, tamaños y foco del día.

3. **Menos prefetch**
   - navegación principal/admin, periodos de evolución y fichas de usuarios evitan precargas innecesarias donde podían disparar consultas dinámicas no solicitadas.

4. **Evolución diferida**
   - Panel admin y Cuenta muestran primero el contenido principal;
   - Evolución se resuelve dentro de `Suspense`/carga progresiva y no bloquea la primera pintura de la página.

No se modificaron en esta fase:
- Supabase;
- esquema/RLS;
- `save_week_content`;
- resultados;
- notas;
- IDs de bloques.

## 12. Comunicaciones

### Publicación de semana
- Resend para email de publicación.
- Evitar duplicados con estado persistido.
- El fallo del correo no debe tumbar la publicación principal.

### Invitaciones
- Flujo de invitación por email.
- Debe mantenerse separada la acción de invitar de la aprobación efectiva del acceso cuando se requiera validación manual.

### Web Push
- admins pueden activar suscripción;
- avisos por nuevos registros;
- `PUSH_SECRET` nunca en cliente;
- limpiar endpoints expirados.

## 13. RLS y seguridad

Patrón protegido:
- `anon`: sin acceso funcional sensible;
- `authenticated`: propietario/rol/visibilidad;
- admin: acceso ampliado controlado;
- atleta: actividad propia;
- programación: lectura condicionada a visibilidad/acceso.

No introducir atajos administrativos desde cliente.

Los advisors de Supabase deben revisarse periódicamente. No convertir automáticamente todos los avisos en cambios: distinguir recomendaciones genéricas de riesgos reales del flujo actual.

## 14. Incidencias técnicas abiertas

### T1 — Node 20
Railway usa Node 20.20.2. Evaluar actualización de runtime solo en entorno seguro y con smoke tests completos; no hacerlo como efecto colateral de otra tarea.

### T2 — `refresh_token_already_used`
Se observaron errores puntuales de refresh token. No corregir sin reproducir y entender flujo de cookies/solicitudes concurrentes.

### T3 — vulnerabilidades npm
No ejecutar `npm audit fix --force` automáticamente.

### T4 — pruebas RLS
Mejorar automatización de pruebas de permisos antes de cambios de esquema relevantes.

### T5 — escalabilidad del motor coach
`coach_evolution_metrics` es suficiente para el volumen actual, pero debe revisarse antes de escalar a cientos de atletas. Futuro candidato: cálculo conjunto/agrupado en DB en vez de repetir cálculos individuales.

## 15. Dirección técnica futura — comercialización / white-label

Decisión estratégica registrada 15/10/2026, NO implementada todavía.

Lemon RX podría evolucionar desde una única programación a una plataforma para múltiples empresas/programaciones de CrossFit/CrossTraining.

Arquitectura futura probable:

`organization/programming -> boxes -> athletes`

Posibles entidades/campos futuros:
- organización/tenant;
- branding de organización;
- boxes/sedes;
- membresía de usuario en organización/box;
- roles por organización;
- programas/niveles;
- medición de atletas activos por ciclo de facturación.

Regla:
- NO construir multi-tenancy todavía;
- evitar nuevas decisiones que hagan extremadamente costosa esa migración futura;
- si llega el momento, el aislamiento debe diseñarse en DB/RLS, no como simples filtros frontend.

## 16. Hipótesis de precios

- 35 €/mes hasta 70 atletas activos;
- desde el atleta 71, +0,50 €/mes por atleta activo adicional;
- coaches/admins no computan.

Si se comercializa, será necesario definir técnicamente qué significa **atleta activo** de manera auditable. Todavía no implementar billing sobre esta hipótesis.

## 17. Siguiente fase de rendimiento

**Fase 2 — invalidaciones al guardar.**

Objetivo:
- reducir `revalidatePath` demasiado amplios después de guardar hecho/nota/resultado;
- invalidar solo las vistas realmente afectadas;
- mantener datos inmediatamente frescos después del guardado.

Reglas de ejecución:
- hacerlo acción por acción;
- validar manualmente cada flujo;
- no tocar `save_week_content`;
- no cambiar IDs de bloques;
- rollback sencillo si una pantalla quedara con datos obsoletos.

## 18. Checklist técnico obligatorio

Antes de cada cambio:
- ¿qué flujo toca?
- ¿qué tabla/RPC/RLS toca?
- ¿puede romper IDs/histórico?
- ¿afecta auth/cookies?
- ¿afecta usuarios existentes?
- ¿puede duplicar emails/Push?
- ¿necesita migración?
- ¿es reversible?
- ¿build y TypeScript correctos?
- ¿prueba manual del flujo?
- ¿regresión login + programación + admin?
- ¿queda DESPLEGADO/PENDIENTE o VALIDADO por Jose?

## 19. Regla documental

Tras cada bloque relevante:
- `CONTINUIDAD.md`: estado, decisiones, prioridades y memoria del proyecto.
- `FUNCIONAL.md`: reglas de negocio y comportamiento visible.
- `TECNICO.md`: arquitectura, datos, seguridad, infraestructura e incidencias.

No documentar como VALIDADO algo que solo haya sido desplegado para probar.
