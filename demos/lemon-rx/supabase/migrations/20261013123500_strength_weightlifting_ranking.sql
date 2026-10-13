create or replace function public.week_leaderboard(p_week_id uuid)
returns table(block_id uuid, user_id uuid, full_name text, division public.division, seconds integer, capped boolean, rounds integer, reps integer, kg numeric, as_prescribed boolean, reps_detail text, "position" bigint, total bigint)
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
      r.division,
      r.seconds,
      r.capped,
      r.rounds,
      r.reps,
      r.kg,
      r.as_prescribed,
      r.reps_detail,
      b.score_type::text as score_type,
      case b.score_type::text
        when 'time' then case when not r.capped and r.seconds is not null then r.seconds::numeric when r.capped and r.reps is not null then 1000000 - r.reps end
        when 'rounds_reps' then case when r.rounds is not null then -(r.rounds::numeric * 1000000 + coalesce(r.reps, 0)) end
        when 'reps' then -r.reps::numeric
        when 'weight' then -r.kg
        when 'load' then -r.kg
        when 'intervals' then case when r.as_prescribed then 0 when not r.as_prescribed then 1 end
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
    rank() over (partition by s.block_id, case when s.score_type = 'load' then 'all' else s.division::text end order by s.sort_key) as "position",
    count(*) over (partition by s.block_id, case when s.score_type = 'load' then 'all' else s.division::text end) as total
  from scored s
  join public.profiles p on p.id = s.user_id
  where s.sort_key is not null
  order by s.block_id, s.sort_key, 3;
$function$;