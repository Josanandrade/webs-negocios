/* ==========================================================================
   CONFIGURACIÓN DE WHATSAPP
   --------------------------------------------------------------------------
   PENDIENTE: el número de WhatsApp de Margot NO aparece en el documento.
   Escríbelo aquí con prefijo internacional, solo dígitos, sin "+" ni espacios.
   Ejemplo: '34600111222'
   Mientras esté vacío, los botones abren WhatsApp con el mensaje escrito
   para que se elija el contacto a mano (sirve para probar el texto).
   ========================================================================== */
const WHATSAPP_NUMBER = '';

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

/* Menú móvil */
const toggle = document.querySelector('.nav__toggle');
const menu = document.getElementById('menu');
if (toggle && menu) {
  const close = () => { toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = 'Menú'; document.body.classList.remove('menu-open'); };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Cerrar' : 'Menú';
    document.body.classList.toggle('menu-open', open);
  });
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { close(); toggle.focus(); } });
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

/* Transición entre secciones: al entrar cada sección se dibuja su línea superior. */
const sections = document.querySelectorAll('[data-section]');
if (reduce || !('IntersectionObserver' in window)) {
  sections.forEach((el) => el.classList.add('is-in'));
} else {
  const so = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); so.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -15% 0px' });
  sections.forEach((el) => so.observe(el));
}

/* Cabecera camaleón: toma el color de fondo del bloque que tiene justo debajo
   (negro en la portada y el cierre, beige en las bandas, blanco en el resto).
   Los bloques oscuros llevan data-tone="night" para pasar el texto a claro. */
const nav = document.querySelector('[data-nav]');
if (nav && document.elementsFromPoint) {
  const bgOf = (el) => {
    for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
      const c = getComputedStyle(n).backgroundColor;
      if (c && c !== 'transparent' && !/rgba?\(.*,\s*0\)$/.test(c)) return { color: c, node: n };
    }
    return { color: getComputedStyle(document.body).backgroundColor, node: document.body };
  };
  let ticking = false;
  let last = '';
  const paint = () => {
    ticking = false;
    const y = nav.getBoundingClientRect().bottom + 1;
    const hit = document.elementsFromPoint(window.innerWidth / 2, y)
      .find((el) => !nav.contains(el) && !el.closest('[data-dock]'));
    if (!hit) return;
    const { color, node } = bgOf(hit);
    const night = Boolean(node.closest('[data-tone="night"]'));
    const key = color + night;
    if (key === last) return;
    last = key;
    nav.style.setProperty('--nav-bg', color);
    nav.classList.toggle('is-night', night);
  };
  const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  addEventListener('load', queue);
  paint();
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
