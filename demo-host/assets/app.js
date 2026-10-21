/* Inmobiliaria Alves · utilidades compartidas (portada y ficha) */
(function () {
  const { CONFIG, fmtPrice } = window.ALVES;
  const root = document.documentElement.dataset.root || '';

  const ICONS = {
    bed: '<path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 14h18M3 18v2M21 18v2M7 9V6h4v3"/>',
    bath: '<path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3ZM6 12V6a2 2 0 0 1 3.5-1.3M7 19l-1 2M17 19l1 2"/>',
    area: '<path d="M4 4h6M4 4v6M20 20h-6M20 20v-6M4 4l6 6M20 20l-6-6"/>',
    pin: '<path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
    whatsapp: '<path d="M4 20l1.3-4A8 8 0 1 1 8 18.8L4 20Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.6-2-1-1 .9a4 4 0 0 1-1.8-1.8l.9-1-1-2L9 9.5Z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>'
  };
  const icon = (name, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

  const waLink = (text) => `https://wa.me/${CONFIG.whatsapp}${text ? '?text=' + encodeURIComponent(text) : ''}`;

  // Favoritos guardados solo en este navegador.
  const FAV_KEY = 'alves-demo-favs';
  const readFavs = () => { try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; } };
  const writeFavs = (v) => { try { localStorage.setItem(FAV_KEY, JSON.stringify(v)); } catch {} };
  const isFav = (id) => readFavs().includes(id);
  function toggleFav(id) {
    const f = readFavs();
    const on = !f.includes(id);
    writeFavs(on ? [...f, id] : f.filter((x) => x !== id));
    return on;
  }

  function card(l, i = 0) {
    const specs = l.type === 'Local'
      ? `<span>${icon('area')}${l.m2} m²</span><span>${icon('bath')}${l.baths} aseo</span>`
      : `<span>${icon('bed')}${l.beds} dorm.</span><span>${icon('bath')}${l.baths} baño${l.baths > 1 ? 's' : ''}</span><span>${icon('area')}${l.m2} m²</span>`;
    return `<article class="card" style="--i:${i}">
      <a class="card__media" href="${root}inmueble/?id=${l.id}" aria-label="${l.title}, ${l.zone}">
        <img src="${root}assets/img/${l.cover}" alt="" loading="lazy" width="1200" height="800">
        <span class="tag tag--${l.op}">${l.op === 'venta' ? 'En venta' : 'En alquiler'}</span>
      </a>
      <button class="fav" type="button" data-fav="${l.id}" aria-pressed="${isFav(l.id)}" aria-label="Guardar ${l.title}">${icon('heart')}</button>
      <div class="card__body">
        <p class="card__price">${fmtPrice(l)}</p>
        <h3 class="card__title"><a href="${root}inmueble/?id=${l.id}">${l.title}</a></h3>
        <p class="card__loc">${icon('pin')}${l.zone}, ${CONFIG.city} <span class="ref">${l.ref}</span></p>
        <p class="card__specs">${specs}</p>
      </div>
    </article>`;
  }

  // Toast pequeño para confirmar acciones.
  let toastTimer;
  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-on'), 2200);
  }

  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-fav]');
    if (!b) return;
    const on = toggleFav(b.dataset.fav);
    document.querySelectorAll(`[data-fav="${b.dataset.fav}"]`).forEach((x) => x.setAttribute('aria-pressed', on));
    toast(on ? 'Guardado en favoritos' : 'Quitado de favoritos');
    document.dispatchEvent(new CustomEvent('favs:change'));
  });

  // Rellena todos los enlaces de contacto desde CONFIG.
  function wireContact() {
    document.querySelectorAll('[data-tel]').forEach((a) => { a.href = CONFIG.phoneHref; });
    document.querySelectorAll('[data-wa]').forEach((a) => { a.href = waLink(a.dataset.wa || 'Hola, escribo desde la web de Inmobiliaria Alves.'); a.target = '_blank'; a.rel = 'noopener'; });
    document.querySelectorAll('[data-phone-text]').forEach((s) => { s.textContent = CONFIG.phone; });
  }

  // Cabecera: sombra al hacer scroll y menú móvil.
  function wireHeader() {
    const h = document.querySelector('.hdr');
    if (!h) return;
    const onScroll = () => h.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const btn = h.querySelector('.hdr__burger');
    const nav = document.getElementById('menu');
    if (!btn || !nav) return;
    const set = (open) => { btn.setAttribute('aria-expanded', open); nav.classList.toggle('is-open', open); document.body.classList.toggle('no-scroll', open); };
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  }

  // Aparición al entrar en pantalla (una sola vez).
  function reveal(scope = document) {
    const els = scope.querySelectorAll('[data-reveal]:not(.is-in)');
    if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach((el) => io.observe(el));
  }

  document.addEventListener('DOMContentLoaded', () => {
    wireContact();
    wireHeader();
    reveal();
    const y = document.querySelector('[data-year]');
    if (y) y.textContent = new Date().getFullYear();
  });

  window.ALVES_UI = { icon, card, waLink, toast, reveal, readFavs, isFav, root };
})();
