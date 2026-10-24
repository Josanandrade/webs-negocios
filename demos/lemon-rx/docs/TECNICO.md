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
- Runtime productivo actual: Node 22 (`>=22 <23`)
- Producción web actual: Vercel
- Alias estable: `https://lemon-rx.vercel.app`
- Región Functions Vercel: Dublín (`dub1`)

## 2. Infraestructura

### Vercel

Estado: **PRODUCCIÓN ACTIVA / VALIDADA 24/10/2026**.

Proyecto Vercel:
- Project ID `prj_GN1NzVeXFmr9fXdySTVR0n0nhGpd`
- nombre interno del proyecto: `webs-negocios`
- root: `demos/lemon-rx`
- framework: Next.js
- Node: 22.x
- región de Functions: `dub1`
- alias público estable: `lemon-rx.vercel.app`

El commit de producción validado tras Rendimiento Fase 4 es `8e3a3ee6003ee9fc8f127c2c25dcd33452714fd3`.

Regla operativa de despliegue:
- no dar un cambio por pasado a producción hasta comprobar explícitamente que `lemon-rx.vercel.app` apunta al deployment READY del commit validado;
- los aliases automáticos de Vercel no sustituyen esta verificación del alias estable personalizado.

### Railway

Proyecto:
- `terrific-compassion`

Servicio:
- `Lemon Rx`

Dominio histórico/fallback:
- `lemon-rx-production.up.railway.app`

Railway se mantiene temporalmente como fallback durante la transición, pero ya no es el hosting principal de Lemon RX.

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

Pendiente de cierre de migración de hosting:
- completar configuración/rotación segura de Resend y Push en Vercel antes de retirar Railway definitivamente.

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
- ranking por carga total;
- modo de registro por movimiento: `Kilos` o `Hecho`;
- un mismo bloque puede combinar movimientos con peso y movimientos sin peso.

Compatibilidad:
- se reutiliza la capacidad ya existente de `track_load` por movimiento;
- los movimientos `track_load=false` ahora pueden registrarse explícitamente como hechos;
- resultados mixtos se guardan de forma compatible con históricos existentes;
- no se cambian IDs de bloques ni se reescriben resultados anteriores.

### RM e histórico

- `user_rms` mantiene el valor actual por usuario/movimiento.
- `user_rm_history` conserva snapshots históricos desde la implantación del motor de evolución.
- Se creó baseline de los RM existentes en el momento de implantar el histórico.
- No se reconstruye ni inventa la evolución exacta de RM previa a ese momento.

### Home social

Estado: **VALIDADO 24/10/2026**.

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
- cada usuario modifica únicamente sus reacciones/comentarios propios dentro de las políticas definidas;
- todos los emojis de reacción permanecen visibles por defecto;
- se agrupan reacciones por emoji mostrando contador y nombres de autores;
- comentarios muestran el hilo más reciente por defecto;
- desde Fase 4, la carga inicial de Home no arrastra todos los comentarios/reacciones de los 15 posts: solo recibe contador + hilo más reciente y carga los anteriores bajo demanda.

### RPC social de nombres

Migración: `20261022101500_social_reaction_actor_names.sql`.

Función:
- `social_reaction_actor_names(uuid[])`.

Objetivo:
- resolver nombres de autores de reacciones sin abrir lectura general de `profiles` a atletas.

Seguridad:
- `SECURITY DEFINER` con `search_path=public`;
- solo usuarios autenticados y activos pueden ejecutarla;
- solo devuelve perfiles incluidos en la lista solicitada que realmente aparecen como autores de reacciones sociales;
- no relaja las RLS generales de `profiles`.

### RPC de previews de comentarios

Migración: `20261024003000_home_comment_previews.sql`.

Función:
- `home_comment_previews(uuid[])`.

Objetivo:
- devolver en una sola lectura para los posts visibles el contador total de comentarios y únicamente el hilo más reciente con sus reacciones;
- evitar que la consulta principal de Home crezca linealmente con todo el historial social de cada post.

Seguridad:
- `SECURITY INVOKER`;
- respeta las RLS de `workout_post_comments` y `workout_comment_reactions`;
- `anon` no tiene `EXECUTE`;
- `authenticated` y `service_role` sí;
- validado con advisors y consulta de permisos el 24/10/2026.

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
- `day_leaderboard_v2(p_week_id uuid, p_date date)` — lectura principal optimizada desde Fase 3;
- `week_leaderboard_v2(p_week_id uuid)` — compatibilidad/uso legado donde todavía corresponda;
- `ranking_day_athlete_activity(p_week_id uuid, p_date date)`.

La UI de General/Masculina/Femenina se filtra localmente una vez que los datos están cargados; no requiere nueva navegación al servidor.

Desde Fase 3, `/ranking` solicita solo el leaderboard del día visible. La nueva RPC conserva las mismas reglas de orden, empates, divisiones, sexo, `total_load` y posiciones. La paridad se comprobó con datos reales: 21 filas antiguas vs 21 nuevas y 0 diferencias.

