/* Vista previa del área de gestión. Todo ocurre en memoria: nada se guarda ni se envía. */
(() => {
  const GC = window.GC;
  const { estados, fmtPrecio } = GC;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ico = (id, cls = '') => `<svg class="i ${cls}" aria-hidden="true"><use href="../assets/icons.svg#${id}"/></svg>`;
  const img = (n) => `../assets/img/${n}.svg`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const initials = (n) => n.split(' ').map((w) => w[0]).slice(0, 2).join('');

  // copia en memoria: se pierde al recargar
  const db = {
    inmuebles: GC.inmuebles.map((p) => ({ ...p })),
    consultas: GC.consultas.map((c) => ({ ...c })),
    propietarios: GC.propietarios.map((o) => ({ ...o })),
  };
  const byRef = (r) => db.inmuebles.find((p) => p.ref === r);
  const ui = { filtro: 'todos', q: '', modo: 'tabla', bandeja: 'nuevas', sel: 1 };

  // ---------- toast ----------
  const toastEl = $('[data-toast]');
  let toastT;
  const toast = (t, s = 'Simulación: en esta demo no se guarda nada.') => {
    $('[data-toast-t]').textContent = t;
    $('[data-toast-s]').textContent = s;
    toastEl.classList.remove('on');
    void toastEl.offsetWidth;
    toastEl.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('on'), 3400);
  };
  const SYNC = 'En el desarrollo final, la web pública se actualizaría al momento. Aquí no se guarda nada.';

  // ---------- contadores ----------
  const counts = () => {
    const pub = db.inmuebles.filter((p) => p.publicado);
    return {
      total: db.inmuebles.length,
      publicados: pub.length,
      disponibles: pub.filter((p) => p.estado === 'disponible').length,
      reservados: db.inmuebles.filter((p) => p.estado === 'reservado').length,
      cerrados: db.inmuebles.filter((p) => ['vendido', 'alquilado'].includes(p.estado)).length,
      consultasNuevas: db.consultas.filter((c) => c.estado === 'nueva').length,
      propNuevas: db.propietarios.filter((o) => o.estado === 'nueva').length,
    };
  };
  const paintNav = () => {
    const c = counts();
    $('[data-n="inmuebles"]').textContent = c.total;
    $('[data-n="consultas"]').textContent = c.consultasNuevas || '';
    $('[data-n="consultas"]').style.display = c.consultasNuevas ? '' : 'none';
    $('[data-n="propietarios"]').textContent = c.propNuevas || '';
    $('[data-n="propietarios"]').style.display = c.propNuevas ? '' : 'none';
  };

  // ---------- RESUMEN ----------
  const agenda = [
    { d: '24', m: 'oct', h: '10:30', ref: 'GC-103', quien: 'María López' },
    { d: '24', m: 'oct', h: '18:00', ref: 'GC-102', quien: 'Javier Moreno' },
    { d: '25', m: 'oct', h: '11:00', ref: 'GC-109', quien: 'Lucía Fernández' },
    { d: '27', m: 'oct', h: '12:30', ref: 'GC-111', quien: 'Rocío Marín' },
  ];
  function vResumen() {
    const c = counts();
    const semana = GC.semanas[GC.semanas.length - 1].v;
    const kpis = [
      ['k-pub', 'Inmuebles publicados', c.publicados, 'globe', `${c.total - c.publicados} sin publicar`],
      ['k-disp', 'Disponibles', c.disponibles, 'home', 'en la web ahora'],
      ['k-res', 'Reservados', c.reservados, 'tag', 'con señal'],
      ['k-ven', 'Vendidos / alquilados', c.cerrados, 'check', 'últimos 60 días'],
      ['k-con', 'Consultas recibidas', semana, 'inbox', '<span class="up">+35 %</span> esta semana'],
      ['k-vis', 'Visitas pendientes', agenda.length, 'calendar', 'próximos 7 días'],
    ];
    const top = [...db.inmuebles].filter((p) => p.publicado).sort((a, b) => b.visitas - a.visitas).slice(0, 4);
    return `
      <section class="kpis">${kpis.map(([k, l, v, i, s], n) => `
        <article class="card kpi ${k}" style="--d:${n * 80}ms"><div class="kpi-top"><span>${l}</span>${ico(i)}</div><b data-count="${v}">${reduce ? v : 0}</b><small>${s}</small></article>`).join('')}
      </section>
      <section class="dash">
        <div class="dash-col">
          <article class="card">
            <div class="card-h"><h2>Consultas recibidas por semana</h2><span class="sample">Datos de demostración</span></div>
            <div class="chart-meta"><b>${semana}</b><span>esta semana · desde la web, WhatsApp y llamadas</span></div>
            <div class="chart chart-wrap" data-chart><div class="tip" data-tip></div></div>
          </article>
          <article class="card">
            <div class="card-h"><h2>Últimas consultas</h2><a href="#consultas">Ver todas</a></div>
            <ul class="mini-list">${db.consultas.slice(0, 4).map((q, i) => `
              <li><span class="avatar ${['', 'b', 'c'][i % 3]}">${initials(q.nombre)}</span><span class="who"><b>${q.nombre} <span class="ref" style="display:inline">${q.ref}</span></b><span>“${esc(q.mensaje)}”</span></span><span class="when">${q.hace}</span></li>`).join('')}
            </ul>
          </article>
        </div>
        <div class="dash-col">
          <article class="card">
            <div class="card-h"><h2>Próximas visitas</h2><span class="sample">Ejemplo</span></div>
            <ul class="mini-list agenda">${agenda.map((a) => { const p = byRef(a.ref); return `
              <li><span class="date-chip"><b>${a.d}</b><span>${a.m}</span></span><span class="who"><b>${a.h} · ${a.quien}</b><span>${a.ref} · ${p.titulo}</span></span><img class="thumb" src="${img(p.img)}" alt=""></li>`; }).join('')}
            </ul>
          </article>
          <article class="card">
            <div class="card-h"><h2>Propietarios que quieren vender</h2><a href="#propietarios">Abrir</a></div>
            <ul class="mini-list">${db.propietarios.filter((o) => o.estado === 'nueva' || o.estado === 'valoracion').map((o) => `
              <li><span class="avatar c">${initials(o.nombre)}</span><span class="who"><b>${o.nombre}</b><span>${o.op} · ${o.tipo} en ${o.zona}</span></span><span class="when">${o.fecha}</span></li>`).join('')}
            </ul>
          </article>
          <article class="card">
            <div class="card-h"><h2>Lo más visto en la web</h2><a href="#inmuebles">Inmuebles</a></div>
            <ul class="mini-list">${top.map((p) => `
              <li><img class="thumb" src="${img(p.img)}" alt=""><span class="who"><b>${p.titulo}</b><span>${p.ref} · ${p.zona}</span></span><span class="when"><b style="color:var(--ink);font-weight:550">${p.visitas}</b><br>visitas</span></li>`).join('')}
            </ul>
          </article>
        </div>
      </section>`;
  }
  function afterResumen() {
    // números que cuentan
    $$('[data-count]').forEach((el, i) => {
      const to = +el.dataset.count;
      if (reduce) return;
      const t0 = performance.now() + i * 80;
      const step = (t) => {
        const k = Math.min(1, Math.max(0, (t - t0) / 800));
        el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    // gráfico de barras
    const wrap = $('[data-chart]');
    const data = GC.semanas;
    const W = 600, H = 190, pb = 22, pt = 8, max = 25;
    const bw = 34, gap = (W - 30 - data.length * bw) / (data.length - 1);
    const y = (v) => H - pb - (v / max) * (H - pb - pt);
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Consultas por semana, de ${data[0].v} a ${data[data.length - 1].v}">`;
    [0, 10, 20].forEach((g) => { s += `<line class="gridl" x1="30" x2="${W}" y1="${y(g)}" y2="${y(g)}"/><text class="axis" x="0" y="${y(g) + 3}">${g}</text>`; });
    data.forEach((d, i) => {
      const x = 30 + i * (bw + gap);
      const h = H - pb - y(d.v);
      s += `<rect class="hit" x="${x - gap / 2}" y="${pt}" width="${bw + gap}" height="${H - pb - pt}" fill="transparent" data-i="${i}"/>`;
      s += `<path class="bar-r ${i === data.length - 1 ? 'last' : ''}" style="--d:${200 + i * 60}ms" d="M${x} ${H - pb} V${y(d.v) + 4} q0 -4 4 -4 h${bw - 8} q4 0 4 4 V${H - pb} Z" data-b="${i}"/>`;
      s += `<text class="axis" x="${x + bw / 2}" y="${H - 6}" text-anchor="middle">${d.s}</text>`;
      void h;
    });
    s += '</svg>';
    wrap.insertAdjacentHTML('beforeend', s);
    const tip = $('[data-tip]', wrap);
    const svgEl = $('svg', wrap);
    svgEl.addEventListener('pointermove', (e) => {
      const hit = e.target.closest('.hit');
      $$('.bar-r', svgEl).forEach((b) => b.classList.toggle('hover', hit && b.dataset.b === hit.dataset.i));
      if (!hit) return tip.classList.remove('on');
      const d = data[+hit.dataset.i];
      const r = svgEl.getBoundingClientRect(), wr = wrap.getBoundingClientRect();
      const sx = r.width / W;
      const x = 30 + +hit.dataset.i * (bw + gap) + bw / 2;
      tip.innerHTML = `Semana del ${d.s}: <b>${d.v}</b> consultas`;
      tip.style.left = `${r.left - wr.left + x * sx}px`;
      tip.style.top = `${r.top - wr.top + y(d.v) * (r.height / H)}px`;
      tip.classList.add('on');
    });
    svgEl.addEventListener('pointerleave', () => { tip.classList.remove('on'); $$('.bar-r', svgEl).forEach((b) => b.classList.remove('hover')); });
  }

  // ---------- INMUEBLES ----------
  const filtros = [['todos', 'Todos'], ['disponible', 'Disponibles'], ['reservado', 'Reservados'], ['vendido', 'Vendidos'], ['alquilado', 'Alquilados'], ['borrador', 'Borradores']];
  const listaFiltrada = () => {
    const q = ui.q.trim().toLowerCase();
    return db.inmuebles.filter((p) => (ui.filtro === 'todos' || p.estado === ui.filtro) &&
      (!q || `${p.ref} ${p.titulo} ${p.zona} ${p.ciudad} ${p.tipo}`.toLowerCase().includes(q)));
  };
  const switchHTML = (p) => `<button class="switch" role="switch" aria-checked="${p.publicado}" data-act="toggle" data-ref="${p.ref}"><i></i><span>${p.publicado ? 'Publicado' : 'Borrador'}</span></button>`;
  const rowHTML = (p, i) => `
    <tr data-row="${p.ref}" class="${p.publicado ? '' : 'hidden-row'}" style="--d:${i * 35}ms">
      <td class="c-prop"><div class="cell-prop"><img class="thumb" src="${img(p.img)}" alt=""><div><b>${p.titulo}</b><span>${p.tipo} · ${p.op === 'venta' ? 'Venta' : 'Alquiler'} · ${p.m2} m²</span></div></div></td>
      <td class="c-ref"><span class="ref">${p.ref}</span></td>
      <td class="c-zone">${p.zona}${p.ciudad !== 'Sevilla' ? `, ${p.ciudad}` : ''}</td>
      <td><span class="price">${fmtPrecio(p)}</span></td>
      <td><em class="st st-${p.estado}" data-st>${estados[p.estado].label}</em></td>
      <td>${switchHTML(p)}</td>
      <td class="c-act"><div class="row-actions">
        <a class="btn btn-line btn-sm" href="#editar/${p.ref}">${ico('edit')}Editar</a>
        <button class="btn btn-line btn-sm" data-act="${p.publicado ? 'ocultar' : 'publicar'}" data-ref="${p.ref}">${ico(p.publicado ? 'eye-off' : 'eye')}${p.publicado ? 'Ocultar' : 'Publicar'}</button>
        <button class="icon-btn sm" data-menu-for="${p.ref}" aria-label="Más acciones para ${p.ref}" aria-haspopup="menu">${ico('more')}</button>
      </div></td>
    </tr>`;
  const cardHTML = (p, i) => `
    <article class="card pcard ${p.publicado ? '' : 'hidden-row'}" data-row="${p.ref}" style="--d:${i * 40}ms">
      <div class="pcard-img"><img src="${img(p.img)}" alt=""><em class="st st-${p.estado}" data-st>${estados[p.estado].label}</em><span class="sample">Ejemplo</span></div>
      <div class="pcard-b"><span class="ref">${p.ref} · ${p.tipo}</span><b>${p.titulo}</b><span class="meta">${p.zona} · ${p.m2} m²${p.hab ? ` · ${p.hab} hab.` : ''}</span><span class="price">${fmtPrecio(p)}</span></div>
      <div class="pcard-f">${switchHTML(p)}<div class="row-actions"><a class="icon-btn sm" href="#editar/${p.ref}" aria-label="Editar ${p.ref}">${ico('edit')}</a><button class="icon-btn sm" data-menu-for="${p.ref}" aria-label="Más acciones para ${p.ref}" aria-haspopup="menu">${ico('more')}</button></div></div>
    </article>`;
  function vInmuebles() {
    const n = (k) => (k === 'todos' ? db.inmuebles.length : db.inmuebles.filter((p) => p.estado === k).length);
    return `
      <div class="toolbar">
        <div class="tabs" role="tablist" data-tabs><span class="tabs-pill"></span>${filtros.map(([k, l]) => `<button role="tab" aria-selected="${ui.filtro === k}" data-f="${k}">${l} <span>${n(k)}</span></button>`).join('')}</div>
        <span class="grow"></span>
        <span class="sample">Inmuebles de ejemplo</span>
        <div class="viewtoggle" aria-label="Vista"><button aria-pressed="${ui.modo === 'tabla'}" data-modo="tabla" aria-label="Tabla">${ico('list')}</button><button aria-pressed="${ui.modo === 'tarjetas'}" data-modo="tarjetas" aria-label="Tarjetas">${ico('grid')}</button></div>
      </div>
      <div data-list></div>`;
  }
  const paintList = () => {
    const box = $('[data-list]');
    if (!box) return;
    const list = listaFiltrada();
    if (!list.length) { box.innerHTML = `<div class="card" style="padding:40px;text-align:center;color:var(--muted)">Ningún inmueble coincide${ui.q ? ` con “${esc(ui.q)}”` : ''}.</div>`; return; }
    box.innerHTML = ui.modo === 'tabla'
      ? `<div class="card table-card"><table class="table"><thead><tr><th>Inmueble</th><th>Referencia</th><th>Ubicación</th><th>Precio</th><th>Estado</th><th>Web</th><th style="text-align:right">Acciones</th></tr></thead><tbody>${list.map(rowHTML).join('')}</tbody></table></div>`
      : `<div class="pgrid">${list.map(cardHTML).join('')}</div>`;
  };
  const movePill = (tabs) => {
    if (!tabs) return;
    const b = $('[aria-selected="true"]', tabs);
    const pill = $('.tabs-pill', tabs);
    pill.style.width = `${b.offsetWidth}px`;
    pill.style.transform = `translateX(${b.offsetLeft - 4}px)`;
  };
  function afterInmuebles() {
    const tabs = $('[data-tabs]');
    movePill(tabs);
    tabs.addEventListener('click', (e) => {
      const b = e.target.closest('[data-f]');
      if (!b) return;
      ui.filtro = b.dataset.f;
      $$('[data-f]', tabs).forEach((x) => x.setAttribute('aria-selected', x === b));
      movePill(tabs);
      paintList();
    });
    $$('[data-modo]').forEach((b) => b.addEventListener('click', () => {
      ui.modo = b.dataset.modo;
      $$('[data-modo]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      paintList();
    }));
    paintList();
  }
  const refreshTabsCounts = () => {
    const tabs = $('[data-tabs]');
    if (!tabs) return;
    $$('[data-f]', tabs).forEach((b) => {
      const k = b.dataset.f;
      $('span', b).textContent = k === 'todos' ? db.inmuebles.length : db.inmuebles.filter((p) => p.estado === k).length;
    });
  };
  const applyChange = (ref, change, msg) => {
    const p = byRef(ref);
    Object.assign(p, change);
    if (p.estado === 'borrador' && p.publicado) p.estado = 'disponible';
    paintList();
    refreshTabsCounts();
    paintNav();
    const row = $(`[data-row="${ref}"]`);
    if (row) {
      row.style.animation = 'none';
      void row.offsetWidth;
      row.style.animation = '';
      row.classList.add('flash');
      $('[data-st]', row)?.classList.add('pop');
    }
    toast(msg, SYNC);
  };

  // menú contextual
  const menu = $('[data-menu]');
  let menuRef = null;
  const openMenu = (btn) => {
    menuRef = btn.dataset.menuFor;
    const p = byRef(menuRef);
    const opts = [['disponible', 'Marcar disponible'], ['reservado', 'Marcar reservado'], ['vendido', 'Marcar vendido'], ['alquilado', 'Marcar alquilado']].filter(([k]) => k !== p.estado);
    menu.innerHTML = `
      <button role="menuitem" data-go="#editar/${p.ref}">${ico('edit')}Editar ficha</button>
      <button role="menuitem" data-mact="${p.publicado ? 'ocultar' : 'publicar'}">${ico(p.publicado ? 'eye-off' : 'eye')}${p.publicado ? 'Ocultar de la web' : 'Publicar en la web'}</button>
      <hr>
      ${opts.map(([k, l]) => `<button role="menuitem" data-mest="${k}"><span class="dotc" style="background:var(--st-${k})"></span>${l}</button>`).join('')}
      <hr>
      <button role="menuitem" data-go="../" data-ext>${ico('external')}Ver en la web</button>`;
    menu.hidden = false;
    const r = btn.getBoundingClientRect();
    const mw = 220, mh = menu.offsetHeight;
    const below = r.bottom + mh + 8 < innerHeight;
    menu.style.left = `${Math.max(8, Math.min(innerWidth - mw - 8, r.right - mw))}px`;
    menu.style.top = `${below ? r.bottom + 6 : r.top - mh - 6}px`;
    menu.style.setProperty('--ox', below ? 'top right' : 'bottom right');
    $('button', menu).focus({ preventScroll: true });
  };
  const closeMenu = () => { menu.hidden = true; menuRef = null; };
  menu.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const ref = menuRef;
    closeMenu();
    if (b.dataset.go) { if (b.dataset.ext !== undefined) open(b.dataset.go, '_blank', 'noopener'); else location.hash = b.dataset.go; return; }
    if (b.dataset.mact) return act(b.dataset.mact, ref);
    if (b.dataset.mest) {
      const k = b.dataset.mest;
      applyChange(ref, { estado: k, publicado: true }, `${ref} marcado como ${estados[k].label.toLowerCase()}`);
    }
  });
  document.addEventListener('pointerdown', (e) => { if (!menu.hidden && !menu.contains(e.target) && !e.target.closest('[data-menu-for]')) closeMenu(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  addEventListener('scroll', closeMenu, { passive: true });

  function act(a, ref) {
    const p = byRef(ref);
    if (a === 'toggle') a = p.publicado ? 'ocultar' : 'publicar';
    if (a === 'ocultar') applyChange(ref, { publicado: false }, `${ref} oculto de la web`);
    if (a === 'publicar') applyChange(ref, { publicado: true }, `${ref} publicado en la web`);
  }

  // ---------- NUEVO / EDITAR ----------
  const caracteristicas = ['Terraza', 'Balcón', 'Ascensor', 'Garaje', 'Trastero', 'Aire acondicionado', 'Calefacción', 'Patio', 'Piscina', 'Amueblado', 'Exterior', 'Reformado'];
  function vNuevo(ref) {
    const p = ref ? byRef(ref) : null;
    const f = p || { titulo: '', tipo: 'Piso', op: 'venta', precio: '', zona: '', ciudad: 'Sevilla', hab: 2, banos: 1, m2: '', estado: 'borrador', tags: [], img: 'casco-cal', galeria: ['salon-verde', 'cocina'] };
    const fotos = [f.img, ...f.galeria].slice(0, 4);
    const desc = p ? `${p.titulo} en ${p.zona}. Texto de ejemplo: aquí la inmobiliaria describiría la vivienda, su orientación, el estado de conservación y lo que hay cerca.` : '';
    return `
      <form class="form-grid" data-form novalidate>
        <div>
          <section class="card fsec">
            <h2><span class="n">1</span>Datos básicos ${p ? `<span class="ref" style="margin-left:auto">${p.ref}</span>` : '<span class="sample" style="margin-left:auto">Formulario de ejemplo</span>'}</h2>
            <label class="f">Título del anuncio<input name="titulo" value="${esc(f.titulo)}" placeholder="Ej. Piso con balcones en San Lorenzo"></label>
            <div class="frow">
              <label class="f">Tipo de inmueble<select name="tipo">${['Piso', 'Ático', 'Dúplex', 'Casa', 'Estudio', 'Local', 'Oficina', 'Nave', 'Terreno'].map((t) => `<option ${t === f.tipo ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
              <div class="f">Operación<div class="segm" data-op>${['venta', 'alquiler'].map((o) => `<button type="button" aria-pressed="${f.op === o}" data-v="${o}">${o === 'venta' ? 'Venta' : 'Alquiler'}</button>`).join('')}</div></div>
              <label class="f">Precio<span class="suffix"><input name="precio" inputmode="numeric" value="${f.precio}" placeholder="0"><em data-suf>${f.op === 'alquiler' ? '€/mes' : '€'}</em></span></label>
            </div>
            <div class="frow">
              <label class="f">Barrio o zona<input name="zona" value="${esc(f.zona)}" placeholder="Ej. San Lorenzo"></label>
              <label class="f">Municipio<input name="ciudad" value="${esc(f.ciudad)}"></label>
            </div>
          </section>
          <section class="card fsec">
            <h2><span class="n">2</span>Características</h2>
            <div class="frow">
              <div class="f">Habitaciones<div class="stepper" data-step="hab"><button type="button" data-d="-1" aria-label="Menos">−</button><output>${f.hab}</output><button type="button" data-d="1" aria-label="Más">+</button></div></div>
              <div class="f">Baños<div class="stepper" data-step="banos"><button type="button" data-d="-1" aria-label="Menos">−</button><output>${f.banos}</output><button type="button" data-d="1" aria-label="Más">+</button></div></div>
              <label class="f">Superficie<span class="suffix"><input name="m2" inputmode="numeric" value="${f.m2}" placeholder="0"><em>m²</em></span></label>
            </div>
            <div class="checks" data-checks>${caracteristicas.map((c) => `<button type="button" aria-pressed="${(f.tags || []).some((t) => t.startsWith(c))}">${ico('check')}${c}</button>`).join('')}</div>
            <label class="f">Descripción<textarea name="desc" placeholder="Cuenta cómo es la casa, qué tiene cerca, en qué estado está…">${esc(desc)}</textarea></label>
          </section>
          <section class="card fsec">
            <h2><span class="n">3</span>Fotografías</h2>
            <div class="drop">
              ${fotos.map((x, i) => `<div class="drop-ph"><img src="${img(x)}" alt="">${i === 0 ? '<em>Portada</em>' : ''}</div>`).join('')}
              <button type="button" class="drop-add" data-demo="Subir fotografías">${ico('upload')}<span>Añadir fotos</span></button>
            </div>
            <p class="note">Arrastra las fotos o súbelas desde el móvil. La primera será la portada. (Imágenes ilustrativas de ejemplo.)</p>
          </section>
          <section class="card fsec">
            <h2><span class="n">4</span>Estado y publicación</h2>
            <div class="estado-pick" data-estado>${Object.keys(estados).map((k) => `<button type="button" aria-pressed="${f.estado === k}" data-v="${k}"><em class="st st-${k}">${estados[k].label}</em></button>`).join('')}</div>
          </section>
        </div>
        <aside class="preview-col">
          <div class="preview-label"><span>Así se verá en tu web</span><span class="sample">En directo</span></div>
          <article class="card web-card">
            <div class="pcard-img"><img src="${img(fotos[0])}" alt=""><em class="st st-${f.estado}" data-pv-st>${estados[f.estado].label}</em></div>
            <p class="t" data-pv-t></p>
            <p class="m" data-pv-m></p>
            <p class="p" data-pv-p></p>
          </article>
          <div class="form-actions">
            <button type="button" class="btn btn-line" data-save="borrador">Guardar borrador</button>
            <button type="button" class="btn btn-ink" data-save="publicar">${ico('globe')}Publicar</button>
          </div>
          <p class="note">Demo visual: estos botones no crean ni modifican nada. En el desarrollo final, al publicar, el inmueble aparecería en la web al instante.</p>
        </aside>
      </form>`;
  }
  function afterNuevo(ref) {
    const form = $('[data-form]');
    const st = { op: $('[data-op] [aria-pressed="true"]').dataset.v, estado: $('[data-estado] [aria-pressed="true"]').dataset.v, hab: +$('[data-step="hab"] output').textContent, banos: +$('[data-step="banos"] output').textContent };
    const paint = () => {
      const t = form.titulo.value.trim() || 'Título del anuncio';
      const precio = parseInt(form.precio.value.replace(/\D/g, ''), 10);
      $('[data-pv-t]').textContent = t;
      $('[data-pv-m]').textContent = [form.tipo.value, form.zona.value.trim() || 'Zona', form.m2.value ? `${form.m2.value} m²` : null, st.hab ? `${st.hab} hab.` : null, `${st.banos} baño${st.banos === 1 ? '' : 's'}`].filter(Boolean).join(' · ');
      $('[data-pv-p]').textContent = precio ? fmtPrecio({ precio, op: st.op }) : '— €';
      const s = $('[data-pv-st]');
      s.className = `st st-${st.estado}`;
      s.textContent = estados[st.estado].label;
      $('[data-suf]').textContent = st.op === 'alquiler' ? '€/mes' : '€';
    };
    form.addEventListener('input', paint);
    $('[data-op]').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; st.op = b.dataset.v; $$('[data-op] button').forEach((x) => x.setAttribute('aria-pressed', x === b)); paint(); });
    $('[data-estado]').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; st.estado = b.dataset.v; $$('[data-estado] button').forEach((x) => x.setAttribute('aria-pressed', x === b)); $('[data-pv-st]').classList.add('pop'); paint(); });
    $$('[data-step]').forEach((s) => s.addEventListener('click', (e) => { const b = e.target.closest('[data-d]'); if (!b) return; const k = s.dataset.step; st[k] = Math.max(0, Math.min(9, st[k] + +b.dataset.d)); $('output', s).textContent = st[k]; paint(); }));
    $('[data-checks]').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); });
    $$('[data-save]').forEach((b) => b.addEventListener('click', () => {
      const pub = b.dataset.save === 'publicar';
      toast(pub ? (ref ? `Cambios de ${ref} listos para publicar` : 'Inmueble listo para publicar') : 'Borrador preparado', 'Demo visual: no se ha creado ni modificado nada. En el desarrollo final se guardaría y, al publicar, aparecería en la web.');
    }));
    paint();
  }

  // ---------- CONSULTAS ----------
  function vConsultas() {
    const tabs = [['nuevas', 'Nuevas'], ['atendidas', 'Atendidas'], ['todas', 'Todas']];
    const n = { nuevas: db.consultas.filter((c) => c.estado === 'nueva').length, atendidas: db.consultas.filter((c) => c.estado === 'atendida').length, todas: db.consultas.length };
    return `
      <div class="toolbar">
        <div class="tabs" role="tablist" data-btabs><span class="tabs-pill"></span>${tabs.map(([k, l]) => `<button role="tab" aria-selected="${ui.bandeja === k}" data-b="${k}">${l} <span>${n[k]}</span></button>`).join('')}</div>
        <span class="grow"></span><span class="sample">Consultas de ejemplo</span>
      </div>
      <div class="inbox">
        <article class="card"><ul class="lead-list" data-leads></ul></article>
        <article class="card lead-detail" data-detail></article>
      </div>`;
  }
  const leadsVisibles = () => db.consultas.filter((c) => ui.bandeja === 'todas' || (ui.bandeja === 'nuevas' ? c.estado === 'nueva' : c.estado === 'atendida'));
  const paintLeads = () => {
    const list = leadsVisibles();
    if (!list.some((c) => c.id === ui.sel)) ui.sel = list[0]?.id;
    $('[data-leads]').innerHTML = list.length ? list.map((c, i) => `
      <li class="lead ${c.id === ui.sel ? 'sel' : ''} ${c.estado === 'atendida' ? 'done' : ''}" data-lead="${c.id}" tabindex="0">
        <span class="newdot"></span><span class="avatar ${['', 'b', 'c'][i % 3]}">${initials(c.nombre)}</span>
        <b>${c.nombre}</b><span class="when">${c.hace}</span>
        <p><span class="ref">${c.ref}</span> · ${esc(c.mensaje)}</p>
      </li>`).join('') : '<li style="padding:28px;text-align:center;color:var(--muted)">No hay consultas aquí. ¡Bandeja al día!</li>';
    paintDetail();
  };
  const paintDetail = () => {
    const box = $('[data-detail]');
    const c = db.consultas.find((x) => x.id === ui.sel);
    if (!c) { box.innerHTML = '<p class="note">Selecciona una consulta.</p>'; return; }
    const p = byRef(c.ref);
    box.innerHTML = `
      <div class="ld-head"><span class="avatar">${initials(c.nombre)}</span><div><h2>${c.nombre}</h2><span class="meta">${c.canal} · ${c.hace} · ${c.tel} <span class="sample">Contacto de ejemplo</span></span></div>
        <span style="margin-left:auto">${c.estado === 'nueva' ? '<em class="st st-reservado">Pendiente</em>' : '<em class="st">Atendida</em>'}</span></div>
      <div class="bubble">“${esc(c.mensaje)}”</div>
      <div class="ld-prop"><img src="${img(p.img)}" alt=""><div><span class="ref">Interesada en ${p.ref}</span><br><b>${p.titulo}</b><br><span class="note">${p.zona} · ${fmtPrecio(p)}</span></div><em class="st st-${p.estado}" style="margin-left:auto">${estados[p.estado].label}</em></div>
      <div class="ld-actions">
        <button class="btn btn-line btn-sm" data-demo="Ver consulta completa">${ico('eye')}Ver consulta</button>
        <button class="btn btn-line btn-sm" data-demo="Llamar a ${c.nombre}">${ico('phone')}Llamar</button>
        <button class="btn btn-line btn-sm" data-demo="Abrir WhatsApp con ${c.nombre}">${ico('whatsapp')}WhatsApp</button>
        <button class="btn ${c.estado === 'nueva' ? 'btn-ink' : 'btn-line'} btn-sm" data-atender="${c.id}">${ico('check')}${c.estado === 'nueva' ? 'Marcar como atendida' : 'Volver a pendiente'}</button>
      </div>
      <div><p class="crumb" style="margin-bottom:10px">Historial</p>
        <ol class="timeline"><li>${c.hace} · Llega desde ${c.canal === 'Formulario' ? 'el formulario de la ficha' : c.canal} con la referencia ${p.ref}</li><li>Se asocia automáticamente al inmueble ${p.ref}</li>${c.estado === 'atendida' ? '<li>Marcada como atendida</li>' : ''}</ol></div>`;
  };
  function afterConsultas() {
    const tabs = $('[data-btabs]');
    movePill(tabs);
    tabs.addEventListener('click', (e) => { const b = e.target.closest('[data-b]'); if (!b) return; ui.bandeja = b.dataset.b; $$('[data-b]', tabs).forEach((x) => x.setAttribute('aria-selected', x === b)); movePill(tabs); paintLeads(); });
    const pick = (li) => { ui.sel = +li.dataset.lead; $$('[data-lead]').forEach((x) => x.classList.toggle('sel', x === li)); paintDetail(); };
    $('[data-leads]').addEventListener('click', (e) => { const li = e.target.closest('[data-lead]'); if (li) pick(li); });
    $('[data-leads]').addEventListener('keydown', (e) => { const li = e.target.closest('[data-lead]'); if (li && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(li); } });
    $('[data-detail]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-atender]');
      if (!b) return;
      const c = db.consultas.find((x) => x.id === +b.dataset.atender);
      c.estado = c.estado === 'nueva' ? 'atendida' : 'nueva';
      $$('[data-b] span', tabs).forEach((s) => { const k = s.parentElement.dataset.b; s.textContent = k === 'todas' ? db.consultas.length : db.consultas.filter((x) => x.estado === (k === 'nuevas' ? 'nueva' : 'atendida')).length; });
      paintNav();
      const li = $(`[data-lead="${c.id}"]`);
      li?.classList.toggle('done', c.estado === 'atendida');
      paintDetail();
      toast(c.estado === 'atendida' ? `Consulta de ${c.nombre} atendida` : `Consulta de ${c.nombre} pendiente de nuevo`);
    });
    paintLeads();
  }

  // ---------- PROPIETARIOS ----------
  const etapas = [['nueva', 'Nuevas solicitudes'], ['valoracion', 'Valoración'], ['visita', 'Visita al inmueble'], ['captado', 'Captado']];
  function vPropietarios() {
    return `
      <article class="card source">
        <div class="formmini">Quiero vender mi vivienda<i></i><i></i><i></i></div>
        <p><b>Las solicitudes del formulario de la web llegan aquí.</b> Cada propietario que pide una valoración entra como nueva solicitud y puedes seguirlo hasta que el inmueble entra en cartera. <span class="sample">Datos de ejemplo</span></p>
      </article>
      <div class="pipe" data-pipe></div>`;
  }
  const paintPipe = () => {
    $('[data-pipe]').innerHTML = etapas.map(([k, l], ci) => {
      const list = db.propietarios.filter((o) => o.estado === k);
      return `<section class="pcol"><div class="pcol-h">${l}<span>${list.length}</span></div>${list.map((o, i) => `
        <article class="card owner" style="--d:${ci * 60 + i * 50}ms">
          <div class="owner-top"><b>${o.nombre}</b><span class="note">${o.fecha}</span></div>
          <dl><dt>Teléfono</dt><dd>${o.tel}</dd><dt>Zona</dt><dd>${o.zona}</dd><dt>Inmueble</dt><dd>${o.tipo} · ${o.op}</dd></dl>
          <p>${esc(o.nota)}</p>
          <div class="owner-actions">
            <button class="btn btn-line btn-sm" data-demo="Llamar a ${o.nombre}">${ico('phone')}Llamar</button>
            ${k === 'captado' ? `<a class="btn btn-ink btn-sm" href="#nuevo">${ico('plus')}Crear ficha</a>` : `<button class="btn btn-ink btn-sm" data-avanzar="${o.id}">${ico('arrow')}${etapas[ci + 1][1]}</button>`}
          </div>
        </article>`).join('')}</section>`;
    }).join('');
  };
  function afterPropietarios() {
    $('[data-pipe]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-avanzar]');
      if (!b) return;
      const o = db.propietarios.find((x) => x.id === +b.dataset.avanzar);
      const i = etapas.findIndex(([k]) => k === o.estado);
      o.estado = etapas[i + 1][0];
      paintPipe();
      paintNav();
      toast(`${o.nombre} pasa a «${etapas[i + 1][1]}»`);
    });
    paintPipe();
  }

  // ---------- router ----------
  const views = {
    resumen: { crumb: 'Resumen', title: 'Tu cartera, de un vistazo', v: vResumen, a: afterResumen },
    inmuebles: { crumb: 'Gestión de inmuebles', title: 'Inmuebles', v: vInmuebles, a: afterInmuebles },
    nuevo: { crumb: 'Nuevo inmueble', title: 'Añadir un inmueble', v: () => vNuevo(), a: () => afterNuevo() },
    consultas: { crumb: 'Consultas', title: 'Consultas de compradores', v: vConsultas, a: afterConsultas },
    propietarios: { crumb: 'Captación de propietarios', title: 'Quiero vender mi vivienda', v: vPropietarios, a: afterPropietarios },
  };
  const root = $('[data-view-root]');
  const nav = $('[data-nav]');
  const ind = $('.side-ind', nav);
  const route = () => {
    closeMenu();
    const h = location.hash.slice(1) || 'resumen';
    let key = h, cfg;
    if (h.startsWith('editar/') && byRef(h.slice(7))) {
      const ref = h.slice(7);
      key = 'inmuebles';
      cfg = { crumb: `Inmuebles · ${ref}`, title: 'Editar inmueble', v: () => vNuevo(ref), a: () => afterNuevo(ref) };
    } else cfg = views[h] || views.resumen;
    if (!views[key]) key = 'resumen';
    $('[data-crumb]').textContent = cfg.crumb;
    $('[data-title]').textContent = cfg.title;
    root.innerHTML = cfg.v();
    cfg.a();
    const link = $(`[data-view="${key}"]`, nav);
    $$('[data-view]', nav).forEach((a) => { a.classList.toggle('on', a === link); a.toggleAttribute('aria-current', a === link); });
    ind.style.transform = `translateY(${link.offsetTop}px)`;
    document.title = `${cfg.title} · Vista previa · Golden Center`;
    if (scrollY > 0) scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };
  addEventListener('hashchange', route);

  // acciones delegadas
  document.addEventListener('click', (e) => {
    const m = e.target.closest('[data-menu-for]');
    if (m) { e.stopPropagation(); return menu.hidden || menuRef !== m.dataset.menuFor ? openMenu(m) : closeMenu(); }
    const a = e.target.closest('[data-act]');
    if (a) return act(a.dataset.act, a.dataset.ref);
    const d = e.target.closest('[data-demo]');
    if (d) return toast(d.dataset.demo, 'Acción de demostración: disponible en el desarrollo final.');
  });

  const gs = $('[data-global-search]');
  gs.addEventListener('input', () => {
    ui.q = gs.value;
    if (!location.hash.startsWith('#inmuebles')) { ui.filtro = 'todos'; location.hash = 'inmuebles'; } else paintList();
  });

  addEventListener('resize', () => { movePill($('[data-tabs]')); movePill($('[data-btabs]')); });
  paintNav();
  route();
  document.fonts?.ready.then(() => { movePill($('[data-tabs]')); movePill($('[data-btabs]')); const on = $('.side-nav a.on'); if (on) ind.style.transform = `translateY(${on.offsetTop}px)`; });
})();
