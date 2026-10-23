(() => {
  const { negocio, inmuebles, estados, fmtPrecio } = window.GC;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ico = (id) => `<svg class="i" aria-hidden="true"><use href="assets/icons.svg#${id}"/></svg>`;
  const img = (name) => `assets/img/${name}.svg`;
  const waLink = (msg) => `https://wa.me/${negocio.whatsapp}?text=${encodeURIComponent(msg)}`;
  const publicos = inmuebles.filter((p) => p.publicado);

  // ---------- Toast ----------
  const toastEl = $('[data-toast]');
  let toastT;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('on'), 2600);
  };

  // ---------- Header ----------
  const top = $('[data-top]');
  const onScroll = () => top.classList.toggle('is-scrolled', scrollY > 12);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Entradas ----------
  $$('.display .line').forEach((l, i) => { l.innerHTML = `<span style="--d:${120 + i * 110}ms">${l.innerHTML}</span>`; });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  const observeIn = (root = document) => {
    const groups = new Map();
    $$('[data-in]:not(.in)', root).forEach((el) => {
      const parent = el.parentElement;
      const n = groups.get(parent) || 0;
      groups.set(parent, n + 1);
      if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', `${Math.min(n, 6) * 70}ms`);
      io.observe(el);
    });
  };
  const steps = $('[data-steps]');
  if (steps) io.observe(steps);
  observeIn();
  requestAnimationFrame(() => document.documentElement.classList.add('is-ready'));

  // ---------- Llaveros del hero ----------
  const tagsEl = $('[data-tags]');
  const destacados = ['GC-102', 'GC-101', 'GC-104', 'GC-103'].map((r) => inmuebles.find((p) => p.ref === r));
  let order = destacados.map((_, i) => i);
  tagsEl.innerHTML = destacados.map((p, i) => `
    <li class="tag" data-i="${i}" data-pos="${i}" aria-hidden="${i ? 'true' : 'false'}">
      <div class="tag-img"><img src="${img(p.img)}" alt="Ilustración: ${p.titulo}" draggable="false"><em class="st st-${p.estado}">${estados[p.estado].label}</em><span class="tag-ex">Ejemplo</span></div>
      <div class="tag-meta">
        <span class="tag-ref">${p.ref} · ${p.zona}</span>
        <span class="tag-title">${p.titulo}</span>
        <span class="tag-price">${fmtPrecio(p)}</span>
        <span class="tag-specs">${p.hab ? `<span>${ico('bed')}${p.hab}</span>` : ''}<span>${ico('bath')}${p.banos}</span><span>${ico('area')}${p.m2} m²</span></span>
      </div>
    </li>`).join('');
  const tagEls = $$('.tag', tagsEl);
  const countEl = $('[data-tag-count]');
  const paintTags = () => {
    order.forEach((idx, pos) => { tagEls[idx].dataset.pos = pos; tagEls[idx].setAttribute('aria-hidden', pos ? 'true' : 'false'); });
    countEl.textContent = `${order[0] + 1} / ${destacados.length}`;
  };
  let busy = false;
  const nextTag = () => {
    if (busy) return;
    busy = true;
    const front = tagEls[order[0]];
    front.classList.add('is-leaving');
    setTimeout(() => {
      order.push(order.shift());
      front.classList.remove('is-leaving');
      front.style.transform = '';
      paintTags();
      busy = false;
    }, reduce ? 0 : 320);
  };
  const prevTag = () => { order.unshift(order.pop()); paintTags(); };
  $('[data-tag-next]').addEventListener('click', () => { nextTag(); restartAuto(); });
  $('[data-tag-prev]').addEventListener('click', () => { prevTag(); restartAuto(); });
  // arrastrar la tarjeta frontal
  let drag = null;
  tagsEl.addEventListener('pointerdown', (e) => {
    const t = e.target.closest('.tag');
    if (!t || t.dataset.pos !== '0') return;
    drag = { t, x: e.clientX, dx: 0, at: performance.now() };
    t.classList.add('is-dragging');
    t.setPointerCapture(e.pointerId);
  });
  tagsEl.addEventListener('pointermove', (e) => {
    if (!drag) return;
    drag.dx = e.clientX - drag.x;
    drag.t.style.transform = `translateX(${drag.dx}px) rotate(${-2 + drag.dx / 18}deg)`;
  });
  const endDrag = () => {
    if (!drag) return;
    const { t, dx, at } = drag;
    const v = Math.abs(dx) / (performance.now() - at);
    t.classList.remove('is-dragging');
    drag = null;
    if (Math.abs(dx) > 90 || v > 0.6) { nextTag(); restartAuto(); }
    else if (Math.abs(dx) < 6) { openFicha(destacados[+t.dataset.i].ref); t.style.transform = ''; }
    else t.style.transform = '';
  };
  tagsEl.addEventListener('pointerup', endDrag);
  tagsEl.addEventListener('pointercancel', endDrag);
  let auto;
  const restartAuto = () => { clearInterval(auto); if (!reduce) auto = setInterval(() => { if (!document.hidden && !drag) nextTag(); }, 4800); };
  paintTags();
  restartAuto();

  // ---------- Cartera ----------
  const grid = $('[data-grid]');
  const chipsEl = $('[data-chips]');
  const countTxt = $('[data-count]');
  const state = { op: 'todos', tipo: 'Todos' };
  const tipos = ['Todos', ...new Set(publicos.map((p) => p.tipo))];
  chipsEl.innerHTML = tipos.map((t) => `<button class="chip" aria-pressed="${t === 'Todos'}" data-tipo="${t}">${t}</button>`).join('');

  const cardHTML = (p, i) => `
    <button class="card ${['vendido', 'alquilado'].includes(p.estado) ? 'card-sold' : ''}" data-ref="${p.ref}" style="--d:${i * 55}ms" aria-label="${p.titulo}, ${fmtPrecio(p)}">
      <div class="card-img">
        <img src="${img(p.img)}" alt="" loading="lazy">
        <em class="st st-${p.estado}">${estados[p.estado].label}</em>
        <span class="card-op">${p.op === 'venta' ? 'Venta' : 'Alquiler'}</span>
        <span class="tag-ex">Inmueble de ejemplo</span>
      </div>
      <div class="card-body">
        <span class="card-ref">${p.ref} · ${p.tipo}</span>
        <span class="card-zone">${p.zona}${p.ciudad !== 'Sevilla' ? `, ${p.ciudad}` : ''}</span>
        <span class="card-title">${p.titulo}</span>
        <span class="card-price">${fmtPrecio(p)}</span>
        <span class="card-specs">${p.hab ? `<span>${ico('bed')}${p.hab}</span>` : ''}<span>${ico('bath')}${p.banos}</span><span>${ico('area')}${p.m2} m²</span></span>
      </div>
    </button>`;

  const renderGrid = () => {
    const list = publicos.filter((p) => (state.op === 'todos' || p.op === state.op) && (state.tipo === 'Todos' || p.tipo === state.tipo));
    grid.innerHTML = list.length ? list.map(cardHTML).join('') : '<p class="empty">No hay inmuebles de ejemplo con esos filtros.</p>';
    countTxt.textContent = `${list.length} ${list.length === 1 ? 'inmueble' : 'inmuebles'} · datos de demostración`;
  };

  const seg = $('[data-seg]');
  const pill = $('.seg-pill', seg);
  const movePill = () => {
    const b = $('[aria-selected="true"]', seg);
    pill.style.width = `${b.offsetWidth}px`;
    pill.style.transform = `translateX(${b.offsetLeft}px)`;
  };
  seg.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    $$('button', seg).forEach((x) => x.setAttribute('aria-selected', x === b));
    state.op = b.dataset.op;
    movePill();
    renderGrid();
  });
  chipsEl.addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    $$('.chip', chipsEl).forEach((x) => x.setAttribute('aria-pressed', x === b));
    state.tipo = b.dataset.tipo;
    renderGrid();
  });
  grid.addEventListener('click', (e) => { const c = e.target.closest('.card'); if (c) openFicha(c.dataset.ref); });
  addEventListener('resize', movePill);
  document.fonts?.ready.then(movePill);
  movePill();
  renderGrid();

  // ---------- Ficha ----------
  const sheet = $('[data-sheet]');
  const sheetBody = $('[data-sheet-body]');
  const panel = $('.sheet-panel', sheet);
  let lastFocus;
  function openFicha(ref) {
    const p = inmuebles.find((x) => x.ref === ref);
    if (!p) return;
    lastFocus = document.activeElement;
    const fotos = [p.img, ...p.galeria];
    sheetBody.innerHTML = `
      <div class="ficha">
        <div class="ficha-gal">
          <div class="ficha-main"><img data-main src="${img(fotos[0])}" alt="Ilustración del inmueble"><span class="tag-ex">Imagen ilustrativa · ejemplo</span></div>
          ${fotos.length > 1 ? `<div class="thumbs">${fotos.map((f, i) => `<button data-foto="${f}" aria-label="Imagen ${i + 1}" aria-current="${i === 0}"><img src="${img(f)}" alt=""></button>`).join('')}</div>` : ''}
        </div>
        <div class="ficha-info">
          <div class="ficha-row"><em class="st st-${p.estado}">${estados[p.estado].label}</em><span class="mono" style="color:var(--lacre)">${p.ref}</span><span class="pill">Inmueble de ejemplo</span></div>
          <h2 id="sheet-title">${p.titulo}</h2>
          <div class="ficha-row" style="color:var(--muted)">${ico('pin')} ${p.zona}, ${p.ciudad}</div>
          <div class="ficha-price">${fmtPrecio(p)}</div>
          <div class="specs-box">
            <div><b>${p.hab || '—'}</b><span>Habitaciones</span></div>
            <div><b>${p.banos}</b><span>Baños</span></div>
            <div><b>${p.m2}</b><span>m² construidos</span></div>
          </div>
          <div class="ficha-row">${p.tags.map((t) => `<span class="pill">${t}</span>`).join('')}</div>
          <form class="ficha-form" data-consulta>
            <p>¿Te interesa? Escríbenos y te respondemos con la referencia ${p.ref}.</p>
            <textarea name="msg" aria-label="Tu mensaje">Hola, me interesa ${p.ref} (${p.titulo}). ¿Podríamos verlo esta semana?</textarea>
            <button class="btn btn-gold" type="submit">${ico('whatsapp')} Preguntar por WhatsApp</button>
            <a class="btn btn-ghost-light btn-sm" href="${negocio.telHref}">${ico('phone')} Llamar · ${negocio.telefono}</a>
          </form>
        </div>
      </div>`;
    sheet.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add('open')));
    panel.focus({ preventScroll: true });
  }
  const closeFicha = () => {
    sheet.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { sheet.hidden = true; lastFocus?.focus?.({ preventScroll: true }); }, reduce ? 0 : 420);
  };
  sheet.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) return closeFicha();
    const t = e.target.closest('[data-foto]');
    if (t) {
      $('[data-main]', sheet).outerHTML = `<img data-main src="${img(t.dataset.foto)}" alt="Ilustración del inmueble">`;
      $$('[data-foto]', sheet).forEach((b) => b.setAttribute('aria-current', b === t));
    }
  });
  sheet.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = e.target.msg.value.trim();
    window.open(waLink(msg), '_blank', 'noopener');
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) closeFicha(); });

  // ---------- Formulario de propietarios ----------
  const form = $('[data-sell-form]');
  const fs1 = $('[data-fs="1"]', form), fs2 = $('[data-fs="2"]', form);
  const stepN = $('[data-sell-step]', form);
  $('[data-sell-next]', form).addEventListener('click', () => { fs1.hidden = true; fs2.hidden = false; stepN.textContent = '2'; form.nombre.focus(); });
  $('[data-sell-back]', form).addEventListener('click', () => { fs2.hidden = true; fs1.hidden = false; stepN.textContent = '1'; });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    ['nombre', 'tel'].forEach((n) => {
      const f = form[n].closest('.field');
      f.classList.remove('err');
      if (!form[n].value.trim()) { ok = false; void f.offsetWidth; f.classList.add('err'); }
    });
    if (!ok) return toast('Faltan tu nombre y un teléfono de contacto.');
    const d = Object.fromEntries(new FormData(form));
    const msg = `Hola, quiero ${d.op} mi inmueble.\nTipo: ${d.tipo}\nZona: ${d.zona || 'sin indicar'}\nNombre: ${d.nombre}\nTeléfono: ${d.tel}`;
    window.open(waLink(msg), '_blank', 'noopener');
    toast('Abriendo WhatsApp con tu solicitud…');
  });

  // ---------- WhatsApp genéricos ----------
  $$('[data-wa]').forEach((a) => { a.href = waLink(a.dataset.wa); a.target = '_blank'; a.rel = 'noopener'; });

  // ---------- Mockup del panel (animación) ----------
  const mock = $('[data-mock]');
  if (mock && !reduce) {
    const cursor = $('[data-mock-cursor]', mock);
    const row = $('[data-mock-row]', mock);
    const st = $('[data-mock-st]', mock);
    const mtoast = $('[data-mock-toast]', mock);
    const res = $('[data-mk="res"]', mock);
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const place = (el) => {
      const mb = $('.mock-body', mock).getBoundingClientRect();
      const r = el.getBoundingClientRect();
      cursor.style.left = `${r.left - mb.left + r.width / 2}px`;
      cursor.style.top = `${r.top - mb.top + r.height / 2}px`;
    };
    let running = false;
    const loop = async () => {
      if (running) return;
      running = true;
      while (true) {
        place(row); await wait(1100);
        row.classList.add('is-hot'); place(st); await wait(1000);
        cursor.classList.add('click'); await wait(160); cursor.classList.remove('click');
        st.className = 'st st-reservado pop'; st.textContent = 'Reservado'; res.textContent = '3';
        mtoast.classList.add('on'); await wait(2200);
        mtoast.classList.remove('on'); row.classList.remove('is-hot');
        cursor.style.left = '80%'; cursor.style.top = '90%'; await wait(1800);
        st.className = 'st st-disponible'; st.textContent = 'Disponible'; res.textContent = '2';
        await wait(800);
      }
    };
    new IntersectionObserver((en, o) => { if (en[0].isIntersecting) { loop(); o.disconnect(); } }, { threshold: 0.4 }).observe(mock);
  }
})();
