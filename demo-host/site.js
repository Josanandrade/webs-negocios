(() => {
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
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        timer = window.setInterval(() => show(index + 1), 5200);
      }
    }

    prev?.addEventListener('click', () => { show(index - 1); restart(); });
    next?.addEventListener('click', () => { show(index + 1); restart(); });
    slider.addEventListener('mouseenter', () => window.clearInterval(timer));
    slider.addEventListener('mouseleave', restart);
    restart();
  }

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
