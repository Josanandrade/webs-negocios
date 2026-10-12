-- Lemon RX: aviso por email cuando se publica una semana
--
-- · weeks.notified_at: cuándo se avisó por email de esa semana. Se avisa una
--   sola vez por semana: si luego se despublica y se vuelve a publicar (o se
--   edita), no se manda otro email.
-- · claim_week_notification(): solo para admins. Marca la semana como avisada
--   de forma atómica (dos clics a la vez no mandan dos emails) y devuelve a
--   quién escribir: todos los usuarios, admins incluidos, con el email
--   confirmado y sin el acceso bloqueado.
-- Se puede ejecutar más de una vez sin problema.

alter table public.weeks add column if not exists notified_at timestamptz;

-- Las semanas que ya estaban publicadas no generan un aviso con retraso.
update public.weeks
   set notified_at = coalesce(published_at, now())
 where status = 'published' and notified_at is null;

create or replace function public.claim_week_notification(p_week_id uuid)
returns table (email text, full_name text)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  update public.weeks
     set notified_at = now()
   where id = p_week_id and status = 'published' and notified_at is null;
  if not found then
    return;
  end if;

  return query
    select p.email, p.full_name
      from public.profiles p
      join auth.users u on u.id = p.id
     where u.email_confirmed_at is not null
       and p.access_status <> 'blocked'
       and p.email <> '';
end;
$$;

revoke execute on function public.claim_week_notification(uuid) from public, anon;
grant execute on function public.claim_week_notification(uuid) to authenticated;
