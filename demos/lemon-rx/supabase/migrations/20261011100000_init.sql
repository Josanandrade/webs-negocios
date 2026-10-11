-- Lemon RX: esquema inicial
-- Perfiles + roles, programación semanal (semanas → días → bloques),
-- ajustes globales y políticas RLS. Toda la autorización vive aquí:
-- el frontend solo oculta lo que la base de datos ya impide.

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('admin', 'athlete');
create type public.payment_status as enum ('paid', 'pending');
-- pending: recién registrado, sin revisar. Sin acceso hasta que un admin lo active.
create type public.access_status as enum ('pending', 'active', 'blocked');
create type public.week_status as enum ('draft', 'published');

-- ---------------------------------------------------------------------------
-- Tablas
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 120),
  email text not null,
  role public.user_role not null default 'athlete',
  payment_status public.payment_status not null default 'pending',
  access_status public.access_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index profiles_created_at_idx on public.profiles (created_at desc);

-- Fila única con la configuración global de la plataforma.
create table public.app_settings (
  id boolean primary key default true check (id),
  auto_block_unpaid boolean not null default true,
  show_past_weeks boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);
insert into public.app_settings (id) values (true);

create table public.weeks (
  id uuid primary key default gen_random_uuid(),
  start_date date not null unique check (extract(isodow from start_date) = 1),
  end_date date generated always as (start_date + 6) stored,
  status public.week_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index weeks_status_start_idx on public.weeks (status, start_date);

create table public.days (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.weeks (id) on delete cascade,
  date date not null,
  -- 1 = lunes … 7 = domingo (ISO). También define el orden dentro de la semana.
  day_of_week smallint not null check (day_of_week between 1 and 7),
  created_at timestamptz not null default now(),
  unique (week_id, date),
  unique (week_id, day_of_week)
);
create index days_week_idx on public.days (week_id);

create table public.workout_blocks (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.days (id) on delete cascade,
  title text not null default '' check (char_length(title) <= 80),
  content text not null default '' check (char_length(content) <= 20000),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index workout_blocks_day_idx on public.workout_blocks (day_id, position);

-- ---------------------------------------------------------------------------
-- Funciones de autorización (security definer para no recursar en RLS)
-- ---------------------------------------------------------------------------
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- ¿Puede el usuario actual ver la programación publicada?
create function public.has_program_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((
    select
      p.role = 'admin'
      or (
        p.access_status = 'active'
        and (p.payment_status = 'paid' or not s.auto_block_unpaid)
      )
    from public.profiles p
    cross join public.app_settings s
    where p.id = (select auth.uid())
  ), false);
$$;

-- Fecha de hoy en la zona horaria del box.
create function public.local_today()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'Europe/Madrid')::date;
$$;

-- ¿Es visible esta semana para el usuario actual?
create function public.can_view_week(w_status public.week_status, w_end date)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    public.is_admin()
    or (
      w_status = 'published'
      and public.has_program_access()
      and (
        (select show_past_weeks from public.app_settings)
        or w_end >= public.local_today()
      )
    );
$$;

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.has_program_access() from public, anon;
revoke execute on function public.can_view_week(public.week_status, date) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.has_program_access() to authenticated;
grant execute on function public.can_view_week(public.week_status, date) to authenticated;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------
create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger weeks_touch before update on public.weeks
  for each row execute function public.touch_updated_at();
create trigger blocks_touch before update on public.workout_blocks
  for each row execute function public.touch_updated_at();
create trigger settings_touch before update on public.app_settings
  for each row execute function public.touch_updated_at();

-- Alta automática del perfil al registrarse. Siempre entra como atleta,
-- pago pendiente y acceso pendiente: nadie accede sin que un admin lo active.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    left(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), 120)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = coalesce(new.email, '') where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- Un usuario puede cambiar su nombre, nada más. Rol, pago, acceso y email
-- solo los cambia un admin (o el propio sistema).
create function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or public.is_admin() then
    return new;
  end if;
  if new.role is distinct from old.role
     or new.payment_status is distinct from old.payment_status
     or new.access_status is distinct from old.access_status
     or new.email is distinct from old.email
     or new.id is distinct from old.id
     or new.created_at is distinct from old.created_at then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profiles_guard before update on public.profiles
  for each row execute function public.guard_profile_update();

-- Mantiene published_at coherente con el estado.
create function public.sync_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and (tg_op = 'INSERT' or old.status <> 'published') then
    new.published_at = now();
  elsif new.status = 'draft' then
    new.published_at = null;
  end if;
  return new;
end;
$$;

create trigger weeks_published_at before insert or update of status on public.weeks
  for each row execute function public.sync_published_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.app_settings enable row level security;
alter table public.weeks enable row level security;
alter table public.days enable row level security;
alter table public.workout_blocks enable row level security;

