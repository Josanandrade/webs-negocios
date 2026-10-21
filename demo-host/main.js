(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA = '34652489038';

  // El punto final se coloca exactamente al final del trazo del hero
  const line = document.querySelector('.path__line');
  const end = document.querySelector('.path__end');
  if (line && end) {
    const pt = line.getPointAtLength(line.getTotalLength());
    end.setAttribute('cx', pt.x.toFixed(1));
    end.setAttribute('cy', pt.y.toFixed(1));
  }
  requestAnimationFrame(() => document.body.classList.add('is-loaded'));
  document.getElementById('year').textContent = new Date().getFullYear();

  // Cabecera con borde al hacer scroll
  const top = document.getElementById('top');
  const fab = document.getElementById('fab');
  const hero = document.getElementById('inicio');
  const contact = document.getElementById('contacto');
  let contactVisible = false;
  const onScroll = () => {
    const y = window.scrollY;
    top.classList.toggle('is-scrolled', y > 8);
    fab.classList.toggle('is-on', y > hero.offsetHeight * 0.7 && !contactVisible);
  };
  addEventListener('scroll', onScroll, { passive: true });

  // Menú móvil
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
    } else {
      menu.classList.remove('is-open');
      setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, 260);
    }
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // Revelado escalonado: los elementos que entran juntos se retrasan 60 ms entre sí
  const io = new IntersectionObserver((entries) => {
    const batch = entries.filter((e) => e.isIntersecting);
    batch.forEach((e, i) => {
      e.target.style.setProperty('--d', `${Math.min(i, 6) * 60}ms`);
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // Pestañas de metodología con píldora deslizante
  const tabs = [...document.querySelectorAll('.tabs [role="tab"]')];
  const pill = document.querySelector('.tabs__pill');
  const placePill = (btn) => {
    pill.style.setProperty('--x', `${btn.offsetLeft}px`);
    pill.style.setProperty('--y', `${btn.offsetTop}px`);
    pill.style.setProperty('--w', `${btn.offsetWidth}px`);
    pill.style.setProperty('--h', `${btn.offsetHeight}px`);
  };
  const select = (btn, focus) => {
    tabs.forEach((t) => {
      const on = t === btn;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      panel.classList.toggle('is-active', on);
    });
    placePill(btn);
    if (focus) btn.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      select(tabs[(i + d + tabs.length) % tabs.length], true);
    });
  });
  const current = () => tabs.find((t) => t.getAttribute('aria-selected') === 'true');
  // Primera colocación sin transición
  pill.style.transition = 'none';
  placePill(current());
  requestAnimationFrame(() => requestAnimationFrame(() => { pill.style.transition = ''; }));
  addEventListener('resize', () => placePill(current()));
  document.fonts && document.fonts.ready.then(() => placePill(current()));

  // Proceso: la línea se rellena según el scroll
  const steps = document.getElementById('steps');
  const fill = document.getElementById('stepsFill');
  const stepEls = [...steps.querySelectorAll('.step')];
  let ticking = false;
  const updateSteps = () => {
    ticking = false;
    const r = steps.getBoundingClientRect();
    const mid = innerHeight * 0.6;
    const p = Math.max(0, Math.min(1, (mid - r.top) / r.height));
    fill.style.setProperty('--p', p.toFixed(3));
    stepEls.forEach((s) => {
      const n = s.querySelector('.step__n').getBoundingClientRect();
      s.classList.toggle('is-on', n.top + n.height / 2 < mid);
    });
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateSteps); } }, { passive: true });
  updateSteps();

  // FAQ: <details> con apertura y cierre animados
  document.querySelectorAll('.qa').forEach((d) => {
    const s = d.querySelector('summary');
    const a = d.querySelector('.qa__a');
    s.addEventListener('click', (e) => {
      e.preventDefault();
      if (d.open) {
        d.classList.remove('is-open');
        const done = () => { if (!d.classList.contains('is-open')) d.open = false; };
        if (reduce) done(); else a.addEventListener('transitionend', done, { once: true });
      } else {
        d.open = true;
        requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('is-open')));
      }
    });
  });

  // Cierre: trazo al entrar
  const closing = document.querySelector('.closing__inner');
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { closing.classList.add('is-in'); o.disconnect(); } }, { threshold: 0.4 }).observe(closing);

  // FAB oculto cuando el formulario está a la vista
  new IntersectionObserver(([e]) => { contactVisible = e.isIntersecting; onScroll(); }, { threshold: 0.2 }).observe(contact);

  // Mensaje de WhatsApp compuesto
  const form = document.getElementById('composer');
  const preview = document.getElementById('preview');
  const chips = [...form.querySelectorAll('.chip')];
  const build = () => {
    const nombre = form.nombre.value.trim();
    const curso = form.curso.value.trim();
    const temas = chips.filter((c) => c.getAttribute('aria-pressed') === 'true').map((c) => c.textContent.trim().toLowerCase());
    let msg = `Hola Lola${nombre ? `, soy ${nombre}` : ''}. Me gustaría recibir información sobre el acompañamiento pedagógico`;
    if (curso) msg += ` para mi hijo/a, que está en ${curso}`;
    msg += '.';
    if (temas.length) {
      const list = temas.length > 1 ? `${temas.slice(0, -1).join(', ')} y ${temas.at(-1)}` : temas[0];
      msg += temas.includes('aún no lo sé') && temas.length === 1
        ? '\nTodavía no tenemos claro qué trabajar, nos gustaría hablarlo.'
        : `\nNos gustaría trabajar: ${list}.`;
    }
    return msg;
  };
  const refresh = () => { preview.textContent = build(); };
  chips.forEach((c) => c.addEventListener('click', () => {
    c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true'));
    refresh();
  }));
  form.addEventListener('input', refresh);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(build())}`, '_blank', 'noopener');
  });

  onScroll();
})();
