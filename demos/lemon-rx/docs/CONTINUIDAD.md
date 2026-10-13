# Lemon RX — Continuidad

> Documento vivo de continuidad del proyecto. Se actualiza únicamente cuando Jose valida una funcionalidad, una decisión o un cambio de estado.

## 1. Objetivo del proyecto

Lemon RX es una plataforma privada para gestionar la programación de CrossFit de Lemon RX. Los administradores crean y publican semanas de entrenamiento y gestionan usuarios; los atletas consultan la programación, registran actividad, resultados, pesos y notas, y pueden consultar ranking e historial.

## 2. Regla de trabajo

A partir de este punto se trabajará con el mismo criterio operativo que en AvanttAI:

1. No romper ni sustituir una funcionalidad ya validada sin una razón explícita.
2. Antes de modificar producción, entender el flujo actual y sus dependencias.
3. Los cambios deben ser pequeños, reversibles y verificables.
4. No se considera una mejora como validada hasta que Jose la pruebe y la confirme.
5. Una vez validada, actualizar este documento, `TECNICO.md` y/o `FUNCIONAL.md` según corresponda.
6. No introducir cambios de arquitectura de forma silenciosa.
7. Mantener Lemon RX separado de AvanttAI: no reutilizar bases de datos, secretos, configuraciones ni lógica propia de AvanttAI salvo decisión expresa.
8. Antes de cualquier cambio con riesgo, identificar qué funcionalidades existentes pueden verse afectadas.

## 3. Línea base protegida

Fecha de auditoría inicial: 13/10/2026.

- Repositorio: `Josanandrade/webs-negocios`
- Aplicación: `demos/lemon-rx`
- Rama productiva: `main`
- Commit de referencia auditado: `f82fc4d6a04782f3f1a5514a659e1041b2bf3b7f`
- Railway project: `terrific-compassion`
- Railway service: `Lemon Rx`
- Entorno: `production`
- Dominio Railway: `lemon-rx-production.up.railway.app`
- Estado inicial observado: ONLINE
- Último despliegue observado: SUCCESS
- No había cambios staged pendientes en Railway durante la auditoría.

Esta línea base se considera el punto de retorno funcional mientras no se valide una nueva.

## 4. Estado actual validado por código y despliegue

### Acceso y usuarios
- Registro con email y contraseña.
- Confirmación de email mediante Supabase Auth.
- Recuperación y cambio de contraseña.
- Roles `admin` y `athlete`.
- Nuevos usuarios entran con acceso pendiente y pago pendiente.
- El admin puede gestionar rol, estado de acceso y estado de pago.
- El atleta no puede convertirse en admin ni marcarse como pagado desde cliente.

### Programación
- Semanas con estados borrador/publicada.
- Editor por días y bloques.
- Solo admins pueden crear, editar, publicar o borrar programación.
- Los atletas solo pueden leer semanas publicadas para las que tengan acceso.
- Existe navegación entre semanas publicadas.
- Los bloques conservan su ID al editarse para preservar actividad y resultados asociados.

### Seguimiento del atleta
- Marcar bloques como hechos.
- Añadir notas por bloque.
- Registrar resultados según el tipo de bloque.
- Categorías RX e Intermedio cuando corresponde.
- Resultados por tiempo, AMRAP/rondas+reps, reps/calorías y peso.
- EMOM/intervalos con resultado “según programación” o adaptado.
- Fuerza/halterofilia con registro de carga sin ranking.
- Historial de entrenamiento individual.

### Ranking
- Ranking por bloque y categoría cuando el tipo de bloque lo permite.
- Empates comparten posición.
- Los resultados privados no se exponen directamente: el ranking se obtiene a través de una función controlada de base de datos.

### Administración
- Panel con estado de la semana actual.
- Contadores de atletas, acceso y pagos pendientes.
- Nuevos registros pendientes de activar.
- Últimas notas de atletas.
- Gestión individual de usuarios e historial.
- Ajustes globales para bloqueo automático por impago y visibilidad de semanas pasadas.

### Comunicaciones
- Email al publicar una semana por primera vez, mediante Resend, si está configurado.
- La semana se marca para evitar avisos duplicados al despublicar/republicar.
- Notificaciones Web Push a administradores cuando se registra un usuario, si el administrador las activa.
- PWA/manifest y service worker necesarios para Web Push.

## 5. Herramientas y accesos disponibles

