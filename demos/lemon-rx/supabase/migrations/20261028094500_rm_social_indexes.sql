create index if not exists user_rm_history_user_movement_id_idx
  on public.user_rm_history(user_id, movement_id, id desc);
create index if not exists user_rm_history_source_block_idx
  on public.user_rm_history(source_block_id)
  where source_block_id is not null;
create index if not exists workout_post_achievements_history_idx
  on public.workout_post_achievements(history_id);
create index if not exists workout_post_achievements_movement_idx
  on public.workout_post_achievements(movement_id);
