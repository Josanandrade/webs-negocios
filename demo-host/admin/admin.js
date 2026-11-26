/* Panel de administración de la web de Margot Ibáñez.
 * Lee la página original para saber qué textos y galerías hay, y guarda los cambios en /admin/api. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const api = async (path, opts = {}) => {
    const res = await fetch('/admin/api/' + path, { credentials: 'same-origin', ...opts });
    let data = {};
    try { data = await res.json(); } catch { /* respuesta sin JSON */ }
    if (res.status === 401 && path !== 'login') { show('login'); throw new Error(data.error || 'La sesión ha caducado.'); }
    if (!res.ok) throw new Error(data.error || 'Algo ha fallado (' + res.status + ').');
    return data;
  };
  const sendJson = (path, method, body) => api(path, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const say = (el, text, state = '') => { el.textContent = text; el.dataset.state = state; };
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const abs = (u) => (/^(\/|https?:)/.test(u) ? u : '/' + u);

  const notice = $('[data-notice]');
  function show(view) {
    $$('[data-view]').forEach((v) => { v.hidden = v.dataset.view !== view; });
    $$('[data-when="in"]').forEach((v) => { v.hidden = view !== 'app'; });
  }

  /* ---------- estado ---------- */
  let site = { texts: {}, galleries: {}, slots: {} };
  let model = null; // { textGroups, galleries }
  let user = '';

  const LABELS = [
    ['.treat__kind', 'Subtítulo'], ['.treat__lead', 'Entradilla'], ['.treat__label', 'Encabezado'], ['.treat__sign', 'Frase final'],
    ['.ritual__step', 'Paso'], ['.ritual__text', 'Explicación del paso'], ['.qa__q', 'Pregunta'], ['.qa p', 'Respuesta'],
    ['blockquote p', 'Cita'], ['blockquote footer', 'Firma'], ['.creds li', 'Mérito'], ['.eyebrow', 'Etiqueta'],
    ['h1', 'Título principal'], ['h2', 'Título'], ['h3', 'Título'], ['h4', 'Nombre del tratamiento'],
    ['li', 'Punto de la lista'], ['dt', 'Zona'], ['dd', 'Descripción de la zona'],
  ];
  const labelOf = (el) => { for (const [sel, name] of LABELS) if (el.matches(sel)) return name; return 'Párrafo'; };

  const SECTION_NAMES = { inicio: 'Portada', statement: 'Frase de presentación', tratamientos: 'Tratamientos: cabecera y cierre', 'equipo-laser': 'Láser: equipo', margot: 'Sobre mí', videos: 'Vídeos', preguntas: 'Preguntas', consulta: 'Contacto' };

  function buildModel(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const names = {};
    $$('article[data-t]', doc).forEach((a) => {
      const panel = a.closest('[role="tabpanel"]');
      const spec = panel ? norm($('.panel__title', panel)?.textContent) : '';
      names[a.dataset.t] = { name: norm($('h4', a)?.textContent), spec };
    });
    const groups = new Map();
    $$('[data-k]', doc).forEach((el) => {
      const key = el.dataset.k;
      const scope = key.replace(/-\d+$/, '');
      if (!groups.has(scope)) {
        const t = names[scope];
        groups.set(scope, { id: scope, name: t ? `${t.spec} · ${t.name}` : (SECTION_NAMES[scope] || scope), fields: [] });
      }
      groups.get(scope).fields.push({ key, label: labelOf(el), original: norm(el.textContent), long: norm(el.textContent).length > 90 });
    });
    const galleries = $$('[data-gallery-id]', doc).map((g) => {
      const id = g.dataset.galleryId;
      const t = names[id] || { name: id, spec: '' };
      const items = $$('.gallery__item .gallery__open', g).map((b) => {
        const img = $('img', b);
        return b.dataset.video
          ? { type: 'video', full: b.dataset.video, thumb: img ? img.getAttribute('src') : '', alt: img ? img.alt : '' }
          : { type: 'photo', full: b.dataset.full, thumb: img ? img.getAttribute('src') : '', alt: img ? img.alt : '' };
      });
      return { id, name: t.name, spec: t.spec, original: items };
    });
    const slotImg = (sel) => { const i = $(sel, doc); return i ? { type: 'photo', full: i.getAttribute('src'), thumb: i.getAttribute('src'), alt: i.alt } : null; };
    const slots = [
      { id: 'portada', name: 'Foto de portada', slot: true, original: [slotImg('[data-slot="portada"] img')].filter(Boolean), maxSide: 2400, hint: 'Sale arriba del todo, centrada y entera (sin recortes), en PC y en móvil.' },
      { id: 'sobre-mi', name: 'Foto de «Sobre mí»', slot: true, original: [slotImg('[data-slot="sobre-mi"] img')].filter(Boolean), maxSide: 1600, hint: 'Se muestra en vertical (3:4) junto a tu historia.' },
    ];
    return { textGroups: [...groups.values()], galleries, slots };
  }

  /* ---------- arranque ---------- */
  async function start() {
    let st;
    try { st = await api('status'); } catch (e) { notice.hidden = false; notice.textContent = 'El panel no responde todavía. Si acabas de publicar, espera un minuto y recarga.'; show('login'); return; }
    if (!st.configured) {
      notice.hidden = false;
      notice.textContent = 'Falta conectar el almacenamiento (KV llamado MARGOT_KV) en Cloudflare Pages. Hasta entonces la web funciona, pero no se pueden guardar cambios.';
    } else if (!st.hasPassword) {
      notice.hidden = false;
      notice.textContent = 'Falta poner la contraseña inicial (variable ADMIN_PASSWORD) en Cloudflare Pages.';
    }
    if (st.loggedIn) { user = st.user; await enter(); } else show('login');
  }

  async function enter() {
    const [s, html] = await Promise.all([api('site'), fetch('/admin/api/original', { credentials: 'same-origin' }).then((r) => r.text())]);
    site = s;
    model = buildModel(html);
    $('[data-user]').textContent = user;
    $('[data-pass-form]').elements.user.value = user;
    fillGallerySelect();
    fillTextSelect();
    show('app');
  }

  $('[data-login-form]').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target, msg = $('[data-login-msg]'), btn = $('button', f);
    btn.disabled = true; say(msg, 'Comprobando…');
    try {
      const r = await sendJson('login', 'POST', { user: f.user.value, password: f.password.value });
      user = r.user; f.password.value = ''; say(msg, '');
      await enter();
    } catch (err) { say(msg, err.message, 'err'); }
    btn.disabled = false;
  });
  $('[data-logout]').addEventListener('click', async () => { await sendJson('logout', 'POST', {}).catch(() => {}); show('login'); });

  /* ---------- pestañas ---------- */
  $$('[data-tab]').forEach((b) => b.addEventListener('click', () => {
    $$('[data-tab]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    $$('[data-pane]').forEach((p) => { p.hidden = p.dataset.pane !== b.dataset.tab; });
  }));

  /* ---------- fotos y vídeos ---------- */
  const gSelect = $('[data-gallery-select]');
  const gMsg = $('[data-gallery-msg]');
  let currentG = null;

  function fillGallerySelect() {
    gSelect.replaceChildren();
    const og = document.createElement('optgroup'); og.label = 'Fotos principales';
    model.slots.forEach((s) => og.append(new Option(s.name, 'slot:' + s.id)));
    gSelect.append(og);
    const bySpec = new Map();
    model.galleries.forEach((g) => { if (!bySpec.has(g.spec)) bySpec.set(g.spec, []); bySpec.get(g.spec).push(g); });
    bySpec.forEach((list, spec) => {
      const o = document.createElement('optgroup'); o.label = spec || 'Tratamientos';
      list.forEach((g) => {
        const n = itemsOf(g).length;
        o.append(new Option(`${g.name} (${n})`, 'gal:' + g.id));
      });
      gSelect.append(o);
    });
    if (!currentG) currentG = 'gal:' + (model.galleries.find((g) => g.id === 'labios') || model.galleries[0]).id;
    gSelect.value = currentG;
    renderGallery();
  }
  gSelect.addEventListener('change', () => { currentG = gSelect.value; say(gMsg, ''); renderGallery(); });

  const entryOf = (key) => {
    const [kind, id] = key.split(':');
    return kind === 'slot' ? model.slots.find((s) => s.id === id) : model.galleries.find((g) => g.id === id);
  };
  function itemsOf(g) {
    if (g.slot) return site.slots[g.id] ? [site.slots[g.id]] : g.original;
    return Array.isArray(site.galleries[g.id]) ? site.galleries[g.id] : g.original;
  }
  const isChanged = (g) => (g.slot ? Boolean(site.slots[g.id]) : Array.isArray(site.galleries[g.id]));

  function renderGallery() {
    const g = entryOf(currentG);
    const items = itemsOf(g);
    $('[data-gallery-title]').textContent = g.slot ? g.name : `${g.spec} · ${g.name}`;
    $('[data-gallery-hint]').textContent = g.slot
      ? g.hint + ' Al subir una nueva, sustituye a la actual.'
      : `${items.length} ${items.length === 1 ? 'elemento' : 'elementos'}. Solo fotos de este tratamiento. El orden de aquí es el orden de la web.`;
    $('[data-upload-label]').textContent = g.slot ? 'Cambiar foto' : 'Añadir fotos o vídeos';
    const input = $('[data-upload]');
    input.multiple = !g.slot;
    input.accept = g.slot ? 'image/*' : 'image/*,video/mp4,video/quicktime,video/webm';
    $('[data-gallery-reset]').hidden = !isChanged(g);
    $('[data-gallery-reset]').textContent = g.slot ? 'Volver a la foto original' : 'Volver a las fotos originales';
    const ul = $('[data-tiles]');
    ul.replaceChildren();
    $('[data-tiles-empty]').hidden = items.length > 0;
    items.forEach((it, i) => {
      const li = document.createElement('li');
      li.className = 'tile' + (g.id === 'portada' ? ' tile--wide' : '');
      const box = document.createElement('div'); box.className = 'tile__img';
      if (it.thumb) { const im = new Image(); im.src = abs(it.thumb); im.alt = it.alt || ''; im.loading = 'lazy'; box.append(im); }
      if (it.type === 'video') { const b = document.createElement('span'); b.className = 'tile__badge'; b.textContent = 'Vídeo'; box.append(b); }
      li.append(box);
      if (!g.slot) {
        const bar = document.createElement('div'); bar.className = 'tile__actions';
        const left = Object.assign(document.createElement('button'), { type: 'button', textContent: '‹', title: 'Mover antes', disabled: i === 0 });
        left.setAttribute('aria-label', 'Mover antes');
        const del = Object.assign(document.createElement('button'), { type: 'button', textContent: 'Quitar', className: 'del' });
        const right = Object.assign(document.createElement('button'), { type: 'button', textContent: '›', title: 'Mover después', disabled: i === items.length - 1 });
        right.setAttribute('aria-label', 'Mover después');
        left.onclick = () => move(i, -1);
        right.onclick = () => move(i, 1);
        del.onclick = () => { if (confirm('¿Quitar esta ' + (it.type === 'video' ? 'vídeo' : 'foto') + ' de la web?')) remove(i); };
        bar.append(left, del, right);
        li.append(bar);
      }
      ul.append(li);
    });
  }

  async function saveGallery(g, items, okText) {
    say(gMsg, 'Guardando…');
    try {
      if (g.slot) {
        const r = await sendJson('slot/' + g.id, 'PUT', { item: items[0] || null });
        if (r.item) site.slots[g.id] = r.item; else delete site.slots[g.id];
      } else {
        const r = await sendJson('gallery/' + g.id, 'PUT', { items });
        site.galleries[g.id] = r.items;
      }
      say(gMsg, okText + ' Ya se ve en la web (puede tardar hasta un minuto).', 'ok');
    } catch (err) { say(gMsg, err.message, 'err'); }
    fillGallerySelect();
  }
  function move(i, d) {
    const g = entryOf(currentG); const items = [...itemsOf(g)];
    const j = i + d; if (j < 0 || j >= items.length) return;
    [items[i], items[j]] = [items[j], items[i]];
    saveGallery(g, items, 'Orden guardado.');
  }
  function remove(i) {
    const g = entryOf(currentG); const items = [...itemsOf(g)];
    items.splice(i, 1);
    saveGallery(g, items, 'Quitada.');
  }
  $('[data-gallery-reset]').addEventListener('click', async () => {
    const g = entryOf(currentG);
    if (!confirm('¿Volver a dejar este apartado como estaba al principio?')) return;
    say(gMsg, 'Guardando…');
    try {
      if (g.slot) { await sendJson('slot/' + g.id, 'PUT', { item: null }); delete site.slots[g.id]; }
      else { await sendJson('gallery/' + g.id, 'PUT', { items: [], reset: true }); delete site.galleries[g.id]; }
      say(gMsg, 'Restaurado.', 'ok');
    } catch (err) { say(gMsg, err.message, 'err'); }
    fillGallerySelect();
  });

  /* subida: las fotos se reducen en el propio móvil u ordenador antes de enviarlas */
  const canvasBlob = (c, q = 0.86) => new Promise((res) => c.toBlob((b) => {
    if (b && b.type === 'image/webp') return res(b);
    c.toBlob(res, 'image/jpeg', q);
  }, 'image/webp', q));

  async function decode(file) {
    if (window.createImageBitmap) {
      try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch { /* se prueba con <img> */ }
    }
    const url = URL.createObjectURL(file);
    try {
      const img = new Image(); img.src = url; await img.decode();
      return img;
    } finally { setTimeout(() => URL.revokeObjectURL(url), 1000); }
  }
  function draw(src, w, h, cover) {
    const sw = src.width || src.videoWidth, sh = src.height || src.videoHeight;
    const c = document.createElement('canvas');
    if (cover) {
      c.width = w; c.height = h;
      const s = Math.max(w / sw, h / sh);
      const dw = sw * s, dh = sh * s;
      c.getContext('2d').drawImage(src, (w - dw) / 2, (h - dh) / 2, dw, dh);
    } else {
      const s = Math.min(1, w / Math.max(sw, sh));
      c.width = Math.round(sw * s); c.height = Math.round(sh * s);
      c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
    }
    return c;
  }
  async function upload(blob) {
    const r = await api('media', { method: 'POST', headers: { 'content-type': blob.type || 'application/octet-stream' }, body: blob });
    return r.url;
  }
  async function videoPoster(file) {
    const url = URL.createObjectURL(file);
    try {
      const v = document.createElement('video');
      v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = url;
      await new Promise((res, rej) => { v.onloadeddata = res; v.onerror = rej; setTimeout(rej, 8000); });
      v.currentTime = Math.min(0.5, (v.duration || 1) / 3);
      await new Promise((res) => { v.onseeked = res; setTimeout(res, 3000); });
      return await canvasBlob(draw(v, 480, 600, true));
    } catch { return null; } finally { URL.revokeObjectURL(url); }
  }

  $('[data-upload]').addEventListener('change', async (e) => {
    const files = [...e.target.files];
    e.target.value = '';
    if (!files.length) return;
    const g = entryOf(currentG);
    const label = $('.btn--file');
    label.classList.add('is-busy');
    const added = [];
    let failed = 0;
    for (const [n, file] of files.entries()) {
      say(gMsg, `Subiendo ${n + 1} de ${files.length}…`);
      try {
        if (file.type.startsWith('video/')) {
          if (file.size > 25 * 1024 * 1024) throw new Error(`«${file.name}» pesa más de 25 MB. Recórtalo o pásalo por WhatsApp para que se comprima.`);
          const poster = await videoPoster(file);
          const full = await upload(file);
          const thumb = poster ? await upload(poster) : '';
          added.push({ type: 'video', full, thumb, alt: 'Vídeo de ' + g.name.toLowerCase() });
        } else {
          let img;
          try { img = await decode(file); } catch { throw new Error(`No se puede abrir «${file.name}». Si es HEIC del iPhone, haz una captura o expórtala como JPG.`); }
          const full = await upload(await canvasBlob(draw(img, g.maxSide || 1600, 0, false)));
          const thumb = g.slot ? full : await upload(await canvasBlob(draw(img, 480, 600, true), 0.8));
          added.push({ type: 'photo', full, thumb, alt: g.slot ? 'Margot Ibáñez' : `${g.name}, trabajo de Margot Ibáñez` });
        }
      } catch (err) { failed++; say(gMsg, err.message, 'err'); await new Promise((r) => setTimeout(r, 1500)); }
    }
    label.classList.remove('is-busy');
    if (!added.length) return;
    const items = g.slot ? [added[added.length - 1]] : [...added, ...itemsOf(g)];
    await saveGallery(g, items, `${added.length} ${added.length === 1 ? 'archivo subido' : 'archivos subidos'}${failed ? ` (${failed} no se pudieron subir)` : ''}.`);
  });

  /* ---------- textos ---------- */
  const tSelect = $('[data-text-select]');
  const tMsg = $('[data-text-msg]');
  function fillTextSelect() {
    const keep = tSelect.value;
    tSelect.replaceChildren();
    model.textGroups.forEach((grp) => {
      const changed = grp.fields.some((f) => Object.prototype.hasOwnProperty.call(site.texts, f.key));
      tSelect.append(new Option(grp.name + (changed ? '  · cambiado' : ''), grp.id));
    });
    tSelect.value = keep || model.textGroups[0].id;
    renderTexts();
  }
  tSelect.addEventListener('change', () => { say(tMsg, ''); renderTexts(); });

  function autosize(t) { t.style.height = 'auto'; t.style.height = t.scrollHeight + 2 + 'px'; }
  function renderTexts() {
    const grp = model.textGroups.find((g) => g.id === tSelect.value);
    $('[data-text-title]').textContent = grp.name;
    const box = $('[data-text-fields]');
    box.replaceChildren();
    grp.fields.forEach((f) => {
      const has = Object.prototype.hasOwnProperty.call(site.texts, f.key);
      const wrap = document.createElement('div');
      wrap.className = 'field' + (has ? ' is-changed' : '');
      const row = document.createElement('div'); row.className = 'field__row';
      const lab = document.createElement('label'); lab.htmlFor = 'k-' + f.key; lab.textContent = f.label;
      row.append(lab);
      const reset = Object.assign(document.createElement('button'), { type: 'button', className: 'link field__reset', textContent: 'Volver al original', hidden: !has });
      row.append(reset);
      const ta = document.createElement('textarea');
      ta.id = 'k-' + f.key; ta.name = f.key; ta.rows = f.long ? 4 : 1;
      ta.value = has ? site.texts[f.key] : f.original;
      ta.dataset.original = f.original;
      ta.addEventListener('input', () => { autosize(ta); wrap.classList.toggle('is-changed', norm(ta.value) !== f.original); });
      reset.onclick = () => { ta.value = f.original; autosize(ta); wrap.classList.remove('is-changed'); };
      wrap.append(row, ta);
      box.append(wrap);
      requestAnimationFrame(() => autosize(ta));
    });
  }
  $('[data-text-form]').addEventListener('submit', async (e) => {
    e.preventDefault();
    const texts = {};
    $$('textarea', e.target).forEach((ta) => {
      const v = ta.value.replace(/\s+/g, ' ').trim();
      texts[ta.name] = !v || v === ta.dataset.original ? null : v;
    });
    const btn = $('button[type="submit"]', e.target);
    btn.disabled = true; say(tMsg, 'Guardando…');
    try {
      const r = await sendJson('texts', 'PUT', { texts });
      site.texts = r.texts;
      say(tMsg, 'Guardado. Ya se ve en la web (puede tardar hasta un minuto).', 'ok');
      fillTextSelect();
    } catch (err) { say(tMsg, err.message, 'err'); }
    btn.disabled = false;
  });

  /* ---------- cuenta ---------- */
  $('[data-pass-form]').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target, msg = $('[data-pass-msg]');
    if (f.password.value !== f.password2.value) return say(msg, 'Las dos contraseñas nuevas no coinciden.', 'err');
    try {
      const r = await sendJson('password', 'POST', { current: f.current.value, user: f.user.value, password: f.password.value });
      user = r.user; $('[data-user]').textContent = user;
      f.current.value = f.password.value = f.password2.value = '';
      say(msg, 'Guardado. A partir de ahora entra con el usuario «' + user + '» y la contraseña nueva.', 'ok');
    } catch (err) { say(msg, err.message, 'err'); }
  });

  start();
})();
