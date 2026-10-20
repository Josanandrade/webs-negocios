/* Hogar Inmobiliaria · portada */
(function () {
  var H = window.HOGAR, UI = window.HogarUI, ART = window.HogarArt;
  var all = H.load();
  // En la web pública solo se listan los inmuebles disponibles o reservados.
  var publicos = all.filter(function (p) { return p.publicado !== false && (p.estado === 'Disponible' || p.estado === 'Reservado'); });
  publicos.sort(function (a, b) { return (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0); });

  var PRECIOS = {
    Venta: [[0, 'Sin límite'], [150000, 'Hasta 150.000 €'], [200000, 'Hasta 200.000 €'], [250000, 'Hasta 250.000 €'], [300000, 'Hasta 300.000 €'], [400000, 'Hasta 400.000 €']],
    Alquiler: [[0, 'Sin límite'], [700, 'Hasta 700 €/mes'], [900, 'Hasta 900 €/mes'], [1100, 'Hasta 1.100 €/mes'], [1500, 'Hasta 1.500 €/mes']]
  };
  var state = { op: null, tipo: '', zona: '', precio: 0, chips: [] };
  var PAGE = 7, shown = PAGE;

  var $ = function (s) { return document.querySelector(s); };
  var grid = $('#grid');

  function fillSelect(sel, items, first) {
    sel.innerHTML = (first ? '<option value="">' + first + '</option>' : '') +
      items.map(function (i) { return Array.isArray(i) ? '<option value="' + i[0] + '">' + i[1] + '</option>' : '<option>' + i + '</option>'; }).join('');
  }

  function zonasUsadas() {
    var z = [];
    H.zonas.forEach(function (n) { if (publicos.some(function (p) { return p.zona === n; })) z.push(n); });
    return z;
  }

  function opActual() { return document.querySelector('input[name=op]:checked').value; }

  function setupSearch() {
    fillSelect($('#f-tipo'), H.tipos.filter(function (t) { return publicos.some(function (p) { return p.tipo === t; }); }), 'Todos');
    fillSelect($('#f-zona'), zonasUsadas(), 'Todas');
    var refreshPrecios = function () { fillSelect($('#f-precio'), PRECIOS[opActual()]); };
    refreshPrecios();
    document.querySelectorAll('input[name=op]').forEach(function (r) { r.addEventListener('change', refreshPrecios); });
    $('#search').addEventListener('submit', function (e) {
      e.preventDefault();
      state.op = opActual();
      state.tipo = $('#f-tipo').value;
      state.zona = $('#f-zona').value;
      state.precio = +$('#f-precio').value || 0;
      shown = PAGE;
      render();
      document.getElementById('inmuebles').scrollIntoView({ behavior: 'smooth' });
    });
  }

  function matches(p) {
    if (state.op && p.operacion !== state.op) return false;
    if (state.tipo && p.tipo !== state.tipo) return false;
    if (state.zona && p.zona !== state.zona) return false;
    if (state.precio && p.precio > state.precio) return false;
    for (var i = 0; i < state.chips.length; i++) {
      var c = state.chips[i];
      if (c === 'hab3' ? p.hab < 3 : (p.extras || []).indexOf(c) === -1) return false;
    }
    return true;
  }

  function card(p, i) {
    var est = p.estado !== 'Disponible' ? '<span class="badge estado-' + p.estado.toLowerCase() + '">' + p.estado + '</span>' : '';
    var dest = p.destacado ? '<span class="badge dest">Destacado</span>' : '';
    return '<a class="card' + (i === 0 && p.destacado ? ' feature' : '') + '" href="inmueble/?id=' + encodeURIComponent(p.id) + '">' +
      '<div class="card-img">' + ART.svg(p, 'fachada') +
      '<div class="badges"><span class="badge ' + p.operacion.toLowerCase() + '">' + p.operacion + '</span>' + est + dest + '</div>' +
      '<span class="card-fav" aria-hidden="true">' + UI.icon('heart') + '</span></div>' +
      '<div class="card-body"><span class="card-price">' + H.precio(p) + '</span>' +
      '<span class="card-title">' + UI.esc(p.titulo) + '</span>' +
      '<span class="card-meta">' + UI.esc(p.tipo) + ' · ' + UI.esc(p.zona) + (p.zona !== p.localidad ? ', ' + UI.esc(p.localidad) : '') + '</span>' +
      '<div class="specs">' + UI.specs(p) + '</div></div></a>';
  }

  function render() {
    var list = publicos.filter(matches);
    var filtering = state.op || state.tipo || state.zona || state.precio || state.chips.length;
    grid.innerHTML = list.slice(0, shown).map(card).join('');
    $('#empty').classList.toggle('show', list.length === 0);
    $('#more').hidden = list.length <= shown;
    $('#clear').hidden = !filtering;
    $('#results-count').innerHTML = list.length
      ? '<b>' + list.length + '</b> ' + (list.length === 1 ? 'inmueble' : 'inmuebles') + (filtering ? ' con tus filtros' : ' publicados')
      : 'Sin resultados';
    var tags = [];
    if (state.op) tags.push(state.op === 'Venta' ? 'Comprar' : 'Alquilar');
    if (state.tipo) tags.push(state.tipo);
    if (state.zona) tags.push(state.zona);
    if (state.precio) tags.push('Hasta ' + H.euros(state.precio) + (state.op === 'Alquiler' ? ' €/mes' : ' €'));
    $('#active-filters').innerHTML = tags.map(function (t) { return '<span>' + UI.esc(t) + '</span>'; }).join('');
  }

  function setupChips() {
    document.querySelectorAll('[data-chip]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-chip');
        var on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', String(on));
        state.chips = on ? state.chips.concat(k) : state.chips.filter(function (c) { return c !== k; });
        shown = PAGE; render();
      });
    });
    $('#clear').addEventListener('click', function () {
      state = { op: null, tipo: '', zona: '', precio: 0, chips: [] };
      document.querySelectorAll('[data-chip]').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      $('#search').reset(); $('#f-precio').innerHTML = ''; fillSelect($('#f-precio'), PRECIOS.Venta);
      shown = PAGE; render();
    });
    $('#more').addEventListener('click', function () { shown += PAGE; render(); });
  }

  // Mini panel del móvil: refleja los mismos datos que el panel demo.
  function phonePreview() {
    var count = function (e) { return all.filter(function (p) { return p.estado === e; }).length; };
    $('#ph-pub').textContent = all.length;
    $('#ph-disp').textContent = count('Disponible');
    $('#ph-res').textContent = count('Reservado');
    $('#ph-rows').innerHTML = all.slice(0, 3).map(function (p) {
      return '<div class="ph-row"><span class="th">' + ART.svg(p, 'fachada') + '</span><span><b>' + UI.esc(p.titulo) + '</b>' + H.precio(p) + '</span>' +
        '<span class="pill ' + p.estado.toLowerCase() + '">' + p.estado + '</span></div>';
    }).join('');
  }

  function formToWa(form, okBox, waBtn, build) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      form.querySelectorAll('[required]').forEach(function (inp) {
        var empty = !inp.value.trim();
        inp.style.borderColor = empty ? '#D65A36' : '';
        if (empty && !bad) bad = inp;
      });
      if (bad) { bad.focus(); UI.toast('Falta rellenar algún dato'); return; }
      var d = {}; new FormData(form).forEach(function (v, k) { d[k] = v; });
      waBtn.href = H.wa(build(d));
      form.style.display = 'none';
      okBox.classList.add('show');
    });
  }

  function setupOwner() {
    fillSelect($('#val-loc'), ['Dos Hermanas', 'Montequinto', 'Sevilla', 'Alcalá de Guadaíra', 'Coria del Río', 'Utrera', 'Los Palacios y Villafranca', 'Otra localidad']);
    fillSelect($('#val-tipo'), ['Piso', 'Casa', 'Adosado', 'Chalet', 'Ático o dúplex', 'Local', 'Terreno']);
    var mode = 'vender';
    var apply = function () {
      mode = document.querySelector('input[name=owner]:checked').value;
      var v = mode === 'vender';
      $('#sell-title').innerHTML = v ? '¿Quieres <em>vender</em> tu vivienda?' : '¿Quieres <em>alquilar</em> tu propiedad?';
      $('#sell-lead').textContent = v
        ? 'Te decimos cuánto vale de verdad tu casa en tu zona y cómo venderla sin perder meses. Nos encargamos de las fotos, el anuncio, las visitas y la documentación.'
        : 'Buscamos inquilinos con garantías, fijamos contigo una renta realista y preparamos el contrato. Tú solo decides a quién se la alquilas.';
      $('#val-h').textContent = v ? 'Solicitar valoración' : 'Valorar el alquiler';
      $('#val-hint').textContent = v ? 'Te llamamos para conocer la casa y darte un precio razonado.' : 'Te decimos qué renta puedes pedir y cómo encontrar buen inquilino.';
      $('#val-btn').lastChild.textContent = v ? 'Quiero valorar mi vivienda' : 'Quiero alquilar mi vivienda';
    };
    document.querySelectorAll('input[name=owner]').forEach(function (r) { r.addEventListener('change', apply); });
    formToWa($('#form-val'), $('#val-ok'), $('#val-wa'), function (d) {
      return 'Hola, soy ' + d.nombre + '. Quiero ' + (mode === 'vender' ? 'valorar mi vivienda para venderla' : 'alquilar mi vivienda') +
        ': ' + d.tipo.toLowerCase() + ' en ' + d.localidad + '. Mi teléfono es ' + d.tel + (d.email ? ' y mi email ' + d.email : '') + '.';
    });
    formToWa($('#form-contact'), $('#contact-ok'), $('#contact-wa'), function (d) {
      return 'Hola, soy ' + d.nombre + ' (' + d.tel + '). Me interesa: ' + d.interes.toLowerCase() + '.' + (d.msg ? ' ' + d.msg : '');
    });
  }

  function setupCalc() {
    var rp = $('#r-precio'), ra = $('#r-ahorro'), ry = $('#r-anos');
    var calc = function () {
      var precio = +rp.value, ahorro = Math.min(+ra.value, precio), anos = +ry.value;
      var prestamo = Math.max(0, precio - ahorro), i = 0.03 / 12, n = anos * 12;
      var cuota = prestamo ? prestamo * i / (1 - Math.pow(1 + i, -n)) : 0;
      $('#o-precio').textContent = H.euros(precio) + ' €';
      $('#o-ahorro').textContent = H.euros(+ra.value) + ' €';
      $('#o-anos').textContent = anos + ' años';
      $('#cuota').textContent = H.euros(cuota) + ' €/mes';
      $('#cuota-det').textContent = 'Préstamo de ' + H.euros(prestamo) + ' € a ' + anos + ' años. Ten en cuenta además los gastos de compra (impuestos, notaría y registro).';
      $('#cuota-wa').href = H.wa('Hola, estoy mirando una vivienda de unos ' + H.euros(precio) + ' € y tengo ahorrados ' + H.euros(+ra.value) + ' €. ¿Me ayudáis a estudiar la hipoteca?');
      $('#cuota-wa').target = '_blank';
    };
    [rp, ra, ry].forEach(function (r) { r.addEventListener('input', calc); });
    calc();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupSearch(); setupChips(); render(); phonePreview(); setupOwner(); setupCalc();
  });
})();
