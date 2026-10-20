/* Global Soluciones Inmobiliarias · web pública (demo) */
(function () {
  var GS = window.GS;
  var C = GS.config;
  var ROOT = document.body.getAttribute('data-root') || '';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* ---------- Contacto común ---------- */
  function wireLinks() {
    $$('[data-wa]').forEach(function (a) {
      a.href = GS.wa(a.getAttribute('data-wa'));
      a.target = '_blank'; a.rel = 'noopener';
    });
    $$('[data-tel]').forEach(function (a) { a.href = C.telefonoHref; });
    $$('[data-tel-text]').forEach(function (s) { s.textContent = C.telefono; });
    $$('[data-maps]').forEach(function (a) { a.href = C.mapsUrl; });
  }
  wireLinks();

  var burger = $('#burger'), menu = $('#menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }); });
  }

  /* ---------- Tarjetas ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function img(p) { var f = (p.fotos && p.fotos[0]) || 'assets/inmuebles/placeholder.svg'; return /^(data:|https?:)/.test(f) ? f : ROOT + f; }
  function specs(p) {
    var out = [];
    if (p.hab) out.push('<span><svg><use href="#i-bed"/></svg>' + p.hab + ' hab.</span>');
    if (p.banos) out.push('<span><svg><use href="#i-bath"/></svg>' + p.banos + (p.banos > 1 ? ' baños' : ' baño') + '</span>');
    if (p.m2) out.push('<span><svg><use href="#i-area"/></svg>' + p.m2 + ' m²</span>');
    return out.join('');
  }
  function link(p) { return ROOT + 'inmueble/?ref=' + encodeURIComponent(p.ref); }
  function tags(p) {
    return '<span class="tags"><span class="tag tag-op' + (p.op === 'Alquiler' ? ' alq' : '') + '">' + esc(p.op) + '</span><span class="tag">' + esc(p.tipo) + '</span></span>' +
      (p.estado !== 'Disponible' ? '<span class="ribbon ' + esc(p.estado) + '">' + esc(p.estado) + '</span>' : '');
  }
  function card(p) {
    var off = p.estado === 'Vendido' || p.estado === 'Alquilado';
    return '<a class="card-p' + (off ? ' off' : '') + '" href="' + link(p) + '">' +
      '<span class="card-img" style="background-image:url(\'' + img(p) + '\')">' + tags(p) + '</span>' +
      '<span class="card-body"><span class="ref">Ref. ' + esc(p.ref.toUpperCase()) + '</span>' +
      '<span class="card-price">' + GS.price(p) + '</span>' +
      '<h3>' + esc(p.titulo) + '</h3>' +
      '<span class="card-loc"><svg><use href="#i-pin"/></svg>' + esc(p.zona) + (p.barrio ? ' · ' + esc(p.barrio) : '') + '</span>' +
      '<span class="specs">' + specs(p) + '</span></span></a>';
  }
  function feat(p) {
    return '<a class="feat" href="' + link(p) + '">' +
      '<span class="feat-img" style="background-image:url(\'' + img(p) + '\')">' + tags(p) + '</span>' +
      '<span class="feat-body"><span class="ref" style="color:#8FA0AE">Ref. ' + esc(p.ref.toUpperCase()) + ' · ' + esc(p.zona) + '</span>' +
      '<h3>' + esc(p.titulo) + '</h3><span class="feat-price">' + GS.price(p) + '</span>' +
      '<span class="feat-desc">' + esc((p.desc || '').split('. ')[0]) + '.</span>' +
      '<span class="specs">' + specs(p) + '</span>' +
      '<span class="feat-go">Ver ficha completa <svg><use href="#i-arrow"/></svg></span></span></a>';
  }
  var ORDER = { Disponible: 0, Reservado: 1, Alquilado: 2, Vendido: 3 };
  function sorted(list) { return list.slice().sort(function (a, b) { return (ORDER[a.estado] || 0) - (ORDER[b.estado] || 0); }); }

  var NODES = {
    'Sanlúcar la Mayor': [100, 120], 'Benacazón': [105, 262], 'Villanueva del Ariscal': [230, 90], 'Umbrete': [210, 200],
    'Espartinas': [300, 170], 'Gines': [380, 130], 'Bormujos': [400, 210], 'Bollullos de la Mitación': [290, 290],
    'Almensilla': [380, 340], 'Tomares': [470, 250], 'Sevilla': [590, 200]
  };
  var ROADS = [['Sanlúcar la Mayor', 'Benacazón'], ['Benacazón', 'Umbrete'], ['Umbrete', 'Espartinas'], ['Umbrete', 'Villanueva del Ariscal'], ['Espartinas', 'Gines'], ['Gines', 'Bormujos'], ['Bormujos', 'Tomares'], ['Tomares', 'Sevilla'], ['Umbrete', 'Bollullos de la Mitación'], ['Bollullos de la Mitación', 'Almensilla'], ['Bollullos de la Mitación', 'Bormujos'], ['Almensilla', 'Tomares'], ['Espartinas', 'Villanueva del Ariscal'], ['Sanlúcar la Mayor', 'Villanueva del Ariscal']];
  function mapSvg(zona) {
    var p = NODES[zona] || NODES['Umbrete'];
    var roads = ROADS.map(function (r) { var a = NODES[r[0]], b = NODES[r[1]]; return '<path d="M' + a[0] + ' ' + a[1] + ' L' + b[0] + ' ' + b[1] + '"/>'; }).join('');
    var dots = Object.keys(NODES).map(function (z) { var q = NODES[z]; return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="5" fill="#C9D2CE"/>' + (z === zona ? '' : '<text x="' + q[0] + '" y="' + (q[1] + 26) + '" text-anchor="middle" font-size="17" fill="#8A949D" font-family="Public Sans,sans-serif">' + esc(z.replace('de la Mitación', 'M.').replace('del Ariscal', 'del A.')) + '</text>'); }).join('');
    return '<svg viewBox="0 0 640 420" role="img" aria-label="Ubicación aproximada en ' + esc(zona) + '"><path class="map-river" d="M600 20 C560 120 540 160 548 230 S590 340 560 410"/><g class="map-road">' + roads + '</g>' + dots +
      '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="54" fill="#0E9F7E" opacity=".16"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="30" fill="#0E9F7E" opacity=".22"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="9" fill="#0E9F7E"/>' +
      '<text x="' + p[0] + '" y="' + (p[1] - 64) + '" text-anchor="middle" font-size="22" font-weight="700" fill="#121A22" font-family="Space Grotesk,sans-serif">' + esc(zona) + '</text></svg>';
  }

  window.GSUI = { card: card, esc: esc, img: img, specs: specs, link: link, tags: tags, wireLinks: wireLinks, sorted: sorted, mapSvg: mapSvg };

  /* ---------- Página de inicio ---------- */
  var grid = $('#grid');
  if (!grid) return;

  var all = GS.all();
  var state = { op: '', tipo: '', zona: '', precio: '' };
  var searchOp = 'Venta';

  // Destacados
  var featured = all.filter(function (p) { return p.destacado && p.estado !== 'Vendido' && p.estado !== 'Alquilado'; });
  if (!featured.length) featured = all.slice(0, 3);
  var fEl = $('#featured');
  fEl.innerHTML = featured.map(feat).join('');
  $$('.ctrl').forEach(function (b) {
    b.addEventListener('click', function () { fEl.scrollBy({ left: fEl.clientWidth * Number(b.getAttribute('data-dir')), behavior: 'smooth' }); });
  });

  // Selects
  function fill(sel, items, keep) { items.forEach(function (t) { var o = document.createElement('option'); o.value = t; o.textContent = t; sel.appendChild(o); }); }
  fill($('#f-tipo'), GS.tipos); fill($('#f-zona'), GS.zonas);
  fill($('#v-tipo'), ['Piso', 'Casa / chalet', 'Adosado o pareado', 'Ático', 'Casa de pueblo', 'Terreno', 'Local o nave']);
  fill($('#v-zona'), GS.zonas.concat(['Otra localidad']));

  var PRICES = { Venta: [100000, 150000, 200000, 250000, 300000, 400000], Alquiler: [700, 900, 1100, 1300] };
  function fillPrices() {
    var s = $('#f-precio'); s.innerHTML = '<option value="">Sin límite</option>';
    PRICES[searchOp].forEach(function (v) {
      var o = document.createElement('option'); o.value = v;
      o.textContent = 'Hasta ' + GS.price({ precio: v, op: searchOp }); s.appendChild(o);
    });
  }
  fillPrices();
  $$('.search-tabs [data-op]').forEach(function (b) {
    b.addEventListener('click', function () {
      searchOp = b.getAttribute('data-op');
      $$('.search-tabs [data-op]').forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
      fillPrices();
    });
  });
  $('#search').addEventListener('submit', function (e) {
    e.preventDefault();
    state = { op: searchOp, tipo: $('#f-tipo').value, zona: $('#f-zona').value, precio: $('#f-precio').value };
    render(); go('#inmuebles');
  });
  function go(h) { var el = $(h); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

  function match(p) {
    if (state.op && p.op !== state.op) return false;
    if (state.tipo && p.tipo !== state.tipo) return false;
    if (state.zona && p.zona !== state.zona) return false;
    if (state.precio && p.precio > Number(state.precio)) return false;
    return true;
  }
  var LIMIT = 6, expanded = false;
  function render() {
    var list = sorted(all.filter(match));
    var cut = !expanded && window.innerWidth < 640 && list.length > LIMIT + 1;
    grid.innerHTML = (cut ? list.slice(0, LIMIT) : list).map(card).join('') +
      (cut ? '<div class="more"><button type="button" class="btn btn-ghost" id="more">Ver ' + (list.length - LIMIT) + ' inmuebles más</button></div>' : '');
    if (cut) $('#more').addEventListener('click', function () { expanded = true; render(); });
    $('#empty').hidden = list.length > 0;
    var disp = list.filter(function (p) { return p.estado === 'Disponible'; }).length;
    $('#result').textContent = list.length + (list.length === 1 ? ' inmueble' : ' inmuebles') + ' · ' + disp + ' disponibles';
    var chips = [['', 'Todo'], ['Venta', 'En venta'], ['Alquiler', 'En alquiler']].map(function (c) {
      return '<button type="button" class="chip' + (state.op === c[0] ? ' on' : '') + '" data-chip-op="' + c[0] + '">' + c[1] + '</button>';
    });
    ['tipo', 'zona', 'precio'].forEach(function (k) {
      if (!state[k]) return;
      var label = k === 'precio' ? 'Hasta ' + GS.price({ precio: state.precio, op: state.op || 'Venta' }) : state[k];
      chips.push('<button type="button" class="chip chip-x" data-chip-x="' + k + '">' + esc(label) + ' ✕</button>');
    });
    $('#chips').innerHTML = chips.join('');
  }
  $('#chips').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-chip-op')) {
      state.op = b.getAttribute('data-chip-op');
      if (state.precio && state.op === '') state.precio = '';
    }
    if (b.hasAttribute('data-chip-x')) state[b.getAttribute('data-chip-x')] = '';
    render();
  });
  $('#clear').addEventListener('click', function () { state = { op: '', tipo: '', zona: '', precio: '' }; render(); });
  render();

  /* ---------- Anillo 360 ---------- */
  var SEGS = [
    { t: 'Comprar', c: 'Encuentra casa en el Aljarafe con alguien que conoce cada calle.', a: function () { state = { op: 'Venta', tipo: '', zona: '', precio: '' }; render(); go('#inmuebles'); } },
    { t: 'Vender', c: 'Valoramos tu vivienda y la vendemos por ti, hasta la notaría.', a: function () { go('#vender'); } },
    { t: 'Alquilar', c: 'Alquiler con contrato, solvencia del inquilino y entrega de llaves.', a: function () { state = { op: 'Alquiler', tipo: '', zona: '', precio: '' }; render(); go('#inmuebles'); } },
    { t: 'Financiar', c: 'Te orientamos con la hipoteca antes de dar el paso.', a: function () { go('#financiacion'); } },
    { t: 'Terrenos', c: 'Solares, parcelas, naves y locales para invertir o emprender.', a: function () { state = { op: '', tipo: 'Terreno', zona: '', precio: '' }; render(); go('#inmuebles'); } }
  ];
  var segG = $('.ring-segs');
  if (segG) {
    var cx = 200, cy = 200, r1 = 120, r2 = 182, n = SEGS.length, gap = 0.03;
    var html = '';
    SEGS.forEach(function (s, i) {
      var a0 = -Math.PI / 2 + (i / n) * Math.PI * 2 + gap, a1 = -Math.PI / 2 + ((i + 1) / n) * Math.PI * 2 - gap;
      var P = function (r, a) { return (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1); };
      var d = 'M' + P(r2, a0) + ' A' + r2 + ' ' + r2 + ' 0 0 1 ' + P(r2, a1) + ' L' + P(r1, a1) + ' A' + r1 + ' ' + r1 + ' 0 0 0 ' + P(r1, a0) + 'Z';
      var am = (a0 + a1) / 2, rm = (r1 + r2) / 2;
      html += '<g class="ring-seg" data-i="' + i + '" tabindex="0" role="button" aria-label="' + s.t + '"><path d="' + d + '"/><text x="' + (cx + rm * Math.cos(am)).toFixed(1) + '" y="' + (cy + rm * Math.sin(am) + 5).toFixed(1) + '" text-anchor="middle">' + s.t + '</text></g>';
    });
    segG.innerHTML = html;
    var cap = $('#ringCap'), cur = 0, timer;
    var show = function (i) { cur = i; $$('.ring-seg').forEach(function (g, k) { g.classList.toggle('on', k === i); }); cap.textContent = SEGS[i].c; };
    show(0);
    timer = setInterval(function () { show((cur + 1) % n); }, 3200);
    $$('.ring-seg').forEach(function (g) {
      var i = Number(g.getAttribute('data-i'));
      g.addEventListener('mouseenter', function () { clearInterval(timer); show(i); });
      g.addEventListener('click', function () { clearInterval(timer); show(i); SEGS[i].a(); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); SEGS[i].a(); } });
    });
  }

  /* ---------- Mapa de zonas ---------- */
  var counts = {};
  all.forEach(function (p) { if (p.estado === 'Disponible' || p.estado === 'Reservado') counts[p.zona] = (counts[p.zona] || 0) + 1; });
  $('#mapRoads').innerHTML = ROADS.map(function (r) { var a = NODES[r[0]], b = NODES[r[1]]; return '<path d="M' + a[0] + ' ' + a[1] + ' L' + b[0] + ' ' + b[1] + '"/>'; }).join('');
  $('#mapNodes').innerHTML = Object.keys(NODES).map(function (z) {
    var p = NODES[z], c = counts[z] || 0, hq = z === 'Umbrete';
    var label = z === 'Bollullos de la Mitación' ? 'Bollullos M.' : z === 'Villanueva del Ariscal' ? 'Villanueva del A.' : z;
    var ly = p[1] < 110 ? p[1] - 26 : p[1] + 38;
    return '<g class="map-node' + (c ? ' has' : '') + (hq ? ' hq' : '') + '" data-zona="' + esc(z) + '" tabindex="0" role="button" aria-label="' + esc(z) + ': ' + c + ' inmuebles">' +
      (hq ? '<circle class="hq-ring" cx="' + p[0] + '" cy="' + p[1] + '" r="24"/>' : '') +
      '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (c ? 17 : 9) + '"/>' +
      (c ? '<text class="cnt" x="' + p[0] + '" y="' + (p[1] + 4) + '" text-anchor="middle">' + c + '</text>' : '') +
      '<text x="' + p[0] + '" y="' + ly + '" text-anchor="middle">' + esc(label) + (hq ? ' · oficina' : '') + '</text></g>';
  }).join('');
  $('#zoneList').innerHTML = GS.zonas.map(function (z) {
    return '<li><button type="button" data-zona="' + esc(z) + '">' + esc(z) + (counts[z] ? '<b>' + counts[z] + '</b>' : '') + '</button></li>';
  }).join('');
  function byZone(z) { state = { op: '', tipo: '', zona: z, precio: '' }; render(); go('#inmuebles'); }
  $$('[data-zona]').forEach(function (el) {
    el.addEventListener('click', function () { byZone(el.getAttribute('data-zona')); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter') byZone(el.getAttribute('data-zona')); });
  });

  /* ---------- Propietarios ---------- */
  var mode = 'vender';
  $$('.seg [data-mode]').forEach(function (b) {
    b.addEventListener('click', function () {
      mode = b.getAttribute('data-mode');
      $$('.seg [data-mode]').forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
      $$('[data-mode-text]').forEach(function (el) { el.hidden = el.getAttribute('data-mode-text') !== mode; });
    });
  });

  function validate(form) {
    var ok = true;
    $$('[required]', form).forEach(function (f) {
      var bad = !f.value.trim() || (f.type === 'tel' && f.value.replace(/\D/g, '').length < 9);
      f.classList.toggle('err', bad); if (bad && ok) { f.focus(); ok = false; }
    });
    var em = form.querySelector('[type=email]');
    if (ok && em && em.value && !/^\S+@\S+\.\S+$/.test(em.value)) { em.classList.add('err'); em.focus(); ok = false; }
    return ok;
  }
  $$('form.form input, form.form select').forEach(function (f) { f.addEventListener('input', function () { f.classList.remove('err'); }); });

  var vf = $('#valoracion');
  vf.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate(vf)) return;
    var d = { nombre: vf.nombre.value.trim(), telefono: vf.telefono.value.trim(), email: vf.email.value.trim(), localidad: vf.localidad.value, tipoInmueble: vf.tipo.value };
    GS.addLead({ tipo: mode === 'vender' ? 'Valoración' : 'Poner en alquiler', nombre: d.nombre, telefono: d.telefono, detalle: d.tipoInmueble + ' en ' + d.localidad });
    var msg = 'Hola, soy ' + d.nombre + '. ' + (mode === 'vender' ? 'Quiero valorar mi vivienda' : 'Quiero poner en alquiler mi propiedad') + ': ' + d.tipoInmueble + ' en ' + d.localidad + '. Mi teléfono es ' + d.telefono + '.';
    $('[data-wa-from-form]', vf).href = GS.wa(msg); $('[data-wa-from-form]', vf).target = '_blank';
    $('.ok', vf).hidden = false; vf.reset();
  });
  var cf = $('#contactForm');
  cf.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate(cf)) return;
    GS.addLead({ tipo: 'Contacto', nombre: cf.nombre.value.trim(), telefono: cf.telefono.value.trim(), detalle: cf.motivo.value + (cf.mensaje.value ? ': ' + cf.mensaje.value.trim().slice(0, 120) : '') });
    $('.ok', cf).hidden = false; cf.reset();
  });

  /* ---------- Calculadora ---------- */
  var cP = $('#c-precio'), cE = $('#c-entrada'), cY = $('#c-plazo'), cT = $('#c-tipo');
  function calc() {
    var precio = +cP.value, ent = +cE.value, años = +cY.value, tipo = +cT.value;
    var capital = precio * (1 - ent / 100), i = tipo / 100 / 12, nn = años * 12;
    var cuota = i ? capital * i / (1 - Math.pow(1 + i, -nn)) : capital / nn;
    $('#c-precio-o').textContent = GS.price({ precio: precio, op: 'Venta' });
    $('#c-entrada-o').textContent = ent + ' % · ' + GS.price({ precio: precio * ent / 100, op: 'Venta' });
    $('#c-plazo-o').textContent = años + ' años';
    $('#c-tipo-o').textContent = tipo.toFixed(1).replace('.', ',') + ' %';
    $('#c-cuota').textContent = GS.price({ precio: cuota, op: 'Venta' }) + '/mes';
  }
  [cP, cE, cY, cT].forEach(function (x) { x.addEventListener('input', calc); });
  calc();
})();
