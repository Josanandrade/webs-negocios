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
- Runtime productivo observado a 21/10/2026 antes de Fase 2: Node 20.20.2
- Cambio preparado: Node 22 (`>=22 <23`), pendiente de despliegue efectivo por pausa de builds de Railway.

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

Región observada:
- Europa (`europe-west4`).

### Supabase

Conexión `Lemon RX` disponible y verificada.

Proyecto:
- región `eu-west-1`;
- estado observado 21/10/2026: `ACTIVE_HEALTHY`;
- PostgreSQL 17.

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
- `/home` — inicio por defecto;
- `/` — Semana/programación;
- `/ranking`
- `/historial`
- `/rms`
- `/cuenta`
- `/notificaciones`

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
- `getViewer()` usa `supabase.auth.getClaims()` para verificar JWT y después recupera perfil + settings.

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

### Home social

Estado: **VALIDADO 21/10/2026**.

Entidades:
- `workout_posts` — una publicación por `program_key + user_id + training_date`;
- `workout_post_blocks` — proyección de bloques completados y resultados;
- `workout_post_reactions`;
- `workout_post_comments`;
- `workout_comment_reactions`.

Reglas:
- los triggers sincronizan `block_logs`/`block_results` con el post diario;
- un bloque desmarcado deja de aparecer en la proyección social y el post puede desaparecer si no queda ningún bloque;
- los datos privados originales no se abren directamente: la capa social es una proyección controlada;
- RLS exige usuario autenticado con acceso al programa;
- cada usuario modifica únicamente sus reacciones/comentarios propios dentro de las políticas definidas.

### Notificaciones

Estado: **VALIDADO 21/10/2026**.

Entidad:
- `app_notifications`.

Características:
- destinatario, actor, tipo, post/comentario, emoji, título, cuerpo, href, read_at y created_at;
- índice por destinatario/fecha;
- índice parcial para no leídas;
- RLS: cada usuario solo puede consultar y marcar sus propios avisos;
- triggers para reacción a post, comentario/respuesta y reacción a comentario;
- acciones propias no generan notificación para el mismo usuario.

Web Push:
- `save_push_subscription` admite usuarios activos con acceso, no solo admins;
- `user_push_targets` obtiene destinos de un usuario para envío servidor;
- `PUSH_SECRET` sigue siendo exclusivamente servidor;
- endpoints expirados deben limpiarse.

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

Riesgo de escala identificado 21/10/2026:
- `week_leaderboard_v2` devuelve todos los resultados puntuables de la semana aunque Ranking muestre un día concreto;
- con cientos de atletas debe evolucionar hacia lectura por día/bloques solicitados para evitar payload y cálculo innecesarios.

## 8. Historial y contexto

### Historial de usuario

- `training_history_v2(p_user_id uuid)` aporta datos para historial con compatibilidad con `builder_sections`.
- La UI traduce `reps_detail`/JSON estructurado de fuerza a texto humano; no mostrar JSON técnico al usuario.

### Historial contextual de movimiento

- `movement_training_history(p_movement_id uuid, p_exclude_block_id uuid)`.
- Lectura del usuario autenticado.
- Recupera hasta los últimos 3 entrenamientos anteriores completados del mismo movimiento.
- Compatible con bloques antiguos y constructor unificado.
- Excluye el bloque actual.

## 9. Motor de evolución

Funciones principales:
- `athlete_evolution_metrics(p_user_id uuid, p_weeks integer, p_as_of date)`
- `coach_evolution_metrics(p_weeks integer, p_as_of date)`
- `coach_current_week_metrics(p_as_of date)` para semana en curso.

Ventanas de UI vigentes:
- semana en curso;
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

Estado de UX: **VALIDADO 21/10/2026**.

