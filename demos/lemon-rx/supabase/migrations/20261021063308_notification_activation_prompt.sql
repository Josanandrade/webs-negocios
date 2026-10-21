insert into public.app_notifications(recipient_id, kind, title, body, href)
select p.id, 'system', 'Activa las notificaciones de Lemon RX', 'Actívalas en este dispositivo para enterarte de reacciones, comentarios y novedades sin tener que estar pendiente de la app.', '/notificaciones?activar=1'
from public.profiles p;
