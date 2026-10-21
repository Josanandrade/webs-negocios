/* Peñaflor Inmobiliaria · demo
   Sin dependencias. Animaciones: transiciones CSS interrumpibles, ease-out,
   solo transform/opacity y respeto a prefers-reduced-motion. */
(function () {
  'use strict';
  const { CONFIG, ZONES, TYPES, LIST, TAGS } = window.PF;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');

  const eur = (n) => n.toLocaleString('es-ES', { maximumFractionDigits: 0 }) + ' €';
  const priceTxt = (p) => p.op === 'alquiler' ? eur(p.price) + '<small>/mes</small>' : eur(p.price);
  const waHref = (text) => CONFIG.whatsapp ? `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}` : '#';
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = (n) => `<svg aria-hidden="true"><use href="#i-${n}"/></svg>`;
  const plural = (n, a, b) => n === 1 ? a : b;

  /* ── Datos de contacto ─────────────────────────────── */
  $$('[data-phone]').forEach((el) => (el.textContent = CONFIG.phone));
  $$('[data-tel]').forEach((el) => (el.href = CONFIG.phoneHref));
  const waGeneral = 'Hola, os escribo desde vuestra web. Me gustaría información sobre viviendas en Camas y el Aljarafe.';
  $$('[data-wa]').forEach((el) => {
    if (!CONFIG.whatsapp) { el.hidden = true; return; }
    el.href = waHref(waGeneral);
  });
  if (!CONFIG.whatsapp) $('[data-mbar]').hidden = true;

  /* ── Toast ──────────────────────────────────────────── */
  const toastEl = $('[data-toast]');
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2200);
  }

  /* ── Cabecera: sólida al bajar, se esconde al seguir bajando ── */
  const top = $('[data-top]');
  const hero = $('.hero');
  const mbar = $('[data-mbar]');
  let lastY = scrollY;
  function onScroll() {
    const y = scrollY;
    const heroEnd = hero.offsetHeight - 80;
    top.classList.toggle('is-solid', y > 40);
    const goingDown = y > lastY;
    if (Math.abs(y - lastY) > 6) {
      top.classList.toggle('is-hidden', goingDown && y > heroEnd + 200 && !menuOpen);
      lastY = y;
    }
    mbar.classList.toggle('is-on', y > heroEnd * 0.7);
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Menú móvil ─────────────────────────────────────── */
  const menu = $('[data-menu]');
  const menuBtn = $('[data-menu-open]');
  let menuOpen = false;
  function setMenu(open) {
    menuOpen = open;
    menuBtn.setAttribute('aria-expanded', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
      top.classList.remove('is-hidden');
    } else {
      menu.classList.remove('is-open');
      setTimeout(() => { if (!menuOpen) menu.hidden = true; }, 300);
    }
  }
  menuBtn.addEventListener('click', () => setMenu(true));
  $$('[data-menu-close]').forEach((el) => el.addEventListener('click', () => setMenu(false)));

  /* ── Revelado al entrar en pantalla ──────────────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach((el) => {
    const sibs = $$('.reveal', el.parentElement);
    el.style.setProperty('--d', Math.min(sibs.indexOf(el), 5) * 70 + 'ms');
    io.observe(el);
  });

  /* ── Selectores segmentados ──────────────────────────── */
  function placePill(seg) {
    const pill = $('.seg__pill', seg);
    const on = $('[aria-selected="true"]', seg);
    if (!pill || !on) return;
    pill.style.width = on.offsetWidth + 'px';
    pill.style.transform = `translateX(${on.offsetLeft}px)`;
  }
  function selectSeg(seg, btn) {
    $$('[role="tab"]', seg).forEach((b) => b.setAttribute('aria-selected', b === btn));
    placePill(seg);
  }
  const segs = $$('[data-seg]');
  // primera colocación sin transición
  segs.forEach((s) => { const p = $('.seg__pill', s); p.style.transition = 'none'; placePill(s); p.offsetWidth; p.style.transition = ''; });
  addEventListener('resize', () => segs.forEach(placePill));
  if (document.fonts) document.fonts.ready.then(() => segs.forEach(placePill));

  /* ── Estado del catálogo ─────────────────────────────── */
  const PRICE_STEPS = {
    venta: [100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 300000, 350000, 400000, 450000, Infinity],
    alquiler: [500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1500, Infinity]
  };
  const state = { op: 'venta', type: '', zone: '', beds: 0, priceIdx: null, extras: new Set(), sort: 'rel', saved: false };
  let saved;
  try { saved = new Set(JSON.parse(localStorage.getItem('penaflor-demo-saved') || '[]')); } catch (e) { saved = new Set(); }
  const persistSaved = () => { try { localStorage.setItem('penaflor-demo-saved', JSON.stringify([...saved])); } catch (e) { /* sin almacenamiento */ } };

  function maxPrice() {
    const steps = PRICE_STEPS[state.op];
    return steps[state.priceIdx == null ? steps.length - 1 : state.priceIdx];
  }
  function matches(p, s = state, opts = {}) {
    if (s.saved && !opts.ignoreSaved) return saved.has(p.ref);
    if (p.op !== s.op) return false;
    if (!opts.ignoreType && s.type && p.type !== s.type) return false;
    if (!opts.ignoreZone && s.zone && p.zone !== s.zone) return false;
    if (s.beds && p.beds < s.beds) return false;
    if (p.price > maxPrice()) return false;
    for (const x of s.extras) if (!p.tags.includes(x)) return false;
    return true;
  }
  function results() {
    const r = LIST.filter((p) => matches(p));
    const by = {
      rel: (a, b) => (b.featured - a.featured) || (b.tags.includes('novedad') - a.tags.includes('novedad')),
      asc: (a, b) => a.price - b.price,
      desc: (a, b) => b.price - a.price,
      m2: (a, b) => b.m2 - a.m2
    }[state.sort];
    return r.sort(by);
  }

  /* ── Tarjeta de catálogo ─────────────────────────────── */
  function tagsHtml(p, max = 3) {
    return p.tags.slice(0, max).map((t) => `<span class="tag tag--${t}">${TAGS[t]}</span>`).join('');
  }
  function specsHtml(p) {
    const s = [];
    if (p.beds) s.push(`<span>${icon('bed')}${p.beds} ${plural(p.beds, 'dorm.', 'dorm.')}</span>`);
    s.push(`<span>${icon('bath')}${p.baths} ${plural(p.baths, 'baño', 'baños')}</span>`);
    s.push(`<span>${icon('area')}${p.m2} m²</span>`);
    return s.join('');
  }
  function cardHtml(p, i) {
    const imgs = [p.cover, ...p.gallery.filter((g) => g !== p.cover)].slice(0, 5);
    const prev = p.prevPrice ? `<s>${eur(p.prevPrice)}</s>` : '';
    return `<article class="card enter" style="--i:${i}" data-ref="${p.ref}">
      <div class="card__media">
        <div class="card__slides" data-slides>${imgs.map((src, k) => `<img src="assets/img/${src}" alt="${k ? 'Foto ' + (k + 1) + ' de ' : ''}${esc(p.title)}" loading="lazy" width="1200" height="800" draggable="false">`).join('')}</div>
        <div class="card__tags">${tagsHtml(p)}</div>
        <div class="card__dots">${imgs.map((_, k) => `<i class="${k ? '' : 'on'}"></i>`).join('')}</div>
        <button class="card__nav card__nav--p" type="button" data-slide="-1" aria-label="Foto anterior">${icon('arrow')}</button>
        <button class="card__nav card__nav--n" type="button" data-slide="1" aria-label="Foto siguiente">${icon('arrow')}</button>
        <button class="fav" type="button" data-fav="${p.ref}" aria-pressed="${saved.has(p.ref)}" aria-label="Guardar ${esc(p.title)}">${icon('heart')}</button>
      </div>
      <div class="card__body" data-open="${p.ref}">
        <p class="card__price">${priceTxt(p)} ${prev}</p>
        <h3 class="card__t">${esc(p.title)}</h3>
        <p class="card__zone">${icon('pin')}${esc(p.zone)} · ${esc(p.area)}</p>
        <div class="specs">${specsHtml(p)}</div>
        <div class="card__foot">
          <button class="btn btn--soft" type="button" data-open="${p.ref}">Ver ficha</button>
          ${CONFIG.whatsapp ? `<a class="btn btn--wa" href="${waHref(visitMsg(p))}" target="_blank" rel="noopener" data-stop>${icon('wa')}Visita</a>` : ''}
        </div>
      </div>
    </article>`;
  }
  function visitMsg(p) {
    return `Hola, me interesa el inmueble ${p.ref}: ${p.title} en ${p.zone} (${eur(p.price)}${p.op === 'alquiler' ? '/mes' : ''}). ¿Podría verlo?`;
  }

  /* ── Render del catálogo ─────────────────────────────── */
  const grid = $('[data-grid]');
  const empty = $('[data-empty]');
  function renderGrid() {
    const r = results();
    grid.innerHTML = r.map(cardHtml).join('');
    empty.hidden = r.length > 0;
    if (!r.length) $('[data-wa-search]').href = waHref(searchMsg());
    $('[data-count]').textContent = r.length;
    $('[data-count-noun]').textContent = state.saved ? plural(r.length, 'guardada', 'guardadas') : plural(r.length, 'vivienda', 'viviendas') + (innerWidth >= 720 ? (state.op === 'alquiler' ? ' en alquiler' : ' en venta') : '');
    $('[data-count-zone]').textContent = state.saved ? '' : state.zone;
    const active = !!(state.type || state.zone || state.beds || state.priceIdx != null || state.extras.size || state.saved);
    $$('[data-reset]').forEach((b) => (b.hidden = !active && b.closest('.filters__bar')));
    const nMore = (state.beds ? 1 : 0) + (state.zone ? 1 : 0) + (state.priceIdx != null ? 1 : 0) + state.extras.size;
    const badge = $('[data-more-badge]');
    badge.hidden = !nMore; badge.textContent = nMore;
    $$('[data-slides]', grid).forEach(bindSlides);
    renderTypeChips();
    syncControls();
  }
  function searchMsg() {
    const bits = [state.op === 'alquiler' ? 'alquilar' : 'comprar', state.type ? state.type.toLowerCase() : 'vivienda'];
    let m = `Hola, busco ${bits[1]} para ${bits[0]}`;
    if (state.zone) m += ` en ${state.zone}`;
    if (state.beds) m += `, mínimo ${state.beds} dormitorios`;
    const mp = maxPrice();
    if (mp !== Infinity) m += `, hasta ${eur(mp)}${state.op === 'alquiler' ? '/mes' : ''}`;
    return m + '. ¿Me avisáis si entra algo así?';
  }

  // tipos con recuento según la operación
  const typeChips = $('[data-type-chips]');
  function renderTypeChips() {
    const counts = {};
    LIST.forEach((p) => { if (matches(p, { ...state, saved: false }, { ignoreType: true })) counts[p.type] = (counts[p.type] || 0) + 1; });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const types = TYPES.filter((t) => counts[t] || state.type === t);
    typeChips.innerHTML = `<button class="chip" type="button" data-type="" aria-pressed="${!state.type}">Todo <small>${total}</small></button>` +
      types.map((t) => `<button class="chip" type="button" data-type="${t}" aria-pressed="${state.type === t}">${t} <small>${counts[t] || 0}</small></button>`).join('');
  }
  typeChips.addEventListener('click', (e) => {
    const b = e.target.closest('[data-type]');
    if (!b) return;
    state.type = b.dataset.type; state.saved = false;
    renderGrid();
  });

  // controles
  const priceInput = $('[data-price]');
  const priceOut = $('[data-price-out]');
  const zoneSelects = [$('[data-f-zone]'), $('[data-s-zone]')];
  ZONES.forEach((z) => zoneSelects.forEach((s) => s.insertAdjacentHTML('beforeend', `<option>${z}</option>`)));
  TYPES.forEach((t) => $('[data-s-type]').insertAdjacentHTML('beforeend', `<option>${t}</option>`));

  function syncControls() {
    const steps = PRICE_STEPS[state.op];
    priceInput.max = steps.length - 1;
    const idx = state.priceIdx == null ? steps.length - 1 : state.priceIdx;
    priceInput.value = idx;
    priceInput.style.setProperty('--p', (idx / (steps.length - 1)) * 100 + '%');
    priceOut.textContent = steps[idx] === Infinity ? 'Sin límite' : eur(steps[idx]) + (state.op === 'alquiler' ? '/mes' : '');
    $$('[data-beds] button').forEach((b) => b.setAttribute('aria-pressed', +b.dataset.v === state.beds));
    $$('[data-extras] button').forEach((b) => b.setAttribute('aria-pressed', state.extras.has(b.dataset.v)));
    $('[data-f-zone]').value = state.zone;
    $('[data-sort]').value = state.sort;
    const catSeg = $('[data-seg="cat"]');
    const want = $(`[data-op="${state.op}"]`, catSeg);
    if (want.getAttribute('aria-selected') !== 'true') selectSeg(catSeg, want);
    const sb = $('[data-saved-btn]');
    sb.classList.toggle('is-on', state.saved);
  }
  priceInput.addEventListener('input', () => {
    const steps = PRICE_STEPS[state.op];
    state.priceIdx = +priceInput.value === steps.length - 1 ? null : +priceInput.value;
    state.saved = false;
    renderGridSoon();
    syncControls();
  });
  let rgT;
  function renderGridSoon() { clearTimeout(rgT); rgT = setTimeout(renderGrid, 120); }
  $('[data-beds]').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; state.beds = +b.dataset.v; state.saved = false; renderGrid(); });
  $('[data-extras]').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    state.extras.has(b.dataset.v) ? state.extras.delete(b.dataset.v) : state.extras.add(b.dataset.v);
    state.saved = false; renderGrid();
  });
  $('[data-f-zone]').addEventListener('change', (e) => { state.zone = e.target.value; state.saved = false; renderGrid(); });
  $('[data-sort]').addEventListener('change', (e) => { state.sort = e.target.value; renderGrid(); });
  $$('[data-reset]').forEach((b) => b.addEventListener('click', () => {
    Object.assign(state, { type: '', zone: '', beds: 0, priceIdx: null, sort: 'rel', saved: false });
    state.extras.clear();
    renderGrid();
  }));
  function setOp(op) {
    if (state.op === op) return;
    state.op = op; state.priceIdx = null; state.type = ''; state.saved = false;
    renderGrid(); updateHeroCount();
  }
  $('[data-seg="cat"]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-op]'); if (!b) return;
    selectSeg(e.currentTarget, b);
    setOp(b.dataset.op);
  });

  // "Más filtros"
  const moreBtn = $('[data-more]');
  const morePanel = $('[data-more-panel]');
  moreBtn.addEventListener('click', () => {
    const open = !morePanel.classList.contains('is-open');
    morePanel.classList.toggle('is-open', open);
    filters.classList.toggle('has-open', open);
    moreBtn.setAttribute('aria-expanded', open);
  });

  // filtros pegados: sombra al quedarse fijos
  const filters = $('[data-filters]');
  const sentinel = document.createElement('div');
  filters.before(sentinel);
  new IntersectionObserver(([e]) => filters.classList.toggle('is-stuck', !e.isIntersecting && e.boundingClientRect.top < 0)).observe(sentinel);

  // Carrusel dentro de cada tarjeta
  function bindSlides(track) {
    const card = track.closest('.card');
    const dots = $$('.card__dots i', card);
    let raf;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const k = Math.round(track.scrollLeft / track.clientWidth);
        dots.forEach((d, j) => d.classList.toggle('on', j === k));
      });
    }, { passive: true });
  }

  // Delegación en la rejilla
  grid.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-slide]');
    if (nav) {
      const track = $('[data-slides]', nav.closest('.card'));
      track.scrollBy({ left: track.clientWidth * +nav.dataset.slide, behavior: reduce ? 'auto' : 'smooth' });
      return;
    }
    const fav = e.target.closest('[data-fav]');
    if (fav) { toggleSaved(fav.dataset.fav, fav); return; }
    if (e.target.closest('[data-stop]')) return;
    const open = e.target.closest('[data-open]');
    if (open) openSheet(open.dataset.open, open);
  });
  // tocar la foto también abre la ficha (si no se ha arrastrado)
  let downX = 0;
  grid.addEventListener('pointerdown', (e) => { downX = e.clientX; });
  grid.addEventListener('click', (e) => {
    const img = e.target.closest('.card__slides img');
    if (img && Math.abs(e.clientX - downX) < 6) openSheet(img.closest('.card').dataset.ref, img);
  });

  /* ── Guardados ───────────────────────────────────────── */
  const savedBtn = $('[data-saved-btn]');
  function paintSaved(bump) {
    $('[data-saved-count]').textContent = saved.size;
    savedBtn.classList.toggle('has', saved.size > 0);
    if (bump && !reduce) { savedBtn.classList.remove('bump'); void savedBtn.offsetWidth; savedBtn.classList.add('bump'); }
  }
  function toggleSaved(ref, btn) {
    const on = !saved.has(ref);
    on ? saved.add(ref) : saved.delete(ref);
    persistSaved();
    $$(`[data-fav="${ref}"]`).forEach((b) => b.setAttribute('aria-pressed', on));
    paintSaved(on);
    toast(on ? 'Guardada en tus favoritos' : 'Quitada de favoritos');
    if (state.saved && !on) renderGrid();
  }
  savedBtn.addEventListener('click', () => {
    if (!saved.size) { toast('Toca el corazón de una vivienda para guardarla'); return; }
    state.saved = !state.saved;
    renderGrid();
    if (state.saved) document.getElementById('catalogo').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });
  paintSaved(false);

  /* ── Hero: buscador ──────────────────────────────────── */
  const heroSeg = $('[data-seg="hero"]');
  const hs = { op: 'venta' };
  const sCount = $('[data-s-count]');
  function heroResults() {
    const zone = $('[data-s-zone]').value, type = $('[data-s-type]').value, beds = +$('[data-s-beds]').value;
    return LIST.filter((p) => p.op === hs.op && (!zone || p.zone === zone) && (!type || p.type === type) && p.beds >= beds);
  }
  function updateHeroCount() {
    const n = heroResults().length;
    if (sCount.textContent !== String(n)) {
      sCount.textContent = n;
      if (!reduce) { sCount.classList.remove('tick'); void sCount.offsetWidth; sCount.classList.add('tick'); }
    }
    $('[data-s-noun]').textContent = plural(n, 'vivienda', 'viviendas');
  }
  heroSeg.addEventListener('click', (e) => {
    const b = e.target.closest('[data-op]'); if (!b) return;
    selectSeg(heroSeg, b); hs.op = b.dataset.op; updateHeroCount();
  });
  ['[data-s-zone]', '[data-s-type]', '[data-s-beds]'].forEach((s) => $(s).addEventListener('change', updateHeroCount));
  $('[data-search]').addEventListener('submit', (e) => {
    e.preventDefault();
    Object.assign(state, { op: hs.op, zone: $('[data-s-zone]').value, type: $('[data-s-type]').value, beds: +$('[data-s-beds]').value, priceIdx: null, saved: false });
    state.extras.clear();
    renderGrid();
    document.getElementById('catalogo').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });
  updateHeroCount();

  // enlaces de navegación Comprar / Alquilar
  $$('[data-op-link]').forEach((a) => a.addEventListener('click', () => {
    state.op = a.dataset.opLink; state.priceIdx = null; state.type = ''; state.saved = false;
    renderGrid();
  }));

  /* ── Zonas ───────────────────────────────────────────── */
  const zonesRow = $('[data-zones]');
  zonesRow.innerHTML = ZONES.map((z) => {
    const n = LIST.filter((p) => p.zone === z).length;
    return n ? `<button class="zone" type="button" data-zone="${z}"><b>${n}</b>${z}</button>` : '';
  }).join('');
  zonesRow.addEventListener('click', (e) => {
    const b = e.target.closest('[data-zone]'); if (!b) return;
    const z = b.dataset.zone;
    if (!LIST.some((p) => p.zone === z && p.op === state.op)) state.op = state.op === 'venta' ? 'alquiler' : 'venta';
    Object.assign(state, { zone: z, type: '', saved: false, priceIdx: null });
    renderGrid();
    document.getElementById('catalogo').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ── Mazo del hero (arrastrar y lanzar) ──────────────── */
  const deckEl = $('[data-deck]');
  const deckItems = LIST.filter((p) => p.featured).concat(LIST.filter((p) => !p.featured && p.tags.includes('novedad')));
  let deckIdx = 0;
  function dcardHtml(p) {
    const lead = p.tags.find((t) => ['novedad', 'exclusiva', 'bajada'].includes(t)) || p.tags[0];
    return `<div class="dcard" data-ref="${p.ref}">
      <img src="assets/img/${p.cover}" alt="${esc(p.title)}" width="1200" height="800" draggable="false">
      <span class="dcard__tag tag tag--${lead}">${TAGS[lead]}</span>
      <div class="dcard__info">
        <p class="dcard__zone">${icon('pin')}${esc(p.zone)}</p>
        <p class="dcard__t">${esc(p.title)}</p>
        <div class="dcard__row"><p class="dcard__price">${priceTxt(p)}</p><button class="dcard__open" type="button" data-deck-open="${p.ref}">Ver${icon('arrow')}</button></div>
      </div>
    </div>`;
  }
  // tres cartas apiladas: 0 delante
  const STACK = [
    'translate3d(0,0,0) rotate(0deg) scale(1)',
    'translate3d(14px,-14px,0) rotate(3deg) scale(.96)',
    'translate3d(26px,-26px,0) rotate(6deg) scale(.92)'
  ];
  function layoutDeck() {
    const cards = $$('.dcard', deckEl);
    cards.forEach((c, i) => {
      c.style.zIndex = 10 - i;
      c.style.transform = STACK[Math.min(i, 2)];
      c.style.opacity = i > 2 ? 0 : 1;
      c.setAttribute('aria-hidden', i > 0);
      $$('button', c).forEach((b) => (b.tabIndex = i ? -1 : 0));
    });
  }
  function buildDeck() {
    const order = [];
    for (let i = 0; i < 4; i++) order.push(deckItems[(deckIdx + i) % deckItems.length]);
    deckEl.innerHTML = order.map(dcardHtml).join('');
    layoutDeck();
  }
  function throwTop(dir = 1, vx = 0) {
    const topCard = $('.dcard', deckEl);
    if (!topCard) return;
    topCard.classList.remove('is-drag');
    const dist = Math.max(innerWidth, 600) * dir;
    topCard.style.transition = `transform ${reduce ? 0 : Math.max(0.22, 0.42 - Math.abs(vx) * 0.1)}s var(--ease-out), opacity .3s ease`;
    topCard.style.transform = `translate3d(${dist}px, ${-40}px, 0) rotate(${dir * 24}deg)`;
    topCard.style.opacity = '0';
    deckIdx = (deckIdx + 1) % deckItems.length;
    // las demás suben un puesto
    const rest = $$('.dcard', deckEl).slice(1);
    rest.forEach((c, i) => { c.style.zIndex = 10 - i; c.style.transform = STACK[Math.min(i, 2)]; c.style.opacity = i > 2 ? 0 : 1; });
    setTimeout(() => {
      topCard.remove();
      const next = deckItems[(deckIdx + 3) % deckItems.length];
      deckEl.insertAdjacentHTML('beforeend', dcardHtml(next));
      const added = deckEl.lastElementChild;
      added.style.transition = 'none';
      added.style.opacity = 0;
      added.style.transform = STACK[2];
      added.offsetWidth;
      added.style.transition = '';
      layoutDeck();
    }, reduce ? 0 : 380);
  }
  // arrastre con velocidad
  let drag = null;
  deckEl.addEventListener('pointerdown', (e) => {
    const card = e.target.closest('.dcard');
    if (!card || card !== deckEl.firstElementChild || e.target.closest('button')) return;
    drag = { card, x: e.clientX, y: e.clientY, dx: 0, t: performance.now(), lastX: e.clientX, lastT: performance.now(), v: 0, moved: false, id: e.pointerId };
  });
  addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved) {
      if (Math.abs(dx) < 6) return;
      if (Math.abs(dy) > Math.abs(dx)) { drag = null; return; } // gesto vertical: dejar hacer scroll
      drag.moved = true;
      drag.card.classList.add('is-drag');
      try { drag.card.setPointerCapture(e.pointerId); } catch (err) { /* nada */ }
    }
    const now = performance.now();
    drag.v = (e.clientX - drag.lastX) / Math.max(1, now - drag.lastT);
    drag.lastX = e.clientX; drag.lastT = now;
    drag.dx = dx;
    drag.card.style.transform = `translate3d(${dx}px, ${dy * 0.15}px, 0) rotate(${dx / 18}deg)`;
  });
  function endDrag() {
    if (!drag) return;
    const { card, dx, v, moved } = drag;
    drag = null;
    if (!moved) return;
    card.classList.remove('is-drag');
    if (Math.abs(dx) > 90 || Math.abs(v) > 0.45) throwTop(Math.sign(dx || v) || 1, v);
    else card.style.transform = STACK[0];
  }
  addEventListener('pointerup', endDrag);
  addEventListener('pointercancel', endDrag);
  deckEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-deck-open]');
    if (b) openSheet(b.dataset.deckOpen, b);
  });
  $('[data-deck-next]').addEventListener('click', () => throwTop(1, 0));
  buildDeck();

  /* ── Destacados (rail) ───────────────────────────────── */
  const rail = $('[data-rail]');
  rail.innerHTML = LIST.filter((p) => p.featured).map((p) => `
    <button class="fcard" type="button" data-open-f="${p.ref}" aria-label="${esc(p.title)}, ${esc(p.zone)}">
      <img src="assets/img/${p.cover}" alt="" loading="lazy" width="1200" height="800">
      <span class="fcard__tags">${tagsHtml(p, 2)}<span class="tag tag--op">${p.op === 'venta' ? 'Venta' : 'Alquiler'}</span></span>
      <span class="fcard__b">
        <span class="fcard__t">${esc(p.title)}</span>
        <span class="fcard__meta"><span>${icon('pin')}${esc(p.zone)}</span>${p.beds ? `<span>${icon('bed')}${p.beds}</span>` : ''}<span>${icon('bath')}${p.baths}</span><span>${icon('area')}${p.m2} m²</span></span>
        <span class="fcard__price">${eur(p.price)}${p.op === 'alquiler' ? '/mes' : ''}</span>
      </span>
    </button>`).join('');
  rail.addEventListener('click', (e) => { const b = e.target.closest('[data-open-f]'); if (b) openSheet(b.dataset.openF, b); });
  const railBar = $('[data-rail-bar]');
  const railPrev = $('[data-rail-prev]'), railNext = $('[data-rail-next]');
  function railProgress() {
    const max = rail.scrollWidth - rail.clientWidth;
    const vis = rail.clientWidth / rail.scrollWidth;
    railBar.style.width = vis * 100 + '%';
    railBar.style.transform = `translateX(${max > 0 ? (rail.scrollLeft / max) * ((1 - vis) / vis) * 100 : 0}%)`;
    railPrev.disabled = rail.scrollLeft < 8;
    railNext.disabled = rail.scrollLeft > max - 8;
  }
  rail.addEventListener('scroll', () => requestAnimationFrame(railProgress), { passive: true });
  addEventListener('resize', railProgress);
  railProgress();
  const railStep = () => (rail.firstElementChild ? rail.firstElementChild.offsetWidth + 20 : 300);
  railPrev.addEventListener('click', () => rail.scrollBy({ left: -railStep(), behavior: reduce ? 'auto' : 'smooth' }));
  railNext.addEventListener('click', () => rail.scrollBy({ left: railStep(), behavior: reduce ? 'auto' : 'smooth' }));

  /* ── Ficha (bottom sheet en móvil, modal en escritorio) ── */
  const sheet = $('[data-sheet]');
  const panel = $('[data-sheet-panel]');
  const body = $('[data-sheet-body]');
  let lastFocus = null, sheetOpen = false;

  function sheetHtml(p) {
    const imgs = [p.cover, ...p.gallery.filter((g) => g !== p.cover)];
    const ppm = p.op === 'venta' ? `<span>${eur(Math.round(p.price / p.m2))}/m²</span>` : '<span>al mes</span>';
    const prev = p.prevPrice ? `<span><s>${eur(p.prevPrice)}</s></span>` : '';
    const specs = [
      p.beds ? `<div>${icon('bed')}<b>${p.beds}</b><small>${plural(p.beds, 'dormitorio', 'dormitorios')}</small></div>` : '',
      `<div>${icon('bath')}<b>${p.baths}</b><small>${plural(p.baths, 'baño', 'baños')}</small></div>`,
      `<div>${icon('area')}<b>${p.m2} m²</b><small>${p.plot ? 'parcela ' + p.plot.toLocaleString('es-ES') + ' m²' : 'construidos'}</small></div>`
    ].join('');
    const calc = p.op === 'venta' ? `
      <div class="sh-box calc" data-calc data-price="${p.price}">
        <p class="sh-box__t">¿Qué cuota tendría?</p>
        <p class="sh-box__s">Mueve los valores para hacerte una idea.</p>
        <div class="calc__row"><span>Entrada</span><b data-c-down-out></b></div>
        <input class="range" type="range" min="10" max="50" step="5" value="20" data-c-down aria-label="Entrada en porcentaje">
        <div class="calc__row"><span>Plazo</span><b data-c-years-out></b></div>
        <input class="range" type="range" min="10" max="35" step="5" value="30" data-c-years aria-label="Plazo en años">
        <div class="calc__row"><span>Interés anual</span><b data-c-rate-out></b></div>
        <input class="range" type="range" min="1.5" max="5" step="0.25" value="3" data-c-rate aria-label="Interés anual">
        <div class="calc__out"><span>Cuota aprox.</span><b data-c-out></b></div>
        <p class="calc__note">Cálculo orientativo sin gastos ni impuestos. No es una oferta de financiación.</p>
      </div>` : '';
    return `
      <div class="sh-gal">
        <div class="sh-gal__track" data-gal>${imgs.map((s, k) => `<img src="assets/img/${s}" alt="Foto ${k + 1} de ${esc(p.title)}" width="1200" height="800" draggable="false">`).join('')}</div>
        <span class="sh-gal__n" data-gal-n>1 / ${imgs.length}</span>
      </div>
      ${imgs.length > 1 ? `<div class="sh-thumbs" data-thumbs>${imgs.map((s, k) => `<button type="button" class="${k ? '' : 'on'}" data-k="${k}" aria-label="Ver foto ${k + 1}"><img src="assets/img/${s}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
      <div class="sh-main">
        <div>
          <div class="sh-tags">${p.tags.map((t) => `<span class="tag tag--${t}">${TAGS[t]}</span>`).join('')}</div>
          <h2 class="sh-t" id="sh-title">${esc(p.title)}</h2>
          <p class="sh-zone">${icon('pin')}${esc(p.zone)} · ${esc(p.area)}</p>
          <div class="sh-price"><b>${eur(p.price)}</b>${prev}${ppm}</div>
          <div class="sh-specs">${specs}</div>
          <p class="sh-h">Descripción</p>
          <p class="sh-text">${esc(p.text)}</p>
          <p class="sh-h">Características</p>
          <ul class="sh-feat">${p.features.map((f) => `<li>${icon('check')}${esc(f)}</li>`).join('')}</ul>
        </div>
        <aside class="sh-aside">
          <div class="sh-box">
            <p class="sh-box__t">¿Te gusta? Ven a verla</p>
            <p class="sh-box__s">Te respondemos por WhatsApp con días y horas para la visita.</p>
            ${CONFIG.whatsapp ? `<a class="btn btn--wa" href="${waHref(visitMsg(p))}" target="_blank" rel="noopener">${icon('wa')}Pedir visita por WhatsApp</a>` : ''}
            <a class="btn btn--soft" href="${CONFIG.phoneHref}">${icon('phone')}Llamar al ${CONFIG.phone}</a>
            <button class="btn btn--soft" type="button" data-fav="${p.ref}" aria-pressed="${saved.has(p.ref)}" data-sheet-fav>${icon('heart')}<span>${saved.has(p.ref) ? 'Guardada' : 'Guardar'}</span></button>
          </div>
          ${calc}
          <p class="sh-ref">Referencia ${p.ref} · Inmueble de ejemplo</p>
        </aside>
      </div>`;
  }

  function bindSheet(p) {
    const gal = $('[data-gal]', body), n = $('[data-gal-n]', body), thumbs = $$('[data-thumbs] button', body);
    gal.addEventListener('scroll', () => requestAnimationFrame(() => {
      const k = Math.round(gal.scrollLeft / gal.clientWidth);
      n.textContent = `${k + 1} / ${gal.children.length}`;
      thumbs.forEach((t, j) => t.classList.toggle('on', j === k));
    }), { passive: true });
    thumbs.forEach((t) => t.addEventListener('click', () => gal.scrollTo({ left: gal.clientWidth * +t.dataset.k, behavior: reduce ? 'auto' : 'smooth' })));
    const fav = $('[data-sheet-fav]', body);
    fav.addEventListener('click', () => { toggleSaved(p.ref); $('span', fav).textContent = saved.has(p.ref) ? 'Guardada' : 'Guardar'; });
    const calc = $('[data-calc]', body);
    if (calc) {
      const price = +calc.dataset.price;
      const upd = () => {
        const down = +$('[data-c-down]', calc).value, years = +$('[data-c-years]', calc).value, rate = +$('[data-c-rate]', calc).value;
        const P = price * (1 - down / 100), i = rate / 100 / 12, N = years * 12;
        const q = i ? P * i / (1 - Math.pow(1 + i, -N)) : P / N;
        $('[data-c-down-out]', calc).textContent = `${down}% · ${eur(Math.round(price * down / 100))}`;
        $('[data-c-years-out]', calc).textContent = `${years} años`;
        $('[data-c-rate-out]', calc).textContent = `${rate.toLocaleString('es-ES')} %`;
        $('[data-c-out]', calc).textContent = eur(Math.round(q)) + '/mes';
        $$('.range', calc).forEach((r) => r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min)) * 100 + '%'));
      };
      calc.addEventListener('input', upd);
      upd();
    }
  }

  function openSheet(ref, from) {
    const p = LIST.find((x) => x.ref === ref);
    if (!p) return;
    lastFocus = from || document.activeElement;
    body.innerHTML = sheetHtml(p);
    body.scrollTop = 0;
    bindSheet(p);
    sheet.hidden = false;
    document.body.classList.add('lock');
    panel.style.setProperty('--drag', '0px');
    requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add('is-open')));
    sheetOpen = true;
    setTimeout(() => panel.focus({ preventScroll: true }), 60);
    if (location.hash !== '#' + p.ref) history.pushState({ ref: p.ref }, '', '#' + p.ref);
  }
  function closeSheet(fromPop) {
    if (!sheetOpen) return;
    sheetOpen = false;
    sheet.classList.remove('is-open');
    panel.style.setProperty('--drag', '0px');
    document.body.classList.remove('lock');
    setTimeout(() => { if (!sheetOpen) { sheet.hidden = true; body.innerHTML = ''; } }, reduce ? 0 : 420);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    if (!fromPop && history.state && history.state.ref) history.back();
  }
  $$('[data-sheet-close]').forEach((el) => el.addEventListener('click', () => closeSheet()));
  addEventListener('popstate', () => {
    const ref = location.hash.slice(1);
    if (sheetOpen && !LIST.some((p) => p.ref === ref)) closeSheet(true);
    else if (!sheetOpen && LIST.some((p) => p.ref === ref)) openSheet(ref);
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (sheetOpen) closeSheet(); else if (menuOpen) setMenu(false); }
    if (e.key === 'Tab' && sheetOpen) { // foco dentro de la ficha
      const f = $$('a[href], button:not([disabled]), input, [tabindex="0"]', panel).filter((el) => el.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  // arrastrar hacia abajo para cerrar (móvil): desde el asa o con la ficha arriba del todo
  let sd = null;
  panel.addEventListener('touchstart', (e) => {
    if (innerWidth >= 900) return;
    const onGrab = !!e.target.closest('[data-sheet-grab]');
    if (!onGrab && body.scrollTop > 0) return;
    const t = e.touches[0];
    sd = { y: t.clientY, x: t.clientX, dy: 0, active: onGrab, t: performance.now() };
  }, { passive: true });
  panel.addEventListener('touchmove', (e) => {
    if (!sd) return;
    const t = e.touches[0];
    const dy = t.clientY - sd.y, dx = t.clientX - sd.x;
    if (!sd.active) {
      if (Math.abs(dx) > Math.abs(dy) || dy <= 4 || body.scrollTop > 0) { if (Math.abs(dx) > 8 || dy < -4) sd = null; return; }
      sd.active = true;
    }
    e.preventDefault();
    sd.dy = Math.max(0, dy);
    // resistencia suave
    panel.classList.add('is-drag');
    panel.style.setProperty('--drag', sd.dy + 'px');
  }, { passive: false });
  panel.addEventListener('touchend', () => {
    if (!sd) return;
    const v = sd.dy / Math.max(1, performance.now() - sd.t);
    panel.classList.remove('is-drag');
    if (sd.active && (sd.dy > panel.offsetHeight * 0.25 || v > 0.6)) closeSheet();
    else panel.style.setProperty('--drag', '0px');
    sd = null;
  });

  /* ── Pasos de venta: la línea avanza con el scroll ───── */
  const stepsEl = $('[data-steps]');
  const stepItems = $$('.step', stepsEl);
  function stepsProgress() {
    const r = stepsEl.getBoundingClientRect();
    const mid = innerHeight * 0.62;
    const prog = Math.min(1, Math.max(0, (mid - r.top) / r.height));
    stepsEl.style.setProperty('--prog', prog.toFixed(3));
    stepItems.forEach((s) => s.classList.toggle('is-lit', s.getBoundingClientRect().top + 26 < mid));
  }
  addEventListener('scroll', () => requestAnimationFrame(stepsProgress), { passive: true });
  stepsProgress();

  /* ── Valoración paso a paso ──────────────────────────── */
  const wiz = $('[data-wiz]');
  const panes = $$('[data-pane]', wiz);
  const wv = { type: '', zone: '', state: '', beds: 3 };
  let step = 1;
  $('[data-opts="zone"]', wiz).innerHTML = ZONES.concat('Otra zona').map((z) => `<button type="button" data-v="${z}">${z}</button>`).join('');
  $$('[data-opts]', wiz).forEach((g) => g.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', g).forEach((x) => x.setAttribute('aria-pressed', x === b));
    wv[g.dataset.opts] = b.dataset.v;
    err('');
    if (g.dataset.opts !== 'state') setTimeout(() => go(step + 1), reduce ? 0 : 180);
  }));
  $$('[data-opts] button', wiz).forEach((b) => b.setAttribute('aria-pressed', 'false'));
  $('[data-stepper]', wiz).addEventListener('click', (e) => {
    const b = e.target.closest('[data-d]'); if (!b) return;
    wv.beds = Math.min(8, Math.max(0, wv.beds + +b.dataset.d));
    $('[data-w-beds]', wiz).textContent = wv.beds;
  });
  const errEl = $('[data-wiz-err]', wiz);
  function err(msg) {
    errEl.textContent = msg;
    if (msg && !reduce) { errEl.classList.remove('shake'); void errEl.offsetWidth; errEl.classList.add('shake'); }
  }
  function valid(s) {
    if (s === 1 && !wv.type) return 'Elige el tipo de vivienda.';
    if (s === 2 && !wv.zone) return 'Elige la zona.';
    if (s === 3) {
      const m2 = +$('[data-w-m2]', wiz).value;
      if (!m2 || m2 < 20) return 'Indica la superficie aproximada.';
      if (!wv.state) return 'Elige el estado de la vivienda.';
    }
    if (s === 4) {
      if ($('[data-w-name]', wiz).value.trim().length < 2) return 'Escribe tu nombre.';
      if ($('[data-w-tel]', wiz).value.replace(/\D/g, '').length < 9) return 'Revisa el teléfono.';
      if (!$('[data-w-ok]', wiz).checked) return 'Necesitamos tu permiso para contactarte.';
    }
    return '';
  }
  function go(n) {
    if (n > step) { const m = valid(step); if (m) { err(m); return; } }
    err('');
    step = Math.max(1, Math.min(5, n));
    panes.forEach((p) => {
      const k = +p.dataset.pane;
      p.classList.toggle('is-on', k === step);
      p.classList.toggle('is-past', k < step);
      p.inert = k !== step;
    });
    $('[data-wiz-n]', wiz).textContent = Math.min(step, 4);
    $('[data-wiz-bar]', wiz).style.transform = `scaleX(${Math.min(step, 4) / 4})`;
    const nav = $('[data-wiz-nav]', wiz);
    nav.classList.toggle('can-back', step > 1 && step < 5);
    nav.hidden = step === 5;
    $('[data-wiz-next]', wiz).firstChild.textContent = step === 4 ? 'Pedir valoración' : 'Siguiente';
    $('.wiz__step', wiz).style.visibility = step === 5 ? 'hidden' : '';
    if (step === 5) {
      const name = $('[data-w-name]', wiz).value.trim();
      $('[data-w-hi]', wiz).textContent = name.split(' ')[0];
      const msg = `Hola, soy ${name}. Me gustaría valorar mi vivienda:\n• Tipo: ${wv.type}\n• Zona: ${wv.zone}\n• Superficie: ${$('[data-w-m2]', wiz).value} m²\n• Dormitorios: ${wv.beds}\n• Estado: ${wv.state}\n• Teléfono: ${$('[data-w-tel]', wiz).value.trim()}`;
      $('[data-w-wa]', wiz).href = waHref(msg);
      $('[data-w-wa]', wiz).hidden = !CONFIG.whatsapp;
    }
  }
  $('[data-wiz-next]', wiz).addEventListener('click', () => go(step + 1));
  $('[data-wiz-back]', wiz).addEventListener('click', () => go(step - 1));
  $('[data-w-restart]', wiz).addEventListener('click', () => {
    wiz.reset(); Object.assign(wv, { type: '', zone: '', state: '', beds: 3 });
    $('[data-w-beds]', wiz).textContent = 3;
    $$('[data-opts] button', wiz).forEach((b) => b.setAttribute('aria-pressed', 'false'));
    step = 1; go(1);
  });
  wiz.addEventListener('submit', (e) => { e.preventDefault(); go(step + 1); });
  wiz.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') { e.preventDefault(); go(step + 1); } });
  go(1);

  /* ── Servicios: comprador / vendedor ─────────────────── */
  const svcSeg = $('[data-seg="svc"]');
  svcSeg.addEventListener('click', (e) => {
    const b = e.target.closest('[data-svc]'); if (!b) return;
    selectSeg(svcSeg, b);
    $$('[data-svc-panel]').forEach((p) => {
      const on = p.dataset.svcPanel === b.dataset.svc;
      p.hidden = !on;
      if (on && !reduce) { p.classList.remove('enter'); void p.offsetWidth; p.classList.add('enter'); }
    });
  });

  /* ── Contacto ────────────────────────────────────────── */
  const cform = $('[data-cform]');
  let cWant = 'comprar';
  $('.cform__seg', cform).addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    $$('.cform__seg button', cform).forEach((x) => x.setAttribute('aria-pressed', x === b));
    cWant = b.dataset.v;
  });
  cform.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('[data-c-name]', cform).value.trim();
    const cErr = $('[data-c-err]', cform);
    if (name.length < 2) { cErr.textContent = 'Escribe tu nombre para que sepamos a quién respondemos.'; return; }
    cErr.textContent = '';
    const msg = `Hola, soy ${name}. Quiero ${cWant}.${$('[data-c-msg]', cform).value.trim() ? ' ' + $('[data-c-msg]', cform).value.trim() : ''}`;
    if (CONFIG.whatsapp) window.open(waHref(msg), '_blank', 'noopener');
    else location.href = CONFIG.phoneHref;
  });

  /* ── Arranque ────────────────────────────────────────── */
  renderGrid();
  const initRef = location.hash.slice(1);
  if (LIST.some((p) => p.ref === initRef)) { history.replaceState(null, '', location.pathname); openSheet(initRef); }
})();
