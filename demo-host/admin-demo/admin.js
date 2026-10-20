/* Maqueta del panel: no hay servidor. Los cambios se guardan con JP_STORE
   (localStorage de este navegador) para que la web pública los muestre. */
(function () {
  'use strict';
  var CFG = window.JP_CONFIG, FMT = window.JP_FMT, STORE = window.JP_STORE;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var icon = function (n) { return '<svg aria-hidden="true"><use href="../assets/icons.svg#' + n + '"/></svg>'; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var img = function (f) { return '../assets/img/' + f; };
  var FEATS = ['Garaje', 'Terraza', 'Ascensor', 'Piscina', 'Piscina comunitaria', 'Jardín', 'Patio', 'Trastero', 'Aire acondicionado', 'Amueblado', 'Balcón', 'Placas solares'];
  var STOCK = ['salon-a.svg', 'salon-b.svg', 'salon-c.svg', 'cocina-a.svg', 'cocina-b.svg', 'cocina-c.svg', 'dormitorio-a.svg', 'dormitorio-b.svg', 'bano-a.svg', 'bano-b.svg', 'patio-a.svg', 'piscina-a.svg', 'terraza-a.svg'];

  /* acceso simulado */
  var signed = false;
  try { signed = sessionStorage.getItem('jp-demo-login') === '1'; } catch (e) {}
  function enter() { $('#login').hidden = true; $('#app').hidden = false; try { sessionStorage.setItem('jp-demo-login', '1'); } catch (e) {} }
  $('#loginForm').addEventListener('submit', function (e) { e.preventDefault(); enter(); });
  if (signed) enter();

  /* pestañas */
  $$('#tabs button').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('#tabs button').forEach(function (x) { x.classList.toggle('is-on', x === b); });
      $$('[data-view]').forEach(function (v) { v.hidden = v.dataset.view !== b.dataset.tab; });
      window.scrollTo(0, 0);
    });
  });

  var toastEl = $('#toast');
  function toast(html) { toastEl.innerHTML = html; toastEl.classList.add('is-on'); clearTimeout(toast.t); toast.t = setTimeout(function () { toastEl.classList.remove('is-on'); }, 4200); }

  var filter = { st: '', q: '' }, flashRef = null;

  function render() {
    var all = STORE.all();
    var c = { disponible: 0, reservado: 0, vendido: 0, alquilado: 0 };
    all.forEach(function (p) { c[p.status]++; });
    $('#stats').innerHTML =
      '<button class="stat stat--total" data-st=""><div><b>' + all.length + '</b><span>inmuebles publicados</span></div><span class="stat__go">Ver todos</span></button>' +
      [['disponible', 'Disponibles', 'var(--ok)'], ['reservado', 'Reservados', 'var(--res)'], ['vendido', 'Vendidos', 'var(--sold)'], ['alquilado', 'Alquilados', 'var(--rent)']].map(function (s) {
        return '<button class="stat" data-st="' + s[0] + '" style="--c:' + s[2] + '"><b>' + c[s[0]] + '</b><span>' + s[1] + '</span></button>';
      }).join('');
    $$('#stats .stat').forEach(function (b) { b.addEventListener('click', function () { setSt(b.dataset.st); }); });

    var q = filter.q.trim().toLowerCase();
    var list = all.filter(function (p) {
      return (!filter.st || p.status === filter.st) && (!q || (p.title + ' ' + p.town + ' ' + p.ref + ' ' + p.type).toLowerCase().indexOf(q) > -1);
    });
    $('#list').innerHTML = '<div class="list__head" role="row"><span></span><span>Inmueble</span><span>Precio</span><span>Operación</span><span>Estado</span><span></span></div>' +
      (list.length ? list.map(row).join('') : '<p class="empty">No hay inmuebles con este filtro.</p>');
    $$('#list .st').forEach(function (s) {
      s.addEventListener('change', function () {
        var ref = s.dataset.ref;
        STORE.save(ref, { status: s.value });
        flashRef = ref; render();
        toast('Estado cambiado a <b>' + FMT.status[s.value] + '</b>. <a href="../inmueble/?ref=' + encodeURIComponent(ref) + '" target="_blank" rel="noopener">Ver en la web</a>');
      });
    });
    $$('#list [data-edit]').forEach(function (b) { b.addEventListener('click', function () { openEditor(b.dataset.edit); }); });
    flashRef = null;
  }

  function row(p) {
    return '<div class="item' + (p.ref === flashRef ? ' is-flash' : '') + '" role="row">' +
      '<div class="item__img"><img src="' + img(p.cover) + '" alt="">' + (p.featured ? '<span class="item__star" title="Destacado">' + icon('star') + '</span>' : '') + '</div>' +
      '<div class="item__main"><p class="item__t">' + esc(p.title) + '</p><p class="item__m">' + esc(p.ref) + ' · ' + esc(p.town) + '</p></div>' +
      '<div class="item__row"><span class="item__p">' + FMT.price(p) + '</span><span><span class="op">' + (p.op === 'venta' ? 'Venta' : 'Alquiler') + '</span></span>' +
      '<span><select class="st st--' + p.status + '" data-ref="' + esc(p.ref) + '" aria-label="Estado de ' + esc(p.title) + '">' +
      Object.keys(FMT.status).map(function (k) { return '<option value="' + k + '"' + (k === p.status ? ' selected' : '') + '>' + FMT.status[k] + '</option>'; }).join('') +
      '</select></span></div>' +
      '<div class="item__acts"><a class="b b--line" href="../inmueble/?ref=' + encodeURIComponent(p.ref) + '" target="_blank" rel="noopener" aria-label="Ver en la web">' + icon('eye') + '</a><button class="b b--line" data-edit="' + esc(p.ref) + '">' + icon('edit') + 'Editar</button></div>' +
      '</div>';
  }

  function setSt(st) {
    filter.st = st;
    $$('#stChips button').forEach(function (b) { b.classList.toggle('is-on', b.dataset.st === st); });
    render();
  }
  $$('#stChips button').forEach(function (b) { b.addEventListener('click', function () { setSt(b.dataset.st); }); });
  $('#q').addEventListener('input', function (e) { filter.q = e.target.value; render(); });
  $('#resetBtn').addEventListener('click', function () { STORE.reset(); render(); toast('Demo restablecida con los inmuebles de ejemplo.'); });

  /* ---------- editor ---------- */
  var sheet = $('#sheet'), form = $('#editor'), editing = null, photos = [];
  var edTown = $('#edTown');
  CFG.zone.forEach(function (t) { edTown.insertAdjacentHTML('beforeend', '<option>' + esc(t) + '</option>'); });
  $('#feats').innerHTML = FEATS.map(function (f) { return '<label><input type="checkbox" name="feat" value="' + f + '"><span>' + f + '</span></label>'; }).join('');

  function renderPhotos() {
    $('#photos').innerHTML = photos.map(function (f, i) {
      return '<div class="ph" draggable="true" data-i="' + i + '"><img src="' + img(f) + '" alt="Foto ' + (i + 1) + '">' + (i === 0 ? '<span class="ph__cover">Portada</span>' : '') +
        '<button type="button" class="ph__x" data-x="' + i + '" aria-label="Quitar foto ' + (i + 1) + '">' + icon('close') + '</button></div>';
    }).join('') + '<button type="button" class="ph ph--add" id="addPh">' + icon('upload') + 'Subir fotos</button>';
    $$('#photos [data-x]').forEach(function (b) { b.addEventListener('click', function () { photos.splice(+b.dataset.x, 1); renderPhotos(); }); });
    $('#addPh').addEventListener('click', function () {
      var next = STOCK.filter(function (s) { return photos.indexOf(s) < 0; })[0] || STOCK[0];
      photos.push(next); renderPhotos();
      toast('En el panel real aquí eliges las fotos de tu móvil u ordenador.');
    });
    var from = null;
    $$('#photos .ph[draggable]').forEach(function (el) {
      el.addEventListener('dragstart', function () { from = +el.dataset.i; el.classList.add('is-drag'); });
      el.addEventListener('dragend', function () { el.classList.remove('is-drag'); });
      el.addEventListener('dragover', function (e) { e.preventDefault(); });
      el.addEventListener('drop', function (e) { e.preventDefault(); var to = +el.dataset.i; if (from === null || from === to) return; var m = photos.splice(from, 1)[0]; photos.splice(to, 0, m); from = null; renderPhotos(); });
    });
  }

  function setPriceUnit() { $('#priceUnit').textContent = form.op.value === 'alquiler' ? '(€/mes)' : '(€)'; }
  $$('input[name="op"]', form).forEach(function (r) { r.addEventListener('change', setPriceUnit); });

  function openEditor(ref) {
    var p = ref ? STORE.get(ref) : {
      ref: null, title: '', op: 'venta', price: '', status: 'disponible', featured: false, description: '',
      type: 'Piso', town: CFG.zone[0], beds: '', baths: '', m2: '', features: [], cover: 'f-piso-coria.svg', gallery: ['salon-a.svg', 'cocina-a.svg']
    };
    editing = p;
    $('#edKicker').textContent = ref ? 'Editar inmueble · ' + p.ref : 'Nuevo inmueble';
    $('#edTitle').textContent = ref ? p.title : 'Añadir inmueble';
    $('#delBtn').hidden = !ref;
    form.title.value = p.title; form.price.value = p.price ? new Intl.NumberFormat('es-ES').format(p.price) : '';
    form.description.value = p.description || ''; form.type.value = p.type; form.town.value = p.town;
    form.beds.value = p.beds; form.baths.value = p.baths; form.m2.value = p.m2; form.featured.checked = !!p.featured;
    $$('input[name="op"]', form).forEach(function (r) { r.checked = r.value === p.op; });
    $$('input[name="status"]', form).forEach(function (r) { r.checked = r.value === p.status; });
    $$('input[name="feat"]', form).forEach(function (c) { c.checked = (p.features || []).indexOf(c.value) > -1; });
    photos = [p.cover].concat(p.gallery || []);
    renderPhotos(); setPriceUnit();
    $$('.f', form).forEach(function (f) { f.classList.remove('is-bad'); });
    sheet.hidden = false; document.body.style.overflow = 'hidden';
    $('.sheet__body').scrollTop = 0;
    setTimeout(function () { (ref ? form.price : form.title).focus({ preventScroll: true }); }, 50);
  }
  function close() { sheet.hidden = true; document.body.style.overflow = ''; editing = null; }
  $$('[data-close]', sheet).forEach(function (b) { b.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) close(); });
  $('#addBtn').addEventListener('click', function () { openEditor(null); });

  var num = function (v) { return parseInt(String(v).replace(/\D/g, ''), 10) || 0; };
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = false;
    [form.title, form.price].forEach(function (el) { var b = !String(el.value).trim() || (el === form.price && !num(el.value)); el.closest('.f').classList.toggle('is-bad', b); if (b) bad = true; });
    if (bad) { toast('Completa el título y el precio.'); return; }
    var patch = {
      title: form.title.value.trim(), op: form.op.value, price: num(form.price.value), status: form.status.value,
      featured: form.featured.checked, description: form.description.value.trim(), type: form.type.value, town: form.town.value,
      beds: num(form.beds.value), baths: num(form.baths.value), m2: num(form.m2.value),
      features: $$('input[name="feat"]:checked', form).map(function (c) { return c.value; }),
      cover: photos[0] || 'f-piso-coria.svg', gallery: photos.slice(1)
    };
    var ref = editing.ref;
    if (ref) STORE.save(ref, patch);
    else {
      var used = STORE.all().map(function (p) { return +String(p.ref).replace(/\D/g, ''); });
      ref = 'JP-' + (Math.max.apply(null, used.concat([112])) + 1);
      STORE.add(Object.assign({ ref: ref, demo: true, area: '', plot: null, summary: patch.title, map: null }, patch));
    }
    close(); flashRef = ref; setSt('');
    toast('Guardado. Ya aparece así en tu web. <a href="../inmueble/?ref=' + encodeURIComponent(ref) + '" target="_blank" rel="noopener">Ver en la web</a>');
  });
  $('#delBtn').addEventListener('click', function () {
    if (!editing || !editing.ref) return;
    if (!window.confirm('¿Eliminar "' + editing.title + '"? Dejará de verse en tu web.')) return;
    var t = editing.title; STORE.remove(editing.ref); close(); render();
    toast('"' + esc(t) + '" eliminado de tu web.');
  });

  render();
})();
