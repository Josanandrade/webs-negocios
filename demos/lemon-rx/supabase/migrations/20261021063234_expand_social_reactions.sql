alter table public.workout_post_reactions drop constraint workout_post_reactions_emoji_check;
alter table public.workout_post_reactions add constraint workout_post_reactions_emoji_check check (emoji = any (array['👍','❤️','🔥','💪','👏','😂','🍆','🍑','💦','🔩','🦍','🍼','🛴','😍']::text[]));
alter table public.workout_comment_reactions drop constraint workout_comment_reactions_emoji_check;
alter table public.workout_comment_reactions add constraint workout_comment_reactions_emoji_check check (emoji = any (array['👍','❤️','🔥','💪','👏','😂','🍆','🍑','💦','🔩','🦍','🍼','🛴','😍']::text[]));