Desde Fase 4, Ranking carga solo los movimientos que aparecen en los bloques del día visible, no el catálogo completo.

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

## 11. Rendimiento

### Fase 1 — VALIDADA 16/10/2026

- Ranking General/Masculina/Femenina filtrado en cliente.
- Semana progresiva y code-splitting.
- Evolución diferida.
- El warm-up/prefetch histórico queda supersedido por Fase 2.

### Fase 2 — VALIDADA 22/10/2026

Cambios:
1. `NavigationWarmup` deja de ejecutarse desde el layout privado.
2. `IntentLink` elimina prefetch en `touchstart`/focus y mantiene prefetch solo con hover real de puntero fino en escritorio.
3. Home se pagina a 15 publicaciones por página.
4. Runtime sube a Node 22.
5. Vercel despliega Functions en Dublín, cerca de Supabase Irlanda.

Resultado observado:
- Jose confirma que Vercel va sensiblemente mejor en un primer vistazo y valida posteriormente la versión con los cambios funcionales sobre esa base.

No toca:
- RLS general;
- resultados/notas históricos;
- `save_week_content`;
- IDs de bloques;
- lógica de rankings existente.

### Fase 3 — VALIDADA 23/10/2026 / ONLINE

Cambios:
1. Nueva RPC `day_leaderboard_v2(p_week_id, p_date)` para limitar ranking a los bloques del día solicitado.
2. `/ranking` deja de descargar resultados puntuables de toda la semana y usa la RPC diaria.
3. Semana deja de cargar el leaderboard completo al entrar. El leaderboard se solicita solo al abrir un día con bloques puntuables.
4. Los leaderboard diarios cargados en Semana se mantienen en memoria durante esa visita para no repetir la lectura al cerrar/reabrir el mismo día.
5. Home social deja de ejecutar `revalidatePath('/', 'layout')` tras reacciones/comentarios; solo revalida `/home`.
6. La nueva RPC se concedió únicamente a `authenticated` y `service_role`; no a `anon`.

Validación de paridad:
- semana de prueba: 120 resultados puntuables totales;
- días reales observados: 21–39 resultados;
- comparación de un día: función semanal filtrada 21 filas, función diaria 21 filas, 0 diferencias.

Resultado:
- Jose valida la Preview el 23/10/2026;
- PR #40 fusionado a `main` en `ba9e97e9bb013d8df67dc2081dcf215da48b3df6`;
- deployment productivo READY en Vercel y alias `lemon-rx.vercel.app` verificado explícitamente contra ese deployment.

No toca:
- reglas de ranking, posiciones, empates, divisiones o sexos;
- programación o IDs de bloques;
- resultados/notas históricos;
- `save_week_content`;
- lógica de guardado deportivo.

### Fase 4 — VALIDADA 24/10/2026 / ONLINE

Cambios:
1. Home elimina los comentarios y reacciones a comentarios del `select` principal de `workout_posts`.
2. `home_comment_previews(uuid[])` devuelve en lote contador total + hilo más reciente de cada post visible.
3. Los comentarios anteriores se solicitan mediante acción servidor solo cuando el usuario pulsa `Ver comentarios anteriores`.
4. El comportamiento de comentar, responder y reaccionar se conserva.
5. Lecturas independientes de Home se ejecutan en paralelo cuando no dependen entre sí.
6. `getMovementsByIds()` permite limitar el catálogo a IDs concretos.
7. Semana solicita solo movimientos utilizados en la semana visible.
8. Ranking solicita solo movimientos utilizados en el día visible.

Seguridad y validación:
- `home_comment_previews` usa `SECURITY INVOKER` y RLS real;
- `anon` no puede ejecutarla;
- `authenticated` sí;
- advisors no detectaron problemas nuevos introducidos por esta función;
- Preview final READY en `dub1`;
- Jose valida funcionalmente la Fase 4 el 24/10/2026;
- PR #41 fusionado a `main` en `8e3a3ee6003ee9fc8f127c2c25dcd33452714fd3`;
- deployment productivo `dpl_EST5WBs83s4nQtxFHBz5G4SEhwNS` READY y alias `lemon-rx.vercel.app` reasignado a ese deployment.

No toca:
- programación ni IDs de bloques;
- resultados, notas o RM;
- reglas/posiciones de Ranking;
- `save_week_content`;
- notificaciones sociales existentes.

## 12. Comunicaciones

### Publicación de semana
- Resend para email de publicación.
- Evitar duplicados con estado persistido.
- El fallo del correo no debe tumbar la publicación principal.

### Invitaciones
- Flujo de invitación por email.
- Debe mantenerse separada la acción de invitar de la aprobación efectiva del acceso cuando se requiera validación manual.

### Web Push
Estado funcional previo: **VALIDADO 21/10/2026**.

- admins y atletas activos con acceso pueden activar suscripción;
- avisos sociales pueden enviarse fuera de la app si existe suscripción;
- admins mantienen avisos por nuevos registros;
- `PUSH_SECRET` nunca en cliente;
- limpiar endpoints expirados;
- la campana in-app es la fuente persistente aunque no exista permiso Push.

