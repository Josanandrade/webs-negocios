-- Home social de Lemon RX.
-- Proyecta únicamente los datos necesarios para la comunidad y mantiene
-- privados los block_logs/block_results originales.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.workout_posts (
  id uuid primary key default gen_random_uuid(),
  program_key text not null default 'lemon-rx' check (program_key = 'lemon-rx'),
  user_id uuid not null references public.profiles(id) on delete cascade,
  training_date date not null,
  athlete_name text not null,
  athlete_avatar_url text,
  first_completed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (program_key, user_id, training_date)
);

create table public.workout_post_blocks (
  post_id uuid not null references public.workout_posts(id) on delete cascade,
  block_id uuid not null references public.workout_blocks(id) on delete cascade,
  block_title text not null,
  block_score_type public.score_type not null default 'none',
  block_position integer not null default 0,
  completed_at timestamptz not null default now(),
  note text not null default '' check (char_length(note) <= 2000),
  result jsonb,
  primary key (post_id, block_id)
);

create table public.workout_post_reactions (
  post_id uuid not null references public.workout_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null check (emoji in ('👍','❤️','🔥','💪','👏','😂')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id, emoji)
);

create table public.workout_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.workout_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid,
  author_name text not null default '',
  author_avatar_url text,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, post_id),
  foreign key (parent_comment_id, post_id)
    references public.workout_post_comments(id, post_id)
    on delete cascade
);

create table public.workout_comment_reactions (
  comment_id uuid not null references public.workout_post_comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null check (emoji in ('👍','❤️','🔥','💪','👏','😂')),
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id, emoji)
);

create index workout_posts_updated_at_idx on public.workout_posts(updated_at desc);
create index workout_posts_training_date_idx on public.workout_posts(training_date desc);
create index workout_post_comments_post_created_idx on public.workout_post_comments(post_id, created_at);
create index workout_post_reactions_post_idx on public.workout_post_reactions(post_id);
create index workout_comment_reactions_comment_idx on public.workout_comment_reactions(comment_id);

alter table public.workout_posts enable row level security;
alter table public.workout_post_blocks enable row level security;
alter table public.workout_post_reactions enable row level security;
alter table public.workout_post_comments enable row level security;
alter table public.workout_comment_reactions enable row level security;

revoke all on public.workout_posts from anon, authenticated;
revoke all on public.workout_post_blocks from anon, authenticated;
revoke all on public.workout_post_reactions from anon, authenticated;
revoke all on public.workout_post_comments from anon, authenticated;
revoke all on public.workout_comment_reactions from anon, authenticated;

grant select on public.workout_posts to authenticated;
grant select on public.workout_post_blocks to authenticated;
grant select, insert, delete on public.workout_post_reactions to authenticated;
grant select, insert, delete on public.workout_post_comments to authenticated;
grant select, insert, delete on public.workout_comment_reactions to authenticated;

create policy "social posts: miembros leen"
on public.workout_posts for select to authenticated
using ((select public.has_program_access()));

create policy "social blocks: miembros leen"
on public.workout_post_blocks for select to authenticated
using ((select public.has_program_access()));

create policy "social post reactions: miembros leen"
on public.workout_post_reactions for select to authenticated
using ((select public.has_program_access()));

create policy "social post reactions: crear propias"
on public.workout_post_reactions for insert to authenticated
with check (
  user_id = (select auth.uid())
  and (select public.has_program_access())
  and exists (select 1 from public.workout_posts p where p.id = post_id)
);

create policy "social post reactions: borrar propias"
on public.workout_post_reactions for delete to authenticated
using (user_id = (select auth.uid()));

create policy "social comments: miembros leen"
on public.workout_post_comments for select to authenticated
using ((select public.has_program_access()));

create policy "social comments: crear propios"
on public.workout_post_comments for insert to authenticated
with check (
  user_id = (select auth.uid())
  and (select public.has_program_access())
  and exists (select 1 from public.workout_posts p where p.id = post_id)
);

create policy "social comments: borrar propios"
on public.workout_post_comments for delete to authenticated
using (user_id = (select auth.uid()));

create policy "social comment reactions: miembros leen"
on public.workout_comment_reactions for select to authenticated
using ((select public.has_program_access()));

create policy "social comment reactions: crear propias"
on public.workout_comment_reactions for insert to authenticated
with check (
  user_id = (select auth.uid())
  and (select public.has_program_access())
  and exists (
    select 1 from public.workout_post_comments c
    where c.id = comment_id
  )
);

