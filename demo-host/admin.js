/* Hogar Inmobiliaria · panel de gestión (DEMO, sin backend)
   Los cambios se guardan en localStorage para que la web pública de este mismo navegador los muestre. */
(function () {
  var H = window.HOGAR, UI = window.HogarUI, ART = window.HogarArt;
  var list = H.load();
  var filtro = 'Todos', q = '', editing = null, photos = [];
  var $ = function (s) { return document.querySelector(s); };
  var KCOL = { Disponible: 'var(--salvia-d)', Reservado: 'var(--miel)', Vendido: 'var(--teja)', Alquilado: 'var(--ink)' };
  var FACHADA = { 'Piso': 'piso', 'Ático': 'atico', 'Dúplex': 'duplex', 'Adosado': 'adosado', 'Casa': 'casa', 'Chalet': 'chalet', 'Local': 'local' };
  var PAREDES = ['#F6E6D3', '#EFD9C4', '#E3ECEA', '#F4E9DA', '#F1E2D0'];
  var ACENTOS = ['#D65A36', '#4F7A5B', '#23304A', '#F2B544'];

  function persist() { H.save(list); }
  function count(e) { return list.filter(function (p) { return p.estado === e; }).length; }

  function renderKpis() {
    var html = '<div class="kpi total"><b>' + list.length + '</b><small>inmuebles publicados</small></div>';
    H.estados.forEach(function (e) {
      html += '<div class="kpi" style="--k:' + KCOL[e] + '"><b>' + count(e) + '</b><small>' + e.toLowerCase() + (count(e) === 1 ? '' : 's') + '</small></div>';
    });
    $('#kpis').innerHTML = html;
    $('#tabs').innerHTML = ['Todos'].concat(H.estados).map(function (e) {
      var n = e === 'Todos' ? list.length : count(e);
      return '<button class="tab" role="tab" type="button" data-f="' + e + '" aria-selected="' + (filtro === e) + '">' + (e === 'Todos' ? 'Todos' : e + 's') + '<em>' + n + '</em></button>';
    }).join('');
  }

  function row(p) {
    var opts = H.estados.map(function (e) { return '<option' + (e === p.estado ? ' selected' : '') + '>' + e + '</option>'; }).join('');
    return '<article class="row" data-id="' + p.id + '">' +
      '<div class="row-th">' + ART.svg(p, 'fachada') + '</div>' +
      '<div class="row-main"><b>' + UI.esc(p.titulo) + '</b><small>' + UI.esc(p.ref) + ' · ' + UI.esc(p.zona) + ' · ' + (p.hab ? p.hab + ' hab. · ' : '') + p.m2 + ' m²</small>' +
        '<span class="row-price">' + H.precio(p) + '</span></div>' +
      '<div class="row-meta"><span class="op-tag">' + p.operacion + '</span>' +
        '<label class="sr" for="st-' + p.id + '">Estado</label><select class="estado-sel ' + p.estado.toLowerCase() + '" id="st-' + p.id + '" data-act="estado">' + opts + '</select>' +
        '<div class="row-actions">' +
          '<button class="icon-btn star" type="button" data-act="star" aria-pressed="' + !!p.destacado + '" aria-label="Destacar en portada" title="Destacar en portada">' + UI.icon('star') + '</button>' +
          '<a class="icon-btn" href="../inmueble/?id=' + encodeURIComponent(p.id) + '" target="_blank" rel="noopener" aria-label="Ver en la web" title="Ver en la web">' + UI.icon('eye') + '</a>' +
          '<button class="edit-btn" type="button" data-act="edit">' + UI.icon('edit') + 'Editar</button>' +
        '</div></div></article>';
  }

  function renderList(flashId) {
    var items = list.filter(function (p) {
      if (filtro !== 'Todos' && p.estado !== filtro) return false;
      if (!q) return true;
      return (p.titulo + ' ' + p.zona + ' ' + p.ref + ' ' + p.localidad).toLowerCase().indexOf(q) > -1;
    });
    $('#list').innerHTML = items.length ? items.map(row).join('') : '<div class="list-empty">No hay inmuebles en esta vista.</div>';
    if (flashId) {
      var el = document.querySelector('.row[data-id="' + flashId + '"]');
      if (el) { el.classList.add('flash'); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); setTimeout(function () { el.classList.remove('flash'); }, 1600); }
    }
  }

  function renderAll(flashId) { renderKpis(); renderList(flashId); }

  function find(id) { return list.filter(function (p) { return p.id === id; })[0]; }

  // ── Editor ──────────────────────────────────────────────────────────────
  var form = $('#editor');

  function fillOptions() {
    $('#ed-tipo').innerHTML = H.tipos.map(function (t) { return '<option>' + t + '</option>'; }).join('');
    $('#ed-zona').innerHTML = H.zonas.map(function (t) { return '<option>' + t + '</option>'; }).join('');
    $('#status-pick').innerHTML = H.estados.map(function (e, i) {
      return '<input type="radio" name="estado" id="es-' + i + '" value="' + e + '"><label class="' + e.toLowerCase() + '" for="es-' + i + '">' + e + '</label>';
    }).join('');
    $('#ed-extras').innerHTML = H.extras.map(function (e) {
      return '<label><input type="checkbox" name="extras" value="' + e[0] + '">' + e[1] + '</label>';
    }).join('');
  }

  function renderPhotos() {
    var p = editing || { titulo: form.titulo.value, arte: draftArte, extras: [] };
    $('#photos').innerHTML = photos.map(function (v, i) {
      return '<div class="ph">' + ART.svg(p, v) + (i === 0 ? '<span class="cover">Portada</span>' : '') +
        '<button type="button" class="rm" data-rm="' + i + '" aria-label="Quitar foto">' + UI.icon('x') + '</button></div>';
    }).join('') + '<button type="button" class="ph-up" id="ph-up">' + UI.icon('upload') + 'Subir fotos</button>';
  }

  var draftArte = null;

  function open(p) {
    editing = p || null;
    form.reset();
    var d = p || { titulo: '', operacion: 'Venta', precio: '', estado: 'Disponible', destacado: false, tipo: 'Piso', zona: H.zonas[0], hab: 3, banos: 2, m2: 90, extras: [], descripcion: [] };
    draftArte = p ? p.arte : { fachada: 'piso', pared: PAREDES[list.length % PAREDES.length], acento: ACENTOS[list.length % ACENTOS.length] };
    $('#ed-title').textContent = p ? 'Editar inmueble' : 'Añadir inmueble';
    $('#ed-ref').textContent = p ? 'Ref. ' + p.ref : 'Nuevo inmueble';
    form.titulo.value = d.titulo;
    form.querySelector('input[name=operacion][value="' + d.operacion + '"]').checked = true;
    form.precio.value = d.precio;
    form.querySelector('input[name=estado][value="' + d.estado + '"]').checked = true;
    form.destacado.checked = !!d.destacado;
    form.tipo.value = d.tipo; form.zona.value = d.zona;
    form.hab.value = d.hab; form.banos.value = d.banos; form.m2.value = d.m2;
    form.querySelectorAll('input[name=extras]').forEach(function (c) { c.checked = (d.extras || []).indexOf(c.value) > -1; });
    form.descripcion.value = (d.descripcion || []).join('\n\n');
    photos = p ? ART.vistas(p) : [];
    $('#ed-delete').hidden = !p;
    updatePriceLabel();
    renderPhotos();
    $('#drawer').hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(function () { (p ? form.precio : form.titulo).focus({ preventScroll: true }); }, 50);
  }

  function close() {
    $('#drawer').hidden = true;
    document.body.style.overflow = '';
    editing = null;
  }

  function updatePriceLabel() {
    var alq = form.querySelector('input[name=operacion]:checked').value === 'Alquiler';
    $('#ed-price-l').textContent = alq ? 'Precio (€/mes)' : 'Precio (€)';
  }

  function slug(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'inmueble';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var titulo = form.titulo.value.trim(), precio = +form.precio.value;
    if (!titulo) { form.titulo.focus(); form.titulo.style.borderColor = '#D65A36'; UI.toast('Ponle un título al inmueble'); return; }
    if (!precio) { form.precio.focus(); form.precio.style.borderColor = '#D65A36'; UI.toast('Falta el precio'); return; }
    form.titulo.style.borderColor = form.precio.style.borderColor = '';
    var d = {
      titulo: titulo, precio: precio,
      operacion: form.querySelector('input[name=operacion]:checked').value,
      estado: form.querySelector('input[name=estado]:checked').value,
      destacado: form.destacado.checked, tipo: form.tipo.value, zona: form.zona.value,
      hab: +form.hab.value || 0, banos: +form.banos.value || 0, m2: +form.m2.value || 0,
      extras: Array.prototype.map.call(form.querySelectorAll('input[name=extras]:checked'), function (c) { return c.value; }),
      descripcion: form.descripcion.value.split(/\n\s*\n/).map(function (t) { return t.trim(); }).filter(Boolean)
    };
    var isNew = !editing, p = editing, priceChanged = p && p.precio !== d.precio, stateChanged = p && p.estado !== d.estado;
    if (p) {
      Object.keys(d).forEach(function (k) { p[k] = d[k]; });
      p.arte.fachada = FACHADA[d.tipo] || p.arte.fachada;
    } else {
      var maxRef = list.reduce(function (m, x) { return Math.max(m, parseInt(String(x.ref).replace(/\D/g, ''), 10) || 0); }, 0);
      p = d;
      p.id = slug(d.titulo) + '-' + Date.now().toString(36).slice(-4);
      p.ref = 'HI-' + String(maxRef + 1).padStart(4, '0');
      p.publicado = true;
      p.localidad = /Sevilla/.test(d.zona) ? 'Sevilla' : (d.zona === 'Alcalá de Guadaíra' || d.zona === 'Coria del Río' ? d.zona : 'Dos Hermanas');
      p.arte = { fachada: FACHADA[d.tipo] || 'piso', pared: draftArte.pared, acento: draftArte.acento };
      if (!p.descripcion.length) p.descripcion = ['Descripción pendiente de completar.'];
      list.unshift(p);
    }
    persist();
    close();
    filtro = 'Todos';
    renderAll(p.id);
    UI.toast(isNew ? 'Publicado. Ya aparece en tu web.'
      : priceChanged ? 'Precio actualizado en tu web.' : stateChanged ? 'Estado cambiado a ' + p.estado.toLowerCase() + '. Tu web ya lo muestra.' : 'Cambios guardados y publicados.');
  });

  document.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('#drawer').hidden) close(); });
  form.querySelectorAll('input[name=operacion]').forEach(function (r) { r.addEventListener('change', updatePriceLabel); });
  form.tipo.addEventListener('change', function () { if (draftArte && !editing) { draftArte.fachada = FACHADA[form.tipo.value]; renderPhotos(); } });

  $('#photos').addEventListener('click', function (e) {
    var rm = e.target.closest('[data-rm]');
    if (rm) { photos.splice(+rm.getAttribute('data-rm'), 1); renderPhotos(); return; }
    if (e.target.closest('#ph-up')) {
      var all = ['fachada', 'salon', 'cocina', 'dormitorio', 'bano', 'exterior'];
      var next = all.filter(function (v) { return photos.indexOf(v) === -1; })[0];
      if (!next) { UI.toast('Ya tienes todas las fotos de ejemplo'); return; }
      photos.push(next); renderPhotos();
      UI.toast('En el panel real aquí eliges las fotos de tu móvil');
    }
  });

  $('#ed-delete').addEventListener('click', function () {
    if (!editing) return;
    if (!window.confirm('¿Eliminar "' + editing.titulo + '"? Dejará de verse en tu web.')) return;
    list = list.filter(function (p) { return p !== editing; });
    persist(); close(); renderAll();
    UI.toast('Inmueble eliminado de tu web');
  });

  // ── Lista ───────────────────────────────────────────────────────────────
  $('#list').addEventListener('click', function (e) {
    var r = e.target.closest('.row'); if (!r) return;
    var p = find(r.getAttribute('data-id')); if (!p) return;
    var act = e.target.closest('[data-act]');
    if (!act) return;
    var a = act.getAttribute('data-act');
    if (a === 'edit') open(p);
    if (a === 'star') {
      p.destacado = !p.destacado; persist();
      act.setAttribute('aria-pressed', String(p.destacado));
      UI.toast(p.destacado ? 'Destacado en la portada de tu web' : 'Ya no aparece como destacado');
    }
  });
  $('#list').addEventListener('change', function (e) {
    if (e.target.getAttribute('data-act') !== 'estado') return;
    var p = find(e.target.closest('.row').getAttribute('data-id'));
    p.estado = e.target.value; persist();
    renderAll(p.id);
    UI.toast('Marcado como ' + p.estado.toLowerCase() + '. Tu web ya lo muestra.');
  });
  $('#tabs').addEventListener('click', function (e) {
    var t = e.target.closest('[data-f]'); if (!t) return;
    filtro = t.getAttribute('data-f'); renderAll();
  });
  $('#q').addEventListener('input', function () { q = this.value.trim().toLowerCase(); renderList(); });
  $('#add').addEventListener('click', function () { open(null); });
  $('#add-m').addEventListener('click', function () { open(null); });

  $('#reset').addEventListener('click', function () {
    list = H.reset(); filtro = 'Todos'; renderAll();
    UI.toast('Datos de demostración restablecidos');
  });

  // ── Acceso simulado ────────────────────────────────────────────────────
  function enter() {
    $('#login').hidden = true; $('#app').hidden = false;
    try { sessionStorage.setItem('hogar-demo-login', '1'); } catch (e) { /* nada */ }
    renderAll();
  }
  $('#login-user').value = H.config.email;
  $('#login-form').addEventListener('submit', function (e) { e.preventDefault(); enter(); });
  $('#logout').addEventListener('click', function (e) {
    e.preventDefault();
    try { sessionStorage.removeItem('hogar-demo-login'); } catch (err) { /* nada */ }
    $('#app').hidden = true; $('#login').hidden = false; window.scrollTo(0, 0);
  });

  document.addEventListener('DOMContentLoaded', function () {
    fillOptions();
    var logged = false;
    try { logged = sessionStorage.getItem('hogar-demo-login') === '1'; } catch (e) { /* nada */ }
    if (logged || location.hash === '#panel') enter();
  });
})();
