/* Vista previa estática del área de gestión.
   Nada se guarda ni se envía: las acciones solo explican lo que pasaría en el desarrollo final. */
(function () {
  "use strict";
  var D = window.FE;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  /* Altura real del aviso superior para los elementos fijos */
  var banner = $(".banner");
  function syncBanner() { document.documentElement.style.setProperty("--banner", banner.offsetHeight + "px"); }
  syncBanner(); window.addEventListener("resize", syncBanner);

  /* Datos de demostración del panel */
  var props = D.listings.map(function (p) { return Object.assign({ published: true }, p); }).concat([
    { id: "EJ-109", title: "Piso para reformar con patio", type: "Piso", op: "venta", zone: "Bellavista", price: 98000, beds: 2, baths: 1, m2: 64, status: "borrador", art: "bloque", tone: 3, published: false },
    { id: "EJ-110", title: "Plaza de garaje en urbanización", type: "Garaje", op: "venta", zone: "La Palmera", price: 18500, beds: 0, baths: 0, m2: 12, status: "borrador", art: "local", tone: 0, published: false }
  ]);
  var leads = [
    { n: "María López", ref: "EJ-101", msg: "Quería saber si podemos visitarla esta semana.", t: "Hace 12 min", via: "Ficha del inmueble", st: "nueva", tel: "600 000 101" },
    { n: "Javier Ruiz", ref: "EJ-103", msg: "¿La plaza de garaje está incluida en el precio?", t: "Hace 1 h", via: "WhatsApp", st: "nueva", tel: "600 000 102" },
    { n: "Carmen Ortega", ref: "EJ-104", msg: "Somos una pareja con trabajo fijo, ¿sigue disponible para el mes que viene?", t: "Hoy, 9:40", via: "Ficha del inmueble", st: "nueva", tel: "600 000 103" },
    { n: "Antonio Gil", ref: "EJ-107", msg: "Me interesa. ¿Tiene calefacción central o individual?", t: "Ayer", via: "Ficha del inmueble", st: "atendida", tel: "600 000 104" },
    { n: "Lucía Morales", ref: "EJ-102", msg: "Si se libera la reserva, avisadme por favor.", t: "Lunes", via: "WhatsApp", st: "atendida", tel: "600 000 105" }
  ];
  var owners = [
    { n: "Rafael Domínguez", tel: "600 000 201", zone: "Bellavista", type: "Piso", date: "Hoy, 10:15", st: "nueva" },
    { n: "Pilar Navarro", tel: "600 000 202", zone: "Pedro Salvador", type: "Casa", date: "Ayer, 18:02", st: "nueva" },
    { n: "Manuel Castro", tel: "600 000 203", zone: "Heliópolis", type: "Piso", date: "20 oct", st: "llamado" },
    { n: "Rocío Jiménez", tel: "600 000 204", zone: "La Palmera", type: "Ático", date: "17 oct", st: "valoracion" },
    { n: "Francisco Vela", tel: "600 000 205", zone: "Bellavista", type: "Local", date: "14 oct", st: "valoracion" }
  ];
  var ownerLabel = { nueva: "Nueva", llamado: "Llamado", valoracion: "Valoración agendada" };
  var S = D.statusLabel;
  function money(p, op) { return p.toLocaleString("es-ES") + " €" + (op === "alquiler" ? "/mes" : ""); }
  function initials(n) { return n.split(" ").map(function (w) { return w[0]; }).slice(0, 2).join(""); }
  function find(id) { return props.filter(function (p) { return p.id === id; })[0]; }

  /* Toasts: lo que pasaría */
  var toasts = $("#toasts");
  function sim(text) {
    var el = document.createElement("div");
    el.className = "toast"; el.setAttribute("role", "status");
    el.innerHTML = '<span class="toast__i" aria-hidden="true">i</span><span><b>Simulación</b>' + esc(text) + "</span>";
    toasts.appendChild(el);
    while (toasts.children.length > 3) toasts.removeChild(toasts.firstChild);
    setTimeout(function () { el.classList.add("out"); setTimeout(function () { el.remove(); }, 260); }, 3800);
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-sim]");
    if (b) { e.preventDefault(); sim(b.getAttribute("data-sim")); closeMenus(); }
  });

  /* Navegación entre vistas */
  var side = $("#side"), scrim = $("#scrim"), menuBtn = $("#menu");
  function setMenu(open) { side.classList.toggle("is-open", open); scrim.hidden = !open; menuBtn.setAttribute("aria-expanded", open); }
  menuBtn.addEventListener("click", function () { setMenu(!side.classList.contains("is-open")); });
  scrim.addEventListener("click", function () { setMenu(false); });
  var views = ["resumen", "inmuebles", "nuevo", "consultas", "propietarios"];
  function show() {
    var v = location.hash.slice(1); if (views.indexOf(v) < 0) v = "resumen";
    views.forEach(function (x) { $("#v-" + x).hidden = x !== v; });
    $$(".side__nav a").forEach(function (a) { var on = a.getAttribute("data-view") === v; a.classList.toggle("is-on", on); if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    $("#view-title").textContent = $("#v-" + v).getAttribute("data-title");
    setMenu(false); closeMenus();
    window.scrollTo(0, 0);
    if (v === "resumen") animateKpis();
  }
  window.addEventListener("hashchange", show);

  /* Resumen */
  var counts = { pub: 0, disp: 0, res: 0, closed: 0 };
  props.forEach(function (p) {
    if (p.published) counts.pub++;
    if (p.status === "disponible") counts.disp++;
    if (p.status === "reservado") counts.res++;
    if (p.status === "vendido" || p.status === "alquilado") counts.closed++;
  });
  var kpis = [
    { k: "Publicados", v: counts.pub, s: "+2 borradores", c: "#1A1613", w: 80 },
    { k: "Disponibles", v: counts.disp, s: "en venta y alquiler", c: "#2F7A4F", w: 62 },
    { k: "Reservados", v: counts.res, s: "con señal", c: "#C08A2E", w: 12 },
    { k: "Vendidos / alquilados", v: counts.closed, s: "este trimestre", c: "#8A7F72", w: 25 },
    { k: "Consultas recibidas", v: 14, s: "▲ 5 más que el mes pasado", c: "#A33A2B", w: 70, up: true },
    { k: "Visitas pendientes", v: 3, s: "esta semana", c: "#2C5AA0", w: 30 }
  ];
  $("#kpis").innerHTML = kpis.map(function (k, i) {
    return '<div class="kpi" style="--i:' + i + ';--c:' + k.c + '" data-w="' + k.w + '%"><small><i></i>' + k.k + '</small><b data-n="' + k.v + '">' + k.v + '</b><span class="' + (k.up ? "up" : "") + '">' + k.s + "</span></div>";
  }).join("");
  function animateKpis() {
    $$(".kpi").forEach(function (el) {
      el.style.setProperty("--w", "0%");
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.setProperty("--w", el.getAttribute("data-w")); }); });
      var b = $("b", el), to = +b.getAttribute("data-n");
      if (reduce) return;
      var t0 = null;
      (function step(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 900); b.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(performance.now());
    });
  }

  // Gráfico de barras apiladas, SVG propio
  (function chart() {
    var weeks = [["S36", 3, 1], ["S37", 4, 2], ["S38", 2, 2], ["S39", 5, 2], ["S40", 4, 3], ["S41", 6, 2], ["S42", 5, 4], ["S43", 8, 3]];
    var W = 560, H = 210, pad = 26, max = 12, bw = 30, gap = (W - pad - bw * weeks.length) / weeks.length;
    var y = function (v) { return H - 20 - v / max * (H - 36); };
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Consultas por semana, de 4 a 11, con tendencia al alza (datos de demostración)">';
    [0, 4, 8, 12].forEach(function (v) { s += '<line class="gl" x1="' + pad + '" x2="' + W + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text x="0" y="' + (y(v) + 4) + '">' + v + "</text>"; });
    weeks.forEach(function (w, i) {
      var x = pad + gap / 2 + i * (bw + gap), a = w[1], b = w[2];
      s += '<g class="col"><title>' + w[0] + ": " + (a + b) + " consultas</title>" +
        '<rect class="b1" style="--i:' + i + '" x="' + x + '" y="' + y(a) + '" width="' + bw + '" height="' + (y(0) - y(a)) + '" rx="3"/>' +
        '<rect class="b2" style="--i:' + (i + 2) + '" x="' + x + '" y="' + (y(a + b)) + '" width="' + bw + '" height="' + (y(a) - y(a + b) - 2) + '" rx="3"/>' +
        '<text x="' + (x + bw / 2) + '" y="' + (H - 4) + '" text-anchor="middle">' + w[0] + "</text></g>";
    });
    $("#chart").innerHTML = s + "</svg>";
  })();

  $("#agenda").innerHTML = [
    ["JUE", 23, "Visita EJ-101 · Piso 3 dorm.", "María López · 18:30", "Bellavista"],
    ["VIE", 24, "Valoración en Heliópolis", "Manuel Castro · 11:00", "Propietario"],
    ["SÁB", 25, "Visita EJ-104 · Piso reformado", "Carmen Ortega · 10:30", "Alquiler"]
  ].map(function (a) {
    return '<li><span class="date"><small>' + a[0] + "</small><b>" + a[1] + "</b></span><span><strong>" + a[2] + "</strong><span>" + a[3] + '</span></span><span class="ref">' + a[4] + "</span></li>";
  }).join("");
  $("#feed").innerHTML = [
    ["#A33A2B", "Nueva consulta de <b>María López</b> sobre EJ-101", "Hace 12 min"],
    ["#C08A2E", "EJ-102 marcado como <b>Reservado</b>", "Ayer"],
    ["#2C5AA0", "Solicitud de valoración en <b>Pedro Salvador</b>", "Ayer"],
    ["#8A7F72", "EJ-106 marcado como <b>Vendido</b>", "Lunes"]
  ].map(function (f) { return '<li style="--c:' + f[0] + '"><span style="color:var(--ink)">' + f[1] + "<br><span>" + f[2] + "</span></span></li>"; }).join("");

  /* Inmuebles */
  var ICON = {
    edit: '<svg viewBox="0 0 20 20"><path d="M4 16l1-4 8-8 3 3-8 8-4 1zM11 6l3 3"/></svg>',
    eye: '<svg viewBox="0 0 20 20"><path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z"/><circle cx="10" cy="10" r="2.2"/></svg>',
    eyeOff: '<svg viewBox="0 0 20 20"><path d="M3 3l14 14M8 5.3A8 8 0 0 1 10 5c5 0 8 5 8 5a14 14 0 0 1-2.3 2.8M12 14.7a8 8 0 0 1-2 .3c-5 0-8-5-8-5a14 14 0 0 1 2.3-2.8"/></svg>',
    more: '<svg viewBox="0 0 20 20"><circle cx="4.5" cy="10" r="1.2"/><circle cx="10" cy="10" r="1.2"/><circle cx="15.5" cy="10" r="1.2"/></svg>'
  };
  var filter = { st: "todos", q: "" }, layout = "table";
  var tabs = [["todos", "Todos"], ["disponible", "Disponibles"], ["reservado", "Reservados"], ["cerrado", "Vendidos / alquilados"], ["borrador", "Borradores"]];
  function tabCount(k) {
    return props.filter(function (p) { return k === "todos" || (k === "cerrado" ? (p.status === "vendido" || p.status === "alquilado") : p.status === k); }).length;
  }
  $("#st-tabs").innerHTML = tabs.map(function (t, i) { return '<button role="tab" aria-selected="' + (i === 0) + '" class="' + (i === 0 ? "is-on" : "") + '" data-st="' + t[0] + '">' + t[1] + "<b>" + tabCount(t[0]) + "</b></button>"; }).join("");
  $("#st-tabs").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    $$("button", this).forEach(function (x) { x.classList.toggle("is-on", x === b); x.setAttribute("aria-selected", x === b); });
    filter.st = b.getAttribute("data-st"); renderProps();
  });
  $$(".toggle button").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".toggle button").forEach(function (x) { x.classList.toggle("is-on", x === b); x.setAttribute("aria-pressed", x === b); });
      layout = b.getAttribute("data-layout"); renderProps();
    });
  });
  $("#q").addEventListener("input", function () {
    filter.q = this.value.trim().toLowerCase();
    if (location.hash !== "#inmuebles") location.hash = "#inmuebles";
    renderProps();
  });

  function actions(p) {
    var hideTxt = p.published ? "Ocultar" : "Publicar";
    return '<div class="acts">' +
      '<button class="ib" title="Editar" aria-label="Editar ' + p.id + '" data-sim="Se abriría la ficha de ' + p.id + ' para cambiar precio, fotos o descripción.">' + ICON.edit + "</button>" +
      '<button class="ib" title="' + hideTxt + '" aria-label="' + hideTxt + " " + p.id + '" data-sim="' + (p.published ? p.id + " dejaría de verse en la web, sin borrarse del panel." : p.id + " aparecería al momento en la web pública.") + '">' + (p.published ? ICON.eye : ICON.eyeOff) + "</button>" +
      '<button class="ib" aria-label="Más acciones para ' + p.id + '" aria-haspopup="menu" aria-expanded="false" data-menu="' + p.id + '">' + ICON.more + "</button></div>";
  }
  function pub(p) { return '<span class="pub"><span class="sw' + (p.published ? " on" : "") + '"></span>' + (p.published ? "Publicado" : "Borrador") + "</span>"; }
  function renderProps() {
    var items = props.filter(function (p) {
      var okSt = filter.st === "todos" || (filter.st === "cerrado" ? (p.status === "vendido" || p.status === "alquilado") : p.status === filter.st);
      var okQ = !filter.q || (p.id + " " + p.title + " " + p.zone + " " + p.type).toLowerCase().indexOf(filter.q) >= 0;
      return okSt && okQ;
    });
    $("#tbl").hidden = layout !== "table"; $("#pcards").hidden = layout !== "cards"; $("#none").hidden = items.length > 0;
    if (layout === "table") {
      $("#rows").innerHTML = items.map(function (p, i) {
        return '<tr style="--i:' + i + '"><td class="c-item"><div class="item"><span class="thumb">' + FEArt.svg(p.art, p.tone) + '</span><span><b>' + esc(p.title) + '</b><small>' + p.id + '</small><span class="ex">Ejemplo</span></span></div></td>' +
          '<td class="c-type">' + p.type + " · " + p.op + '</td><td class="c-zone">' + p.zone + '</td><td class="r price">' + money(p.price, p.op) + '</td>' +
          '<td><span class="st st--' + p.status + '">' + S[p.status] + "</span></td><td>" + pub(p) + '</td><td class="r c-acts">' + actions(p) + "</td></tr>";
      }).join("");
    } else {
      $("#pcards").innerHTML = items.map(function (p, i) {
        return '<article class="pc" style="--i:' + i + '"><div class="pc__img">' + FEArt.svg(p.art, p.tone) + '<span class="st st--' + p.status + '">' + S[p.status] + '</span></div>' +
          '<div class="pc__b"><small>' + p.id + " · Inmueble de ejemplo</small><b>" + esc(p.title) + '</b><span class="price">' + money(p.price, p.op) + " · " + p.zone + "</span></div>" +
          '<div class="pc__f">' + pub(p) + actions(p) + "</div></article>";
      }).join("");
    }
  }
  renderProps();

  /* Menú de acciones */
  function closeMenus() { $$(".menu").forEach(function (m) { var b = m.parentElement.querySelector("[data-menu]"); if (b) b.setAttribute("aria-expanded", "false"); m.remove(); }); }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-menu]");
    if (!b) { if (!e.target.closest(".menu")) closeMenus(); return; }
    var open = b.getAttribute("aria-expanded") === "true";
    closeMenus(); if (open) return;
    var p = find(b.getAttribute("data-menu"));
    var m = document.createElement("div"); m.className = "menu"; m.setAttribute("role", "menu");
    m.innerHTML =
      '<button role="menuitem" style="--c:var(--ok)" data-sim="' + p.id + ' volvería a mostrarse como Disponible en la web."><i></i>Marcar disponible</button>' +
      '<button role="menuitem" style="--c:#C08A2E" data-sim="' + p.id + ' aparecería en la web con la etiqueta Reservado."><i></i>Marcar reservado</button>' +
      '<button role="menuitem" style="--c:var(--sold)" data-sim="' + p.id + ' aparecería como ' + (p.op === "alquiler" ? "Alquilado" : "Vendido") + ' y dejaría de recibir consultas."><i></i>Marcar ' + (p.op === "alquiler" ? "alquilado" : "vendido") + "</button><hr>" +
      '<button role="menuitem" style="--c:var(--draft)" data-sim="' + p.id + ' pasaría a borrador y se ocultaría de la web."><i></i>Pasar a borrador</button>';
    b.parentElement.appendChild(m); b.setAttribute("aria-expanded", "true");
    var first = m.querySelector("button"); if (first) first.focus({ preventScroll: true });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeMenus(); setMenu(false); } });

  /* Nuevo inmueble: vista previa en directo, sin guardar nada */
  var f = { op: "venta", state: "disponible", art: "bloque" };
  var artFor = { Piso: "bloque", Casa: "adosada", "Ático": "atico", Chalet: "chalet", Local: "local", Garaje: "local" };
  $("#thumbs").innerHTML = [["bloque", 0, "Portada"], ["atico", 2, ""], ["adosada", 1, ""], ["local", 3, ""]].map(function (t) {
    return "<figure>" + FEArt.svg(t[0], t[1]) + (t[2] ? "<span>" + t[2] + "</span>" : "") + "</figure>";
  }).join("");
  function seg(root, key, cb) {
    $$("button", root).forEach(function (b) {
      b.addEventListener("click", function () {
        $$("button", root).forEach(function (x) { x.classList.toggle("is-on", x === b); });
        f[key] = b.getAttribute(key === "op" ? "data-v" : "data-s"); if (cb) cb(); preview();
      });
    });
  }
  seg($("#f-op"), "op", function () { $("#f-unit").textContent = f.op === "alquiler" ? "€/mes" : "€"; });
  seg($("#f-state"), "state");
  $$("#feats button").forEach(function (b) { b.addEventListener("click", function () { b.classList.toggle("is-on"); }); });
  var lastPrice = "";
  function preview() {
    var price = parseInt(($("#f-price").value || "0").replace(/\D/g, ""), 10) || 0;
    var beds = +$("#f-beds").value || 0, baths = +$("#f-baths").value || 0, m2 = +$("#f-m2").value || 0;
    f.art = artFor[$("#f-type").value] || "bloque";
    var priceTxt = money(price, f.op);
    $("#pv").innerHTML = '<div class="pv__img">' + FEArt.svg(f.art, 0) + '<span class="st st--' + f.state + '">' + S[f.state] + '</span></div>' +
      '<div class="pv__b"><small>EJ-111 · ' + esc($("#f-type").value) + " en " + f.op + "</small><h3>" + esc($("#f-title").value || "Sin título") + '</h3><span class="pv__z">' + esc($("#f-zone").value) + "</span>" +
      '<div class="pv__f"><span class="pv__p' + (priceTxt !== lastPrice && lastPrice ? " tick" : "") + '">' + priceTxt + '</span><span class="pv__s">' + (beds ? beds + " hab · " : "") + baths + (baths === 1 ? " baño" : " baños") + " · " + m2 + " m²</span></div></div>";
    lastPrice = priceTxt;
  }
  ["#f-title", "#f-type", "#f-price", "#f-zone", "#f-beds", "#f-baths", "#f-m2"].forEach(function (s) { $(s).addEventListener("input", preview); });
  preview();

  /* Consultas */
  var leadFilter = "todas", sel = 0;
  function renderLeads() {
    var items = leads.map(function (l, i) { l.i = i; return l; }).filter(function (l) { return leadFilter === "todas" || l.st === leadFilter; });
    if (!items.some(function (l) { return l.i === sel; }) && items.length) sel = items[0].i;
    $("#llist").innerHTML = items.map(function (l, k) {
      return '<li class="lead' + (l.i === sel ? " is-sel" : "") + '" style="--i:' + k + '" data-i="' + l.i + '" tabindex="0" role="button" aria-label="Ver consulta de ' + l.n + '">' +
        '<span class="ava">' + initials(l.n) + "</span><div><b>" + l.n + "</b><p>“" + esc(l.msg) + '”</p><div class="meta"><span class="ref">' + l.ref + "</span>" + l.via + ' <span class="st st--' + l.st + '">' + (l.st === "nueva" ? "Nueva" : "Atendida") + "</span></div></div><time>" + l.t + "</time></li>";
    }).join("");
    renderDetail();
  }
  function renderDetail() {
    var l = leads[sel], p = find(l.ref), d = $("#ldetail");
    d.classList.remove("swap"); void d.offsetWidth; d.classList.add("swap");
    d.innerHTML = '<div class="ld__head"><span class="ava">' + initials(l.n) + "</span><span><b>" + l.n + "</b><small>Interesada/o en vivienda " + l.ref + "</small></span></div>" +
      '<blockquote class="quote">“' + esc(l.msg) + "”</blockquote>" +
      '<div class="ld__prop"><span class="thumb">' + FEArt.svg(p.art, p.tone) + "</span><span><b>" + p.id + " · " + esc(p.title) + "</b><small>" + money(p.price, p.op) + " · " + S[p.status] + "</small></span></div>" +
      '<dl class="ld__meta"><div><dt>Recibida</dt><dd>' + l.t + "</dd></div><div><dt>Origen</dt><dd>" + l.via + "</dd></div><div><dt>Teléfono</dt><dd>" + l.tel + " <small>(ejemplo)</small></dd></div><div><dt>Estado</dt><dd>" + (l.st === "nueva" ? "Sin atender" : "Atendida") + "</dd></div></dl>" +
      '<div class="ld__acts"><button class="btn btn--line" data-sim="Se abriría la consulta completa con el historial de ' + l.n + '.">Ver consulta</button>' +
      '<button class="btn btn--line" data-sim="En el móvil, este botón llamaría a ' + l.n + ' con un toque.">Llamar</button>' +
      '<button class="btn btn--wa" data-sim="Se abriría WhatsApp con un mensaje para ' + l.n + ' sobre ' + l.ref + '.">WhatsApp</button>' +
      '<button class="btn btn--red" data-sim="La consulta quedaría como atendida y saldría de la bandeja de nuevas.">Marcar como atendida</button></div>';
  }
  $("#lead-tabs").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    $$("button", this).forEach(function (x) { x.classList.toggle("is-on", x === b); });
    leadFilter = b.getAttribute("data-f"); renderLeads();
  });
  function pick(e) {
    var li = e.target.closest(".lead"); if (!li) return;
    if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    sel = +li.getAttribute("data-i");
    $$(".lead").forEach(function (x) { x.classList.toggle("is-sel", x === li); });
    renderDetail();
    if (window.innerWidth < 1100) $("#ldetail").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
  $("#llist").addEventListener("click", pick);
  $("#llist").addEventListener("keydown", pick);
  renderLeads();

  /* Propietarios */
  $("#funnel").innerHTML = [
    ["Solicitudes este mes", 9, "desde el formulario “Quiero vender”", "100%", 1],
    ["Valoraciones hechas", 5, "visitas para tasar", "56%", .75],
    ["Inmuebles captados", 2, "nuevos en cartera", "22%", .5]
  ].map(function (s, i) { return '<div class="fstep" style="--i:' + i + '"><small>' + s[0] + "</small><b>" + s[1] + "</b><span>" + s[2] + '</span><i style="--w:' + s[3] + ";--o:" + s[4] + '"></i></div>'; }).join("");
  $("#owners").innerHTML = owners.map(function (o, i) {
    return '<tr style="--i:' + i + '"><td data-k="Nombre"><b>' + o.n + '</b></td><td data-k="Teléfono" class="tel">' + o.tel + '</td><td data-k="Zona">' + o.zone + '</td><td data-k="Tipo">' + o.type + '</td><td data-k="Fecha">' + o.date + '</td>' +
      '<td data-k="Estado"><span class="st st--' + o.st + '">' + ownerLabel[o.st] + '</span></td>' +
      '<td class="r c-acts"><div class="acts"><button class="btn btn--line" data-sim="Llamaría a ' + o.n + ' para concertar la visita.">Llamar</button>' +
      '<button class="btn btn--red" data-sim="Se agendaría la valoración del ' + o.type.toLowerCase() + " en " + o.zone + '.">Agendar valoración</button></div></td></tr>';
  }).join("");

  show();
})();
