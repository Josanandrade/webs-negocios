-- 0001_init.sql — Esquema base: usuarios, documentos, estructura, preguntas, tests y jobs.
--
-- Principios:
--   * Todas las tablas con datos de usuario llevan user_id y RLS FORZADA.
--   * La API se conecta con un rol sin BYPASSRLS que pertenece a "banco_app".
--   * FKs compuestas (id, user_id) / (id, document_id) impiden mezclar datos
--     de usuarios o citar páginas de otro documento.
--   * Las invariantes de una pregunta (4 opciones, 1 correcta, >=1 evidencia)
--     se comprueban con un trigger de restricción DIFERIDO (al hacer COMMIT).

create extension if not exists pgcrypto;
create extension if not exists vector;
create extension if not exists unaccent;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'banco_app') then
    create role banco_app nologin;
  end if;
end$$;

create schema if not exists app;
grant usage on schema app to banco_app;

-- Usuario efectivo de la transacción (lo fija la API / el worker con set_config).
create or replace function app.current_user_id() returns uuid
language sql stable as $$
  select nullif(current_setting('app.user_id', true), '')::uuid
$$;

-- Configuración de búsqueda en español sin acentos.
do $$
begin
  if not exists (select 1 from pg_ts_config where cfgname = 'es_unaccent') then
    create text search configuration public.es_unaccent (copy = pg_catalog.spanish);
    alter text search configuration public.es_unaccent
      alter mapping for hword, hword_part, word with unaccent, spanish_stem;
  end if;
end$$;

create or replace function app.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

-- ---------------------------------------------------------------- users
create table users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  password_hash text not null,
  display_name  text,
  created_at    timestamptz not null default now(),
  constraint users_email_lower check (email = lower(btrim(email)) and email like '%_@_%')
);
create unique index users_email_key on users (email);

-- ------------------------------------------------------------ documents
create table documents (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references users(id) on delete cascade,
  title             text not null,
  original_filename text not null,
  mime_type         text not null check (mime_type in (
                      'application/pdf',
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document')),
  size_bytes        bigint not null check (size_bytes > 0),
  sha256            text not null check (sha256 ~ '^[0-9a-f]{64}$'),
  storage_key       text not null,
  status            text not null default 'uploaded'
                      check (status in ('uploaded', 'processing', 'ready', 'error')),
  page_count        int check (page_count >= 0),
  text_layer        text check (text_layer in ('native', 'partial', 'scanned')),
  stats             jsonb not null default '{}'::jsonb,
  error             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, sha256)
);
create index documents_user_idx on documents (user_id, created_at desc);
create trigger documents_updated_at before update on documents
  for each row execute function app.set_updated_at();

-- ------------------------------------------------------- document_pages
create table document_pages (
  id                uuid primary key default gen_random_uuid(),
  document_id       uuid not null,
  user_id           uuid not null,
  page_number       int not null check (page_number >= 1),
  text              text not null default '',
  char_count        int not null default 0,
  extraction_method text not null check (extraction_method in ('native', 'ocr')),
  ocr_confidence    real check (ocr_confidence between 0 and 100),
  quality_score     real not null default 0 check (quality_score between 0 and 1),
  is_eligible       boolean not null default false,
  quality_flags     text[] not null default '{}',
  created_at        timestamptz not null default now(),
  foreign key (document_id, user_id) references documents(id, user_id) on delete cascade,
  unique (document_id, page_number),
  unique (id, document_id)
);

-- ---------------------------------------------------- document_sections
create table document_sections (
  id          uuid primary key default gen_random_uuid(),
  document_id uuid not null,
  user_id     uuid not null,
  parent_id   uuid,
  level       int not null check (level >= 0),
  ordinal     int not null check (ordinal >= 0),
  title       text not null,
  start_page  int not null check (start_page >= 1),
  end_page    int not null,
  source      text not null check (source in ('outline', 'heuristic', 'manual', 'whole')),
  created_at  timestamptz not null default now(),
  check (end_page >= start_page),
  foreign key (document_id, user_id) references documents(id, user_id) on delete cascade,
  unique (id, document_id),
  unique (document_id, ordinal),
  foreign key (parent_id, document_id) references document_sections(id, document_id) on delete cascade
);

-- ------------------------------------------------------ document_chunks
create table document_chunks (
  id                uuid primary key default gen_random_uuid(),
  document_id       uuid not null,
  user_id           uuid not null,
  section_id        uuid,
  ordinal           int not null check (ordinal >= 0),
  text              text not null check (length(text) > 0),
  context_header    text not null default '',
  page_start        int not null check (page_start >= 1),
  page_end          int not null,
  -- [{ "page": 12, "start": 340, "end": 1210 }, ...] sobre document_pages.text
  spans             jsonb not null check (jsonb_typeof(spans) = 'array' and jsonb_array_length(spans) > 0),
  token_estimate    int not null default 0,
  is_eligible       boolean not null default true,
  ineligible_reason text,
  tsv               tsvector generated always as (to_tsvector('public.es_unaccent', text)) stored,
  created_at        timestamptz not null default now(),
  check (page_end >= page_start),
  foreign key (document_id, user_id) references documents(id, user_id) on delete cascade,
  foreign key (section_id, document_id) references document_sections(id, document_id) on delete set null (section_id),
  unique (id, document_id),
  unique (document_id, ordinal)
);
create index document_chunks_tsv_idx on document_chunks using gin (tsv);
create index document_chunks_section_idx on document_chunks (section_id);

-- ------------------------------------------------------------ questions
create table questions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null,
  document_id   uuid not null,
  section_id    uuid,
  seq           int not null,
  stem          text not null check (length(btrim(stem)) >= 10),
  question_type text not null check (question_type in (
                  'definition', 'characteristic', 'classification', 'relation',
                  'datum', 'procedure', 'exception')),
  difficulty    text not null check (difficulty in ('easy', 'medium', 'hard')),
  status        text not null default 'generated' check (status in (
                  'generated', 'auto_validated', 'manually_reviewed', 'discarded')),
  explanation   text,
  confidence    real check (confidence between 0 and 1),
  tags          text[] not null default '{}',
  fingerprint   text not null,
  generation    jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  reviewed_at   timestamptz,
  foreign key (document_id, user_id) references documents(id, user_id) on delete cascade,
  foreign key (section_id, document_id) references document_sections(id, document_id) on delete set null (section_id),
  unique (user_id, seq),
  unique (id, user_id),
  unique (id, document_id)
);
create index questions_doc_idx on questions (document_id, status);
create index questions_fingerprint_idx on questions (user_id, fingerprint);
create trigger questions_updated_at before update on questions
  for each row execute function app.set_updated_at();

