/* API del portal de administración (/admin). Todo lo que no sea "estado" o "entrar" exige sesión. */
import {
  kvOf, readSite, writeSite, json, randomId, MAX_UPLOAD,
  getAuth, checkCredentials, hashPassword, makeSessionCookie, clearSessionCookies, readSession,
  tooManyAttempts, noteFailure, safeUrl, sanitizeRich, cleanStyle,
} from '../../_lib/core.js';

const ALLOWED_TYPES = new Set(['image/webp', 'image/jpeg', 'image/png', 'image/avif', 'video/mp4', 'video/quicktime', 'video/webm']);
const GALLERY_ID = /^[a-z0-9-]{1,80}$/;
const SLOT_IDS = new Set(['portada', 'sobre-mi']);
const mediaIdOf = (u) => { const m = /^\/media\/([A-Za-z0-9_-]+)$/.exec(String(u || '')); return m ? m[1] : null; };

function cleanItem(it) {
  if (!it || typeof it !== 'object') return null;
  const type = it.type === 'video' ? 'video' : 'photo';
  const full = safeUrl(it.full);
  if (!full) return null;
  return { type, full, thumb: safeUrl(it.thumb) || '', alt: String(it.alt || '').slice(0, 300) };
}
const mediaIds = (items) => items.flatMap((i) => [mediaIdOf(i.full), mediaIdOf(i.thumb)]).filter(Boolean);

async function deleteUnused(kv, site, candidates) {
  const used = new Set([
    ...Object.values(site.galleries).flatMap((items) => mediaIds(items)),
    ...mediaIds(Object.values(site.slots).filter(Boolean)),
  ]);
  await Promise.all([...new Set(candidates)].filter((id) => !used.has(id)).map((id) => kv.delete('media:' + id)));
}

