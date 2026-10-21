/* Inmo Ángel Machuca · demo. JS sin dependencias. */
(() => {
  const D = window.AM;
  const N = D.negocio;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const IMG = 'assets/img/';
  const mqMobile = matchMedia('(max-width: 720px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  const eur = (n) => n.toLocaleString('es-ES') + ' €';
  const precioTxt = (p) => p.op === 'alquiler' ? `${eur(p.precio)}<small> /mes</small>` : eur(p.precio);
  const precioPlano = (p) => p.op === 'alquiler' ? `${eur(p.precio)}/mes` : eur(p.precio);
  const wa = (msg) => `https://wa.me/${N.whatsapp}?text=${encodeURIComponent(msg)}`;
  const icon = (id) => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const byRef = Object.fromEntries(D.inmuebles.map((p) => [p.ref, p]));

  // ---------- Enlaces de WhatsApp ----------
  function bindWa(root = document) {
    $$('[data-wa]', root).forEach((a) => {
      a.href = wa(a.dataset.wa);
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }
  bindWa();

  // ---------- Toasts ----------
  function toast(text) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = icon('check') + `<span>${esc(text)}</span>`;
    $('#toasts').append(t);
    setTimeout(() => { t.classList.add('out'); t.addEventListener('animationend', () => t.remove(), { once: true }); }, 2400);
  }

  // ---------- Favoritos (solo en este navegador) ----------
  const FAV_KEY = 'inmo-am-favs-v1';
  let favs = new Set();
  try { favs = new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]').filter((r) => byRef[r])); } catch (e) { /* sin almacenamiento */ }
  const saveFavs = () => { try { localStorage.setItem(FAV_KEY, JSON.stringify([...favs])); } catch (e) { /* sin almacenamiento */ } };
  function paintFavCount(bump) {
    const pill = $('#favPill');
    $('#favCount').textContent = favs.size;
    pill.classList.toggle('has', favs.size > 0);
    if (bump) { pill.classList.remove('bump'); void pill.offsetWidth; pill.classList.add('bump'); }
  }
  function toggleFav(ref) {
    const on = !favs.has(ref);
    on ? favs.add(ref) : favs.delete(ref);
    saveFavs();
    paintFavCount(on);
    $$(`[data-fav="${ref}"]`).forEach((b) => b.setAttribute('aria-pressed', String(on)));
    toast(on ? 'Guardado en tus favoritos' : 'Quitado de favoritos');
    if (state.fav) render();
  }
  paintFavCount(false);

  // ---------- Cabecera, menú y botón flotante ----------
  const hdr = $('#hdr');
  const fab = $('#fab');
  const onScroll = () => {
    const y = scrollY;
    hdr.classList.toggle('is-scrolled', y > 8);
    fab.classList.toggle('is-on', y > innerHeight * 0.9 && !document.body.classList.contains('lock'));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('#burger'), sheet = $('#sheet');
  function setSheet(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (open) {
      sheet.hidden = false;
      requestAnimationFrame(() => sheet.classList.add('is-open'));
      document.body.classList.add('lock');
      hdr.classList.add('is-scrolled');
    } else {
      sheet.classList.remove('is-open');
      document.body.classList.remove('lock');
      setTimeout(() => { if (!sheet.classList.contains('is-open')) sheet.hidden = true; }, 260);
      onScroll();
    }
  }
  burger.addEventListener('click', () => setSheet(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', sheet).forEach((a) => a.addEventListener('click', () => setSheet(false)));

  // ---------- Control segmentado ----------
  function seg(el, onChange) {
    const pill = $('.seg__pill', el);
    const btns = $$('button', el);
    const place = (animate) => {
      const b = btns.find((x) => x.getAttribute('aria-selected') === 'true');
      if (!b || !b.offsetWidth) return;
      if (!animate) pill.style.transition = 'none';
      pill.style.width = b.offsetWidth + 'px';
      pill.style.transform = `translateX(${b.offsetLeft}px)`;
      if (!animate) { void pill.offsetWidth; pill.style.transition = ''; }
    };
    const set = (val, silent) => {
      btns.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.val === val)));
      place(true);
      if (!silent) onChange(val);
    };
    btns.forEach((b) => b.addEventListener('click', () => { if (b.getAttribute('aria-selected') !== 'true') set(b.dataset.val); }));
    el.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const i = btns.findIndex((b) => b.getAttribute('aria-selected') === 'true');
      const n = btns[(i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length];
      n.focus(); set(n.dataset.val);
    });
    new ResizeObserver(() => place(false)).observe(el);
    place(false);
    return { set, place };
  }

  // ---------- Estado de búsqueda ----------
  const PRECIOS = {
    venta: [0, 100000, 150000, 200000, 300000, 400000],
    alquiler: [0, 500, 700, 900, 1200],
  };
  const state = { op: 'venta', tipo: '', precio: 0, hab: 0, orden: 'rel', fav: false };

  function fillPrecio(select, op, value) {
    select.innerHTML = PRECIOS[op].map((v) => `<option value="${v}">${v ? 'Hasta ' + eur(v) + (op === 'alquiler' ? '/mes' : '') : 'Sin límite'}</option>`).join('');
    select.value = String(PRECIOS[op].includes(value) ? value : 0);
  }

  // Hero
  const hsTipo = $('#hsTipo'), hsPrecio = $('#hsPrecio'), hsHab = $('#hsHab');
  hsTipo.insertAdjacentHTML('beforeend', D.tipos.map((t) => `<option>${t}</option>`).join(''));
  let heroOp = 'venta';
  fillPrecio(hsPrecio, heroOp, 0);
  const heroSeg = seg($('#heroSearch [data-seg]'), (v) => { heroOp = v; fillPrecio(hsPrecio, v, 0); });
  $('#heroSearch').addEventListener('submit', (e) => {
    e.preventDefault();
    Object.assign(state, { op: heroOp, tipo: hsTipo.value, precio: +hsPrecio.value, hab: +hsHab.value, fav: false });
    syncFilters();
    render();
    $('#inmuebles').scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth' });
  });

  // Filtros del listado
  const fPrecio = $('#fPrecio'), fTipo = $('#fTipo'), fHab = $('#fHab'), fOrden = $('#fOrden'), fFav = $('#fFav');
  const opSeg = seg($('#fOp'), (v) => { state.op = v; state.precio = 0; syncFilters(); render(); });

  function buildTipoChips() {
    const disp = D.inmuebles.filter((p) => p.op === state.op);
    const tipos = D.tipos.filter((t) => disp.some((p) => p.tipo === t));
    if (state.tipo && !tipos.includes(state.tipo)) tipos.push(state.tipo);
    fTipo.innerHTML = ['', ...tipos].map((t) => `<button type="button" class="chip" data-val="${t}" aria-pressed="${state.tipo === t}">${t || 'Todos'}</button>`).join('');
  }
  fTipo.addEventListener('click', (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    state.tipo = b.dataset.val;
    $$('.chip', fTipo).forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
    render();
  });
  fPrecio.addEventListener('change', () => { state.precio = +fPrecio.value; render(); });
  fHab.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    state.hab = +b.dataset.val; syncFilters(); render();
  });
  fOrden.addEventListener('change', () => { state.orden = fOrden.value; render(); });
  fFav.addEventListener('click', () => { state.fav = !state.fav; syncFilters(); render(); });
  $('#reset').addEventListener('click', () => { Object.assign(state, { tipo: '', precio: 0, hab: 0, fav: false }); syncFilters(); render(); });
  $('#fMore').addEventListener('click', (e) => {
    const f = $('#filters'); const open = !f.classList.contains('is-expanded');
    f.classList.toggle('is-expanded', open); e.currentTarget.setAttribute('aria-expanded', String(open));
  });
  $('#favPill').addEventListener('click', () => {
    if (!favs.size) { toast('Pulsa el corazón de un inmueble para guardarlo'); return; }
    state.fav = true;
    const ops = new Set([...favs].map((r) => byRef[r].op));
    if (!ops.has(state.op)) state.op = [...ops][0];
    Object.assign(state, { tipo: '', precio: 0, hab: 0 });
    syncFilters(); render();
    $('#inmuebles').scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth' });
  });
  $$('[data-go]').forEach((a) => a.addEventListener('click', () => {
    Object.assign(state, { op: a.dataset.go, tipo: '', precio: 0, hab: 0, fav: false });
    syncFilters(); render();
  }));

  function syncFilters() {
    opSeg.set(state.op, true);
    fillPrecio(fPrecio, state.op, state.precio);
    buildTipoChips();
    $$('button', fHab).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.val === state.hab)));
    fOrden.value = state.orden;
    fFav.setAttribute('aria-pressed', String(state.fav));
  }

  function results() {
    let r = D.inmuebles.filter((p) =>
      p.op === state.op &&
      (!state.tipo || p.tipo === state.tipo) &&
      (!state.precio || p.precio <= state.precio) &&
      (!state.hab || p.hab >= state.hab) &&
      (!state.fav || favs.has(p.ref)));
    const sorters = {
      rel: (a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0),
      asc: (a, b) => a.precio - b.precio,
      desc: (a, b) => b.precio - a.precio,
      m2: (a, b) => b.m2 - a.m2,
    };
    return r.sort(sorters[state.orden]);
  }

  // ---------- Tarjetas ----------
  function specsHtml(p) {
    const s = [];
    if (p.hab) s.push(`<span>${icon('bed')}${p.hab} hab.</span>`);
    if (p.banos) s.push(`<span>${icon('bath')}${p.banos} ${p.banos > 1 ? 'baños' : 'baño'}</span>`);
    s.push(`<span>${icon(p.tipo === 'Terreno' ? 'plot' : 'area')}${p.m2.toLocaleString('es-ES')} m²</span>`);
    return s.join('');
  }
  function card(p, i = 0) {
    return `<article class="card" style="--i:${Math.min(i, 8)}">
      <div class="card__media">
        <img src="${IMG + p.imgs[0]}" alt="" loading="lazy" width="1200" height="800">
        <div class="card__tags"><span class="tag tag--op">${p.op === 'venta' ? 'Venta' : 'Alquiler'}</span><span class="tag">${esc(p.etiqueta)}</span></div>
        <span class="card__count">${p.imgs.length} fotos</span>
      </div>
      <button class="card__fav" type="button" data-fav="${p.ref}" aria-pressed="${favs.has(p.ref)}" aria-label="Guardar ${esc(p.titulo)}">${icon('heart')}</button>
      <div class="card__body">
        <p class="card__price">${precioTxt(p)}</p>
        <h3 class="card__title">${esc(p.titulo)}</h3>
        <p class="card__zone">${icon('pin')}${esc(p.zona)}</p>
        <div class="card__specs">${specsHtml(p)}<span class="card__ref">${p.ref}</span></div>
      </div>
      <button class="card__open" type="button" data-open="${p.ref}" aria-label="Ver ficha: ${esc(p.titulo)}, ${precioPlano(p)}"></button>
    </article>`;
  }

  document.addEventListener('click', (e) => {
    const f = e.target.closest('[data-fav]');
    if (f) { e.preventDefault(); toggleFav(f.dataset.fav); return; }
    const o = e.target.closest('[data-open]');
    if (o) openDrawer(o.dataset.open, o);
  });

  // ---------- Listado ----------
  const grid = $('#grid'), empty = $('#empty'), count = $('#count');
  let firstRender = true, leaveTimer;
  function render() {
    const r = results();
    const extra = (state.precio ? 1 : 0) + (state.hab ? 1 : 0) + (state.fav ? 1 : 0) + (state.orden !== 'rel' ? 1 : 0);
    $('#fMoreN').textContent = extra || '';
    const paint = () => {
      grid.classList.remove('is-leaving');
      grid.innerHTML = r.map(card).join('');
      empty.hidden = r.length > 0;
      count.textContent = r.length;
      $('#countLabel').textContent = r.length === 1 ? 'inmueble' : 'inmuebles';
      count.classList.remove('is-tick'); void count.offsetWidth; count.classList.add('is-tick');
      const search = `Hola, busco ${state.op === 'venta' ? 'comprar' : 'alquilar'} ${state.tipo ? state.tipo.toLowerCase() : 'vivienda'} en Sanlúcar la Mayor${state.precio ? ' hasta ' + eur(state.precio) : ''}${state.hab ? ', con ' + state.hab + ' habitaciones o más' : ''}. ¿Me avisáis si entra algo así?`;
      $('[data-wa-search]').href = wa(search);
      $('[data-wa-search]').target = '_blank';
    };
    clearTimeout(leaveTimer);
    if (firstRender || reduced.matches) { firstRender = false; paint(); return; }
    grid.classList.add('is-leaving');
    leaveTimer = setTimeout(paint, 150);
  }

  // ---------- Destacados ----------
  const track = $('#featTrack');
  track.innerHTML = D.inmuebles.filter((p) => p.destacado).map(card).join('');
  const prev = $('#featPrev'), next = $('#featNext');
  const step = () => { const c = $('.card', track); return c ? c.offsetWidth + 18 : 300; };
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  const featEnds = () => {
    prev.disabled = track.scrollLeft < 4;
    next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
  };
  track.addEventListener('scroll', featEnds, { passive: true });
  addEventListener('resize', featEnds);
  featEnds();

  // ---------- Ficha (drawer / bottom sheet) ----------
  const drawer = $('#drawer'), panel = $('#panel'), dBody = $('#dBody');
  let lastTrigger = null, closeTimer;

  function detailHtml(p) {
    const imgs = p.imgs.map((src, i) => `<figure><img src="${IMG + src}" alt="${esc(p.titulo)}, imagen ${i + 1} de ${p.imgs.length}" ${i ? 'loading="lazy"' : ''} width="1200" height="800"></figure>`).join('');
    const thumbs = p.imgs.length > 1 ? `<div class="thumbs" role="group" aria-label="Miniaturas">${p.imgs.map((src, i) => `<button type="button" data-go-img="${i}" aria-label="Ver imagen ${i + 1}" aria-current="${i === 0}"><img src="${IMG + src}" alt="" loading="lazy"></button>`).join('')}</div>` : '';
    const specs = [];
    if (p.hab) specs.push(['bed', p.hab, p.hab > 1 ? 'Habitaciones' : 'Habitación']);
    if (p.banos) specs.push(['bath', p.banos, p.banos > 1 ? 'Baños' : 'Baño']);
    specs.push([p.tipo === 'Terreno' ? 'plot' : 'area', p.m2.toLocaleString('es-ES') + ' m²', p.tipo === 'Terreno' ? 'Superficie' : 'Construidos']);
    if (p.parcela) specs.push(['plot', p.parcela.toLocaleString('es-ES') + ' m²', 'Parcela']);
    else specs.push(['pin', p.tipo, 'Tipo']);
    const msg = `Hola, me interesa el inmueble ${p.ref} «${p.titulo}» (${precioPlano(p)}) que he visto en la web. ¿Me dais más información?`;
    const visita = `Hola, me gustaría visitar el inmueble ${p.ref} «${p.titulo}». ¿Qué días tenéis disponibles?`;
    return `
      <div class="gal">
        <div class="gal__track" id="galTrack" tabindex="0" aria-label="Galería de imágenes">${imgs}</div>
        ${p.imgs.length > 1 ? `<button class="icon-btn gal__btn gal__btn--p" type="button" data-gal="-1" aria-label="Imagen anterior">${icon('left')}</button><button class="icon-btn gal__btn gal__btn--n" type="button" data-gal="1" aria-label="Imagen siguiente">${icon('right')}</button>` : ''}
        <span class="gal__idx" id="galIdx">1 / ${p.imgs.length}</span>
      </div>
      ${thumbs}
      <div class="det">
        <div class="det__top">
          <div>
            <p class="det__ref"><span class="tag tag--op">${p.op === 'venta' ? 'Venta' : 'Alquiler'}</span>Ref. ${p.ref}</p>
            <h2 class="det__title" id="dTitle">${esc(p.titulo)}</h2>
            <p class="det__zone">${icon('pin')}${esc(p.zona)}</p>
          </div>
          <p class="det__price">${precioTxt(p)}</p>
        </div>
        <div class="specs">${specs.map(([i, v, l]) => `<div class="spec">${icon(i)}<b>${v}</b><span>${l}</span></div>`).join('')}</div>
        <div><h3>Descripción</h3><p class="det__desc">${esc(p.desc)}</p></div>
        <div><h3>Características</h3><ul class="feats">${p.extras.map((x) => `<li>${icon('check')}${esc(x)}</li>`).join('')}</ul></div>
        <div class="det__acts">
          <a class="btn btn--line" href="${wa(visita)}" target="_blank" rel="noopener">Pedir visita</a>
          <a class="btn btn--line" href="tel:${N.tel}">${icon('phone')}Llamar</a>
          <button class="btn btn--line" type="button" data-share="${p.ref}">${icon('link')}Compartir</button>
        </div>
        <p class="det__note">Inmueble de ejemplo para la demo.</p>
      </div>
      <div class="det__bar">
        <button class="btn btn--line det__fav" type="button" data-fav="${p.ref}" aria-pressed="${favs.has(p.ref)}" aria-label="Guardar en favoritos">${icon('heart')}</button>
        <a class="btn btn--wa btn--lg" href="${wa(msg)}" target="_blank" rel="noopener">${icon('wa')}Me interesa</a>
      </div>`;
  }

  function openDrawer(ref, trigger) {
    const p = byRef[ref]; if (!p) return;
    clearTimeout(closeTimer);
    lastTrigger = trigger || null;
    dBody.innerHTML = detailHtml(p);
    dBody.scrollTop = 0;
    panel.style.transform = '';
    drawer.hidden = false;
    void panel.offsetWidth;
    drawer.classList.add('is-open');
    document.body.classList.add('lock');
    fab.classList.remove('is-on');
    history.replaceState(null, '', '#ref=' + ref);
    initGallery();
    panel.focus({ preventScroll: true });
  }
  function closeDrawer() {
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open');
    panel.style.transform = '';
    document.body.classList.remove('lock');
    history.replaceState(null, '', location.pathname + location.search);
    closeTimer = setTimeout(() => { drawer.hidden = true; dBody.innerHTML = ''; }, 420);
    if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
    onScroll();
  }
  drawer.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) closeDrawer();
    const s = e.target.closest('[data-share]');
    if (s) share(byRef[s.dataset.share]);
  });
  document.addEventListener('keydown', (e) => {
    if (drawer.hidden) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') setSheet(false);
      return;
    }
    if (e.key === 'Escape') closeDrawer();
    if (e.key === 'Tab') {
      const f = $$('a[href], button:not([disabled]), [tabindex="0"]', panel).filter((x) => x.offsetParent);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  async function share(p) {
    const url = location.origin + location.pathname + '#ref=' + p.ref;
    if (navigator.share && mqMobile.matches) {
      try { await navigator.share({ title: p.titulo, text: `${p.titulo} · ${precioPlano(p)}`, url }); } catch (e) { /* cancelado */ }
      return;
    }
    try { await navigator.clipboard.writeText(url); toast('Enlace copiado'); } catch (e) { toast('Copia el enlace de la barra del navegador'); }
  }

  function initGallery() {
    const t = $('#galTrack'); if (!t) return;
    const idx = $('#galIdx');
    const n = t.children.length;
    const go = (i) => t.scrollTo({ left: Math.max(0, Math.min(n - 1, i)) * t.clientWidth, behavior: reduced.matches ? 'auto' : 'smooth' });
    const cur = () => Math.round(t.scrollLeft / t.clientWidth);
    t.addEventListener('scroll', () => {
      const i = cur();
      idx.textContent = `${i + 1} / ${n}`;
      $$('[data-go-img]', dBody).forEach((b) => b.setAttribute('aria-current', String(+b.dataset.goImg === i)));
    }, { passive: true });
    $$('[data-gal]', dBody).forEach((b) => b.addEventListener('click', () => go(cur() + +b.dataset.gal)));
    $$('[data-go-img]', dBody).forEach((b) => b.addEventListener('click', () => go(+b.dataset.goImg)));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(cur() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur() - 1); }
    });
  }

  // Arrastrar para cerrar en móvil: umbral por distancia o por velocidad,
  // y resistencia si se arrastra hacia arriba.
  (() => {
    let sy = 0, sx = 0, st = 0, dy = 0, mode = null;
    panel.addEventListener('touchstart', (e) => {
      if (!mqMobile.matches) return;
      const t = e.touches[0];
      sy = t.clientY; sx = t.clientX; st = performance.now(); dy = 0; mode = null;
    }, { passive: true });
    panel.addEventListener('touchmove', (e) => {
      if (!mqMobile.matches || mode === 'off') return;
      const t = e.touches[0];
      const ddy = t.clientY - sy, ddx = t.clientX - sx;
      if (!mode) {
        if (Math.abs(ddy) < 6 && Math.abs(ddx) < 6) return;
        const fromGrab = e.target.closest('#grab');
        mode = (Math.abs(ddy) > Math.abs(ddx) && ddy > 0 && (fromGrab || dBody.scrollTop <= 0)) ? 'drag' : 'off';
        if (mode === 'drag') drawer.classList.add('is-dragging');
      }
      if (mode !== 'drag') return;
      e.preventDefault();
      dy = ddy > 0 ? ddy : ddy / 4;
      panel.style.transform = `translateY(${dy}px)`;
    }, { passive: false });
    const end = () => {
      if (mode !== 'drag') { mode = null; return; }
      drawer.classList.remove('is-dragging');
      const v = dy / Math.max(1, performance.now() - st);
      if (dy > panel.offsetHeight * 0.25 || v > 0.5) closeDrawer();
      else panel.style.transform = '';
      mode = null;
    };
    panel.addEventListener('touchend', end);
    panel.addEventListener('touchcancel', end);
  })();

  const fromHash = () => {
    const m = location.hash.match(/^#ref=(AM-\d+)$/);
    if (m && byRef[m[1]]) openDrawer(m[1]);
  };

  // ---------- Captación: "Quiero vender mi vivienda" ----------
  const wiz = $('#wizard');
  const wTipo = $('#wTipo');
  wTipo.innerHTML = [...D.tipos, 'Otro'].map((t) => `<button type="button" class="opt" data-val="${t}" aria-pressed="false">${t}</button>`).join('');
  let wStep = 1, wTipoVal = '';
  wTipo.addEventListener('click', (e) => {
    const b = e.target.closest('.opt'); if (!b) return;
    wTipoVal = b.dataset.val;
    $$('.opt', wTipo).forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    $('#wizNext').focus({ preventScroll: true });
  });
  function goStep(n) {
    const view = $('#wizView');
    const from = $(`.wstep[data-step="${wStep}"]`, wiz), to = $(`.wstep[data-step="${n}"]`, wiz);
    const h0 = view.offsetHeight;
    from.hidden = true; from.classList.remove('is-on', 'enter-r', 'enter-l');
    to.hidden = false; to.classList.add('is-on');
    if (!reduced.matches) {
      to.classList.remove('enter-r', 'enter-l'); void to.offsetWidth;
      to.classList.add(n > wStep ? 'enter-r' : 'enter-l');
      const h1 = view.offsetHeight;
      view.style.height = h0 + 'px'; void view.offsetHeight;
      view.style.height = h1 + 'px';
      view.addEventListener('transitionend', () => { view.style.height = ''; }, { once: true });
    }
    wStep = n;
    $('#wizNum').textContent = n;
    $('#wizBar').style.transform = `scaleX(${n / 3})`;
    $('#wizBack').hidden = n === 1;
    $('#wizNext').hidden = n === 3;
    $('#wizSend').hidden = n !== 3;
    const firstInput = $('input, select', to);
    if (firstInput && !mqMobile.matches) firstInput.focus({ preventScroll: true });
  }
  const flagError = (el) => { const f = el.closest('.field') || el; f.classList.remove('is-error'); void f.offsetWidth; f.classList.add('is-error'); };
  $('#wizNext').addEventListener('click', () => {
    if (wStep === 1 && !wTipoVal) { flagError(wTipo); toast('Elige el tipo de inmueble'); return; }
    goStep(wStep + 1);
  });
  $('#wizBack').addEventListener('click', () => goStep(wStep - 1));
  wiz.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(wiz);
    const nombre = (fd.get('nombre') || '').trim(), tel = (fd.get('tel') || '').trim();
    if (!nombre) { flagError(wiz.elements.nombre); wiz.elements.nombre.focus(); return; }
    if (tel.replace(/\D/g, '').length < 9) { flagError(wiz.elements.tel); wiz.elements.tel.focus(); return; }
    const lines = [
      'Hola, quiero vender mi vivienda.',
      `Tipo: ${wTipoVal}`,
      fd.get('zona') ? `Zona: ${fd.get('zona')}` : '',
      fd.get('m2') ? `Metros aprox.: ${fd.get('m2')}` : '',
      `Habitaciones: ${fd.get('hab')}`,
      `Plazo: ${fd.get('plazo')}`,
      `Nombre: ${nombre}`,
      `Teléfono: ${tel}`,
    ].filter(Boolean);
    window.open(wa(lines.join('\n')), '_blank', 'noopener');
    toast('Abriendo WhatsApp con tu mensaje');
  });
  wiz.addEventListener('animationend', (e) => e.target.classList.remove('is-error'));

  // ---------- Proceso ----------
  seg($('#procSeg'), (v) => {
    $$('[data-proc]').forEach((ol) => {
      const on = ol.dataset.proc === v;
      ol.hidden = !on;
      ol.classList.toggle('is-swap', on);
      if (on) $$('.step', ol).forEach((s, i) => { s.style.setProperty('--i', i); s.classList.add('is-in'); });
    });
  });

  // ---------- Mensaje rápido ----------
  const quick = $('#quick');
  let motivo = 'Busco vivienda para comprar';
  $$('.qchip', quick).forEach((b) => b.addEventListener('click', () => {
    motivo = b.dataset.val;
    $$('.qchip', quick).forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
  }));
  quick.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(quick);
    const nombre = (fd.get('nombre') || '').trim(), msg = (fd.get('msg') || '').trim();
    const text = `Hola${nombre ? ', soy ' + nombre : ''}. ${motivo}.${msg ? '\n' + msg : ''}`;
    window.open(wa(text), '_blank', 'noopener');
  });

  // ---------- Revelado al hacer scroll ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  const groups = new Map();
  $$('.reveal').forEach((el) => {
    const k = el.parentElement;
    const i = groups.get(k) || 0;
    groups.set(k, i + 1);
    el.style.setProperty('--d', Math.min(i, 5) * 70 + 'ms');
    io.observe(el);
  });

  // ---------- Inicio ----------
  syncFilters();
  render();
  heroSeg.place(false);
  addEventListener('load', () => document.body.classList.add('is-ready'));
  if (document.readyState === 'complete') document.body.classList.add('is-ready');
  fromHash();
  addEventListener('hashchange', fromHash);
})();
