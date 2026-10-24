create or replace function public.home_comment_previews(p_post_ids uuid[])
returns table(
  post_id uuid,
  comment_count bigint,
  root_count bigint,
  id uuid,
  user_id uuid,
  parent_comment_id uuid,
  author_name text,
  author_avatar_url text,
  body text,
  created_at timestamptz,
  reactions jsonb
)
language sql
stable
security invoker
set search_path = ''
as $$
  with stats as (
    select
      c.post_id,
      count(*)::bigint as comment_count,
      count(*) filter (where c.parent_comment_id is null)::bigint as root_count
    from public.workout_post_comments c
    where c.post_id = any(coalesce(p_post_ids, '{}'::uuid[]))
    group by c.post_id
  ),
  root_activity as (
    select
      root.post_id,
      root.id as root_id,
      greatest(root.created_at, coalesce(max(reply.created_at), root.created_at)) as thread_at
    from public.workout_post_comments root
    left join public.workout_post_comments reply on reply.parent_comment_id = root.id
    where root.parent_comment_id is null
      and root.post_id = any(coalesce(p_post_ids, '{}'::uuid[]))
    group by root.post_id, root.id, root.created_at
  ),
  latest_roots as (
    select distinct on (ra.post_id)
      ra.post_id,
      ra.root_id
    from root_activity ra
    order by ra.post_id, ra.thread_at desc, ra.root_id desc
  )
  select
    c.post_id,
    s.comment_count,
    s.root_count,
    c.id,
    c.user_id,
    c.parent_comment_id,
    c.author_name,
    c.author_avatar_url,
    c.body,
    c.created_at,
    coalesce(
      jsonb_agg(jsonb_build_object('user_id', r.user_id, 'emoji', r.emoji))
        filter (where r.user_id is not null),
      '[]'::jsonb
    ) as reactions
  from latest_roots lr
  join stats s on s.post_id = lr.post_id
  join public.workout_post_comments c
    on c.id = lr.root_id or c.parent_comment_id = lr.root_id
  left join public.workout_comment_reactions r on r.comment_id = c.id
  group by
    c.post_id, s.comment_count, s.root_count, c.id, c.user_id,
    c.parent_comment_id, c.author_name, c.author_avatar_url, c.body, c.created_at
  order by c.post_id, (c.parent_comment_id is not null), c.created_at asc;
$$;

revoke all on function public.home_comment_previews(uuid[]) from public;
revoke all on function public.home_comment_previews(uuid[]) from anon;
grant execute on function public.home_comment_previews(uuid[]) to authenticated;
