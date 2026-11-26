/* Página principal: sirve index.html aplicando lo que se ha cambiado desde el portal (/admin).
 * Si no hay KV o no hay cambios, la web sale exactamente como está en el repositorio. */
import { kvOf, readSite, galleryItemHtml, esc, safeUrl } from './_lib/core.js';

export async function onRequestGet({ request, env }) {
  const res = await env.ASSETS.fetch(request);
  const kv = kvOf(env);
  if (!kv || !res.ok || !(res.headers.get('content-type') || '').includes('text/html')) return res;

  let site;
  try { site = await readSite(kv); } catch { return res; }
  const { texts, galleries, slots } = site;
  if (!Object.keys(texts).length && !Object.keys(galleries).length && !Object.keys(slots).length) return res;

  // HTMLRewriter no da acceso al padre: recordamos la galería en la que estamos al entrar en ella.
  let current = null;
  let rw = new HTMLRewriter()
    .on('[data-k]', {
      element(el) {
        const k = el.getAttribute('data-k');
        if (Object.prototype.hasOwnProperty.call(texts, k)) el.setInnerContent(String(texts[k]));
      },
    })
    .on('[data-gallery-id]', {
      element(el) {
        current = el.getAttribute('data-gallery-id');
        const items = galleries[current];
        if (!Array.isArray(items)) return;
        if (items.length) el.removeAttribute('hidden'); else el.setAttribute('hidden', '');
      },
    })
    .on('[data-gallery-grid]', {
      element(el) {
        const items = current && galleries[current];
        if (Array.isArray(items)) el.setInnerContent(items.map(galleryItemHtml).join(''), { html: true });
      },
    });

  const portada = slots.portada;
  if (portada && safeUrl(portada.full)) {
    rw = rw.on('[data-slot="portada"]', {
      element(el) {
        el.setAttribute('class', 'hero__photo is-custom');
        el.setInnerContent(`<img src="${safeUrl(portada.full)}" alt="${esc(portada.alt || 'Margot Ibáñez')}" fetchpriority="high">`, { html: true });
      },
    });
  }
  const sobre = slots['sobre-mi'];
  if (sobre && safeUrl(sobre.full)) {
    rw = rw.on('[data-slot="sobre-mi"] img', {
      element(el) {
        el.setAttribute('src', safeUrl(sobre.full));
        el.removeAttribute('srcset');
        el.removeAttribute('width');
        el.removeAttribute('height');
        if (sobre.alt) el.setAttribute('alt', sobre.alt);
      },
    });
  }

  const out = rw.transform(res);
  const headers = new Headers(out.headers);
  headers.set('cache-control', 'no-cache');
  headers.delete('etag');
  return new Response(out.body, { status: out.status, headers });
}
