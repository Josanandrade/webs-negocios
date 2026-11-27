/* ==========================================================================
   CONFIGURACIÓN DE WHATSAPP
   --------------------------------------------------------------------------
   PENDIENTE: el número de WhatsApp de Margot NO aparece en el documento.
   Escríbelo aquí con prefijo internacional, solo dígitos, sin "+" ni espacios.
   Ejemplo: '34600111222'
   Mientras esté vacío, los botones abren WhatsApp con el mensaje escrito
   para que se elija el contacto a mano (sirve para probar el texto).
   ========================================================================== */
const WHATSAPP_NUMBER = '34727740824';

const WA_GREETING = 'Hola, Margot. He visto tu web y me gustaría recibir información sobre ';
const WA_DEFAULT_TOPIC = 'tus tratamientos';

function waUrl(topic) {
  const text = WA_GREETING + (topic || WA_DEFAULT_TOPIC) + '.';
  const base = 'https://wa.me/' + WHATSAPP_NUMBER;
  return base + '?text=' + encodeURIComponent(text);
}

if (!WHATSAPP_NUMBER) {
  console.warn('[Margot Ibáñez] Falta el número de WhatsApp: edita WHATSAPP_NUMBER en main.js');
}

/* Enlaces de WhatsApp: cada [data-wa] lleva el tratamiento en el mensaje. */
document.querySelectorAll('[data-wa]').forEach((a) => {
  a.href = waUrl(a.dataset.wa);
  a.target = '_blank';
  a.rel = 'noopener';
  if (!a.querySelector('.visually-hidden')) {
    const note = document.createElement('span');
    note.className = 'visually-hidden';
    note.textContent = ' (abre WhatsApp)';
    a.append(note);
  }
});

/* ==========================================================================
   FORMULARIO DE CONTACTO POR EMAIL (Web3Forms)
   --------------------------------------------------------------------------
   La clave va en index.html, en <input name="access_key" value="">.
   Con clave: envía el mensaje a Web3Forms, que lo reenvía al correo de Margot.
   Sin clave: valida, pero avisa de que aún no está activo y remite a WhatsApp.
   ========================================================================== */
const MAIL_ENDPOINT = 'https://api.web3forms.com/submit';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

document.querySelectorAll('[data-mail-form]').forEach((form) => {
  const status = form.querySelector('[data-mail-status]');
  const button = form.querySelector('button[type="submit"]');
  const key = form.elements.access_key;
  const live = () => Boolean(key && key.value.trim());

  if (!live()) {
    console.warn('[Margot Ibáñez] Formulario sin clave de Web3Forms: el formulario no envía. Ver access_key en index.html');
  }

  const fields = {
    nombre: (v) => (v.trim().length >= 2 ? '' : 'Escribe tu nombre.'),
    email: (v) => (!v.trim() ? 'Escribe tu email para poder responderte.' : EMAIL_RE.test(v.trim()) ? '' : 'Revisa el email: parece incompleto.'),
    telefono: (v) => (!v.trim() || /^[+\d][\d\s().-]{6,}$/.test(v.trim()) ? '' : 'Revisa el teléfono o déjalo en blanco.'),
    mensaje: (v) => (v.trim().length >= 5 ? '' : 'Cuéntame en unas palabras qué te gustaría saber.'),
  };

  const setError = (el, msg) => {
    const err = document.getElementById(el.getAttribute('aria-describedby'));
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) { err.textContent = msg; err.hidden = !msg; }
  };

  const check = (el) => {
    const msg = el.type === 'checkbox'
      ? (el.checked ? '' : 'Necesito tu permiso para responderte.')
      : fields[el.name](el.value);
    setError(el, msg);
    return !msg;
  };

  const inputs = [...Object.keys(fields).map((n) => form.elements[n]), form.elements.consentimiento];
  inputs.forEach((el) => {
    el.addEventListener('blur', () => { if (el.value || el.getAttribute('aria-invalid') === 'true') check(el); });
    el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') check(el); });
    el.addEventListener('change', () => { if (el.type === 'checkbox') check(el); });
  });

  const say = (text, state) => { status.textContent = text; status.dataset.state = state || ''; };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (button.getAttribute('aria-disabled') === 'true') return;
    const bad = inputs.filter((el) => !check(el));
    if (bad.length) { say(''); bad[0].focus(); return; }
    if (form.elements.botcheck.checked) return; /* bot */

    const data = Object.fromEntries(new FormData(form));
    const name = data.nombre.trim();
    data.subject = 'Consulta web: ' + data.tratamiento + ' (' + name + ')';

    if (!live()) {
      say('El formulario aún no está activo. Mientras tanto, escríbeme por WhatsApp y te respondo encantada.', 'error');
      return;
    }

    button.setAttribute('aria-disabled', 'true');
    const label = button.textContent;
    button.textContent = 'Enviando…';
    say('');
    try {
      const res = await fetch(MAIL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.message || res.status);
      form.reset();
      inputs.forEach((el) => setError(el, ''));
      say('Gracias, ' + name + '. Tu mensaje me ha llegado y te responderé lo antes posible.', 'ok');
    } catch (err) {
      console.error('[Margot Ibáñez] Error al enviar el formulario', err);
      say('No se ha podido enviar el mensaje. Vuelve a intentarlo en un momento o escríbeme por WhatsApp.', 'error');
    } finally {
      button.removeAttribute('aria-disabled');
      button.textContent = label;
    }
  });
});

