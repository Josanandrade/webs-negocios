/* Vista previa estática del área de gestión. Sin backend, sin sesión y sin
   persistencia: los cambios solo existen en memoria y desaparecen al recargar. */
(function () {
  const G = window.GSI;
  const { facade, vaneMark } = window.GSIArt;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const inm = G.inmuebles.map((p) => ({ ...p }));
  const con = G.consultas.map((c) => ({ ...c, done: false }));
  const pro = G.propietarios.map((p) => ({ ...p }));
  const ui = { filtro: 'todos', q: '', modo: 'tabla', bandeja: 'nuevas', sel: 1 };

  $$('[data-vane-mark]').forEach((el) => (el.innerHTML = vaneMark()));
  const main = $('[data-main]');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const badge = (e, label) => {
    const meta = G.estados[e] || { label: label || e, icon: e === 'atendida' ? G.icons.check : G.icons.dot };
    return `<span class="st st--${e}"><span class="st__i" aria-hidden="true">${meta.icon}</span>${label || meta.label}</span>`;
  };
  const ic = {
    edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2"/></svg>',
    wa: '<svg viewBox="0 0 24 24"><path d="M4 20l1.3-4A8 8 0 1112 20a8 8 0 01-4-1z"/><path d="M9 9.5c.5 2 2.5 4 4.5 4.5l1-1.2 1.8.8"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/></svg>',
    grid: '<svg viewBox="0 0 24 24"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/></svg>',
    rows: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/></svg>'
  };
  const head = (k, title, sub, right = '') => `<header class="vh"><div>
      <p class="vh__k"><span class="demo-tag">DATOS DE DEMOSTRACIÓN</span>${k}</p>
      <h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}</div>${right}</header>`;

  /* Toast */
  const toastEl = $('[data-toast]'); let tt;
  function toast(m) { toastEl.textContent = m; toastEl.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('is-on'), 3600); }
  const VISUAL = 'Vista previa: en la versión final este cambio se reflejaría en la web al instante.';

  function counts() {
    $('[data-c="inm"]').textContent = inm.length;
    const n = con.filter((c) => c.nueva && !c.done).length;
    $('[data-c="con"]').textContent = n || '';
    $('[data-c="con"]').hidden = !n;
    $('[data-c="pro"]').textContent = pro.filter((p) => p.estado === 'nueva').length;
  }

  /* ---------- Resumen ---------- */
  function vResumen() {
    const pub = inm.filter((p) => p.publicado);
    const by = (e) => inm.filter((p) => p.estado === e).length;
    const nuevas = con.filter((c) => c.nueva && !c.done).length;
    const visitas = [
      { d: 'Jue', n: '24', h: '17:30', who: 'María López', ref: 'GSI-003' },
      { d: 'Vie', n: '25', h: '10:00', who: 'Lucía Fernández', ref: 'GSI-007' },
      { d: 'Sáb', n: '26', h: '12:00', who: 'Javier Romero', ref: 'GSI-001' }
    ];
    const weeks = [['1 sep', 4], ['8 sep', 6], ['15 sep', 5], ['22 sep', 9], ['29 sep', 7], ['6 oct', 11], ['13 oct', 10], ['20 oct', 14]];
    const max = 16;
    const mix = [
      ['disponible', '#3E9B8A'], ['reservado', '#C79A5B'], ['vendido', '#2A221B'], ['alquilado', '#6B5B4B'], ['borrador', '#D6CCBD']
    ].map(([e, c]) => ({ e, c, n: by(e) })).filter((x) => x.n);
    return `<section class="view">
      ${head('Resumen', 'Buenos días', 'Así vería la agencia su cartera y su actividad de un vistazo.', `<a class="b b--pri" href="#nuevo">${ic.plus}Nuevo inmueble</a>`)}
      <div class="kpis">
        <div class="box kpi"><p class="kpi__l">Inmuebles publicados</p><p class="kpi__v" data-count="${pub.length}">${pub.length}</p><p class="kpi__d">${inm.length - pub.length} en borrador</p></div>
        <div class="box kpi"><p class="kpi__l">Disponibles</p><p class="kpi__v" data-count="${by('disponible')}">${by('disponible')}</p><p class="kpi__d">visibles en la web</p></div>
        <div class="box kpi"><p class="kpi__l">Reservados</p><p class="kpi__v" data-count="${by('reservado')}">${by('reservado')}</p><p class="kpi__d">pendientes de arras</p></div>
        <div class="box kpi"><p class="kpi__l">Vendidos / alquilados</p><p class="kpi__v" data-count="${by('vendido') + by('alquilado')}">${by('vendido') + by('alquilado')}</p><p class="kpi__d">últimos 60 días</p></div>
        <div class="box kpi kpi--accent"><p class="kpi__l">Consultas recibidas</p><p class="kpi__v" data-count="${con.length}">${con.length}</p><p class="kpi__d"><b>${nuevas} nuevas</b> sin atender</p></div>
        <div class="box kpi"><p class="kpi__l">Visitas pendientes</p><p class="kpi__v" data-count="${visitas.length}">${visitas.length}</p><p class="kpi__d">esta semana</p></div>
      </div>
      <div class="dash">
        <div class="dash__col">
          <div class="box">
            <div class="box__h"><h2>Consultas recibidas desde la web, por semana</h2></div>
            <div class="box__b">
              <div class="chart" data-chart>
                <div class="chart__y">${[0, 4, 8, 12, 16].map((v) => `<span style="top:${100 - (v / max) * 100}%">${v}</span>`).join('')}</div>
                <div class="chart__plot">
                  ${[4, 8, 12, 16].map((v) => `<div class="chart__grid" style="top:${100 - (v / max) * 100}%"></div>`).join('')}
                  <div class="chart__bars">${weeks.map(([w, v], i) => `<button type="button" class="chart__bar${i === weeks.length - 1 ? ' is-now' : ''}" data-tip="Semana del ${w}: ${v} consultas" aria-label="Semana del ${w}: ${v} consultas"><i style="--h:${(v / max) * 100}%;--d:${i * 50}ms"></i></button>`).join('')}</div>
                  <span class="tip" data-tipel></span>
                </div>
              </div>
              <div class="chart__x">${weeks.map(([w]) => `<span>${w.replace(' sep', '/9').replace(' oct', '/10')}</span>`).join('')}</div>
            </div>
          </div>
          <div class="box">
            <div class="box__h"><h2>Últimas consultas</h2><a href="#consultas">Ver todas →</a></div>
            <div class="box__b"><ul class="list">${con.slice(0, 4).map((c) => `<li>
              <span class="av${c.nueva && !c.done ? ' av--new' : ''}">${c.nombre[0]}</span>
              <span style="min-width:0"><span class="list__t">${c.nombre}</span> <span class="list__s" style="display:inline">· ${c.ref}</span><br><span class="list__s" style="display:block">“${c.msg}”</span></span>
              <span class="list__r">${c.hace}</span></li>`).join('')}</ul></div>
          </div>
        </div>
        <div class="dash__col">
          <div class="box">
            <div class="box__h"><h2>Cartera por estado</h2><a href="#inmuebles">Gestionar →</a></div>
            <div class="box__b">
              <div class="mix" role="img" aria-label="${mix.map((m) => `${G.estados[m.e].label}: ${m.n}`).join(', ')}">${mix.map((m, i) => `<span style="flex:${m.n};background:${m.c};animation-delay:${i * 60}ms"></span>`).join('')}</div>
              <ul class="legend">${mix.map((m) => `<li><i style="background:${m.c}"></i>${G.estados[m.e].label}<b>${m.n}</b></li>`).join('')}</ul>
            </div>
          </div>
          <div class="box">
            <div class="box__h"><h2>Próximas visitas</h2></div>
            <div class="box__b"><ul class="list">${visitas.map((v) => `<li>
              <span class="when"><small>${v.d}</small><b>${v.n}</b></span>
              <span><span class="list__t">${v.who}</span><br><span class="list__s">${v.ref} · ${inm.find((p) => p.ref === v.ref).titulo}</span></span>
              <span class="list__r">${v.h}</span></li>`).join('')}</ul></div>
          </div>
          <div class="box">
            <div class="box__h"><h2>Propietarios que quieren vender</h2><a href="#propietarios">Ver →</a></div>
            <div class="box__b"><ul class="list">${pro.slice(0, 3).map((p) => `<li>
              <span class="av">${p.nombre[0]}</span>
              <span><span class="list__t">${p.nombre}</span><br><span class="list__s">${p.tipo} · ${p.zona}</span></span>
              <span>${badge(p.estado, cap(p.estado))}</span></li>`).join('')}</ul></div>
          </div>
        </div>
      </div>
    </section>`;
  }
  function bindResumen() {
    const chart = $('[data-chart]'); if (!chart) return;
    const tip = $('[data-tipel]', chart), plot = $('.chart__plot', chart);
    const show = (b) => {
      const r = b.getBoundingClientRect(), pr = plot.getBoundingClientRect(), bar = $('i', b).getBoundingClientRect();
      tip.textContent = b.dataset.tip;
      tip.style.left = (r.left - pr.left + r.width / 2) + 'px';
      tip.style.top = (bar.top - pr.top) + 'px';
      tip.classList.add('is-on');
    };
    $$('.chart__bar', chart).forEach((b) => {
      b.addEventListener('mouseenter', () => show(b)); b.addEventListener('focus', () => show(b));
      b.addEventListener('mouseleave', () => tip.classList.remove('is-on')); b.addEventListener('blur', () => tip.classList.remove('is-on'));
    });
    if (!reduce) $$('[data-count]').forEach((el) => {
      const to = +el.dataset.count, t0 = performance.now();
      const step = (t) => { const k = Math.min(1, (t - t0) / 700); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }
  const cap = (s) => s[0].toUpperCase() + s.slice(1);

  /* ---------- Inmuebles ---------- */
  const filtros = ['todos', 'disponible', 'reservado', 'vendido', 'alquilado', 'borrador'];
  function lista() {
    const q = ui.q.trim().toLowerCase();
    return inm.filter((p) => (ui.filtro === 'todos' || p.estado === ui.filtro) &&
      (!q || (p.ref + ' ' + p.titulo + ' ' + p.barrio + ' ' + p.zona + ' ' + p.tipo).toLowerCase().includes(q)));
  }
  const sw = (p) => `<button type="button" class="sw" role="switch" aria-checked="${p.publicado}" data-act="toggle" data-ref="${p.ref}"><span class="sw__t"></span>${p.publicado ? 'Publicado' : 'Borrador'}</button>`;
  const menu = (p) => `<div class="menu" role="menu" hidden data-menu="${p.ref}">
      <button role="menuitem" data-act="edit" data-ref="${p.ref}">${ic.edit.replace('<svg', '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"')}Editar ficha</button>
      <button role="menuitem" data-act="toggle" data-ref="${p.ref}">${p.publicado ? 'Ocultar de la web' : 'Publicar en la web'}</button>
      <hr>
      <button role="menuitem" data-act="st" data-st="disponible" data-ref="${p.ref}"><span class="mi" style="background:#3E9B8A"></span>Marcar disponible</button>
      <button role="menuitem" data-act="st" data-st="reservado" data-ref="${p.ref}"><span class="mi" style="background:#C79A5B"></span>Marcar reservado</button>
      <button role="menuitem" data-act="st" data-st="${p.op === 'alquiler' ? 'alquilado' : 'vendido'}" data-ref="${p.ref}"><span class="mi" style="background:#2A221B"></span>Marcar ${p.op === 'alquiler' ? 'alquilado' : 'vendido'}</button>
    </div>`;
  function rowHTML(p) {
    return `<tr data-row="${p.ref}" class="${p.publicado ? '' : 'is-hidden-row'}">
      <td><div class="thumb">${facade(p.art, { uid: 't' })}</div></td>
      <td><span class="ref">${p.ref}</span></td>
      <td><div class="cell-t">${p.titulo}</div><div class="cell-s">${p.tipo} · ${p.op === 'venta' ? 'Venta' : 'Alquiler'} · ${p.m2} m²</div></td>
      <td><div>${p.barrio}</div><div class="cell-s">${p.zona}</div></td>
      <td class="price">${G.precio(p)}</td>
      <td data-st-cell>${badge(p.estado)}</td>
      <td>${sw(p)}</td>
      <td><div class="acts"><button class="b b--sm" data-act="edit" data-ref="${p.ref}">${ic.edit}Editar</button>
        <button class="b b--sm b--ghost" aria-haspopup="menu" aria-expanded="false" aria-label="Más acciones para ${p.ref}" data-act="menu" data-ref="${p.ref}">${ic.more}</button>${menu(p)}</div></td>
    </tr>`;
  }
  function cardHTML(p) {
    return `<article class="box pcard${p.publicado ? '' : ' is-hidden-row'}" data-row="${p.ref}">
      <div class="pcard__img">${facade(p.art, { uid: 'pc' })}<span data-st-cell>${badge(p.estado)}</span></div>
      <div class="pcard__b"><span class="ref">${p.ref} · ${p.tipo}</span><span class="cell-t">${p.titulo}</span><span class="cell-s">${p.barrio} · ${p.zona}</span><span class="price">${G.precio(p)}</span></div>
      <div class="pcard__f">${sw(p)}<div class="acts"><button class="b b--sm" data-act="edit" data-ref="${p.ref}">Editar</button>
        <button class="b b--sm b--ghost" aria-haspopup="menu" aria-expanded="false" aria-label="Más acciones para ${p.ref}" data-act="menu" data-ref="${p.ref}">${ic.more}</button>${menu(p)}</div></div>
    </article>`;
  }
  function vInmuebles() {
    return `<section class="view">
      ${head('Inmuebles', 'Gestión de inmuebles', 'Lo que se publica aquí es lo que aparece en la web. Ocultar, publicar o cambiar el estado sería inmediato.', `<a class="b b--pri" href="#nuevo">${ic.plus}Nuevo inmueble</a>`)}
      <div class="tools">
        <label class="search">${ic.search}<span class="sr">Buscar</span><input type="search" placeholder="Buscar por referencia, barrio o título" value="${esc(ui.q)}" data-q></label>
        <div class="segs" role="group" aria-label="Filtrar por estado" data-segs>
          <span class="segs__pill" aria-hidden="true"></span>
          ${filtros.map((f) => `<button type="button" data-f="${f}" aria-pressed="${ui.filtro === f}">${f === 'todos' ? 'Todos' : G.estados[f].label}<em>${f === 'todos' ? inm.length : inm.filter((p) => p.estado === f).length}</em></button>`).join('')}
        </div>
        <div class="tools__r">
          <button class="b b--sm${ui.modo === 'tabla' ? ' b--pri' : ''}" data-modo="tabla" aria-pressed="${ui.modo === 'tabla'}">${ic.rows}<span class="sr">Ver como </span>Tabla</button>
          <button class="b b--sm${ui.modo === 'tarjetas' ? ' b--pri' : ''}" data-modo="tarjetas" aria-pressed="${ui.modo === 'tarjetas'}">${ic.grid}<span class="sr">Ver como </span>Tarjetas</button>
        </div>
      </div>
      <div data-list></div>
    </section>`;
  }
  function renderLista() {
    const host = $('[data-list]'); if (!host) return;
    const items = lista();
    if (!items.length) { host.innerHTML = '<div class="box" style="padding:40px;text-align:center;color:var(--ink-3)">Ningún inmueble con ese filtro.</div>'; return; }
    const cards = `<div class="pcards"${ui.modo === 'tabla' ? ' data-mobile-only' : ''}>${items.map(cardHTML).join('')}</div>`;
    const table = ui.modo === 'tabla' ? `<div class="box tbl-wrap"><table class="tbl"><thead><tr><th>Foto</th><th>Ref.</th><th>Inmueble</th><th>Ubicación</th><th>Precio</th><th>Estado</th><th>Web</th><th><span class="sr">Acciones</span></th></tr></thead><tbody>${items.map(rowHTML).join('')}</tbody></table></div>` : '';
    host.innerHTML = table + cards;
  }
  function placeSegPill() {
    const segs = $('[data-segs]'); if (!segs) return;
    const on = $('[aria-pressed="true"]', segs), pill = $('.segs__pill', segs);
    pill.style.width = on.offsetWidth + 'px'; pill.style.transform = `translateX(${on.offsetLeft}px)`;
  }
  function closeMenus(except) {
    $$('[data-menu]').forEach((m) => { if (m !== except) { m.hidden = true; const b = m.previousElementSibling; b && b.setAttribute('aria-expanded', 'false'); } });
  }
  function bindInmuebles() {
    renderLista(); placeSegPill();
    document.fonts && document.fonts.ready.then(placeSegPill);
    $('[data-q]').addEventListener('input', (e) => { ui.q = e.target.value; renderLista(); });
    $('[data-segs]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-f]'); if (!b) return;
      ui.filtro = b.dataset.f;
      $$('[data-f]').forEach((x) => x.setAttribute('aria-pressed', x === b));
      placeSegPill(); renderLista();
    });
    $$('[data-modo]').forEach((b) => b.addEventListener('click', () => {
      ui.modo = b.dataset.modo;
      $$('[data-modo]').forEach((x) => { const on = x === b; x.classList.toggle('b--pri', on); x.setAttribute('aria-pressed', on); });
      renderLista();
    }));
  }
  // Acciones (delegadas: tabla y tarjetas)
  main.addEventListener('click', (e) => {
    const a = e.target.closest('[data-act]');
    if (!a) return;
    const p = inm.find((x) => x.ref === a.dataset.ref);
    const act = a.dataset.act;
    if (act === 'menu') {
      const m = a.nextElementSibling; const open = m.hidden;
      closeMenus(m); m.hidden = !open; a.setAttribute('aria-expanded', open);
      if (open) $('button', m).focus();
      e.stopPropagation(); return;
    }
    closeMenus();
    if (act === 'edit') { toast(`Vista previa: aquí se abriría la ficha de ${p.ref} para editarla.`); return; }
    if (act === 'toggle') {
      p.publicado = !p.publicado;
      if (!p.publicado && p.estado !== 'borrador') p._prev = p.estado;
      p.estado = p.publicado ? (p.estado === 'borrador' ? (p._prev || 'disponible') : p.estado) : p.estado;
      renderLista();
      toast(p.publicado ? `${p.ref} publicado. ${VISUAL}` : `${p.ref} oculto de la web. ${VISUAL}`);
      return;
    }
    if (act === 'st') {
      p.estado = a.dataset.st;
      if (!p.publicado) p.publicado = true;
      renderLista();
      $$(`[data-row="${p.ref}"] [data-st-cell] .st`).forEach((s) => s.classList.add('is-flip'));
      toast(`${p.ref} marcado como ${G.estados[p.estado].label.toLowerCase()}. ${VISUAL}`);
      $$('[data-f] em').forEach((em) => { const f = em.parentElement.dataset.f; em.textContent = f === 'todos' ? inm.length : inm.filter((x) => x.estado === f).length; });
    }
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.menu')) closeMenus(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenus(); });

  /* ---------- Nuevo inmueble ---------- */
  function vNuevo() {
    const barrios = [...new Set(G.inmuebles.map((p) => p.barrio))];
    const feats = ['Ascensor', 'Terraza', 'Patio', 'Garaje', 'Trastero', 'Aire acondicionado', 'Calefacción', 'Piscina', 'Amueblado', 'Exterior'];
    return `<section class="view">
      ${head('Nuevo inmueble', 'Añadir un inmueble', 'Formulario de ejemplo: así daría de alta la agencia un inmueble nuevo. No se guarda nada.')}
      <form class="form-grid" data-nform novalidate>
        <div>
          <div class="box fsec">
            <h2>Datos principales</h2><p>Lo que verá primero el comprador.</p>
            <div class="frow" style="--c:1"><label class="fl"><span>Título</span><input name="titulo" value="Piso reformado con balcón en Triana" maxlength="70"><small data-len></small></label></div>
            <div class="frow" style="--c:3">
              <label class="fl"><span>Tipo de inmueble</span><select name="tipo"><option>Piso</option><option>Casa</option><option>Ático</option><option>Local</option><option>Garaje</option></select></label>
              <label class="fl"><span>Operación</span><select name="op"><option value="venta">Venta</option><option value="alquiler">Alquiler</option></select></label>
              <label class="fl"><span>Precio</span><span class="affix"><input name="precio" inputmode="numeric" value="265000"><i data-unit>€</i></span></label>
            </div>
            <div class="frow">
              <label class="fl"><span>Barrio</span><select name="barrio">${barrios.map((b) => `<option${b === 'Triana' ? ' selected' : ''}>${b}</option>`).join('')}</select></label>
              <label class="fl"><span>Calle o zona</span><input name="zona" value="Calle Castilla"><small>La dirección exacta puede quedar oculta en la web.</small></label>
            </div>
          </div>
          <div class="box fsec">
            <h2>Distribución</h2><p>Habitaciones, baños y superficie.</p>
            <div class="frow frow--keep" style="--c:3">
              <div class="fl"><span>Habitaciones</span><div class="stepper" data-stepper="hab"><button type="button" aria-label="Menos habitaciones">−</button><output>3</output><button type="button" aria-label="Más habitaciones">+</button></div></div>
              <div class="fl"><span>Baños</span><div class="stepper" data-stepper="banos"><button type="button" aria-label="Menos baños">−</button><output>1</output><button type="button" aria-label="Más baños">+</button></div></div>
              <label class="fl"><span>Superficie</span><span class="affix"><input name="m2" inputmode="numeric" value="92"><i>m²</i></span></label>
            </div>
          </div>
          <div class="box fsec">
            <h2>Descripción y características</h2><p>Texto libre y etiquetas que luego sirven como filtros en la web.</p>
            <div class="frow" style="--c:1"><label class="fl"><span>Descripción</span><textarea name="desc">Piso exterior de tres dormitorios, reformado, con balcón a la calle y mucha luz por la mañana. A dos minutos del mercado de Triana.</textarea></label></div>
            <div class="feats">${feats.map((f, i) => `<label class="feat"><input type="checkbox" ${[0, 5, 9].includes(i) ? 'checked' : ''}><span>${f}</span></label>`).join('')}</div>
          </div>
          <div class="box fsec">
            <h2>Fotografías</h2><p>Arrastre las fotos; la primera es la portada. (Ilustraciones de ejemplo.)</p>
            <div class="drop">
              ${[{ kind: 'piso', wall: '#F3E6CF', trim: '#B4573A', floors: 4, seed: 31 }, { kind: 'piso', wall: '#EFE2CC', trim: '#3E9B8A', floors: 3, seed: 37 }, { kind: 'casa', wall: '#F6EBD8', trim: '#9A6B34', floors: 2, seed: 41 }].map((a, i) => `<div class="drop__ph">${facade(a, { uid: 'f' + i })}${i === 0 ? '<span>Portada</span>' : ''}</div>`).join('')}
              <button type="button" class="drop__add" data-add><span><b>+</b>Añadir fotos</span></button>
            </div>
          </div>
          <div class="box fsec">
            <h2>Estado</h2><p>Decide si sale ya en la web o se queda guardado.</p>
            <div class="radios">
              <label class="rc"><input type="radio" name="estado" value="borrador"><span>${badge('borrador')}Solo lo ve la agencia</span></label>
              <label class="rc"><input type="radio" name="estado" value="disponible" checked><span>${badge('disponible')}Publicado en la web</span></label>
              <label class="rc"><input type="radio" name="estado" value="reservado"><span>${badge('reservado')}Publicado como reservado</span></label>
            </div>
          </div>
          <div class="ftbar">
            <p>Vista previa: estos botones no guardan nada.</p>
            <button type="button" class="b" data-save="borrador">Guardar borrador</button>
            <button type="submit" class="b b--bronze">Publicar en la web</button>
          </div>
        </div>
        <aside class="preview" aria-label="Así se vería en la web">
          <p class="preview__k">${ic.eye.replace('<svg', '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8"')}Así se vería en la web</p>
          <article class="box pcard">
            <div class="pcard__img" data-pv-img></div>
            <div class="pcard__b"><span class="ref" data-pv-meta></span><h3 data-pv-t></h3><span class="cell-s" data-pv-specs></span><span class="price" data-pv-p></span></div>
          </article>
          <p class="cell-s">La ficha se actualiza mientras escribe.</p>
        </aside>
      </form>
    </section>`;
  }
  function bindNuevo() {
    const f = $('[data-nform]');
    const st = { hab: 3, banos: 1 };
    $('[data-pv-img]').innerHTML = facade({ kind: 'piso', wall: '#F3E6CF', trim: '#B4573A', floors: 4, seed: 31 }, { uid: 'pv' }) + '<span data-pv-st></span>';
    function upd() {
      const v = (n) => f.elements[n].value;
      const n = parseInt(v('precio').replace(/\D/g, ''), 10) || 0;
      const alq = v('op') === 'alquiler';
      $('[data-unit]').textContent = alq ? '€/mes' : '€';
      $('[data-pv-t]').textContent = v('titulo') || 'Título del inmueble';
      $('[data-pv-meta]').textContent = `GSI-009 · ${v('tipo')} · ${alq ? 'Alquiler' : 'Venta'}`;
      $('[data-pv-specs]').textContent = `${v('barrio')} · ${v('zona')} · ${st.hab} dorm. · ${st.banos} baño${st.banos > 1 ? 's' : ''} · ${v('m2') || 0} m²`;
      $('[data-pv-p]').textContent = n.toLocaleString('es-ES') + (alq ? ' €/mes' : ' €');
      const e = (f.querySelector('[name="estado"]:checked') || {}).value || 'disponible';
      $('[data-pv-st]').innerHTML = badge(e);
      $('[data-len]').textContent = `${v('titulo').length}/70 caracteres`;
    }
    f.addEventListener('input', upd); f.addEventListener('change', upd);
    $$('[data-stepper]', f).forEach((s) => {
      const k = s.dataset.stepper, out = $('output', s), [minus, plus] = $$('button', s);
      minus.addEventListener('click', () => { st[k] = Math.max(k === 'banos' ? 1 : 0, st[k] - 1); out.textContent = st[k]; upd(); });
      plus.addEventListener('click', () => { st[k] = Math.min(9, st[k] + 1); out.textContent = st[k]; upd(); });
    });
    $('[data-add]').addEventListener('click', () => toast('Vista previa: en la versión final se abriría el selector de fotos.'));
    $('[data-save]').addEventListener('click', () => toast('Vista previa: el borrador no se guarda. En la versión final quedaría solo visible para la agencia.'));
    f.addEventListener('submit', (e) => { e.preventDefault(); toast('Vista previa: no se publica nada. En la versión final este inmueble aparecería en la web al momento.'); });
    upd();
  }

  /* ---------- Consultas ---------- */
  function vConsultas() {
    return `<section class="view">
      ${head('Consultas', 'Consultas de compradores', 'Cada mensaje llega asociado al inmueble desde el que se envió.')}
      <div class="box inbox" data-inbox>
        <div class="inbox__list">
          <div class="inbox__tabs"><div class="segs" role="group" aria-label="Filtrar consultas" data-btabs>
            <span class="segs__pill" aria-hidden="true"></span>
            ${[['nuevas', 'Pendientes'], ['todas', 'Todas'], ['atendidas', 'Atendidas']].map(([k, l]) => `<button type="button" data-b="${k}" aria-pressed="${ui.bandeja === k}">${l}<em data-bc="${k}"></em></button>`).join('')}
          </div></div>
          <div class="inbox__items" data-items></div>
        </div>
        <div class="detail" data-detail aria-live="polite"></div>
      </div>
    </section>`;
  }
  function bandeja() {
    return con.filter((c) => ui.bandeja === 'todas' || (ui.bandeja === 'nuevas' ? !c.done : c.done));
  }
  function renderBandeja() {
    const items = bandeja();
    $('[data-bc="nuevas"]').textContent = con.filter((c) => !c.done).length;
    $('[data-bc="todas"]').textContent = con.length;
    $('[data-bc="atendidas"]').textContent = con.filter((c) => c.done).length;
    $('[data-items]').innerHTML = items.length ? items.map((c) => `<button type="button" class="msg${c.done ? ' is-done' : ''}" data-c="${c.id}" aria-current="${c.id === ui.sel}">
        <span class="av${c.nueva && !c.done ? ' av--new' : ''}">${c.nombre[0]}</span>
        <span style="min-width:0"><span class="msg__n">${c.nueva && !c.done ? '<span class="new" aria-label="Nueva"></span>' : ''}${c.nombre}</span>
        <span class="msg__ref">Interesada/o en ${c.ref}</span><span class="msg__p">“${c.msg}”</span></span>
        <span class="msg__h">${c.hace}</span></button>`).join('')
      : '<p style="padding:24px;color:var(--ink-3)">No hay consultas en esta bandeja.</p>';
    renderDetalle();
  }
  function renderDetalle() {
    const c = con.find((x) => x.id === ui.sel); const d = $('[data-detail]');
    if (!c) { d.innerHTML = ''; return; }
    const p = inm.find((x) => x.ref === c.ref);
    d.innerHTML = `<button type="button" class="b b--sm detail__back" data-back>← Consultas</button>
      <div class="detail__top"><span class="av${c.done ? '' : ' av--new'}">${c.nombre[0]}</span>
        <div><h2>${c.nombre}</h2><p>${c.canal} · ${c.hace} · Tel. 6•• •• •• ••</p></div>
        ${c.done ? badge('atendida', 'Atendida') : badge('nueva', 'Sin atender')}</div>
      <div class="bubble">“${c.msg}”<small>Mensaje de ejemplo · ${c.canal}</small></div>
      <div class="linked"><div class="thumb">${facade(p.art, { uid: 'l' })}</div>
        <div><span class="ref">${p.ref}</span><div class="cell-t">${p.titulo}</div><div class="cell-s">${G.precio(p)} · ${badge(p.estado)}</div></div>
        <a class="b b--sm" href="#inmuebles" data-goref="${p.ref}">Ver inmueble</a></div>
      <div class="detail__acts">
        <button class="b" data-ca="call">${ic.phone}Llamar</button>
        <button class="b" data-ca="wa">${ic.wa}WhatsApp</button>
        <button class="b" data-ca="visit">${ic.cal}Proponer visita</button>
        <button class="b ${c.done ? '' : 'b--patina'}" data-ca="done">${ic.check}${c.done ? 'Marcar como pendiente' : 'Marcar como atendida'}</button>
      </div>
      <p class="detail__note">Datos de demostración. En la versión final, “Llamar” y “WhatsApp” abrirían directamente el teléfono o la conversación con el interesado.</p>`;
  }
  function bindConsultas() {
    const box = $('[data-inbox]');
    const tabs = $('[data-btabs]');
    const pill = () => { const on = $('[aria-pressed="true"]', tabs), p = $('.segs__pill', tabs); p.style.width = on.offsetWidth + 'px'; p.style.transform = `translateX(${on.offsetLeft}px)`; };
    tabs.addEventListener('click', (e) => {
      const b = e.target.closest('[data-b]'); if (!b) return;
      ui.bandeja = b.dataset.b; $$('[data-b]', tabs).forEach((x) => x.setAttribute('aria-pressed', x === b)); pill();
      const first = bandeja()[0]; if (first && !bandeja().some((c) => c.id === ui.sel)) ui.sel = first.id;
      renderBandeja();
    });
    box.addEventListener('click', (e) => {
      const m = e.target.closest('[data-c]');
      if (m) { ui.sel = +m.dataset.c; $$('.msg', box).forEach((x) => x.setAttribute('aria-current', x === m)); renderDetalle(); box.classList.add('is-detail'); return; }
      if (e.target.closest('[data-back]')) { box.classList.remove('is-detail'); return; }
      const g = e.target.closest('[data-goref]'); if (g) { ui.q = g.dataset.goref; ui.filtro = 'todos'; return; }
      const a = e.target.closest('[data-ca]'); if (!a) return;
      const c = con.find((x) => x.id === ui.sel);
      if (a.dataset.ca === 'done') {
        c.done = !c.done; renderBandeja(); counts();
        $('.detail__top .st', box).classList.add('is-flip');
        toast(c.done ? 'Consulta marcada como atendida (solo en esta vista previa).' : 'Consulta devuelta a pendientes (solo en esta vista previa).');
      } else if (a.dataset.ca === 'call') toast('Vista previa: en la versión final se iniciaría la llamada.');
      else if (a.dataset.ca === 'wa') toast('Vista previa: en la versión final se abriría WhatsApp con un mensaje preparado.');
      else toast('Vista previa: aquí se propondría día y hora de visita.');
    });
    renderBandeja(); pill();
    document.fonts && document.fonts.ready.then(pill);
  }

  /* ---------- Propietarios ---------- */
  function vPropietarios() {
    const n = (e) => pro.filter((p) => p.estado === e).length;
    return `<section class="view">
      ${head('Captación', 'Propietarios que quieren vender', 'Solicitudes llegadas desde el formulario “Quiero vender mi vivienda” de la web. Su web también genera cartera.')}
      <div class="funnel">
        <div class="box"><b>${n('nueva')}</b><span>Nuevas<br>solicitudes</span>${badge('nueva', 'Nueva')}</div>
        <div class="box"><b>${n('contactado')}</b><span>Propietarios<br>contactados</span>${badge('contactado', 'Contactado')}</div>
        <div class="box"><b>${n('valoración')}</b><span>Valoraciones<br>en curso</span>${badge('valoración', 'Valoración')}</div>
      </div>
      <div class="box tbl-wrap"><table class="tbl">
        <thead><tr><th>Nombre</th><th>Teléfono</th><th>Zona</th><th>Tipo de inmueble</th><th>Fecha de solicitud</th><th>Estado</th><th><span class="sr">Acciones</span></th></tr></thead>
        <tbody>${pro.map((p, i) => `<tr><td><div style="display:flex;align-items:center;gap:10px"><span class="av">${p.nombre[0]}</span><span class="cell-t">${p.nombre}</span></div></td>
          <td class="ref">${p.tel}</td><td>${p.zona}</td><td>${p.tipo}</td><td>${p.fecha}</td><td data-pst="${i}">${badge(p.estado, cap(p.estado))}</td>
          <td><div class="acts"><button class="b b--sm" data-pa="call">${ic.phone}Llamar</button><button class="b b--sm" data-pa="val" data-i="${i}">${ic.cal}Programar valoración</button></div></td></tr>`).join('')}</tbody>
      </table></div>
      <div class="pcards" data-mobile-only>${pro.map((p, i) => `<article class="box pcard"><div class="pcard__b">
          <div style="display:flex;align-items:center;gap:10px"><span class="av">${p.nombre[0]}</span><span><span class="cell-t">${p.nombre}</span><br><span class="cell-s">${p.tel}</span></span><span style="margin-left:auto" data-pst="${i}">${badge(p.estado, cap(p.estado))}</span></div>
          <span class="cell-s">${p.tipo} · ${p.zona} · ${p.fecha}</span></div>
          <div class="pcard__f"><button class="b b--sm" data-pa="call">${ic.phone}Llamar</button><button class="b b--sm" data-pa="val" data-i="${i}">${ic.cal}Valoración</button></div></article>`).join('')}</div>
      <div class="box origin">
        <div class="origin__form" aria-hidden="true"><b>Quiero vender mi vivienda</b><i></i><i></i><u>Enviar</u></div>
        <p><strong>¿De dónde salen?</strong> Del formulario de propietarios de la web pública. Cada solicitud entra aquí con nombre, teléfono, zona, tipo de inmueble y fecha, lista para llamar y convertir en un inmueble de la cartera. <a href="../#vender">Probar el formulario en la web →</a></p>
      </div>
    </section>`;
  }
  function bindPropietarios() {
    main.querySelector('.view').addEventListener('click', (e) => {
      const a = e.target.closest('[data-pa]'); if (!a) return;
      if (a.dataset.pa === 'call') return toast('Vista previa: en la versión final se iniciaría la llamada.');
      const i = +a.dataset.i; pro[i].estado = 'valoración';
      $$(`[data-pst="${i}"]`).forEach((c) => { c.innerHTML = badge('valoración', 'Valoración'); c.firstChild.classList.add('is-flip'); });
      counts();
      toast('Vista previa: valoración programada solo en esta pantalla. No se guarda nada.');
    });
  }

  /* ---------- Router ---------- */
  const views = {
    resumen: [vResumen, bindResumen], inmuebles: [vInmuebles, bindInmuebles], nuevo: [vNuevo, bindNuevo],
    consultas: [vConsultas, bindConsultas], propietarios: [vPropietarios, bindPropietarios]
  };
  const ind = $('[data-ind]');
  function route() {
    let k = location.hash.slice(1);
    if (!views[k]) k = 'resumen';
    main.innerHTML = views[k][0]();
    views[k][1]();
    $$('[data-view]').forEach((a) => { if (a.dataset.view === k) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    const on = $(`.side__nav [data-view="${k}"]`);
    if (on) { ind.style.height = on.offsetHeight + 'px'; ind.style.transform = `translateY(${on.offsetTop}px)`; }
    document.title = `${$('h1', main).textContent} · Vista previa del área de gestión · Giraldilla`;
    counts();
  }
  addEventListener('hashchange', () => { route(); main.focus({ preventScroll: true }); scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  addEventListener('resize', placeSegPill);
  route();
})();
