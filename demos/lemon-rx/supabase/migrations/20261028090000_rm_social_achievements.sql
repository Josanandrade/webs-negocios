-- Lemon RX: RM automáticos, celebración social y soporte para logros en Home.
-- Todo es aditivo salvo ampliar el catálogo de source de user_rm_history y
-- preservar posts sociales que tengan logros aunque se elimine su último bloque.

alter table public.user_rm_history
  add column if not exists source_block_id uuid null references public.workout_blocks(id) on delete set null;

alter table public.user_rm_history
  drop constraint if exists user_rm_history_source_check;

alter table public.user_rm_history
  add constraint user_rm_history_source_check
  check (source = any (array['baseline'::text, 'user_update'::text, 'deleted'::text, 'block_result'::text]));

create table if not exists public.workout_post_achievements (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.workout_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  movement_id uuid not null references public.movements(id) on delete cascade,
  movement_name text not null,
  rm_number smallint not null check (rm_number between 1 and 5),
  kg numeric(6,2) not null check (kg > 0 and kg <= 2000),
  previous_kg numeric(6,2) null check (previous_kg is null or (previous_kg > 0 and previous_kg <= 2000)),
  history_id bigint not null references public.user_rm_history(id) on delete cascade,
  source text not null check (source in ('user_update', 'block_result')),
  source_block_id uuid null references public.workout_blocks(id) on delete set null,
  achieved_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (post_id, movement_id, rm_number)
);

create index if not exists workout_post_achievements_post_idx
  on public.workout_post_achievements(post_id, achieved_at desc);
create index if not exists workout_post_achievements_user_idx
  on public.workout_post_achievements(user_id, achieved_at desc);
create index if not exists workout_post_achievements_source_block_idx
  on public.workout_post_achievements(source_block_id)
  where source_block_id is not null;

alter table public.workout_post_achievements enable row level security;

drop policy if exists "social achievements: miembros leen" on public.workout_post_achievements;
create policy "social achievements: miembros leen"
  on public.workout_post_achievements
  for select
  to authenticated
  using ((select public.has_program_access()));

revoke all on table public.workout_post_achievements from anon, authenticated;
grant select on table public.workout_post_achievements to authenticated;

-- El cliente solo puede crear snapshots manuales/de borrado. `block_result` queda
-- reservado al trigger privado que detecta una mejora real desde un resultado.
drop policy if exists "user_rm_history: own or admin insert" on public.user_rm_history;
create policy "user_rm_history: own or admin insert"
  on public.user_rm_history
  for insert
  to authenticated
  with check (
    (select public.is_admin())
    or (
      (select auth.uid()) = user_id
      and source in ('user_update', 'deleted')
      and source_block_id is null
    )
  );

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
  v_previous_max numeric;
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

  v_training_date := coalesce(
    v_training_date,
    (new.recorded_at at time zone 'Europe/Madrid')::date
  );

  v_last_i := case when new.source = 'block_result' then 1 else 5 end;

  for v_i in 1..v_last_i loop
    v_key := 'rm_' || v_i;
    v_new_kg := nullif(to_jsonb(new) ->> v_key, '')::numeric;
    if v_new_kg is null then
      continue;
    end if;

    select max(nullif(to_jsonb(h) ->> v_key, '')::numeric)
      into v_previous_max
    from public.user_rm_history h
    where h.user_id = new.user_id
      and h.movement_id = new.movement_id
      and h.id < new.id
      and h.source <> 'deleted';

    if v_previous_max is not null and v_new_kg <= v_previous_max then
      continue;
    end if;

    insert into public.workout_posts (
      program_key,
      user_id,
      training_date,
      athlete_name,
      athlete_avatar_url,
      first_completed_at,
      updated_at
    ) values (
      'lemon-rx',
      new.user_id,
      v_training_date,
      coalesce(v_name, 'Sin nombre'),
      v_avatar,
      new.recorded_at,
      now()
    )
    on conflict (program_key, user_id, training_date) do update
      set athlete_name = excluded.athlete_name,
          athlete_avatar_url = excluded.athlete_avatar_url,
          updated_at = now()
    returning id into v_post_id;

    insert into public.workout_post_achievements (
      post_id,
      user_id,
      movement_id,
      movement_name,
      rm_number,
      kg,
      previous_kg,
      history_id,
      source,
      source_block_id,
      achieved_at
    ) values (
      v_post_id,
      new.user_id,
      new.movement_id,
      v_movement_name,
      v_i,
      v_new_kg,
      v_previous_max,
      new.id,
      case when new.source = 'block_result' then 'block_result' else 'user_update' end,
      new.source_block_id,
      new.recorded_at
    )
    on conflict (post_id, movement_id, rm_number) do update
      set kg = excluded.kg,
          previous_kg = coalesce(public.workout_post_achievements.previous_kg, excluded.previous_kg),
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

