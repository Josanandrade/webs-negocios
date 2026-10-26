-- El constructor libre de fuerza/weightlifting guarda un payload JSON estructurado
-- en block_results.reps_detail. Con varias secciones/rondas puede superar el
-- límite histórico de 500 caracteres aunque el resultado sea válido.
--
-- Los detalles escritos manualmente siguen limitados a 500 caracteres en la
-- capa de aplicación (parseScore). Este límite mayor es solo la barrera de BD
-- para soportar el formato estructurado actual y futuro próximo.

alter table public.block_results
  drop constraint if exists block_results_reps_detail_check;

alter table public.block_results
  add constraint block_results_reps_detail_check
  check (char_length(reps_detail) <= 20000);