- El Panel carga KPI básicos primero.
- `Seguimiento` está plegado por defecto y carga sus datos solo cuando se abre.
- Semana en curso usa `coach_current_week_metrics`.
- Histórico conserva 4/8/12 semanas.
- No se muestra una posición WOD media global porque no aporta contexto útil al coach.
- Incluye listado de usuarios con bloques pendientes, ordenados desde menor cumplimiento.
- Los admins con `show_evolution_as_athlete=true` aparecen como atletas en este panel.

## 11. Rendimiento — Fase 1 VALIDADA 16/10/2026

Cambios de frontend/navegación validados:

1. **Ranking local**
   - General/Masculina/Femenina se filtra en cliente con los datos ya cargados.
   - La URL se actualiza sin provocar una navegación completa para ese filtro.

2. **Semana progresiva**
   - Los bloques de cada día no se montan hasta que ese día se abre.
   - Desde 21/10, al cerrar un día se desmonta su contenido pesado para corregir scroll/altura residual.
   - Se conserva el comportamiento móvil validado de tamaños y foco.

3. **Evolución diferida**
   - Panel admin y Cuenta muestran primero el contenido principal;
   - Evolución/Seguimiento no bloquean la primera pintura.

4. **Code-splitting en Semana**
   - `BlockTracker`, trackers de Strength/Weightlifting, historial contextual y ranking de fuerza se cargan de forma diferida;
   - su código deja de formar parte obligatoria del coste inicial de Semana y se solicita cuando hace falta;
   - la lógica de negocio de esos componentes no se modificó.

5. **Warm-up/prefetch histórico**
   - fue validado el 16/10 en una app más pequeña;
   - queda expresamente supersedido por Fase 2 desde 21/10 porque las trazas posteriores muestran que, con más rutas y Home social, genera concurrencia y duplicados en móvil.

## 12. Comunicaciones

### Publicación de semana
- Resend para email de publicación.
- Evitar duplicados con estado persistido.
- El fallo del correo no debe tumbar la publicación principal.

### Invitaciones
- Flujo de invitación por email.
- Debe mantenerse separada la acción de invitar de la aprobación efectiva del acceso cuando se requiera validación manual.

### Web Push
Estado: **VALIDADO 21/10/2026**.

- admins y atletas activos con acceso pueden activar suscripción;
- avisos sociales pueden enviarse fuera de la app si existe suscripción;
- admins mantienen avisos por nuevos registros;
- `PUSH_SECRET` nunca en cliente;
- limpiar endpoints expirados;
- la campana in-app es la fuente persistente aunque no exista permiso Push.

## 13. RLS y seguridad

Patrón protegido:
- `anon`: sin acceso funcional sensible;
- `authenticated`: propietario/rol/visibilidad;
- admin: acceso ampliado controlado;
- atleta: actividad propia;
- programación: lectura condicionada a visibilidad/acceso;
- social/notificaciones: lectura controlada por acceso al programa y destinatario cuando corresponde.

No introducir atajos administrativos desde cliente.

Los advisors de Supabase deben revisarse periódicamente. No convertir automáticamente todos los avisos en cambios: distinguir recomendaciones genéricas de riesgos reales del flujo actual.

## 14. Incidencias técnicas abiertas

### T1 — Runtime Node
Hasta la mañana del 21/10 Railway usa Node 20.20.2. La versión actual de Supabase JS ya exige/recomienda Node 22+. El cambio de engine a `>=22 <23` está fusionado en `main`, pero su despliegue está bloqueado temporalmente por una incidencia global de builds de Railway; no considerar resuelto hasta verificar build y runtime.

### T2 — `refresh_token_already_used`
Se observaron errores puntuales de refresh token. No corregir sin reproducir y entender flujo de cookies/solicitudes concurrentes. La Fase 2 reduce peticiones concurrentes innecesarias y puede disminuir la probabilidad de carreras de sesión.

### T3 — vulnerabilidades npm
No ejecutar `npm audit fix --force` automáticamente.

### T4 — pruebas RLS
Mejorar automatización de pruebas de permisos antes de cambios de esquema relevantes.

