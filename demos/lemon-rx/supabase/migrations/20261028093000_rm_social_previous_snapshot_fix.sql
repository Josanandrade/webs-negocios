-- Al celebrar un RM comparamos con la marca inmediatamente anterior guardada,
-- no con el máximo histórico. Así una corrección manual a la baja pasa a ser
-- la nueva referencia real y una mejora posterior se reconoce correctamente.

create or replace function private.sync_rm_achievement_from_history()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_i integer;
  v_last_i integer;
  v_key text;
  v_new_kg numeric;
  v_previous_kg numeric;
  v_training_date date;
  v_post_id uuid;
  v_name text;
  v_avatar text;
  v_movement_name text;
begin
  if new.source not in ('user_update', 'block_result') then
    return new;
  end if;

  select p.full_name, p.avatar_url, m.name
    into v_name, v_avatar, v_movement_name
  from public.profiles p
  join public.movements m on m.id = new.movement_id
  where p.id = new.user_id;

  if not found then
    return new;
  end if;

  if new.source_block_id is not null then
    select d.date
      into v_training_date
    from public.workout_blocks b
    join public.days d on d.id = b.day_id
    where b.id = new.source_block_id;
  end if;

  v_training_date := coalesce(v_training_date, (new.recorded_at at time zone 'Europe/Madrid')::date);
  v_last_i := case when new.source = 'block_result' then 1 else 5 end;

  for v_i in 1..v_last_i loop
    v_key := 'rm_' || v_i;
    v_new_kg := nullif(to_jsonb(new) ->> v_key, '')::numeric;
    if v_new_kg is null then
      continue;
    end if;

    select nullif(to_jsonb(h) ->> v_key, '')::numeric
      into v_previous_kg
    from public.user_rm_history h
    where h.user_id = new.user_id
      and h.movement_id = new.movement_id
      and h.id < new.id
    order by h.id desc
    limit 1;

    if v_previous_kg is not null and v_new_kg <= v_previous_kg then
      continue;
    end if;

    insert into public.workout_posts (
      program_key, user_id, training_date, athlete_name, athlete_avatar_url, first_completed_at, updated_at
    ) values (
      'lemon-rx', new.user_id, v_training_date, coalesce(v_name, 'Sin nombre'), v_avatar, new.recorded_at, now()
    )
    on conflict (program_key, user_id, training_date) do update
      set athlete_name = excluded.athlete_name,
          athlete_avatar_url = excluded.athlete_avatar_url,
          updated_at = now()
    returning id into v_post_id;

    insert into public.workout_post_achievements (
      post_id, user_id, movement_id, movement_name, rm_number, kg, previous_kg,
      history_id, source, source_block_id, achieved_at
    ) values (
      v_post_id, new.user_id, new.movement_id, v_movement_name, v_i, v_new_kg, v_previous_kg,
      new.id, case when new.source = 'block_result' then 'block_result' else 'user_update' end,
      new.source_block_id, new.recorded_at
    )
    on conflict (post_id, movement_id, rm_number) do update
      set kg = excluded.kg,
          previous_kg = excluded.previous_kg,
          history_id = excluded.history_id,
          source = excluded.source,
          source_block_id = excluded.source_block_id,
          achieved_at = excluded.achieved_at
    where excluded.kg > public.workout_post_achievements.kg;
  end loop;

  return new;
end;
$$;

revoke all on function private.sync_rm_achievement_from_history() from public, anon, authenticated;
