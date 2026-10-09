-- Bloque 7: tests del alumno, corrección y estadísticas.
--
-- * Modo 'practice' (corrige cada respuesta al momento) o 'exam' (nada se revela hasta
--   entregar; tiempo límite opcional comprobado en el servidor).
-- * Puntuación con penalización por fallo configurable (por defecto 1/3: corrección del
--   azar con 4 opciones). Las respuestas en blanco no restan.
-- * quiz_questions guarda copia inmutable de la pregunta (snapshot) y, desnormalizados para
--   las estadísticas, documento, tema principal y dificultad.

alter table quizzes
  add column title              text not null default 'Test',
  add column mode               text not null default 'practice' check (mode in ('practice', 'exam')),
  add column penalty            real not null default 0.3333 check (penalty >= 0 and penalty <= 1),
  add column time_limit_seconds int check (time_limit_seconds is null or time_limit_seconds > 0),
  add column expires_at         timestamptz,
  add column net                real,
  add column source_quiz_id     uuid,
  add constraint quizzes_source_fk foreign key (source_quiz_id, user_id)
    references quizzes(id, user_id) on delete set null (source_quiz_id);

create index quizzes_user_idx on quizzes (user_id, started_at desc);

alter table quiz_questions
  add column document_id    uuid,
  add column top_section_id uuid,
  add column difficulty     text;

create index quiz_questions_user_question_idx on quiz_questions (user_id, question_id);

-- Un "intento" es una respuesta que cuenta para el historial y las estadísticas:
--   * todas las preguntas de un test entregado (las no contestadas cuentan como en blanco);
--   * en práctica, cada respuesta en cuanto se da (aunque el test no se haya entregado),
--     porque ya se ha visto la corrección y no puede cambiarse.
-- Los tests de examen sin entregar no cuentan: sus respuestas aún pueden cambiar.
-- security_invoker: la vista respeta la RLS del usuario que consulta.
create view quiz_attempts with (security_invoker = true) as
select qq.id, qq.user_id, qq.quiz_id, qq.question_id, qq.document_id, qq.top_section_id, qq.difficulty,
       qq.snapshot,
       case when qq.selected_label is null then 'blank'
            when qq.is_correct then 'correct' else 'wrong' end as result,
       coalesce(qq.answered_at, z.finished_at) as attempted_at
from quiz_questions qq
join quizzes z on z.id = qq.quiz_id
where z.status = 'finished'
   or (z.mode = 'practice' and z.status = 'in_progress' and qq.answered_at is not null);

grant select on quiz_attempts to banco_app;
