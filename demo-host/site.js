(() => {
  const googleReserveUrl = 'https://www.google.com/maps/reserve/v/dine/c/1mcuuJA8h04';

  document.querySelectorAll('a.btn, a.mobile-cta').forEach((link) => {
    if (/reserv/i.test(link.textContent || '')) {
      link.href = googleReserveUrl;
      link.target = '_blank';
      link.rel = 'noopener';
    }
  });

  /* Responsive mobile navigation */
  const header = document.querySelector('.site-header');
  const nav = header?.querySelector('.nav');
  const desktopNav = nav?.querySelector('.nav-links');
  const desktopReserve = nav?.querySelector('a.btn');

  if (header && nav && desktopNav) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'menu-toggle';
    toggle.setAttribute('aria-label', 'Abrir menú');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<span></span><span></span><span></span>';
    nav.appendChild(toggle);

    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.setAttribute('aria-hidden', 'true');

    const mobileNav = document.createElement('nav');
    mobileNav.className = 'mobile-menu__nav';
    mobileNav.setAttribute('aria-label', 'Navegación móvil');

    [...desktopNav.querySelectorAll('a')].forEach((link) => {
      const clone = link.cloneNode(true);
      mobileNav.appendChild(clone);
    });

    const reserve = document.createElement('a');
    reserve.className = 'btn mobile-menu__reserve';
    reserve.href = desktopReserve?.href || googleReserveUrl;
    reserve.target = '_blank';
    reserve.rel = 'noopener';
    reserve.textContent = 'Reservar con Google';

    mobileMenu.appendChild(mobileNav);
    mobileMenu.appendChild(reserve);
    header.appendChild(mobileMenu);

    const closeMenu = () => {
      toggle.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('menu-open');
    };

    const openMenu = () => {
      toggle.classList.add('is-open');
      mobileMenu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Cerrar menú');
      mobileMenu.setAttribute('aria-hidden', 'false');
      document.body.classList.add('menu-open');
    };

    toggle.addEventListener('click', () => {
      mobileMenu.classList.contains('is-open') ? closeMenu() : openMenu();
    });

    mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mobileMenu.classList.contains('is-open')) closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeMenu();
    });
  }

  /* Automatic homepage slider */
  const slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    const slides = [...slider.querySelectorAll('[data-slide]')];
    const prev = slider.querySelector('[data-slider-prev]');
    const next = slider.querySelector('[data-slider-next]');
    const dotsWrap = slider.querySelector('[data-slider-dots]');
    let index = 0;
    let timer;

    const dots = slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `hero-dot${i === 0 ? ' is-active' : ''}`;
      dot.setAttribute('aria-label', `Mostrar fotografía ${i + 1}`);
      dot.addEventListener('click', () => {
        show(i);
        restart();
      });
      dotsWrap?.appendChild(dot);
      return dot;
    });

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(index + 1), 2600);
    }

    prev?.addEventListener('click', () => { show(index - 1); restart(); });
    next?.addEventListener('click', () => { show(index + 1); restart(); });
    restart();
  }

  /* Interactive gallery lightbox */
  const gallery = document.querySelector('[data-gallery]');
  const lightbox = document.querySelector('[data-lightbox]');
  if (gallery && lightbox) {
    const items = [...gallery.querySelectorAll('[data-gallery-item]')];
    const image = lightbox.querySelector('[data-lightbox-image]');
    const count = lightbox.querySelector('[data-lightbox-count]');
    const close = lightbox.querySelector('[data-lightbox-close]');
    const prev = lightbox.querySelector('[data-lightbox-prev]');
    const next = lightbox.querySelector('[data-lightbox-next]');
    let current = 0;

    function render() {
      const item = items[current];
      const img = item.querySelector('img');
      image.src = item.dataset.full || img.src;
      image.alt = img.alt || 'La Malcontenta';
      count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    }

    function open(index) {
      current = index;
      render();
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      close?.focus();
    }

    function hide() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function move(direction) {
      current = (current + direction + items.length) % items.length;
      render();
    }

    items.forEach((item, i) => item.addEventListener('click', () => open(i)));
    close?.addEventListener('click', hide);
    prev?.addEventListener('click', () => move(-1));
    next?.addEventListener('click', () => move(1));
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox) hide();
    });
    document.addEventListener('keydown', (event) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (event.key === 'Escape') hide();
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'ArrowRight') move(1);
    });
  }
})();
