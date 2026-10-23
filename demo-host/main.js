(function () {
  const { PROPS, STATUS, fmtPrice, scene } = window.SPI;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Lo que ve el público: solo lo publicado (los borradores no salen en la web).
  const visible = PROPS.filter((p) => p.published);
  const featured = PROPS.filter((p) => p.published);

  const specsHTML = (p) => [
    p.beds ? `<li><svg width="16" height="16"><use href="#i-bed"/></svg>${p.beds}</li>` : '',
    p.baths ? `<li><svg width="16" height="16"><use href="#i-bath"/></svg>${p.baths}</li>` : '',
    `<li><svg width="16" height="16"><use href="#i-area"/></svg>${p.m2} m²</li>`,
  ].join('');

  /* ---------- Header ---------- */
  const top = $('#top');
  const onScroll = () => top.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Fichero (hero) ---------- */
  const stack = $('#fichero');
  const order = featured.map((_, i) => i);
  const cards = featured.map((p, i) => {
    const el = document.createElement('article');
    el.className = 'ficha';
    el.dataset.ref = p.ref + ' · EJEMPLO';
    el.style.setProperty('--tab', `${(i % 3) * 32}%`);
    el.innerHTML = `
      <div class="ficha__img">${scene(p.art, p.tint, p.sky)}</div>
      <div class="ficha__meta">
        <p class="mono" style="color:var(--gris)">${p.type} · ${p.op === 'venta' ? 'Venta' : 'Alquiler'}</p>
        <h3>${p.title}</h3>
        <p class="small">${p.zone}</p>
        <div class="ficha__row">
          <span class="ficha__price">${fmtPrice(p)}</span>
          <span class="pill pill--${STATUS[p.status].cls}">${STATUS[p.status].label}</span>
        </div>
      </div>`;
    el.addEventListener('click', () => { if (order[0] === i) openDrawer(p); });
    stack.appendChild(el);
    return el;
  });
  function layoutStack() {
    order.forEach((idx, pos) => {
      const el = cards[idx];
      const depth = Math.min(pos, 3);
      el.style.zIndex = String(10 - pos);
      el.style.transform = `translateY(${-depth * 14}px) scale(${1 - depth * 0.045}) rotate(${pos === 0 ? 0 : (pos % 2 ? 1.6 : -1.4)}deg)`;
      el.style.opacity = pos > 3 ? '0' : '1';
      el.style.filter = pos ? `brightness(${1 - depth * 0.035})` : 'none';
      el.setAttribute('aria-hidden', pos ? 'true' : 'false');
    });
    $('#fichero-count').textContent = `${String(order[0] + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
  }
  function shift(dir) {
    if (dir > 0) {
      const first = cards[order[0]];
      first.style.transform = 'translate(-6%, 30px) rotate(-6deg)';
      first.style.opacity = '0';
      setTimeout(() => { order.push(order.shift()); layoutStack(); }, reduce ? 0 : 260);
    } else {
      order.unshift(order.pop());
      layoutStack();
    }
  }
  layoutStack();
  let auto = setInterval(() => shift(1), 4200);
  const restart = () => { clearInterval(auto); auto = setInterval(() => shift(1), 5200); };
  $('#fichero-next').addEventListener('click', () => { shift(1); restart(); });
  $('#fichero-prev').addEventListener('click', () => { shift(-1); restart(); });
  if (reduce) clearInterval(auto);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearInterval(auto); else restart(); });

  /* ---------- Buscador + listado ---------- */
  const state = { op: 'todas', type: '', zone: '' };
  const seg = $('.seg');
  const pill = document.createElement('span');
  pill.className = 'seg__pill';
  seg.prepend(pill);
  function movePill() {
    const on = $('.seg__b.is-on', seg);
    pill.style.width = on.offsetWidth + 'px';
    pill.style.transform = `translateX(${on.offsetLeft}px)`;
  }
  $$('.seg__b', seg).forEach((b) => b.addEventListener('click', () => {
    $$('.seg__b', seg).forEach((x) => { x.classList.toggle('is-on', x === b); x.setAttribute('aria-checked', x === b); });
    state.op = b.dataset.op;
    movePill();
    render();
  }));
  addEventListener('resize', movePill);
  document.fonts && document.fonts.ready.then(movePill);
  movePill();
  $('#f-type').addEventListener('change', (e) => { state.type = e.target.value; render(); });
  $('#f-zone').addEventListener('change', (e) => { state.zone = e.target.value; render(); });
  $('#search').addEventListener('submit', (e) => { e.preventDefault(); render(); $('#inmuebles').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); });
  $('#results-reset').addEventListener('click', () => {
    state.op = 'todas'; state.type = ''; state.zone = '';
    $('#f-type').value = ''; $('#f-zone').value = '';
    $$('.seg__b', seg)[0].click();
  });

  const grid = $('#grid');
  function render() {
    const list = visible.filter((p) =>
      (state.op === 'todas' || p.op === state.op) &&
      (!state.type || p.type === state.type) &&
      (!state.zone || p.zone.startsWith(state.zone)));
    const filtered = state.op !== 'todas' || state.type || state.zone;
    $('#results-reset').hidden = !filtered;
    $('#results-count').textContent = `${list.length} ${list.length === 1 ? 'inmueble' : 'inmuebles'} de ejemplo`;
    grid.innerHTML = list.length ? list.map((p) => `
      <article class="card is-out${p.status === 'vendido' || p.status === 'alquilado' ? ' is-closed' : ''}" data-ref="${p.ref}" role="button" tabindex="0" aria-label="Ver ${p.title}">
        <div class="card__img">${scene(p.art, p.tint, p.sky)}
          <div class="card__badges"><span class="state state--op">${p.op === 'venta' ? 'Venta' : 'Alquiler'}</span>${p.status !== 'disponible' ? `<span class="state state--${p.status}">${STATUS[p.status].label}</span>` : ''}</div>
        </div>
        <div class="card__body">
          <span class="mono card__ref">${p.ref} · Ejemplo</span>
          <span class="card__title">${p.title}</span>
          <span class="card__zone">${p.zone}</span>
          <div class="card__foot"><span class="card__price">${fmtPrice(p)}</span><ul class="specs">${specsHTML(p)}</ul></div>
        </div>
      </article>`).join('') : '<p class="empty">No hay inmuebles de ejemplo con esos filtros. <button class="linkbtn" onclick="document.getElementById(\'results-reset\').click()">Ver todos</button></p>';
    $$('.card', grid).forEach((c, i) => {
      const open = () => openDrawer(PROPS.find((p) => p.ref === c.dataset.ref));
      c.addEventListener('click', open);
      c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
      setTimeout(() => c.classList.remove('is-out'), reduce ? 0 : 40 + i * 60);
    });
  }
  render();

  /* ---------- Ficha (drawer) ---------- */
  const drawer = $('#drawer');
  let current = null, lastFocus = null;
  function openDrawer(p) {
    current = p;
    lastFocus = document.activeElement;
    $('#d-media').innerHTML = scene(p.art, p.tint, p.sky);
    $('#d-ref').textContent = p.ref;
    $('#d-title').textContent = p.title;
    $('#d-zone').textContent = `${p.zone} · ${p.op === 'venta' ? 'Venta' : 'Alquiler'}`;
    $('#d-price').textContent = fmtPrice(p);
    $('#d-specs').innerHTML = specsHTML(p);
    $('#d-desc').textContent = p.desc;
    $('#d-feats').innerHTML = p.feats.map((f) => `<li>${f}</li>`).join('');
    $('#ask').hidden = false;
    $('#ask-done').hidden = true;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('.drawer__panel').scrollTop = 0;
    setTimeout(() => $('.drawer__x').focus(), 50);
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lastFocus && lastFocus.focus && lastFocus.focus();
  }
  $$('[data-close]', drawer).forEach((b) => b.addEventListener('click', closeDrawer));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer(); });

  const initials = (n) => n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '··';
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  $('#ask').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const name = f.nombre.value.trim() || 'María López';
    $('#ask-ref').textContent = `${current.ref} · ${current.title}`;
    $('#ask-preview').innerHTML = `<span class="av">${initials(name)}</span><b>${esc(name)}</b><span class="new">Nueva</span><small>Interesada en ${current.ref} · “${esc(f.msg.value.trim().slice(0, 70) || 'Consulta')}”</small>`;
    f.hidden = true;
    $('#ask-done').hidden = false;
  });

  /* ---------- Asistente de captación ---------- */
  const wiz = $('#wizard');
  const data = {};
  let step = 1;
  const next = $('#wiz-next'), back = $('#wiz-back');
  function valid() {
    if (step === 1) return data.op && data.tipo;
    if (step === 2) return wiz.zona.value.trim().length > 1;
    if (step === 3) return wiz.nombre.value.trim().length > 1 && wiz.tel.value.replace(/\D/g, '').length >= 9;
    return true;
  }
  function show() {
    $$('.wizard__pane', wiz).forEach((p) => p.classList.toggle('is-on', +p.dataset.pane === step));
    $('#wiz-bar').style.width = `${Math.min(step, 3) * 33.34}%`;
    $('#wiz-step').textContent = step < 4 ? `Paso ${step} de 3` : 'Solicitud de propietario · demo';
    back.hidden = step === 1 || step === 4;
    next.hidden = step === 4;
    next.textContent = step === 3 ? 'Enviar solicitud' : 'Continuar';
    next.disabled = !valid();
  }
  $$('.chips', wiz).forEach((group) => $$('.chip', group).forEach((c) => c.addEventListener('click', () => {
    $$('.chip', group).forEach((x) => x.classList.toggle('is-on', x === c));
    data[group.dataset.name] = c.dataset.v;
    next.disabled = !valid();
  })));
  wiz.addEventListener('input', () => { next.disabled = !valid(); });
  next.addEventListener('click', () => {
    if (!valid()) return;
    if (step === 3) {
      const d = new Date();
      $('#wiz-preview').innerHTML = `<span class="av">${initials(wiz.nombre.value)}</span><b>${esc(wiz.nombre.value.trim())}</b><span class="new">Nueva</span><small>Quiere ${data.op.toLowerCase()} · ${data.tipo} · ${esc(wiz.zona.value.trim())} · ${d.toLocaleDateString('es-ES')}</small>`;
    }
    step++;
    show();
  });
  back.addEventListener('click', () => { step--; show(); });
  show();

  /* ---------- Mockup del panel (animado) ---------- */
  const rows = $('#mock-rows');
  const mockProps = PROPS.slice(0, 4);
  rows.innerHTML = mockProps.map((p) => `
    <div class="mrow"><span class="th">${scene(p.art, p.tint, p.sky)}</span>
      <span><b>${p.title}</b><small>${p.ref} · ${fmtPrice(p)}</small></span>
      <span class="pill pill--${STATUS[p.status].cls}" data-ref="${p.ref}">${STATUS[p.status].label}</span></div>`).join('');
  const cycle = [
    () => setPill('REF-001', 'reservado'),
    () => { $('#mock-toast').classList.add('is-on'); bump('#mk-leads', 24); },
    () => $('#mock-toast').classList.remove('is-on'),
    () => setPill('REF-002', 'vendido'),
    () => { setPill('REF-001', 'disponible'); setPill('REF-002', 'reservado'); bump('#mk-leads', 23); },
  ];
  function setPill(ref, st) {
    const el = rows.querySelector(`[data-ref="${ref}"]`);
    el.className = `pill pill--${STATUS[st].cls} flip`;
    el.textContent = STATUS[st].label;
  }
  function bump(sel, n) { const el = $(sel); el.textContent = n; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
  let ci = 0, mockTimer = null;
  const mockIO = new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !reduce && !mockTimer) mockTimer = setInterval(() => { cycle[ci++ % cycle.length](); }, 1800);
    if (!e.isIntersecting && mockTimer) { clearInterval(mockTimer); mockTimer = null; }
  }, { threshold: 0.3 });
  mockIO.observe($('.mock'));

  /* ---------- Reveal ---------- */
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach((el) => {
    const sib = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
    el.style.setProperty('--d', `${Math.min(sib.indexOf(el), 6) * 70}ms`);
    io.observe(el);
  });
})();
