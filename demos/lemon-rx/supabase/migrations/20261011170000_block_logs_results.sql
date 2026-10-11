-- Lemon RX: seguimiento de bloques, notas, resultados y ranking
--
-- · block_logs: cada atleta marca un bloque como hecho y deja una nota.
--   Solo lo ve el propio atleta y los admins.
-- · block_results: resultado de un bloque puntuable (tiempo, AMRAP, reps, kg)
--   en RX o Intermedio. El ranking lo ve cualquiera con acceso a esa semana,
--   pero solo a través de week_leaderboard(): la tabla en sí sigue siendo privada.
-- · workout_blocks.score_type: el admin decide qué bloques tienen ranking y cómo.

-- ---------------------------------------------------------------------------
-- Tipos y columnas
-- ---------------------------------------------------------------------------
-- none: sin resultado · time: por tiempo (menos es mejor; con time cap se
-- cuentan las reps) · rounds_reps: AMRAP · reps: reps o calorías · weight: kg
create type public.score_type as enum ('none', 'time', 'rounds_reps', 'reps', 'weight');
create type public.division as enum ('rx', 'intermediate');

alter table public.workout_blocks
  add column score_type public.score_type not null default 'none';

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------
create table public.block_logs (
  user_id uuid not null references public.profiles (id) on delete cascade,
  block_id uuid not null references public.workout_blocks (id) on delete cascade,
  done boolean not null default false,
  note text not null default '' check (char_length(note) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, block_id)
);
create index block_logs_block_idx on public.block_logs (block_id);
-- Para "últimas notas" del panel de admin.
create index block_logs_note_idx on public.block_logs (updated_at desc) where note <> '';

create table public.block_results (
  user_id uuid not null references public.profiles (id) on delete cascade,
  block_id uuid not null references public.workout_blocks (id) on delete cascade,
  division public.division not null,
  seconds integer check (seconds between 1 and 86400),
  capped boolean not null default false,
  rounds integer check (rounds between 0 and 10000),
  reps integer check (reps between 0 and 100000),
  kg numeric(6, 2) check (kg > 0 and kg < 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, block_id)
);
create index block_results_block_idx on public.block_results (block_id);

create trigger block_logs_touch before update on public.block_logs
  for each row execute function public.touch_updated_at();
create trigger block_results_touch before update on public.block_results
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- RLS: cada atleta gestiona lo suyo; los admins leen todo.
-- Para escribir hay que tener acceso a la programación y poder ver el bloque
-- (la subconsulta aplica la RLS de workout_blocks → days → weeks).
-- ---------------------------------------------------------------------------
alter table public.block_logs enable row level security;
alter table public.block_results enable row level security;

create policy "logs: ver los propios o admin" on public.block_logs
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "logs: crear los propios" on public.block_logs
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (select public.has_program_access())
    and exists (select 1 from public.workout_blocks b where b.id = block_id)
  );
create policy "logs: editar los propios" on public.block_logs
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (select public.has_program_access())
    and exists (select 1 from public.workout_blocks b where b.id = block_id)
  );
create policy "logs: borrar los propios" on public.block_logs
  for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "results: ver los propios o admin" on public.block_results
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "results: crear los propios" on public.block_results
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (select public.has_program_access())
    and exists (select 1 from public.workout_blocks b where b.id = block_id and b.score_type <> 'none')
  );
create policy "results: editar los propios" on public.block_results
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (select public.has_program_access())
    and exists (select 1 from public.workout_blocks b where b.id = block_id and b.score_type <> 'none')
  );
create policy "results: borrar los propios" on public.block_results
  for delete to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.block_logs, public.block_results from anon;

