-- Métricas del panel de seguimiento limitadas a la semana natural en curso.
-- Mantiene intactos los RPC históricos de 4/8/12 semanas.

create or replace function public.coach_current_week_metrics(p_as_of date default current_date)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_today date := (now() at time zone 'Europe/Madrid')::date;
  v_as_of date := least(coalesce(p_as_of, v_today), v_today);
  v_start date := date_trunc('week', least(coalesce(p_as_of, v_today), v_today)::timestamp)::date;
begin
  if v_actor is null or not public.is_admin() then
    raise exception 'not allowed';
  end if;

  return (
    with eligible as (
      select p.id, coalesce(p.full_name, 'Sin nombre') as full_name, p.access_status, p.role, p.sex
      from public.profiles p
      where p.role = 'athlete' or (p.role = 'admin' and p.show_evolution_as_athlete = true)
    ),
    period_blocks as (
      select b.id as block_id, b.score_type, b.title, b.content, d.date
      from public.weeks w
      join public.days d on d.week_id = w.id
      join public.workout_blocks b on b.day_id = d.id
      where w.status = 'published'
        and d.date between v_start and v_as_of
        and (btrim(b.title) <> '' or btrim(b.content) <> '' or b.score_type = 'load')
    ),
    completion as (
      select e.id as user_id,
             count(pb.block_id)::integer as programmed,
             count(pb.block_id) filter (where coalesce(l.done, false) or r.user_id is not null)::integer as completed,
             case when count(pb.block_id) > 0 then
               round((count(pb.block_id) filter (where coalesce(l.done, false) or r.user_id is not null))::numeric * 100 / count(pb.block_id), 1)
             end as pct
      from eligible e
      cross join period_blocks pb
      left join public.block_logs l on l.block_id = pb.block_id and l.user_id = e.id
      left join public.block_results r on r.block_id = pb.block_id and r.user_id = e.id
      group by e.id
    ),
    scored_all as (
      select pb.block_id, r.user_id, r.division, p.sex,
             case pb.score_type::text
               when 'time' then case when not r.capped and r.seconds is not null then r.seconds::numeric when r.capped and r.reps is not null then 1000000-r.reps end
               when 'rounds_reps' then case when r.rounds is not null then -(r.rounds::numeric*1000000+coalesce(r.reps,0)) end
               when 'reps' then -r.reps::numeric
               when 'weight' then -r.kg
             end as sort_key
      from period_blocks pb
      join public.block_results r on r.block_id = pb.block_id
      join public.profiles p on p.id = r.user_id
      where pb.score_type::text in ('time','rounds_reps','reps','weight')
    ),
    ranked as (
      select s.*,
             rank() over(partition by s.block_id, s.division, s.sex order by s.sort_key) as position,
             count(*) over(partition by s.block_id, s.division, s.sex) as total
      from scored_all s
      where s.sort_key is not null
    ),
    wods as (
      select e.id as user_id,
             count(r.block_id)::integer as scored,
             count(r.block_id) filter (where r.total >= 2)::integer as comparable,
             round(avg(r.position::numeric) filter (where r.total >= 2), 1) as avg_position,
             round(avg(r.total::numeric) filter (where r.total >= 2), 1) as avg_participants,
             round(avg((r.position::numeric/r.total::numeric)*100) filter (where r.total >= 2), 1) as avg_top_pct
      from eligible e
      left join ranked r on r.user_id = e.id
      group by e.id
    ),
    strength as (
      select e.id as user_id,
             count(pb.block_id) filter (where pb.score_type = 'load')::integer as programmed_sessions,
             count(pb.block_id) filter (where pb.score_type = 'load' and (coalesce(l.done, false) or r.user_id is not null))::integer as sessions,
             count(pb.block_id) filter (where pb.score_type = 'load' and r.total_load is not null)::integer as volume_sessions,
             coalesce(round(sum(r.total_load) filter (where pb.score_type = 'load'), 2), 0) as total_load,
             max(r.kg) filter (where pb.score_type = 'load') as peak_kg
      from eligible e
      cross join period_blocks pb
      left join public.block_logs l on l.block_id = pb.block_id and l.user_id = e.id
      left join public.block_results r on r.block_id = pb.block_id and r.user_id = e.id
      group by e.id
    ),
    notes as (
      select e.id as user_id,
             count(pb.block_id) filter (where nullif(btrim(l.note), '') is not null)::integer as notes_count
      from eligible e
      cross join period_blocks pb
      left join public.block_logs l on l.block_id = pb.block_id and l.user_id = e.id
      group by e.id
    ),
    metrics as (
      select e.id as user_id, e.full_name, e.access_status, e.role,
             c.programmed, c.completed, c.pct,
             w.scored, w.comparable, w.avg_position, w.avg_participants, w.avg_top_pct,
             s.programmed_sessions, s.sessions, s.volume_sessions, s.total_load, s.peak_kg,
             n.notes_count
      from eligible e
      join completion c on c.user_id = e.id
      join wods w on w.user_id = e.id
      join strength s on s.user_id = e.id
      join notes n on n.user_id = e.id
      where c.programmed > 0
    ),
    athlete_rows as (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'user_id', m.user_id,
          'full_name', m.full_name,
          'access_status', m.access_status,
          'role', m.role,
          'current', jsonb_build_object(
            'available', true,
            'from', v_start,
            'to', v_as_of,
            'compliance', jsonb_build_object('programmed', m.programmed, 'completed', m.completed, 'pct', m.pct),
            'wods', jsonb_build_object('scored', m.scored, 'comparable', m.comparable, 'avg_position', m.avg_position, 'avg_participants', m.avg_participants, 'avg_top_pct', m.avg_top_pct),
            'strength', jsonb_build_object(
              'programmed_sessions', m.programmed_sessions,
              'sessions', m.sessions,
              'volume_sessions', m.volume_sessions,
              'total_load', m.total_load,
              'peak_kg', m.peak_kg,
              'rm_comparable_sessions', 0,
              'avg_peak_pct_rm', null,
              'max_peak_pct_rm', null
            ),
            'notes_count', m.notes_count
          ),
          'previous', jsonb_build_object(
            'available', false,
            'from', null,
            'to', null,
            'compliance', jsonb_build_object('programmed', 0, 'completed', 0, 'pct', null),
            'wods', jsonb_build_object('scored', 0, 'comparable', 0, 'avg_position', null, 'avg_participants', null, 'avg_top_pct', null),
            'strength', jsonb_build_object('programmed_sessions', 0, 'sessions', 0, 'volume_sessions', 0, 'total_load', 0, 'peak_kg', null, 'rm_comparable_sessions', 0, 'avg_peak_pct_rm', null, 'max_peak_pct_rm', null),
            'notes_count', 0
          ),
          'trends', jsonb_build_object('compliance_points', null, 'wod_position_improvement', null, 'wod_relative_improvement_points', null, 'strength_volume_pct', null),
          'rm_improvements', 0
        ) order by lower(m.full_name), m.user_id
      ), '[]'::jsonb) as athletes
      from metrics m
    ),
    summary as (
      select count(*)::integer as athletes_with_data,
             round(avg(m.pct), 1) as avg_compliance_pct,
             coalesce(sum(m.completed), 0)::integer as completed_blocks
      from metrics m
    )
    select jsonb_build_object(
      'version', 1,
      'weeks', 1,
      'as_of', v_as_of,
      'summary', jsonb_build_object(
        'athletes_with_data', s.athletes_with_data,
        'avg_compliance_pct', s.avg_compliance_pct,
        'athletes_improving_wods', 0,
        'athletes_improving_rm', 0,
        'completed_blocks', s.completed_blocks
      ),
      'athletes', a.athletes
    )
    from summary s cross join athlete_rows a
  );
end;
$$;

revoke all on function public.coach_current_week_metrics(date) from public, anon;
grant execute on function public.coach_current_week_metrics(date) to authenticated;
