alter table public.workout_blocks
  add column if not exists builder_sections jsonb;

alter table public.workout_blocks
  drop constraint if exists workout_blocks_builder_sections_array;

alter table public.workout_blocks
  add constraint workout_blocks_builder_sections_array
  check (builder_sections is null or jsonb_typeof(builder_sections) = 'array');

create or replace function public.save_week_content(p_week_id uuid, p_days jsonb)
returns void
language plpgsql
set search_path = ''
as $function$
declare
  v_week public.weeks; v_day jsonb; v_block jsonb; v_day_id uuid; v_date date; v_pos integer;
  v_score_type public.score_type; v_sets_count smallint; v_reps_per_set smallint; v_movement_id uuid;
  v_strength_scheme jsonb; v_is_complex boolean; v_complex_movements jsonb; v_rm_reference_movement_id uuid;
  v_is_emom boolean; v_emom_reps smallint; v_emom_interval_seconds smallint; v_emom_rounds smallint; v_emom_percentage numeric(6,2);
  v_builder_sections jsonb;
  v_keep_days uuid[] := '{}'; v_keep_blocks uuid[] := '{}';
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  select * into v_week from public.weeks where id = p_week_id for update;
  if not found then raise exception 'week not found' using errcode = 'P0002'; end if;
  for v_day in select * from jsonb_array_elements(coalesce(p_days, '[]'::jsonb)) loop
    v_date := (v_day ->> 'date')::date;
    if v_date < v_week.start_date or v_date > v_week.end_date then raise exception 'date outside week' using errcode = '22023'; end if;
    if jsonb_array_length(coalesce(v_day -> 'blocks', '[]'::jsonb)) = 0 then continue; end if;
    insert into public.days (week_id, date, day_of_week) values (p_week_id, v_date, extract(isodow from v_date)::smallint)
      on conflict (week_id, date) do update set date = excluded.date returning id into v_day_id;
    v_keep_days := v_keep_days || v_day_id; v_pos := 0;
    for v_block in select * from jsonb_array_elements(v_day -> 'blocks') loop
      v_score_type := coalesce(nullif(v_block ->> 'score_type', ''), 'none')::public.score_type;
      v_builder_sections := case when v_score_type::text = 'load' then v_block -> 'builder_sections' else null end;
      if v_builder_sections is not null and jsonb_typeof(v_builder_sections) <> 'array' then raise exception 'invalid builder sections' using errcode = '22023'; end if;
      v_is_complex := v_score_type::text = 'load' and v_builder_sections is null and coalesce((v_block ->> 'is_complex')::boolean, false);
      v_is_emom := v_score_type::text = 'load' and v_builder_sections is null and coalesce((v_block ->> 'is_emom')::boolean, false);
      if v_score_type::text = 'load' then
        v_sets_count := null; v_reps_per_set := null;
        v_movement_id := case when v_builder_sections is null and not v_is_complex then nullif(v_block ->> 'movement_id', '')::uuid else null end;
        v_complex_movements := case when v_is_complex then v_block -> 'complex_movements' else null end;
        if v_complex_movements is not null and jsonb_typeof(v_complex_movements) <> 'array' then raise exception 'invalid complex movements' using errcode = '22023'; end if;
        v_rm_reference_movement_id := case when v_is_complex then nullif(v_block ->> 'rm_reference_movement_id', '')::uuid else null end;
        if v_builder_sections is not null then
          v_strength_scheme := null; v_is_complex := false; v_complex_movements := null; v_rm_reference_movement_id := null;
          v_is_emom := false; v_emom_reps := null; v_emom_interval_seconds := null; v_emom_rounds := null; v_emom_percentage := null;
        elsif v_is_emom then
          v_strength_scheme := null;
          v_emom_reps := case when not v_is_complex then nullif(v_block ->> 'emom_reps', '')::smallint else null end;
          v_emom_interval_seconds := nullif(v_block ->> 'emom_interval_seconds', '')::smallint;
          v_emom_rounds := nullif(v_block ->> 'emom_rounds', '')::smallint;
          v_emom_percentage := nullif(v_block ->> 'emom_percentage', '')::numeric(6,2);
        else
          v_strength_scheme := v_block -> 'strength_scheme';
          if v_strength_scheme is not null and jsonb_typeof(v_strength_scheme) <> 'array' then raise exception 'invalid strength scheme' using errcode = '22023'; end if;
          v_emom_reps := null; v_emom_interval_seconds := null; v_emom_rounds := null; v_emom_percentage := null;
        end if;
      else
        v_sets_count := null; v_reps_per_set := null; v_movement_id := null; v_strength_scheme := null; v_is_complex := false;
        v_complex_movements := null; v_rm_reference_movement_id := null; v_is_emom := false; v_emom_reps := null;
        v_emom_interval_seconds := null; v_emom_rounds := null; v_emom_percentage := null; v_builder_sections := null;
      end if;
      insert into public.workout_blocks (id, day_id, title, content, position, score_type, sets_count, reps_per_set, movement_id, strength_scheme, is_complex, complex_movements, rm_reference_movement_id, is_emom, emom_reps, emom_interval_seconds, emom_rounds, emom_percentage, builder_sections)
      values ((v_block ->> 'id')::uuid, v_day_id, left(trim(coalesce(v_block ->> 'title', '')), 80), coalesce(v_block ->> 'content', ''), v_pos, v_score_type, v_sets_count, v_reps_per_set, v_movement_id, v_strength_scheme, v_is_complex, v_complex_movements, v_rm_reference_movement_id, v_is_emom, v_emom_reps, v_emom_interval_seconds, v_emom_rounds, v_emom_percentage, v_builder_sections)
      on conflict (id) do update set day_id = excluded.day_id, title = excluded.title, content = excluded.content, position = excluded.position, score_type = excluded.score_type, sets_count = excluded.sets_count, reps_per_set = excluded.reps_per_set, movement_id = excluded.movement_id, strength_scheme = excluded.strength_scheme, is_complex = excluded.is_complex, complex_movements = excluded.complex_movements, rm_reference_movement_id = excluded.rm_reference_movement_id, is_emom = excluded.is_emom, emom_reps = excluded.emom_reps, emom_interval_seconds = excluded.emom_interval_seconds, emom_rounds = excluded.emom_rounds, emom_percentage = excluded.emom_percentage, builder_sections = excluded.builder_sections
      where public.workout_blocks.day_id in (select d.id from public.days d where d.week_id = p_week_id) or public.workout_blocks.day_id = excluded.day_id;
      v_keep_blocks := v_keep_blocks || (v_block ->> 'id')::uuid; v_pos := v_pos + 1;
    end loop;
  end loop;
  delete from public.workout_blocks b using public.days d where b.day_id = d.id and d.week_id = p_week_id and not (b.id = any (v_keep_blocks));
  delete from public.days where week_id = p_week_id and not (id = any (v_keep_days));
  update public.weeks set updated_by = (select auth.uid()) where id = p_week_id;
end;
$function$;
