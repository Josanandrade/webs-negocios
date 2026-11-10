-- PREPARADO, NO EJECUTAR SIN QA Y FECHAS REALES DE LOS ATLETAS.
-- QA a coste cero: revisión estática + pruebas locales sin conexión a producción.
-- El entorno disponible no incluye PostgreSQL, Docker ni Supabase CLI: NO afirmar QA de RLS real.
-- Home: acceso permanente a publicaciones anteriores a la caducidad.
-- Función de RLS evalúa SIEMPRE el usuario autenticado, nunca un user_id recibido.
create schema if not exists lemon_rx_internal;
revoke all on schema lemon_rx_internal from public, anon, authenticated;

create table if not exists lemon_rx_internal.subscription_flags (
  singleton boolean primary key default true check (singleton),
  enforce_home_freeze boolean not null default false
);
insert into lemon_rx_internal.subscription_flags(singleton,enforce_home_freeze)
values(true,false) on conflict(singleton) do nothing;
revoke all on lemon_rx_internal.subscription_flags from public,anon,authenticated;

create or replace function public.can_view_home_post(p_first_completed_at timestamptz)
returns boolean language sql stable security definer set search_path=''
as $$
 select case
  when coalesce((select not enforce_home_freeze from lemon_rx_internal.subscription_flags where singleton=true),true) then true
  when auth.uid() is null then false
  when exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin') then true
  when exists (
   select 1 from public.athlete_subscription_periods s
   where s.user_id=auth.uid() and s.voided_at is null
     and s.starts_on <= public.local_today()
     and public.local_today() < s.ends_on
  ) then true
  else p_first_completed_at < (
   coalesce((
    select max(s.ends_on) from public.athlete_subscription_periods s
    where s.user_id=auth.uid() and s.voided_at is null
      and s.starts_on <= public.local_today()
   ),public.local_today())::timestamp at time zone 'Europe/Madrid'
  )
 end;
$$;
revoke all on function public.can_view_home_post(timestamptz) from public,anon;
grant execute on function public.can_view_home_post(timestamptz) to authenticated;

-- No se cambia has_program_access: preserva el modelo anterior hasta migración.
alter policy "social posts: miembros leen" on public.workout_posts
 using (public.has_program_access() and public.can_view_home_post(first_completed_at));
alter policy "social blocks: miembros leen" on public.workout_post_blocks
 using (public.has_program_access() and exists(
  select 1 from public.workout_posts p where p.id=post_id
 ));
alter policy "social achievements: compartidos u propios pendientes" on public.workout_post_achievements
 using (public.has_program_access() and (
  (post_id is null and auth.uid()=user_id)
  or (post_id is not null and exists(select 1 from public.workout_posts p where p.id=post_id))
 ));
alter policy "social comments: miembros leen" on public.workout_post_comments
 using (public.has_program_access() and exists(select 1 from public.workout_posts p where p.id=post_id));
alter policy "social post reactions: miembros leen" on public.workout_post_reactions
 using (public.has_program_access() and exists(select 1 from public.workout_posts p where p.id=post_id));
alter policy "social comment reactions: miembros leen" on public.workout_comment_reactions
 using (public.has_program_access() and exists(
  select 1 from public.workout_post_comments c where c.id=comment_id
 ));
-- INSERT policies already require a visible parent through EXISTS, so parent RLS applies.
-- DELETE policies are intentionally not altered: owners can remove their own reactions.
-- Do NOT enable flag until RLS and all RPCs have been tested under athlete JWTs.
