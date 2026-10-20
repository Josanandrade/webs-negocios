/* Inmomairena · ficha de inmueble (/inmueble/?id=...) */
(function () {
  const { CONFIG, Store, fmt, img } = window.IM;
  const { $, $$, esc, icon, card, waLink, wireContact, wireHeader, wireForm, map, toast, BASE } = window.UI;

  wireHeader();
  const root = $('#det');
  const id = new URLSearchParams(location.search).get('id');
  const all = Store.all();
  const p = all.find(x => x.id === id) || (!id ? all.find(x => x.featured) : null);

  if (!p) {
    root.innerHTML = `<div class="notfound"><p class="eyebrow">Inmueble no encontrado</p><h1 class="det__t">Este inmueble ya no está publicado</h1><p class="sh__p">Puede que se haya vendido o retirado. Echa un vistazo al resto de la cartera.</p><a class="btn btn--ink" href="../#inmuebles">Ver inmuebles</a></div>`;
    $('#stickyCta').remove();
    wireContact();
    return;
  }

  document.title = `${p.title} · ${p.town} · Inmomairena`;
  const photos = [p.cover, ...(p.gallery || [])].filter(Boolean);
  const closed = p.status === 'vendido' || p.status === 'alquilado';
  const price = new Intl.NumberFormat('es-ES').format(p.price);
  const msg = `Hola, me interesa el inmueble "${p.title}" (${p.area ? p.area + ', ' : ''}${p.town}, ${fmt.price(p)}). ¿Me podéis dar más información?`;
  $('#stickyWa').dataset.waText = msg;

  const tags = [`<span class="tag tag--op-${p.op}">${fmt.op(p)}</span>`];
  tags.push(`<span class="tag tag--${p.status}"><i></i>${fmt.status(p)}</span>`);
  if (p.featured && p.status === 'disponible') tags.push('<span class="tag tag--star">Destacado</span>');

  const facts = [];
  if (p.beds) facts.push(['bed', p.beds, p.beds === 1 ? 'Dormitorio' : 'Dormitorios']);
  if (p.baths) facts.push(['bath', p.baths, p.baths === 1 ? 'Baño' : 'Baños']);
  if (p.m2) facts.push(['area', `${p.m2} m²`, 'Construidos']);
  facts.push(p.plot ? ['plot', `${new Intl.NumberFormat('es-ES').format(p.plot)} m²`, 'Parcela'] : ['home', p.type, 'Tipo']);

  const perM2 = p.op === 'venta' && p.m2 ? `${new Intl.NumberFormat('es-ES').format(Math.round(p.price / p.m2))} €/m²` : '';
  function ref(s) { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 9000; return 1000 + h; }
  const pt = p.map && p.map.x ? p.map : null;

  root.innerHTML = `
    <nav class="crumbs" aria-label="Ruta"><a href="../#inmuebles">${icon('back')}Inmuebles</a><span>/</span><span>${esc(p.town)}</span></nav>
    <section class="gal" aria-label="Galería de fotos">
      <div class="gal__tags">${tags.join('')}</div>
      <div class="gal__track" id="galTrack">
        ${photos.map((src, i) => `<figure class="gal__slide" data-i="${i}" style="margin:0"><img src="${esc(img(src, BASE))}" alt="${esc(p.title)}, foto ${i + 1}" ${i ? 'loading="lazy"' : ''}></figure>`).join('')}
      </div>
      <div class="gal__nav"><button class="ib" data-d="-1" aria-label="Foto anterior">${icon('back')}</button><button class="ib" data-d="1" aria-label="Foto siguiente">${icon('arrow')}</button></div>
      <span class="gal__count">${icon('image')}<span id="galN">1</span> / ${photos.length}</span>
    </section>
    <div class="thumbs" id="thumbs">${photos.map((src, i) => `<button class="${i ? '' : 'is-on'}" data-i="${i}" aria-label="Ver foto ${i + 1}"><img src="${esc(img(src, BASE))}" alt="" loading="lazy"></button>`).join('')}</div>

    <div class="det__grid">
      <div class="det__main">
        <header class="det__head">
          <span class="pcard__loc">${icon('pin')}${esc(p.area ? `${p.area} · ${p.town}` : p.town)}</span>
          <h1 class="det__t">${esc(p.title)}</h1>
          <div class="det__price${closed ? ' is-closed' : ''}"><span>${price} €${p.op === 'alquiler' ? '<small> /mes</small>' : ''}</span>${perM2 ? `<small>${perM2}</small>` : ''}</div>
          <span class="ref">Ref. IM-${ref(p.id)} · ${esc(p.type)}</span>
        </header>
        <div class="facts">${facts.map(([ic, v, l]) => `<div class="fact">${icon(ic)}<strong>${esc(v)}</strong><span>${l}</span></div>`).join('')}</div>

        <section class="det__sec">
          <h2>Descripción</h2>
          <p class="det__desc">${esc(p.description || p.summary)}</p>
        </section>

        ${p.features && p.features.length ? `<section class="det__sec"><h2>Características</h2><ul class="feats">${p.features.map(f => `<li>${icon('check')}${esc(f)}</li>`).join('')}</ul></section>` : ''}

        <section class="det__sec">
          <h2>Ubicación aproximada</h2>
          <div class="det__map">${map({ focus: p.town, point: pt })}</div>
          <p class="det__mapnote">${esc(p.area ? `${p.area}, ${p.town}` : p.town)}. Por privacidad mostramos la zona; la dirección exacta se facilita al concertar la visita.</p>
        </section>
      </div>

      <aside class="aside" id="info">
        <form class="card-form" id="infoForm" novalidate data-ok="¡Solicitud enviada! Te contactamos para darte información y concertar visita.">
          <div class="agent"><span class="agent__ava">im</span><div><strong>Inmomairena</strong><span>Te respondemos lo antes posible</span></div></div>
          <h3 style="font-size:21px;letter-spacing:-.03em">${closed ? 'Este inmueble ya no está disponible' : '¿Te interesa este inmueble?'}</h3>
          ${closed ? '<p class="det__mapnote">Déjanos tus datos y te avisamos de inmuebles parecidos en la zona.</p>' : ''}
          <label class="f"><span>Nombre</span><input name="nombre" required autocomplete="name" placeholder="Tu nombre"></label>
          <label class="f"><span>Teléfono</span><input name="tel" required type="tel" inputmode="tel" autocomplete="tel" placeholder="600 000 000"></label>
          <label class="f"><span>Email</span><input name="email" type="email" autocomplete="email" placeholder="tu@email.com"></label>
          <label class="f"><span>Mensaje</span><textarea name="mensaje" rows="3">${esc(closed ? `Me interesan inmuebles parecidos a "${p.title}".` : `Me interesa "${p.title}". ¿Podemos concertar una visita?`)}</textarea></label>
          <label class="check"><input type="checkbox" required><span>Acepto que me contactéis sobre este inmueble.</span></label>
          <button class="btn btn--sun btn--block btn--lg" type="submit">Quiero información${icon('arrow')}</button>
          ${CONFIG.whatsapp ? `<a class="btn btn--wa btn--block" href="${waLink(msg)}" target="_blank" rel="noopener">${icon('wa')}Preguntar por WhatsApp</a>` : ''}
          <a class="btn btn--line btn--block" data-phone href="tel:+34633573599">${icon('phone')}<span data-phone-text>633 57 35 99</span></a>
          <button class="btn btn--block" type="button" id="share" style="--h:40px;color:var(--mute)">${icon('share')}Compartir este inmueble</button>
          <p class="card-form__note">Demo: el formulario no envía datos.</p>
        </form>
      </aside>
    </div>

    <section class="similar" id="similar"></section>`;

  wireContact();
  wireForm($('#infoForm'));

  // ---------- Galería ----------
  const track = $('#galTrack');
  let cur = 0;
  const go = (i) => { cur = (i + photos.length) % photos.length; track.scrollTo({ left: track.clientWidth * cur, behavior: 'smooth' }); };
  track.addEventListener('scroll', () => {
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== cur) cur = i;
    $('#galN').textContent = i + 1;
    $$('#thumbs button').forEach((b, k) => b.classList.toggle('is-on', k === i));
  }, { passive: true });
  $$('.gal__nav .ib').forEach(b => b.addEventListener('click', () => go(cur + +b.dataset.d)));
  $$('#thumbs button').forEach(b => b.addEventListener('click', () => go(+b.dataset.i)));

  // Lightbox
  const lb = $('#lb'), lbImg = $('#lbImg');
  let li = 0;
  const lbShow = (i) => { li = (i + photos.length) % photos.length; lbImg.src = img(photos[li], BASE); $('#lbCount').textContent = `${li + 1} / ${photos.length}`; };
  const lbOpen = (i) => { lbShow(i); lb.classList.add('is-on'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; $('#lbClose').focus(); };
  const lbClose = () => { lb.classList.remove('is-on'); lb.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
  $$('.gal__slide').forEach(s => s.addEventListener('click', () => lbOpen(+s.dataset.i)));
  $('#lbClose').addEventListener('click', lbClose);
  $$('.lb__nav button').forEach(b => b.addEventListener('click', () => lbShow(li + +b.dataset.d)));
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('is-on')) return;
    if (e.key === 'Escape') lbClose();
    if (e.key === 'ArrowRight') lbShow(li + 1);
    if (e.key === 'ArrowLeft') lbShow(li - 1);
  });
  let sx = 0;
  lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) lbShow(li + (dx < 0 ? 1 : -1)); });

  // Compartir
  $('#share').addEventListener('click', async () => {
    const data = { title: p.title, text: `${p.title} · ${fmt.price(p)}`, url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(location.href); toast('Enlace copiado'); }
    } catch (e) { /* cancelado */ }
  });

  // Barra fija móvil: aparece al pasar la galería y se oculta sobre el formulario
  const sticky = $('#stickyCta');
  const info = $('#info');
  let infoVisible = false;
  new IntersectionObserver(([en]) => { infoVisible = en.isIntersecting; upd(); }).observe(info);
  function upd() { sticky.classList.toggle('is-on', window.scrollY > 260 && !infoVisible); }
  window.addEventListener('scroll', upd, { passive: true });

  // ---------- Similares ----------
  const sim = all.filter(x => x.id !== p.id && x.status !== 'vendido' && x.status !== 'alquilado')
    .map(x => ({ x, s: (x.op === p.op ? 2 : 0) + (x.town === p.town ? 1 : 0) + (x.type === p.type ? 1 : 0) }))
    .sort((a, b) => b.s - a.s).slice(0, 3).map(o => o.x);
  if (sim.length) $('#similar').innerHTML = `<h2>También te puede interesar</h2><div class="grid">${sim.map(card).join('')}</div>`;
})();
