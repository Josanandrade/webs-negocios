/* Inmobiliaria Alves · ficha de inmueble (inmueble/?id=...) */
(function () {
  const { CONFIG, LISTINGS, fmtPrice } = window.ALVES;
  const UI = window.ALVES_UI;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = $('#fichaRoot');

  const id = new URLSearchParams(location.search).get('id');
  const l = LISTINGS.find((x) => x.id === id) || LISTINGS[0];
  const pics = [l.cover, ...l.gallery];
  const url = location.href.split('#')[0];

  document.title = `${l.title} en ${l.zone} · Inmobiliaria Alves`;
  $('[data-crumb]').textContent = l.title;

  const waText = `Hola, me interesa el inmueble ${l.ref} (${l.title}, ${l.zone}) que he visto en vuestra web: ${url}`;
  const isLocal = l.type === 'Local';
  const facts = [
    ['Tipo', l.type],
    ['Operación', l.op === 'venta' ? 'Venta' : 'Alquiler'],
    ['Superficie', `${l.m2} m²`],
    isLocal ? null : ['Dormitorios', l.beds],
    [isLocal ? 'Aseos' : 'Baños', l.baths],
    ['Zona', `${l.zone}, ${CONFIG.city}`],
    l.op === 'venta' ? ['Precio por m²', new Intl.NumberFormat('es-ES', { useGrouping: 'always' }).format(Math.round(l.price / l.m2)) + ' €/m²'] : null,
    ['Referencia', l.ref]
  ].filter(Boolean);

  root.innerHTML = `
    <section class="gal" aria-label="Galería de imágenes">
      <button class="gal__main" type="button" data-open="0" aria-label="Ver imagen a pantalla completa">
        <img src="../assets/img/${pics[0]}" alt="${l.title}" width="1200" height="800">
        <span class="tag tag--${l.op}">${l.op === 'venta' ? 'En venta' : 'En alquiler'}</span>
        <span class="gal__count">${UI.icon('area')}${pics.length} imágenes</span>
      </button>
      <div class="gal__thumbs">
        ${pics.slice(1, 5).map((p, i) => `<button type="button" data-open="${i + 1}" aria-label="Ver imagen ${i + 2}"><img src="../assets/img/${p}" alt="" loading="lazy" width="1200" height="800">${i === 3 && pics.length > 5 ? `<span>+${pics.length - 5}</span>` : ''}</button>`).join('')}
      </div>
    </section>

    <div class="ficha__grid">
      <article class="ficha__main">
        <header class="ficha__head">
          <p class="card__loc">${UI.icon('pin')}${l.zone}, ${CONFIG.city}<span class="ref">Ref. ${l.ref}</span></p>
          <h1 class="ficha__title">${l.title}</h1>
          <p class="ficha__price">${fmtPrice(l)}</p>
          <div class="ficha__keys">
            ${isLocal ? '' : `<span>${UI.icon('bed')}<b>${l.beds}</b> dormitorios</span>`}
            <span>${UI.icon('bath')}<b>${l.baths}</b> ${isLocal ? 'aseo' : 'baños'}</span>
            <span>${UI.icon('area')}<b>${l.m2}</b> m²</span>
          </div>
          <div class="ficha__tools">
            <button class="btn btn--ghost" type="button" data-fav="${l.id}" aria-pressed="${UI.isFav(l.id)}">${UI.icon('heart')}<span>Guardar</span></button>
            <button class="btn btn--ghost" type="button" data-share>Compartir</button>
          </div>
        </header>

        <section class="ficha__block">
          <h2>Descripción</h2>
          <p class="ficha__summary">${l.summary}</p>
          <p>${l.description}</p>
        </section>

        <section class="ficha__block">
          <h2>Características</h2>
          <dl class="facts">${facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
          <ul class="extras">${l.extras.map((x) => `<li>${UI.icon('check')}${x}</li>`).join('')}</ul>
        </section>

        <p class="ficha__demo">Inmueble de ejemplo creado para esta demo. Datos, precio e imágenes son ilustrativos.</p>
      </article>

      <aside class="ficha__side">
        <form class="visit" id="visitForm" novalidate>
          <p class="visit__price">${fmtPrice(l)}</p>
          <h2>¿Te interesa?</h2>
          <p class="visit__lead">Pide información o una visita. Te contestamos por WhatsApp o te llamamos.</p>
          <label class="field"><span>Nombre</span><input name="name" autocomplete="name" required></label>
          <label class="field"><span>Teléfono</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" required></label>
          <fieldset class="chips"><legend>Prefiero</legend><div>
            <label class="chip"><input type="radio" name="when" value="mañanas" checked><span>Mañanas</span></label>
            <label class="chip"><input type="radio" name="when" value="tardes"><span>Tardes</span></label>
            <label class="chip"><input type="radio" name="when" value="indiferente"><span>Me da igual</span></label>
          </div></fieldset>
          <label class="check"><input type="checkbox" name="ok" required><span>Acepto que Inmobiliaria Alves use estos datos para responder a mi solicitud.</span></label>
          <button class="btn btn--primary" type="submit">Pedir visita por WhatsApp</button>
          <a class="btn btn--ghost" data-tel href="#">${UI.icon('phone')}Llamar al ${CONFIG.phone}</a>
          <p class="wizard__err" role="alert"></p>
        </form>
      </aside>
    </div>

    <section class="sec similar" aria-label="Inmuebles similares">
      <div class="sec__head"><div><p class="eyebrow">También te puede interesar</p><h2 class="sec__title">Inmuebles similares</h2></div><a class="btn btn--ghost" href="../#inmuebles">Ver todos</a></div>
      <div class="grid" id="similar"></div>
    </section>`;

  // Similares: misma operación, priorizando misma zona o tipo.
  const sim = LISTINGS.filter((x) => x.id !== l.id && x.op === l.op)
    .sort((a, b) => ((b.zone === l.zone) + (b.type === l.type)) - ((a.zone === l.zone) + (a.type === l.type)))
    .slice(0, 3);
  $('#similar').innerHTML = sim.map((x, i) => UI.card(x, i)).join('');

  $$('[data-tel]').forEach((a) => { a.href = CONFIG.phoneHref; });
  $$('[data-wa-ficha]').forEach((a) => { a.href = UI.waLink(waText); a.target = '_blank'; a.rel = 'noopener'; });

  // Compartir
  $('[data-share]').addEventListener('click', async () => {
    if (navigator.share) { try { await navigator.share({ title: l.title, url }); } catch {} return; }
    try { await navigator.clipboard.writeText(url); UI.toast('Enlace copiado'); } catch { UI.toast(url); }
  });

  // Solicitud de visita
  const vf = $('#visitForm');
  vf.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    $$('input[required]', vf).forEach((inp) => {
      const bad = inp.type === 'checkbox' ? !inp.checked : !inp.value.trim();
      inp.classList.toggle('is-bad', bad);
      if (bad) ok = false;
    });
    const err = $('.wizard__err', vf);
    if (!ok) { err.textContent = 'Completa nombre, teléfono y acepta el uso de tus datos.'; return; }
    err.textContent = '';
    const fd = new FormData(vf);
    const msg = `Hola, soy ${fd.get('name')}. Me gustaría visitar el inmueble ${l.ref} (${l.title}, ${l.zone}). Prefiero ${fd.get('when')}.\n\nMi teléfono: ${fd.get('phone')}\n${url}`;
    window.open(UI.waLink(msg), '_blank', 'noopener');
    UI.toast('Abriendo WhatsApp…');
  });
  vf.addEventListener('input', (e) => e.target.classList && e.target.classList.remove('is-bad'));

  // Visor de imágenes
  const lb = $('#lightbox');
  const lbImg = $('img', lb);
  let cur = 0;
  function show(n) {
    cur = (n + pics.length) % pics.length;
    lbImg.classList.remove('is-in');
    lbImg.src = `../assets/img/${pics[cur]}`;
    lbImg.alt = `${l.title}, imagen ${cur + 1}`;
    requestAnimationFrame(() => lbImg.classList.add('is-in'));
    $('.lb__count', lb).textContent = `${cur + 1} / ${pics.length}`;
  }
  $$('[data-open]').forEach((b) => b.addEventListener('click', () => {
    show(+b.dataset.open);
    if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
    document.body.classList.add('no-scroll');
  }));
  const close = () => { lb.close ? lb.close() : lb.removeAttribute('open'); };
  lb.addEventListener('close', () => document.body.classList.remove('no-scroll'));
  $('[data-lb-close]', lb).addEventListener('click', close);
  $$('[data-lb]', lb).forEach((b) => b.addEventListener('click', () => show(cur + +b.dataset.lb)));
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  lb.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') show(cur + 1); if (e.key === 'ArrowLeft') show(cur - 1); });
  let sx = null;
  lb.addEventListener('pointerdown', (e) => { sx = e.clientX; });
  lb.addEventListener('pointerup', (e) => { if (sx !== null && Math.abs(e.clientX - sx) > 50) show(cur + (e.clientX < sx ? 1 : -1)); sx = null; });

  UI.reveal();
})();
