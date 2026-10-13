# Lemon RX — Técnico

> Documento vivo de arquitectura, infraestructura, datos, seguridad e incidencias técnicas. Debe reflejar el estado real validado del sistema y evitar que futuros cambios contradigan decisiones anteriores.

## 1. Línea base técnica

Auditoría inicial: 13/10/2026.

- Repo: `Josanandrade/webs-negocios`
- Ruta app: `demos/lemon-rx`
- Producción: rama `main`
- Commit auditado: `f82fc4d6a04782f3f1a5514a659e1041b2bf3b7f`
- Framework: Next.js 16.4.0 App Router
- React: 19.3.0
- TypeScript: 5.x
- Tailwind CSS: 4.x
- Supabase JS: 2.117.3
- Supabase SSR: 0.12.7
- Web Push: 3.6.7
- Runtime configurado por paquete: Node `>=20.9`
- Runtime observado en Railway: Node `20.20.2`

## 2. Infraestructura

### Railway

Proyecto:
- Nombre: `terrific-compassion`
- Project ID: `0cff50b7-f65e-49ba-b2cc-aea085be92d5`

Servicio:
- Nombre: `Lemon Rx`
- Service ID: `342db4d0-96f6-4886-b980-6a2ef94f7f5c`

Entorno:
- `production`
- Environment ID: `a6a02381-1c35-4d39-ac41-9e15caaa4122`

Fuente:
- GitHub repo: `Josanandrade/webs-negocios`
- Branch: `main`
- Root Directory: `/demos/lemon-rx`

Despliegue:
- Builder: Railpack
- Build: `npm run build`
- Start: `npm start`
- Healthcheck: `/login`
- Réplicas: 1
- Región observada: `europe-west4-drams3a`
- Dominio: `lemon-rx-production.up.railway.app`

Estado inicial observado:
- Servicio online.
- Último despliegue `b1dc875c-5a87-4cf0-878b-3d1218fd258b`: SUCCESS.
- Sin staged changes pendientes.

## 3. Variables de entorno esperadas

Railway muestra configuradas por nombre:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SITE_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `PUSH_SECRET`
- `NEXT_TELEMETRY_DISABLED`

Más variables automáticas de Railway.

