-- 0005: generación de preguntas — auditoría de candidatos y vínculo pregunta↔hecho.

alter table questions add column fact_id uuid;
alter table questions add constraint questions_fact_fk
  foreign key (fact_id, document_id) references facts(id, document_id) on delete set null (fact_id);
create index questions_fact_idx on questions (document_id, fact_id);
create index questions_stem_trgm_idx on questions using gin (stem gin_trgm_ops);

alter table question_sources add column fact_id uuid;
alter table question_sources add constraint question_sources_fact_fk
  foreign key (fact_id, document_id) references facts(id, document_id) on delete set null (fact_id);

-- Cada intento de pregunta (aceptado o no) queda registrado con el motivo.
create table question_candidates (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,
  document_id uuid not null,
  job_id      uuid not null references processing_jobs(id) on delete cascade,
  fact_id     uuid not null,
  section_id  uuid,
  status      text not null check (status in (
                'accepted', 'rejected_no_distractors', 'rejected_generation', 'rejected_deterministic',
                'rejected_verification', 'rejected_duplicate')),
  reasons     text[] not null default '{}',
  draft       jsonb not null default '{}'::jsonb,
  verifier    jsonb not null default '{}'::jsonb,
  question_id uuid,
  created_at  timestamptz not null default now(),
  foreign key (document_id, user_id) references documents(id, user_id) on delete cascade,
  foreign key (fact_id, document_id) references facts(id, document_id) on delete cascade,
  foreign key (question_id, user_id) references questions(id, user_id) on delete set null (question_id),
  unique (job_id, fact_id)
);
create index question_candidates_doc_idx on question_candidates (document_id, fact_id);

alter table question_candidates enable row level security;
alter table question_candidates force row level security;
create policy question_candidates_owner on question_candidates for all
  using (user_id = app.current_user_id()) with check (user_id = app.current_user_id());
grant select, insert, update, delete on question_candidates to banco_app;
