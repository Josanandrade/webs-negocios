-- Los trabajos de un mismo documento se ejecutan de uno en uno y en orden de llegada.
-- Así se puede pedir «Generar» mientras se extraen los datos del temario en segundo plano:
-- la generación espera su turno y aprovecha lo ya extraído, aunque haya varios workers.
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
      -- ni otro trabajo del documento en marcha, ni uno anterior aún pendiente
      and not exists (
        select 1 from processing_jobs o
        where o.document_id = j.document_id and o.id <> j.id
          and ((o.status = 'running' and o.lease_expires_at >= now())
               or (o.status = 'pending' and o.created_at < j.created_at and o.run_after <= now()))
      )
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
