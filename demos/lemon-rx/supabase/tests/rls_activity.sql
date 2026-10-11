-- Pruebas de RLS de marcas, notas, resultados y ranking. Base LOCAL con los
-- usuarios de prueba (atleta@ pendiente; atleta2@ y atleta3@ activos y pagados):
--   psql "$DB_URL" -f supabase/tests/rls_activity.sql
-- Cada bloque indica el resultado esperado. Todo se deshace al final.
\set ON_ERROR_STOP 0
select id as ath from profiles where email='atleta@lemonrx.test' \gset
select id as a2 from profiles where email='atleta2@lemonrx.test' \gset
select id as a3 from profiles where email='atleta3@lemonrx.test' \gset
select id as adm from profiles where email='admin@lemonrx.test' \gset

-- datos (como superuser): semana publicada con un WOD por tiempo y una borrador
insert into weeks (id, start_date, status) values
  ('00000000-0000-4000-8000-000000000001', '2026-09-07', 'published'),
  ('00000000-0000-4000-8000-000000000002', '2026-09-14', 'draft');
insert into days (id, week_id, date, day_of_week) values
  ('00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000001', '2026-09-07', 1),
  ('00000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000002', '2026-09-14', 1);
insert into workout_blocks (id, day_id, title, content, score_type) values
  ('00000000-0000-4000-8000-000000000021', '00000000-0000-4000-8000-000000000011', 'WOD', 'Fran', 'time'),
  ('00000000-0000-4000-8000-000000000022', '00000000-0000-4000-8000-000000000011', 'STRENGTH', 'Back Squat', 'none'),
  ('00000000-0000-4000-8000-000000000023', '00000000-0000-4000-8000-000000000012', 'WOD', 'Borrador', 'time');

\echo '== atleta2: marca hecho + nota (esperado INSERT 0 1)'
begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',:'a2'::uuid,'role','authenticated')::text, true);
insert into block_logs (user_id, block_id, done, note) values (:'a2', '00000000-0000-4000-8000-000000000022', true, 'Pesado hoy');
\echo '== atleta2: resultado RX 3:10 (esperado INSERT 0 1)'
insert into block_results (user_id, block_id, division, seconds) values (:'a2', '00000000-0000-4000-8000-000000000021', 'rx', 190);
commit;

\echo '== atleta2: resultado en bloque sin ranking (esperado ERROR RLS)'
begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',:'a2'::uuid,'role','authenticated')::text, true);
insert into block_results (user_id, block_id, division, reps) values (:'a2', '00000000-0000-4000-8000-000000000022', 'rx', 10);
rollback;

\echo '== atleta2: resultado en semana borrador (esperado ERROR RLS)'
begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',:'a2'::uuid,'role','authenticated')::text, true);
insert into block_results (user_id, block_id, division, seconds) values (:'a2', '00000000-0000-4000-8000-000000000023', 'rx', 100);
rollback;

\echo '== atleta2: escribir en nombre de otro (esperado ERROR RLS)'
begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',:'a2'::uuid,'role','authenticated')::text, true);
insert into block_logs (user_id, block_id, done) values (:'a3', '00000000-0000-4000-8000-000000000021', true);
rollback;

\echo '== atleta pendiente (sin acceso): marcar hecho (esperado ERROR RLS)'
begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',:'ath'::uuid,'role','authenticated')::text, true);
insert into block_logs (user_id, block_id, done) values (:'ath', '00000000-0000-4000-8000-000000000021', true);
rollback;

-- atleta3: intermedio + otro RX con time cap
begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',:'a3'::uuid,'role','authenticated')::text, true);
insert into block_results (user_id, block_id, division, capped, reps) values (:'a3', '00000000-0000-4000-8000-000000000021', 'rx', true, 80);
commit;
insert into block_results (user_id, block_id, division, seconds) values (:'adm', '00000000-0000-4000-8000-000000000021', 'rx', 250);

begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',:'a3'::uuid,'role','authenticated')::text, true);
\echo '== atleta3: ve notas ajenas (esperado 0)'
select count(*) from block_logs where user_id <> :'a3';
\echo '== atleta3: lee resultados ajenos directamente (esperado 0)'
select count(*) from block_results where user_id <> :'a3';
\echo '== atleta3: ranking RX (esperado 1º Pablo 190s, 2º Jose 250s, 3º Marta CAP 80; total 3)'
select full_name, division, seconds, capped, reps, position, total from week_leaderboard('00000000-0000-4000-8000-000000000001');
\echo '== atleta3: ranking de semana borrador (esperado 0 filas)'
select count(*) from week_leaderboard('00000000-0000-4000-8000-000000000002');
\echo '== atleta3: borrar resultado ajeno (esperado DELETE 0)'
delete from block_results where user_id = :'a2';
rollback;

begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',:'ath'::uuid,'role','authenticated')::text, true);
\echo '== atleta sin acceso: ranking (esperado 0 filas)'
select count(*) from week_leaderboard('00000000-0000-4000-8000-000000000001');
rollback;

begin;
set local role authenticated;
select set_config('request.jwt.claims', json_build_object('sub',:'adm'::uuid,'role','authenticated')::text, true);
\echo '== admin: ve notas y resultados de todos (esperado 1 nota, 3 resultados)'
select count(*) from block_logs where note <> '';
select count(*) from block_results;
\echo '== admin: guardar semana conserva marcas y cambia el tipo (esperado score_type reps, 1 log)'
select save_week_content('00000000-0000-4000-8000-000000000001',
  '[{"date":"2026-09-07","blocks":[{"id":"00000000-0000-4000-8000-000000000021","title":"WOD","content":"Fran","score_type":"reps"},{"id":"00000000-0000-4000-8000-000000000022","title":"STRENGTH","content":"Back Squat 5x5"}]}]'::jsonb);
select title, score_type from workout_blocks where day_id = '00000000-0000-4000-8000-000000000011' order by position;
select count(*) from block_logs;
rollback;

begin;
set local role anon;
\echo '== anon: ranking (esperado ERROR permiso)'
select count(*) from week_leaderboard('00000000-0000-4000-8000-000000000001');
rollback;

delete from weeks where id in ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000002');
