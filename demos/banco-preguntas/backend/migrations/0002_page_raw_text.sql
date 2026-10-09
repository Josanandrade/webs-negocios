-- 0002: texto bruto por página (antes de limpiar cabeceras/pies) para auditoría y
-- para poder recalcular la limpieza sin volver a extraer ni repetir OCR.
alter table document_pages add column raw_text text not null default '';
alter table document_pages add column image_coverage real not null default 0
  check (image_coverage between 0 and 1);
