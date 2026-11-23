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

/* Formulario final: sin JS envía a wa.me por GET; con JS añade el número. */
document.querySelectorAll('[data-wa-form]').forEach((form) => {
  form.action = 'https://wa.me/' + WHATSAPP_NUMBER;
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
