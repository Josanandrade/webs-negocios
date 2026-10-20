/* Inmomairena · portada */
(function () {
  const { CONFIG, TYPES, Store, fmt, img } = window.IM;
  const { $, $$, card, wireContact, wireHeader, wireReveal, wireForm, fillSelect, map } = window.UI;

  const props = Store.all();
  const visible = props.filter(p => p.status !== 'oculto');
  const state = { op: '', type: '', town: '', max: 0 };

  wireContact();
  wireHeader();

  // ---------- Selects ----------
  const typesInUse = TYPES.filter(t => visible.some(p => p.type === t));
  const townsInUse = CONFIG.zones.filter(z => visible.some(p => p.town === z));
  fillSelect($('#sType'), typesInUse);
  fillSelect($('#sTown'), CONFIG.zones);
  fillSelect($('#fType'), typesInUse);
  fillSelect($('#fTown'), townsInUse);
  fillSelect($('#sellTown'), [...CONFIG.zones, 'Otra localidad']);
  fillSelect($('#sellType'), ['Piso', 'Ático', 'Casa', 'Adosado / pareado', 'Chalet', 'Local u oficina', 'Terreno', 'Otro']);

  const PRICES = {
    venta: [[0, 'Sin límite'], [150000, 'Hasta 150.000 €'], [200000, 'Hasta 200.000 €'], [250000, 'Hasta 250.000 €'], [350000, 'Hasta 350.000 €'], [500000, 'Hasta 500.000 €']],
    alquiler: [[0, 'Sin límite'], [700, 'Hasta 700 €/mes'], [900, 'Hasta 900 €/mes'], [1200, 'Hasta 1.200 €/mes']]
  };

  // ---------- Hero: palabra rotativa ----------
  const rot = $('#rot');
  const words = ['comprar.', 'vender.', 'alquilar.', 'vivir.'];
  let wi = 0;
  if (rot && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(() => {
      rot.classList.add('is-out');
      setTimeout(() => {
        wi = (wi + 1) % words.length;
        rot.innerHTML = `<em>${words[wi]}</em>`;
        rot.classList.remove('is-out'); rot.classList.add('is-in');
        requestAnimationFrame(() => requestAnimationFrame(() => rot.classList.remove('is-in')));
      }, 380);
    }, 2600);
  }

  // ---------- Hero: buscador ----------
  const seg = $('.seg'), pill = $('.seg__pill');
  let searchOp = 'venta';
  function movePill() {
    const on = $('button.is-on', seg);
    pill.style.width = on.offsetWidth + 'px';
    pill.style.transform = `translateX(${on.offsetLeft - 4}px)`;
  }
  function setSearchOp(op) {
    searchOp = op;
    $$('button', seg).forEach(b => { const on = b.dataset.op === op; b.classList.toggle('is-on', on); b.setAttribute('aria-selected', on); });
    fillSelect($('#sPrice'), PRICES[op], false);
    movePill();
  }
  $$('button', seg).forEach(b => b.addEventListener('click', () => setSearchOp(b.dataset.op)));
  setSearchOp('venta');
  window.addEventListener('resize', movePill);
  document.fonts && document.fonts.ready.then(movePill);

  $('#search').addEventListener('submit', (e) => {
    e.preventDefault();
    state.op = searchOp;
    state.type = $('#sType').value;
    state.town = $('#sTown').value;
    state.max = +$('#sPrice').value || 0;
    syncFilterUI();
    renderList(true);
    $('#inmuebles').scrollIntoView({ behavior: 'smooth' });
  });

  // ---------- Hero: tarjeta "en directo" ----------
  const feat = visible.filter(p => p.featured && p.status === 'disponible');
  const live = $('#live');
  if (feat.length && live) {
    let li = 0;
    const show = (p) => {
      $('#liveImg').src = img(p.cover, '');
      $('#liveTitle').textContent = p.title;
      $('#liveMeta').textContent = `${p.area || p.town} · ${fmt.price(p)}`;
    };
    show(feat[0]);
    if (feat.length > 1) setInterval(() => {
      live.classList.add('is-swap');
      setTimeout(() => { li = (li + 1) % feat.length; show(feat[li]); live.classList.remove('is-swap'); }, 420);
    }, 4200);
  }

  // ---------- Ticker de zonas ----------
  const tk = $('#ticker');
  const zs = CONFIG.zones.map(z => `<span>${z}</span>`).join('');
  tk.innerHTML = zs + zs;

  // ---------- Destacados ----------
  const rail = $('#featured');
  let featList = visible.filter(p => p.featured);
  if (!featList.length) featList = visible.slice(0, 4);
  rail.innerHTML = featList.map(card).join('');
  const dots = $('#featDots');
  dots.innerHTML = featList.map((_, i) => `<i class="${i ? '' : 'is-on'}"></i>`).join('');
  rail.addEventListener('scroll', () => {
    const w = rail.firstElementChild ? rail.firstElementChild.offsetWidth + 14 : 1;
    const i = Math.round(rail.scrollLeft / w);
    $$('i', dots).forEach((d, k) => d.classList.toggle('is-on', k === i));
    updateArrows();
  }, { passive: true });
  const arrows = $$('#featArrows .ib');
  function updateArrows() {
    arrows[0].disabled = rail.scrollLeft < 8;
    arrows[1].disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 8;
  }
  arrows.forEach(b => b.addEventListener('click', () => {
    const w = rail.firstElementChild.offsetWidth + 18;
    rail.scrollBy({ left: w * +b.dataset.dir, behavior: 'smooth' });
  }));
  updateArrows();

  // ---------- Cartera ----------
  const list = $('#list');
  function filtered() {
    return visible.filter(p => (!state.op || p.op === state.op) && (!state.type || p.type === state.type) &&
      (!state.town || p.town === state.town) && (!state.max || p.price <= state.max));
  }
  let showAll = false;
  const PAGE = 6;
  function renderList(flash) {
    let items = filtered();
    // disponibles primero, cerrados al final
    const order = { disponible: 0, reservado: 1, alquilado: 2, vendido: 2 };
    items.sort((a, b) => (order[a.status] ?? 1) - (order[b.status] ?? 1) || (b.featured - a.featured));
    const total = items.length;
    const anyFilter = state.op || state.type || state.town || state.max;
    const cut = !showAll && !anyFilter && total > PAGE;
    $('#more').hidden = !cut;
    $('#moreBtn').textContent = `Ver los ${total} inmuebles`;
    list.innerHTML = (cut ? items.slice(0, PAGE) : items).map(card).join('');
    $$('.pcard', list).forEach((c, i) => { c.style.animationDelay = `${Math.min(i, 8) * 45}ms`; });
    $('#empty').hidden = items.length > 0;
    const avail = items.filter(p => p.status === 'disponible').length;
    const bits = [];
    if (state.op) bits.push(state.op === 'venta' ? 'en venta' : 'en alquiler');
    if (state.type) bits.push(state.type.toLowerCase());
    if (state.town) bits.push(`en ${state.town}`);
    if (state.max) bits.push(`hasta ${new Intl.NumberFormat('es-ES').format(state.max)} €`);
    $('#results').innerHTML = items.length
      ? `<b>${items.length}</b> ${items.length === 1 ? 'inmueble' : 'inmuebles'}${bits.length ? ' · ' + bits.join(', ') : ''} · ${avail} ${avail === 1 ? 'disponible' : 'disponibles'}`
      : '';
    if (flash) list.animate && list.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 400 });
  }
  function syncFilterUI() {
    $$('#opChips button').forEach(b => b.classList.toggle('is-on', b.dataset.op === state.op));
    const ft = $('#fType'), fw = $('#fTown');
    ft.value = state.type; fw.value = state.town;
    if (state.town && fw.value !== state.town) { fillSelect(fw, [...new Set([...townsInUse, state.town])]); fw.value = state.town; }
  }
  $$('#opChips button').forEach(b => b.addEventListener('click', () => { state.op = b.dataset.op; state.max = 0; syncFilterUI(); renderList(); }));
  $('#fType').addEventListener('change', e => { state.type = e.target.value; renderList(); });
  $('#fTown').addEventListener('change', e => { state.town = e.target.value; renderList(); });
  $('#clearFilters').addEventListener('click', () => { Object.assign(state, { op: '', type: '', town: '', max: 0 }); syncFilterUI(); renderList(); });
  $$('[data-quick-op]').forEach(a => a.addEventListener('click', () => { Object.assign(state, { op: a.dataset.quickOp, type: '', town: '', max: 0 }); syncFilterUI(); renderList(); }));
  $('#moreBtn').addEventListener('click', () => { showAll = true; renderList(); });
  renderList();

  // ---------- Formularios ----------
  wireForm($('#sellForm'));
  wireForm($('#contactForm'));

  // ---------- Mapa de zona ----------
  $('#zoneMap').innerHTML = map();

  // ---------- Animación panel → web ----------
  const stage = $('.sync__stage');
  if (stage) {
    const p1 = $('#mockPill'), p2 = $('#mockPill2'), cur = $('#mockCursor'), beam = $('.sync__beam'), t = $('#mockToast');
    let reserved = false, timer;
    const step = () => {
      cur.style.opacity = 1;
      cur.style.transform = 'translate(-6px, 62px)';
      setTimeout(() => {
        cur.classList.remove('is-click'); void cur.offsetWidth; cur.classList.add('is-click');
        reserved = !reserved;
        [p1, p2].forEach(p => { p.classList.toggle('is-res', reserved); p.textContent = reserved ? 'Reservado' : 'Disponible'; });
        p2.textContent = reserved ? 'Reservado' : 'Disponible';
        beam.classList.remove('is-run'); void beam.offsetWidth; beam.classList.add('is-run');
        setTimeout(() => { t.classList.add('is-on'); setTimeout(() => t.classList.remove('is-on'), 1600); }, 900);
        setTimeout(() => { cur.style.transform = 'translate(0,0)'; cur.style.opacity = 0; }, 700);
      }, 950);
    };
    const io = new IntersectionObserver(([en]) => {
      clearInterval(timer);
      if (en.isIntersecting) { step(); timer = setInterval(step, 4200); }
    }, { threshold: .3 });
    io.observe(stage);
  }

  // ---------- Navegación activa ----------
  const navLinks = $$('.nav a');
  const secs = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const nio = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) navLinks.forEach(a => a.classList.toggle('is-on', a.getAttribute('href') === '#' + en.target.id)); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(s => nio.observe(s));

  wireReveal();
})();
