-- Lemon RX: los nuevos RM se celebran en privado y solo se publican en HOME
-- cuando el atleta lo confirma expresamente.

alter table public.workout_post_achievements
  alter column post_id drop not null;

alter table public.workout_post_achievements
  add column if not exists shared_at timestamptz null;

update public.workout_post_achievements
set shared_at = coalesce(shared_at, achieved_at, created_at)
where post_id is not null
  and shared_at is null;

create unique index if not exists workout_post_achievements_history_rm_uidx
  on public.workout_post_achievements(history_id, rm_number);

-- Los miembros ven los logros ya compartidos. Cada atleta también puede leer sus
-- propios logros pendientes para mostrar el diálogo de confirmación.
drop policy if exists "social achievements: miembros leen" on public.workout_post_achievements;
create policy "social achievements: compartidos u propios pendientes"
  on public.workout_post_achievements
  for select
  to authenticated
  using (
    (select public.has_program_access())
    and (
      post_id is not null
      or (select auth.uid()) = user_id
    )
  );

-- Detectar la mejora sigue siendo automático, pero ya no crea ni modifica HOME.
-- El logro queda pendiente (post_id = null) hasta que el atleta lo comparta.
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
  v_movement_name text;
begin
  if new.source not in ('user_update', 'block_result') then
    return new;
  end if;

  select m.name
    into v_movement_name
  from public.movements m
  where m.id = new.movement_id;

  if not found then
    return new;
  end if;

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
      achieved_at,
      shared_at
    ) values (
      null,
      new.user_id,
      new.movement_id,
      v_movement_name,
      v_i,
      v_new_kg,
      v_previous_kg,
      new.id,
      case when new.source = 'block_result' then 'block_result' else 'user_update' end,
      new.source_block_id,
      new.recorded_at,
      null
    )
    on conflict (history_id, rm_number) do nothing;
  end loop;

  return new;
end;
$$;

revoke all on function private.sync_rm_achievement_from_history() from public, anon, authenticated;

-- Esta RPC es la única vía cliente para pasar un logro pendiente a HOME. Valida
-- que todos los logros pertenecen al usuario autenticado y solo modifica la
-- asociación social; nunca permite editar kilos, movimiento ni propietario.
create or replace function public.share_rm_achievements(p_achievement_ids uuid[])
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_name text;
  v_avatar text;
  v_row record;
  v_post_id uuid;
  v_existing_id uuid;
  v_existing_kg numeric;
  v_existing_previous numeric;
  v_shared integer := 0;
begin
  if v_actor is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  if coalesce(array_length(p_achievement_ids, 1), 0) < 1
     or array_length(p_achievement_ids, 1) > 10 then
    raise exception 'invalid achievement selection';
  end if;

  if not public.has_program_access() then
    raise exception 'program access required' using errcode = '42501';
  end if;

  if exists (
    select 1
    from unnest(p_achievement_ids) as requested(id)
    left join public.workout_post_achievements a on a.id = requested.id
    where a.id is null
       or a.user_id <> v_actor
  ) then
    raise exception 'achievement not owned by user' using errcode = '42501';
  end if;

  select p.full_name, p.avatar_url
    into v_name, v_avatar
  from public.profiles p
  where p.id = v_actor;

  if not found then
    raise exception 'profile not found';
  end if;

  for v_row in
    select
      a.*,
      coalesce(d.date, (a.achieved_at at time zone 'Europe/Madrid')::date) as training_date
    from public.workout_post_achievements a
    left join public.workout_blocks b on b.id = a.source_block_id
    left join public.days d on d.id = b.day_id
    where a.id = any(p_achievement_ids)
      and a.user_id = v_actor
    order by a.achieved_at, a.rm_number
  loop
    if v_row.post_id is not null then
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
      v_actor,
      v_row.training_date,
      coalesce(v_name, 'Sin nombre'),
      v_avatar,
      v_row.achieved_at,
      now()
    )
    on conflict (program_key, user_id, training_date) do update
      set athlete_name = excluded.athlete_name,
          athlete_avatar_url = excluded.athlete_avatar_url,
          updated_at = now()
    returning id into v_post_id;

    v_existing_id := null;
    v_existing_kg := null;
    v_existing_previous := null;

    select a.id, a.kg, a.previous_kg
      into v_existing_id, v_existing_kg, v_existing_previous
    from public.workout_post_achievements a
    where a.post_id = v_post_id
      and a.movement_id = v_row.movement_id
      and a.rm_number = v_row.rm_number
    limit 1;

    if v_existing_id is not null then
      if v_row.kg > v_existing_kg then
        update public.workout_post_achievements
        set kg = v_row.kg,
            previous_kg = coalesce(v_existing_previous, v_row.previous_kg),
            history_id = v_row.history_id,
            source = v_row.source,
            source_block_id = v_row.source_block_id,
            achieved_at = v_row.achieved_at,
            shared_at = now()
        where id = v_existing_id;
      end if;

      delete from public.workout_post_achievements
      where id = v_row.id
        and user_id = v_actor
        and post_id is null;
    else
      update public.workout_post_achievements
      set post_id = v_post_id,
          shared_at = now()
      where id = v_row.id
        and user_id = v_actor
        and post_id is null;
    end if;

    v_shared := v_shared + 1;
  end loop;

  return v_shared;
end;
$$;

revoke all on function public.share_rm_achievements(uuid[]) from public, anon, authenticated;
grant execute on function public.share_rm_achievements(uuid[]) to authenticated;
