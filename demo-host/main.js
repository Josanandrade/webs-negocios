(function () {
  'use strict';
  var CFG = window.JP_CONFIG, FMT = window.JP_FMT, STORE = window.JP_STORE;
  var BASE = document.body.dataset.base || '';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var icon = function (n) { return '<svg aria-hidden="true"><use href="' + BASE + 'assets/icons.svg#' + n + '"/></svg>'; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var img = function (f) { return /^(data:|https?:)/.test(f) ? f : BASE + 'assets/img/' + f; };

  /* ---------- cabecera ---------- */
  var burger = $('#burger'), nav = $('#nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open);
      burger.innerHTML = icon(open ? 'close' : 'menu');
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); burger.innerHTML = icon('menu'); }); });
  }
  var top = $('.top');
  var onScroll = function () { if (top) top.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  var toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('is-on');
    clearTimeout(toast.t); toast.t = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3200);
  }

  /* ---------- WhatsApp y contacto ---------- */
  var fab = $('#fab');
  if (fab) {
    var link = FMT.wa('Hola Julio, te escribo desde tu web. ');
    if (link) { fab.href = link; fab.target = '_blank'; fab.rel = 'noopener'; }
    else fab.hidden = true;
  }
  var cl = $('#contactList');
  if (cl) {
    var rows = [];
    if (CFG.phone) rows.push('<li><a href="tel:+34' + CFG.phone.replace(/\s/g, '') + '">' + icon('phone') + '<span><small>Teléfono</small><b>' + esc(CFG.phone) + '</b></span></a></li>');
    if (CFG.whatsapp) rows.push('<li><a href="' + FMT.wa('Hola Julio, te escribo desde tu web. ') + '" target="_blank" rel="noopener">' + icon('wa') + '<span><small>WhatsApp</small><b>Escríbenos ahora</b></span></a></li>');
    if (CFG.email) rows.push('<li><a href="mailto:' + CFG.email + '">' + icon('mail') + '<span><small>Email</small><b>' + esc(CFG.email) + '</b></span></a></li>');
    if (CFG.address) rows.push('<li><a href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(CFG.address) + '" target="_blank" rel="noopener">' + icon('pin') + '<span><small>Oficina</small><b>' + esc(CFG.address) + '</b></span></a></li>');
    cl.innerHTML = rows.join('');
  }
  var fc = $('#footContact');
  if (fc) {
    fc.innerHTML = (CFG.phone ? '<a href="tel:+34' + CFG.phone.replace(/\s/g, '') + '">' + esc(CFG.phone) + '</a>' : '') +
      (CFG.email ? '<a href="mailto:' + CFG.email + '">' + esc(CFG.email) + '</a>' : '') +
      '<span>' + esc(CFG.address) + '</span>';
  }

  /* ---------- mapa de zona (esquema propio, no es un mapa real) ---------- */
  var TOWNS = {
    'Sevilla': [455, 128], 'Gelves': [372, 250], 'Palomares del Río': [282, 272], 'Almensilla': [210, 302],
    'Coria del Río': [340, 356], 'La Puebla del Río': [318, 470], 'Villamanrique de la Condesa': [92, 446]
  };
  var LABELS = { 'Sevilla': ['end', -16, 8], 'Gelves': ['start', 16, -6], 'Palomares del Río': ['end', -14, -10], 'Almensilla': ['end', -14, 10], 'Coria del Río': ['start', 18, 8], 'La Puebla del Río': ['end', -16, 8], 'Villamanrique de la Condesa': ['start', 14, 8] };
  function zoneMap(opt) {
    opt = opt || {};
    var s = '<svg viewBox="0 0 600 560" role="img" aria-label="Esquema de la zona de trabajo">';
    s += '<rect width="600" height="560" fill="#DCE5DF"/>';
    s += '<path d="M0 0H600V560H0Z" fill="url(#none)"/>';
    for (var i = 0; i < 12; i++) s += '<path d="M0 ' + (i * 50) + ' H600" stroke="#CBD6CF" stroke-width="1"/>';
    for (var j = 0; j < 12; j++) s += '<path d="M' + (j * 50) + ' 0 V560" stroke="#CBD6CF" stroke-width="1"/>';
    s += '<path d="M120 560 C140 500 60 470 30 420 L0 400 V560Z" fill="#C9D5C4" opacity=".8"/>';
    s += '<path d="M500 -10 C480 60 470 120 446 170 C420 220 404 250 392 300 C380 350 372 380 356 430 C344 470 350 520 380 570" stroke="#9DB8BE" stroke-width="22" fill="none" stroke-linecap="round"/>';
    s += '<path d="M500 -10 C480 60 470 120 446 170 C420 220 404 250 392 300 C380 350 372 380 356 430 C344 470 350 520 380 570" stroke="#B9CFD3" stroke-width="10" fill="none" stroke-linecap="round"/>';
    s += '<text x="420" y="345" transform="rotate(-72 420 345)" font-family="Ibarra Real Nova, Georgia, serif" font-style="italic" font-size="18" fill="#5F7F86">Guadalquivir</text>';
    Object.keys(TOWNS).forEach(function (t) {
      var p = TOWNS[t], on = opt.town === t, base = t === 'Coria del Río';
      s += '<g>';
      if (on && opt.approx) s += '<circle cx="' + opt.approx.x + '" cy="' + opt.approx.y + '" r="46" fill="#3F5E52" opacity=".18"/><circle cx="' + opt.approx.x + '" cy="' + opt.approx.y + '" r="46" fill="none" stroke="#3F5E52" stroke-dasharray="4 5" opacity=".6"/>';
      s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (base ? 11 : 8) + '" fill="' + (base ? '#13191B' : (on ? '#3F5E52' : '#FFFDF9')) + '" stroke="#13191B" stroke-width="1.5"/>';
      var L = LABELS[t] || ['start', 14, 7];
      s += '<text x="' + (p[0] + L[1]) + '" y="' + (p[1] + L[2]) + '" text-anchor="' + L[0] + '" font-family="Inter Tight, system-ui, sans-serif" font-size="' + (base || on ? 25 : 22) + '" font-weight="' + (base || on ? 600 : 500) + '" fill="#13191B" paint-order="stroke" stroke="#DCE5DF" stroke-width="5">' + t.replace('Villamanrique de la Condesa', 'Villamanrique').replace('La Puebla del Río', 'La Puebla') + '</text>';
      s += '</g>';
    });
    if (!opt.town) s += '<g transform="translate(340 356)"><rect x="18" y="20" width="104" height="30" rx="15" fill="#13191B"/><text x="70" y="41" text-anchor="middle" font-family="Inter Tight, system-ui, sans-serif" font-size="16" fill="#F7F4EE">Oficina</text></g>';
    return s + '</svg>';
  }
  var zm = $('#zoneMap'); if (zm) zm.innerHTML = zoneMap();

  /* ---------- tarjeta ---------- */
  function card(p, lead) {
    var closed = p.status === 'vendido' || p.status === 'alquilado';
    var tags = '<span class="tag tag--op">' + (p.op === 'venta' ? 'Venta' : 'Alquiler') + '</span>';
    if (p.status !== 'disponible') tags += '<span class="tag tag--' + p.status + '">' + FMT.status[p.status] + '</span>';
    else if (p.featured) tags += '<span class="tag tag--star">Destacado</span>';
    var price = new Intl.NumberFormat('es-ES').format(p.price) + ' €' + (p.op === 'alquiler' ? '<small> /mes</small>' : '');
    return '<a class="prop' + (lead ? ' is-lead' : '') + (closed ? ' is-closed' : '') + '" href="' + BASE + 'inmueble/?ref=' + encodeURIComponent(p.ref) + '">' +
      '<div class="prop__img"><img src="' + img(p.cover) + '" alt="' + esc(p.title) + '" loading="lazy" width="1200" height="800"><div class="prop__tags">' + tags + '</div></div>' +
      '<div class="prop__body"><div class="prop__price">' + price + '</div>' +
      '<h3 class="prop__title">' + esc(p.title) + '</h3>' +
      '<p class="prop__loc" style="margin:0">' + icon('pin') + esc(p.town) + ' · ' + esc(p.type) + '</p>' +
      '<div class="specs"><span>' + icon('bed') + p.beds + ' hab.</span><span>' + icon('bath') + p.baths + (p.baths === 1 ? ' baño' : ' baños') + '</span><span>' + icon('area') + p.m2 + ' m²</span></div>' +
      '</div></a>';
  }
  function sortProps(list) {
    var rank = { disponible: 0, reservado: 1, alquilado: 2, vendido: 2 };
    return list.slice().sort(function (a, b) { return (rank[a.status] - rank[b.status]) || ((b.featured ? 1 : 0) - (a.featured ? 1 : 0)); });
  }

  /* ---------- formularios ---------- */
  function validate(form) {
    var ok = true;
    $$('[required]', form).forEach(function (el) {
      var bad = el.type === 'checkbox' ? !el.checked : !String(el.value).trim();
      if (el.type === 'tel' && !bad) bad = el.value.replace(/\D/g, '').length < 9;
      var f = el.closest('.field'); if (f) f.classList.toggle('is-bad', bad);
      if (bad) ok = false;
    });
    return ok;
  }
  function sendForm(form, build, okMsg) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = $('.form__msg', form);
      if (!validate(form)) { msg.textContent = 'Revisa los campos marcados.'; msg.classList.add('is-bad'); return; }
      msg.classList.remove('is-bad');
      var d = {}; new FormData(form).forEach(function (v, k) { d[k] = v; });
      var link = FMT.wa(build(d));
      msg.textContent = okMsg + (link ? ' Te abrimos WhatsApp con tu mensaje preparado.' : '');
      if (link) window.open(link, '_blank', 'noopener');
      form.reset();
    });
  }
  var vf = $('#valForm');
  if (vf) {
    var vt = $('#valTown');
    CFG.zone.concat(['Otra localidad']).forEach(function (t) { vt.insertAdjacentHTML('beforeend', '<option>' + esc(t) + '</option>'); });
    sendForm(vf, function (d) {
      return 'Hola Julio, quiero ' + (d.goal === 'alquilar' ? 'alquilar' : 'vender') + ' mi vivienda y me gustaría una valoración.\n' +
        'Nombre: ' + d.name + '\nTeléfono: ' + d.tel + (d.email ? '\nEmail: ' + d.email : '') + '\nLocalidad: ' + d.town + '\nTipo: ' + d.type;
    }, 'Solicitud lista.');
  }
  var cf = $('#contactForm');
  if (cf) sendForm(cf, function (d) { return 'Hola Julio, me interesa: ' + d.topic + '.\n' + (d.msg ? d.msg + '\n' : '') + 'Nombre: ' + d.name + '\nTeléfono: ' + d.tel; }, 'Consulta lista.');

  /* ---------- portada ---------- */
  var grid = $('#grid');
  if (grid) {
    var all = STORE.all().filter(function (p) { return p.demo !== false; });
    var state = { op: '', type: '', town: '', max: '' }, showAll = false, LIMIT = 6;
    var fType = $('#fType'), fTown = $('#fTown'), fMax = $('#fMax');
    var uniq = function (k) { return all.map(function (p) { return p[k]; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(); };
    uniq('type').forEach(function (t) { fType.insertAdjacentHTML('beforeend', '<option>' + esc(t) + '</option>'); });
    CFG.zone.forEach(function (t) { fTown.insertAdjacentHTML('beforeend', '<option>' + esc(t) + '</option>'); });
    var PRICES = { venta: [100000, 150000, 200000, 250000, 300000, 400000], alquiler: [500, 700, 900, 1200] };
    function fillMax(op) {
      fMax.innerHTML = '<option value="">Sin límite</option>' + PRICES[op].map(function (v) { return '<option value="' + v + '">Hasta ' + new Intl.NumberFormat('es-ES').format(v) + (op === 'alquiler' ? ' €/mes' : ' €') + '</option>'; }).join('');
    }
    fillMax('venta');
    $$('input[name="op"]', $('#search')).forEach(function (r) { r.addEventListener('change', function () { fillMax(r.value); }); });

    function render() {
      var list = sortProps(all.filter(function (p) {
        return (!state.op || p.op === state.op) && (!state.type || p.type === state.type) && (!state.town || p.town === state.town) && (!state.max || p.price <= +state.max);
      }));
      var filtered = state.type || state.town || state.max;
      var shown = (showAll || state.type || state.town || state.max) ? list : list.slice(0, LIMIT);
      grid.innerHTML = shown.map(function (p, i) { return card(p, i === 0 && !filtered && list.length > 3); }).join('');
      var more = $('#more');
      more.hidden = shown.length >= list.length;
      $('button', more).textContent = 'Ver los ' + list.length + ' inmuebles';
      $('#empty').hidden = list.length > 0;
      var bits = [];
      if (state.op) bits.push(state.op === 'venta' ? 'en venta' : 'en alquiler');
      if (state.type) bits.push(state.type.toLowerCase());
      if (state.town) bits.push('en ' + state.town);
      if (state.max) bits.push('hasta ' + new Intl.NumberFormat('es-ES').format(state.max) + ' €');
      $('#results').innerHTML = '<b>' + list.length + '</b> ' + (list.length === 1 ? 'inmueble' : 'inmuebles') + (bits.length ? ' ' + esc(bits.join(' · ')) : ' en cartera') +
        (filtered ? ' · <button class="link" id="clear2">Quitar filtros</button>' : '');
      var c2 = $('#clear2'); if (c2) c2.addEventListener('click', clear);
      $$('#opChips .chip').forEach(function (c) { c.classList.toggle('is-on', c.dataset.op === state.op); });
    }
    function clear() { state = { op: '', type: '', town: '', max: '' }; showAll = false; $('#search').reset(); fillMax('venta'); render(); }
    $('#search').addEventListener('submit', function (e) {
      e.preventDefault();
      state.op = $('input[name="op"]:checked').value; state.type = fType.value; state.town = fTown.value; state.max = fMax.value;
      render();
      $('#inmuebles').scrollIntoView({ behavior: 'smooth' });
    });
    $$('#opChips .chip').forEach(function (c) { c.addEventListener('click', function () { state.op = c.dataset.op; if (state.max && state.op) state.max = ''; render(); }); });
    $('#clear').addEventListener('click', clear);
    $('#more button').addEventListener('click', function () { showAll = true; render(); });
    render();

    // destacado del hero: el primer destacado disponible
    var pick = all.filter(function (p) { return p.featured && p.status === 'disponible' && p.op === 'venta'; }).sort(function (a, b) { return b.price - a.price; })[0];
    if (pick) {
      var hp = $('#heroPick');
      hp.href = BASE + 'inmueble/?ref=' + pick.ref;
      $('.hero__pick-t', hp).textContent = pick.type + ' en ' + pick.town;
      $('.hero__pick-p', hp).textContent = FMT.price(pick);
      $('.arch img').src = img(pick.cover);
    }

    // animación "panel → web"
    var p1 = $('#syncPill1'), p2 = $('#syncPill2');
    if (p1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var seq = [['Disponible', ''], ['Reservado', 'is-res'], ['Vendido', 'is-sold']], k = 0;
      setInterval(function () {
        k = (k + 1) % seq.length;
        p1.textContent = seq[k][0]; p1.className = 'pill ' + seq[k][1];
        setTimeout(function () { p2.textContent = seq[k][0]; p2.className = 'pill ' + seq[k][1]; }, 700);
      }, 2600);
    }
  }

  /* ---------- ficha ---------- */
  var det = $('#detail');
  if (det) {
    var ref = new URLSearchParams(location.search).get('ref') || '';
    var p = STORE.get(ref);
    if (!p) {
      det.innerHTML = '<div class="notfound"><h1 class="det__title">Este inmueble ya no está publicado</h1><p class="lead" style="margin:0 auto 24px">Puede que se haya vendido o retirado.</p><a class="btn btn--ink" href="' + BASE + '#inmuebles">Ver todos los inmuebles</a></div>';
      return;
    }
    document.title = p.title + ' · ' + p.town + ' · ' + CFG.brand;
    var photos = [p.cover].concat(p.gallery || []);
    var waText = 'Hola Julio, me interesa el inmueble ' + p.ref + ' (' + p.title + ', ' + p.town + ', ' + FMT.price(p) + '). ¿Me das más información?';
    var wa = FMT.wa(waText);
    var tags = '<span class="tag tag--op">' + (p.op === 'venta' ? 'Venta' : 'Alquiler') + '</span><span class="tag ' + (p.status === 'disponible' ? '' : 'tag--' + p.status) + '">' + FMT.status[p.status] + '</span>' + (p.featured ? '<span class="tag tag--star">Destacado</span>' : '');
    var kv = [['bed', 'Habitaciones', p.beds], ['bath', 'Baños', p.baths], ['area', 'Superficie', p.m2 + ' m²']];
    if (p.plot) kv.push(['plot', 'Parcela', new Intl.NumberFormat('es-ES').format(p.plot) + ' m²']);
    kv.push(['home', 'Tipo', p.type]); kv.push(['key', 'Referencia', p.ref]);
    var price = new Intl.NumberFormat('es-ES').format(p.price) + ' €' + (p.op === 'alquiler' ? '<small> /mes</small>' : '');
    det.innerHTML =
      '<a class="crumb" href="' + BASE + '#inmuebles">' + icon('back') + 'Volver a inmuebles</a>' +
      '<div class="gal"><div class="gal__track" id="galTrack" tabindex="0" aria-label="Galería de fotos">' +
      photos.map(function (f, i) { return '<img src="' + img(f) + '" alt="' + esc(p.title) + ', foto ' + (i + 1) + '" width="1200" height="800"' + (i ? ' loading="lazy"' : '') + '>'; }).join('') +
      '</div><button class="gal__nav gal__nav--p" aria-label="Foto anterior">' + icon('back') + '</button><button class="gal__nav gal__nav--n" aria-label="Foto siguiente">' + icon('arrow') + '</button>' +
      '<span class="gal__count" id="galCount">1 / ' + photos.length + '</span></div>' +
      '<div class="gal__thumbs" id="galThumbs">' + photos.map(function (f, i) { return '<button class="' + (i ? '' : 'is-on') + '" aria-label="Ver foto ' + (i + 1) + '"><img src="' + img(f) + '" alt=""></button>'; }).join('') + '</div>' +
      '<div class="det"><div>' +
      '<div class="det__tags">' + tags + '</div>' +
      '<h1 class="det__title">' + esc(p.title) + '</h1>' +
      '<p class="det__loc">' + icon('pin') + esc(p.town) + (p.area ? ' · ' + esc(p.area) : '') + '</p>' +
      '<p class="det__price">' + price + '</p>' +
      '<div class="kv">' + kv.map(function (r) { return '<div><small>' + r[1] + '</small><b>' + icon(r[0]) + esc(r[2]) + '</b></div>'; }).join('') + '</div>' +
      '<h2>Descripción</h2><p class="det__desc">' + esc(p.description) + '</p>' +
      '<h2>Características</h2><ul class="feats">' + (p.features || []).map(function (f) { return '<li>' + icon('check') + esc(f) + '</li>'; }).join('') + '</ul>' +
      '<h2>Ubicación aproximada</h2><div class="det__map">' + zoneMap({ town: p.town, approx: p.map || { x: TOWNS[p.town][0], y: TOWNS[p.town][1] } }) + '</div>' +
      '<p class="det__mapnote">Por privacidad del propietario mostramos solo la zona. La dirección exacta se facilita al concertar la visita.</p>' +
      '</div>' +
      '<aside class="card aside" id="info"><div class="aside__who"><span class="brand__mark">JP</span><div><b>Julio Puig</b><span>Te atiende personalmente</span></div></div>' +
      '<form id="infoForm" class="form" style="padding:0;box-shadow:none" novalidate>' +
      '<h2 class="form__t" style="font-size:24px">Quiero información</h2>' +
      '<label class="field"><span>Nombre</span><input name="name" autocomplete="name" required></label>' +
      '<label class="field"><span>Teléfono</span><input name="tel" type="tel" inputmode="tel" autocomplete="tel" required></label>' +
      '<label class="field"><span>Mensaje</span><textarea name="msg" rows="3">Me interesa este inmueble (' + esc(p.ref) + '). ¿Podemos concertar una visita?</textarea></label>' +
      '<button class="btn btn--ink btn--block" type="submit">Quiero información</button><p class="form__msg" role="status"></p></form>' +
      (wa ? '<a class="btn btn--wa btn--block" href="' + wa + '" target="_blank" rel="noopener">' + icon('wa') + 'Preguntar por WhatsApp</a>' : '') +
      (CFG.phone ? '<a class="btn btn--line btn--block" href="tel:+34' + CFG.phone.replace(/\s/g, '') + '">' + icon('phone') + 'Llamar a Julio</a>' : '') +
      '</aside></div>';

    var bar = $('#bar');
    if (bar) {
      bar.innerHTML = '<a class="btn btn--ink" href="#info">Quiero información</a>' + (wa ? '<a class="btn btn--wa" href="' + wa + '" target="_blank" rel="noopener">' + icon('wa') + 'WhatsApp</a>' : '');
      document.body.classList.add('has-bar');
    }
    sendForm($('#infoForm'), function (d) { return 'Hola Julio, soy ' + d.name + ' (' + d.tel + '). ' + d.msg + ' [' + p.title + ', ' + p.town + ']'; }, 'Mensaje listo.');

    // galería
    var track = $('#galTrack'), count = $('#galCount'), thumbs = $$('#galThumbs button');
    var cur = 0;
    function go(i) { i = Math.max(0, Math.min(photos.length - 1, i)); track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' }); }
    track.addEventListener('scroll', function () {
      var i = Math.round(track.scrollLeft / track.clientWidth);
      if (i !== cur) { cur = i; count.textContent = (i + 1) + ' / ' + photos.length; thumbs.forEach(function (t, k) { t.classList.toggle('is-on', k === i); }); }
    }, { passive: true });
    $('.gal__nav--p').addEventListener('click', function () { go(cur - 1); });
    $('.gal__nav--n').addEventListener('click', function () { go(cur + 1); });
    thumbs.forEach(function (t, k) { t.addEventListener('click', function () { go(k); }); });
    track.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') go(cur + 1); if (e.key === 'ArrowLeft') go(cur - 1); });

    var rel = sortProps(STORE.all()).filter(function (q) { return q.ref !== p.ref && q.status === 'disponible' && (q.op === p.op || q.town === p.town); }).slice(0, 3);
    var rg = $('#related');
    if (rg && rel.length) rg.innerHTML = rel.map(function (q) { return card(q); }).join('');
    else if (rg) rg.closest('section').hidden = true;
  }
})();
