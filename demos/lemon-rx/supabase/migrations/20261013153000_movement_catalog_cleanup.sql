-- Limpieza del catálogo de movimientos: variantes explícitas, nombres precisos y retirada segura de duplicados conceptuales.

insert into public.movements (name, group_name, sort_order)
values
  ('Hang Squat Clean', 'Weightlifting', 9999),
  ('Hang Squat Clean Below Knees', 'Weightlifting', 9999),
  ('Hang Squat Snatch', 'Weightlifting', 9999),
  ('Hang Squat Snatch Below Knees', 'Weightlifting', 9999)
on conflict do nothing;

update public.movements
set is_active = false, updated_at = now()
where name in ('Clean', 'Snatch', 'Hang Clean', 'Hang Snatch');

update public.movements
set name = 'High Hang Squat Clean', updated_at = now()
where name = 'High Hang Clean'
  and not exists (select 1 from public.movements x where lower(trim(x.name)) = lower('High Hang Squat Clean'));

update public.movements
set name = 'High Hang Squat Snatch', updated_at = now()
where name = 'High Hang Snatch'
  and not exists (select 1 from public.movements x where lower(trim(x.name)) = lower('High Hang Squat Snatch'));
