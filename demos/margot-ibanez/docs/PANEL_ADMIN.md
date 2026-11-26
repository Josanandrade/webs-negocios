# Panel de administración (versión 2 de la web de Margot)

Dirección: `<web>/admin/` (no está enlazado en la web y no se indexa).

Qué permite:
- **Fotos y vídeos**: por tratamiento (cada uno con su galería, sin mezclar), más la foto de portada y la de «Sobre mí».
  Subir (las fotos se reducen en el propio móvil u ordenador antes de enviarse; vídeos mp4/mov/webm de hasta 25 MB),
  quitar y cambiar el orden. «Volver a las fotos originales» deja el apartado como está en el repositorio.
- **Textos**: todos los textos de la web, agrupados por apartado. «Volver al original» por campo.
- **Cuenta**: cambiar usuario y contraseña (se guarda cifrada con PBKDF2 en KV; cierra las demás sesiones).

## Cómo funciona
- Web estática en Cloudflare Pages + Pages Functions (`demo-host/functions/`, con copias de enlace en `/functions`
  por si el proyecto de Pages usa la raíz del repositorio).
- Los cambios se guardan en Cloudflare KV (binding `MARGOT_KV`): clave `site` (textos, galerías, fotos principales),
  `media:<id>` (archivos subidos), `auth` (contraseña cambiada desde el panel), `secret` (firma de sesión).
- `functions/index.js` sirve `index.html` aplicando esos cambios con HTMLRewriter: sin parpadeos y sin reconstruir la web.
  Sin KV, la web sale tal cual está en el repositorio.
- Los textos editables llevan `data-k`, las galerías `data-gallery-id` y las fotos principales `data-slot`. No cambiarlos.
- Seguridad: sesión en cookie HttpOnly/Secure/SameSite=Strict firmada con HMAC (12 h), comprobación de origen en
  cada cambio, 8 intentos fallidos bloquean 15 minutos, `noindex` y `no-store` en todo /admin.

## Puesta en marcha en Cloudflare (una sola vez)
1. Cloudflare → Storage & Databases → Workers KV → **Create** → nombre `margot-web`.
2. Workers & Pages → proyecto `webs-negocios` → Settings → **Bindings** → Add → KV namespace:
   nombre de variable `MARGOT_KV`, namespace `margot-web`. (Entorno **Preview**, y también Production si algún día se publica ahí).
3. Settings → **Variables and Secrets** → Add (entorno Preview):
   - `ADMIN_USER` = el usuario (texto), p. ej. `jose`.
   - `ADMIN_PASSWORD` = la contraseña inicial, tipo **Secret**.
4. Deployments → último despliegue de la rama → **Retry deployment** (los cambios de ajustes solo se aplican al volver a desplegar).

Después se entra en `/admin/` con ese usuario y contraseña. Si se cambia la contraseña desde el panel, la de Cloudflare deja de usarse.
