-- Strength / Weightlifting: catálogo compartido, RM personales, esquemas por %1RM y Complex.

create table if not exists public.movements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  group_name text not null default 'Other',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint movements_name_not_blank check (length(trim(name)) between 2 and 80)
);
create unique index if not exists movements_name_lower_uidx on public.movements (lower(trim(name)));
alter table public.movements enable row level security;
drop policy if exists "movements: authenticated read" on public.movements;
create policy "movements: authenticated read" on public.movements for select to authenticated using (true);
drop policy if exists "movements: admin insert" on public.movements;
create policy "movements: admin insert" on public.movements for insert to authenticated with check ((select public.is_admin()));
drop policy if exists "movements: admin update" on public.movements;
create policy "movements: admin update" on public.movements for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
grant select on public.movements to authenticated;
grant insert, update on public.movements to authenticated;

create table if not exists public.user_rms (
  user_id uuid not null references public.profiles(id) on delete cascade,
  movement_id uuid not null references public.movements(id) on delete cascade,
  rm_1 numeric(7,2), rm_2 numeric(7,2), rm_3 numeric(7,2), rm_4 numeric(7,2), rm_5 numeric(7,2),
  updated_at timestamptz not null default now(),
  primary key (user_id, movement_id),
  constraint user_rms_rm1_valid check (rm_1 is null or (rm_1 > 0 and rm_1 <= 2000)),
  constraint user_rms_rm2_valid check (rm_2 is null or (rm_2 > 0 and rm_2 <= 2000)),
  constraint user_rms_rm3_valid check (rm_3 is null or (rm_3 > 0 and rm_3 <= 2000)),
  constraint user_rms_rm4_valid check (rm_4 is null or (rm_4 > 0 and rm_4 <= 2000)),
  constraint user_rms_rm5_valid check (rm_5 is null or (rm_5 > 0 and rm_5 <= 2000))
);
alter table public.user_rms enable row level security;
drop policy if exists "user_rms: own or admin read" on public.user_rms;
create policy "user_rms: own or admin read" on public.user_rms for select to authenticated using ((select auth.uid()) = user_id or (select public.is_admin()));
drop policy if exists "user_rms: own or admin insert" on public.user_rms;
create policy "user_rms: own or admin insert" on public.user_rms for insert to authenticated with check ((select auth.uid()) = user_id or (select public.is_admin()));
drop policy if exists "user_rms: own or admin update" on public.user_rms;
create policy "user_rms: own or admin update" on public.user_rms for update to authenticated using ((select auth.uid()) = user_id or (select public.is_admin())) with check ((select auth.uid()) = user_id or (select public.is_admin()));
drop policy if exists "user_rms: own or admin delete" on public.user_rms;
create policy "user_rms: own or admin delete" on public.user_rms for delete to authenticated using ((select auth.uid()) = user_id or (select public.is_admin()));
grant select, insert, update, delete on public.user_rms to authenticated;

alter table public.workout_blocks add column if not exists movement_id uuid references public.movements(id) on delete set null;
alter table public.workout_blocks add column if not exists strength_scheme jsonb;
alter table public.workout_blocks add column if not exists is_complex boolean not null default false;
alter table public.workout_blocks drop constraint if exists workout_blocks_strength_scheme_array;
alter table public.workout_blocks add constraint workout_blocks_strength_scheme_array check (strength_scheme is null or jsonb_typeof(strength_scheme) = 'array');

