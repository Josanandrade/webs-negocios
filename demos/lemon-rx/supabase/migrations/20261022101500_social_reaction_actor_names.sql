create or replace function public.social_reaction_actor_names(p_user_ids uuid[])
returns table(user_id uuid, full_name text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id as user_id, p.full_name
  from public.profiles p
  where auth.uid() is not null
    and exists (
      select 1
      from public.profiles viewer
      where viewer.id = auth.uid()
        and viewer.access_status = 'active'
    )
    and p.id = any(coalesce(p_user_ids, '{}'::uuid[]))
    and (
      exists (select 1 from public.workout_post_reactions r where r.user_id = p.id)
      or exists (select 1 from public.workout_comment_reactions r where r.user_id = p.id)
    );
$$;

revoke all on function public.social_reaction_actor_names(uuid[]) from public;
grant execute on function public.social_reaction_actor_names(uuid[]) to authenticated;
