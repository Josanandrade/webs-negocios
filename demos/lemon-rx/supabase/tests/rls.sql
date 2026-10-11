-- Pruebas manuales de RLS. Ejecutar en una base LOCAL con los usuarios de prueba creados:
--   psql "$DB_URL" -f supabase/tests/rls.sql
-- Cada bloque indica el resultado esperado.
\set ON_ERROR_STOP 0
select id as ath from profiles where email='atleta@lemonrx.test' \gset
select id as adm from profiles where email='admin@lemonrx.test' \gset
-- datos: una semana borrador y una publicada (como superuser)
insert into weeks (start_date, status) values ('2026-10-05','published'), ('2026-10-12','draft') on conflict do nothing;
insert into days (week_id, date, day_of_week) select id, start_date, 1 from weeks where start_date in ('2026-10-05','2026-10-12') on conflict do nothing;
insert into workout_blocks (day_id, title, content) select d.id, 'STRENGTH', 'Back Squat 5x5' from days d where not exists (select 1 from workout_blocks b where b.day_id=d.id);

begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',:'ath'::uuid,'role','authenticated')::text, true);
\echo '== atleta pendiente: ve semanas (esperado 0)'
select count(*) from weeks;
\echo '== atleta: ve otros perfiles (esperado 1, solo el suyo)'
select count(*) from profiles;
\echo '== atleta: intenta marcarse pagado (esperado ERROR)'
update profiles set payment_status='paid' where email='atleta@lemonrx.test';
rollback;

begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',:'ath'::uuid,'role','authenticated')::text, true);
\echo '== atleta: intenta hacerse admin (esperado ERROR)'
update profiles set role='admin' where email='atleta@lemonrx.test';
rollback;

begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',:'ath'::uuid,'role','authenticated')::text, true);
\echo '== atleta: cambia su nombre (esperado UPDATE 1)'
update profiles set full_name='Laura M.' where email='atleta@lemonrx.test';
\echo '== atleta: actualiza ajustes (esperado UPDATE 0)'
update app_settings set auto_block_unpaid=false;
\echo '== atleta: crea semana (esperado ERROR RLS)'
insert into weeks (start_date) values ('2026-11-02');
rollback;

-- activar atleta pero sin pagar
update profiles set access_status='active', payment_status='pending' where email='atleta@lemonrx.test';
begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',:'ath'::uuid,'role','authenticated')::text, true);
\echo '== activo, no pagado, autobloqueo ON: semanas (esperado 0)'
select count(*) from weeks;
select count(*) as bloques from workout_blocks;
rollback;
update app_settings set auto_block_unpaid=false;
begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',:'ath'::uuid,'role','authenticated')::text, true);
\echo '== activo, no pagado, autobloqueo OFF: semanas (esperado 1, solo publicada)'
select start_date, status from weeks;
select count(*) as bloques from workout_blocks;
\echo '== atleta: guardar semana vía RPC (esperado ERROR)'
select save_week_content((select id from weeks limit 1), '[]'::jsonb);
rollback;
begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',:'ath'::uuid,'role','authenticated')::text, true);
\echo '== atleta: borrar bloques (esperado DELETE 0)'
delete from workout_blocks;
rollback;
update app_settings set auto_block_unpaid=true;
update profiles set access_status='pending', payment_status='pending', full_name='Laura Martín' where email='atleta@lemonrx.test';

begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',:'adm'::uuid,'role','authenticated')::text, true);
\echo '== admin: ve todo (esperado 2 semanas, 3 perfiles)'
select count(*) from weeks; select count(*) from profiles;
rollback;

begin;
set local role anon;
\echo '== anon: semanas (esperado ERROR permiso)'
select count(*) from weeks;
rollback;
delete from weeks where start_date in ('2026-10-05','2026-10-12');
