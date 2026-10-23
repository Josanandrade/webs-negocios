create or replace function public.day_leaderboard_v2(p_week_id uuid, p_date date)
returns table(
  block_id uuid,
  user_id uuid,
  full_name text,
  avatar_url text,
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
set search_path to ''
as $function$
  with visible as (
    select d.id as day_id
    from public.weeks w
    join public.days d on d.week_id = w.id
    where w.id = p_week_id
      and d.date = p_date
      and (select auth.uid()) is not null
      and public.can_view_week(w.status, w.end_date)
  ), scored as (
    select
      r.block_id,
      r.user_id,
      coalesce(nullif(p.full_name, ''), 'Atleta') as full_name,
      p.avatar_url,
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
        when 'time' then case
          when not r.capped and r.seconds is not null then r.seconds::numeric
          when r.capped and r.reps is not null then 1000000-r.reps
        end
        when 'rounds_reps' then case
          when r.rounds is not null then -(r.rounds::numeric*1000000+coalesce(r.reps,0))
        end
        when 'reps' then -r.reps::numeric
        when 'weight' then -r.kg
        when 'load' then -coalesce(r.total_load,r.kg)
        when 'intervals' then case
          when r.as_prescribed then 0
          when not r.as_prescribed then 1
        end
      end as sort_key
    from visible v
    join public.workout_blocks b on b.day_id = v.day_id and b.score_type <> 'none'
    join public.block_results r on r.block_id = b.id
    join public.profiles p on p.id = r.user_id
    where p.sex in ('male','female')
  )
  select
    s.block_id,
    s.user_id,
    s.full_name,
    s.avatar_url,
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
      partition by s.block_id,
        case when s.score_type = 'load' then 'all' else s.division::text end
      order by s.sort_key
    ) as "position",
    count(*) over (
      partition by s.block_id,
        case when s.score_type = 'load' then 'all' else s.division::text end
    ) as total
  from scored s
  where s.sort_key is not null
  order by
    s.block_id,
    case when s.score_type = 'load' then 'all' else s.division::text end,
    s.sort_key,
    s.full_name;
$function$;

revoke all on function public.day_leaderboard_v2(uuid, date) from public;
revoke all on function public.day_leaderboard_v2(uuid, date) from anon;
grant execute on function public.day_leaderboard_v2(uuid, date) to authenticated, service_role;