-- ---------------------------------------------------------------------------
-- Ranking de una semana: posición por bloque y categoría (RX / Intermedio).
-- Security definer para poder mostrar el nombre de los demás atletas (profiles
-- es privada), pero solo devuelve algo si quien llama puede ver esa semana.
-- Empates: misma posición. Por tiempo, primero quien terminó (menos tiempo
-- mejor) y después quien llegó al time cap (más reps mejor).
-- ---------------------------------------------------------------------------
create function public.week_leaderboard(p_week_id uuid)
returns table (
  block_id uuid,
  user_id uuid,
  full_name text,
  division public.division,
  seconds integer,
  capped boolean,
  rounds integer,
  reps integer,
  kg numeric,
  "position" bigint,
  total bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  with visible as (
    select w.id
    from public.weeks w
    where w.id = p_week_id
      and (select auth.uid()) is not null
      and public.can_view_week(w.status, w.end_date)
  ),
  scored as (
    select
      r.block_id,
      r.user_id,
      r.division,
      r.seconds,
      r.capped,
      r.rounds,
      r.reps,
      r.kg,
      -- Menor = mejor. Null si el resultado no encaja con el tipo del bloque.
      case b.score_type
        when 'time' then
          case
            when not r.capped and r.seconds is not null then r.seconds::numeric
            when r.capped and r.reps is not null then 1000000 - r.reps
          end
        when 'rounds_reps' then
          case when r.rounds is not null then -(r.rounds::numeric * 1000000 + coalesce(r.reps, 0)) end
        when 'reps' then -r.reps::numeric
        when 'weight' then -r.kg
      end as sort_key
    from visible v
    join public.days d on d.week_id = v.id
    join public.workout_blocks b on b.day_id = d.id and b.score_type <> 'none'
    join public.block_results r on r.block_id = b.id
  )
  select
    s.block_id,
    s.user_id,
    coalesce(nullif(p.full_name, ''), 'Atleta') as full_name,
    s.division,
    s.seconds,
    s.capped,
    s.rounds,
    s.reps,
    s.kg,
    rank() over (partition by s.block_id, s.division order by s.sort_key) as "position",
    count(*) over (partition by s.block_id, s.division) as total
  from scored s
  join public.profiles p on p.id = s.user_id
  where s.sort_key is not null
  order by s.block_id, s.division, 10;
$$;

revoke execute on function public.week_leaderboard(uuid) from public, anon;
grant execute on function public.week_leaderboard(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- save_week_content: ahora también guarda el tipo de resultado de cada bloque.
-- Los bloques conservan su id al editar, así que marcas, notas y resultados
-- de los atletas no se pierden al corregir la programación.
-- ---------------------------------------------------------------------------
create or replace function public.save_week_content(p_week_id uuid, p_days jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_week public.weeks;
  v_day jsonb;
  v_block jsonb;
  v_day_id uuid;
  v_date date;
  v_pos integer;
  v_keep_days uuid[] := '{}';
  v_keep_blocks uuid[] := '{}';
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  select * into v_week from public.weeks where id = p_week_id for update;
  if not found then
    raise exception 'week not found' using errcode = 'P0002';
  end if;

  for v_day in select * from jsonb_array_elements(coalesce(p_days, '[]'::jsonb)) loop
    v_date := (v_day ->> 'date')::date;
    if v_date < v_week.start_date or v_date > v_week.end_date then
      raise exception 'date outside week' using errcode = '22023';
    end if;
    -- Días sin bloques no se guardan.
    if jsonb_array_length(coalesce(v_day -> 'blocks', '[]'::jsonb)) = 0 then
      continue;
    end if;

    insert into public.days (week_id, date, day_of_week)
    values (p_week_id, v_date, extract(isodow from v_date)::smallint)
    on conflict (week_id, date) do update set date = excluded.date
    returning id into v_day_id;
    v_keep_days := v_keep_days || v_day_id;

    v_pos := 0;
    for v_block in select * from jsonb_array_elements(v_day -> 'blocks') loop
      insert into public.workout_blocks (id, day_id, title, content, position, score_type)
      values (
        (v_block ->> 'id')::uuid,
        v_day_id,
        left(trim(coalesce(v_block ->> 'title', '')), 80),
        coalesce(v_block ->> 'content', ''),
        v_pos,
        coalesce(nullif(v_block ->> 'score_type', ''), 'none')::public.score_type
      )
      on conflict (id) do update
        set day_id = excluded.day_id,
            title = excluded.title,
            content = excluded.content,
            position = excluded.position,
            score_type = excluded.score_type
        where public.workout_blocks.day_id in (
          select d.id from public.days d where d.week_id = p_week_id
        ) or public.workout_blocks.day_id = excluded.day_id;
      v_keep_blocks := v_keep_blocks || (v_block ->> 'id')::uuid;
      v_pos := v_pos + 1;
    end loop;
  end loop;

  delete from public.workout_blocks b
  using public.days d
  where b.day_id = d.id and d.week_id = p_week_id and not (b.id = any (v_keep_blocks));

  delete from public.days where week_id = p_week_id and not (id = any (v_keep_days));

  update public.weeks set updated_by = (select auth.uid()) where id = p_week_id;
end;
$$;
