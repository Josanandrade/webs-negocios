create or replace function public.save_push_subscription(p_endpoint text, p_p256dh text, p_auth text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.has_program_access() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if p_endpoint !~ '^https://' or length(p_endpoint) > 1000 or coalesce(p_p256dh, '') = '' or coalesce(p_auth, '') = '' then
    raise exception 'invalid subscription' using errcode = '22023';
  end if;
  insert into public.push_subscriptions (endpoint, user_id, p256dh, auth)
  values (p_endpoint, auth.uid(), p_p256dh, p_auth)
  on conflict (endpoint) do update set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth;
end;
$$;
revoke all on function public.save_push_subscription(text, text, text) from public, anon;
grant execute on function public.save_push_subscription(text, text, text) to authenticated;

create or replace function public.user_push_targets(p_recipient uuid, p_token text)
returns table(endpoint text, p256dh text, auth text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.check_push_token(p_token);
  return query
    select s.endpoint, s.p256dh, s.auth
      from public.push_subscriptions s
      join public.profiles p on p.id = s.user_id
     where s.user_id = p_recipient and p.access_status = 'active';
end;
$$;
revoke all on function public.user_push_targets(uuid, text) from public;
grant execute on function public.user_push_targets(uuid, text) to anon, authenticated;
