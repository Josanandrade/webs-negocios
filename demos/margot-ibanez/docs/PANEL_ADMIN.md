# Panel de administración (versión 2 de la web de Margot)

Dirección: `<web>/admin/` (no está enlazado en la web y no se indexa).

Cómo se usa: se entra en `/admin/` y se abre la propia web en **modo edición** (solo con la sesión iniciada;
la web pública no lleva ningún lápiz ni script del editor).
- **Textos**: lápiz en cada texto, o pulsar el texto. Se escribe encima y una barra arriba permite cambiar la letra
  (Montserrat, Raleway, Lora, Playfair Display, Cormorant Garamond), el tamaño (60–300 %), negrita, cursiva, subrayado
  (a unas palabras seleccionadas o a todo el texto), alineación y color. «Original» lo deja como estaba.
- **Galerías**: cada tratamiento tiene arriba «Añadir fotos o vídeos» y «Volver a las originales»; cada foto, ‹ Quitar ›.
- **Portada y Sobre mí**: botón «Cambiar foto» encima de la foto y «Foto original».
- Barra inferior: «Ver como visitante», «Cuenta» (cambiar usuario y contraseña en /admin) y «Salir».

## Cómo funciona
- Web estática en Cloudflare Pages + Pages Functions (`demo-host/functions/`, con copias de enlace en `/functions`
  por si el proyecto de Pages usa la raíz del repositorio).
- Los cambios se guardan en Cloudflare KV (binding `MARGOT_KV`): clave `site` (textos como `{h: html limpio con b/i/u/br, s: estilo de listas cerradas}`, galerías, fotos principales),
  `media:<id>` (archivos subidos), `auth` (contraseña cambiada desde el panel), `secret` (firma de sesión).
- `functions/index.js` sirve `index.html` aplicando esos cambios con HTMLRewriter (sin parpadeos ni reconstruir la web) y, si hay sesión, añade `/admin/editor.js` y `/admin/editor.css`.
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
