/* Inmomairena · utilidades compartidas por la web pública y la ficha. */
(function () {
  const { CONFIG, fmt, img } = window.IM;
  const BASE = document.body.dataset.base || '';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (n) => `<svg aria-hidden="true"><use href="${BASE}assets/icons.svg#${n}"/></svg>`;

  function waLink(text) {
    if (!CONFIG.whatsapp) return '';
    return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text || 'Hola, os escribo desde vuestra web.')}`;
  }

  function wireContact(root = document) {
    $$('[data-phone]', root).forEach(a => { a.href = CONFIG.phoneHref; });
    $$('[data-phone-text]', root).forEach(el => { el.textContent = CONFIG.phone; });
    $$('[data-wa]', root).forEach(a => {
      const url = waLink(a.dataset.waText);
      if (!url) { a.hidden = true; return; }
      a.href = url; a.target = '_blank'; a.rel = 'noopener';
    });
    $$('[data-year]', root).forEach(el => { el.textContent = new Date().getFullYear(); });
  }

  // ---------- Favoritos (solo en este navegador) ----------
  const FKEY = 'inmomairena-favs';
  const favs = new Set((() => { try { return JSON.parse(localStorage.getItem(FKEY) || '[]'); } catch (e) { return []; } })());
  function toggleFav(id) {
    favs.has(id) ? favs.delete(id) : favs.add(id);
    try { localStorage.setItem(FKEY, JSON.stringify([...favs])); } catch (e) {}
    return favs.has(id);
  }

  // ---------- Tarjeta de inmueble ----------
  function card(p) {
    const closed = p.status === 'vendido' || p.status === 'alquilado';
    const href = `${BASE}inmueble/?id=${encodeURIComponent(p.id)}`;
    const price = new Intl.NumberFormat('es-ES').format(p.price);
    const tags = [`<span class="tag tag--op-${p.op}">${fmt.op(p)}</span>`];
    if (p.status !== 'disponible') tags.push(`<span class="tag tag--${p.status}"><i></i>${fmt.status(p)}</span>`);
    else if (p.featured) tags.push(`<span class="tag tag--star">Destacado</span>`);
    const specs = [];
    if (p.beds) specs.push(`<span title="Dormitorios">${icon('bed')}${p.beds} hab.</span>`);
    if (p.baths) specs.push(`<span title="Baños">${icon('bath')}${p.baths} ${p.baths === 1 ? 'baño' : 'baños'}</span>`);
    if (p.m2) specs.push(`<span title="Superficie">${icon('area')}${p.m2} m²</span>`);
    return `<article class="pcard${closed ? ' is-closed' : ''}" data-id="${esc(p.id)}">
      <div class="pcard__media">
        <img src="${esc(img(p.cover, BASE))}" alt="${esc(p.title)}" loading="lazy" width="1200" height="800">
        <div class="pcard__tags">${tags.join('')}</div>
        <span class="pcard__price">${price} €${p.op === 'alquiler' ? '<small>/mes</small>' : ''}</span>
      </div>
      <button class="pcard__fav${favs.has(p.id) ? ' is-on' : ''}" type="button" aria-pressed="${favs.has(p.id)}" aria-label="Guardar ${esc(p.title)}">${icon('heart')}</button>
      <div class="pcard__body">
        <span class="pcard__loc">${icon('pin')}${esc(p.area ? `${p.area} · ${p.town}` : p.town)}</span>
        <h3 class="pcard__t"><a href="${href}">${esc(p.title)}</a></h3>
        <div class="specs">${specs.join('')}</div>
      </div>
    </article>`;
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('.pcard__fav');
    if (!b) return;
    e.preventDefault();
    const on = toggleFav(b.closest('.pcard').dataset.id);
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', on);
    toast(on ? 'Guardado en tus favoritos' : 'Quitado de favoritos');
  });

  // ---------- Toast ----------
  let tt;
  function toast(msg) {
    const t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('is-on');
    clearTimeout(tt); tt = setTimeout(() => t.classList.remove('is-on'), 2400);
  }

  // ---------- Cabecera, menú y botón flotante ----------
  function wireHeader() {
    const hdr = $('#hdr'), burger = $('#burger'), sheet = $('#sheet'), fab = $('.fab');
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      hdr.classList.toggle('is-solid', y > 40);
      hdr.classList.toggle('is-hidden', y > 500 && y > last + 4 && !document.body.classList.contains('menu-open'));
      if (y < last - 4) hdr.classList.remove('is-hidden');
      if (fab) fab.classList.toggle('is-on', y > 420);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    if (!burger || !sheet) return;
    const close = () => {
      burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir menú');
      sheet.classList.remove('is-open'); document.body.classList.remove('menu-open');
      setTimeout(() => { if (!sheet.classList.contains('is-open')) sheet.hidden = true; }, 600);
    };
    burger.addEventListener('click', () => {
      if (sheet.classList.contains('is-open')) return close();
      sheet.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add('is-open')));
      burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Cerrar menú');
      document.body.classList.add('menu-open');
    });
    $$('a', sheet).forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheet.classList.contains('is-open')) close(); });
  }

  // ---------- Aparición al hacer scroll ----------
  function wireReveal(root = document) {
    const els = $$('.reveal:not(.is-in)', root);
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    els.forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 70}ms`; io.observe(el); });
  }

  // ---------- Formularios de demo ----------
  function wireForm(form) {
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let bad = null;
      $$('[required]', form).forEach(el => {
        const wrap = el.closest('.f, .check');
        let ok = el.type === 'checkbox' ? el.checked : el.value.trim() !== '';
        if (ok && el.type === 'tel') ok = el.value.replace(/\D/g, '').length >= 9;
        if (ok && el.type === 'email' && el.value) ok = /.+@.+\..+/.test(el.value);
        wrap && wrap.classList.toggle('is-bad', !ok);
        if (!ok && !bad) bad = el;
      });
      const em = $('input[type=email]:not([required])', form);
      if (em && em.value && !/.+@.+\..+/.test(em.value)) { em.closest('.f').classList.add('is-bad'); bad = bad || em; }
      if (bad) { bad.focus(); toast('Revisa los campos marcados'); return; }
      const ok = document.createElement('div');
      ok.className = 'form-ok';
      ok.innerHTML = `<span class="form-ok__ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><strong>${esc(form.dataset.ok || '¡Recibido!')}</strong><p class="card-form__note">Demo: en la web final te llegaría al correo y al panel.</p><button type="button">Enviar otra</button>`;
      form.appendChild(ok);
      $('button', ok).addEventListener('click', () => { form.reset(); ok.remove(); });
    });
    form.addEventListener('input', (e) => { const w = e.target.closest('.is-bad'); w && w.classList.remove('is-bad'); });
    form.addEventListener('change', (e) => { const w = e.target.closest('.is-bad'); w && w.classList.remove('is-bad'); });
  }

  function fillSelect(sel, values, keep = true) {
    if (!sel) return;
    const first = keep ? sel.options[0] : null;
    sel.innerHTML = '';
    if (first) sel.appendChild(first);
    values.forEach(v => { const o = document.createElement('option'); if (Array.isArray(v)) { o.value = v[0]; o.textContent = v[1]; } else { o.value = o.textContent = v; } sel.appendChild(o); });
  }

  // ---------- Mapa ilustrado del Aljarafe (aproximado, sin calles) ----------
  const TOWNS = {
    'Espartinas': [112, 132], 'Bormujos': [196, 150], 'Tomares': [350, 162], 'Mairena del Aljarafe': [270, 214],
    'San Juan de Aznalfarache': [384, 226], 'Gelves': [348, 294], 'Palomares del Río': [236, 312], 'Almensilla': [200, 364]
  };
  function map({ focus = null, point = null } = {}) {
    const towns = Object.entries(TOWNS).map(([n, [x, y]]) => {
      const main = n === (focus || 'Mairena del Aljarafe');
      const label = n === 'San Juan de Aznalfarache' ? 'San Juan' : n === 'Mairena del Aljarafe' ? 'Mairena' : n === 'Palomares del Río' ? 'Palomares' : n;
      const lx = n === 'San Juan de Aznalfarache' || n === 'Gelves' || n === 'Tomares' ? x + 10 : x + 10;
      return `<circle class="map-dot${main ? ' map-dot--main' : ''}" cx="${x}" cy="${y}" r="${main ? 6 : 4}"/>` +
        (main && !point ? `<circle class="map-ring" cx="${x}" cy="${y}" r="10"/>` : '') +
        `<text class="map-town${main ? ' map-town--main' : ''}" x="${lx}" y="${y + 4}">${label}</text>`;
    }).join('');
    const pt = point ? `<circle cx="${point.x}" cy="${point.y}" r="34" fill="rgba(240,106,75,.18)" stroke="#F06A4B" stroke-width="1.5" stroke-dasharray="4 4"/><circle class="map-ring" cx="${point.x}" cy="${point.y}" r="12"/>` : '';
    return `<svg viewBox="0 0 480 420" role="img" aria-label="Mapa aproximado de la zona del Aljarafe">
      <defs><radialGradient id="mz" cx=".55" cy=".5" r=".55"><stop offset="0" stop-color="#F06A4B" stop-opacity=".22"/><stop offset="1" stop-color="#F06A4B" stop-opacity="0"/></radialGradient>
      <pattern id="mg" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="rgba(255,255,255,.05)"/></pattern></defs>
      <rect width="480" height="420" fill="url(#mg)"/>
      <path d="M60 110 C120 70 260 80 330 110 C390 135 410 200 400 260 C390 330 300 390 220 395 C150 398 90 360 70 290 C55 230 40 150 60 110Z" fill="url(#mz)"/>
      <path d="M452 20 C430 90 445 150 420 205 C398 252 420 300 395 350 C380 380 395 405 390 420" fill="none" stroke="#6B8FB8" stroke-opacity=".55" stroke-width="10" stroke-linecap="round"/>
      <text x="414" y="258" class="map-town" style="fill:rgba(140,175,215,.8)" transform="rotate(76 414 258)">Guadalquivir</text>
      <text x="436" y="206" class="map-town" style="fill:rgba(255,255,255,.45)">Sevilla</text>
      <path d="M100 136 C170 150 230 200 270 214 C310 228 350 226 384 226" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="2" stroke-dasharray="2 6"/>
      <path d="M196 150 C220 190 230 260 236 312 C240 340 220 360 200 364" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="2" stroke-dasharray="2 6"/>
      ${towns}${pt}
    </svg>`;
  }

  window.UI = { $, $$, esc, icon, waLink, wireContact, card, toast, wireHeader, wireReveal, wireForm, fillSelect, map, BASE };
  document.documentElement.classList.remove('no-js');
})();
