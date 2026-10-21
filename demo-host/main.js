/* Inmobiliaria Alves · portada: buscador, filtros, destacados, valoración y contacto */
(function () {
  const { CONFIG, TYPES, ZONES, EXTRAS, LISTINGS, fmtPrice } = window.ALVES;
  const UI = window.ALVES_UI;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Opciones de selects y chips ---- */
  $$('[data-zones]').forEach((s) => ZONES.forEach((z) => s.add(new Option(z, z))));
  $$('[data-types]').forEach((s) => TYPES.forEach((t) => s.add(new Option(t, t))));
  $('[data-type-chips]').innerHTML = TYPES.map((t) => `<label class="chip"><input type="checkbox" name="type" value="${t}"><span>${t}</span></label>`).join('');
  $('[data-extra-chips]').innerHTML = EXTRAS.map((t) => `<label class="chip"><input type="checkbox" name="extra" value="${t}"><span>${t}</span></label>`).join('');

  /* ---- Controles segmentados con pastilla deslizante ---- */
  function placePill(seg, animate = true) {
    const pill = $('.seg__pill', seg);
    const on = $('input:checked', seg);
    if (!pill || !on) return;
    const label = on.closest('label');
    if (!animate) pill.style.transition = 'none';
    pill.style.width = label.offsetWidth + 'px';
    pill.style.transform = `translateX(${label.offsetLeft}px)`;
    if (!animate) { pill.offsetWidth; pill.style.transition = ''; }
  }
  const segs = $$('[data-seg]');
  segs.forEach((seg) => {
    placePill(seg, false);
    seg.addEventListener('change', () => placePill(seg));
  });
  window.addEventListener('resize', () => segs.forEach((s) => placePill(s, false)));
  document.fonts && document.fonts.ready.then(() => segs.forEach((s) => placePill(s, false)));

  /* ---- Destacados ---- */
  const featured = LISTINGS.filter((l) => l.featured);
  const car = $('#featured');
  car.innerHTML = featured.map((l, i) => UI.card(l, i)).join('');
  const carBtns = $$('[data-car]');
  function carState() {
    const max = car.scrollWidth - car.clientWidth - 2;
    carBtns[0].disabled = car.scrollLeft <= 2;
    carBtns[1].disabled = car.scrollLeft >= max;
  }
  carBtns.forEach((b) => b.addEventListener('click', () => {
    const step = car.querySelector('.card').offsetWidth + 16;
    car.scrollBy({ left: step * +b.dataset.car, behavior: reduce ? 'auto' : 'smooth' });
  }));
  car.addEventListener('scroll', carState, { passive: true });
  window.addEventListener('resize', carState);
  carState();

  /* ---- Tarjeta viva del hero: rota entre destacados ---- */
  const hc = $('#heroCard');
  let hi = 0;
  function paintHero(l) {
    hc.href = `inmueble/?id=${l.id}`;
    $('img', hc).src = `assets/img/${l.cover}`;
    $('[data-k="loc"]', hc).textContent = `${l.zone} · ${l.op === 'venta' ? 'Venta' : 'Alquiler'}`;
    $('[data-k="title"]', hc).textContent = l.title;
    $('[data-k="price"]', hc).textContent = fmtPrice(l);
  }
  $$('img, .hero__cardbody', hc).forEach((el) => el.classList.add('swap'));
  paintHero(featured[0]);
  if (!reduce) {
    let paused = false;
    hc.addEventListener('pointerenter', () => { paused = true; });
    hc.addEventListener('pointerleave', () => { paused = false; });
    setInterval(() => {
      if (paused || document.hidden) return;
      hi = (hi + 1) % featured.length;
      hc.classList.add('is-swapping');
      setTimeout(() => { paintHero(featured[hi]); hc.classList.remove('is-swapping'); }, 230);
    }, 4200);
  }

  /* ---- Listado con filtros ---- */
  const form = $('#filterForm');
  const grid = $('#grid');
  const empty = $('#empty');
  const sortSel = $('#sort');

  function readFilters() {
    const fd = new FormData(form);
    return {
      op: fd.get('op') || '',
      zone: fd.get('zone') || '',
      types: fd.getAll('type'),
      extras: fd.getAll('extra'),
      min: +fd.get('min') || 0,
      max: +fd.get('max') || Infinity,
      beds: +fd.get('beds') || 0,
      favs: fd.get('favs') === 'on'
    };
  }

  function apply(scrollTo = false) {
    const f = readFilters();
    const favs = UI.readFavs();
    let list = LISTINGS.filter((l) =>
      (!f.op || l.op === f.op) &&
      (!f.zone || l.zone === f.zone) &&
      (!f.types.length || f.types.includes(l.type)) &&
      f.extras.every((x) => l.extras.includes(x)) &&
      l.price >= f.min && l.price <= f.max &&
      (l.type === 'Local' ? f.beds === 0 : l.beds >= f.beds) &&
      (!f.favs || favs.includes(l.id))
    );
    const s = sortSel.value;
    if (s === 'asc') list.sort((a, b) => a.price - b.price);
    if (s === 'desc') list.sort((a, b) => b.price - a.price);
    if (s === 'm2') list.sort((a, b) => b.m2 - a.m2);
    if (s === 'rec') list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    grid.innerHTML = list.map((l, i) => UI.card(l, i)).join('');
    empty.hidden = list.length > 0;
    $$('[data-count]').forEach((el) => { el.textContent = list.length; });
    $('[data-count-label]').textContent = list.length === 1 ? 'inmueble' : 'inmuebles';
    $('.filters__apply').textContent = list.length ? `Ver ${list.length} ${list.length === 1 ? 'inmueble' : 'inmuebles'}` : 'Sin resultados';

    const active = (f.zone ? 1 : 0) + f.types.length + f.extras.length + (f.min ? 1 : 0) + (f.max !== Infinity ? 1 : 0) + (f.beds ? 1 : 0) + (f.favs ? 1 : 0);
    const badge = $('[data-active-count]');
    badge.hidden = !active;
    badge.textContent = active;

    if (scrollTo) $('#inmuebles').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }

  function setOp(op) {
    const r = form.querySelector(`input[name="op"][value="${op}"]`);
    if (r) { r.checked = true; placePill(r.closest('[data-seg]')); }
  }

  form.addEventListener('input', () => apply());
  form.addEventListener('change', () => apply());
  form.addEventListener('reset', () => setTimeout(() => { segs.forEach((s) => placePill(s)); apply(); }));
  sortSel.addEventListener('change', () => apply());
  document.addEventListener('favs:change', () => { if (form.favs.checked) apply(); });
  $$('[data-reset]').forEach((b) => b.addEventListener('click', () => form.reset()));

  // Enlaces "Comprar / Alquilar" del menú y accesos.
  $$('[data-op-link]').forEach((a) => a.addEventListener('click', () => { setOp(a.dataset.opLink); apply(); }));

  // Buscador del hero → aplica al listado.
  $('#search').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    form.reset();
    setTimeout(() => {
      setOp(fd.get('op'));
      form.zone.value = fd.get('zone');
      const t = fd.get('type');
      if (t) form.querySelector(`input[name="type"][value="${t}"]`).checked = true;
      const b = form.querySelector(`input[name="beds"][value="${fd.get('beds')}"]`);
      if (b) b.checked = true;
      apply(true);
    });
  });

  /* ---- Hoja de filtros en móvil ---- */
  const filters = $('#filters');
  const scrim = $('.scrim');
  let lastFocus = null;
  function sheet(open) {
    filters.classList.toggle('is-open', open);
    document.body.classList.toggle('no-scroll', open);
    if (open) {
      lastFocus = document.activeElement;
      scrim.hidden = false;
      requestAnimationFrame(() => scrim.classList.add('is-on'));
      setTimeout(() => $('.filters__close', filters).focus({ preventScroll: true }), 50);
      segs.forEach((s) => placePill(s, false));
    } else {
      scrim.classList.remove('is-on');
      setTimeout(() => { if (!filters.classList.contains('is-open')) scrim.hidden = true; }, 300);
      lastFocus && lastFocus.focus({ preventScroll: true });
    }
  }
  $$('[data-filters-open]').forEach((b) => b.addEventListener('click', () => sheet(true)));
  $$('[data-filters-close]').forEach((b) => b.addEventListener('click', () => sheet(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && filters.classList.contains('is-open')) sheet(false); });

  // Llegada desde la ficha con ?op=venta|alquiler
  const qop = new URLSearchParams(location.search).get('op');
  if (qop === 'venta' || qop === 'alquiler') setOp(qop);
  apply();

  /* ---- Pestañas de servicios ---- */
  $('[data-tabs]').addEventListener('change', (e) => {
    $('#svc-prop').hidden = e.target.value !== 'prop';
    $('#svc-buy').hidden = e.target.value !== 'buy';
  });

  /* ---- Asistente de valoración ---- */
  const wz = $('#wizard');
  const steps = $$('.wizard__step', wz);
  const bar = $('.wizard__progress span', wz);
  const prev = $('[data-prev]', wz);
  const next = $('[data-next]', wz);
  const err = $('.wizard__err', wz);
  const done = $('[data-step="done"]', wz);
  let cur = 0;

  function showStep(n, back = false) {
    steps.forEach((s, i) => { s.classList.toggle('is-active', i === n); s.classList.toggle('is-back', back && i === n); });
    bar.style.transform = `scaleX(${(n + 1) / steps.length})`;
    $('[data-step-n]', wz).textContent = n + 1;
    prev.disabled = n === 0;
    next.textContent = n === steps.length - 1 ? 'Preparar solicitud' : 'Continuar';
    err.textContent = '';
    cur = n;
  }
  function validStep(n) {
    let ok = true;
    $$('input[required]', steps[n]).forEach((inp) => {
      const bad = inp.type === 'checkbox' ? !inp.checked : !inp.value.trim();
      inp.classList.toggle('is-bad', bad);
      if (bad) ok = false;
    });
    if (!ok) err.textContent = 'Completa los campos marcados para continuar.';
    return ok;
  }
  prev.addEventListener('click', () => showStep(Math.max(0, cur - 1), true));
  next.addEventListener('click', () => {
    if (!validStep(cur)) return;
    if (cur < steps.length - 1) return showStep(cur + 1);
    const fd = new FormData(wz);
    const goal = fd.get('goal');
    const summary = `${goal === 'vender' ? 'Venta' : 'Alquiler'} · ${fd.get('vtype')} en ${fd.get('vzone')} · ${fd.get('vm2')} m² · ${fd.get('vbeds')} dorm. · ${fd.get('vstate')}`;
    const msg = `Hola, soy ${fd.get('vname')}. Me gustaría una valoración de mi inmueble para ${goal === 'vender' ? 'venderlo' : 'alquilarlo'}.\n\n${summary}\n\nMi teléfono: ${fd.get('vphone')}`;
    $('[data-summary]', wz).textContent = summary;
    $('#wizardWa').href = UI.waLink(msg);
    steps.forEach((s) => s.classList.remove('is-active'));
    bar.style.transform = 'scaleX(1)';
    wz.classList.add('is-done');
    done.hidden = false;
    err.textContent = '';
  });
  $('[data-wizard-restart]', wz).addEventListener('click', () => {
    wz.reset(); done.hidden = true; wz.classList.remove('is-done'); showStep(0);
  });
  wz.addEventListener('input', (e) => e.target.classList && e.target.classList.remove('is-bad'));
  showStep(0);

  /* ---- Contacto → WhatsApp ---- */
  const cf = $('#contactForm');
  cf.addEventListener('submit', (e) => {
    e.preventDefault();
    const cerr = $('.wizard__err', cf);
    let ok = true;
    $$('input[required]', cf).forEach((inp) => {
      const bad = inp.type === 'checkbox' ? !inp.checked : !inp.value.trim();
      inp.classList.toggle('is-bad', bad);
      if (bad) ok = false;
    });
    if (!ok) { cerr.textContent = 'Completa nombre, teléfono y acepta el uso de tus datos.'; return; }
    cerr.textContent = '';
    const fd = new FormData(cf);
    const msg = `Hola, soy ${fd.get('name')}. Me interesa: ${fd.get('topic')}.${fd.get('msg') ? '\n\n' + fd.get('msg') : ''}\n\nMi teléfono: ${fd.get('phone')}`;
    window.open(UI.waLink(msg), '_blank', 'noopener');
    UI.toast('Abriendo WhatsApp…');
  });
  cf.addEventListener('input', (e) => e.target.classList && e.target.classList.remove('is-bad'));

  /* ---- Dock móvil: aparece pasado el hero ---- */
  const dock = $('.dock');
  const hero = $('.hero');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => dock.classList.toggle('is-on', !en.isIntersecting), { threshold: 0 }).observe(hero);
  } else dock.classList.add('is-on');
})();