-- profiles
create policy "profiles: ver el propio o admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profiles: editar el propio o admin" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()))
  with check (id = (select auth.uid()) or (select public.is_admin()));
-- Sin políticas de insert/delete: el alta la hace el trigger y la baja, auth.users.

-- app_settings: cualquiera autenticado lee (necesario para calcular acceso), solo admin escribe.
create policy "settings: leer" on public.app_settings
  for select to authenticated using (true);
create policy "settings: admin escribe" on public.app_settings
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- weeks
create policy "weeks: ver" on public.weeks
  for select to authenticated
  using (public.can_view_week(status, end_date));
create policy "weeks: admin inserta" on public.weeks
  for insert to authenticated with check ((select public.is_admin()));
create policy "weeks: admin edita" on public.weeks
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "weeks: admin borra" on public.weeks
  for delete to authenticated using ((select public.is_admin()));

-- days (visibles si su semana lo es; la subconsulta aplica la RLS de weeks)
create policy "days: ver" on public.days
  for select to authenticated
  using (exists (select 1 from public.weeks w where w.id = week_id));
create policy "days: admin inserta" on public.days
  for insert to authenticated with check ((select public.is_admin()));
create policy "days: admin edita" on public.days
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "days: admin borra" on public.days
  for delete to authenticated using ((select public.is_admin()));

-- workout_blocks
create policy "blocks: ver" on public.workout_blocks
  for select to authenticated
  using (exists (select 1 from public.days d where d.id = day_id));
create policy "blocks: admin inserta" on public.workout_blocks
  for insert to authenticated with check ((select public.is_admin()));
create policy "blocks: admin edita" on public.workout_blocks
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "blocks: admin borra" on public.workout_blocks
  for delete to authenticated using ((select public.is_admin()));

-- El rol anónimo no necesita nada de esto.
revoke all on public.profiles, public.app_settings, public.weeks, public.days, public.workout_blocks from anon;

-- ---------------------------------------------------------------------------
-- Guardado atómico del contenido de una semana desde el editor.
-- payload: [{ "date": "2026-10-12", "blocks": [{ "id": uuid, "title": "", "content": "" }] }]
-- Security invoker: las políticas de admin se aplican igual.
-- ---------------------------------------------------------------------------
create function public.save_week_content(p_week_id uuid, p_days jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_week public.weeks;
  v_day jsonb;
  v_block jsonb;
  v_day_id uuid;
  v_date date;
  v_pos integer;
  v_keep_days uuid[] := '{}';
  v_keep_blocks uuid[] := '{}';
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  select * into v_week from public.weeks where id = p_week_id for update;
  if not found then
    raise exception 'week not found' using errcode = 'P0002';
  end if;

  for v_day in select * from jsonb_array_elements(coalesce(p_days, '[]'::jsonb)) loop
    v_date := (v_day ->> 'date')::date;
    if v_date < v_week.start_date or v_date > v_week.end_date then
      raise exception 'date outside week' using errcode = '22023';
    end if;
    -- Días sin bloques no se guardan.
    if jsonb_array_length(coalesce(v_day -> 'blocks', '[]'::jsonb)) = 0 then
      continue;
    end if;

    insert into public.days (week_id, date, day_of_week)
    values (p_week_id, v_date, extract(isodow from v_date)::smallint)
    on conflict (week_id, date) do update set date = excluded.date
    returning id into v_day_id;
    v_keep_days := v_keep_days || v_day_id;

    v_pos := 0;
    for v_block in select * from jsonb_array_elements(v_day -> 'blocks') loop
      insert into public.workout_blocks (id, day_id, title, content, position)
      values (
        (v_block ->> 'id')::uuid,
        v_day_id,
        left(trim(coalesce(v_block ->> 'title', '')), 80),
        coalesce(v_block ->> 'content', ''),
        v_pos
      )
      on conflict (id) do update
        set day_id = excluded.day_id,
            title = excluded.title,
            content = excluded.content,
            position = excluded.position
        where public.workout_blocks.day_id in (
          select d.id from public.days d where d.week_id = p_week_id
        ) or public.workout_blocks.day_id = excluded.day_id;
      v_keep_blocks := v_keep_blocks || (v_block ->> 'id')::uuid;
      v_pos := v_pos + 1;
    end loop;
  end loop;

  delete from public.workout_blocks b
  using public.days d
  where b.day_id = d.id and d.week_id = p_week_id and not (b.id = any (v_keep_blocks));

  delete from public.days where week_id = p_week_id and not (id = any (v_keep_days));

  update public.weeks set updated_by = (select auth.uid()) where id = p_week_id;
end;
$$;

revoke execute on function public.save_week_content(uuid, jsonb) from public, anon;
grant execute on function public.save_week_content(uuid, jsonb) to authenticated;
