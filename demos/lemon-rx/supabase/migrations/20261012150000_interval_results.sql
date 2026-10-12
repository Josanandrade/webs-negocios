-- Lemon RX: resultado en WODs tipo EMOM / intervalos
--
-- · Nuevo tipo de bloque 'intervals': el atleta elige RX o Intermedio y dice
--   si mantuvo todas las repeticiones en todos los intervalos. Si no, escribe
--   libremente cuántas hizo por ronda.
-- · En estos bloques no hay posiciones: el ranking es una lista de quién lo
--   hizo como estaba programado y quién lo tuvo que adaptar.
--
-- El nuevo valor del enum no se usa como literal en este mismo script (Postgres
-- no lo permite hasta confirmar la transacción): se compara como texto.

alter type public.score_type add value if not exists 'intervals';

alter table public.block_results
  add column if not exists as_prescribed boolean,
  add column if not exists reps_detail text not null default ''
    check (char_length(reps_detail) <= 500);

-- Cambian las columnas que devuelve: hay que borrarla y crearla de nuevo.
drop function if exists public.week_leaderboard(uuid);

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
  as_prescribed boolean,
  reps_detail text,
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
      r.as_prescribed,
      r.reps_detail,
      -- Menor = mejor. Null si el resultado no encaja con el tipo del bloque.
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
        -- Sin posiciones: primero los que lo hicieron como estaba programado.
        when 'intervals' then
          case when r.as_prescribed then 0 when not r.as_prescribed then 1 end
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
    s.as_prescribed,
    s.reps_detail,
    rank() over (partition by s.block_id, s.division order by s.sort_key) as "position",
    count(*) over (partition by s.block_id, s.division) as total
  from scored s
  join public.profiles p on p.id = s.user_id
  where s.sort_key is not null
  order by s.block_id, s.division, s.sort_key, 3;
$$;

revoke execute on function public.week_leaderboard(uuid) from public, anon;
grant execute on function public.week_leaderboard(uuid) to authenticated;
