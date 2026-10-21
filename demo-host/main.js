// Moreno & Casado — interacciones de la demo
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* Titular partido en líneas */
  $$('[data-split]').forEach((el) => {
    [...el.children].forEach((line, i) => {
      line.innerHTML = `<span style="--i:${i}">${line.innerHTML}</span>`;
    });
  });

  /* Manifiesto palabra a palabra */
  const man = $('[data-words]');
  if (man) {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((t) => {
            if (!t) return;
            if (/^\s+$/.test(t)) frag.append(t);
            else { const s = document.createElement('span'); s.className = 'w'; s.textContent = t; frag.append(s); }
          });
          n.replaceWith(frag);
        } else walk(n);
      });
    };
    walk(man);
  }

  /* Escalonado de grupos */
  $$('.hero__copy, .svc, .steps, .gal, .plan__copy, .quote__h').forEach((g) => {
    $$('[data-r]', g).forEach((el, i) => el.style.setProperty('--d', i));
  });
  $$('[data-clip][data-delay]').forEach((el) => el.style.setProperty('--d', el.dataset.delay));

  /* Revelado al entrar en pantalla */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('[data-r], [data-clip], [data-split]').forEach((el) => io.observe(el));

  /* Scroll: cabecera, manifiesto, proceso, botón flotante */
  const top = $('[data-top]');
  const fab = $('[data-fab]');
  const quote = $('#presupuesto');
  const words = man ? $$('.w', man) : [];
  const steps = $('[data-steps]');
  const stepEls = steps ? $$('.step', steps) : [];
  let lastY = scrollY, ticking = false;

  function onScroll() {
    const y = scrollY, vh = innerHeight;
    top.classList.toggle('is-solid', y > 8);
    const menuOpen = $('[data-menu-btn]').getAttribute('aria-expanded') === 'true';
    top.classList.toggle('is-hidden', !menuOpen && y > 400 && y > lastY + 2);
    if (y < lastY - 2) top.classList.remove('is-hidden');
    lastY = y;

    if (words.length) {
      const r = man.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', reduce || i < n));
    }

    if (steps) {
      const r = steps.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
      steps.style.setProperty('--prog', p.toFixed(3));
      stepEls.forEach((s) => s.classList.toggle('is-on', s.getBoundingClientRect().top < vh * 0.6));
    }

    if (fab && quote) {
      const q = quote.getBoundingClientRect();
      fab.classList.toggle('is-hidden', y < vh * 0.5 || (q.top < vh && q.bottom > 0));
    }
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* Menú móvil */
  const mbtn = $('[data-menu-btn]'), menu = $('[data-menu]');
  const setMenu = (open) => {
    mbtn.setAttribute('aria-expanded', String(open));
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
      top.classList.add('is-solid');
    } else {
      menu.classList.remove('is-open');
      setTimeout(() => { if (mbtn.getAttribute('aria-expanded') === 'false') menu.hidden = true; }, reduce ? 0 : 380);
    }
  };
  mbtn.addEventListener('click', () => setMenu(mbtn.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && mbtn.getAttribute('aria-expanded') === 'true') setMenu(false); });

  /* Servicios: imagen que sigue al cursor (solo escritorio) */
  const float = $('[data-svc-float]');
  if (float && fine && !reduce) {
    const img = $('img', float);
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, active = false;
    const loop = () => {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      float.style.setProperty('--x', `${cx.toFixed(1)}px`);
      float.style.setProperty('--y', `${cy.toFixed(1)}px`);
      raf = active || Math.abs(tx - cx) > 0.5 ? requestAnimationFrame(loop) : 0;
    };
    $$('.svc__i').forEach((li) => {
      li.addEventListener('pointerenter', (e) => {
        if (img.getAttribute('src') !== li.dataset.img) img.src = li.dataset.img;
        if (!active) { cx = tx = e.clientX + 24; cy = ty = e.clientY - 120; }
        active = true; float.classList.add('on');
        if (!raf) raf = requestAnimationFrame(loop);
      });
      li.addEventListener('pointermove', (e) => { tx = e.clientX + 24; ty = e.clientY - 120; });
    });
    $('[data-svc]').addEventListener('pointerleave', () => { active = false; float.classList.remove('on'); });
  }

  /* Tabs segmentadas */
  const segSelect = (seg, btn) => {
    const btns = $$('button', seg);
    btns.forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
    seg.dataset.i = btns.indexOf(btn);
  };
  $$('.seg').forEach((seg) => {
    seg.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      const btns = $$('button', seg);
      const i = btns.findIndex((b) => b.getAttribute('aria-selected') === 'true');
      const n = btns[(i + (e.key === 'ArrowRight' ? 1 : btns.length - 1)) % btns.length];
      n.focus(); n.click();
    });
  });

  /* Plano antes / propuesta */
  const planFig = $('[data-planfig]');
  $$('[data-plan]').forEach((b) => b.addEventListener('click', () => {
    segSelect(b.closest('.seg'), b);
    planFig.dataset.state = b.dataset.plan;
  }));

  /* Comparador antes / después */
  const cmp = $('[data-cmp]');
  if (cmp) {
    const range = $('.cmp__r', cmp);
    const set = (v) => {
      cmp.style.setProperty('--pos', `${v}%`);
      cmp.dataset.near = v < 12 ? 'a' : v > 88 ? 'b' : '';
    };
    range.addEventListener('input', () => { cmp.classList.remove('is-tween'); set(+range.value); });
    // Arrastre directo con pointer para respuesta inmediata
    let dragging = false;
    const fromEvent = (e) => {
      const r = cmp.getBoundingClientRect();
      const v = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
      range.value = v; set(v);
    };
    cmp.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      dragging = true; cmp.classList.add('is-drag'); cmp.classList.remove('is-tween');
      if (e.pointerType === 'mouse') { cmp.setPointerCapture(e.pointerId); fromEvent(e); }
      else { cmp._sx = e.clientX; cmp._sy = e.clientY; cmp._lock = null; }
    });
    cmp.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      if (e.pointerType !== 'mouse') {
        if (cmp._lock === null) {
          const dx = Math.abs(e.clientX - cmp._sx), dy = Math.abs(e.clientY - cmp._sy);
          if (dx < 4 && dy < 4) return;
          cmp._lock = dx > dy ? 'x' : 'y';
        }
        if (cmp._lock !== 'x') return;
      }
      fromEvent(e);
    });
    const end = () => { dragging = false; cmp.classList.remove('is-drag'); };
    cmp.addEventListener('pointerup', end);
    cmp.addEventListener('pointercancel', end);
    range.addEventListener('pointerdown', (e) => e.stopPropagation(), true);

    // Pequeño gesto de demostración al entrar en pantalla
    if (!reduce) {
      const hint = new IntersectionObserver((en) => {
        if (!en[0].isIntersecting) return;
        hint.disconnect();
        cmp.classList.add('is-tween');
        setTimeout(() => set(30), 300);
        setTimeout(() => set(68), 1300);
        setTimeout(() => { set(50); setTimeout(() => cmp.classList.remove('is-tween'), 950); }, 2300);
      }, { threshold: 0.6 });
      hint.observe(cmp);
    }

    const SETS = {
      cocina: { a: 'assets/img/cocina-despues.svg', b: 'assets/img/cocina-antes.svg', aa: 'Después: cocina abierta con isla', ba: 'Antes: cocina cerrada con azulejo y muebles de madera', cap: 'Cocina — se elimina el tabique, se abre al salón y se renuevan suelo, mobiliario e iluminación.' },
      bano: { a: 'assets/img/bano-despues.svg', b: 'assets/img/bano-antes.svg', aa: 'Después: baño con ducha de obra y mueble suspendido', ba: 'Antes: baño con bañera, cortina y azulejo rosa', cap: 'Baño — la bañera se sustituye por ducha de obra, con revestimiento de gran formato y mueble suspendido.' },
    };
    const after = $('[data-after]', cmp), before = $('[data-before]', cmp), cap = $('[data-ba-cap]');
    $$('[data-ba]').forEach((b) => b.addEventListener('click', () => {
      if (b.getAttribute('aria-selected') === 'true') return;
      segSelect(b.closest('.seg'), b);
      const s = SETS[b.dataset.ba];
      cmp.classList.add('is-swap');
      setTimeout(() => {
        after.src = s.a; after.alt = s.aa; before.src = s.b; before.alt = s.ba; cap.textContent = s.cap;
        range.value = 50; set(50);
        const done = () => cmp.classList.remove('is-swap');
        Promise.all([after, before].map((im) => im.decode().catch(() => {}))).then(done);
      }, reduce ? 0 : 200);
    }));
  }

  /* Portfolio: filtros */
  const gal = $('[data-gal]');
  $$('.chip').forEach((c) => c.addEventListener('click', () => {
    $$('.chip').forEach((x) => { x.classList.toggle('is-on', x === c); x.setAttribute('aria-pressed', String(x === c)); });
    const f = c.dataset.f;
    $$('.gal__i', gal).forEach((it, i) => {
      const show = f === 'all' || it.dataset.cat === f;
      const wasOff = it.classList.contains('is-off');
      it.classList.toggle('is-off', !show);
      if (show && (wasOff || f !== 'all')) {
        it.classList.add('is-enter');
        it.style.transitionDelay = `${i * 40}ms`;
        requestAnimationFrame(() => requestAnimationFrame(() => it.classList.remove('is-enter')));
      }
    });
  }));

  /* Lightbox */
  const dlg = $('[data-lb-dlg]');
  if (dlg && dlg.showModal) {
    const im = $('img', dlg), fc = $('figcaption', dlg);
    $$('[data-lb]').forEach((b) => b.addEventListener('click', () => {
      im.src = b.dataset.lb; im.alt = b.dataset.cap; fc.textContent = `${b.dataset.cap} · Imagen demostrativa`;
      dlg.showModal();
    }));
    $('[data-lb-close]', dlg).addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  }

  /* Servicios → preselección del tipo en el formulario */
  const form = $('[data-form]');
  $$('.svc a[data-tipo]').forEach((a) => a.addEventListener('click', () => {
    const r = form && form.querySelector(`input[name="tipo"][value="${a.dataset.tipo}"]`);
    if (r) r.checked = true;
  }));

  /* Formulario → WhatsApp */
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = new FormData(form);
      const lines = [
        'Hola, me gustaría pedir presupuesto.',
        `• Tipo de trabajo: ${d.get('tipo')}`,
        d.get('zona') && `• Localidad: ${d.get('zona').trim()}`,
        d.get('m2') && `• Superficie aprox.: ${d.get('m2').trim()} m²`,
        d.get('msg') && `• Qué quiero cambiar: ${d.get('msg').trim()}`,
      ].filter(Boolean);
      window.open(`https://wa.me/34660094939?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    });
  }
})();
