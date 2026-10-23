(function () {
  const { inmuebles, estados, precio } = window.GSI;
  const { facade, vaneMark } = window.GSIArt;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const publicos = inmuebles.filter((p) => p.publicado);

  $$('[data-vane-mark]').forEach((el) => (el.innerHTML = vaneMark()));

  const badge = (estado) => `<span class="st st--${estado}"><span class="st__i" aria-hidden="true">${estados[estado].icon}</span>${estados[estado].label}</span>`;

  /* Toast */
  const toastEl = $('[data-toast]');
  let toastT;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('is-on'), 3400);
  }

  /* Cabecera */
  const top = $('[data-top]');
  const onScroll = () => top.classList.toggle('is-stuck', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  const burger = $('[data-burger]'), mnav = $('[data-mnav]');
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open);
    mnav.hidden = !open;
  });
  $$('a', mnav).forEach((a) => a.addEventListener('click', () => { burger.setAttribute('aria-expanded', 'false'); mnav.hidden = true; }));

  /* Rosa de los vientos: la veleta apunta al barrio elegido */
  const barrios = [
    { n: 'Macarena', deg: 352 }, { n: 'Centro', deg: 28 }, { n: 'Sevilla Este', deg: 72 },
    { n: 'Nervión', deg: 108 }, { n: 'Bellavista', deg: 178 }, { n: 'Los Remedios', deg: 218 },
    { n: 'Triana', deg: 270 }, { n: 'Alameda', deg: 318 }
  ];
  const vane = $('[data-vane]'), list = $('[data-barrios]'), pick = $('[data-pick]');
  const ticks = $('[data-ticks]');
  ticks.innerHTML = Array.from({ length: 72 }, (_, i) => {
    const a = (i * 5) * Math.PI / 180, r1 = i % 6 ? 176 : 170, r2 = 184;
    return `<line x1="${200 + Math.sin(a) * r1}" y1="${200 - Math.cos(a) * r1}" x2="${200 + Math.sin(a) * r2}" y2="${200 - Math.cos(a) * r2}" stroke="#1C1712" stroke-opacity="${i % 6 ? .15 : .35}"/>`;
  }).join('');
  list.innerHTML = barrios.map((b, i) => {
    const a = b.deg * Math.PI / 180, r = 39;
    return `<li style="--x:${50 + Math.sin(a) * r}%;--y:${50 - Math.cos(a) * r}%"><button type="button" class="bpin" data-b="${i}" aria-pressed="false">${b.n}</button></li>`;
  }).join('');
  let rot = 0, cur = -1, auto;
  function point(i, fromUser) {
    if (i === cur) return;
    cur = i;
    const target = barrios[i].deg;
    let delta = ((target - rot) % 360 + 540) % 360 - 180;
    rot += delta;
    vane.style.setProperty('--rot', rot + 'deg');
    $$('.bpin', list).forEach((b, j) => b.setAttribute('aria-pressed', j === i));
    const p = publicos.find((x) => x.barrio === barrios[i].n) || publicos[0];
    pick.innerHTML = `<div class="pick__img">${facade(p.art, { uid: 'pk', label: 'Ilustración: ' + p.titulo })}</div>
      <div class="pick__txt"><p class="pick__k"><span>Ejemplo · ${barrios[i].n}</span>${badge(p.estado)}</p>
      <p class="pick__t">${p.titulo}</p><p class="pick__p">${precio(p)}</p></div>`;
    pick.dataset.ref = p.ref;
    pick.classList.remove('is-swap'); void pick.offsetWidth; pick.classList.add('is-swap');
    if (fromUser) clearInterval(auto);
  }
  list.addEventListener('click', (e) => { const b = e.target.closest('.bpin'); if (b) point(+b.dataset.b, true); });
  pick.addEventListener('click', () => openDrawer(pick.dataset.ref));
  pick.setAttribute('role', 'button'); pick.tabIndex = 0;
  pick.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDrawer(pick.dataset.ref); } });
  point(6);
  if (!reduce) {
    let k = 6;
    auto = setInterval(() => { if (document.hidden) return; k = (k + 1) % barrios.length; point(k); }, 3600);
  }

  /* Ticker */
  const names = barrios.map((b) => `<span>${b.n}</span>`).join('');
  $('[data-ticker]').innerHTML = names + names + names + names;

  /* Buscador del hero */
  const finder = $('[data-finder]'), segPill = $('.seg__pill', finder);
  let op = 'venta';
  function placePill() {
    const on = $('[aria-checked="true"]', finder);
    segPill.style.width = on.offsetWidth + 'px';
    segPill.style.transform = `translateX(${on.offsetLeft - 4}px)`;
  }
  $$('[data-op]', finder).forEach((b) => b.addEventListener('click', () => {
    op = b.dataset.op;
    $$('[data-op]', finder).forEach((x) => x.setAttribute('aria-checked', x === b));
    placePill();
  }));
  addEventListener('resize', placePill);
  document.fonts && document.fonts.ready.then(placePill);
  placePill();
  const fb = $('[data-finder-barrio]');
  fb.innerHTML += [...new Set(publicos.map((p) => p.barrio))].map((b) => `<option>${b}</option>`).join('');
  finder.addEventListener('submit', (e) => {
    e.preventDefault();
    state.op = op; state.barrio = fb.value; state.tipo = '';
    $('[data-tipo]').value = '';
    syncChips(); render();
    $('#inmuebles').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });

  /* Cartera */
  const grid = $('[data-grid]'), count = $('[data-count]'), empty = $('[data-empty]');
  const state = { op: 'todos', tipo: '', barrio: '' };
  function cardHTML(p) {
    const closed = p.estado === 'vendido' || p.estado === 'alquilado';
    return `<button type="button" class="card${closed ? ' is-closed' : ''}" data-ref="${p.ref}" aria-label="${p.titulo}, ${precio(p)}, ${estados[p.estado].label}. Inmueble de ejemplo.">
      <div class="card__img">${facade(p.art, { uid: 'c', label: '' })}
        <div class="card__badges"><span class="card__ex">INMUEBLE DE EJEMPLO</span>${badge(p.estado)}</div></div>
      <div class="card__body">
        <p class="card__meta"><span>${p.barrio} · ${p.zona}</span><span>${p.ref}</span></p>
        <h3 class="card__t">${p.titulo}</h3>
        <p class="card__specs">${p.hab ? `<span>${p.hab} dorm.</span>` : ''}<span>${p.banos} baño${p.banos > 1 ? 's' : ''}</span><span>${p.m2} m²</span></p>
        <div class="card__foot"><span class="card__price">${precio(p)}</span><span class="card__op">${p.op}</span></div>
      </div></button>`;
  }
  function render() {
    const items = publicos.filter((p) =>
      (state.op === 'todos' || p.op === state.op) && (!state.tipo || p.tipo === state.tipo) && (!state.barrio || p.barrio === state.barrio));
    const first = new Map($$('.card', grid).map((c) => [c.dataset.ref, c.getBoundingClientRect()]));
    grid.innerHTML = items.map(cardHTML).join('');
    empty.hidden = items.length > 0;
    count.textContent = `${items.length} inmueble${items.length === 1 ? '' : 's'} de ejemplo${state.barrio ? ' en ' + state.barrio : ''}`;
    if (reduce) return;
    // FLIP: las tarjetas que ya estaban se deslizan a su nuevo sitio; las nuevas aparecen
    $$('.card', grid).forEach((c, i) => {
      const f = first.get(c.dataset.ref), l = c.getBoundingClientRect();
      if (f) {
        c.animate([{ transform: `translate(${f.left - l.left}px, ${f.top - l.top}px)` }, { transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.23,1,.32,1)' });
      } else {
        c.animate([{ opacity: 0, transform: 'translateY(10px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: i * 40, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'backwards' });
      }
    });
  }
  function syncChips() {
    $$('[data-f]').forEach((c) => { const on = c.dataset.f === state.op; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', on); });
  }
  $('[data-chips]').addEventListener('click', (e) => {
    const c = e.target.closest('[data-f]'); if (!c) return;
    state.op = c.dataset.f; state.barrio = ''; syncChips(); render();
  });
  $('[data-tipo]').addEventListener('change', (e) => { state.tipo = e.target.value; render(); });
  grid.addEventListener('click', (e) => { const c = e.target.closest('.card'); if (c) openDrawer(c.dataset.ref, c); });
  render();

  /* Ficha */
  const drawer = $('[data-drawer]'), dbody = $('[data-drawer-body]'), panel = $('.drawer__panel', drawer);
  let lastFocus;
  function openDrawer(ref, from) {
    const p = inmuebles.find((x) => x.ref === ref);
    lastFocus = from || document.activeElement;
    const closed = p.estado === 'vendido' || p.estado === 'alquilado';
    dbody.innerHTML = `<div class="dimg">${facade(p.art, { uid: 'd', label: 'Ilustración: ' + p.titulo })}
        <div class="card__badges"><span class="card__ex">INMUEBLE DE EJEMPLO</span>${badge(p.estado)}</div></div>
      <div class="dbody">
        <p class="dbody__meta"><span>${p.ref}</span><span>·</span><span>${p.tipo} en ${p.op}</span><span>·</span><span>${p.barrio}, ${p.zona}</span></p>
        <h2 id="d-title">${p.titulo}</h2>
        <p class="dbody__price">${precio(p)}</p>
        <div class="dspecs"><div><b>${p.hab || '—'}</b><span>dormitorios</span></div><div><b>${p.banos}</b><span>baños</span></div><div><b>${p.m2}</b><span>m² construidos</span></div></div>
        <div class="dextras">${p.extras.map((x) => `<span>${x}</span>`).join('')}</div>
        <p class="dnote">Ficha de demostración. En la versión final, la agencia subiría aquí sus fotografías, plano y descripción desde el área de gestión.</p>
        ${closed ? '' : `<form class="dform" data-dform>
          <h3>Pedir visita</h3>
          <div class="days" role="group" aria-label="Día preferido">
            ${['Esta semana', 'Fin de semana', 'Próxima semana'].map((d, i) => `<button type="button" class="chip${i === 0 ? ' is-on' : ''}" aria-pressed="${i === 0}">${d}</button>`).join('')}
          </div>
          <label class="field"><span>Nombre</span><input name="n" autocomplete="off" placeholder="Su nombre"></label>
          <label class="field"><span>Teléfono</span><input name="t" inputmode="tel" autocomplete="off" placeholder="600 000 000"></label>
          <button class="btn btn--ink" type="submit">Solicitar visita</button>
          <p class="field__note" style="margin-top:8px">Demo: no se envía ningún dato.</p>
        </form>`}
      </div>`;
    drawer.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => { drawer.classList.add('is-open'); panel.focus(); }));
    const f = $('[data-dform]', dbody);
    if (f) {
      $$('.days .chip', f).forEach((c) => c.addEventListener('click', () => $$('.days .chip', f).forEach((x) => { x.classList.toggle('is-on', x === c); x.setAttribute('aria-pressed', x === c); })));
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        f.innerHTML = `<div class="dsent"><h3>Así llegaría la consulta</h3>
          <p>En la versión final, esta petición aparecería en el área de gestión, en <strong>Consultas</strong>, asociada a <strong>${p.ref}</strong>, con botones para llamar o escribir por WhatsApp.</p>
          <a class="link-arrow" href="panel-demo/#consultas">Ver la bandeja de consultas</a></div>`;
      });
    }
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { drawer.hidden = true; lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true }); }, reduce ? 0 : 420);
  }
  drawer.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeDrawer(); });
  addEventListener('keydown', (e) => {
    if (drawer.hidden) return;
    if (e.key === 'Escape') closeDrawer();
    if (e.key === 'Tab') {
      const f = $$('button, a, input, select, textarea', panel).filter((x) => !x.disabled && x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* Asistente de propietarios */
  const wz = $('[data-wizard]');
  const wsteps = $$('.wstep', wz), wdots = $$('.wizard__steps li', wz);
  const prev = $('[data-w-prev]', wz), next = $('[data-w-next]', wz);
  $('[data-w-barrios]', wz).innerHTML = barrios.map((b) => `<label class="opt opt--sm"><input type="radio" name="w-zona" value="${b.n}"><span>${b.n}</span></label>`).join('');
  let step = 0;
  function go(n) {
    wsteps.forEach((s, i) => { s.classList.toggle('is-on', i === n); s.classList.toggle('is-left', i < n); });
    wdots.forEach((d, i) => { d.classList.toggle('is-on', i === n); d.classList.toggle('is-done', i < n); });
    prev.disabled = n === 0 || n === 3;
    next.textContent = n === 2 ? 'Enviar solicitud' : n === 3 ? 'Empezar de nuevo' : 'Continuar';
    step = n;
  }
  const val = (n) => (wz.querySelector(`[name="${n}"]:checked`) || wz.querySelector(`[name="${n}"]`) || {}).value;
  next.addEventListener('click', () => {
    if (step === 0 && !wz.querySelector('[name="w-tipo"]:checked')) return toast('Elija un tipo de inmueble para continuar');
    if (step === 1 && !wz.querySelector('[name="w-zona"]:checked')) return toast('Elija una zona para continuar');
    if (step === 2) {
      const n = wz.querySelector('[name="w-nombre"]');
      if (!n.value.trim()) { n.parentElement.classList.remove('is-bad'); void n.offsetWidth; n.parentElement.classList.add('is-bad'); n.focus(); return; }
      const nombre = n.value.trim();
      $('[data-lead-row]', wz).innerHTML = `<span class="lead-row__av">${nombre[0].toUpperCase()}</span>
        <span><span class="lead-row__n">${nombre.replace(/</g, '&lt;')}</span><br><span class="lead-row__d">${val('w-tipo')} · ${val('w-zona')} · Quiere ${val('w-op') === 'Venta' ? 'vender' : 'alquilar'}</span></span>
        <span class="st st--disponible"><span class="st__i" aria-hidden="true">${window.GSI.icons.dot}</span>Nueva</span>`;
      go(3); wsteps[3].focus({ preventScroll: true }); return;
    }
    if (step === 3) { wz.reset(); $$('.field', wz).forEach((f) => f.classList.remove('is-bad')); return go(0); }
    go(step + 1);
  });
  prev.addEventListener('click', () => go(Math.max(0, step - 1)));

  /* Contacto */
  const cref = $('[data-cref]');
  cref.innerHTML += publicos.filter((p) => p.estado !== 'vendido' && p.estado !== 'alquilado').map((p) => `<option value="${p.ref}">${p.ref} · ${p.titulo}</option>`).join('');
  $('[data-cform]').addEventListener('submit', (e) => {
    e.preventDefault();
    toast('Demo: en la versión final, esta consulta llegaría al área de gestión de la agencia.');
  });

  /* Escena panel → web */
  const stage = $('[data-stage]');
  const rowsEl = $('[data-mini-rows]'), phone = $('[data-phone]'), cursor = $('[data-cursor]'), sync = $('[data-sync]');
  const demo = [inmuebles[2], inmuebles[0], inmuebles[6]];
  rowsEl.innerHTML = demo.map((p, i) => `<div class="mrow"><span class="mrow__img">${facade(p.art, { uid: 'm' + i })}</span>
    <span><span class="mrow__t">${p.titulo.split(' en ')[0].split(' junto')[0]}</span><br><span class="mrow__r">${p.ref} · ${precio(p)}</span></span>
    <span data-mst>${badge('disponible')}</span>${i === 0 ? '<span class="mrow__btn" data-mbtn>Reservar</span>' : ''}</div>`).join('');
  phone.innerHTML = `<div class="ph__brand"><span>${vaneMark()}</span>Giraldilla</div>
    <div class="ph__card" data-ph-card><div class="ph__img">${facade(demo[0].art, { uid: 'ph' })}<span data-pst>${badge('disponible')}</span></div>
    <div class="ph__b"><b>${demo[0].titulo}</b>${precio(demo[0])}</div></div>
    <div class="ph__line" style="width:80%"></div><div class="ph__line" style="width:55%"></div>`;
  const mst = $('[data-mst]', rowsEl), mbtn = $('[data-mbtn]', rowsEl), pst = $('[data-pst]', phone), phCard = $('[data-ph-card]', phone);
  const browser = $('.browser', stage);
  function setStatus(s) {
    mst.innerHTML = badge(s); pst.innerHTML = badge(s);
    if (!reduce) { mst.firstChild.classList.add('is-flip'); pst.firstChild.classList.add('is-flip'); }
  }
  function moveCursorTo(el) {
    const b = browser.getBoundingClientRect(), r = el.getBoundingClientRect();
    cursor.style.setProperty('--cx', (r.left - b.left + r.width * .5) + 'px');
    cursor.style.setProperty('--cy', (r.top - b.top + r.height * .55) + 'px');
  }
  let loopT = [], running = false;
  function loop() {
    loopT.forEach(clearTimeout); loopT = [];
    const at = (ms, fn) => loopT.push(setTimeout(fn, ms));
    setStatus('disponible'); sync.classList.remove('is-on');
    cursor.style.setProperty('--cx', '78%'); cursor.style.setProperty('--cy', '92%');
    const target = () => (mbtn.offsetParent ? mbtn : mst);
    at(700, () => moveCursorTo(target()));
    at(1900, () => mbtn.classList.add('is-press'));
    at(2080, () => { mbtn.classList.remove('is-press'); setStatus('reservado'); mbtn.textContent = 'Vender'; });
    at(2600, () => { phCard.classList.remove('is-pulse'); void phCard.offsetWidth; phCard.classList.add('is-pulse'); sync.classList.add('is-on'); });
    at(4200, () => sync.classList.remove('is-on'));
    at(4300, () => moveCursorTo(target()));
    at(5400, () => mbtn.classList.add('is-press'));
    at(5580, () => { mbtn.classList.remove('is-press'); setStatus('vendido'); mbtn.textContent = 'Reservar'; });
    at(6100, () => { phCard.classList.remove('is-pulse'); void phCard.offsetWidth; phCard.classList.add('is-pulse'); sync.classList.add('is-on'); });
    at(7600, () => sync.classList.remove('is-on'));
    at(8400, () => running && loop());
  }
  if (reduce) { setStatus('reservado'); cursor.hidden = true; }
  else {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !running) { running = true; loop(); }
      else if (!e.isIntersecting && running) { running = false; loopT.forEach(clearTimeout); }
    }, { threshold: .35 }).observe(stage);
  }

  /* Entradas al hacer scroll */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px' });
  const groups = new Map();
  $$('[data-in]').forEach((el) => {
    const p = el.parentElement; const k = groups.get(p) || 0; groups.set(p, k + 1);
    el.style.setProperty('--d', Math.min(k, 5) * 70 + 'ms');
    io.observe(el);
  });
})();
