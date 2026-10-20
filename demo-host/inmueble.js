/* Hogar Inmobiliaria · ficha de inmueble (inmueble/?id=...) */
(function () {
  var H = window.HOGAR, UI = window.HogarUI, ART = window.HogarArt;

  function mapa(p) {
    // Esquema sin calles reales: solo marca la zona aproximada, como haría la ficha definitiva.
    return '<svg viewBox="0 0 600 300" role="img" aria-label="Ubicación aproximada en ' + UI.esc(p.zona) + '">' +
      '<rect width="600" height="300" fill="#EEE6D6"/>' +
      '<g fill="#E3D8C3"><rect x="30" y="30" width="120" height="80" rx="10"/><rect x="190" y="20" width="160" height="70" rx="10"/><rect x="400" y="40" width="160" height="90" rx="10"/>' +
      '<rect x="40" y="160" width="140" height="110" rx="10"/><rect x="420" y="180" width="150" height="90" rx="10"/></g>' +
      '<g stroke="#FFF" stroke-width="12" fill="none" stroke-linecap="round"><path d="M0 140 H600"/><path d="M300 0 V300"/><path d="M80 300 L520 0"/></g>' +
      '<circle cx="300" cy="140" r="90" fill="#D65A36" opacity=".14"/><circle cx="300" cy="140" r="90" fill="none" stroke="#D65A36" stroke-width="3" stroke-dasharray="8 8"/>' +
      '<rect x="190" y="230" width="220" height="50" rx="14" fill="#23304A"/>' +
      '<text x="300" y="262" text-anchor="middle" font-family="Work Sans, sans-serif" font-size="20" font-weight="600" fill="#FFF">' + UI.esc(p.zona) + '</text></svg>';
  }

  function cuota(precio) {
    var prestamo = precio * 0.8, i = 0.03 / 12, n = 360;
    return prestamo * i / (1 - Math.pow(1 + i, -n));
  }

  function render(p, all) {
    document.title = p.titulo + ' · ' + H.precio(p) + ' · Hogar Inmobiliaria';
    var vistas = ART.vistas(p);
    var nombres = ART.nombres;
    var waMsg = 'Hola, me interesa el inmueble ' + p.ref + ' (' + p.titulo + ', ' + H.precio(p) + '). ¿Me dais más información?';
    var estado = p.estado !== 'Disponible' ? '<span class="badge estado-' + p.estado.toLowerCase() + '">' + p.estado + '</span>' : '';
    var feats = H.extras.map(function (e) {
      var has = (p.extras || []).indexOf(e[0]) > -1;
      return '<li class="' + (has ? '' : 'no') + '">' + UI.icon(has ? 'checkc' : 'x') + e[1] + '</li>';
    }).join('');
    var rel = all.filter(function (o) { return o.id !== p.id && o.publicado !== false && (o.estado === 'Disponible' || o.estado === 'Reservado') && o.operacion === p.operacion; }).slice(0, 3);

    var html = '' +
      '<nav class="crumbs" aria-label="Migas"><a href="../">Inicio</a><span>›</span><a href="../#inmuebles">Inmuebles</a><span>›</span><span>' + UI.esc(p.zona) + '</span></nav>' +
      '<div class="gallery">' +
        '<div class="g-main"><div class="g-track" id="track">' +
          vistas.map(function (v) { return '<div class="g-slide">' + ART.svg(p, v) + '</div>'; }).join('') +
        '</div>' +
        '<div class="badges"><span class="badge ' + p.operacion.toLowerCase() + '">' + p.operacion + '</span>' + estado + '</div>' +
        '<button class="g-nav g-prev" type="button" aria-label="Foto anterior">' + UI.icon('left') + '</button>' +
        '<button class="g-nav g-next" type="button" aria-label="Foto siguiente">' + UI.icon('right') + '</button>' +
        '<span class="g-count" id="gcount">1 / ' + vistas.length + '</span></div>' +
        '<div class="g-thumbs" id="thumbs">' + vistas.map(function (v, i) {
          return '<button type="button" aria-label="' + nombres[v] + '" aria-current="' + (i === 0) + '">' + ART.svg(p, v) + '</button>';
        }).join('') + '</div>' +
      '</div>' +
      '<div class="detail-grid">' +
        '<div style="display:grid;gap:18px">' +
          '<div class="d-head"><span class="eyebrow">' + UI.esc(p.tipo) + ' en ' + p.operacion.toLowerCase() + '</span>' +
            '<h1>' + UI.esc(p.titulo) + '</h1>' +
            '<span class="card-meta">' + UI.icon('pin').replace('<svg', '<svg style="width:18px;height:18px;display:inline;vertical-align:-3px;color:#D65A36"') + ' ' + UI.esc(p.zona) + ', ' + UI.esc(p.localidad) + '</span>' +
            '<span class="d-price">' + H.precio(p) + '</span>' +
            (p.operacion === 'Venta' ? '<span class="ref">Cuota orientativa desde ' + H.euros(cuota(p.precio)) + ' €/mes (80 % financiado, 30 años, 3 %)</span>' : '') +
          '</div>' +
          '<div class="d-facts">' +
            (p.hab ? '<div><small>Dormitorios</small><b>' + p.hab + '</b></div>' : '') +
            '<div><small>Baños</small><b>' + p.banos + '</b></div>' +
            '<div><small>Superficie</small><b>' + p.m2 + ' m²</b></div>' +
            '<div><small>Tipo</small><b>' + UI.esc(p.tipo) + '</b></div>' +
          '</div>' +
          '<section class="d-block"><h2>Descripción</h2>' + (p.descripcion || []).map(function (t) { return '<p>' + UI.esc(t) + '</p>'; }).join('') + '<span class="ref">Referencia ' + UI.esc(p.ref) + '</span></section>' +
          '<section class="d-block"><h2>Características</h2><ul class="feat-list">' + feats + '</ul></section>' +
          '<section class="d-block"><h2>Ubicación aproximada</h2><div class="loc-map">' + mapa(p) + '</div><p style="font-size:14px">Por privacidad del propietario mostramos solo la zona. Te damos la dirección exacta al concertar la visita.</p></section>' +
        '</div>' +
        '<aside class="detail-side">' +
          '<section class="cta-box" id="info"><h2>¿Te gusta esta casa?</h2><p>Déjanos tu teléfono y te llamamos para resolver dudas o organizar una visita.</p>' +
            '<form id="form-info" novalidate><div class="form-grid">' +
              '<label class="field"><span style="color:#D7DCE6">Nombre</span><input class="input" name="nombre" autocomplete="name" required></label>' +
              '<label class="field"><span style="color:#D7DCE6">Teléfono</span><input class="input" name="tel" type="tel" inputmode="tel" autocomplete="tel" required></label>' +
              '<label class="field"><span style="color:#D7DCE6">Mensaje</span><textarea class="input" name="msg" rows="3">Me interesa el inmueble ' + UI.esc(p.ref) + '. ¿Podemos verlo?</textarea></label>' +
              '<button class="btn btn-teja btn-block" type="submit">' + UI.icon('mail') + 'Quiero información</button>' +
              '<a class="btn btn-wa btn-block" target="_blank" rel="noopener" href="' + H.wa(waMsg) + '">' + UI.icon('wa') + 'Preguntar por WhatsApp</a>' +
              '<a class="btn btn-block" style="background:rgba(255,255,255,.08);color:#fff" data-tel>' + UI.icon('phone') + 'Llamar ' + H.config.telefono + '</a>' +
            '</div></form>' +
            '<div class="form-ok" id="info-ok"><div class="ok-ic">' + UI.icon('check') + '</div><h3>¡Recibido!</h3><p>En la web real esta petición llegaría a la oficina. Si quieres, envíala ya por WhatsApp:</p>' +
              '<a class="btn btn-wa btn-block" id="info-wa" target="_blank" rel="noopener">' + UI.icon('wa') + 'Enviar por WhatsApp</a></div>' +
          '</section>' +
          '<div class="d-block" style="gap:6px"><b>¿Tienes una casa parecida?</b><p style="font-size:15px">Si vives en ' + UI.esc(p.zona) + ' y piensas vender, te decimos cuánto vale sin compromiso.</p><a class="linkbtn" style="justify-self:start" href="../#vender">Solicitar valoración →</a></div>' +
        '</aside>' +
      '</div>' +
      (rel.length ? '<section class="sec" style="padding-bottom:0"><div class="sec-head"><h2 style="font-size:30px">También te puede <em>interesar</em></h2></div><div class="grid">' +
        rel.map(function (o) {
          return '<a class="card" href="?id=' + encodeURIComponent(o.id) + '"><div class="card-img">' + ART.svg(o, 'fachada') +
            '<div class="badges"><span class="badge ' + o.operacion.toLowerCase() + '">' + o.operacion + '</span></div></div>' +
            '<div class="card-body"><span class="card-price">' + H.precio(o) + '</span><span class="card-title">' + UI.esc(o.titulo) + '</span>' +
            '<span class="card-meta">' + UI.esc(o.tipo) + ' · ' + UI.esc(o.zona) + '</span><div class="specs">' + UI.specs(o) + '</div></div></a>';
        }).join('') + '</div></section>' : '');

    var root = document.getElementById('detail');
    root.innerHTML = html;
    UI.wireContact(root);
    document.getElementById('sticky-wa').href = H.wa(waMsg);
    document.getElementById('fab').href = H.wa(waMsg);
    document.getElementById('fab').target = '_blank';

    // Galería deslizable
    var track = document.getElementById('track');
    var thumbs = document.querySelectorAll('#thumbs button');
    var count = document.getElementById('gcount');
    var idx = 0;
    var go = function (i) {
      idx = (i + vistas.length) % vistas.length;
      track.scrollTo({ left: idx * track.clientWidth, behavior: 'smooth' });
    };
    track.addEventListener('scroll', function () {
      var i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      if (i !== idx) idx = i;
      count.textContent = (i + 1) + ' / ' + vistas.length;
      thumbs.forEach(function (t, k) { t.setAttribute('aria-current', String(k === i)); });
    }, { passive: true });
    thumbs.forEach(function (t, k) { t.addEventListener('click', function () { go(k); }); });
    root.querySelector('.g-prev').addEventListener('click', function () { go(idx - 1); });
    root.querySelector('.g-next').addEventListener('click', function () { go(idx + 1); });

    var form = document.getElementById('form-info');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      form.querySelectorAll('[required]').forEach(function (inp) {
        var empty = !inp.value.trim();
        inp.style.borderColor = empty ? '#D65A36' : '';
        if (empty && !bad) bad = inp;
      });
      if (bad) { bad.focus(); UI.toast('Falta tu nombre o tu teléfono'); return; }
      document.getElementById('info-wa').href = H.wa('Hola, soy ' + form.nombre.value + ' (' + form.tel.value + '). ' + form.msg.value + ' (' + p.titulo + ', ' + H.precio(p) + ')');
      form.style.display = 'none';
      document.getElementById('info-ok').classList.add('show');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var all = H.load();
    var id = new URLSearchParams(location.search).get('id');
    var p = all.filter(function (x) { return x.id === id; })[0];
    if (!p) {
      document.body.classList.remove('has-sticky');
      document.getElementById('sticky').remove();
      document.getElementById('fab').href = H.wa('Hola, os escribo desde vuestra web.');
      document.getElementById('detail').innerHTML = '<div class="notfound"><h1 style="font-size:34px">Este inmueble ya no está publicado</h1>' +
        '<p class="lead">Puede que se haya vendido o alquilado. Echa un vistazo a lo que tenemos ahora.</p><a class="btn btn-teja" href="../#inmuebles">Ver inmuebles</a></div>';
      return;
    }
    render(p, all);
  });
})();
