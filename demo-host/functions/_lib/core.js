/* Núcleo del portal de administración de la web de Margot Ibáñez.
 * Todo lo editable vive en Cloudflare KV (binding "MARGOT_KV"):
 *   site        → { texts: {clave: texto}, galleries: {id: [items]}, slots: {portada|sobre-mi: item} }
 *   media:<id>  → archivo subido (foto, vídeo o portada de vídeo), con su tipo en los metadatos
 *   auth        → { user, salt, hash, iter, v }  (solo si se cambió la contraseña desde el portal)
 *   secret      → clave aleatoria para firmar la sesión
 * Sin KV la web pública funciona igual (sale el contenido original) y el portal avisa de que falta configurarlo. */

export const SITE_KEY = 'site';
export const MAX_UPLOAD = 25 * 1024 * 1024; // límite de un valor en KV

export const kvOf = (env) => env.MARGOT_KV || null;

export async function readSite(kv) {
  const site = (await kv.get(SITE_KEY, 'json')) || {};
  return { texts: site.texts || {}, galleries: site.galleries || {}, slots: site.slots || {}, updated: site.updated || null };
}

export async function writeSite(kv, site) {
  site.updated = new Date().toISOString();
  await kv.put(SITE_KEY, JSON.stringify(site));
  return site;
}

export const json = (data, status = 200, extra = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow', ...extra },
  });

/* ---------- utilidades de cripto ---------- */
const enc = new TextEncoder();
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64u = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
export const randomId = (n = 16) => b64u(crypto.getRandomValues(new Uint8Array(n)));

function safeEqual(a, b) {
  const x = enc.encode(String(a)), y = enc.encode(String(b));
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}

export async function hashPassword(password, saltB64, iter = 100000) {
  const salt = saltB64 ? fromB64u(saltB64) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, key, 256);
  return { salt: b64u(salt), hash: b64u(bits), iter };
}

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64u(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

async function getSecret(env, kv) {
  if (env.SESSION_SECRET) return env.SESSION_SECRET;
  let s = await kv.get('secret');
  if (!s) { s = randomId(32); await kv.put('secret', s); }
  return s;
}

/* ---------- credenciales ---------- */
export async function getAuth(env, kv) {
  const stored = await kv.get('auth', 'json');
  if (stored) return { source: 'portal', ...stored };
  if (env.ADMIN_PASSWORD) return { source: 'env', user: env.ADMIN_USER || 'admin', password: env.ADMIN_PASSWORD, v: 0 };
  return null;
}

export async function checkCredentials(env, kv, user, password) {
  const auth = await getAuth(env, kv);
  if (!auth) return { ok: false, reason: 'unconfigured' };
  const userOk = safeEqual(String(user || '').trim().toLowerCase(), String(auth.user).toLowerCase());
  let passOk;
  if (auth.source === 'portal') {
    const h = await hashPassword(String(password || ''), auth.salt, auth.iter);
    passOk = safeEqual(h.hash, auth.hash);
  } else {
    passOk = safeEqual(String(password || ''), auth.password);
  }
  return { ok: userOk && passOk, auth };
}

/* ---------- sesión (cookie firmada, 12 horas) ---------- */
const COOKIE = 'mi_admin';
const SESSION_HOURS = 12;

export async function makeSessionCookie(env, kv, auth) {
  const payload = b64u(enc.encode(JSON.stringify({ u: auth.user, v: auth.v || 0, exp: Date.now() + SESSION_HOURS * 3600e3 })));
  const sig = await hmac(await getSecret(env, kv), payload);
  return `${COOKIE}=${payload}.${sig}; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}`;
}
export const clearSessionCookie = () => `${COOKIE}=; Path=/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;

export async function readSession(request, env, kv) {
  const raw = (request.headers.get('cookie') || '').split(/;\s*/).find((c) => c.startsWith(COOKIE + '='));
  if (!raw) return null;
  const [payload, sig] = raw.slice(COOKIE.length + 1).split('.');
  if (!payload || !sig) return null;
  if (!safeEqual(sig, await hmac(await getSecret(env, kv), payload))) return null;
  let data;
  try { data = JSON.parse(new TextDecoder().decode(fromB64u(payload))); } catch { return null; }
  if (!data || data.exp < Date.now()) return null;
  const auth = await getAuth(env, kv);
  if (!auth || (auth.v || 0) !== data.v || String(auth.user).toLowerCase() !== String(data.u).toLowerCase()) return null;
  return data;
}

/* ---------- freno a los intentos de contraseña ---------- */
export async function tooManyAttempts(kv, ip) {
  const n = Number(await kv.get('fail:' + ip)) || 0;
  return n >= 8;
}
export async function noteFailure(kv, ip) {
  const n = (Number(await kv.get('fail:' + ip)) || 0) + 1;
  await kv.put('fail:' + ip, String(n), { expirationTtl: 900 });
}

/* ---------- HTML de las galerías (igual que el de index.html) ---------- */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = (u) => (/^(\/media\/[A-Za-z0-9_-]+|assets\/[A-Za-z0-9_\/.-]+)$/.test(String(u || '')) ? String(u) : '');

export function galleryItemHtml(it) {
  const thumb = safeUrl(it.thumb) || safeUrl(it.full);
  const alt = esc(it.alt || '');
  if (it.type === 'video') {
    const src = safeUrl(it.full);
    if (!src) return '';
    const poster = thumb ? `<img src="${thumb}" width="480" height="600" alt="${alt}" loading="lazy" decoding="async">` : '';
    return `<figure class="gallery__item gallery__item--video"><button class="gallery__open" type="button" data-video="${src}" aria-label="Ver vídeo"${poster ? '' : ' data-noposter'}>${poster}<span class="gallery__play" aria-hidden="true"></span></button></figure>`;
  }
  const full = safeUrl(it.full);
  if (!full) return '';
  return `<figure class="gallery__item"><button class="gallery__open" type="button" data-full="${full}" aria-label="Ampliar foto"><img src="${thumb}" width="480" height="600" alt="${alt}" loading="lazy" decoding="async"></button></figure>`;
}

export { esc, safeUrl };
