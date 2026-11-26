/* Página principal: sirve index.html aplicando lo que se ha cambiado en el modo edición.
 * Con la sesión iniciada añade además el editor (lápices); sin sesión, la web no lleva ninguna herramienta.
 * Si no hay KV o no hay cambios, la web sale exactamente como está en el repositorio. */
import { kvOf, readSite, writeSite, readSession, galleryItemHtml, esc, safeUrl, renderText, globalCss } from './_lib/core.js';

export async function onRequestGet({ request, env }) {
  const res = await env.ASSETS.fetch(request);
  const kv = kvOf(env);
  if (!kv || !res.ok || !(res.headers.get('content-type') || '').includes('text/html')) return res;

  let site, session;
  try {
    [site, session] = await Promise.all([readSite(kv), readSession(request, env, kv)]);
  } catch { return res; }
  const { texts, galleries, slots, global } = site;
  if (site.migrated) { delete site.migrated; await writeSite(kv, site).catch(() => {}); }
  const gcss = globalCss(global);

  // HTMLRewriter no da acceso al padre: recordamos la galería en la que estamos al entrar en ella.
  let current = null;
  let rw = new HTMLRewriter()
    .on('[data-k]', {
      element(el) {
        const k = el.getAttribute('data-k');
        if (!Object.prototype.hasOwnProperty.call(texts, k)) return;
        const { html, css } = renderText(texts[k], global.scale);
        if (html !== null) el.setInnerContent(html, { html: true });
        if (css) el.setAttribute('style', css);
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

  rw = rw.on('head', { element(el) { el.append(`<style id="site-global">${gcss}</style>`, { html: true }); } });

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

  if (session) {
    rw = rw
      .on('html', { element(el) { el.setAttribute('data-editor', ''); } })
      .on('head', { element(el) { el.append('<link rel="stylesheet" href="/admin/editor.css">', { html: true }); } })
      .on('body', { element(el) { el.append('<script src="/admin/editor.js" defer></script>', { html: true }); } });
  }

  const out = rw.transform(res);
  const headers = new Headers(out.headers);
  headers.set('cache-control', session ? 'private, no-store' : 'no-cache');
  headers.set('vary', 'Cookie');
  headers.delete('etag');
  return new Response(out.body, { status: out.status, headers });
}