-- Número correlativo por usuario ("Pregunta 127").
create or replace function app.assign_question_seq() returns trigger
language plpgsql as $$
begin
  if new.seq is null then
    perform pg_advisory_xact_lock(hashtext('question_seq:' || new.user_id::text));
    select coalesce(max(seq), 0) + 1 into new.seq from questions where user_id = new.user_id;
  end if;
  return new;
end$$;
create trigger questions_seq before insert on questions
  for each row execute function app.assign_question_seq();

create table question_options (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null,
  user_id     uuid not null,
  label       char(1) not null check (label in ('A', 'B', 'C', 'D')),
  text        text not null check (length(btrim(text)) > 0),
  is_correct  boolean not null,
  foreign key (question_id, user_id) references questions(id, user_id) on delete cascade,
  unique (question_id, label),
  unique (id, question_id)
);
-- Nunca dos opciones iguales (sin distinguir mayúsculas/espacios) en la misma pregunta.
create unique index question_options_text_key
  on question_options (question_id, lower(regexp_replace(btrim(text), '\s+', ' ', 'g')));
-- Como mucho una correcta (el trigger diferido exige exactamente una).
create unique index question_options_one_correct
  on question_options (question_id) where is_correct;

create table question_sources (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null,
  user_id     uuid not null,
  document_id uuid not null,
  option_id   uuid,
  role        text not null check (role in ('answer', 'distractor', 'context')),
  page_id     uuid not null,
  page_number int not null check (page_number >= 1),
  chunk_id    uuid,
  quote       text not null check (length(btrim(quote)) > 0),
  char_start  int check (char_start >= 0),
  char_end    int,
  created_at  timestamptz not null default now(),
  check (char_end is null or char_end > char_start),
  check (role <> 'distractor' or option_id is not null),
  foreign key (question_id, user_id) references questions(id, user_id) on delete cascade,
  -- La página citada debe pertenecer al documento de la pregunta.
  foreign key (question_id, document_id) references questions(id, document_id) on delete cascade,
  foreign key (page_id, document_id) references document_pages(id, document_id) on delete cascade,
  foreign key (chunk_id, document_id) references document_chunks(id, document_id) on delete set null (chunk_id),
  foreign key (option_id, question_id) references question_options(id, question_id) on delete cascade
);
create index question_sources_question_idx on question_sources (question_id);

