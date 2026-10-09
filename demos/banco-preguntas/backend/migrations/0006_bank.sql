-- 0006: banco de preguntas — edición manual auditada y búsqueda.
alter table questions add column edited_at timestamptz;
alter table questions add column history jsonb not null default '[]'::jsonb;  -- cambios manuales
create index questions_tags_idx on questions using gin (tags);
create index questions_user_filters_idx on questions (user_id, document_id, status, difficulty);

-- Plegado sin acentos/mayúsculas para búsquedas (inmutable para poder indexarse).
create or replace function app.fold(t text) returns text
language sql immutable parallel safe as $$ select lower(public.unaccent('public.unaccent', coalesce(t, ''))) $$;
grant execute on function app.fold(text) to banco_app;