create policy "social comment reactions: borrar propias"
on public.workout_comment_reactions for delete to authenticated
using (user_id = (select auth.uid()));

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

      if not exists (select 1 from public.workout_post_blocks where post_id = v_post_id) then
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

create or replace function private.sync_social_from_log()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.sync_workout_social(coalesce(new.user_id, old.user_id), coalesce(new.block_id, old.block_id));
  return coalesce(new, old);
end;
$$;

create or replace function private.sync_social_from_result()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.sync_workout_social(coalesce(new.user_id, old.user_id), coalesce(new.block_id, old.block_id));
  return coalesce(new, old);
end;
$$;

create or replace function private.fill_social_comment_author()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
begin
  if v_actor is null or new.user_id <> v_actor then
    raise exception 'not allowed';
  end if;
  select coalesce(p.full_name, 'Sin nombre'), p.avatar_url
    into new.author_name, new.author_avatar_url
  from public.profiles p
  where p.id = new.user_id;
  new.updated_at := now();
  return new;
end;
$$;

create or replace function private.sync_social_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
begin
  if v_actor is not null and new.id <> v_actor and not public.is_admin() then
    raise exception 'not allowed';
  end if;
  update public.workout_posts
     set athlete_name = coalesce(new.full_name, 'Sin nombre'),
         athlete_avatar_url = new.avatar_url
   where user_id = new.id;
  update public.workout_post_comments
     set author_name = coalesce(new.full_name, 'Sin nombre'),
         author_avatar_url = new.avatar_url
   where user_id = new.id;
  return new;
end;
$$;

revoke all on function private.sync_workout_social(uuid, uuid) from public, anon, authenticated;
revoke all on function private.sync_social_from_log() from public, anon, authenticated;
revoke all on function private.sync_social_from_result() from public, anon, authenticated;
revoke all on function private.fill_social_comment_author() from public, anon, authenticated;
revoke all on function private.sync_social_profile() from public, anon, authenticated;

create trigger sync_workout_social_from_log
after insert or update or delete on public.block_logs
for each row execute function private.sync_social_from_log();

create trigger sync_workout_social_from_result
after insert or update or delete on public.block_results
for each row execute function private.sync_social_from_result();

create trigger fill_workout_social_comment_author
before insert on public.workout_post_comments
for each row execute function private.fill_social_comment_author();

create trigger sync_workout_social_profile
after update of full_name, avatar_url on public.profiles
for each row execute function private.sync_social_profile();

-- Backfill de entrenamientos ya marcados como hechos para que Home nazca con historial.
insert into public.workout_posts (
  program_key, user_id, training_date, athlete_name, athlete_avatar_url,
  first_completed_at, updated_at
)
select 'lemon-rx', l.user_id, d.date, coalesce(p.full_name, 'Sin nombre'), p.avatar_url,
       min(coalesce(l.updated_at, l.created_at)), max(coalesce(l.updated_at, l.created_at))
from public.block_logs l
join public.workout_blocks b on b.id = l.block_id
join public.days d on d.id = b.day_id
join public.profiles p on p.id = l.user_id
where l.done = true
group by l.user_id, d.date, p.full_name, p.avatar_url
on conflict (program_key, user_id, training_date) do nothing;

insert into public.workout_post_blocks (
  post_id, block_id, block_title, block_score_type, block_position,
  completed_at, note, result
)
select wp.id, b.id, coalesce(b.title, 'Bloque'), b.score_type, b.position,
       coalesce(l.updated_at, l.created_at), coalesce(l.note, ''),
       case when r.user_id is null then null else jsonb_strip_nulls(jsonb_build_object(
         'division', r.division::text,
         'seconds', r.seconds,
         'capped', r.capped,
         'rounds', r.rounds,
         'reps', r.reps,
         'kg', r.kg,
         'total_load', r.total_load,
         'as_prescribed', r.as_prescribed,
         'reps_detail', r.reps_detail
       )) end
from public.block_logs l
join public.workout_blocks b on b.id = l.block_id
join public.days d on d.id = b.day_id
join public.workout_posts wp
  on wp.program_key = 'lemon-rx'
 and wp.user_id = l.user_id
 and wp.training_date = d.date
left join public.block_results r on r.user_id = l.user_id and r.block_id = l.block_id
where l.done = true
on conflict (post_id, block_id) do update
set block_title = excluded.block_title,
    block_score_type = excluded.block_score_type,
    block_position = excluded.block_position,
    note = excluded.note,
    result = excluded.result;
