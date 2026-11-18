(() => {
  'use strict';
  const { categories, items } = window.MARIA_MENU;
  const filters = document.querySelector('#filters');
  const grid = document.querySelector('#menuGrid');
  const count = document.querySelector('#menuCount');
  const search = document.querySelector('#menuSearch');
  const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
  let current = 'Pizza';
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
  const displayName = text => text.replace(/^\d+\s*[.]?\s*/, '').toLocaleLowerCase('es').replace(/(^|\s)\p{L}/gu, letter => letter.toLocaleUpperCase('es'));

  function renderMenu() {
    const query = normalize(search.value.trim());
    const list = items.filter(item => (current === 'Todo' || item.category === current)
      && normalize(`${item.name} ${item.description}`).includes(query));
    count.textContent = `${list.length} ${list.length === 1 ? 'producto' : 'productos'}${current === 'Todo' ? ' en la carta' : ` · ${current}`}`;
    grid.replaceChildren();
    if (!list.length) {
      const empty = document.createElement('p');
      empty.className = 'emptyMenu';
      empty.textContent = 'No encontramos productos con esa búsqueda en esta categoría. Prueba en «Todo» o cambia la búsqueda.';
      grid.append(empty);
      return;
    }
    for (const item of list) {
      const card = document.createElement('article');
      card.className = `dish${item.available ? '' : ' unavailable'}`;
      const category = document.createElement('small');
      category.textContent = item.category;
      const name = document.createElement('h3');
      name.textContent = displayName(item.name);
      const description = document.createElement('p');
      const text = item.description.toLocaleLowerCase('es');
      description.textContent = text ? text[0].toLocaleUpperCase('es') + text.slice(1) : '';
      const price = document.createElement('strong');
      price.className = item.available ? '' : 'unavailableLabel';
      price.textContent = item.available ? money.format(item.priceCents / 100) : 'No disponible';
      card.append(category, name, description, price);
      grid.append(card);
    }
  }

  for (const category of ['Todo', ...categories]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter';
    button.dataset.category = category;
    const label = document.createElement('span');
    label.textContent = category === 'Todo' ? items.length : items.filter(item => item.category === category).length;
    button.append(document.createTextNode(category), label);
    button.addEventListener('click', () => {
      current = category;
      updateFilters();
      renderMenu();
    });
    filters.append(button);
  }
  function updateFilters() {
    for (const button of filters.children) {
      const active = button.dataset.category === current;
      button.classList.toggle('on', active);
      button.setAttribute('aria-pressed', String(active));
    }
  }
  search.addEventListener('input', renderMenu);
  updateFilters();
  renderMenu();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target); }
    }), { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
  } else document.querySelectorAll('.reveal').forEach(element => element.classList.add('in'));
})();
