(function () {
  var doc = document.documentElement;
  doc.classList.add('js');
  var WA = '34727740824';

  // Mensajes de WhatsApp prellenados
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(a.getAttribute('data-wa'));
  });

  // Menú móvil
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('is-open', !open);
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('is-open');
      });
    });
  }

  // Cabecera con borde al hacer scroll
  var top = document.querySelector('.top');
  var onScroll = function () { top.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Comparador mapeo / diseño
  document.querySelectorAll('[data-compare]').forEach(function (box) {
    var range = box.querySelector('.compare__range');
    var set = function () { box.style.setProperty('--pos', range.value + '%'); };
    range.addEventListener('input', set);
    set();
  });

  // Formulario de cita -> WhatsApp
  var form = document.getElementById('bookForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var t = form.querySelector('input[name="t"]:checked').value;
      var p = form.querySelector('input[name="p"]:checked').value;
      var n = form.querySelector('input[name="n"]').value.trim();
      var msg = 'Hola Margot' + (n ? ', soy ' + n : '') + '. Me gustaría pedir cita para ' + t + '. ' + p + '. ¿Qué disponibilidad tienes?';
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    });
  }

  // Aparición suave al hacer scroll
  var items = document.querySelectorAll('.head, .treat__card, .also, .g, .about__plate, .about__copy, .step, .assure div, .rv, .reviews__score, .book__form, .place__map, .place__info');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { el.classList.add('rev'); io.observe(el); });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
