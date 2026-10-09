-- En Supabase, las tablas de "public" quedan expuestas en su API REST para los roles
-- anon y authenticated (privilegios por defecto). Esta aplicación no usa esa API: todo pasa
-- por el backend con el rol restringido banco_api. La RLS ya impediría leer filas, pero se
-- retiran los permisos de forma explícita. En un Postgres sin esos roles no hace nada.
do $$
declare
  r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format('revoke all on all tables in schema public from %I', r);
      execute format('revoke all on all sequences in schema public from %I', r);
      execute format('revoke all on all functions in schema public from %I', r);
      execute format('revoke all on schema app from %I', r);
      execute format('alter default privileges in schema public revoke all on tables from %I', r);
      execute format('alter default privileges in schema public revoke all on functions from %I', r);
    end if;
  end loop;
end$$;