Reglas:
- No guardar valores secretos en este documento.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` es publicable; la seguridad depende de RLS.
- `RESEND_API_KEY`, `VAPID_PRIVATE_KEY` y `PUSH_SECRET` deben permanecer solo en servidor.
- Nunca introducir `service_role` en cliente.

## 4. Arquitectura de aplicación

### Rutas públicas/auth

- `/login`
- `/registro`
- `/recuperar`
- `/auth/callback`
- `/auth/signout`
- `/nueva-contrasena`

### Zona autenticada

- `/` — programación del atleta
- `/ranking` — ranking
- `/historial` — historial del atleta
- `/cuenta` — cuenta

### Administración

- `/admin`
- `/admin/programacion`
- `/admin/programacion/[id]`
- `/admin/usuarios`
- `/admin/usuarios/[id]`
- `/admin/usuarios/[id]/historial`
- `/admin/ajustes`

## 5. Autenticación y sesión

Supabase Auth se consume mediante `@supabase/ssr`.

### Flujo

- El registro crea usuario en Supabase Auth.
- Un trigger crea automáticamente `public.profiles`.
- Login con email/password.
- Confirmación de email antes de entrar si Supabase la exige.
- Recuperación de contraseña mediante callback.
- `proxy.ts` ejecuta `updateSession()` para refrescar sesión y redirigir según autenticación.
- En servidor se usa `getClaims()` para obtener el `sub` del usuario.

### Seguridad de navegación

El proxy solo hace una comprobación optimista de sesión. La autorización de negocio no depende del proxy:
- páginas/acciones servidor usan `getViewer()` / `requireAdmin()`;
- la base de datos vuelve a aplicar RLS y funciones de autorización.

Esto debe conservarse.

## 6. Modelo de datos

### `profiles`

1:1 con `auth.users`.

Campos principales:
- `id`
- `full_name`
- `email`
- `role`: `admin | athlete`
- `payment_status`: `paid | pending`
- `access_status`: `pending | active | blocked`
- timestamps

Protección:
- atleta lee su perfil;
- admin lee perfiles;
- atleta puede editar solo datos permitidos;
- trigger `guard_profile_update()` impide que un atleta cambie rol, pago, acceso, email, id o fecha de alta.

### `app_settings`

Fila única:
- `auto_block_unpaid`
- `show_past_weeks`
- auditoría `updated_by`

### `weeks`

- `start_date`
- `end_date` generado
- `status`: `draft | published`
- `published_at`
- `notified_at`
- created/updated by

### `days`

Pertenece a `weeks`.

### `workout_blocks`

Pertenece a `days`.

Campos relevantes:
- `id`
- `title`
- `content`
- `position`
- `score_type`

Tipos de resultado actuales:
- `none`
- `time`
- `rounds_reps`
- `reps`
- `weight`
- `intervals`
- `load`

### `block_logs`

Por atleta + bloque:
- `done`
- `note`

PK compuesta `(user_id, block_id)`.

### `block_results`

Por atleta + bloque:
- `division`: `rx | intermediate`
- segundos
- capped
- rondas
- reps
- kg
- `as_prescribed`
- `reps_detail`

PK compuesta `(user_id, block_id)`.

### `push_subscriptions`

Suscripciones Web Push de admins.

### Esquema `private`

No expuesto a API pública:
- `private.push_secret`
- `private.signup_push_sent`

## 7. Funciones de base de datos relevantes

### Seguridad/acceso

- `is_admin()`
- `has_program_access()`
- `can_view_week()`
- `local_today()` con `Europe/Madrid`

### Programación

- `save_week_content(p_week_id, p_days)`

Características protegidas:
- solo admin;
- guardado atómico;
- bloquea fila de semana durante la operación;
- preserva IDs de bloques;
- limpia días/bloques que ya no se mantienen.

### Ranking/historial

- `week_leaderboard(p_week_id)`
- `training_history(p_user_id)`

### Email publicación

- `claim_week_notification(p_week_id)`

Marca `notified_at` antes del envío para impedir duplicados concurrentes. Si la capa app detecta fallo de envío, vuelve a poner `notified_at = null` para permitir un reintento futuro.

### Push

- `save_push_subscription(...)`
- `signup_push_targets(...)`
- `forget_push_subscriptions(...)`

El acceso servidor usa `PUSH_SECRET`, cuyo hash se guarda en `private.push_secret`.

## 8. RLS

RLS está diseñada como parte central del sistema.

Patrón actual:
- `anon`: sin acceso a tablas funcionales.
- `authenticated`: acceso limitado por propietario/rol/visibilidad.
- admin: acceso ampliado vía `is_admin()`.
- atleta: solo escribe sus propios logs/resultados.
- semanas/días/bloques: lectura condicionada a la semana visible.

El repositorio incluye `supabase/tests/rls.sql` con pruebas manuales de permisos contra una base local.

## 9. Frontend/servidor

### Acciones admin

`src/app/(app)/admin/actions.ts`

Protecciones:
- `requireAdmin()` antes de mutaciones.
- validación básica de UUID/fechas/enum.
- RLS vuelve a validar en DB.
- `revalidatePath()` tras cambios.

### Acciones atleta

`src/app/(app)/actions.ts`

Protecciones:
- usuario autenticado.
- `viewer.canViewProgram`.
- validación de bloque.
- DB impide escribir actividad de otros atletas.

### Caché

`next.config.ts` mantiene Cache Components desactivado y usa `experimental.staleTimes.dynamic = 30` para navegación reciente, con invalidaciones mediante `revalidatePath`.

### Service worker

`/sw.js` se sirve con `Cache-Control: no-cache, no-store, must-revalidate` para evitar quedarse con una versión antigua de la lógica Push.

## 10. Email / Resend

Archivo: `src/lib/email.ts`.

Uso actual:
- solo emails propios de la app, no necesariamente los de Supabase Auth;
- API Resend Batch;
- hasta 100 emails por llamada;
- un email individual por destinatario para no exponer direcciones de terceros;
- plantilla HTML + texto plano;
- si faltan `RESEND_API_KEY` o `EMAIL_FROM`, el envío de publicación queda desactivado sin tumbar la app.

Flujo de publicación:
1. Admin cambia semana a `published`.
2. DB devuelve destinatarios mediante `claim_week_notification`.
3. Respuesta principal no espera al correo: se usa `after()`.
4. Se envía por lotes.
5. Si falla, se registra error y se libera `notified_at` para permitir reintento.

Pendiente de auditoría externa:
- dominio verificado;
- entregabilidad;
- bounces;
- logs reales;
- API key concreta y permisos;
- configuración SMTP de Supabase Auth.

La conexión Resend figura instalada en ChatGPT, pero durante esta auditoría inicial sus acciones aún no estaban expuestas como herramientas invocables en esta conversación.

## 11. Web Push

Uso actual:
- admins pueden activar/desactivar notificaciones desde Ajustes;
- prueba manual desde admin;
- aviso tras nuevo registro;
- elimina endpoints expirados cuando corresponde;
- usa VAPID + service worker.

Puntos a proteger:
- `PUSH_SECRET` nunca en cliente;
- endpoint Push debe ser HTTPS;
- solo admins pueden registrar suscripciones vía función protegida;
- la consulta anónima para aviso de alta exige token servidor y limita registros recientes/duplicados.

## 12. Observaciones de producción

### Build

El último build auditado:
- compiló correctamente;
- TypeScript terminó correctamente;
- healthcheck `/login` pasó.

### Incidencia T1 — Node 20 vs Supabase >=22

Railway usa Node `20.20.2`.
Las dependencias `@supabase/* 2.117.3` anuncian engine `>=22.0.0`.

Efecto actual:
- build sigue terminando;
- aparecen warnings repetidos;
- existe riesgo de incompatibilidad futura o comportamiento no soportado.

Plan recomendado, no ejecutado:
1. fijar Node 22 de forma explícita;
2. construir en rama;
3. ejecutar smoke tests de auth, programación, admin, ranking, historial, Resend y Push;
4. solo después llevar a producción.

### Incidencia T2 — `refresh_token_already_used`

Logs de runtime muestran:
- `Invalid Refresh Token: Already Used`
- código `refresh_token_already_used`

Hipótesis a investigar, sin concluir todavía:
- solicitudes simultáneas intentando refrescar la misma sesión;
- comportamiento entre proxy + Server Components;
- cookie antigua/duplicada;
- condición específica de cliente/pestañas.

No corregir a ciegas.

### Incidencia T3 — npm reporta 5 vulnerabilidades high

El build muestra `5 high severity vulnerabilities`.

No ejecutar `npm audit fix --force` automáticamente.
Primero identificar:
- paquete afectado;
- si es dependencia runtime o dev;
- si existe exploit relevante para esta app;
- upgrade mínimo compatible.

### Incidencia T4 — Tests RLS manuales

Existe cobertura manual en SQL, pero no se ha constatado un pipeline que ejecute esas pruebas automáticamente antes de merge/deploy.

## 13. Limitaciones de acceso actuales

### Supabase Lemon RX

No accesible desde las conexiones actuales.
Esto impide verificar directamente:
- tablas reales;
- migraciones aplicadas;
- políticas RLS activas;
- datos reales;
- Auth settings;
- URL redirects;
- SMTP;
- logs;
- security/performance advisors.

Hasta conectar la cuenta correcta, GitHub es la fuente de verdad del diseño esperado, no prueba absoluta del estado real de producción.

## 14. Checklist técnico obligatorio antes de cada cambio

- ¿Qué ruta/flujo toca?
- ¿Qué tablas/RPC/RLS toca?
- ¿Puede romper historial o IDs existentes?
- ¿Puede alterar auth/cookies?
- ¿Puede afectar usuarios ya registrados?
- ¿Puede duplicar emails o Push?
- ¿Necesita migración?
- ¿Es reversible?
- ¿Build correcto?
- ¿TypeScript correcto?
- ¿Prueba manual del flujo afectado?
- ¿Prueba de regresión de login + programación + admin?
- ¿Jose lo ha validado?

## 15. Cambios técnicos validados

### 13/10/2026 — Línea base

Sin cambios funcionales ni de infraestructura.
Solo creación de documentación en rama aislada `docs/lemon-rx-continuidad` para no disparar producción.
