// Donna Bella · Gines — interacciones de la demo
(() => {
  // Teléfono confirmado (ficha pública). WhatsApp sin confirmar: rellenar con
  // el número móvil del salón (formato 346XXXXXXXX) para activar el envío directo.
  const TEL = '+34854529901';
  const WHATSAPP = '';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* nav */
  const nav = $('#nav');
  const burger = $('.nav__burger');
  const menu = $('#menu-movil');
  const fab = $('.fab');
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', scrollY > 10);
    fab.classList.toggle('is-on', scrollY > innerHeight * 0.6);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  burger.addEventListener('click', () => {
    const open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    menu.hidden = open;
  });
  $$('a', menu).forEach(a => a.addEventListener('click', () => {
    burger.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  }));

  /* reveal */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('is-in'));
  }

  /* estado de hoy (hora de Madrid) */
  const madrid = () => {
    const parts = new Intl.DateTimeFormat('es-ES', {
      timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date());
    const get = t => parts.find(p => p.type === t)?.value;
    const map = { lun: 1, mar: 2, mié: 3, jue: 4, vie: 5, sáb: 6, dom: 0 };
    const wd = map[(get('weekday') || '').replace('.', '').slice(0, 3)] ?? new Date().getDay();
    return { wd, mins: Number(get('hour')) * 60 + Number(get('minute')) };
  };
  const hoy = $('#hoy-estado');
  if (hoy) {
    const { wd, mins } = madrid();
    const laborable = wd >= 1 && wd <= 5;
    if (laborable && mins >= 600 && mins < 1170) hoy.textContent = 'Abierto ahora, hasta las 19:30';
    else if (laborable && mins < 600) hoy.textContent = 'Abrimos hoy a las 10:00';
    else if (wd >= 1 && wd <= 4) hoy.textContent = 'Mañana abrimos a las 10:00';
    else hoy.textContent = 'El lunes abrimos a las 10:00';
  }

  /* diagnóstico de melena */
  const RECO = {
    color: {
      liso: ['Coloración', 'Revisamos tu base y tus canas y elegimos un tono que favorezca a tu piel. En liso, el brillo del color se nota todavía más.'],
      ondulado: ['Coloración', 'Un color con matices da profundidad a la onda. Te proponemos tono y mantenimiento antes de empezar.'],
      rizado: ['Coloración', 'Color pensado para rizo: cuidando la fibra para que el rizo no pierda forma ni hidratación.']
    },
    encrespado: {
      liso: ['Alisado permanente', 'Si el liso se te encrespa con la humedad, el alisado permanente lo deja manejable durante meses.'],
      ondulado: ['Alisado permanente', 'Para quien quiere olvidarse de la plancha: liso duradero y sin encrespado.'],
      rizado: ['Rizos', '¿Quieres mantener el rizo pero sin encrespado? Empezaríamos definiéndolo con corte y técnica para rizo.']
    },
    largo: {
      liso: ['Extensiones', 'Más largo o más densidad desde el primer día, integradas con tu tono.'],
      ondulado: ['Extensiones', 'Elegimos extensiones que acompañen tu onda para que no se note dónde empiezan.'],
      rizado: ['Extensiones', 'Buscamos una textura que case con tu rizo para un resultado natural.']
    },
    forma: {
      liso: ['Corte de mujer', 'Un corte con líneas limpias que se mantenga bien en el día a día.'],
      ondulado: ['Permanente', 'Si te falta cuerpo, una permanente suave da forma y volumen al corte.'],
      rizado: ['Rizos', 'Corte específico para rizo, respetando cómo cae cada mechón.']
    },
    evento: {
      liso: ['Trenzas', 'Un trenzado o recogido que aguante toda la celebración.'],
      ondulado: ['Trenzas', 'Las trenzas sobre pelo ondulado quedan con más textura y duran más.'],
      rizado: ['Trenzas', 'Trenzados que aprovechan el volumen del rizo, perfectos para un evento.']
    }
  };
  const state = { tipo: 'liso', meta: 'color' };
  const res = $('#diag-result');
  const paint = () => {
    const [svc, why] = RECO[state.meta][state.tipo];
    $('#diag-service').textContent = svc;
    $('#diag-why').textContent = why;
    res.classList.remove('flash'); void res.offsetWidth; res.classList.add('flash');
  };
  $$('.chips').forEach(group => group.addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    $$('.chip', group).forEach(c => c.classList.toggle('is-on', c === chip));
    state[group.dataset.group] = chip.dataset.v;
    paint();
  }));
  $('#diag-cta').addEventListener('click', () => {
    const sel = $('#f-servicio');
    const svc = $('#diag-service').textContent;
    [...sel.options].forEach(o => { if (o.text === svc) sel.value = o.value; });
  });

  /* próximos días laborables */
  const days = $('#f-dias');
  const fmtD = new Intl.DateTimeFormat('es-ES', { weekday: 'short' });
  const fmtL = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const d = new Date();
  const list = [];
  while (list.length < 5) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() >= 1 && d.getDay() <= 5) list.push(new Date(d));
  }
  list.forEach((date, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'day';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', i === 0 ? 'true' : 'false');
    b.dataset.label = fmtL.format(date);
    b.innerHTML = `${fmtD.format(date).replace('.', '')}<b>${date.getDate()}</b>`;
    b.addEventListener('click', () => {
      $$('.day', days).forEach(x => x.setAttribute('aria-checked', String(x === b)));
    });
    days.appendChild(b);
  });

  /* petición de cita */
  const form = $('#form-cita');
  const ticket = $('#ticket');
  const msgEl = $('#ticket-msg');
  let lastMsg = '';
  form.addEventListener('submit', e => {
    e.preventDefault();
    const svc = $('#f-servicio').value;
    const dia = $('.day[aria-checked="true"]', days)?.dataset.label || 'cualquier día';
    const franja = form.franja.value;
    const nombre = $('#f-nombre').value.trim();
    lastMsg = `Hola, Donna Bella. ${nombre ? `Soy ${nombre}. ` : ''}Me gustaría pedir cita para ${svc.toLowerCase()} el ${dia}, por la ${franja}. ¿Tenéis hueco?`;
    msgEl.textContent = lastMsg;
    ticket.hidden = false;
    if (WHATSAPP) {
      const wa = $('.ticket__actions .btn--cobalt');
      wa.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lastMsg)}`;
      wa.target = '_blank';
      wa.rel = 'noopener';
      wa.textContent = 'Enviar por WhatsApp';
      $('#ticket-note').hidden = true;
    }
    ticket.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  $('#ticket-copy').addEventListener('click', async e => {
    try {
      await navigator.clipboard.writeText(lastMsg);
      e.target.textContent = 'Copiado';
    } catch {
      e.target.textContent = 'No se pudo copiar';
    }
    setTimeout(() => { e.target.textContent = 'Copiar texto'; }, 1800);
  });

  $$('[data-tel]').forEach(a => { a.href = `tel:${TEL}`; });
  $('#year').textContent = new Date().getFullYear();
})();
