-- Lemon RX: campos estructurados para bloques de fuerza / weightlifting.
alter table public.workout_blocks
  add column if not exists sets_count smallint
    check (sets_count is null or sets_count between 1 and 50),
  add column if not exists reps_per_set smallint
    check (reps_per_set is null or reps_per_set between 1 and 1000);

-- La función save_week_content del proyecto de producción se actualiza en la
-- migración aplicada en Supabase para leer y persistir ambos campos en bloques
-- de tipo load. Este archivo conserva la parte de esquema en el repositorio.