### Railway
Acceso disponible y verificado. Se puede consultar estado, despliegues, configuración, variables por nombre, dominios y logs.

### GitHub
Acceso disponible con permisos de administración sobre `Josanandrade/webs-negocios`.

### Supabase
El proyecto real de Lemon RX NO aparece en las conexiones Supabase disponibles en ChatGPT durante esta auditoría.

Cuentas actualmente visibles:
- `Producción`: proyectos de AvanttAI.
- `Supabase Test`: `banco-preguntas` y `AvanttAI Health TEST`.

Por tanto, hasta conectar la cuenta correcta de Supabase para Lemon RX:
- Sí se puede auditar el esquema y las migraciones almacenadas en GitHub.
- No se puede afirmar que el esquema real de producción sea idéntico sin verificarlo directamente.
- No se puede consultar usuarios, datos reales, RLS activa, advisors, logs de Supabase ni configuración Auth/SMTP del proyecto real.

### Resend
La app de Resend está instalada y conectada. En la sesión de auditoría inicial la conexión constaba como instalada, pero todavía no se expusieron acciones invocables de Resend dentro del conjunto de herramientas de esta conversación. Hasta que estén disponibles, la integración se puede auditar por código y variables de Railway, pero no se deben inventar estados de entrega, dominios o logs.

## 6. Riesgos/incidencias detectados — NO corregidos todavía

### R1 — Runtime de Node incompatible con la versión actual de Supabase JS
Railway está construyendo y ejecutando con Node `20.20.2`. Las dependencias `@supabase/* 2.117.3` declaran Node `>=22.0.0` y Railway muestra advertencias repetidas.

Estado: pendiente de corrección controlada.
Prioridad: alta antes de seguir ampliando la app.
Motivo para no tocarlo aún: primero debe validarse el plan de cambio y probar que Node 22 no altera el comportamiento actual.

### R2 — Errores puntuales de refresh token
En logs de producción aparece `AuthApiError: Invalid Refresh Token: Already Used` / `refresh_token_already_used`.

Estado: pendiente de investigar.
Prioridad: media/alta porque puede convertirse en cierres de sesión o errores esporádicos.
No se corrige hasta revisar el flujo real de cookies/sesión y poder contrastar con el Supabase de Lemon RX.

### R3 — Dependencias con vulnerabilidades reportadas por npm
El build de Railway reporta `5 high severity vulnerabilities`.

Estado: pendiente de analizar una por una.
Regla: NO ejecutar `npm audit fix --force` de forma automática, porque podría introducir cambios incompatibles.

### R4 — Pruebas RLS no automatizadas en producción
El repositorio contiene pruebas manuales de RLS para base local. No se ha verificado en esta auditoría un pipeline automático que las ejecute antes de desplegar.

Estado: pendiente de valorar.

## 7. Decisiones de arquitectura protegidas

- La autorización real debe seguir viviendo en servidor/base de datos, no solo en UI.
- RLS debe seguir activa para datos sensibles.
- No introducir `service_role` en navegador ni depender de ella para funcionalidades normales.
- La programación publicada y el acceso por pago deben seguir protegidos desde base de datos.
- Las mutaciones de administración deben mantener doble comprobación: servidor + RLS.
- Los IDs de `workout_blocks` deben preservarse durante ediciones para no romper históricos/resultados.
- Las comunicaciones externas (Resend/Web Push) no deben bloquear la acción principal del usuario cuando puedan ejecutarse después de responder.
- No compartir secretos entre AvanttAI y Lemon RX.

## 8. Método de validación a partir de ahora

Para cada mejora:

**Estado propuesto** → describir cambio, impacto y riesgos.

**Implementado en entorno seguro** → comprobar build, TypeScript, flujo afectado y regresiones básicas.

**Pendiente de validación de Jose** → facilitar enlace/pasos exactos de prueba.

**VALIDADO** → registrar aquí fecha, funcionalidad y nuevo punto de referencia.

## 9. Historial de validaciones

### 13/10/2026 — Auditoría inicial
- Localizado Railway y repositorio correctos.
- Confirmado despliegue productivo activo.
- Documentada arquitectura actual.
- Detectadas dependencias de Supabase, Resend y Web Push.
- Detectados R1, R2, R3 y R4 sin modificar producción.
- Creada rama documental `docs/lemon-rx-continuidad` para mantener estos documentos sin disparar despliegues de producción.
