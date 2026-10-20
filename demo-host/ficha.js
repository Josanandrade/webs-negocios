/* Global Soluciones Inmobiliarias · ficha del inmueble (demo) */
(function () {
  var GS = window.GS, U = window.GSUI, esc = U.esc;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var main = $('#fx');
  var ref = new URLSearchParams(location.search).get('ref') || '';
  var p = GS.get(ref);

  if (!p) {
    main.innerHTML = '<div class="notfound"><h1>Este inmueble ya no está publicado</h1><p class="muted" style="margin-top:12px">Puede que se haya vendido o retirado. Echa un vistazo al resto de la cartera.</p><a class="btn btn-jade" href="../#inmuebles">Ver inmuebles</a></div>';
    $('#mobileCta').hidden = true;
    return;
  }

  document.title = p.titulo + ' en ' + p.zona + ' · ' + GS.price(p) + ' · Global Soluciones Inmobiliarias';
  var fotos = (p.fotos && p.fotos.length ? p.fotos : ['assets/inmuebles/placeholder.svg']).map(function (f) { return /^(data:|https?:)/.test(f) ? f : '../' + f; });
  var NAMES = ['Fachada', 'Salón', 'Cocina', 'Dormitorio', 'Exterior', 'Baño'];
  var waMsg = 'Hola, me interesa el inmueble ' + p.ref.toUpperCase() + ' (' + p.titulo + ' en ' + p.zona + ', ' + GS.price(p) + '). ¿Me dais más información?';
  var MAIN = ['Garaje', 'Terraza', 'Ascensor', 'Piscina'];
  var vivienda = p.hab > 0;
  var feats = (vivienda ? MAIN : []).concat((p.extras || []).filter(function (e) { return MAIN.indexOf(e) < 0; }));
  var off = p.estado !== 'Disponible';

  var facts = [];
  if (p.hab) facts.push(['Habitaciones', p.hab]);
  if (p.banos) facts.push(['Baños', p.banos]);
  facts.push([p.tipo === 'Terreno' ? 'Superficie' : 'Construidos', p.m2 + ' m²']);
  facts.push(p.parcela ? ['Parcela', p.parcela + ' m²'] : ['Tipo', p.tipo]);

  var cuota = '';
  if (p.op === 'Venta' && p.precio > 40000) {
    var cap = p.precio * 0.8, i = 0.03 / 12, n = 360;
    cuota = '<p class="muted small" style="margin:0">Con un 20 % de ahorro y una hipoteca a 30 años al 3 %, la cuota rondaría los <b style="color:var(--text)">' + GS.price({ precio: cap * i / (1 - Math.pow(1 + i, -n)), op: 'Venta' }) + '/mes</b>. <a href="../#financiacion">Calcula la tuya</a>.</p>';
  }

  main.innerHTML =
    '<nav class="crumbs" aria-label="Migas"><a href="../">Inicio</a><span>›</span><a href="../#inmuebles">Inmuebles</a><span>›</span><span>' + esc(p.zona) + '</span></nav>' +
    '<div class="gallery"><div class="g-track" id="gTrack">' + fotos.map(function (f, k) { return '<img src="' + esc(f) + '" alt="' + esc((NAMES[k] || 'Foto') + ' · ' + p.titulo) + ' (ilustración de demostración)" loading="' + (k ? 'lazy' : 'eager') + '" data-k="' + k + '">'; }).join('') + '</div>' +
    (fotos.length > 1 ? '<button class="g-nav g-prev" aria-label="Foto anterior"><svg><use href="#i-arrow"/></svg></button><button class="g-nav g-next" aria-label="Foto siguiente"><svg><use href="#i-arrow"/></svg></button>' : '') +
    '<span class="g-count" id="gCount">1 / ' + fotos.length + '</span></div>' +
    (fotos.length > 1 ? '<div class="g-thumbs" id="gThumbs">' + fotos.map(function (f, k) { return '<button type="button" aria-label="Ver foto ' + (k + 1) + '" style="background-image:url(\'' + esc(f) + '\')"' + (k ? '' : ' class="on"') + '></button>'; }).join('') + '</div>' : '') +
    '<div class="fx-grid"><article>' +
      '<div class="fx-head">' + U.tags(p).replace(/<span class="ribbon[^<]*<\/span>/, '').replace(/<\/span>$/, (off ? '<span class="st st-' + esc(p.estado) + '">' + esc(p.estado) + '</span>' : '') + '</span>') + '<h1>' + esc(p.titulo) + '</h1>' +
      '<p class="fx-price">' + GS.price(p) + '</p><p class="fx-loc"><svg><use href="#i-pin"/></svg>' + esc(p.zona) + (p.barrio ? ' · ' + esc(p.barrio) : '') + '</p><p class="ref" style="margin-top:6px">Ref. ' + esc(p.ref.toUpperCase()) + '</p></div>' +
      '<div class="fx-facts">' + facts.map(function (f) { return '<div><small>' + f[0] + '</small><b>' + esc(f[1]) + '</b></div>'; }).join('') + '</div>' +
      '<div class="fx-block"><h2>Descripción</h2><p>' + esc(p.desc || '') + '</p>' + cuota + '</div>' +
      (feats.length ? '<div class="fx-block"><h2>Características</h2><ul class="fx-feats">' + feats.map(function (e) { var has = (p.extras || []).indexOf(e) >= 0; return '<li class="' + (has ? '' : 'no') + '"><svg><use href="#i-check"/></svg>' + esc(e) + '</li>'; }).join('') + '</ul></div>' : '') +
      '<div class="fx-block"><h2>Ubicación aproximada</h2><div class="fx-map">' + U.mapSvg(p.zona) + '<p>Mostramos la zona, no la dirección exacta. Te la damos al concertar la visita.</p></div></div>' +
    '</article>' +
    '<aside class="fx-side" id="info">' +
      (off ? '<div class="fx-status ' + esc(p.estado) + '">Este inmueble está ' + esc(p.estado.toLowerCase()) + '. Te avisamos si vuelve a estar libre o si entra algo parecido.</div>' : '') +
      '<form class="card form" id="infoForm" novalidate><p class="form-title">Quiero información</p>' +
        '<label><span>Nombre</span><input name="nombre" autocomplete="name" required></label>' +
        '<label><span>Teléfono</span><input name="telefono" type="tel" inputmode="tel" autocomplete="tel" required></label>' +
        '<label><span>Mensaje</span><textarea name="mensaje" rows="3">Me interesa este inmueble (Ref. ' + esc(p.ref.toUpperCase()) + '). ¿Podemos concertar una visita?</textarea></label>' +
        '<button class="btn btn-ink btn-block" type="submit">Quiero información</button>' +
        '<a class="btn fx-wa btn-block" id="sWa" href="#"><svg><use href="#i-wa"/></svg> Preguntar por WhatsApp</a>' +
        '<div class="ok" hidden><svg><use href="#i-check"/></svg><p><b>Recibido.</b> Te llamamos para darte los detalles y concertar la visita.</p></div>' +
      '</form>' +
      '<div class="card fx-agent"><svg class="brand-mark"><use href="#i-logo"/></svg><div><b>Global Soluciones Inmobiliarias</b><small>Av. de los Poetas, 31 · Umbrete</small><a data-tel href="tel:+34654700166" style="font-weight:600">Llamar al <span data-tel-text>654 700 166</span></a></div></div>' +
    '</aside></div>';

  U.wireLinks();
  $('#sWa').href = $('#mWa').href = GS.wa(waMsg);
  $('#sWa').target = $('#mWa').target = '_blank';

  // Galería
  var track = $('#gTrack'), count = $('#gCount'), thumbs = $('#gThumbs');
  function cur() { return Math.round(track.scrollLeft / track.clientWidth); }
  function to(k) { k = (k + fotos.length) % fotos.length; track.scrollTo({ left: k * track.clientWidth, behavior: 'smooth' }); }
  track.addEventListener('scroll', function () {
    var k = cur(); count.textContent = (k + 1) + ' / ' + fotos.length;
    if (thumbs) Array.prototype.forEach.call(thumbs.children, function (b, i) { b.classList.toggle('on', i === k); });
  }, { passive: true });
  var prev = $('.g-prev'), next = $('.g-next');
  if (prev) { prev.addEventListener('click', function () { to(cur() - 1); }); next.addEventListener('click', function () { to(cur() + 1); }); }
  if (thumbs) Array.prototype.forEach.call(thumbs.children, function (b, i) { b.addEventListener('click', function () { to(i); }); });
  track.addEventListener('click', function (e) {
    var im = e.target.closest('img'); if (!im) return;
    var lb = document.createElement('div'); lb.className = 'lightbox';
    lb.innerHTML = '<img src="' + im.getAttribute('src') + '" alt=""><button aria-label="Cerrar">×</button>';
    lb.addEventListener('click', function () { lb.remove(); });
    document.body.appendChild(lb);
  });

  // Formulario
  var f = $('#infoForm');
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = false;
    [f.nombre, f.telefono].forEach(function (x) { var b = !x.value.trim() || (x === f.telefono && x.value.replace(/\D/g, '').length < 9); x.classList.toggle('err', b); if (b && !bad) { x.focus(); bad = true; } });
    if (bad) return;
    GS.addLead({ tipo: 'Información', nombre: f.nombre.value.trim(), telefono: f.telefono.value.trim(), detalle: p.ref.toUpperCase() + ' · ' + p.titulo });
    $('.ok', f).hidden = false;
  });
  [f.nombre, f.telefono].forEach(function (x) { x.addEventListener('input', function () { x.classList.remove('err'); }); });

  // Parecidos
  var sim = GS.all().filter(function (q) { return q.ref !== p.ref && q.op === p.op && q.estado === 'Disponible'; });
  sim.sort(function (a, b) { return (b.tipo === p.tipo) - (a.tipo === p.tipo) || Math.abs(a.precio - p.precio) - Math.abs(b.precio - p.precio); });
  if (sim.length) { $('#simGrid').innerHTML = sim.slice(0, 3).map(U.card).join(''); $('#similares').hidden = false; }
})();