-- El número de página guardado debe coincidir con la página referenciada.
create or replace function app.check_source_page() returns trigger
language plpgsql as $$
declare
  real_page int;
begin
  select page_number into real_page from document_pages where id = new.page_id;
  if real_page is distinct from new.page_number then
    raise exception 'page_number % no corresponde a la página referenciada (%)', new.page_number, real_page
      using errcode = '23514';
  end if;
  return new;
end$$;
create trigger question_sources_page before insert or update on question_sources
  for each row execute function app.check_source_page();

-- Invariantes de una pregunta, comprobadas al final de la transacción.
create or replace function app.check_question_integrity() returns trigger
language plpgsql as $$
declare
  qid uuid;
  n_options int;
  n_correct int;
  n_answer_sources int;
begin
  if tg_table_name = 'questions' then
    qid := case when tg_op = 'DELETE' then old.id else new.id end;
  else
    qid := case when tg_op = 'DELETE' then old.question_id else new.question_id end;
  end if;

  if not exists (select 1 from questions where id = qid) then
    return null;  -- la pregunta se ha borrado: nada que comprobar
  end if;

  select count(*), count(*) filter (where is_correct)
    into n_options, n_correct
    from question_options where question_id = qid;
  if n_options <> 4 then
    raise exception 'La pregunta % debe tener exactamente 4 opciones (tiene %)', qid, n_options
      using errcode = '23514';
  end if;
  if n_correct <> 1 then
    raise exception 'La pregunta % debe tener exactamente 1 respuesta correcta (tiene %)', qid, n_correct
      using errcode = '23514';
  end if;

  select count(*) into n_answer_sources
    from question_sources where question_id = qid and role = 'answer';
  if n_answer_sources < 1 then
    raise exception 'La pregunta % no tiene evidencia de la respuesta correcta', qid
      using errcode = '23514';
  end if;
  return null;
end$$;

create constraint trigger questions_integrity
  after insert or update on questions
  deferrable initially deferred for each row execute function app.check_question_integrity();
create constraint trigger question_options_integrity
  after insert or update or delete on question_options
  deferrable initially deferred for each row execute function app.check_question_integrity();
create constraint trigger question_sources_integrity
  after insert or update or delete on question_sources
  deferrable initially deferred for each row execute function app.check_question_integrity();

-- -------------------------------------------------------------- quizzes
-- Tests realizados por el alumno ("quizzes" para no confundir con tests de código).
create table quizzes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  config      jsonb not null default '{}'::jsonb,
  status      text not null default 'in_progress' check (status in ('in_progress', 'finished', 'abandoned')),
  total       int not null default 0,
  correct     int,
  wrong       int,
  blank       int,
  score       real,
  started_at  timestamptz not null default now(),
  finished_at timestamptz,
  unique (id, user_id)
);

create table quiz_questions (
  id             uuid primary key default gen_random_uuid(),
  quiz_id        uuid not null,
  user_id        uuid not null,
  question_id    uuid,
  ordinal        int not null check (ordinal >= 1),
  -- Copia inmutable de la pregunta en el momento del test (enunciado, opciones,
  -- correcta, sección, páginas) para que el historial no cambie si se edita.
  snapshot       jsonb not null,
  selected_label char(1) check (selected_label in ('A', 'B', 'C', 'D')),
  is_correct     boolean,
  answered_at    timestamptz,
  foreign key (quiz_id, user_id) references quizzes(id, user_id) on delete cascade,
  foreign key (question_id, user_id) references questions(id, user_id) on delete set null (question_id),
  unique (quiz_id, ordinal)
);
create index quiz_questions_question_idx on quiz_questions (question_id);

