(function () {
  var PHONE = '34608355734';
  function waHref(text) { return 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(text); }

  // WhatsApp links
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = waHref(a.getAttribute('data-wa'));
    a.target = '_blank';
    a.rel = 'noopener';
  });

  // Mobile menu
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  burger.addEventListener('click', function () {
    var open = burger.getAttribute('aria-expanded') === 'true';
    burger.setAttribute('aria-expanded', String(!open));
    menu.classList.toggle('is-open', !open);
  });
  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      burger.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
    });
  });

  // Services material switch
  var tabs = document.querySelectorAll('.mat-switch button');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var mat = t.dataset.mat;
      tabs.forEach(function (o) { o.setAttribute('aria-selected', String(o === t)); });
      document.querySelectorAll('.serv').forEach(function (s) {
        s.classList.toggle('is-dim', mat !== 'todo' && s.dataset.mat.split(' ').indexOf(mat) === -1);
      });
    });
  });

  // Works filter
  var chips = document.querySelectorAll('.chip');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.dataset.f;
      chips.forEach(function (o) { o.classList.toggle('is-on', o === c); });
      document.querySelectorAll('.work').forEach(function (w) {
        w.classList.toggle('is-hidden', f !== 'all' && w.dataset.cat !== f);
      });
    });
  });

  // Before / after
  document.querySelectorAll('.ba-frame').forEach(function (fr) {
    var r = fr.querySelector('.ba-range');
    r.addEventListener('input', function () { fr.style.setProperty('--pos', r.value + '%'); });
  });

  // Quote builder -> WhatsApp
  var form = document.getElementById('qform');
  var out = document.getElementById('qmsg');
  function val(name) {
    var el = form.querySelector('[name="' + name + '"]:checked') || form.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : '';
  }
  function compose() {
    var parts = ['Hola JJ Carpinsur, quería pedir presupuesto para ' + val('tipo')];
    var mat = val('mat');
    if (mat) parts[0] += ' ' + mat;
    parts[0] += ' ' + val('donde') + '.';
    if (val('loc')) parts.push('La obra está en ' + val('loc') + '.');
    if (val('med')) parts.push('Medidas aproximadas: ' + val('med') + '.');
    parts.push('Os mando fotos del sitio.');
    return parts.join(' ');
  }
  function update() { out.textContent = compose(); }
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    window.open(waHref(compose()), '_blank', 'noopener');
  });
  update();
})();
