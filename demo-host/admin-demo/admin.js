/* Inmomairena · panel de gestión (DEMO).
   No hay backend: todo se guarda en localStorage con IM.Store y la web
   pública de este mismo navegador lee esos datos. */
(function () {
  const { CONFIG, TYPES, STATUS, Store, fmt, img } = window.IM;
  const { $, $$, esc, icon, card, toast, fillSelect } = window.UI;
  const BASE = '../';

  let list = Store.all();
  const ui = { st: '', op: '', q: '' };
  const LIB = ['f-chalet-simon-verde.svg', 'f-piso-ciudad-expo.svg', 'f-atico-cavaleri.svg', 'f-adosado-bormujos.svg', 'f-casa-casco.svg', 'f-piso-lepanto.svg', 'f-pareado-tomares.svg', 'f-piso-san-juan.svg', 'f-casa-almensilla.svg', 'f-loft-gelves.svg', 'f-local-mairena.svg', 'salon-a.svg', 'salon-b.svg', 'salon-c.svg', 'cocina-a.svg', 'cocina-b.svg', 'cocina-c.svg', 'dormitorio-a.svg', 'dormitorio-b.svg', 'bano-a.svg', 'bano-b.svg', 'patio-a.svg', 'piscina-a.svg', 'terraza-a.svg'];
  const FEATS = ['Piscina', 'Piscina comunitaria', 'Jardín', 'Terraza', 'Patio', 'Garaje', 'Plaza de garaje', 'Trastero', 'Ascensor', 'Aire acondicionado', 'Amueblado', 'Reformado', 'Placas solares', 'Armarios empotrados', 'Azotea'];

  function persist() {
    if (!Store.save(list)) toast('No se pudo guardar: el navegador no tiene espacio (prueba con fotos más pequeñas)');
  }

  // ---------- Acceso ----------
  const h = new Date().getHours();
  $('#hello').textContent = h < 14 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches';
  const enter = () => { $('#login').hidden = true; $('#app').hidden = false; try { sessionStorage.setItem('im-in', '1'); } catch (e) {} render(); };
  $('#loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const b = $('#loginForm button');
    b.innerHTML = 'Entrando…'; b.disabled = true;
    setTimeout(enter, 550);
  });
  try { if (sessionStorage.getItem('im-in')) enter(); } catch (e) {}
  $('#logoutBtn').addEventListener('click', () => { try { sessionStorage.removeItem('im-in'); } catch (e) {} location.reload(); });

  // ---------- Pestañas ----------
  $$('#tabs button').forEach(b => b.addEventListener('click', () => {
    $$('#tabs > *').forEach(x => x.classList.toggle('is-on', x === b));
    $$('.view').forEach(v => { v.hidden = v.dataset.view !== b.dataset.tab; });
    window.scrollTo({ top: 0 });
  }));

  // ---------- Resumen ----------
  let prevCounts = {};
  function renderStats() {
    const c = { disponible: 0, reservado: 0, vendido: 0, alquilado: 0 };
    list.forEach(p => { c[p.status] = (c[p.status] || 0) + 1; });
    const total = list.length;
    const col = { disponible: 'var(--ok)', reservado: 'var(--res)', vendido: 'var(--sold)', alquilado: 'var(--rent)' };
    $('#stats').innerHTML =
      `<button class="stat stat--all${ui.st === '' ? ' is-on' : ''}" data-st=""><span>Inmuebles publicados</span><strong>${total}</strong>
        <div class="bar">${Object.keys(c).map(k => `<b style="flex-grow:${c[k]};background:${col[k]}"></b>`).join('')}</div></button>` +
      Object.keys(c).map(k => `<button class="stat stat--${k}${ui.st === k ? ' is-on' : ''}${prevCounts[k] !== undefined && prevCounts[k] !== c[k] ? ' bump' : ''}" data-st="${k}"><span><i></i>${STATUS[k]}s</span><strong>${c[k]}</strong></button>`).join('');
    prevCounts = c;
    $$('#stats .stat').forEach(b => b.addEventListener('click', () => { ui.st = ui.st === b.dataset.st ? '' : b.dataset.st; render(); }));
  }

  // ---------- Listado ----------
  function rowHTML(p) {
    const cover = p.cover ? img(p.cover, BASE) : '';
    const price = new Intl.NumberFormat('es-ES').format(p.price);
    const pr = `${price} €${p.op === 'alquiler' ? '<small> /mes</small>' : ''}`;
    return `<div class="row" role="row" data-id="${esc(p.id)}">
      <div class="row__img" style="background-image:url('${esc(cover)}')">${p.featured ? `<span class="star" title="Destacado">${icon('star')}</span>` : ''}</div>
      <div class="row__main">
        <span class="row__t">${esc(p.title)}</span>
        <span class="row__m">${esc(p.area ? p.area + ' · ' : '')}${esc(p.town)} · ${p.beds ? p.beds + ' hab · ' : ''}${p.m2 || 0} m²</span>
        <span class="row__p">${pr}</span>
      </div>
      <span class="row__p row__pd">${pr}</span>
      <div class="row__ctl">
        <span class="row__op row__op--${p.op}">${fmt.op(p)}</span>
        <select class="stsel-in s-${p.status}" aria-label="Estado de ${esc(p.title)}">
          ${Object.entries(STATUS).map(([k, v]) => `<option value="${k}"${k === p.status ? ' selected' : ''}>${v}</option>`).join('')}
        </select>
        <div class="row__btns">
          <button class="ic${p.featured ? ' is-star' : ''}" data-act="star" title="${p.featured ? 'Quitar de destacados' : 'Destacar en portada'}" aria-label="${p.featured ? 'Quitar de destacados' : 'Destacar en portada'}" aria-pressed="${!!p.featured}">${icon('star')}</button>
          <button class="ic" data-act="edit" title="Editar" aria-label="Editar ${esc(p.title)}">${icon('edit')}</button>
          <a class="ic" href="${BASE}inmueble/?id=${encodeURIComponent(p.id)}" target="_blank" rel="noopener" title="Ver en la web" aria-label="Ver en la web">${icon('eye')}</a>
        </div>
      </div>
    </div>`;
  }

  function render(flashId) {
    renderStats();
    const q = ui.q.toLowerCase();
    const items = list.filter(p => (!ui.st || p.status === ui.st) && (!ui.op || p.op === ui.op) &&
      (!q || `${p.title} ${p.town} ${p.area || ''} ${p.type}`.toLowerCase().includes(q)));
    $('#tbl').innerHTML = `<div class="tbl__head" role="row"><span></span><span>Inmueble</span><span>Precio</span><span>Operación</span><span>Estado</span><span style="text-align:right">Acciones</span></div>` + items.map(rowHTML).join('');
    $('#tblEmpty').hidden = items.length > 0;
    if (flashId) { const r = $(`.row[data-id="${CSS.escape(flashId)}"]`); r && r.classList.add('is-flash'); }
  }

  $('#q').addEventListener('input', e => { ui.q = e.target.value; render(); });
  $$('#opFilter button').forEach(b => b.addEventListener('click', () => {
    ui.op = b.dataset.op; $$('#opFilter button').forEach(x => x.classList.toggle('is-on', x === b)); render();
  }));

  $('#tbl').addEventListener('change', (e) => {
    const sel = e.target.closest('.stsel-in'); if (!sel) return;
    const p = list.find(x => x.id === sel.closest('.row').dataset.id);
    p.status = sel.value;
    persist(); render(p.id);
    toast(`«${p.title}» ahora aparece como ${STATUS[p.status].toLowerCase()} en tu web`);
  });
  $('#tbl').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const p = list.find(x => x.id === b.closest('.row').dataset.id);
    if (b.dataset.act === 'star') {
      p.featured = !p.featured; persist(); render(p.id);
      toast(p.featured ? 'Destacado: ya aparece en la portada' : 'Quitado de destacados');
    }
    if (b.dataset.act === 'edit') openEditor(p);
  });

  // ---------- Solicitudes (ficticias) ----------
  const LEADS = [
    { n: 'Laura M.', sell: true, t: 'Quiere vender su piso', d: 'Piso de 3 dormitorios en Ciudad Expo. Pide valoración.', k: ['Valoración', 'Mairena del Aljarafe', 'Hace 12 min'], nw: true },
    { n: 'Antonio R.', t: 'Chalet con piscina y jardín', d: '¿Se puede visitar este sábado por la mañana?', k: ['Ficha de inmueble', 'WhatsApp', 'Hace 1 h'], nw: true },
    { n: 'Marta y Javier', t: 'Piso amueblado para entrar a vivir', d: 'Somos pareja, los dos con contrato indefinido. ¿Sigue disponible?', k: ['Alquiler', 'Formulario', 'Ayer'] },
    { n: 'Carmen G.', sell: true, t: 'Casa en Bormujos', d: 'Heredamos una casa y queremos saber qué precio tendría.', k: ['Valoración', 'Bormujos', 'Hace 2 días'] }
  ];
  $('#leads').innerHTML = LEADS.map(l => `<article class="lead"><span class="lead__ava${l.sell ? ' lead__ava--sell' : ''}">${esc(l.n.split(' ').map(w => w[0]).join('').slice(0, 2))}</span>
    <div><strong>${esc(l.n)} · ${esc(l.t)}</strong>${l.nw ? '<span class="lead__new">Nuevo</span>' : ''}<p>${esc(l.d)}</p><div class="lead__k">${l.k.map(x => `<span>${esc(x)}</span>`).join('')}</div></div></article>`).join('');

  // ---------- Ajustes ----------
  $('#setPhone').value = CONFIG.phone;
  $('#setWa').value = CONFIG.whatsapp ? '+' + CONFIG.whatsapp.replace(/^(\d{2})(\d{3})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5') : 'Sin configurar';
  $('#resetBtn').addEventListener('click', () => {
    if (!confirm('¿Volver a los inmuebles de ejemplo? Se perderán los cambios hechos en este navegador.')) return;
    Store.reset(); list = Store.all(); render(); toast('Demo restablecida');
  });

  // ---------- Editor ----------
  const ed = $('#ed'), form = $('#edForm');
  let editing = null; // copia de trabajo
  let isNew = false;
  fillSelect($('#edType'), TYPES, false);
  fillSelect($('#edTown'), CONFIG.zones, false);

  function slug(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'inmueble';
  }

  function openEditor(p) {
    isNew = !p;
    editing = p ? JSON.parse(JSON.stringify(p)) : {
      id: '', demo: true, featured: false, title: '', type: 'Piso', town: CONFIG.town, area: '', op: 'venta', price: 0,
      status: 'disponible', beds: 3, baths: 2, m2: 90, plot: null, features: [], cover: '', gallery: [], description: '', summary: ''
    };
    $('#edKicker').textContent = isNew ? 'Nuevo inmueble' : 'Editando';
    $('#edTitle').textContent = isNew ? 'Añadir inmueble' : editing.title;
    $('#edSave').textContent = isNew ? 'Publicar' : 'Guardar cambios';
    $('#edDanger').hidden = isNew;
    const f = form.elements;
    f.title.value = editing.title; f.price.value = editing.price ? new Intl.NumberFormat('es-ES').format(editing.price) : '';
    f.op.value = editing.op; f.status.value = editing.status; f.featured.checked = !!editing.featured;
    f.beds.value = editing.beds; f.baths.value = editing.baths; f.m2.value = editing.m2;
    f.type.value = editing.type; f.town.value = editing.town; f.area.value = editing.area || ''; f.description.value = editing.description || '';
    $$('.is-bad', form).forEach(x => x.classList.remove('is-bad'));
    $('#lib').hidden = true;
    renderFeats(); renderPhotos(); preview();
    ed.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => ed.classList.add('is-on')));
    document.body.style.overflow = 'hidden';
    $('.ed__body').scrollTop = 0;
    setTimeout(() => isNew && matchMedia('(min-width: 980px)').matches && f.title.focus(), 450);
  }
  function closeEditor() {
    ed.classList.remove('is-on'); document.body.style.overflow = '';
    setTimeout(() => { ed.hidden = true; }, 500);
  }
  $$('[data-close]', ed).forEach(b => b.addEventListener('click', closeEditor));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !ed.hidden) closeEditor(); });
  $('#addBtn').addEventListener('click', () => openEditor(null));

  function readForm() {
    const f = form.elements;
    editing.title = f.title.value.trim();
    editing.price = +String(f.price.value).replace(/\D/g, '') || 0;
    editing.op = f.op.value; editing.status = f.status.value; editing.featured = f.featured.checked;
    editing.beds = +f.beds.value || 0; editing.baths = +f.baths.value || 0; editing.m2 = +f.m2.value || 0;
    editing.type = f.type.value; editing.town = f.town.value; editing.area = f.area.value.trim();
    editing.description = f.description.value.trim();
    $('#priceUnit').textContent = editing.op === 'alquiler' ? '€/mes' : '€';
  }
  function preview() {
    readForm();
    const p = Object.assign({}, editing, { title: editing.title || 'Título del inmueble', cover: editing.cover || 'f-piso-ciudad-expo.svg', id: editing.id || 'nuevo' });
    $('#edPreview').innerHTML = card(p);
  }
  form.addEventListener('input', (e) => {
    if (e.target.name === 'price') {
      const n = e.target.value.replace(/\D/g, '');
      e.target.value = n ? new Intl.NumberFormat('es-ES').format(+n) : '';
    }
    const w = e.target.closest('.is-bad'); w && w.classList.remove('is-bad');
    preview();
  });
  form.addEventListener('change', preview);

  // Características
  function renderFeats() {
    const all = [...new Set([...FEATS, ...editing.features])];
    $('#featSel').innerHTML = all.map(x => `<button type="button" class="${editing.features.includes(x) ? 'is-on' : ''}" aria-pressed="${editing.features.includes(x)}">${esc(x)}</button>`).join('');
  }
  $('#featSel').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const v = b.textContent;
    editing.features = editing.features.includes(v) ? editing.features.filter(x => x !== v) : [...editing.features, v];
    renderFeats();
  });
  const addFeat = () => {
    const v = $('#featNew').value.trim(); if (!v) return;
    if (!editing.features.includes(v)) editing.features.push(v);
    $('#featNew').value = ''; renderFeats();
  };
  $('#featAdd').addEventListener('click', addFeat);
  $('#featNew').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addFeat(); } });

  // Fotografías
  const photosOf = () => [editing.cover, ...editing.gallery].filter(Boolean);
  function setPhotos(arr) { editing.cover = arr[0] || ''; editing.gallery = arr.slice(1); }
  function renderPhotos() {
    const ph = photosOf();
    $('#photos').innerHTML = ph.length
      ? ph.map((src, i) => `<div class="ph" data-i="${i}" style="background-image:url('${esc(img(src, BASE))}')" title="${i ? 'Hacer portada' : 'Portada'}">${i ? '' : '<span class="ph__cover">Portada</span>'}<button type="button" class="ph__x" data-x="${i}" aria-label="Quitar foto">${icon('close')}</button></div>`).join('')
      : `<div class="ph ph--empty" style="grid-column:1/-1;aspect-ratio:auto;min-height:120px">Añade fotos desde tu móvil u ordenador.<br>La primera será la portada.</div>`;
    preview();
  }
  $('#photos').addEventListener('click', (e) => {
    const x = e.target.closest('[data-x]');
    const ph = photosOf();
    if (x) { ph.splice(+x.dataset.x, 1); setPhotos(ph); renderPhotos(); return; }
    const t = e.target.closest('.ph[data-i]');
    if (t && +t.dataset.i > 0) { const [m] = ph.splice(+t.dataset.i, 1); ph.unshift(m); setPhotos(ph); renderPhotos(); toast('Nueva portada'); }
  });
  $('#libBtn').addEventListener('click', () => {
    const lib = $('#lib');
    lib.hidden = !lib.hidden;
    if (!lib.hidden && !lib.childElementCount) lib.innerHTML = LIB.map(s => `<button type="button" data-src="${s}" style="background-image:url('${BASE}assets/img/${s}')" aria-label="Añadir foto de ejemplo"></button>`).join('');
  });
  $('#lib').addEventListener('click', (e) => {
    const b = e.target.closest('[data-src]'); if (!b) return;
    setPhotos([...photosOf(), b.dataset.src]); renderPhotos();
  });
  // Las fotos subidas se reducen a ~1000 px para que quepan en el almacenamiento del navegador.
  function shrink(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => {
        const im = new Image();
        im.onload = () => {
          const k = Math.min(1, 1000 / Math.max(im.width, im.height));
          const c = document.createElement('canvas');
          c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          res(c.toDataURL('image/jpeg', .74));
        };
        im.onerror = rej; im.src = r.result;
      };
      r.onerror = rej; r.readAsDataURL(file);
    });
  }
  $('#upl').addEventListener('change', async (e) => {
    const files = [...e.target.files].slice(0, 8);
    if (!files.length) return;
    toast(files.length === 1 ? 'Subiendo foto…' : `Subiendo ${files.length} fotos…`);
    const out = [];
    for (const f of files) { try { out.push(await shrink(f)); } catch (err) { /* archivo no válido */ } }
    setPhotos([...photosOf(), ...out]); renderPhotos();
    e.target.value = '';
    toast(out.length ? 'Fotos añadidas' : 'No se pudieron leer esas imágenes');
  });

  // Guardar
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    readForm();
    const bad = [];
    if (!editing.title) bad.push(form.elements.title);
    if (!editing.price) bad.push(form.elements.price);
    bad.forEach(el => el.closest('.f').classList.add('is-bad'));
    if (bad.length) { bad[0].focus(); toast('Falta el título o el precio'); return; }
    if (!editing.cover) { editing.cover = editing.type === 'Chalet' ? 'f-chalet-simon-verde.svg' : editing.type === 'Ático' ? 'f-atico-cavaleri.svg' : 'f-piso-ciudad-expo.svg'; }
    editing.summary = editing.description ? editing.description.split('. ')[0].slice(0, 120) : '';
    if (isNew) {
      let id = slug(editing.title), n = 2;
      while (list.some(p => p.id === id)) id = `${slug(editing.title)}-${n++}`;
      editing.id = id;
      editing.map = { x: 270, y: 214 };
      list.unshift(editing);
    } else {
      list = list.map(p => p.id === editing.id ? editing : p);
    }
    persist();
    const id = editing.id, wasNew = isNew;
    closeEditor();
    ui.st = ''; ui.q = ''; $('#q').value = '';
    render(id);
    toastLink(wasNew ? '¡Publicado! Ya aparece en tu web' : 'Cambios guardados en tu web', `${BASE}inmueble/?id=${encodeURIComponent(id)}`);
  });
  $('#edDelete').addEventListener('click', () => {
    if (!confirm(`¿Eliminar «${editing.title}» de la web?`)) return;
    list = list.filter(p => p.id !== editing.id); persist(); closeEditor(); render(); toast('Inmueble eliminado de la web');
  });

  function toastLink(msg, href) {
    const t = $('#toast');
    toast(msg);
    t.innerHTML = `${esc(msg)} · <a href="${href}" target="_blank" rel="noopener" style="color:var(--sun);text-decoration:underline">Ver</a>`;
    t.style.pointerEvents = 'auto';
    setTimeout(() => { t.style.pointerEvents = ''; }, 2600);
  }
})();