/* ==========================================================================
   VÍDEOS: la sección aparece en cuanto tiene un vídeo dentro.
   YouTube y Vimeo no se cargan hasta que se pulsa "Reproducir".
   ========================================================================== */
document.querySelectorAll('[data-videos]').forEach((sec) => {
  if (sec.querySelector('.video')) sec.hidden = false;
});

document.querySelectorAll('[data-embed]').forEach((btn) => {
  const id = encodeURIComponent(btn.dataset.id || '');
  const provider = btn.dataset.embed;
  const img = btn.querySelector('img');
  if (provider === 'youtube' && img && !img.getAttribute('src')) img.src = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
  btn.addEventListener('click', () => {
    const src = provider === 'vimeo'
      ? 'https://player.vimeo.com/video/' + id + '?autoplay=1&dnt=1'
      : 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
    const frame = document.createElement('iframe');
    frame.src = src;
    frame.title = btn.dataset.title || 'Vídeo';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.loading = 'lazy';
    btn.replaceWith(frame);
    frame.focus();
  });
});

/* ==========================================================================
   Galerías: una por tratamiento (labios con labios, ojos con ojos) + visor a pantalla completa.
   Los huecos vacíos (.gallery__item--empty) se quitan en cuanto hay material real.
   ========================================================================== */
const GALLERY_PAGE = window.matchMedia('(max-width: 54rem)').matches ? 6 : 8;
document.querySelectorAll('[data-gallery]').forEach((g) => {
  if (g.querySelector('.gallery__item:not(.gallery__item--empty)')) {
    g.querySelectorAll('.gallery__item--empty').forEach((el) => el.remove());
  }
  const grid = g.querySelector('[data-gallery-grid]');
  const more = g.querySelector('[data-gallery-more]');
  if (!grid) return;
  g.hidden = !grid.querySelector('.gallery__item');
  const all = [...grid.querySelectorAll('.gallery__item')];
  let filter = 'all';
  let expanded = false;
  const apply = () => {
    const match = all.filter((it) => filter === 'all' || it.dataset.set === filter);
    all.forEach((it) => { it.hidden = true; });
    match.forEach((it, i) => { it.hidden = !expanded && i >= GALLERY_PAGE; });
    const rest = match.length - GALLERY_PAGE;
    if (more) {
      more.hidden = expanded || rest <= 0;
      more.textContent = `Ver ${rest} más`;
    }
  };
  g.dataset.filter = filter;
  g.querySelectorAll('[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      filter = btn.dataset.filter;
      g.dataset.filter = filter;
      expanded = false;
      g.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      apply();
    });
  });
  if (more) {
    more.addEventListener('click', () => {
      const first = all.find((it) => it.hidden && (filter === 'all' || it.dataset.set === filter));
      expanded = true;
      apply();
      if (first) first.querySelector('button').focus();
    });
  }
  apply();
});

const lightbox = document.querySelector('[data-lightbox]');
if (lightbox && typeof lightbox.showModal === 'function') {
  const stage = lightbox.querySelector('[data-lightbox-stage]');
  const count = lightbox.querySelector('[data-lightbox-count]');
  let items = [];
  let index = 0;
  let opener = null;

  const render = () => {
    const btn = items[index];
    const img = btn.querySelector('img');
    stage.replaceChildren();
    if (btn.dataset.video) {
      const v = document.createElement('video');
      v.src = btn.dataset.video;
      v.controls = true;
      v.playsInline = true;
      v.autoplay = true;
      v.preload = 'metadata';
      if (img) v.poster = img.currentSrc || img.src;
      if (img && img.alt) v.setAttribute('aria-label', img.alt);
      stage.append(v);
    } else {
      const big = document.createElement('img');
      big.src = btn.dataset.full || (img && (btn.classList.contains('mosaic__open') ? img.src : (img.currentSrc || img.src)));
      big.alt = img ? img.alt : '';
      big.decoding = 'async';
      stage.append(big);
    }
    count.textContent = items.length > 1 ? `${index + 1} / ${items.length}` : '';
    lightbox.toggleAttribute('data-single', items.length < 2);
  };
  const go = (d) => { index = (index + d + items.length) % items.length; render(); };

  /* delegado: vale también para fotos añadidas después (modo edición) */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-gallery] .gallery__open, [data-mosaic] .mosaic__open');
    if (!btn || e.defaultPrevented) return;
    const mosaic = btn.closest('[data-mosaic]');
    if (mosaic && document.documentElement.hasAttribute('data-editing')) return;
    const g = mosaic || btn.closest('[data-gallery]');
    items = mosaic ? [...g.querySelectorAll('.mosaic__open')] : [...g.querySelectorAll('.gallery__item .gallery__open')];
    index = Math.max(0, items.indexOf(btn));
    if (!items.length) return;
    opener = btn;
    render();
    lightbox.showModal();
  });
  lightbox.querySelector('[data-lightbox-close]').addEventListener('click', () => lightbox.close());
  lightbox.querySelector('[data-lightbox-prev]').addEventListener('click', () => go(-1));
  lightbox.querySelector('[data-lightbox-next]').addEventListener('click', () => go(1));
  lightbox.addEventListener('keydown', (e) => {
    if (items.length < 2) return;
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'ArrowRight') go(1);
  });
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox || e.target === stage) lightbox.close(); });
  lightbox.addEventListener('close', () => {
    stage.replaceChildren();
    if (opener) opener.focus();
  });
}