drop trigger if exists sync_rm_achievement_from_history on public.user_rm_history;
create trigger sync_rm_achievement_from_history
after insert on public.user_rm_history
for each row execute function private.sync_rm_achievement_from_history();

create or replace function private.promote_rm1_from_block(
  p_user_id uuid,
  p_movement_id uuid,
  p_kg numeric,
  p_block_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_rm public.user_rms%rowtype;
  v_now timestamptz := now();
begin
  if p_user_id is null or p_movement_id is null or p_block_id is null or p_kg is null or p_kg <= 0 or p_kg > 2000 then
    return;
  end if;

  if not exists (
    select 1
    from public.movements m
    where m.id = p_movement_id
      and m.is_active = true
      and m.is_rm_eligible = true
  ) then
    return;
  end if;

  insert into public.user_rms (user_id, movement_id, rm_1, updated_at)
  values (p_user_id, p_movement_id, p_kg, v_now)
  on conflict (user_id, movement_id) do update
    set rm_1 = excluded.rm_1,
        updated_at = excluded.updated_at
    where public.user_rms.rm_1 is null
       or excluded.rm_1 > public.user_rms.rm_1
  returning * into v_rm;

  if not found then
    return;
  end if;

  insert into public.user_rm_history (
    user_id,
    movement_id,
    rm_1,
    rm_2,
    rm_3,
    rm_4,
    rm_5,
    source,
    source_block_id,
    recorded_at
  ) values (
    p_user_id,
    p_movement_id,
    v_rm.rm_1,
    v_rm.rm_2,
    v_rm.rm_3,
    v_rm.rm_4,
    v_rm.rm_5,
    'block_result',
    p_block_id,
    v_now
  );
end;
$$;

revoke all on function private.promote_rm1_from_block(uuid, uuid, numeric, uuid) from public, anon, authenticated;

create or replace function private.sync_rm_from_block_result()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_score_type public.score_type;
  v_movement_id uuid;
  v_builder_sections jsonb;
  v_detail jsonb;
  v_section jsonb;
  v_item jsonb;
  v_saved_section jsonb;
  v_saved_exercise jsonb;
  v_candidate numeric;
  v_item_movement uuid;
begin
  select b.score_type, b.movement_id, b.builder_sections
    into v_score_type, v_movement_id, v_builder_sections
  from public.workout_blocks b
  where b.id = new.block_id;

  if not found or v_score_type <> 'load' then
    return new;
  end if;

  if v_movement_id is not null and new.kg is not null then
    perform private.promote_rm1_from_block(new.user_id, v_movement_id, new.kg, new.block_id);
  end if;

  if v_builder_sections is null
     or jsonb_typeof(v_builder_sections) <> 'array'
     or coalesce(new.reps_detail, '') = '' then
    return new;
  end if;

  begin
    v_detail := new.reps_detail::jsonb;
  exception when others then
    return new;
  end;

  if jsonb_typeof(v_detail -> 'sections') <> 'array' then
    return new;
  end if;

  for v_section in select value from jsonb_array_elements(v_builder_sections) loop
    select value
      into v_saved_section
    from jsonb_array_elements(v_detail -> 'sections')
    where value ->> 'section_id' = v_section ->> 'id'
    limit 1;

    if v_saved_section is null or jsonb_typeof(v_saved_section -> 'exercises') <> 'array' then
      continue;
    end if;

    if jsonb_typeof(v_section -> 'items') <> 'array' then
      continue;
    end if;

    for v_item in select value from jsonb_array_elements(v_section -> 'items') loop
      if v_item ->> 'type' <> 'exercise'
         or coalesce((v_item ->> 'track_load')::boolean, false) = false
         or coalesce(v_item ->> 'movement_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
        continue;
      end if;

      select value
        into v_saved_exercise
      from jsonb_array_elements(v_saved_section -> 'exercises')
      where value ->> 'item_id' = v_item ->> 'id'
      limit 1;

      if v_saved_exercise is null or jsonb_typeof(v_saved_exercise -> 'weights') <> 'array' then
        continue;
      end if;

      select max((value #>> '{}')::numeric)
        into v_candidate
      from jsonb_array_elements(v_saved_exercise -> 'weights')
      where (value #>> '{}') ~ '^[0-9]+([.][0-9]+)?$';

      if v_candidate is null then
        continue;
      end if;

      v_item_movement := (v_item ->> 'movement_id')::uuid;
      perform private.promote_rm1_from_block(new.user_id, v_item_movement, v_candidate, new.block_id);
    end loop;
  end loop;

  return new;
end;
$$;

revoke all on function private.sync_rm_from_block_result() from public, anon, authenticated;

drop trigger if exists sync_rm_from_block_result on public.block_results;
create trigger sync_rm_from_block_result
after insert or update on public.block_results
for each row execute function private.sync_rm_from_block_result();

-- Mantener un post social si, al desmarcar el último bloque del día, todavía
-- contiene uno o más logros de RM. El resto del comportamiento se conserva.
create or replace function private.sync_workout_social(p_user_id uuid, p_block_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_post_id uuid;
  v_training_date date;
  v_title text;
  v_score_type public.score_type;
  v_position integer;
  v_done boolean;
  v_note text;
  v_log_created timestamptz;
  v_log_updated timestamptz;
  v_name text;
  v_avatar text;
  v_division text;
  v_seconds integer;
  v_capped boolean;
  v_rounds integer;
  v_reps integer;
  v_kg numeric;
  v_total_load numeric;
  v_as_prescribed boolean;
  v_reps_detail text;
  v_result jsonb;
begin
  if p_user_id is null or p_block_id is null then return; end if;
  if v_actor is not null and p_user_id <> v_actor and not public.is_admin() then
    raise exception 'not allowed';
  end if;

  select d.date, b.title, b.score_type, b.position,
         l.done, l.note, l.created_at, l.updated_at,
         p.full_name, p.avatar_url,
         r.division::text, r.seconds, r.capped, r.rounds, r.reps,
         r.kg, r.total_load, r.as_prescribed, r.reps_detail
    into v_training_date, v_title, v_score_type, v_position,
         v_done, v_note, v_log_created, v_log_updated,
         v_name, v_avatar,
         v_division, v_seconds, v_capped, v_rounds, v_reps,
         v_kg, v_total_load, v_as_prescribed, v_reps_detail
  from public.workout_blocks b
  join public.days d on d.id = b.day_id
  join public.profiles p on p.id = p_user_id
  left join public.block_logs l on l.block_id = b.id and l.user_id = p_user_id
  left join public.block_results r on r.block_id = b.id and r.user_id = p_user_id
  where b.id = p_block_id;

  if not found then return; end if;

  select wp.id into v_post_id
  from public.workout_posts wp
  where wp.program_key = 'lemon-rx'
    and wp.user_id = p_user_id
    and wp.training_date = v_training_date;

  if not coalesce(v_done, false) then
    if v_post_id is not null then
      delete from public.workout_post_blocks
      where post_id = v_post_id and block_id = p_block_id;

      if not exists (select 1 from public.workout_post_blocks where post_id = v_post_id)
         and not exists (select 1 from public.workout_post_achievements where post_id = v_post_id) then
        delete from public.workout_posts where id = v_post_id;
      else
        update public.workout_posts set updated_at = now() where id = v_post_id;
      end if;
    end if;
    return;
  end if;

  insert into public.workout_posts (
    program_key, user_id, training_date, athlete_name, athlete_avatar_url,
    first_completed_at, updated_at
  ) values (
    'lemon-rx', p_user_id, v_training_date, coalesce(v_name, 'Sin nombre'), v_avatar,
    coalesce(v_log_updated, v_log_created, now()), now()
  )
  on conflict (program_key, user_id, training_date) do update
    set athlete_name = excluded.athlete_name,
        athlete_avatar_url = excluded.athlete_avatar_url,
        updated_at = now()
  returning id into v_post_id;

  if v_division is null then
    v_result := null;
  else
    v_result := jsonb_strip_nulls(jsonb_build_object(
      'division', v_division,
      'seconds', v_seconds,
      'capped', v_capped,
      'rounds', v_rounds,
      'reps', v_reps,
      'kg', v_kg,
      'total_load', v_total_load,
      'as_prescribed', v_as_prescribed,
      'reps_detail', v_reps_detail
    ));
  end if;

  insert into public.workout_post_blocks (
    post_id, block_id, block_title, block_score_type, block_position,
    completed_at, note, result
  ) values (
    v_post_id, p_block_id, coalesce(v_title, 'Bloque'), v_score_type, coalesce(v_position, 0),
    coalesce(v_log_updated, v_log_created, now()), coalesce(v_note, ''), v_result
  )
  on conflict (post_id, block_id) do update
    set block_title = excluded.block_title,
        block_score_type = excluded.block_score_type,
        block_position = excluded.block_position,
        completed_at = least(public.workout_post_blocks.completed_at, excluded.completed_at),
        note = excluded.note,
        result = excluded.result;
end;
$$;

revoke all on function private.sync_workout_social(uuid, uuid) from public, anon, authenticated;
