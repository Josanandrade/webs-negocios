-- Lemon RX: notificaciones al móvil (Web Push) para los admins
--
-- · push_subscriptions: los dispositivos en los que un admin ha activado las
--   notificaciones (Ajustes → Notificaciones). Cada admin solo ve y borra los
--   suyos.
-- · save_push_subscription(): guarda el dispositivo del admin actual. Si ese
--   móvil ya estaba guardado con otra cuenta, pasa a la actual.
-- · signup_push_targets(): a quién avisar cuando alguien se registra. La llama
--   el servidor de la app justo después del registro, cuando todavía no hay
--   sesión, así que exige un token secreto que solo conoce el servidor
--   (variable PUSH_SECRET en Railway; aquí solo se guarda su hash). Avisa una
--   sola vez por usuario.
-- · forget_push_subscriptions(): borra los dispositivos que ya no existen
--   (el admin desinstaló la app o quitó el permiso). Mismo token.
-- Se puede ejecutar más de una vez sin problema.

create table if not exists public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "push_subscriptions: ver las propias" on public.push_subscriptions;
create policy "push_subscriptions: ver las propias" on public.push_subscriptions
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "push_subscriptions: borrar las propias" on public.push_subscriptions;
create policy "push_subscriptions: borrar las propias" on public.push_subscriptions
  for delete to authenticated using (user_id = (select auth.uid()));

-- Fuera del esquema público: la API de Supabase no lo expone.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.push_secret (
  id boolean primary key default true check (id),
  token_hash bytea not null
);

create table if not exists private.signup_push_sent (
  user_id uuid primary key,
  sent_at timestamptz not null default now()
);

create or replace function public.save_push_subscription(p_endpoint text, p_p256dh text, p_auth text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if p_endpoint !~ '^https://' or length(p_endpoint) > 1000
     or coalesce(p_p256dh, '') = '' or coalesce(p_auth, '') = '' then
    raise exception 'invalid subscription' using errcode = '22023';
  end if;

  insert into public.push_subscriptions (endpoint, user_id, p256dh, auth)
  values (p_endpoint, auth.uid(), p_p256dh, p_auth)
  on conflict (endpoint) do update
    set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth;
end;
$$;

create or replace function private.check_push_token(p_token text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from private.push_secret
     where token_hash = sha256(convert_to(coalesce(p_token, ''), 'UTF8'))
  ) then
    raise exception 'not allowed' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.signup_push_targets(p_user_id uuid, p_token text)
returns table (endpoint text, p256dh text, auth text, full_name text, email text)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  perform private.check_push_token(p_token);

  -- Solo registros recientes y una sola vez por usuario.
  if not exists (
    select 1 from public.profiles
     where id = p_user_id and created_at > now() - interval '1 hour'
  ) then
    return;
  end if;
  insert into private.signup_push_sent (user_id) values (p_user_id) on conflict do nothing;
  if not found then
    return;
  end if;

  return query
    select s.endpoint, s.p256dh, s.auth, n.full_name, n.email
      from public.push_subscriptions s
      join public.profiles a on a.id = s.user_id and a.role = 'admin'
      cross join (select full_name, email from public.profiles where id = p_user_id) n;
end;
$$;

create or replace function public.forget_push_subscriptions(p_endpoints text[], p_token text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.check_push_token(p_token);
  delete from public.push_subscriptions where endpoint = any (p_endpoints);
end;
$$;

revoke execute on function private.check_push_token(text) from public, anon, authenticated;
revoke execute on function public.save_push_subscription(text, text, text) from public, anon;
grant execute on function public.save_push_subscription(text, text, text) to authenticated;
revoke execute on function public.signup_push_targets(uuid, text) from public;
grant execute on function public.signup_push_targets(uuid, text) to anon, authenticated;
revoke execute on function public.forget_push_subscriptions(text[], text) from public;
grant execute on function public.forget_push_subscriptions(text[], text) to anon, authenticated;

-- El hash del token se guarda aparte (no va en el repositorio):
--   insert into private.push_secret (token_hash)
--   values (sha256(convert_to('<PUSH_SECRET>', 'UTF8')))
--   on conflict (id) do update set token_hash = excluded.token_hash;
