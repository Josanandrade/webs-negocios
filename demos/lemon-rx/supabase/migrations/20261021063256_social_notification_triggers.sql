create or replace function private.social_notification_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid;
  v_actor_name text;
  v_owner uuid;
  v_parent_author uuid;
  v_post uuid;
  v_body text;
begin
  if tg_table_name = 'workout_post_reactions' then
    v_actor := coalesce(new.user_id, old.user_id);
    v_post := coalesce(new.post_id, old.post_id);
    select p.user_id into v_owner from public.workout_posts p where p.id = v_post;
    if tg_op = 'DELETE' then
      delete from public.app_notifications where recipient_id = v_owner and actor_id = v_actor and kind = 'post_reaction' and post_id = v_post and emoji = old.emoji;
      return old;
    end if;
    if v_owner is null or v_owner = v_actor then return new; end if;
    select coalesce(nullif(btrim(full_name), ''), 'Un compañero') into v_actor_name from public.profiles where id = v_actor;
    insert into public.app_notifications(recipient_id, actor_id, kind, post_id, emoji, title, body, href)
    values (v_owner, v_actor, 'post_reaction', v_post, new.emoji, coalesce(v_actor_name, 'Un compañero') || ' ha reaccionado ' || new.emoji, 'Ha reaccionado a tu entrenamiento.', '/home?post=' || v_post::text || '#post-' || v_post::text);
    return new;
  end if;

  if tg_table_name = 'workout_post_comments' then
    v_actor := new.user_id;
    v_post := new.post_id;
    v_body := left(new.body, 180);
    select p.user_id into v_owner from public.workout_posts p where p.id = v_post;
    select coalesce(nullif(btrim(full_name), ''), 'Un compañero') into v_actor_name from public.profiles where id = v_actor;
    if v_owner is not null and v_owner <> v_actor then
      insert into public.app_notifications(recipient_id, actor_id, kind, post_id, comment_id, title, body, href)
      values (v_owner, v_actor, case when new.parent_comment_id is null then 'comment' else 'reply' end, v_post, new.id, coalesce(v_actor_name, 'Un compañero') || case when new.parent_comment_id is null then ' ha comentado tu entrenamiento' else ' ha respondido en tu entrenamiento' end, v_body, '/home?post=' || v_post::text || '#post-' || v_post::text);
    end if;
    if new.parent_comment_id is not null then
      select c.user_id into v_parent_author from public.workout_post_comments c where c.id = new.parent_comment_id;
      if v_parent_author is not null and v_parent_author <> v_actor and v_parent_author is distinct from v_owner then
        insert into public.app_notifications(recipient_id, actor_id, kind, post_id, comment_id, title, body, href)
        values (v_parent_author, v_actor, 'reply', v_post, new.id, coalesce(v_actor_name, 'Un compañero') || ' ha respondido a tu comentario', v_body, '/home?post=' || v_post::text || '#post-' || v_post::text);
      end if;
    end if;
    return new;
  end if;

  if tg_table_name = 'workout_comment_reactions' then
    v_actor := coalesce(new.user_id, old.user_id);
    select c.user_id, c.post_id into v_owner, v_post from public.workout_post_comments c where c.id = coalesce(new.comment_id, old.comment_id);
    if tg_op = 'DELETE' then
      delete from public.app_notifications where recipient_id = v_owner and actor_id = v_actor and kind = 'comment_reaction' and comment_id = old.comment_id and emoji = old.emoji;
      return old;
    end if;
    if v_owner is null or v_owner = v_actor then return new; end if;
    select coalesce(nullif(btrim(full_name), ''), 'Un compañero') into v_actor_name from public.profiles where id = v_actor;
    insert into public.app_notifications(recipient_id, actor_id, kind, post_id, comment_id, emoji, title, body, href)
    values (v_owner, v_actor, 'comment_reaction', v_post, new.comment_id, new.emoji, coalesce(v_actor_name, 'Un compañero') || ' ha reaccionado ' || new.emoji || ' a tu comentario', 'Ha reaccionado a un comentario que dejaste en Home.', '/home?post=' || v_post::text || '#post-' || v_post::text);
    return new;
  end if;
  return coalesce(new, old);
end;
$$;
revoke all on function private.social_notification_activity() from public, anon, authenticated;
create trigger social_notification_post_reaction after insert or delete on public.workout_post_reactions for each row execute function private.social_notification_activity();
create trigger social_notification_comment after insert on public.workout_post_comments for each row execute function private.social_notification_activity();
create trigger social_notification_comment_reaction after insert or delete on public.workout_comment_reactions for each row execute function private.social_notification_activity();
