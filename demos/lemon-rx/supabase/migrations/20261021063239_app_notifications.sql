create table public.app_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  kind text not null check (kind in ('system','post_reaction','comment','reply','comment_reaction')),
  post_id uuid references public.workout_posts(id) on delete cascade,
  comment_id uuid references public.workout_post_comments(id) on delete cascade,
  emoji text,
  title text not null check (char_length(title) between 1 and 160),
  body text not null default '' check (char_length(body) <= 500),
  href text not null default '/home' check (href ~ '^/'),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index app_notifications_recipient_created_idx on public.app_notifications(recipient_id, created_at desc);
create index app_notifications_recipient_unread_idx on public.app_notifications(recipient_id, created_at desc) where read_at is null;
alter table public.app_notifications enable row level security;
revoke all on public.app_notifications from anon, authenticated;
grant select on public.app_notifications to authenticated;
grant update (read_at) on public.app_notifications to authenticated;
create policy "notifications: leer propias" on public.app_notifications for select to authenticated using ((select auth.uid()) = recipient_id);
create policy "notifications: marcar propias" on public.app_notifications for update to authenticated using ((select auth.uid()) = recipient_id) with check ((select auth.uid()) = recipient_id);
