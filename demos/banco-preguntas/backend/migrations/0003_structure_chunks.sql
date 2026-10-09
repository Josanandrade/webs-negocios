-- 0003: estructura y fragmentación.
create extension if not exists pg_trgm;

-- Posición exacta (carácter dentro de la página) donde empieza la sección.
alter table document_sections add column start_char int not null default 0 check (start_char >= 0);

alter table document_chunks add column flags text[] not null default '{}';
alter table document_chunks add column char_count int not null default 0;

create index document_chunks_doc_eligible_idx on document_chunks (document_id, is_eligible);
create index document_chunks_trgm_idx on document_chunks using gin (text gin_trgm_ops);
