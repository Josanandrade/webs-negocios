# Lemon RX

Plataforma privada de programación de CrossFit de Lemon RX (Fran y Jose).
Los admins crean y publican la programación semanal; los atletas registrados
la consultan si tienen acceso. El pago es en efectivo y se marca a mano.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind 4 · Supabase (Auth + Postgres + RLS).

## Cómo funciona el acceso

Un atleta ve la programación publicada solo si:

- su **acceso** está `Activo` (los nuevos registros entran como *pendientes*), y
- su **pago** está `Pagado`, **o** el ajuste *Ocultar programación automáticamente a usuarios que no hayan pagado* está OFF.

Los admins siempre ven todo, incluidos los borradores. La regla vive en la base
de datos (`public.has_program_access()` y las políticas RLS de
`supabase/migrations`), no solo en la interfaz: aunque alguien llame a la API
directamente, no puede leer borradores, ver otros usuarios ni cambiarse el
pago, el acceso o el rol.

## Estructura

```text
src/
  app/
    (auth)/          login, registro, recuperar contraseña (+ server actions)
    (app)/           zona con sesión
      page.tsx       Programación (vista del atleta, ?semana=YYYY-MM-DD)
      cuenta/        Mi cuenta
      admin/         Panel, Crear programación, editor, Usuarios, Ajustes
        actions.ts   todas las mutaciones de admin (requireAdmin + RLS)
    auth/            callback de emails y cierre de sesión
  components/        UI (acordeón de días, editor de semana, diálogos…)
  lib/               auth (getViewer/requireAdmin), fechas, consultas, Supabase
  proxy.ts           refresco de sesión y redirección a /login
supabase/
  migrations/        esquema, funciones, triggers y RLS
  tests/rls.sql      pruebas de permisos contra una base local
```

Modelo de datos: `profiles` (1:1 con `auth.users`) · `weeks` → `days` →
`workout_blocks` · `app_settings` (fila única). Pensado para crecer: resultados,
PRs, escalados o vídeos colgarían de `workout_blocks`/`profiles` sin tocar lo
existente.

## Desarrollo local

```bash
npm install
npx supabase start                      # Supabase local (Docker)
psql "$DB_URL" -f supabase/migrations/20261011100000_init.sql
cp .env.example .env.local              # pon la URL y la clave publicable locales
npm run dev
```

Para crear el primer admin: regístrate en la app y luego, en el SQL editor de Supabase:

```sql
update public.profiles set role = 'admin', access_status = 'active', payment_status = 'paid'
where email = 'tu@email.com';
```

A partir de ahí, un admin puede dar el rol de admin a otros desde **Usuarios**.

## Despliegue (Railway + Supabase)

1. **Supabase:** aplica `supabase/migrations/*.sql` en el proyecto (SQL editor o `supabase db push`).
2. **Supabase → Authentication → URL Configuration:** *Site URL* = URL pública de la app y añade
   `https://<tu-dominio>/auth/callback` a *Redirect URLs* (confirmación de email y recuperar contraseña).
3. **Railway:** servicio conectado a este repo con *Root Directory* = `demos/lemon-rx`.
   Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SITE_URL` (URL pública, p. ej. `https://lemonrx.up.railway.app`)

   Build `npm run build`, start `npm start` (usa `PORT`). Las variables `NEXT_PUBLIC_*` se leen en build:
   si las cambias, vuelve a desplegar.
4. El SMTP por defecto de Supabase envía muy pocos emails por hora. Para usuarios reales conviene
   configurar un SMTP propio (Resend, Postmark…) en *Authentication → SMTP*.