### T5 — escalabilidad del motor coach
`coach_evolution_metrics` es suficiente para el volumen actual, pero debe revisarse antes de escalar a cientos de atletas. Futuro candidato: cálculo conjunto/agrupado en DB en vez de repetir cálculos individuales.

### T6 — advisors de FK sin índice
Supabase reporta varias FK sin índice como aviso de rendimiento. No son la causa de los picos actuales: los filtros/join principales de `weeks`, `days`, `workout_blocks`, `block_logs`, `block_results`, posts y notificaciones ya cuentan con índices relevantes. Revisar las FK secundarias de forma selectiva antes de escala grande; no añadir índices indiscriminadamente.

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

## 17. Rendimiento Fase 2 — diagnóstico 21/10/2026

Estado: **CÓDIGO FUSIONADO / PENDIENTE DE DESPLIEGUE Y VALIDACIÓN**.

Evidencia observada:
- tablas muy pequeñas: ~13 perfiles, 66 bloques, 280 logs, 147 resultados, 78 posts;
- CPU Railway media ~0,1% y RAM ~0,12 GB en la ventana observada;
- SQL de aplicación generalmente en pocos milisegundos;
- pese a ello, peticiones SSR móviles llegaron a varios segundos: Home ~5,6 s, Semana ~5,9 s, Ranking ~15,8 s y Panel Admin >20 s en ejemplos observados;
- en Supabase se observaron tiempos de gateway/origen de varios segundos mientras `x_envoy_upstream_service_time`/ejecución DB seguía en pocos milisegundos;
- se observaron varias llamadas simultáneas a JWKS/Auth y lecturas repetidas durante ráfagas de navegación;
- `NavigationWarmup` precargaba entre 5 y 7 rutas privadas después de cada pantalla;
- `IntentLink` hacía `router.prefetch()` en `touchstart` y después llegaba la navegación real, produciendo duplicados visibles en logs.

Cambios de bajo riesgo fusionados en PR #37:
1. eliminar `NavigationWarmup` del layout;
2. eliminar prefetch en touch/focus y conservarlo solo con hover real de puntero fino en escritorio;
3. paginar Home a 15 publicaciones por página para limitar payload y DOM;
4. fijar Node 22.

No toca:
- RLS;
- Supabase schema;
- resultados/notas;
- programación;
- rankings;
- `save_week_content`;
- IDs de bloques.

Siguiente escalón si la Fase 2 no basta:
- RPC Ranking por día/bloques en vez de semana completa;
- leaderboard de Semana bajo demanda al abrir clasificación;
- comentarios sociales bajo demanda;
- actualizaciones optimistas y reducción de `revalidatePath('/home')` completo tras una reacción/comentario;
- cache selectiva solo para datos compartidos y no sensibles;
- prueba de carga real antes de vender a programaciones con cientos de atletas.

## 18. Escalabilidad objetivo

- 500 usuarios registrados o activos NO implican por sí solos 500 usuarios concurrentes.
- La arquitectura Next.js + Railway + Supabase puede servir cientos de usuarios si cada interacción dispara un número acotado de consultas y payloads.
- El objetivo antes de comercializar es medir concurrencia: por ejemplo 25/50/100 usuarios simultáneos en Home/Semana/Ranking/guardados.
- Dimensionar Supabase/Railway por concurrencia y consumo real, no solo por número de cuentas.
- Una app nativa no elimina estos cuellos: usaría la misma autenticación, API y base de datos. La prioridad es optimizar backend/orquestación web; una app de stores sería una decisión de distribución/UX posterior.

## 19. Checklist técnico obligatorio

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

## 20. Regla documental

Tras cada bloque relevante:
- `CONTINUIDAD.md`: estado, decisiones, prioridades y memoria del proyecto.
- `FUNCIONAL.md`: reglas de negocio y comportamiento visible.
- `TECNICO.md`: arquitectura, datos, seguridad, infraestructura e incidencias.

No documentar como VALIDADO algo que solo haya sido desplegado para probar.