export async function onRequest(context) {
  const { request, env, params } = context;
  const kv = kvOf(env);
  const path = (params.path || []).join('/');
  const method = request.method;
  const url = new URL(request.url);

  if (method !== 'GET' && method !== 'HEAD') {
    const origin = request.headers.get('origin');
    if (!origin || origin !== url.origin) return json({ error: 'Origen no permitido.' }, 403);
  }

  if (path === 'status' && method === 'GET') {
    if (!kv) return json({ configured: false, hasPassword: Boolean(env.ADMIN_PASSWORD) });
    const auth = await getAuth(env, kv);
    const session = auth ? await readSession(request, env, kv) : null;
    return json({ configured: true, hasPassword: Boolean(auth), loggedIn: Boolean(session), user: session ? session.u : null });
  }

  if (!kv) return json({ error: 'Falta conectar el almacenamiento (KV) en Cloudflare.' }, 503);

  if (path === 'login' && method === 'POST') {
    const ip = request.headers.get('cf-connecting-ip') || 'local';
    if (await tooManyAttempts(kv, ip)) return json({ error: 'Demasiados intentos. Espera 15 minutos.' }, 429);
    const body = await request.json().catch(() => ({}));
    const { ok, auth, reason } = await checkCredentials(env, kv, body.user, body.password);
    if (reason === 'unconfigured') return json({ error: 'Falta poner la contraseña inicial (ADMIN_PASSWORD) en Cloudflare.' }, 503);
    if (!ok) {
      await noteFailure(kv, ip);
      await new Promise((r) => setTimeout(r, 600));
      return json({ error: 'Usuario o contraseña incorrectos.' }, 401);
    }
    return json({ ok: true, user: auth.user }, 200, { 'set-cookie': await makeSessionCookie(env, kv, auth) });
  }

  if (path === 'logout' && method === 'POST') {
    const res = json({ ok: true });
    clearSessionCookies().forEach((c) => res.headers.append('set-cookie', c));
    return res;
  }

  const session = await readSession(request, env, kv);
  if (!session) return json({ error: 'La sesión ha caducado. Vuelve a entrar.' }, 401);

  if (path === 'site' && method === 'GET') return json(await readSite(kv));

  if (path === 'original' && method === 'GET') {
    const res = await env.ASSETS.fetch(new Request(new URL('/', url).toString()));
    return new Response(await res.text(), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
  }

  if (path === 'texts' && method === 'PUT') {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.texts !== 'object') return json({ error: 'Datos no válidos.' }, 400);
    const site = await readSite(kv);
    for (const [k, v] of Object.entries(body.texts)) {
      if (!/^[a-z0-9-]{1,90}$/.test(k)) continue;
      if (v === null) { delete site.texts[k]; continue; }
      if (typeof v === 'string') { site.texts[k] = v.slice(0, 6000); continue; }
      if (v && typeof v === 'object') {
        const h = v.h == null ? null : sanitizeRich(v.h);
        const st = cleanStyle(v.s);
        if (h === null && !st) { delete site.texts[k]; continue; }
        site.texts[k] = { h, s: st };
      }
    }
    await writeSite(kv, site);
    return json({ ok: true, texts: site.texts });
  }

  let m;
  if ((m = /^gallery\/([a-z0-9-]+)$/.exec(path)) && method === 'PUT') {
    const id = m[1];
    if (!GALLERY_ID.test(id)) return json({ error: 'Galería no válida.' }, 400);
    const body = await request.json().catch(() => null);
    if (!body || !Array.isArray(body.items)) return json({ error: 'Datos no válidos.' }, 400);
    const site = await readSite(kv);
    const before = mediaIds(site.galleries[id] || []);
    if (body.reset) delete site.galleries[id];
    else site.galleries[id] = body.items.map(cleanItem).filter(Boolean).slice(0, 300);
    await writeSite(kv, site);
    await deleteUnused(kv, site, before);
    return json({ ok: true, items: site.galleries[id] || null });
  }

  if ((m = /^slot\/([a-z-]+)$/.exec(path)) && method === 'PUT') {
    const id = m[1];
    if (!SLOT_IDS.has(id)) return json({ error: 'Foto no válida.' }, 400);
    const body = await request.json().catch(() => ({}));
    const site = await readSite(kv);
    const before = mediaIds([site.slots[id]].filter(Boolean));
    const item = body.item ? cleanItem({ ...body.item, type: 'photo' }) : null;
    if (item) site.slots[id] = item; else delete site.slots[id];
    await writeSite(kv, site);
    await deleteUnused(kv, site, before);
    return json({ ok: true, item: site.slots[id] || null });
  }

  if (path === 'media' && method === 'POST') {
    const type = (request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!ALLOWED_TYPES.has(type)) return json({ error: 'Tipo de archivo no admitido.' }, 415);
    const len = Number(request.headers.get('content-length') || 0);
    if (len > MAX_UPLOAD) return json({ error: 'El archivo pesa más de 25 MB.' }, 413);
    const buf = await request.arrayBuffer();
    if (!buf.byteLength) return json({ error: 'El archivo está vacío.' }, 400);
    if (buf.byteLength > MAX_UPLOAD) return json({ error: 'El archivo pesa más de 25 MB.' }, 413);
    const id = randomId(12);
    await kv.put('media:' + id, buf, { metadata: { type, size: buf.byteLength, at: Date.now() } });
    return json({ ok: true, url: '/media/' + id });
  }

  if ((m = /^media\/([A-Za-z0-9_-]+)$/.exec(path)) && method === 'DELETE') {
    const site = await readSite(kv);
    await deleteUnused(kv, site, [m[1]]);
    return json({ ok: true });
  }

  if (path === 'password' && method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const current = await getAuth(env, kv);
    const check = await checkCredentials(env, kv, current.user, body.current);
    if (!check.ok) return json({ error: 'La contraseña actual no es correcta.' }, 401);
    const user = String(body.user || current.user).trim().toLowerCase();
    const password = String(body.password || '');
    if (!/^[a-z0-9._@-]{3,60}$/.test(user)) return json({ error: 'El usuario debe tener entre 3 y 60 letras o números, sin espacios.' }, 400);
    if (password.length < 10) return json({ error: 'La contraseña nueva debe tener al menos 10 caracteres.' }, 400);
    const h = await hashPassword(password);
    const next = { user, ...h, v: (current.v || 0) + 1 };
    await kv.put('auth', JSON.stringify(next));
    return json({ ok: true, user }, 200, { 'set-cookie': await makeSessionCookie(env, kv, next) });
  }

  return json({ error: 'No encontrado.' }, 404);
}