Nota de migración de hosting:
- antes de retirar Railway debe completarse y probarse la configuración de secretos VAPID/PUSH en Vercel.

## 13. RLS y seguridad

Patrón protegido:
- `anon`: sin acceso funcional sensible;
- `authenticated`: propietario/rol/visibilidad;
- admin: acceso ampliado controlado;
- atleta: actividad propia;
- programación: lectura condicionada a visibilidad/acceso;
- social/notificaciones: lectura controlada por acceso al programa y destinatario cuando corresponde.

No introducir atajos administrativos desde cliente.

La RPC `social_reaction_actor_names` se usa específicamente para evitar abrir `profiles` a otros atletas al mostrar nombres en reacciones sociales.

`day_leaderboard_v2` es `SECURITY DEFINER` y valida sesión/acceso a la semana; su `EXECUTE` está revocado para `PUBLIC`/`anon` y concedido a `authenticated`/`service_role`.

`home_comment_previews` es `SECURITY INVOKER`; no amplía privilegios y se apoya en las RLS de comentarios/reacciones.

## 14. Incidencias técnicas abiertas

### T1 — Migración completa de hosting
Vercel ya sirve producción y Node 22. Pendiente rotación/configuración final de secretos de Resend/Push y retirada posterior de Railway cuando quede verificado todo el flujo de comunicaciones.

### T2 — `refresh_token_already_used`
Se observaron errores puntuales de refresh token. No corregir sin reproducir y entender flujo de cookies/solicitudes concurrentes. Fase 2 reduce peticiones concurrentes innecesarias.

### T3 — vulnerabilidades npm
No ejecutar `npm audit fix --force` automáticamente.

### T4 — pruebas RLS
Mejorar automatización de pruebas de permisos antes de cambios de esquema relevantes.

### T5 — escalabilidad del motor coach
`coach_evolution_metrics` es suficiente para el volumen actual, pero debe revisarse antes de escalar a cientos de atletas.

### T6 — advisors de FK sin índice
Revisar las FK secundarias de forma selectiva antes de escala grande; no añadir índices indiscriminadamente. Advisor del 24/10/2026 mantiene 17 FK secundarias sin índice; no se añadieron índices a ciegas porque no son el cuello principal medido.

## 15. Dirección técnica futura — comercialización / white-label

Decisión estratégica registrada 15/10/2026, NO implementada todavía.

Lemon RX podría evolucionar desde una única programación a una plataforma para múltiples empresas/programaciones de CrossFit/CrossTraining.

Arquitectura futura probable:

`organization/programming -> boxes -> athletes`

Regla:
- NO construir multi-tenancy todavía;
- evitar nuevas decisiones que hagan extremadamente costosa esa migración futura;
- si llega el momento, el aislamiento debe diseñarse en DB/RLS, no como simples filtros frontend.

## 16. Hipótesis de precios

- 35 €/mes hasta 70 atletas activos;
- desde el atleta 71, +0,50 €/mes por atleta activo adicional;
- coaches/admins no computan.

Si se comercializa, será necesario definir técnicamente qué significa **atleta activo** de manera auditable. Todavía no implementar billing sobre esta hipótesis.

## 17. Escalabilidad objetivo

- 500 usuarios registrados o activos NO implican por sí solos 500 usuarios concurrentes.
- La arquitectura Next.js + Vercel + Supabase puede servir cientos de usuarios si cada interacción dispara un número acotado de consultas y payloads.
- El objetivo antes de comercializar es medir concurrencia: por ejemplo 25/50/100 usuarios simultáneos en Home/Semana/Ranking/guardados.
- Dimensionar Supabase/Vercel por concurrencia y consumo real, no solo por número de cuentas.
- Una app nativa no elimina estos cuellos: usaría la misma autenticación, API y base de datos.

Completado en Fase 3:
- RPC Ranking por día en vez de semana completa;
- leaderboard de Semana bajo demanda;
- eliminación de la invalidación global del layout tras interacción social.

Completado en Fase 4:
- comentarios sociales bajo demanda;
- preview de comentarios por lote;
- lecturas independientes de Home paralelizadas;
- Semana/Ranking dejan de traer el catálogo completo de movimientos.

Siguientes candidatos de rendimiento, solo si las métricas lo justifican:
- cache selectiva para datos compartidos no sensibles;
- prueba de carga real 25/50/100 usuarios simultáneos antes de venta a gran escala;
- revisar `coach_evolution_metrics` antes de cientos de atletas.

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
- si se despliega a Vercel, ¿`lemon-rx.vercel.app` apunta al deployment READY del commit validado?

## 19. Regla documental

Tras cada bloque relevante:
- `CONTINUIDAD.md`: estado, decisiones, prioridades y memoria del proyecto.
- `FUNCIONAL.md`: reglas de negocio y comportamiento visible.
- `TECNICO.md`: arquitectura, datos, seguridad, infraestructura e incidencias.

No documentar como VALIDADO algo que solo haya sido desplegado para probar.