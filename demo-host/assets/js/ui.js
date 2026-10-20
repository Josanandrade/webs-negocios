/* Piezas compartidas por la web pública y la ficha. */
(function () {
  const ICON = {
    hab: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18h18M3 21v-3M21 21v-3M6 10V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>',
    banos: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2zM6 12V6a2 2 0 0 1 4 0M8 19l-1 2M16 19l1 2"/></svg>',
    m2: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4zM4 9h5M15 20v-5M9 4v5M20 15h-5"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
  };

  const ESTADO = { disponible: "Disponible", reservado: "Reservado", vendido: "Vendido", alquilado: "Alquilado" };

  function img(base, name) { return base + "assets/inmuebles/" + name + ".svg"; }

  function card(p, base, big) {
    const href = base + "inmueble/?id=" + p.id;
    const estado = p.estado !== "disponible" ? `<span class="tag tag-${p.estado}">${ESTADO[p.estado]}</span>` : "";
    return `<article class="card${big ? " card-big" : ""}" data-op="${p.operacion}">
      <a class="card-link" href="${href}" aria-label="${p.titulo}">
        <div class="card-media">
          <img src="${img(base, p.fotos[0])}" alt="Ilustración: ${p.titulo}" loading="lazy" width="800" height="560">
          <span class="op op-${p.operacion}">${p.operacion === "venta" ? "Venta" : "Alquiler"}</span>${estado}
        </div>
        <div class="card-body">
          <p class="card-price">${JL.euros(p.precio, p.operacion)}</p>
          <h3 class="card-title">${p.titulo}</h3>
          <p class="card-place">${ICON.pin}${p.localidad} · ${p.tipo}</p>
          <ul class="card-facts">
            <li>${ICON.hab}<b>${p.hab}</b> hab.</li>
            <li>${ICON.banos}<b>${p.banos}</b> ${p.banos === 1 ? "baño" : "baños"}</li>
            <li>${ICON.m2}<b>${p.m2}</b> m²</li>
          </ul>
        </div>
      </a>
    </article>`;
  }

  // Mapa esquemático propio (no es cartografía real): Sevilla, el río y el Aljarafe.
  function mapa(focus) {
    const P = window.JL_PUEBLOS;
    const dots = Object.entries(P).map(([n, c]) => {
      const on = n === focus;
      const lx = c.x > 70 ? c.x * 8 - 16 : c.x * 8 + 16;
      const anchor = c.x > 70 ? "end" : "start";
      return `<g class="m-town${on ? " on" : ""}"><circle cx="${c.x * 8}" cy="${c.y * 5}" r="${on ? 11 : 7}"/>
        <text x="${lx}" y="${c.y * 5 + 8}" text-anchor="${anchor}">${n === "Bollullos de la Mitación" ? "Bollullos M." : n === "Mairena del Aljarafe" ? "Mairena Alj." : n}</text></g>`;
    }).join("");
    const f = focus && P[focus];
    const halo = f ? `<circle class="m-halo" cx="${f.x * 8}" cy="${f.y * 5}" r="46"/>` : "";
    return `<svg class="mapa" viewBox="0 0 800 500" role="img" aria-label="Mapa esquemático de Sevilla y el Aljarafe">
      <rect class="m-bg" width="800" height="500"/>
      <path class="m-hill" d="M0 120 C120 90 300 110 470 150 C560 175 600 240 590 320 C580 420 470 500 300 500 H0z"/>
      <path class="m-river" d="M740 0 C700 80 720 140 690 200 C660 260 700 330 670 400 C650 450 660 480 650 500"/>
      <path class="m-road" d="M690 170 C560 190 420 200 300 210 C200 218 120 250 40 262"/>
      <path class="m-road thin" d="M680 250 C600 280 520 300 450 350 C380 400 260 380 200 400"/>
      <path class="m-city" d="M690 120 C740 110 790 130 800 150 V230 C760 250 720 240 700 220 C685 200 680 150 690 120z"/>
      <text class="m-label" x="40" y="60">ALJARAFE</text>
      <text class="m-label river" x="676" y="470">Guadalquivir</text>
      ${halo}${dots}
    </svg>`;
  }

  function toast(msg) {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 3600);
  }

  window.JLUI = { ICON, ESTADO, card, mapa, img, toast };
})();
