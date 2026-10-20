/* Panel de gestión · VISTA DEMO
 * No hay backend ni usuarios reales: todo se guarda en localStorage de este
 * navegador (ver data.js) para que la web pública refleje los cambios. */
(function () {
  var GS = window.GS;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function src(f) { return /^(data:|https?:|blob:)/.test(f) ? f : '../' + f; }
  function thumb(p) { return src((p.fotos && p.fotos[0]) || 'assets/inmuebles/placeholder.svg'); }

  var list = GS.all();
  var view = 'panel', filter = '', query = '';

  /* ---------- Acceso ---------- */
  var SKEY = 'gs-demo-login';
  function logged() { try { return sessionStorage.getItem(SKEY) === '1'; } catch (e) { return false; } }
  function enter() { $('#login').hidden = true; $('#app').hidden = false; render(); }
  $('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    try { sessionStorage.setItem(SKEY, '1'); } catch (er) {}
    enter();
  });

  $('#resetDemo').addEventListener('click', function () {
    if (!confirm('¿Restablecer la demo? Se borran los cambios hechos en este navegador.')) return;
    GS.reset(); list = GS.all(); render(); toast('Demo restablecida con los inmuebles de ejemplo.');
  });

  /* ---------- Navegación ---------- */
  var TITLES = { panel: ['Panel de control', saludo()], inmuebles: ['Cartera', 'Inmuebles'], solicitudes: ['Bandeja de entrada', 'Solicitudes'] };
  function saludo() { var h = new Date().getHours(); return h < 14 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches'; }
  function go(v) {
    view = v;
    $$('[data-pane]').forEach(function (s) { s.hidden = s.getAttribute('data-pane') !== v; });
    $$('[data-view]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-view') === v && !b.classList.contains('lnk')); });
    $('#viewKicker').textContent = TITLES[v][0]; $('#viewTitle').textContent = TITLES[v][1];
    window.scrollTo(0, 0);
  }
  $$('[data-view]').forEach(function (b) { b.addEventListener('click', function () { go(b.getAttribute('data-view')); }); });

  /* ---------- Render ---------- */
  function count(st) { return list.filter(function (p) { return p.estado === st; }).length; }
  function statusSelect(p) {
    return '<select class="st-sel st-' + esc(p.estado) + '" data-st="' + esc(p.ref) + '" aria-label="Estado de ' + esc(p.titulo) + '">' +
      GS.estados.map(function (s) { return '<option' + (s === p.estado ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>';
  }
  function row(p) {
    return '<div class="row-p"><span class="row-th" style="background-image:url(\'' + esc(thumb(p)) + '\')"></span>' +
      '<div class="row-main"><b>' + esc(p.titulo) + (p.nuevo ? '<span class="new-flag">NUEVO</span>' : '') + '</b>' +
      '<div class="row-meta"><span class="pr">' + GS.price(p) + '</span><span>' + esc(p.op) + '</span><span>' + esc(p.zona) + '</span><span class="ref">' + esc(p.ref.toUpperCase()) + '</span></div></div>' +
      '<div class="row-side">' + statusSelect(p) + '<div class="row-actions">' +
        '<button type="button" class="icon-btn star' + (p.destacado ? ' on' : '') + '" data-star="' + esc(p.ref) + '" aria-pressed="' + !!p.destacado + '" title="Destacar en portada" aria-label="Destacar en portada"><svg><use href="#i-star"/></svg></button>' +
        '<button type="button" class="edit-btn" data-edit="' + esc(p.ref) + '"><svg><use href="#i-edit"/></svg><span>Editar</span></button>' +
      '</div></div></div>';
  }
  var DEMO_LEADS = [
    { tipo: 'Valoración', nombre: 'Propietaria de un adosado', telefono: '6·· ·· ·· ··', detalle: 'Adosado o pareado en Espartinas', ejemplo: true, hace: 'Hace 2 h' },
    { tipo: 'Información', nombre: 'Interesado en el chalet', telefono: '6·· ·· ·· ··', detalle: 'GS101 · Chalet independiente con piscina', ejemplo: true, hace: 'Ayer' },
    { tipo: 'Contacto', nombre: 'Familia que busca alquiler', telefono: '6·· ·· ·· ··', detalle: 'Quiero alquilar: casa con patio en Umbrete', ejemplo: true, hace: 'Hace 3 días' }
  ];
  function leadsAll() { return GS.leads().concat(DEMO_LEADS); }
  function lead(l) {
    var when = l.hace || (l.fecha ? new Date(l.fecha).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');
    return '<div class="lead"><span class="lead-ic ' + esc(l.tipo) + '">' + esc(l.tipo.slice(0, 2).toUpperCase()) + '</span><div><b>' + esc(l.tipo) + ' · ' + esc(l.nombre) + (l.ejemplo ? '<span class="chipx">EJEMPLO</span>' : '<span class="chipx" style="background:var(--jade-l);color:var(--jade-d)">DESDE TU WEB</span>') + '</b>' +
      '<small>' + esc(l.detalle || '') + '</small><br><small>' + esc(l.telefono || '') + ' · ' + esc(when) + '</small></div></div>';
  }
  function render() {
    var stats = [['Inmuebles publicados', list.length, ''], ['Disponibles', count('Disponible'), 'var(--st-dis)'], ['Reservados', count('Reservado'), 'var(--st-res)'], ['Vendidos', count('Vendido'), 'var(--st-ven)'], ['Alquilados', count('Alquilado'), 'var(--st-alq)']];
    $('#stats').innerHTML = stats.map(function (s) { return '<div class="stat">' + (s[2] ? '<i style="background:' + s[2] + '"></i>' : '') + '<small>' + s[0] + '</small><b>' + s[1] + '</b></div>'; }).join('');
    $('#recent').innerHTML = list.slice(0, 5).map(row).join('');
    var L = leadsAll();
    $('#recentLeads').innerHTML = L.slice(0, 4).map(lead).join('');
    $('#allLeads').innerHTML = L.map(lead).join('');
    var own = GS.leads().length; $('#leadBadge').textContent = own ? own : '';

    var pills = [['', 'Todos', list.length]].concat(GS.estados.map(function (s) { return [s, s + 's', count(s)]; }));
    $('#statusPills').innerHTML = pills.map(function (p) { return '<button type="button" class="pill' + (filter === p[0] ? ' on' : '') + '" data-f="' + p[0] + '">' + p[1] + '<b>' + p[2] + '</b></button>'; }).join('');
    var q = query.toLowerCase();
    var shown = list.filter(function (p) {
      return (!filter || p.estado === filter) && (!q || (p.titulo + ' ' + p.zona + ' ' + p.ref + ' ' + p.tipo).toLowerCase().indexOf(q) > -1);
    });
    $('#list').innerHTML = shown.length ? shown.map(row).join('') : '<p class="empty-row">No hay inmuebles con ese filtro.</p>';
  }
  $('#statusPills').addEventListener('click', function (e) { var b = e.target.closest('[data-f]'); if (b) { filter = b.getAttribute('data-f'); render(); } });
  $('#q').addEventListener('input', function (e) { query = e.target.value; render(); });

  function persist(msg, ref) {
    var ok = GS.save(list);
    toast(ok ? msg : 'Este navegador no permite guardar la demo, pero así funcionaría.', ok && ref);
  }
  function find(ref) { return list.filter(function (p) { return p.ref === ref; })[0]; }

  document.addEventListener('change', function (e) {
    var s = e.target.closest('[data-st]'); if (!s) return;
    var p = find(s.getAttribute('data-st')); p.estado = s.value; render();
    persist('Estado cambiado a «' + p.estado + '». Tu web ya lo muestra así.', p.ref);
  });
  document.addEventListener('click', function (e) {
    var st = e.target.closest('[data-star]');
    if (st) { var p = find(st.getAttribute('data-star')); p.destacado = !p.destacado; render(); persist(p.destacado ? 'Ahora aparece en los destacados de tu web.' : 'Ya no aparece en destacados.', p.ref); return; }
    var ed = e.target.closest('[data-edit]');
    if (ed) open(find(ed.getAttribute('data-edit')));
  });

  /* ---------- Editor ---------- */
  var drawer = $('#drawer'), form = $('#editor'), editing = null, photos = [], tmp = [];
  function fill(sel, items) { sel.innerHTML = items.map(function (t) { return '<option>' + esc(t) + '</option>'; }).join(''); }
  fill($('#edEstado'), GS.estados); fill($('#edTipo'), GS.tipos); fill($('#edZona'), GS.zonas);

  function open(p) {
    editing = p || null;
    var d = p || { titulo: '', op: 'Venta', precio: '', estado: 'Disponible', tipo: 'Piso', zona: 'Umbrete', barrio: '', hab: 3, banos: 2, m2: 90, desc: '', extras: [], destacado: false, fotos: [] };
    $('#edKicker').textContent = p ? 'Editar inmueble · ' + p.ref.toUpperCase() : 'Nuevo inmueble';
    $('#edTitle').textContent = p ? p.titulo : 'Añadir inmueble';
    ['titulo', 'op', 'precio', 'estado', 'tipo', 'zona', 'barrio', 'hab', 'banos', 'm2', 'desc'].forEach(function (k) { form[k].value = d[k] == null ? '' : d[k]; });
    form.destacado.checked = !!d.destacado;
    var all = GS.extras.slice(); (d.extras || []).forEach(function (x) { if (all.indexOf(x) < 0) all.push(x); });
    $('#edExtras').innerHTML = all.map(function (x) { return '<label><input type="checkbox" value="' + esc(x) + '"' + ((d.extras || []).indexOf(x) > -1 ? ' checked' : '') + '>' + esc(x) + '</label>'; }).join('');
    photos = (d.fotos || []).slice(); tmp = [];
    drawPhotos(); unit();
    $('#delBtn').hidden = !p;
    drawer.hidden = false; document.body.style.overflow = 'hidden';
    setTimeout(function () { (p ? form.precio : form.titulo).focus({ preventScroll: true }); }, 50);
  }
  function close() { drawer.hidden = true; document.body.style.overflow = ''; tmp.forEach(function (u) { try { URL.revokeObjectURL(u); } catch (e) {} }); tmp = []; }
  $$('[data-close]').forEach(function (b) { b.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !drawer.hidden) close(); });
  function unit() { $('#precioUnit').textContent = form.op.value === 'Alquiler' ? '€/mes' : '€'; }
  form.op.addEventListener('change', unit);

  function drawPhotos() {
    var items = photos.map(function (f, i) { return '<div class="ph" style="background-image:url(\'' + esc(src(f)) + '\')"><button type="button" data-rm="' + i + '" aria-label="Quitar foto"><svg><use href="#i-x"/></svg></button></div>'; })
      .concat(tmp.map(function (u) { return '<div class="ph tmp" style="background-image:url(\'' + u + '\')"></div>'; }));
    $('#photos').innerHTML = items.join('') || '<p class="hint">Todavía no hay fotos.</p>';
  }
  $('#photos').addEventListener('click', function (e) { var b = e.target.closest('[data-rm]'); if (b) { photos.splice(+b.getAttribute('data-rm'), 1); drawPhotos(); } });
  $('#fileIn').addEventListener('change', function (e) {
    Array.prototype.forEach.call(e.target.files, function (f) { if (/^image\//.test(f.type)) tmp.push(URL.createObjectURL(f)); });
    e.target.value = ''; drawPhotos();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.titulo.value.trim()) { form.titulo.classList.add('err'); form.titulo.focus(); return; }
    if (!(+form.precio.value > 0)) { form.precio.classList.add('err'); form.precio.focus(); return; }
    var d = editing || { ref: nextRef(), demo: true, nuevo: true };
    d.titulo = form.titulo.value.trim(); d.op = form.op.value; d.precio = Math.round(+form.precio.value);
    d.estado = form.estado.value; d.tipo = form.tipo.value; d.zona = form.zona.value; d.barrio = form.barrio.value.trim();
    d.hab = +form.hab.value || 0; d.banos = +form.banos.value || 0; d.m2 = +form.m2.value || 0;
    d.desc = form.desc.value.trim(); d.destacado = form.destacado.checked;
    d.extras = $$('#edExtras input:checked').map(function (i) { return i.value; });
    d.fotos = photos.length ? photos : ['assets/inmuebles/placeholder.svg'];
    if (!editing) list.unshift(d);
    close(); render();
    persist(editing ? 'Cambios guardados. Ya se ven en tu web.' : 'Inmueble publicado. Ya aparece en tu web.', d.ref);
  });
  $$('#editor input').forEach(function (i) { i.addEventListener('input', function () { i.classList.remove('err'); }); });
  function nextRef() { var n = list.reduce(function (m, p) { var k = parseInt(p.ref.replace(/\D/g, ''), 10) || 0; return Math.max(m, k); }, 100); return 'gs' + (n + 1); }

  $('#delBtn').addEventListener('click', function () {
    if (!editing || !confirm('¿Eliminar «' + editing.titulo + '»? Dejará de aparecer en tu web.')) return;
    list = list.filter(function (p) { return p !== editing; });
    close(); render(); persist('Inmueble eliminado de tu web.');
  });
  $('#addBtn').addEventListener('click', function () { open(null); });
  $('#addBtn2').addEventListener('click', function () { open(null); });

  /* ---------- Aviso ---------- */
  var tt;
  function toast(msg, ref) {
    var t = $('#toast');
    t.innerHTML = '<span>' + esc(msg) + '</span>' + (ref ? '<a href="../inmueble/?ref=' + encodeURIComponent(ref) + '" target="_blank" rel="noopener">Ver en la web</a>' : '');
    t.hidden = false; clearTimeout(tt); tt = setTimeout(function () { t.hidden = true; }, 4200);
  }

  go('panel');
  if (logged()) enter();
})();
