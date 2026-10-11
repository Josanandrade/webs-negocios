-- Las funciones de trigger no deben poder llamarse por la API (/rest/v1/rpc).
-- Los triggers siguen funcionando: el permiso solo se comprueba al crear el trigger.
revoke execute on function public.guard_profile_update() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_user_email_change() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
revoke execute on function public.sync_published_at() from public, anon, authenticated;
