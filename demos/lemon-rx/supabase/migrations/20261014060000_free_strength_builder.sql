alter table public.workout_blocks
  add column if not exists builder_sections jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'workout_blocks_builder_sections_array'
      and conrelid = 'public.workout_blocks'::regclass
  ) then
    alter table public.workout_blocks
      add constraint workout_blocks_builder_sections_array
      check (builder_sections is null or jsonb_typeof(builder_sections) = 'array');
  end if;
end
$$;