-- ------------------------------------------------------ processing_jobs
create table processing_jobs (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id) on delete cascade,
  document_id      uuid,
  kind             text not null check (kind in ('ingest', 'generate')),
  status           text not null default 'pending'
                     check (status in ('pending', 'running', 'succeeded', 'failed', 'cancelled')),
  stage            text not null default 'pending',
  progress_current int not null default 0,
  progress_total   int not null default 0,
  message          text,
  payload          jsonb not null default '{}'::jsonb,
  checkpoint       jsonb not null default '{}'::jsonb,
  attempts         int not null default 0,
  max_attempts     int not null default 3,
  locked_by        text,
  lease_expires_at timestamptz,
  last_error       text,
  run_after        timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  started_at       timestamptz,
  finished_at      timestamptz,
  updated_at       timestamptz not null default now(),
  foreign key (document_id, user_id) references documents(id, user_id) on delete cascade
);
create index processing_jobs_claim_idx on processing_jobs (status, run_after) where status in ('pending', 'running');
create index processing_jobs_doc_idx on processing_jobs (document_id, created_at desc);
create trigger processing_jobs_updated_at before update on processing_jobs
  for each row execute function app.set_updated_at();

-- ------------------------------------------------------------------ RLS
do $$
declare
  t text;
begin
  foreach t in array array[
    'documents', 'document_pages', 'document_sections', 'document_chunks',
    'questions', 'question_options', 'question_sources',
    'quizzes', 'quiz_questions', 'processing_jobs'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('alter table %I force row level security', t);
    execute format(
      'create policy %I on %I for all using (user_id = app.current_user_id()) with check (user_id = app.current_user_id())',
      t || '_owner', t);
    execute format('grant select, insert, update, delete on %I to banco_app', t);
  end loop;
end$$;

alter table users enable row level security;
alter table users force row level security;
create policy users_self on users for all
  using (id = app.current_user_id()) with check (id = app.current_user_id());
grant select, update on users to banco_app;

-- Alta e inicio de sesión: necesitan operar antes de conocer al usuario.
-- Funciones SECURITY DEFINER mínimas y con search_path fijo.
create or replace function app.register_user(p_email text, p_password_hash text, p_display_name text)
returns uuid
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  new_id uuid;
begin
  insert into users (email, password_hash, display_name)
  values (lower(btrim(p_email)), p_password_hash, p_display_name)
  returning id into new_id;
  return new_id;
end$$;

create or replace function app.lookup_user_for_login(p_email text)
returns table (id uuid, password_hash text)
language sql stable security definer set search_path = public, pg_temp as $$
  select u.id, u.password_hash from users u where u.email = lower(btrim(p_email))
$$;

-- El worker reclama trabajos de cualquier usuario y después actúa con RLS como
-- el dueño del trabajo. Esta es la única vía con visibilidad global.
create or replace function app.claim_job(p_worker text, p_lease_seconds int)
returns table (job_id uuid, job_user_id uuid)
language plpgsql security definer set search_path = public, pg_temp as $$
begin
  return query
  with candidate as (
    select j.id from processing_jobs j
    where (
        (j.status = 'pending' and j.run_after <= now())
        or (j.status = 'running' and j.lease_expires_at < now())   -- worker caído
      )
      and j.attempts < j.max_attempts
    order by j.created_at
    for update skip locked
    limit 1
  )
  update processing_jobs j
     set status = 'running',
         locked_by = p_worker,
         lease_expires_at = now() + make_interval(secs => p_lease_seconds),
         attempts = j.attempts + 1,
         started_at = coalesce(j.started_at, now())
    from candidate c
   where j.id = c.id
  returning j.id, j.user_id;
end$$;

-- Trabajos cuyo worker murió y ya agotaron los intentos: se marcan como fallidos.
create or replace function app.fail_exhausted_jobs()
returns int
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  n int;
begin
  update processing_jobs
     set status = 'failed',
         finished_at = now(),
         locked_by = null,
         last_error = coalesce(last_error, 'Se agotaron los reintentos tras interrupciones del worker')
   where status = 'running' and lease_expires_at < now() and attempts >= max_attempts;
  get diagnostics n = row_count;
  return n;
end$$;

revoke all on function app.register_user(text, text, text) from public;
revoke all on function app.lookup_user_for_login(text) from public;
revoke all on function app.claim_job(text, int) from public;
revoke all on function app.fail_exhausted_jobs() from public;
grant execute on function app.register_user(text, text, text) to banco_app;
grant execute on function app.lookup_user_for_login(text) to banco_app;
grant execute on function app.claim_job(text, int) to banco_app;
grant execute on function app.fail_exhausted_jobs() to banco_app;
grant execute on function app.current_user_id() to banco_app;
