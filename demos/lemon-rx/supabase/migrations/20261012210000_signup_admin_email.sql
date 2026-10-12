-- Lemon RX: aviso por email a los admins cuando se registra alguien
--
-- · profiles.admin_notified_at: cuándo se avisó a los admins de ese registro.
--   Los usuarios que ya existían quedan marcados para no generar avisos.
-- · claim_signup_notification(): la llama la app con la sesión del propio
--   usuario justo al confirmar su email (o al registrarse, si no hace falta
--   confirmar). Marca el registro como avisado de forma atómica (solo una vez)
--   y devuelve sus datos y a qué admins escribir.
-- Se puede ejecutar más de una vez sin problema.

alter table public.profiles add column if not exists admin_notified_at timestamptz;

update public.profiles
   set admin_notified_at = created_at
 where admin_notified_at is null;

create or replace function public.claim_signup_notification()
returns table (user_id uuid, full_name text, email text, admin_email text, admin_name text)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v public.profiles;
begin
  update public.profiles p
     set admin_notified_at = now()
   where p.id = (select auth.uid()) and p.admin_notified_at is null
  returning p.* into v;
  if v.id is null then
    return;
  end if;

  return query
    select v.id, v.full_name, v.email, a.email, a.full_name
      from public.profiles a
      join auth.users u on u.id = a.id
     where a.role = 'admin'
       and a.id <> v.id
       and u.email_confirmed_at is not null
       and a.email <> '';
end;
$$;

revoke execute on function public.claim_signup_notification() from public, anon;
grant execute on function public.claim_signup_notification() to authenticated;
