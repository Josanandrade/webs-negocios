-- 0004: contabilidad de llamadas a IA, hechos verificados y job de extracción de hechos.

alter table processing_jobs drop constraint processing_jobs_kind_check;
alter table processing_jobs add constraint processing_jobs_kind_check
  check (kind in ('ingest', 'extract_facts', 'generate'));

-- Estado de la extracción de hechos por fragmento (permite reanudar).
alter table document_chunks add column facts_status text not null default 'pending'
  check (facts_status in ('pending', 'done', 'skipped'));

create table llm_calls (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  job_id        uuid references processing_jobs(id) on delete set null,
  task          text not null check (task in ('extraction', 'generation', 'verification')),
  provider      text not null,
  model         text not null,
  model_version text,
  input_tokens  int not null default 0,
  output_tokens int not null default 0,
  cost_usd      numeric(12, 6) not null default 0,
  latency_ms    int not null default 0,
  ok            boolean not null,
  error         text,
  created_at    timestamptz not null default now()
);
create index llm_calls_user_idx on llm_calls (user_id, created_at desc);

-- Hecho atómico extraído del documento con su cita LITERAL verificada por código.
create table facts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null,
  document_id   uuid not null,
  chunk_id      uuid not null,
  section_id    uuid,
  page_id       uuid not null,
  page_number   int not null,
  kind          text not null check (kind in (
                  'definition', 'characteristic', 'classification', 'quantity', 'date',
                  'name', 'requirement', 'deadline', 'procedure_step', 'exception', 'relation')),
  subject       text not null check (length(btrim(subject)) > 0),
  attribute     text not null check (length(btrim(attribute)) > 0),
  value         text not null check (length(btrim(value)) > 0),
  value_number  numeric,
  unit          text,
  slot          text not null,         -- agrupa hechos comparables: kind|atributo|unidad
  subject_norm  text not null,
  value_norm    text not null,
  quote         text not null check (length(btrim(quote)) > 0),
  char_start    int not null check (char_start >= 0),   -- offsets en document_pages.text
  char_end      int not null,
  extraction_model text,
  created_at    timestamptz not null default now(),
  check (char_end > char_start),
  foreign key (document_id, user_id) references documents(id, user_id) on delete cascade,
  foreign key (chunk_id, document_id) references document_chunks(id, document_id) on delete cascade,
  foreign key (page_id, document_id) references document_pages(id, document_id) on delete cascade,
  foreign key (section_id, document_id) references document_sections(id, document_id) on delete set null (section_id),
  unique (id, document_id),
  unique (document_id, kind, subject_norm, slot, value_norm)
);
create index facts_slot_idx on facts (document_id, slot);
create index facts_section_idx on facts (document_id, section_id);

do $$
declare
  t text;
begin
  foreach t in array array['llm_calls', 'facts'] loop
    execute format('alter table %I enable row level security', t);
    execute format('alter table %I force row level security', t);
    execute format(
      'create policy %I on %I for all using (user_id = app.current_user_id()) with check (user_id = app.current_user_id())',
      t || '_owner', t);
    execute format('grant select, insert, update, delete on %I to banco_app', t);
  end loop;
end$$;