insert into public.movements (name, group_name, sort_order) values
('Back Squat','Squat',10),('Front Squat','Squat',20),('Overhead Squat','Squat',30),('Box Squat','Squat',40),
('Deadlift','Deadlift',50),('Sumo Deadlift','Deadlift',60),('Romanian Deadlift','Deadlift',70),
('Shoulder Press (Strict Press)','Press',80),('Push Press','Press',90),('Push Jerk','Press',100),('Split Jerk','Press',110),('Bench Press','Press',120),('Thruster','Press',130),
('Snatch','Weightlifting',140),('Squat Snatch','Weightlifting',150),('Power Snatch','Weightlifting',160),('Hang Snatch','Weightlifting',170),('Hang Power Snatch','Weightlifting',180),('High Hang Snatch','Weightlifting',190),('Muscle Snatch','Weightlifting',200),('Snatch Balance','Weightlifting',210),
('Clean','Weightlifting',220),('Squat Clean','Weightlifting',230),('Power Clean','Weightlifting',240),('Hang Clean','Weightlifting',250),('Hang Power Clean','Weightlifting',260),('High Hang Clean','Weightlifting',270),('Muscle Clean','Weightlifting',280),('Clean & Jerk','Weightlifting',290),('Power Clean & Jerk','Weightlifting',300),('Clean Pull','Weightlifting',310),('Snatch Pull','Weightlifting',320),
('Split Clean','Weightlifting',330),('Split Snatch','Weightlifting',340),('Sots Press','Press',350),('Zercher Squat','Squat',360),('Sumo Deadlift High Pull','Deadlift',370)
on conflict do nothing;

create or replace function public.save_week_content(p_week_id uuid, p_days jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
declare
  v_week public.weeks; v_day jsonb; v_block jsonb; v_day_id uuid; v_date date; v_pos integer;
  v_score_type public.score_type; v_sets_count smallint; v_reps_per_set smallint; v_movement_id uuid;
  v_strength_scheme jsonb; v_is_complex boolean; v_keep_days uuid[] := '{}'; v_keep_blocks uuid[] := '{}';
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
      v_is_complex := coalesce((v_block ->> 'is_complex')::boolean, false);
      if v_score_type::text = 'load' and not v_is_complex then
        v_sets_count := nullif(v_block ->> 'sets_count', '')::smallint;
        v_reps_per_set := nullif(v_block ->> 'reps_per_set', '')::smallint;
        v_movement_id := nullif(v_block ->> 'movement_id', '')::uuid;
        v_strength_scheme := v_block -> 'strength_scheme';
        if v_strength_scheme is not null and jsonb_typeof(v_strength_scheme) <> 'array' then raise exception 'invalid strength scheme' using errcode = '22023'; end if;
      else
        v_sets_count := null; v_reps_per_set := null; v_movement_id := null; v_strength_scheme := null;
      end if;
      insert into public.workout_blocks (id, day_id, title, content, position, score_type, sets_count, reps_per_set, movement_id, strength_scheme, is_complex)
      values ((v_block ->> 'id')::uuid, v_day_id, left(trim(coalesce(v_block ->> 'title', '')), 80), coalesce(v_block ->> 'content', ''), v_pos, v_score_type, v_sets_count, v_reps_per_set, v_movement_id, v_strength_scheme, v_is_complex)
      on conflict (id) do update set day_id = excluded.day_id, title = excluded.title, content = excluded.content, position = excluded.position, score_type = excluded.score_type, sets_count = excluded.sets_count, reps_per_set = excluded.reps_per_set, movement_id = excluded.movement_id, strength_scheme = excluded.strength_scheme, is_complex = excluded.is_complex
      where public.workout_blocks.day_id in (select d.id from public.days d where d.week_id = p_week_id) or public.workout_blocks.day_id = excluded.day_id;
      v_keep_blocks := v_keep_blocks || (v_block ->> 'id')::uuid; v_pos := v_pos + 1;
    end loop;
  end loop;
  delete from public.workout_blocks b using public.days d where b.day_id = d.id and d.week_id = p_week_id and not (b.id = any (v_keep_blocks));
  delete from public.days where week_id = p_week_id and not (id = any (v_keep_days));
  update public.weeks set updated_by = (select auth.uid()) where id = p_week_id;
end;
$$;
revoke execute on function public.save_week_content(uuid, jsonb) from public, anon;
grant execute on function public.save_week_content(uuid, jsonb) to authenticated;
