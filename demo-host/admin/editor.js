/* Modo edición de la web de Margot Ibáñez.
 * Solo se carga cuando hay una sesión iniciada (lo añade el servidor). Pone un lápiz en cada texto,
 * herramientas en cada galería y en las fotos principales, y guarda cada cambio en /admin/api. */
(() => {
  const root = document.documentElement;
  root.setAttribute('data-editing', '');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const h = (tag, props = {}, ...kids) => { const el = Object.assign(document.createElement(tag), props); kids.forEach((k) => el.append(k)); return el; };

  const FONTS = {
    montserrat: ['Montserrat', '"Montserrat", "Montserrat Fallback", sans-serif'],
    raleway: ['Raleway', '"Raleway", "Montserrat Fallback", sans-serif'],
    lora: ['Lora', '"Lora", Georgia, serif'],
    playfair: ['Playfair Display', '"Playfair Display", Georgia, serif'],
    cormorant: ['Cormorant Garamond', '"Cormorant Garamond", Georgia, serif'],
  };
  const COLORS = { negro: '#2F2A25', gris: '#6B6259', topo: '#8A7F72', dorado: '#A9875A', blanco: '#FFFFFF' };

  /* ---------- API ---------- */
  async function api(path, opts = {}) {
    const res = await fetch('/admin/api/' + path, { credentials: 'same-origin', ...opts });
    let data = {};
    try { data = await res.json(); } catch { /* sin JSON */ }
    if (res.status === 401) { toast('La sesión ha caducado. Vuelve a entrar.', 'err'); setTimeout(() => { location.href = '/admin/'; }, 1500); }
    if (!res.ok) throw new Error(data.error || 'No se ha podido guardar (' + res.status + ').');
    return data;
  }
  const sendJson = (path, method, body) => api(path, { method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

  /* ---------- avisos ---------- */
  const toastEl = h('div', { className: 'ed-toast', role: 'status' });
  let toastT;
  function toast(text, state = '') {
    toastEl.textContent = text; toastEl.dataset.state = state; toastEl.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), state === 'err' ? 6000 : 2600);
  }

  /* ---------- estado ---------- */
  let site = { texts: {}, galleries: {}, slots: {}, global: { scale: 1, treatAlign: '', treatFont: '' } };
  const scaleNow = () => (site.global && site.global.scale) || 1;
  const original = { texts: {}, galleries: {}, names: {} };

  function parseOriginal(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    $$('[data-k]', doc).forEach((el) => { original.texts[el.dataset.k] = el.innerHTML.trim(); });
    $$('article[data-t]', doc).forEach((a) => { original.names[a.dataset.t] = ($('h4', a)?.textContent || a.dataset.t).trim(); });
    $$('[data-gallery-id]', doc).forEach((g) => {
      original.galleries[g.dataset.galleryId] = $$('.gallery__item .gallery__open', g).map((b) => {
        const img = $('img', b);
        return b.dataset.video
          ? { type: 'video', full: b.dataset.video, thumb: img ? img.getAttribute('src') : '', alt: img ? img.alt : '' }
          : { type: 'photo', full: b.dataset.full, thumb: img ? img.getAttribute('src') : '', alt: img ? img.alt : '' };
      });
    });
  }

  /* ---------- barra inferior ---------- */
  const viewBtn = h('button', { type: 'button', textContent: 'Vista previa' });
  viewBtn.setAttribute('aria-pressed', 'false');
  const bar = h('div', { className: 'ed-bar' },
    h('span', { className: 'ed-bar__label', textContent: 'Modo edición' }),
    viewBtn,
    h('button', { type: 'button', textContent: 'Toda la web', onclick: () => openGlobal() }),
    h('a', { href: '/admin/', textContent: 'Cuenta' }),
    h('button', { type: 'button', textContent: 'Salir', onclick: async () => { await sendJson('logout', 'POST', {}).catch(() => {}); location.href = '/'; } }),
  );
  viewBtn.addEventListener('click', () => {
    const on = root.hasAttribute('data-editing');
    if (on) { finishText(true); root.removeAttribute('data-editing'); } else root.setAttribute('data-editing', '');
    viewBtn.setAttribute('aria-pressed', String(on));
    viewBtn.textContent = on ? 'Volver a editar' : 'Vista previa';
    $$('[data-gallery]').forEach(syncGalleryVisibility);
    schedule();
  });

  /* ---------- lápices ---------- */
  const layer = h('div', { className: 'ed-layer', 'aria-hidden': 'false' });
  const pens = new Map();
  function buildPens() {
    $$('[data-k]').forEach((el) => {
      const b = h('button', { type: 'button', className: 'ed-pen', title: 'Editar este texto' });
      b.setAttribute('aria-label', 'Editar: ' + el.textContent.trim().slice(0, 40));
      b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); startText(el); });
      layer.append(b);
      pens.set(el, b);
    });
    markChanged();
  }
  function markChanged() { pens.forEach((b, el) => b.classList.toggle('is-changed', has(site.texts, el.dataset.k))); }
  let raf = 0;
  function schedule() { if (!raf) raf = requestAnimationFrame(place); }
  function place() {
    raf = 0;
    const sx = window.scrollX, sy = window.scrollY;
    pens.forEach((b, el) => {
      const r = el.getBoundingClientRect();
      const visible = r.width > 0 && r.height > 0 && !el.closest('[hidden]') && el !== activeEl;
      if (b.hidden === visible) b.hidden = !visible;
      if (visible) {
        b.style.left = Math.min(r.right + sx + 6, document.documentElement.clientWidth + sx - 18) + 'px';
        b.style.top = r.top + sy + 2 + 'px';
      }
    });
  }

  /* ---------- edición de textos ---------- */
  const tools = h('div', { className: 'ed-tools', hidden: true });
  const fontSel = h('select', { title: 'Tipo de letra' });
  fontSel.append(new Option('Letra original', ''));
  Object.entries(FONTS).forEach(([k, [name]]) => { const o = new Option(name, k); o.style.fontFamily = FONTS[k][1]; fontSel.append(o); });
  const sizeOut = h('span', { className: 'ed-size', textContent: '100%' });
  const btn = (cls, txt, title) => { const b = h('button', { type: 'button', className: cls, textContent: txt, title }); b.setAttribute('aria-label', title); b.setAttribute('aria-pressed', 'false'); return b; };
  const bB = btn('ed-b', 'B', 'Negrita'), bI = btn('ed-i', 'I', 'Cursiva'), bU = btn('ed-u', 'U', 'Subrayado');
  const aL = btn('', '⟸', 'Alinear a la izquierda'), aC = btn('', '≡', 'Centrar'), aR = btn('', '⟹', 'Alinear a la derecha'), aJ = btn('', '≣', 'Justificar');
  aL.innerHTML = alignSvg('M4 6h16M4 10h10M4 14h16M4 18h10'); aC.innerHTML = alignSvg('M4 6h16M7 10h10M4 14h16M7 18h10'); aR.innerHTML = alignSvg('M4 6h16M10 10h10M4 14h16M10 18h10'); aJ.innerHTML = alignSvg('M4 6h16M4 10h16M4 14h16M4 18h16');
  function alignSvg(d) { return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="${d}"/></svg>`; }
  const swatches = [['', 'Color original'], ...Object.entries(COLORS).map(([k]) => [k, 'Color ' + k])].map(([k, title]) => {
    const b = btn('ed-sw' + (k ? '' : ' ed-sw--none'), '', title);
    if (k) b.style.background = COLORS[k];
    b.dataset.c = k;
    return b;
  });
  const bOrig = h('button', { type: 'button', className: 'ed-link', textContent: 'Original' });
  const bCancel = h('button', { type: 'button', className: 'ed-link', textContent: 'Cancelar' });
  const bSave = h('button', { type: 'button', className: 'ed-save', textContent: 'Guardar' });
  tools.append(
    h('div', { className: 'ed-tools__group' }, fontSel),
    h('div', { className: 'ed-tools__group' }, btn('', '−', 'Más pequeña'), sizeOut, btn('', '+', 'Más grande')),
    h('div', { className: 'ed-tools__group' }, bB, bI, bU),
    h('div', { className: 'ed-tools__group' }, aL, aC, aR, aJ),
    h('div', { className: 'ed-tools__group' }, ...swatches),
    h('div', { className: 'ed-tools__group' }, bOrig, bCancel, bSave),
    h('p', { className: 'ed-tools__hint', textContent: 'Escribe directamente sobre el texto. Si seleccionas solo unas palabras, la negrita, cursiva o subrayado se aplica a esas palabras; si no, a todo el texto.' }),
  );
  const [bMinus, , bPlus] = tools.children[1].children;

  let activeEl = null, snapshot = null, st = {};

  function styleCss(s) {
    const p = [];
    if (s.f && FONTS[s.f]) p.push(`font-family:${FONTS[s.f][1]}`);
    if (s.z && s.z !== 1) p.push(`zoom:${Math.round(s.z * scaleNow() * 1000) / 1000}`);
    if (s.b !== undefined) p.push(`font-weight:${s.b ? 700 : 400}`);
    if (s.i !== undefined) p.push(`font-style:${s.i ? 'italic' : 'normal'}`);
    if (s.u) p.push('text-decoration:underline');
    if (s.a) p.push(`text-align:${s.a}`);
    if (s.c && COLORS[s.c]) p.push(`color:${COLORS[s.c]}`);
    return p.join(';');
  }
  function applyStyle() {
    const css = styleCss(st);
    if (css) activeEl.setAttribute('style', css); else activeEl.removeAttribute('style');
    fontSel.value = st.f || '';
    sizeOut.textContent = Math.round((st.z || 1) * 100) + '%';
    const cs = getComputedStyle(activeEl);
    bB.setAttribute('aria-pressed', String(st.b !== undefined ? st.b : Number(cs.fontWeight) >= 600));
    bI.setAttribute('aria-pressed', String(st.i !== undefined ? st.i : cs.fontStyle === 'italic'));
    bU.setAttribute('aria-pressed', String(Boolean(st.u)));
    [[aL, 'left'], [aC, 'center'], [aR, 'right'], [aJ, 'justify']].forEach(([b, v]) => b.setAttribute('aria-pressed', String(st.a === v)));
    swatches.forEach((b) => b.setAttribute('aria-pressed', String((st.c || '') === b.dataset.c)));
    schedule();
  }

  function startText(el) {
    if (activeEl === el) return;
    if (activeEl) finishText(false, true);
    activeEl = el;
    snapshot = { html: el.innerHTML, style: el.getAttribute('style') };
    const saved = site.texts[el.dataset.k];
    st = saved && typeof saved === 'object' && saved.s ? { ...saved.s } : {};
    el.classList.add('ed-active');
    el.contentEditable = 'true';
    el.spellcheck = true;
    tools.hidden = false;
    applyStyle();
    el.focus({ preventScroll: true });
    const r = el.getBoundingClientRect();
    // que el texto quede justo debajo de la barra de formato, visible mientras se escribe
    if (r.top < tools.offsetHeight + 16 || r.top > innerHeight * 0.55) window.scrollBy({ top: r.top - tools.offsetHeight - 24, behavior: 'instant' });
  }

  function cleanHtml(html) { return html.replace(/​/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }

  async function finishText(cancel, autosave) {
    if (!activeEl) return;
    const el = activeEl;
    const k = el.dataset.k;
    activeEl = null;
    el.contentEditable = 'false';
    el.removeAttribute('contenteditable');
    el.classList.remove('ed-active');
    tools.hidden = true;
    if (cancel) {
      el.innerHTML = snapshot.html;
      if (snapshot.style) el.setAttribute('style', snapshot.style); else el.removeAttribute('style');
      schedule();
      return;
    }
    const html = cleanHtml(el.innerHTML);
    const sameText = html === cleanHtml(original.texts[k] || '');
    const style = Object.keys(st).length ? { ...st } : null;
    const value = sameText && !style ? null : { h: sameText ? null : html, s: style };
    const before = has(site.texts, k) ? JSON.stringify(site.texts[k]) : 'null';
    if (JSON.stringify(value) === before) { schedule(); return; }
    try {
      const r = await sendJson('texts', 'PUT', { texts: { [k]: value } });
      site.texts = r.texts;
      const v = site.texts[k];
      if (v && typeof v === 'object' && v.h != null) el.innerHTML = v.h; // versión limpia del servidor
      toast(autosave ? 'Texto anterior guardado.' : 'Guardado. Ya se ve así en la web.', 'ok');
    } catch (err) {
      toast(err.message, 'err');
    }
    markChanged();
    schedule();
  }

  fontSel.addEventListener('change', () => { if (fontSel.value) st.f = fontSel.value; else delete st.f; applyStyle(); activeEl.focus(); });
  const zoomBy = (d) => { const z = Math.min(3, Math.max(0.6, Math.round(((st.z || 1) + d) * 100) / 100)); if (z === 1) delete st.z; else st.z = z; applyStyle(); };
  bMinus.addEventListener('click', () => zoomBy(-0.05));
  bPlus.addEventListener('click', () => zoomBy(0.05));
  const selectionInside = () => { const s = getSelection(); return s && s.rangeCount && !s.isCollapsed && activeEl && activeEl.contains(s.anchorNode) && activeEl.contains(s.focusNode); };
  const inline = (cmd, key) => {
    if (selectionInside()) { document.execCommand('styleWithCSS', false, false); document.execCommand(cmd); return; }
    const on = { b: bB, i: bI, u: bU }[key];
    const pressed = on.getAttribute('aria-pressed') === 'true';
    if (key === 'u') { if (pressed) delete st.u; else st.u = true; } else st[key] = !pressed;
    applyStyle();
  };
  // que los botones no quiten la selección del texto
  tools.addEventListener('mousedown', (e) => { if (e.target.closest('button')) e.preventDefault(); });
  bB.addEventListener('click', () => inline('bold', 'b'));
  bI.addEventListener('click', () => inline('italic', 'i'));
  bU.addEventListener('click', () => inline('underline', 'u'));
  [[aL, 'left'], [aC, 'center'], [aR, 'right'], [aJ, 'justify']].forEach(([b, v]) => b.addEventListener('click', () => { if (st.a === v) delete st.a; else st.a = v; applyStyle(); }));
  swatches.forEach((b) => b.addEventListener('click', () => { if (b.dataset.c) st.c = b.dataset.c; else delete st.c; applyStyle(); }));
  bOrig.addEventListener('click', () => { activeEl.innerHTML = original.texts[activeEl.dataset.k] || activeEl.innerHTML; st = {}; applyStyle(); });
  bCancel.addEventListener('click', () => finishText(true));
  bSave.addEventListener('click', () => finishText(false));

  document.addEventListener('keydown', (e) => {
    if (!activeEl || !activeEl.contains(e.target)) return;
    if (e.key === 'Escape') { e.preventDefault(); finishText(true); }
    else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); finishText(false); }
    else if (e.key === 'Enter') { e.preventDefault(); document.execCommand('insertLineBreak'); }
    else if (e.key === ' ' && activeEl.closest('summary, button')) { e.preventDefault(); document.execCommand('insertText', false, ' '); }
  });
  document.addEventListener('paste', (e) => {
    if (!activeEl || !activeEl.contains(e.target)) return;
    e.preventDefault();
    document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain').replace(/\s+/g, ' '));
  });
  // en modo edición, pulsar un texto lo edita (y no abre enlaces, preguntas ni pestañas)
  document.addEventListener('click', (e) => {
    if (!root.hasAttribute('data-editing')) return;
    const el = e.target.closest('[data-k]');
    if (el) { e.preventDefault(); if (el !== activeEl) { e.stopPropagation(); startText(el); } return; }
    if (activeEl && !e.target.closest('.ed-tools, .ed-bar')) finishText(false);
  }, true);
  addEventListener('beforeunload', (e) => { if (activeEl) { e.preventDefault(); e.returnValue = ''; } });

  /* ---------- subidas (las fotos se reducen en el propio dispositivo) ---------- */
  const canvasBlob = (c, q = 0.86) => new Promise((res) => c.toBlob((b) => {
    if (b && b.type === 'image/webp') return res(b);
    c.toBlob(res, 'image/jpeg', q);
  }, 'image/webp', q));
  async function decode(file) {
    if (window.createImageBitmap) { try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch { /* se prueba con <img> */ } }
    const url = URL.createObjectURL(file);
    try { const img = new Image(); img.src = url; await img.decode(); return img; } finally { setTimeout(() => URL.revokeObjectURL(url), 1000); }
  }
  function draw(src, w, hh, cover) {
    const sw = src.width || src.videoWidth, sh = src.height || src.videoHeight;
    const c = document.createElement('canvas');
    if (cover) {
      c.width = w; c.height = hh;
      const s = Math.max(w / sw, hh / sh);
      c.getContext('2d').drawImage(src, (w - sw * s) / 2, (hh - sh * s) / 2, sw * s, sh * s);
    } else {
      const s = Math.min(1, w / Math.max(sw, sh));
      c.width = Math.round(sw * s); c.height = Math.round(sh * s);
      c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
    }
    return c;
  }
  const upload = async (blob) => (await api('media', { method: 'POST', headers: { 'content-type': blob.type || 'application/octet-stream' }, body: blob })).url;
  async function videoPoster(file) {
    const url = URL.createObjectURL(file);
    try {
      const v = h('video', { muted: true, playsInline: true, preload: 'auto', src: url });
      await new Promise((res, rej) => { v.onloadeddata = res; v.onerror = rej; setTimeout(rej, 8000); });
      v.currentTime = Math.min(0.5, (v.duration || 1) / 3);
      await new Promise((res) => { v.onseeked = res; setTimeout(res, 3000); });
      return await canvasBlob(draw(v, 480, 600, true));
    } catch { return null; } finally { URL.revokeObjectURL(url); }
  }
  async function processFiles(files, { name, slot, maxSide }, say) {
    const added = [];
    let failed = 0;
    for (const [n, file] of files.entries()) {
      say(`Subiendo ${n + 1} de ${files.length}…`);
      try {
        if (file.type.startsWith('video/')) {
          if (slot) throw new Error('Aquí solo van fotos.');
          if (file.size > 25 * 1024 * 1024) throw new Error(`«${file.name}» pesa más de 25 MB. Recórtalo o pásalo por WhatsApp para que se comprima.`);
          const poster = await videoPoster(file);
          const full = await upload(file);
          added.push({ type: 'video', full, thumb: poster ? await upload(poster) : '', alt: 'Vídeo de ' + name.toLowerCase() });
        } else {
          let img;
          try { img = await decode(file); } catch { throw new Error(`No se puede abrir «${file.name}». Si es HEIC del iPhone, haz una captura o expórtala como JPG.`); }
          const full = await upload(await canvasBlob(draw(img, maxSide || 1600, 0, false)));
          const thumb = slot ? full : await upload(await canvasBlob(draw(img, 480, 600, true), 0.8));
          added.push({ type: 'photo', full, thumb, alt: slot ? 'Margot Ibáñez' : `${name}, trabajo de Margot Ibáñez` });
        }
      } catch (err) { failed++; toast(err.message, 'err'); }
    }
    return { added, failed };
  }

  /* ---------- galerías ---------- */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function itemHtml(it) {
    const alt = esc(it.alt || '');
    if (it.type === 'video') {
      const poster = it.thumb ? `<img src="${esc(it.thumb)}" width="480" height="600" alt="${alt}" loading="lazy" decoding="async">` : '';
      return `<figure class="gallery__item gallery__item--video"><button class="gallery__open" type="button" data-video="${esc(it.full)}" aria-label="Ver vídeo"${poster ? '' : ' data-noposter'}>${poster}<span class="gallery__play" aria-hidden="true"></span></button></figure>`;
    }
    return `<figure class="gallery__item"><button class="gallery__open" type="button" data-full="${esc(it.full)}" aria-label="Ampliar foto"><img src="${esc(it.thumb || it.full)}" width="480" height="600" alt="${alt}" loading="lazy" decoding="async"></button></figure>`;
  }
  const itemsOf = (id) => (Array.isArray(site.galleries[id]) ? site.galleries[id] : original.galleries[id] || []);
  function syncGalleryVisibility(g) {
    const hasItems = Boolean($('.gallery__item', g));
    g.hidden = !hasItems && !root.hasAttribute('data-editing');
  }

  function setupGallery(g) {
    const id = g.dataset.galleryId;
    const name = original.names[id] || id;
    const msg = h('span', { className: 'ed-msg' });
    const input = h('input', { type: 'file', multiple: true, accept: 'image/*,video/mp4,video/quicktime,video/webm' });
    const addBtn = h('label', { className: 'ed-btn' }, 'Añadir fotos o vídeos', input);
    const resetBtn = h('button', { type: 'button', className: 'ed-btn ed-btn--line', textContent: 'Volver a las originales' });
    const tools = h('div', { className: 'ed-gtools' }, h('span', {}, 'Galería de ', h('strong', { textContent: name })), addBtn, resetBtn, msg);
    g.prepend(tools);
    const grid = $('[data-gallery-grid]', g);

    const render = () => {
      const items = itemsOf(id);
      grid.innerHTML = items.map(itemHtml).join('') || '';
      if (!items.length) grid.append(h('p', { className: 'ed-empty', textContent: 'Todavía no hay fotos de ' + name.toLowerCase() + '. Pulsa «Añadir fotos o vídeos».' }));
      $$('.gallery__item', grid).forEach((fig, i) => {
        const bar = h('div', { className: 'ed-item' });
        const mk = (txt, label, fn, cls = '') => { const b = h('button', { type: 'button', textContent: txt, className: cls }); b.setAttribute('aria-label', label); b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); fn(); }); return b; };
        const left = mk('‹', 'Mover antes', () => save(move(i, -1), 'Orden guardado.'));
        const right = mk('›', 'Mover después', () => save(move(i, 1), 'Orden guardado.'));
        const del = mk('Quitar', 'Quitar de la web', () => { if (confirm('¿Quitar esta ' + (items[i].type === 'video' ? 'vídeo' : 'foto') + ' de la web?')) { const l = [...items]; l.splice(i, 1); save(l, 'Quitada.'); } }, 'ed-del');
        left.disabled = i === 0; right.disabled = i === items.length - 1;
        bar.append(left, del, right);
        fig.append(bar);
      });
      resetBtn.hidden = !Array.isArray(site.galleries[id]);
      syncGalleryVisibility(g);
      schedule();
    };
    const move = (i, d) => { const l = [...itemsOf(id)]; const j = i + d; [l[i], l[j]] = [l[j], l[i]]; return l; };
    async function save(items, ok, reset = false) {
      g.classList.add('ed-busy');
      try {
        const r = await sendJson('gallery/' + id, 'PUT', { items, reset });
        if (r.items) site.galleries[id] = r.items; else delete site.galleries[id];
        toast(ok, 'ok');
      } catch (err) { toast(err.message, 'err'); }
      g.classList.remove('ed-busy');
      msg.textContent = '';
      render();
    }
    input.addEventListener('change', async () => {
      const files = [...input.files]; input.value = '';
      if (!files.length) return;
      g.classList.add('ed-busy');
      const { added, failed } = await processFiles(files, { name }, (t) => { msg.textContent = t; });
      g.classList.remove('ed-busy');
      if (!added.length) { msg.textContent = ''; return; }
      await save([...added, ...itemsOf(id)], `${added.length} ${added.length === 1 ? 'archivo añadido' : 'archivos añadidos'}${failed ? ` (${failed} con error)` : ''}.`);
    });
    resetBtn.addEventListener('click', () => { if (confirm('¿Dejar esta galería como estaba al principio?')) save([], 'Galería restaurada.', true); });
    render();
  }

  /* ---------- fotos principales ---------- */
  function setupSlot(fig) {
    const id = fig.dataset.slot;
    const cfg = id === 'portada' ? { name: 'portada', slot: true, maxSide: 2400, label: 'Cambiar foto de portada' } : { name: 'foto', slot: true, maxSide: 1600, label: 'Cambiar foto' };
    const origHtml = fig.innerHTML, origClass = fig.className;
    const input = h('input', { type: 'file', accept: 'image/*' });
    const reset = h('button', { type: 'button', className: 'ed-btn ed-btn--line', textContent: 'Foto original' });
    const box = h('div', { className: 'ed-slot' }, h('label', { className: 'ed-btn' }, cfg.label, input), reset);
    const paint = () => {
      const it = site.slots[id];
      $$('.ed-slot', fig).forEach((n) => n.remove());
      if (id === 'portada') {
        if (it) { fig.className = 'hero__photo is-custom'; fig.innerHTML = `<img src="${esc(it.full)}" alt="${esc(it.alt || 'Margot Ibáñez')}">`; }
        else { fig.className = origClass.replace(' is-custom', ''); fig.innerHTML = origHtml; }
      } else {
        const img = $('img', fig);
        if (it) { img.src = it.full; img.removeAttribute('srcset'); }
        else { const tmp = h('div'); tmp.innerHTML = origHtml; const o = $('img', tmp); if (o) { img.src = o.getAttribute('src'); if (o.getAttribute('srcset')) img.setAttribute('srcset', o.getAttribute('srcset')); } }
      }
      reset.hidden = !it;
      fig.append(box);
      schedule();
    };
    input.addEventListener('change', async () => {
      const files = [...input.files]; input.value = '';
      if (!files.length) return;
      fig.classList.add('ed-busy');
      const { added } = await processFiles(files.slice(0, 1), cfg, (t) => toast(t));
      if (added.length) {
        try { const r = await sendJson('slot/' + id, 'PUT', { item: added[0] }); site.slots[id] = r.item; toast('Foto cambiada.', 'ok'); } catch (err) { toast(err.message, 'err'); }
      }
      fig.classList.remove('ed-busy');
      paint();
    });
    reset.addEventListener('click', async () => {
      if (!confirm('¿Volver a poner la foto original?')) return;
      try { await sendJson('slot/' + id, 'PUT', { item: null }); delete site.slots[id]; toast('Foto original recuperada.', 'ok'); } catch (err) { toast(err.message, 'err'); }
      paint();
    });
    paint();
  }

  /* ---------- ajustes de toda la web ---------- */
  function globalCss(g) {
    const p = [];
    if (g.scale && g.scale !== 1) p.push(`[data-k],.brand,.nav__menu,.nav__toggle,.tabs,.btn,.gallery__more,.field label,.field input,.field select,.field textarea,.footer__inner{zoom:${g.scale}}`);
    if (g.treatFont && FONTS[g.treatFont]) p.push(`.treat [data-k]{font-family:${FONTS[g.treatFont][1]}}`);
    if (g.treatAlign) p.push(`.treat__body [data-k]{text-align:${g.treatAlign};${g.treatAlign === 'justify' ? 'hyphens:auto;-webkit-hyphens:auto;' : ''}}`);
    return p.join('\n');
  }
  function paintGlobal() {
    let tag = document.getElementById('site-global');
    if (!tag) { tag = h('style', { id: 'site-global' }); document.head.append(tag); }
    tag.textContent = globalCss(site.global);
    // los textos con tamaño propio llevan el zoom en línea: se recalcula con el tamaño general
    $$('[data-k]').forEach((el) => {
      if (el === activeEl) return;
      const v = site.texts[el.dataset.k];
      if (v && typeof v === 'object' && v.s && v.s.z) el.setAttribute('style', styleCss(v.s));
    });
    if (activeEl) applyStyle();
    schedule();
  }
  const gPanel = h('div', { className: 'ed-global', hidden: true, role: 'dialog' });
  gPanel.setAttribute('aria-label', 'Ajustes de toda la web');
  const gSize = h('span', { className: 'ed-size' });
  const gMinus = h('button', { type: 'button', textContent: '−' }); gMinus.setAttribute('aria-label', 'Todos los textos más pequeños');
  const gPlus = h('button', { type: 'button', textContent: '+' }); gPlus.setAttribute('aria-label', 'Todos los textos más grandes');
  const gReset = h('button', { type: 'button', className: 'ed-link', textContent: 'Tamaño original (100 %)' });
  const gAlign = h('select');
  [['', 'Como estaban'], ['left', 'Izquierda'], ['center', 'Centrado'], ['right', 'Derecha'], ['justify', 'Justificado']].forEach(([v, t]) => gAlign.append(new Option(t, v)));
  const gFont = h('select');
  gFont.append(new Option('La de la web', ''));
  Object.entries(FONTS).forEach(([k, [name]]) => gFont.append(new Option(name, k)));
  const gCancel = h('button', { type: 'button', className: 'ed-link', textContent: 'Cancelar' });
  const gSave = h('button', { type: 'button', className: 'ed-save', textContent: 'Guardar' });
  gPanel.append(
    h('p', { className: 'ed-global__title', textContent: 'Toda la web' }),
    h('div', { className: 'ed-global__row' }, h('span', { textContent: 'Tamaño de todos los textos' }), h('span', { className: 'ed-global__ctl' }, gMinus, gSize, gPlus)),
    gReset,
    h('p', { className: 'ed-global__sub', textContent: 'Textos de los tratamientos' }),
    h('label', { className: 'ed-global__row' }, h('span', { textContent: 'Alineación' }), gAlign),
    h('label', { className: 'ed-global__row' }, h('span', { textContent: 'Letra' }), gFont),
    h('p', { className: 'ed-global__hint', textContent: 'Los textos a los que les hayas puesto algo a mano (tamaño, letra o alineación) mantienen su ajuste; su tamaño propio se suma al general.' }),
    h('div', { className: 'ed-global__actions' }, gCancel, gSave),
  );
  let gBefore = null;
  const showG = () => { gSize.textContent = Math.round(site.global.scale * 100) + '%'; gAlign.value = site.global.treatAlign || ''; gFont.value = site.global.treatFont || ''; };
  function openGlobal() {
    if (activeEl) finishText(false, true);
    if (!gPanel.hidden) { closeGlobal(true); return; }
    gBefore = { ...site.global };
    showG();
    gPanel.hidden = false;
  }
  function closeGlobal(cancel) {
    if (cancel && gBefore) { site.global = gBefore; paintGlobal(); }
    gPanel.hidden = true;
  }
  const setScale = (v) => { site.global = { ...site.global, scale: Math.min(1.6, Math.max(0.6, Math.round(v * 100) / 100)) }; showG(); paintGlobal(); };
  gMinus.addEventListener('click', () => setScale(site.global.scale - 0.05));
  gPlus.addEventListener('click', () => setScale(site.global.scale + 0.05));
  gReset.addEventListener('click', () => setScale(1));
  gAlign.addEventListener('change', () => { site.global = { ...site.global, treatAlign: gAlign.value }; paintGlobal(); });
  gFont.addEventListener('change', () => { site.global = { ...site.global, treatFont: gFont.value }; paintGlobal(); });
  gCancel.addEventListener('click', () => closeGlobal(true));
  gSave.addEventListener('click', async () => {
    try {
      const r = await sendJson('global', 'PUT', { global: site.global });
      site.global = r.global;
      gBefore = null;
      paintGlobal();
      toast('Guardado para toda la web.', 'ok');
      gPanel.hidden = true;
    } catch (err) { toast(err.message, 'err'); }
  });

  /* ---------- arranque ---------- */
  async function start() {
    document.body.append(layer, bar, toastEl, tools, gPanel);
    // todo visible y quieto mientras se edita
    $$('[data-reveal]').forEach((el) => el.classList.add('is-in'));
    $$('details.qa').forEach((d) => { d.open = true; });
    try {
      const [s, html] = await Promise.all([api('site'), fetch('/admin/api/original', { credentials: 'same-origin' }).then((r) => { if (!r.ok) throw new Error('No se ha podido cargar el original.'); return r.text(); })]);
      site = s;
      if (!site.global) site.global = { scale: 1, treatAlign: '', treatFont: '' };
      paintGlobal();
      parseOriginal(html);
    } catch (err) { toast(err.message, 'err'); return; }
    buildPens();
    $$('[data-gallery-id]').forEach(setupGallery);
    $$('[data-slot]').forEach(setupSlot);
    schedule();
    addEventListener('resize', schedule);
    addEventListener('load', schedule);
    if (document.fonts) document.fonts.ready.then(schedule);
    new ResizeObserver(schedule).observe(document.body);
    new MutationObserver(schedule).observe(document.querySelector('main') || document.body, { subtree: true, attributes: true, attributeFilter: ['hidden', 'open'] });
    document.addEventListener('click', () => setTimeout(schedule, 60));
    toast('Modo edición: pulsa cualquier texto o lápiz para cambiarlo.');
  }
  start();
})();
