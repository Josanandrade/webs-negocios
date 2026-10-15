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
- Runtime observado en auditoría: Node 20.20.2

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

La conexión `Lemon RX` quedó disponible y verificada el 13/10/2026.

Por tanto, queda obsoleta la limitación de la auditoría inicial que indicaba que el proyecto real de Supabase no podía consultarse desde ChatGPT.

Regla:
- cualquier cambio de esquema/RLS debe verificarse contra el proyecto Lemon RX correcto;
- no reutilizar proyectos de AvanttAI.

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

No mover la seguridad exclusivamente a frontend.

## 6. Modelo de datos — evolución conocida

### `profiles`

Base conocida:
- `id`
- `full_name`
- `email`
- `role`
- `payment_status`
- `access_status`
- timestamps

Evolución desplegada 13/10/2026:
- dato de sexo Hombre/Mujer asociado al perfil;
- obligatorio en registro para nuevos usuarios;
- editable por admin;
- utilizado por la lógica de ranking.

La protección de campos sensibles de perfil debe mantenerse en servidor/RLS.

### Programación

Entidades base:
- `weeks`
- `days`
- `workout_blocks`

Regla técnica crítica:
- preservar IDs de `workout_blocks` al editar para no romper resultados e historial.

### Actividad y resultados

Entidades base:
- `block_logs`
- `block_results`

El modelo de resultados ha evolucionado para cubrir:
- tiempo;
- rondas/reps;
- reps/calorías;
- peso;
- intervalos;
- cargas de Strength/Weightlifting;
- detalle estructurado de series cuando corresponde.

### Strength / Weightlifting

Migraciones presentes en `main` desde 13/10/2026 incluyen evolución específica para:
- ranking de fuerza/halterofilia;
- series estructuradas;
- catálogo de movimientos;
- RM y porcentajes;
- Complex;
- EMOM estructurado de fuerza.

Regla:
- preservar compatibilidad con resultados existentes al cambiar estructura.

### Peso por ronda / total

Desde 13/10/2026 se desplegó un modelo donde el resultado competitivo de peso puede almacenar el detalle necesario para representar diferentes pesos por ronda/serie y calcular el total de kilos movidos.

Regla técnica:
- el total usado por ranking debe derivarse de los datos estructurados y no confiar en un valor manipulable enviado sin validación desde cliente;
- migraciones/recalculos deben conservar resultados previos.

## 7. Ranking

Funciones de ranking deben seguir evitando exponer directamente la tabla privada de resultados.

Comportamiento técnico actual/evolucionado:
- ranking por bloque;
- RX/Intermedio donde aplica;
- ranking específico de Strength/Weightlifting por carga;
- separación por sexo para rankings competitivos;
- clasificación diaria recalculada por resultado real;
- empates gestionados de forma consistente.

Cualquier cambio en scoring debe probarse contra datos existentes antes de producción.

## 8. Comunicaciones

### Publicación de semana

- Resend para email de publicación.
- Evitar duplicados con estado persistido.
- El fallo del correo no debe tumbar la publicación principal.

### Invitaciones

Desde 13/10/2026 existe flujo de invitación por email.

Debe mantenerse separada la acción de invitar de la aprobación efectiva del acceso cuando el flujo de negocio siga requiriendo validación manual.

### Web Push

- admins pueden activar suscripción;
- avisos por nuevos registros;
- `PUSH_SECRET` nunca en cliente;
- limpiar endpoints expirados.

## 9. RLS y seguridad

Patrón protegido:
- `anon`: sin acceso funcional sensible;
- `authenticated`: propietario/rol/visibilidad;
- admin: acceso ampliado controlado;
- atleta: actividad propia;
- programación: lectura condicionada a visibilidad/acceso.

No introducir atajos administrativos desde cliente.

## 10. Incidencias técnicas abiertas

### T1 — Node 20 vs dependencias Supabase

En auditoría, Railway usaba Node 20.20.2 mientras paquetes Supabase declaraban Node >=22.

Pendiente:
- fijar/validar Node 22 en entorno seguro;
- build;
- smoke tests de auth, programación, admin, ranking, historial, email y Push;
- solo después producción.

### T2 — `refresh_token_already_used`

Se observaron errores puntuales de refresh token.

No corregir sin reproducir/entender flujo de cookies y solicitudes concurrentes.

### T3 — vulnerabilidades npm

Se reportaron vulnerabilidades high.

No ejecutar `npm audit fix --force` automáticamente.

### T4 — pruebas RLS

Mejorar automatización de pruebas de permisos antes de cambios de esquema relevantes.

## 11. Dirección técnica futura — comercialización / white-label

Decisión estratégica registrada 15/10/2026, NO implementada todavía.

Lemon RX podría evolucionar desde una única programación a una plataforma para múltiples empresas/programaciones de CrossFit/CrossTraining.

La arquitectura futura, si se valida esta línea, probablemente necesite representar explícitamente:

`organization/programming -> boxes -> athletes`

Posibles entidades/campos futuros:
- organización/tenant;
- branding de organización;
- boxes/sedes;
- membresía de usuario en organización/box;
- roles por organización;
- programas/niveles;
- medición de atletas activos por ciclo de facturación.

Regla desde ahora:
- NO construir multi-tenancy todavía;
- evitar nuevas decisiones que hagan extremadamente costosa esa migración futura;
- no mezclar datos de clientes mediante simples filtros de frontend: si llega el momento, el aislamiento debe diseñarse en DB/RLS.

## 12. Implicación técnica de la hipótesis de precios

Hipótesis comercial registrada:
- 35 €/mes hasta 70 atletas activos;
- desde el atleta 71, +0,50 €/mes por atleta activo adicional;
- coaches/admins no computan.

Si se comercializa, será necesario definir técnicamente qué significa **atleta activo** de manera auditable. La recomendación para futura implementación es basarlo en una membresía/estado de suscripción vigente durante el ciclo de facturación, no simplemente en haber iniciado sesión una vez ni en el número histórico de cuentas.

Todavía no implementar billing sobre esta hipótesis.

## 13. Checklist técnico obligatorio

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

## 14. Regla documental

Tras cada bloque relevante:
- `CONTINUIDAD.md`: estado, decisiones, prioridades y memoria del proyecto.
- `FUNCIONAL.md`: reglas de negocio y comportamiento visible.
- `TECNICO.md`: arquitectura, datos, seguridad, infraestructura e incidencias.

No documentar como VALIDADO algo que solo haya sido desplegado para probar.
