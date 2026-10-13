-- Sexo para rankings y carga total de bloques de fuerza.
-- Cambios aditivos para mantener compatibilidad con resultados históricos.

alter table public.profiles
  add column if not exists sex text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_sex_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_sex_check
      check (sex is null or sex in ('male', 'female'));
  end if;
end
$$;

alter table public.block_results
  add column if not exists total_load numeric;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'block_results_total_load_check'
      and conrelid = 'public.block_results'::regclass
  ) then
    alter table public.block_results
      add constraint block_results_total_load_check
      check (total_load is null or total_load > 0);
  end if;
end
$$;

-- Los nuevos registros copian el sexo elegido en el formulario de alta.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.profiles (id, email, full_name, sex)
  values (
    new.id,
    coalesce(new.email, ''),
    left(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), 120),
    case
      when new.raw_user_meta_data ->> 'sex' in ('male', 'female')
        then new.raw_user_meta_data ->> 'sex'
      else null
    end
  );
  return new;
end;
$function$;

-- Nueva versión para no romper clientes que todavía llamen a week_leaderboard().
-- Solo entran en clasificación atletas con sexo informado. Las posiciones se
-- calculan por bloque + sexo + categoría (RX/Intermedio cuando corresponda).
create or replace function public.week_leaderboard_v2(p_week_id uuid)
returns table(
  block_id uuid,
  user_id uuid,
  full_name text,
  sex text,
  division public.division,
  seconds integer,
  capped boolean,
  rounds integer,
  reps integer,
  kg numeric,
  total_load numeric,
  as_prescribed boolean,
  reps_detail text,
  "position" bigint,
  total bigint
)
language sql
stable
security definer
set search_path = ''
as $function$
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
      coalesce(nullif(p.full_name, ''), 'Atleta') as full_name,
      p.sex,
      r.division,
      r.seconds,
      r.capped,
      r.rounds,
      r.reps,
      r.kg,
      r.total_load,
      r.as_prescribed,
      r.reps_detail,
      b.score_type::text as score_type,
      case b.score_type::text
        when 'time' then
          case
            when not r.capped and r.seconds is not null then r.seconds::numeric
            when r.capped and r.reps is not null then 1000000 - r.reps
          end
        when 'rounds_reps' then
          case when r.rounds is not null then -(r.rounds::numeric * 1000000 + coalesce(r.reps, 0)) end
        when 'reps' then -r.reps::numeric
        when 'weight' then -r.kg
        when 'load' then -coalesce(r.total_load, r.kg)
        when 'intervals' then case when r.as_prescribed then 0 when not r.as_prescribed then 1 end
      end as sort_key
    from visible v
    join public.days d on d.week_id = v.id
    join public.workout_blocks b on b.day_id = d.id and b.score_type <> 'none'
    join public.block_results r on r.block_id = b.id
    join public.profiles p on p.id = r.user_id
    where p.sex in ('male', 'female')
  )
  select
    s.block_id,
    s.user_id,
    s.full_name,
    s.sex,
    s.division,
    s.seconds,
    s.capped,
    s.rounds,
    s.reps,
    s.kg,
    s.total_load,
    s.as_prescribed,
    s.reps_detail,
    rank() over (
      partition by
        s.block_id,
        s.sex,
        case when s.score_type = 'load' then 'all' else s.division::text end
      order by s.sort_key
    ) as "position",
    count(*) over (
      partition by
        s.block_id,
        s.sex,
        case when s.score_type = 'load' then 'all' else s.division::text end
    ) as total
  from scored s
  where s.sort_key is not null
  order by s.block_id, s.sex, s.sort_key, s.full_name;
$function$;

revoke all on function public.week_leaderboard_v2(uuid) from public;
grant execute on function public.week_leaderboard_v2(uuid) to authenticated;