/* Mapa de respaldo con teselas de OpenStreetMap (sin iframe): se ve aunque el mapa de Google no cargue. */
document.querySelectorAll('[data-osm]').forEach((box) => {
  const lat = Number(box.dataset.lat), lon = Number(box.dataset.lon), z = Number(box.dataset.zoom) || 17;
  const n = 256 * 2 ** z;
  const px = ((lon + 180) / 360) * n;
  const r = (lat * Math.PI) / 180;
  const py = ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * n;
  const draw = () => {
    const w = box.clientWidth, h = box.clientHeight;
    if (!w || !h) return;
    const left = px - w / 2, top = py - h / 2;
    const pin = box.querySelector('.donde__pin');
    box.replaceChildren(pin);
    for (let tx = Math.floor(left / 256); tx * 256 < left + w; tx++) {
      for (let ty = Math.floor(top / 256); ty * 256 < top + h; ty++) {
        const img = new Image();
        img.alt = '';
        img.decoding = 'async';
        img.src = `https://tile.openstreetmap.org/${z}/${tx}/${ty}.png`;
        img.style.left = `${Math.round(tx * 256 - left)}px`;
        img.style.top = `${Math.round(ty * 256 - top)}px`;
        box.insertBefore(img, pin);
      }
    }
  };
  draw();
  let t = 0;
  addEventListener('resize', () => { clearTimeout(t); t = setTimeout(draw, 200); });
});

/* Mosaico de Margot: las fotos se desplazan un poco siguiendo el ratón. */
document.querySelectorAll('[data-mosaic]').forEach((m) => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const tiles = [...m.querySelectorAll('[data-depth]')];
  let raf = 0;
  m.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || document.documentElement.hasAttribute('data-editing')) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = m.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tiles.forEach((t) => { const d = Number(t.dataset.depth) || 0; t.style.translate = `${(x * d).toFixed(1)}px ${(y * d).toFixed(1)}px`; });
    });
  });
  m.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); tiles.forEach((t) => { t.style.translate = ''; }); });
});

/* Menú móvil: botón centrado que despliega el menú claro */
const nav = document.querySelector('[data-nav]');
const toggle = document.querySelector('.nav__toggle');
const menu = document.getElementById('menu');
if (nav && toggle && menu) {
  const label = toggle.querySelector('.nav__toggle-label');
  const set = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (label) label.textContent = open ? 'Cerrar' : 'Menú';
  };
  toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { set(false); toggle.focus(); } });
  /* sombra suave cuando el menú queda fijo arriba */
  const onScroll = () => nav.classList.toggle('is-stuck', nav.getBoundingClientRect().top <= 0 && window.scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* Pestañas de tratamientos (sin JS se ven todos los paneles seguidos). */
document.querySelectorAll('[data-switch]').forEach((sw) => {
  const tabs = [...sw.querySelectorAll('[role="tab"]')];
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      if (on) panel.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-in'));
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      let j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') j = 0;
      if (e.key === 'End') j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); select(tabs[j], true); }
    });
  });
  select(tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0]);
  sw.classList.add('is-tabs');

  document.querySelectorAll('[data-tab]').forEach((a) => {
    a.addEventListener('click', () => { const t = document.getElementById(a.dataset.tab); if (t) select(t); });
  });
});

/* Aparición progresiva al hacer scroll. Respeta prefers-reduced-motion. */
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealables = document.querySelectorAll('[data-reveal]');
if (reduce || !('IntersectionObserver' in window)) {
  revealables.forEach((el) => el.classList.add('is-in'));
} else {
  /* Escalonado: índice dentro de su grupo de hermanos */
  revealables.forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal'));
    el.style.setProperty('--i', Math.min(sibs.indexOf(el), 5));
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revealables.forEach((el) => io.observe(el));
}

/* Barra fija de WhatsApp en móvil: aparece tras la portada y se oculta en el cierre. */
const dock = document.querySelector('[data-dock]');
const finalSection = document.getElementById('consulta');
const hero = document.querySelector('.hero');
if (dock && finalSection && hero && 'IntersectionObserver' in window) {
  dock.classList.add('is-early');
  new IntersectionObserver(([e]) => dock.classList.toggle('is-early', e.isIntersecting), { threshold: 0.35 }).observe(hero);
  new IntersectionObserver(([e]) => dock.classList.toggle('is-away', e.isIntersecting), { threshold: 0.15 }).observe(finalSection);
}

document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
