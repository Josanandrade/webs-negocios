/* Vista previa estática del área de gestión.
   Nada se guarda ni se envía: los cambios solo existen en esta pestaña
   y desaparecen al recargar. Todos los datos son de demostración. */
(function () {
  const { PROPS, STATUS, fmtPrice, scene } = window.SPI;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const props = PROPS.map((p) => ({ ...p }));
  const shownStatus = (p) => (p.published ? p.status : 'borrador');
  const ico = (id) => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const initials = (n) => n.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const AVC = ['#4F6D78', '#9A2E22', '#6E5A3A', '#3F5E52', '#5B4E7A', '#8A6A2E'];
  const avColor = (n) => AVC[[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % AVC.length];
  const badge = (st, extra = '') => `<span class="st st--${STATUS[st].cls} ${extra}">${STATUS[st].label}</span>`;

  const LEADS = [
    { id: 1, name: 'María López', ref: 'REF-001', msg: 'Quería saber si podemos visitarla esta semana.', when: 'Hoy · 10:42', phone: '6·· ··· 214', wa: true, read: false, done: false, visit: 'Hoy, 18:00' },
    { id: 2, name: 'José Manuel Ruiz', ref: 'REF-003', msg: '¿La plaza de garaje entra en el precio? Me gustaría verla el sábado por la mañana.', when: 'Hoy · 09:15', phone: '6·· ··· 087', wa: true, read: false, done: false, visit: 'Sáb 25, 11:00' },
    { id: 3, name: 'Lucía Garrido', ref: 'REF-004', msg: 'Hola, ¿se admiten mascotas? Tengo un perro pequeño.', when: 'Ayer · 19:03', phone: '6·· ··· 552', wa: true, read: false, done: false, visit: 'Lun 27, 17:30' },
    { id: 4, name: 'Antonio Vega', ref: 'REF-004', msg: '¿Desde cuándo estaría disponible para entrar a vivir?', when: 'Ayer · 11:20', phone: '6·· ··· 730', wa: false, read: false, done: false },
    { id: 5, name: 'Rafael Moreno', ref: 'REF-002', msg: 'He visto que está reservado. ¿Me avisáis si se libera?', when: 'Mar 21 · 12:30', phone: '6·· ··· 119', wa: true, read: true, done: true },
    { id: 6, name: 'Inés Pastor', ref: 'REF-001', msg: '¿La casa tiene certificado energético? ¿Cuánto es el IBI?', when: 'Lun 20 · 17:48', phone: '6·· ··· 640', wa: true, read: true, done: true },
  ];
  const OWNERS = [
    { name: 'Carmen Sánchez', phone: '6·· ··· 381', zone: 'Coria del Río · Centro', type: 'Casa', op: 'Vender', date: '23/10/2026', st: 'nueva' },
    { name: 'Francisco Díaz', phone: '6·· ··· 905', zone: 'La Puebla del Río', type: 'Piso', op: 'Vender', date: '22/10/2026', st: 'nueva' },
    { name: 'Rocío Navarro', phone: '6·· ··· 264', zone: 'Gelves', type: 'Adosado', op: 'Alquilar', date: '20/10/2026', st: 'contactado' },
    { name: 'Manuel Ortega', phone: '6·· ··· 417', zone: 'Coria del Río · Junto al río', type: 'Local', op: 'Alquilar', date: '17/10/2026', st: 'valoracion' },
    { name: 'Pilar Romero', phone: '6·· ··· 058', zone: 'Almensilla', type: 'Solar', op: 'Vender', date: '12/10/2026', st: 'captado' },
  ];
  const OST = { nueva: 'Nueva', contactado: 'Contactado', valoracion: 'Valoración agendada', captado: 'Captado' };
  const OCOL = { nueva: '#9A2E22', contactado: '#2B4E5B', valoracion: '#9A5A07', captado: '#1F7A4A' };

  /* ---------- Toasts ---------- */
  function toast(title, sub = 'Simulación: en la versión final se guardaría y se reflejaría en la web.') {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `${ico('p-check')}<b>${title}</b><small>${sub}</small>`;
    $('#toasts').appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 260); }, 3200);
  }

  /* ---------- Router ---------- */
  const views = $$('.view');
  const navLinks = $$('[data-view]').filter((a) => a.tagName === 'A');
  const sideNav = $('.side__nav');
  const ind = document.createElement('span');
  ind.className = 'side__ind';
  sideNav.prepend(ind);
  function go() {
    const name = (location.hash || '#resumen').slice(1);
    const v = views.find((x) => x.dataset.view === name) || views[0];
    views.forEach((x) => x.classList.toggle('is-on', x === v));
    navLinks.forEach((a) => a.classList.toggle('is-on', a.dataset.view === v.dataset.view));
    const on = $('a.is-on', sideNav);
    if (on) { ind.style.transform = `translateY(${on.offsetTop}px)`; ind.style.height = on.offsetHeight + 'px'; }
    if (v.dataset.view === 'inmuebles') moveInd($('#tabs'));
    if (v.dataset.view === 'consultas') moveInd($('#lead-tabs'));
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  addEventListener('hashchange', go);

  /* ---------- Counters ---------- */
  function counts() {
    $('#n-props').textContent = props.length;
    const pend = LEADS.filter((l) => !l.done).length;
    $('#n-leads').textContent = pend;
    $('#n-leads').hidden = !pend;
    const nuevas = OWNERS.filter((o) => o.st === 'nueva').length;
    $('#n-owners').textContent = nuevas;
    $('#n-owners').hidden = !nuevas;
  }

  /* ---------- Resumen ---------- */
  function renderDash() {
    const pub = props.filter((p) => p.published);
    const k = [
      { l: 'Inmuebles publicados', v: pub.length, s: `${props.length - pub.length} en borrador`, c: '#E7B9A8', accent: true },
      { l: 'Disponibles', v: pub.filter((p) => p.status === 'disponible').length, s: 'visibles en la web', c: '#1F7A4A' },
      { l: 'Reservados', v: pub.filter((p) => p.status === 'reservado').length, s: 'pendientes de firma', c: '#9A5A07' },
      { l: 'Vendidos / alquilados', v: props.filter((p) => p.status === 'vendido' || p.status === 'alquilado').length, s: 'este trimestre', c: '#2B4E5B' },
      { l: 'Consultas recibidas', v: 23, s: '<span class="up">▲ 35%</span> últimos 30 días', c: '#9A2E22' },
      { l: 'Visitas pendientes', v: LEADS.filter((l) => l.visit).length, s: 'la próxima, hoy 18:00', c: '#4F6D78' },
    ];
    $('#kpis').innerHTML = k.map((x) => `
      <div class="kpi${x.accent ? ' kpi--accent' : ''}"><small><i style="background:${x.c}"></i>${x.l}</small><b data-to="${x.v}">0</b><span>${x.s}</span></div>`).join('');
    $$('#kpis b').forEach((b) => countUp(b, +b.dataset.to));

    const weeks = [3, 2, 4, 3, 4, 6, 5, 8];
    const labels = ['S36', 'S37', 'S38', 'S39', 'S40', 'S41', 'S42', 'S43'];
    const W = 560, H = 190, pad = 22, bw = 38, gap = (W - pad * 2 - bw * weeks.length) / (weeks.length - 1), max = 9;
    $('#chart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Consultas por semana: ${weeks.join(', ')}">
      ${[0, 3, 6, 9].map((v) => { const y = H - 24 - (v / max) * (H - 50); return `<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="#F0ECE4"/><text x="0" y="${y - 4}">${v}</text>`; }).join('')}
      ${weeks.map((v, i) => {
        const h = (v / max) * (H - 50), x = pad + i * (bw + gap), y = H - 24 - h, last = i === weeks.length - 1;
        return `<g class="${last ? 'last' : ''}"><rect class="bar${last ? ' last' : ''}" style="--i:${i}" x="${x}" y="${y}" width="${bw}" height="${h}" rx="6"/>
          <text class="val" x="${x + bw / 2}" y="${y - 6}" text-anchor="middle">${v}</text>
          <text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle">${labels[i]}</text></g>`;
      }).join('')}</svg>`;

    $('#visits').innerHTML = LEADS.filter((l) => l.visit).map((l) => {
      const [d, h] = l.visit.split(', ');
      const p = props.find((x) => x.ref === l.ref);
      return `<li><span class="vdate"><b>${h}</b><small>${d}</small></span><p><b>${p.title}</b><small>${l.ref} · ${l.name}</small></p></li>`;
    }).join('');

    $('#mini-leads').innerHTML = LEADS.slice(0, 3).map((l) => `
      <li><span class="av" style="background:${avColor(l.name)}">${initials(l.name)}</span><span><b>${l.name}</b><small>${l.ref} · “${esc(l.msg.slice(0, 38))}…”</small></span><span class="mono muted">${l.when.split(' · ')[1]}</span></li>`).join('');

    const top = props.filter((p) => p.published).sort((a, b) => b.views - a.views).slice(0, 4);
    const mx = top[0].views;
    $('#perf').innerHTML = top.map((p, i) => `
      <li><span class="th">${scene(p.art, p.tint, p.sky)}</span><span><b>${p.ref} · ${p.type}</b><span class="track"><span style="width:${(p.views / mx) * 100}%;animation-delay:${i * 80}ms"></span></span></span><em>${p.views} · ${p.leads} cons.</em></li>`).join('');

    $('#mini-owners').innerHTML = OWNERS.filter((o) => o.st === 'nueva').map((o) => `
      <li><span class="av" style="background:${avColor(o.name)}">${initials(o.name)}</span><span><b>${o.name}</b><small>${o.op} ${o.type.toLowerCase()} · ${o.zone}</small></span><span class="os os--nueva">Nueva</span></li>`).join('');
  }
  function countUp(el, to) {
    if (reduce || to === 0) { el.textContent = to; return; }
    const t0 = performance.now(), d = 700;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Tabs indicator ---------- */
  function moveInd(tabs) {
    let i = $('.tabs__ind', tabs);
    if (!i) { i = document.createElement('span'); i.className = 'tabs__ind'; tabs.prepend(i); }
    const on = $('button.is-on', tabs);
    if (!on || !tabs.offsetParent) return;
    i.style.width = on.offsetWidth + 'px';
    i.style.transform = `translateX(${on.offsetLeft}px)`;
  }

  /* ---------- Inmuebles ---------- */
  const pstate = { q: '', st: 'todos', mode: 'table' };
  const ST_ORDER = ['todos', 'disponible', 'reservado', 'vendido', 'alquilado', 'borrador'];
  function renderTabs() {
    const n = (k) => (k === 'todos' ? props.length : props.filter((p) => shownStatus(p) === k).length);
    $('#tabs').innerHTML = ST_ORDER.map((k) => `<button role="tab" aria-selected="${k === pstate.st}" class="${k === pstate.st ? 'is-on' : ''}" data-st="${k}">${k === 'todos' ? 'Todos' : STATUS[k].label}<em>${n(k)}</em></button>`).join('');
    $$('#tabs button').forEach((b) => b.addEventListener('click', () => { pstate.st = b.dataset.st; renderTabs(); renderProps(); }));
    moveInd($('#tabs'));
  }
  function filtered() {
    const q = pstate.q.toLowerCase();
    return props.filter((p) => (pstate.st === 'todos' || shownStatus(p) === pstate.st) &&
      (!q || `${p.ref} ${p.title} ${p.zone} ${p.type}`.toLowerCase().includes(q)));
  }
  function webSwitch(p) {
    return `<button class="sw" role="switch" aria-checked="${p.published}" data-act="toggle" data-ref="${p.ref}"><i></i><span>${p.published ? 'Publicado' : 'Borrador'}</span></button>`;
  }
  function renderProps(flashRef) {
    const list = filtered();
    $('#props-table').innerHTML = list.length ? `<table>
      <thead><tr><th>Foto</th><th>Referencia</th><th>Inmueble</th><th class="col-ubic">Ubicación</th><th>Precio</th><th>Estado</th><th>Web</th><th><span class="sr">Acciones</span></th></tr></thead>
      <tbody>${list.map((p) => `
        <tr class="${p.published ? '' : 'is-hidden'} ${flashRef === p.ref ? 'flash' : ''}" data-ref="${p.ref}">
          <td class="c-img"><div class="thumb">${scene(p.art, p.tint, p.sky)}</div></td>
          <td class="c-ref"><span class="ref">${p.ref}</span> <span class="demo">Ejemplo</span></td>
          <td class="c-tt tt"><b>${p.title}</b><small>${p.type} · ${p.op === 'venta' ? 'Venta' : 'Alquiler'}${p.beds ? ` · ${p.beds} hab.` : ''} · ${p.m2} m²</small></td>
          <td class="col-ubic c-type"><small>${p.zone}</small></td>
          <td class="c-price price">${fmtPrice(p)}</td>
          <td class="c-st">${badge(shownStatus(p), flashRef === p.ref ? 'pop' : '')}</td>
          <td class="c-web">${webSwitch(p)}</td>
          <td class="c-acts"><div class="acts">
            <button class="ib" data-act="edit" data-ref="${p.ref}" aria-label="Editar ${p.ref}" title="Editar">${ico('p-edit')}</button>
            <button class="ib" data-act="menu" data-ref="${p.ref}" aria-label="Más acciones" aria-haspopup="menu" title="Más acciones">${ico('p-dots')}</button>
          </div></td>
        </tr>`).join('')}</tbody></table>` : '<p style="padding:30px;text-align:center" class="muted">Ningún inmueble coincide con la búsqueda.</p>';

    $('#props-cards').innerHTML = list.map((p, i) => `
      <article class="pc ${p.published ? '' : 'is-hidden'}" style="--i:${i}">
        <div class="pc__img">${scene(p.art, p.tint, p.sky)}${badge(shownStatus(p), flashRef === p.ref ? 'pop' : '')}<span class="demo">Ejemplo</span></div>
        <div class="pc__b"><span class="ref">${p.ref}</span><b>${p.title}</b><small>${p.zone}</small>
          <div class="pc__f"><span class="price">${fmtPrice(p)}</span><div class="acts">${webSwitch(p)}
            <button class="ib" data-act="edit" data-ref="${p.ref}" aria-label="Editar ${p.ref}">${ico('p-edit')}</button>
            <button class="ib" data-act="menu" data-ref="${p.ref}" aria-label="Más acciones" aria-haspopup="menu">${ico('p-dots')}</button></div></div>
        </div>
      </article>`).join('');
  }
  $('#q').addEventListener('input', (e) => { pstate.q = e.target.value; renderProps(); });
  $$('.viewtoggle button').forEach((b) => b.addEventListener('click', () => {
    pstate.mode = b.dataset.mode;
    $$('.viewtoggle button').forEach((x) => x.classList.toggle('is-on', x === b));
    $('#props-table').hidden = pstate.mode !== 'table';
    $('#props-cards').hidden = pstate.mode !== 'cards';
  }));

  function closeMenus() { $$('.menu').forEach((m) => m.remove()); }
  function applyStatus(p, st, msg) {
    p.status = st;
    if (!p.published && st !== 'borrador') p.published = true;
    renderTabs(); renderProps(p.ref); renderDash(); counts();
    toast(msg);
  }
  const view = $('[data-view="inmuebles"].view');
  view.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) { if (!e.target.closest('.menu')) closeMenus(); return; }
    const p = props.find((x) => x.ref === btn.dataset.ref);
    const act = btn.dataset.act;
    if (act === 'toggle') {
      p.published = !p.published;
      renderTabs(); renderProps(p.ref); renderDash();
      toast(p.published ? `${p.ref} publicado en la web` : `${p.ref} oculto de la web`);
    } else if (act === 'edit') {
      location.hash = '#nuevo';
      fillForm(p);
      toast(`Editando ${p.ref}`, 'Vista previa: el formulario se rellena con los datos del inmueble de ejemplo.');
    } else if (act === 'menu') {
      const open = btn.parentElement.querySelector('.menu');
      closeMenus();
      if (open) return;
      const m = document.createElement('div');
      m.className = 'menu';
      m.setAttribute('role', 'menu');
      m.innerHTML = `
        <button role="menuitem" data-act="edit" data-ref="${p.ref}">${ico('p-edit')}Editar</button>
        <button role="menuitem" data-act="toggle" data-ref="${p.ref}">${ico(p.published ? 'p-eyeoff' : 'p-eye')}${p.published ? 'Ocultar de la web' : 'Publicar en la web'}</button>
        <hr>
        <button role="menuitem" data-act="st" data-st="disponible" data-ref="${p.ref}"><i class="dot" style="background:var(--ok)"></i>Marcar disponible</button>
        <button role="menuitem" data-act="st" data-st="reservado" data-ref="${p.ref}"><i class="dot" style="background:var(--warn)"></i>Marcar reservado</button>
        <button role="menuitem" data-act="st" data-st="${p.op === 'alquiler' ? 'alquilado' : 'vendido'}" data-ref="${p.ref}"><i class="dot" style="background:${p.op === 'alquiler' ? 'var(--rent)' : 'var(--ink)'}"></i>Marcar ${p.op === 'alquiler' ? 'alquilado' : 'vendido'}</button>`;
      btn.parentElement.appendChild(m);
      m.querySelector('button').focus();
    } else if (act === 'st') {
      closeMenus();
      applyStatus(p, btn.dataset.st, `${p.ref} marcado como ${STATUS[btn.dataset.st].label.toLowerCase()}`);
    }
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenus(); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.acts')) closeMenus(); });

  /* ---------- Nuevo inmueble ---------- */
  const form = $('#nform');
  const EXTRAS = ['Terraza', 'Patio', 'Garaje', 'Piscina', 'Ascensor', 'Aire acondicionado', 'Trastero', 'Amueblado'];
  const nstate = { op: 'venta', beds: 3, baths: 1, extras: new Set(['Patio']) };
  $('#checks').innerHTML = EXTRAS.map((x) => `<button type="button" data-v="${x}" class="${nstate.extras.has(x) ? 'is-on' : ''}">${ico('p-check')}${x}</button>`).join('');
  $$('#checks button').forEach((b) => b.addEventListener('click', () => {
    const v = b.dataset.v;
    nstate.extras.has(v) ? nstate.extras.delete(v) : nstate.extras.add(v);
    b.classList.toggle('is-on');
    updatePreview();
  }));
  $$('.seg[data-name="op"] button', form).forEach((b) => b.addEventListener('click', () => {
    $$('.seg[data-name="op"] button', form).forEach((x) => x.classList.toggle('is-on', x === b));
    nstate.op = b.dataset.v;
    updatePreview();
  }));
  $$('.step', form).forEach((s) => $$('button', s).forEach((b) => b.addEventListener('click', () => {
    const k = s.dataset.name;
    nstate[k] = Math.max(0, Math.min(9, nstate[k] + +b.dataset.d));
    $('output', s).textContent = nstate[k];
    updatePreview();
  })));
  form.addEventListener('input', updatePreview);
  form.addEventListener('change', updatePreview);
  const ARTS = { Piso: 'piso', Casa: 'casa', Adosado: 'adosado', 'Ático': 'atico', Chalet: 'chalet', Local: 'local', Solar: 'solar' };
  const thumbs = ['salon', 'cocina', 'dormitorio', 'bano'];
  function renderThumbs() {
    const art = ARTS[form.type.value] || 'piso';
    const pics = [scene(art, '#EFD9A6', 'dia'), ...thumbs.slice(0, 3).map((t, i) => room(t, i))];
    $('#thumbs').innerHTML = pics.map((svg, i) => `<li>${svg}${i === 0 ? '<span class="cover">Portada</span>' : ''}<span class="drag">${ico('p-drag')}</span></li>`).join('');
  }
  function room(kind, i) {
    const wall = ['#EFE7D7', '#E4ECEA', '#F2E3D5'][i % 3];
    const items = {
      salon: '<rect x="90" y="150" width="200" height="60" rx="14" fill="#4F6D78"/><rect x="100" y="130" width="180" height="40" rx="12" fill="#5E7E89"/><rect x="300" y="60" width="60" height="90" fill="#C9D6D8" stroke="#1C1B18" stroke-width="3"/>',
      cocina: '<rect x="40" y="140" width="320" height="80" fill="#FBF8F1" stroke="#1C1B18" stroke-width="2"/><rect x="40" y="132" width="320" height="10" fill="#B48A3C"/><rect x="60" y="50" width="120" height="50" fill="#FBF8F1" stroke="#1C1B18" stroke-width="2"/><circle cx="270" cy="120" r="10" fill="#9A2E22"/>',
      dormitorio: '<rect x="110" y="140" width="200" height="70" rx="8" fill="#FBF8F1" stroke="#1C1B18" stroke-width="2"/><rect x="110" y="110" width="200" height="34" rx="8" fill="#9A2E22"/><rect x="40" y="60" width="50" height="80" fill="#C9D6D8" stroke="#1C1B18" stroke-width="3"/>',
    };
    return `<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="400" height="260" fill="${wall}"/><rect y="210" width="400" height="50" fill="#D8CDB6"/>${items[kind] || items.salon}</svg>`;
  }
  let lastType = '';
  function updatePreview() {
    const d = {
      title: form.title.value.trim(), type: form.type.value, price: form.price.value.replace(/\D/g, ''),
      zone: form.zone.value.trim(), m2: form.m2.value.replace(/\D/g, ''), desc: form.desc.value.trim(), status: form.status.value,
    };
    $('#price-suffix').textContent = nstate.op === 'alquiler' ? '€/mes' : '€';
    $('#desc-count').textContent = `${form.desc.value.length} / 600`;
    if (d.type !== lastType) { renderThumbs(); lastType = d.type; }
    const art = ARTS[d.type] || 'piso';
    const price = d.price ? (+d.price).toLocaleString('es-ES') + (nstate.op === 'alquiler' ? ' €/mes' : ' €') : '<span class="ph">Precio</span>';
    $('#pv').innerHTML = `
      <div class="pv__img">${scene(art, '#EFD9A6', 'dia')}${badge(d.status)}</div>
      <div class="pv__b">
        <span class="ref">REF-009 · ${nstate.op === 'venta' ? 'Venta' : 'Alquiler'}</span>
        <b>${d.title ? esc(d.title) : '<span class="ph">Título del anuncio</span>'}</b>
        <small>${d.zone ? esc(d.zone) : 'Ubicación'}</small>
        <div class="pv__f"><strong>${price}</strong><span>${nstate.beds ? nstate.beds + ' hab · ' : ''}${nstate.baths} baño${nstate.baths === 1 ? '' : 's'}${d.m2 ? ' · ' + d.m2 + ' m²' : ''}</span></div>
      </div>`;
    const checks = [
      ['Título', d.title.length > 5], ['Precio', !!d.price], ['Ubicación', d.zone.length > 2],
      ['Superficie', !!d.m2], ['Descripción (80+ caracteres)', d.desc.length >= 80], ['Fotografías', true],
    ];
    const n = Math.round((checks.filter((c) => c[1]).length / checks.length) * 100);
    $('#meter-n').textContent = n + '%';
    $('#meter-bar').style.width = n + '%';
    $('#meter-list').innerHTML = checks.map(([l, ok]) => `<li class="${ok ? 'ok' : ''}">${l}</li>`).join('');
  }
  function fillForm(p) {
    form.title.value = p.title; form.type.value = p.type; form.price.value = p.price;
    form.zone.value = p.zone; form.m2.value = p.m2; form.desc.value = p.desc;
    form.status.value = p.status;
    nstate.op = p.op; nstate.beds = p.beds; nstate.baths = p.baths;
    $$('.seg[data-name="op"] button', form).forEach((x) => x.classList.toggle('is-on', x.dataset.v === p.op));
    $$('.step', form).forEach((s) => { $('output', s).textContent = nstate[s.dataset.name]; });
    nstate.extras = new Set(p.feats.filter((f) => EXTRAS.includes(f)));
    $$('#checks button').forEach((b) => b.classList.toggle('is-on', nstate.extras.has(b.dataset.v)));
    $('#h-nuevo').textContent = `Editar ${p.ref}`;
    updatePreview();
  }
  // Rellena el formulario "escribiendo" un inmueble de ejemplo, para ver la vista previa en vivo.
  let typing = false;
  $('#autofill').addEventListener('click', async () => {
    if (typing) return;
    typing = true;
    form.reset();
    form.type.value = 'Piso'; nstate.op = 'venta';
    $$('.seg[data-name="op"] button', form).forEach((x) => x.classList.toggle('is-on', x.dataset.v === 'venta'));
    const sample = {
      title: 'Piso reformado con balcón (ejemplo)', price: '132000', zone: 'Coria del Río · Centro', m2: '92',
      desc: 'Inmueble de ejemplo. Piso exterior de tres dormitorios, reformado, con balcón a la calle, cocina amueblada y armarios empotrados.',
    };
    for (const [k, v] of Object.entries(sample)) {
      const el = form[k];
      el.focus();
      for (let i = 1; i <= v.length; i += k === 'desc' ? 4 : 1) {
        el.value = v.slice(0, i);
        updatePreview();
        if (!reduce) await new Promise((r) => setTimeout(r, k === 'desc' ? 12 : 28));
      }
      el.value = v;
      updatePreview();
    }
    nstate.extras = new Set(['Ascensor', 'Aire acondicionado']);
    $$('#checks button').forEach((b) => b.classList.toggle('is-on', nstate.extras.has(b.dataset.v)));
    form.desc.blur();
    typing = false;
  });
  $$('[data-sim]').forEach((b) => b.addEventListener('click', () => toast(b.dataset.sim, 'Simulación: en esta vista previa no se guarda ni se publica nada.')));
  $('#drop').addEventListener('click', () => toast('Subida de fotografías', 'En el desarrollo final podría arrastrar sus fotos aquí y ordenarlas.'));

  /* ---------- Consultas ---------- */
  const lstate = { f: 'pend', sel: 1 };
  function renderLeadTabs() {
    const n = { pend: LEADS.filter((l) => !l.done).length, done: LEADS.filter((l) => l.done).length, all: LEADS.length };
    $('#lead-tabs').innerHTML = [['pend', 'Sin atender'], ['done', 'Atendidas'], ['all', 'Todas']].map(([k, l]) =>
      `<button class="${k === lstate.f ? 'is-on' : ''}" data-f="${k}">${l}<em>${n[k]}</em></button>`).join('');
    $$('#lead-tabs button').forEach((b) => b.addEventListener('click', () => { lstate.f = b.dataset.f; renderLeadTabs(); renderLeads(); }));
    moveInd($('#lead-tabs'));
  }
  function renderLeads() {
    const list = LEADS.filter((l) => lstate.f === 'all' || (lstate.f === 'done' ? l.done : !l.done));
    $('#lead-list').innerHTML = list.map((l) => `
      <li><button class="li ${l.id === lstate.sel ? 'is-on' : ''} ${l.done ? 'done' : ''}" data-id="${l.id}">
        <span class="av" style="background:${avColor(l.name)}">${initials(l.name)}</span>
        <b>${l.read ? '' : '<i class="unread"></i>'}${l.name}</b><time>${l.when}</time>
        <p><span class="ref">${l.ref}</span> · ${esc(l.msg)}</p>
      </button></li>`).join('') || '<li class="muted" style="padding:20px">No hay consultas en esta bandeja.</li>';
    $$('#lead-list .li').forEach((b) => b.addEventListener('click', () => {
      lstate.sel = +b.dataset.id;
      const l = LEADS.find((x) => x.id === lstate.sel);
      l.read = true;
      renderLeads(); renderDetail();
      $('.inbox').classList.add('show-detail');
    }));
  }
  function renderDetail() {
    const l = LEADS.find((x) => x.id === lstate.sel);
    if (!l) { $('#lead-detail').innerHTML = ''; return; }
    const p = props.find((x) => x.ref === l.ref);
    $('#lead-detail').innerHTML = `
      <button class="b b--sm b--ghost ld__back" data-back>← Consultas</button>
      <div class="ld__h"><span class="av" style="background:${avColor(l.name)}">${initials(l.name)}</span>
        <div><h2>${l.name}</h2><p>Interesada/o en ${l.ref} · ${l.when}</p></div>
        <span class="st ${l.done ? 'st--ok' : 'st--warn'}">${l.done ? 'Atendida' : 'Sin atender'}</span></div>
      <div class="ld__prop"><div class="thumb">${scene(p.art, p.tint, p.sky)}</div><div><span class="ref">${p.ref}</span> <span class="demo">Ejemplo</span><b>${p.title}</b><small>${p.zone} · ${fmtPrice(p)}</small></div>${badge(shownStatus(p))}</div>
      <p class="bubble">${esc(l.msg)}</p>
      <dl class="ld__meta">
        <div><dt>Teléfono</dt><dd>${l.phone}</dd></div>
        <div><dt>Origen</dt><dd>Formulario de la ficha</dd></div>
        <div><dt>Visita</dt><dd>${l.visit || 'Sin agendar'}</dd></div>
      </dl>
      <ul class="timeline">
        <li class="on">Consulta recibida desde la web · ${l.when}</li>
        <li class="${l.read ? 'on' : ''}">Leída por la oficina</li>
        <li class="${l.done ? 'on' : ''}">Atendida</li>
      </ul>
      <div class="ld__acts">
        <button class="b b--sm" data-la="ver">${ico('p-eye')}Ver consulta completa</button>
        <button class="b b--sm" data-la="llamar">${ico('p-phone')}Llamar</button>
        <button class="b b--sm b--wa" data-la="wa">${ico('p-wa')}WhatsApp</button>
        <button class="b b--sm ${l.done ? '' : 'b--primary'}" data-la="done">${ico('p-check')}${l.done ? 'Marcar sin atender' : 'Marcar como atendida'}</button>
      </div>`;
    $('#lead-detail').style.animation = 'none'; void $('#lead-detail').offsetWidth; $('#lead-detail').style.animation = '';
  }
  $('#lead-detail').addEventListener('click', (e) => {
    if (e.target.closest('[data-back]')) { $('.inbox').classList.remove('show-detail'); return; }
    const a = e.target.closest('[data-la]');
    if (!a) return;
    const l = LEADS.find((x) => x.id === lstate.sel);
    if (a.dataset.la === 'done') {
      l.done = !l.done; l.read = true;
      renderLeadTabs(); renderLeads(); renderDetail(); counts();
      toast(l.done ? 'Consulta marcada como atendida' : 'Consulta marcada como pendiente');
    } else if (a.dataset.la === 'llamar') toast('Llamar', 'En el desarrollo final abriría la llamada al teléfono del interesado.');
    else if (a.dataset.la === 'wa') toast('WhatsApp', 'En el desarrollo final abriría WhatsApp con un mensaje ya preparado.');
    else toast('Consulta completa', 'Mostraría el historial completo de mensajes de este contacto.');
  });

  /* ---------- Propietarios ---------- */
  function renderOwners() {
    const total = OWNERS.length;
    $('#pipeline').innerHTML = Object.keys(OST).map((k) => {
      const n = OWNERS.filter((o) => o.st === k).length;
      return `<div class="pipe" style="--c:${OCOL[k]};--w:${(n / total) * 100}%"><small><i style="background:${OCOL[k]}"></i>${OST[k]}</small><b>${n}</b></div>`;
    }).join('');
    $('#owners-table').className = 'tablewrap owners';
    $('#owners-table').innerHTML = `<table>
      <thead><tr><th>Propietario</th><th>Teléfono</th><th>Inmueble y zona</th><th>Solicitud</th><th>Estado</th><th><span class="sr">Acciones</span></th></tr></thead>
      <tbody>${OWNERS.map((o, i) => `
        <tr data-i="${i}">
          <td class="o-who"><div class="who"><span class="av" style="background:${avColor(o.name)}">${initials(o.name)}</span><span><b>${o.name}</b><small>Quiere ${o.op.toLowerCase()}</small></span></div></td>
          <td class="o-z mono">${o.phone}</td>
          <td class="o-z tt"><b>${o.type}</b><small>${o.zone}</small></td>
          <td class="o-date mono">${o.date}</td>
          <td class="o-st"><button class="os os--${o.st}" data-oi="${i}" title="Cambiar estado">${OST[o.st]}</button></td>
          <td class="o-acts"><div class="acts">
            <button class="ib" data-oa="llamar" aria-label="Llamar" title="Llamar">${ico('p-phone')}</button>
            <button class="ib ib--wa" data-oa="wa" aria-label="WhatsApp" title="WhatsApp">${ico('p-wa')}</button>
            <button class="b b--sm" data-oa="captar" data-oi="${i}" title="Crear la ficha del inmueble con estos datos">${ico('p-plus')}Crear ficha</button>
          </div></td>
        </tr>`).join('')}</tbody></table>`;
  }
  $('#owners-table').addEventListener('click', (e) => {
    const s = e.target.closest('.os');
    if (s) {
      const o = OWNERS[+s.dataset.oi], keys = Object.keys(OST);
      o.st = keys[(keys.indexOf(o.st) + 1) % keys.length];
      renderOwners(); counts(); renderDash();
      toast(`${o.name}: ${OST[o.st].toLowerCase()}`);
      return;
    }
    const a = e.target.closest('[data-oa]');
    if (!a) return;
    if (a.dataset.oa === 'captar') {
      const o = OWNERS[+a.dataset.oi];
      form.reset();
      form.type.value = o.type; form.zone.value = o.zone;
      nstate.op = o.op === 'Alquilar' ? 'alquiler' : 'venta';
      $$('.seg[data-name="op"] button', form).forEach((x) => x.classList.toggle('is-on', x.dataset.v === nstate.op));
      $('#h-nuevo').textContent = 'Nuevo inmueble';
      location.hash = '#nuevo';
      updatePreview();
      toast('Ficha iniciada', `Datos de la solicitud de ${o.name} copiados al formulario (simulación).`);
    } else toast(a.dataset.oa === 'wa' ? 'WhatsApp' : 'Llamar', 'En el desarrollo final contactaría directamente con el propietario.');
  });

  /* ---------- Inicio ---------- */
  const today = new Date();
  $('#today').textContent = today.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  $$('a[href="#nuevo"]').forEach((a) => a.addEventListener('click', () => {
    if ($('#h-nuevo').textContent !== 'Nuevo inmueble') { form.reset(); $('#h-nuevo').textContent = 'Nuevo inmueble'; nstate.beds = 3; nstate.baths = 1; $$('.step output', form).forEach((o, i) => { o.textContent = i ? 1 : 3; }); updatePreview(); }
  }));
  counts(); renderDash(); renderTabs(); renderProps(); renderLeadTabs(); renderLeads(); renderDetail(); updatePreview(); renderOwners();
  go();
  addEventListener('resize', () => { moveInd($('#tabs')); moveInd($('#lead-tabs')); });
  document.fonts && document.fonts.ready.then(() => { go(); });
})();
