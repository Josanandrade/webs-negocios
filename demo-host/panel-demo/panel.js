/* Vista previa estática del área de gestión de Inmo Abades.
   Todo ocurre en memoria: no hay login, ni servidor, ni almacenamiento. Al recargar, vuelve al estado inicial. */
(function () {
  var D = window.ABADES;
  var art = window.ABADES_ART;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  var props = D.PROPERTIES.map(function (p) { return Object.assign({}, p); });
  var byRef = function (r) { return props.filter(function (p) { return p.ref === r; })[0]; };
  var thumbs = {};
  function thumb(p) { return thumbs[p.ref] || (thumbs[p.ref] = art(p.art, "")); }

  var LEADS = [
    { id: 1, name: "María López", ref: "AB-101", msg: "Quería saber si podemos visitarla esta semana.", when: "hace 12 min", phone: "6•• ••• 412", state: "nueva", c: "#9A3B26" },
    { id: 2, name: "Javier Ortega", ref: "AB-104", msg: "¿Se admiten mascotas? Trabajo en remoto y busco para enero.", when: "hace 1 h", phone: "6•• ••• 087", state: "nueva", c: "#2D5C9A" },
    { id: 3, name: "Carmen Ruiz", ref: "AB-102", msg: "¿Sigue disponible o ya está reservado? Me encaja mucho la terraza.", when: "ayer", phone: "6•• ••• 230", state: "nueva", c: "#2F4A3F" },
    { id: 4, name: "Antonio Medina", ref: "AB-103", msg: "Me interesa para reformar. ¿Tienen planos de la casa?", when: "ayer", phone: "6•• ••• 761", state: "atendida", c: "#C9973F" },
    { id: 5, name: "Lucía Romero", ref: "AB-108", msg: "¿Desde cuándo estaría libre para entrar a vivir?", when: "hace 2 días", phone: "6•• ••• 945", state: "atendida", c: "#6B4A7A" },
  ];
  var OWNERS = [
    { name: "Rosario Gil", phone: "6•• ••• 318", zone: "San Lorenzo", type: "Piso", date: "Hoy, 09:42", state: "Nueva", tone: "new", c: "#9A3B26" },
    { name: "Manuel Herrera", phone: "6•• ••• 552", zone: "Santa Cruz", type: "Casa", date: "Ayer, 18:10", state: "Nueva", tone: "new", c: "#2F4A3F" },
    { name: "Pilar Domínguez", phone: "6•• ••• 129", zone: "Alfalfa", type: "Ático", date: "20 oct", state: "Valoración agendada", tone: "info", c: "#2D5C9A" },
    { name: "Francisco Vela", phone: "6•• ••• 804", zone: "Arenal", type: "Local", date: "17 oct", state: "Contactado", tone: "done", c: "#C9973F" },
  ];
  var VISITS = [
    { d: "Lun", n: "26", h: "10:30", who: "Javier O.", ref: "AB-104" },
    { d: "Lun", n: "26", h: "18:00", who: "María L.", ref: "AB-101" },
    { d: "Mar", n: "27", h: "12:00", who: "Carmen R.", ref: "AB-102" },
    { d: "Jue", n: "29", h: "17:30", who: "Antonio M.", ref: "AB-103" },
  ];

  /* Toast */
  var toastEl = $("[data-toast]");
  var toastT;
  function toast(msg) {
    toastEl.innerHTML = "<b>Simulación</b><span>" + esc(msg) + "</span>";
    toastEl.classList.add("is-in");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove("is-in"); }, 3600);
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-sim]");
    if (b) toast(b.dataset.sim);
  });

  /* Navigation */
  var nav = $("[data-nav]");
  var ind = $("[data-ind]");
  var views = ["resumen", "inmuebles", "nuevo", "consultas", "propietarios"];
  function moveInd(a) {
    if (!a) return;
    var r = a.getBoundingClientRect();
    var nr = nav.getBoundingClientRect();
    ind.style.width = r.width + "px";
    ind.style.right = "auto";
    ind.style.transform = "translate(" + (r.left - nr.left) + "px," + (r.top - nr.top) + "px)";
  }
  function route() {
    var v = location.hash.slice(1);
    if (views.indexOf(v) < 0) v = "resumen";
    $$("[data-v]").forEach(function (s) { s.hidden = s.dataset.v !== v; });
    var active;
    $$("a[data-view]", nav).forEach(function (a) {
      var on = a.dataset.view === v;
      if (on) { a.setAttribute("aria-current", "page"); active = a; } else a.removeAttribute("aria-current");
    });
    moveInd(active);
    if (v === "resumen") renderSummary();
    if (v === "inmuebles") { renderProps(); requestAnimationFrame(moveTab); }
    if (v === "consultas") renderLeads();
    if (v === "propietarios") renderOwners();
    if (v === "nuevo") renderPreview();
    window.scrollTo(0, 0);
  }
  addEventListener("hashchange", route);
  addEventListener("resize", function () { moveInd($("a[aria-current]", nav)); moveTab(); });

  function badges() {
    $("[data-badge-props]").textContent = props.length;
    var nl = LEADS.filter(function (l) { return l.state === "nueva"; }).length;
    $("[data-badge-leads]").textContent = nl || "";
    $("[data-badge-owners]").textContent = OWNERS.filter(function (o) { return o.tone === "new"; }).length || "";
  }

  /* Summary */
  function counter(el, to) {
    if (reduce) { el.textContent = to; return; }
    var start = performance.now();
    var dur = 900;
    (function tick(t) {
      var k = Math.min(1, (t - start) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e);
      if (k < 1) requestAnimationFrame(tick);
    })(start);
  }
  function renderSummary() {
    var live = props.filter(function (p) { return p.published && p.status !== "borrador"; });
    var k = [
      { l: "Inmuebles publicados", v: live.length, s: "de " + props.length + " en cartera", c: "#1B1714" },
      { l: "Disponibles", v: props.filter(function (p) { return p.status === "disponible"; }).length, s: "listos para visitar", c: "#3E8E5A" },
      { l: "Reservados", v: props.filter(function (p) { return p.status === "reservado"; }).length, s: "con señal", c: "#C9973F" },
      { l: "Vendidos / alquilados", v: props.filter(function (p) { return p.status === "vendido" || p.status === "alquilado"; }).length, s: "este trimestre", c: "#7A6D62" },
      { l: "Consultas recibidas", v: 38, s: "<b>+9</b> respecto al mes anterior", c: "#9A3B26" },
      { l: "Visitas pendientes", v: VISITS.length, s: "en los próximos 7 días", c: "#2D5C9A" },
    ];
    $("[data-kpis]").innerHTML = k.map(function (x, i) {
      return '<div class="kpi" style="--d:' + i * 50 + 'ms;--c:' + x.c + '"><small><i></i>' + x.l + "</small><strong data-to=\"" + x.v + '">0</strong><span>' + x.s + "</span></div>";
    }).join("");
    $$("[data-to]").forEach(function (el, i) { setTimeout(function () { counter(el, +el.dataset.to); }, reduce ? 0 : i * 50); });

    var weeks = [3, 5, 4, 6, 5, 8, 7, 11];
    var max = Math.max.apply(null, weeks);
    var labels = ["S36", "S37", "S38", "S39", "S40", "S41", "S42", "S43"];
    $("[data-chart]").innerHTML = weeks.map(function (w, i) {
      return '<div class="bar' + (i === weeks.length - 1 ? " is-last" : "") + '" style="--h:' + (w / max) * 82 + "%;--d:" + i * 45 + 'ms"><b>' + w + "</b><i></i><small>" + labels[i] + "</small></div>";
    }).join("");

    $("[data-agenda]").innerHTML = VISITS.map(function (v) {
      var p = byRef(v.ref);
      return '<li><span class="d">' + v.d + "<b>" + v.n + '</b></span><span class="t"><b>' + v.h + " · " + v.who + "</b><span>" + p.type + " en " + p.zone + '</span></span><span class="ref">' + v.ref + "</span></li>";
    }).join("");

    var top = props.filter(function (p) { return p.views; }).sort(function (a, b) { return b.views - a.views; }).slice(0, 4);
    $("[data-rank]").innerHTML = top.map(function (p, i) {
      return '<li><span class="th">' + thumb(p) + "</span><span><b>" + p.ref + "</b> · " + esc(p.zone) + '<div class="meter"><i style="--w:' + (p.views / top[0].views) * 100 + "%;--d:" + i * 80 + 'ms"></i></div></span><span class="n">' + p.views + " vistas</span></li>";
    }).join("");

    var ic = {
      lead: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 4z"/></svg>',
      state: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4 4L19 7"/></svg>',
      owner: '<svg viewBox="0 0 24 24"><path d="M3 11l9-7 9 7M5 10v10h14V10"/></svg>',
      edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
    };
    var feed = [
      ["lead", "Nueva consulta de <b>María López</b> sobre AB-101", "12 min"],
      ["owner", "<b>Rosario Gil</b> quiere vender un piso en San Lorenzo", "09:42"],
      ["state", "AB-102 marcado como <b>reservado</b>", "ayer"],
      ["edit", "Precio de AB-104 actualizado a 1.150 €/mes", "ayer"],
      ["state", "AB-105 marcado como <b>alquilado</b>", "lun"],
    ];
    $("[data-feed]").innerHTML = feed.map(function (f) {
      return '<li><span class="ic">' + ic[f[0]] + "</span><span>" + f[1] + "</span><time>" + f[2] + "</time></li>";
    }).join("");
  }

  /* Properties */
  var TABS = [
    { k: "", l: "Todos" },
    { k: "disponible", l: "Disponibles" },
    { k: "reservado", l: "Reservados" },
    { k: "cerrado", l: "Vendidos / alquilados" },
    { k: "borrador", l: "Borradores" },
  ];
  var filt = { tab: "", q: "", layout: window.matchMedia("(max-width: 700px)").matches ? "cards" : "table" };
  var tabsEl = $("[data-tabs]");
  function match(p) {
    var t = filt.tab;
    var okTab = !t || (t === "cerrado" ? p.status === "vendido" || p.status === "alquilado" : p.status === t);
    var q = filt.q.trim().toLowerCase();
    var okQ = !q || (p.ref + " " + p.title + " " + p.zone + " " + p.type).toLowerCase().indexOf(q) > -1;
    return okTab && okQ;
  }
  function renderTabs() {
    var html = '<span class="tabs__ind" data-tabs-ind aria-hidden="true"></span>';
    html += TABS.map(function (t) {
      var n = props.filter(function (p) { var s = filt.tab; filt.tab = t.k; var r = match(p); filt.tab = s; return r; }).length;
      return '<button type="button" role="tab" aria-selected="' + (filt.tab === t.k) + '" data-tab="' + t.k + '">' + t.l + "<em>" + n + "</em></button>";
    }).join("");
    tabsEl.innerHTML = html;
    moveTab(true);
  }
  function moveTab(instant) {
    var b = $('[aria-selected="true"]', tabsEl);
    var i = $("[data-tabs-ind]", tabsEl);
    if (!b || !i) return;
    if (instant === true) i.style.transition = "none";
    i.style.width = b.offsetWidth + "px";
    i.style.transform = "translateX(" + b.offsetLeft + "px)";
    if (instant === true) { void i.offsetWidth; i.style.transition = ""; }
  }
  tabsEl.addEventListener("click", function (e) {
    var b = e.target.closest("[data-tab]");
    if (!b) return;
    filt.tab = b.dataset.tab;
    $$("[data-tab]", tabsEl).forEach(function (x) { x.setAttribute("aria-selected", String(x === b)); });
    moveTab();
    renderRows();
  });
  $("[data-q]").addEventListener("input", function (e) { filt.q = e.target.value; renderTabs(); renderRows(); });
  $$("[data-layout]").forEach(function (b) {
    b.addEventListener("click", function () { filt.layout = b.dataset.layout; renderRows(); });
  });

  var DOTS = '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>';
  function statusPill(p) {
    var s = D.STATUS[p.status];
    return '<span class="pill pill--' + s.tone + '" data-pill="' + p.ref + '">' + s.label + "</span>";
  }
  function pubSwitch(p) {
    var on = p.published && p.status !== "borrador";
    return '<span class="pub"><button type="button" class="switch" role="switch" aria-checked="' + on + '" aria-label="Publicado en la web: ' + p.ref + '" data-act="toggle" data-ref="' + p.ref + '"></button>' + (on ? "Publicado" : p.status === "borrador" ? "Borrador" : "Oculto") + "</span>";
  }
  function menu(p) {
    var on = p.published && p.status !== "borrador";
    return (
      '<div class="menu"><button type="button" aria-haspopup="true" aria-expanded="false" aria-label="Acciones para ' + p.ref + '" data-menu>' + DOTS + "</button>" +
      '<div class="menu__pop" role="menu">' +
      '<button role="menuitem" data-act="edit" data-ref="' + p.ref + '">Editar</button>' +
      '<button role="menuitem" data-act="' + (on ? "hide" : "publish") + '" data-ref="' + p.ref + '">' + (on ? "Ocultar de la web" : "Publicar") + "</button><hr>" +
      '<button role="menuitem" data-act="reservado" data-ref="' + p.ref + '"><i style="--c:#C9973F"></i>Marcar reservado</button>' +
      '<button role="menuitem" data-act="' + (p.op === "alquiler" ? "alquilado" : "vendido") + '" data-ref="' + p.ref + '"><i style="--c:#7A6D62"></i>Marcar ' + (p.op === "alquiler" ? "alquilado" : "vendido") + "</button>" +
      '<button role="menuitem" data-act="disponible" data-ref="' + p.ref + '"><i style="--c:#3E8E5A"></i>Marcar disponible</button>' +
      "</div></div>"
    );
  }
  function renderRows() {
    var list = props.filter(match);
    var hidden = function (p) { return !(p.published && p.status !== "borrador"); };
    $("[data-rows]").innerHTML = list.map(function (p) {
      return (
        '<tr class="' + (hidden(p) ? "is-hidden-row" : "") + '"><td><div class="prop"><span class="th">' + thumb(p) + "</span><div><b>" + esc(p.title) + '</b><span class="ref">' + p.ref + "</span></div></div></td>" +
        "<td>" + p.type + " · " + (p.op === "venta" ? "Venta" : "Alquiler") + "</td><td>" + p.zone + '</td><td class="num">' + D.price(p) + "</td>" +
        "<td>" + statusPill(p) + "</td><td>" + pubSwitch(p) + "</td><td>" + menu(p) + "</td></tr>"
      );
    }).join("");
    $("[data-pcards]").innerHTML = list.map(function (p, i) {
      return (
        '<article class="pcard ' + (hidden(p) ? "is-hidden-row" : "") + '" style="--d:' + i * 40 + 'ms"><div class="pcard__art">' + thumb(p) + statusPill(p) + "</div>" +
        '<div class="pcard__body"><span class="ref" style="justify-self:start">' + p.ref + "</span><b>" + esc(p.title) + '</b><span class="muted">' + p.type + " · " + p.zone + "</span><strong>" + D.price(p) + "</strong></div>" +
        '<div class="pcard__foot">' + pubSwitch(p) + menu(p) + "</div></article>"
      );
    }).join("");
    var cards = filt.layout === "cards";
    $("[data-table-wrap]").hidden = cards || !list.length;
    $("[data-pcards]").hidden = !cards || !list.length;
    $("[data-empty]").hidden = !!list.length;
    $$("[data-layout]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.layout === filt.layout)); });
  }
  function renderProps() { renderTabs(); renderRows(); }

  function closeMenus(except) {
    $$(".menu.is-open").forEach(function (m) {
      if (m !== except) { m.classList.remove("is-open"); $("[data-menu]", m).setAttribute("aria-expanded", "false"); }
    });
  }
  document.addEventListener("click", function (e) {
    var mb = e.target.closest("[data-menu]");
    if (mb) {
      var m = mb.parentElement;
      var open = !m.classList.contains("is-open");
      closeMenus(m);
      m.classList.toggle("is-open", open);
      mb.setAttribute("aria-expanded", String(open));
      var pop = $(".menu__pop", m);
      pop.classList.toggle("is-up", mb.getBoundingClientRect().bottom > innerHeight - 260);
      return;
    }
    var a = e.target.closest("[data-act]");
    if (!a) { closeMenus(); return; }
    closeMenus();
    act(a.dataset.act, byRef(a.dataset.ref));
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenus(); });

  function act(kind, p) {
    var msg;
    if (kind === "edit") { toast("Se abriría la ficha de " + p.ref + " para editar texto, precio y fotos. En esta demo no se modifica nada."); return; }
    if (kind === "toggle") kind = p.published && p.status !== "borrador" ? "hide" : "publish";
    if (kind === "hide") { p.published = false; msg = p.ref + " dejaría de verse en la web."; }
    else if (kind === "publish") { p.published = true; if (p.status === "borrador") p.status = "disponible"; msg = p.ref + " aparecería publicado en la web al momento."; }
    else { p.status = kind; p.published = p.published || kind !== "borrador"; msg = p.ref + " pasaría a «" + D.STATUS[kind].label + "» también en la web."; }
    renderProps();
    var pill = $('[data-pill="' + p.ref + '"]');
    if (pill && !reduce) pill.classList.add("flash");
    toast(msg + " (Vista previa: no se guarda.)");
  }

  /* New property form with live preview */
  var FEATS = ["Terraza", "Patio", "Ascensor", "Aire acondicionado", "Calefacción", "Amueblado", "Exterior", "Trastero", "Garaje", "Azotea", "Reformado", "Suelo hidráulico"];
  var on = { Patio: true, Exterior: true, Reformado: true };
  $("[data-feats]").innerHTML = FEATS.map(function (f) {
    return '<button type="button" aria-pressed="' + !!on[f] + '" data-feat>' + f + "</button>";
  }).join("");
  $("[data-feats]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-feat]");
    if (b) b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
  });
  $("[data-thumbs]").innerHTML = [
    { kind: "patio", wall: "#F6EDE0", seed: 31 },
    { kind: "fachada", wall: "#E4B77A", floors: 3, seed: 32 },
    { kind: "atico", wall: "#F1E4CF", seed: 33 },
  ].map(function (o, i) { return "<div>" + art(o, "") + "<span>" + (i === 0 ? "Portada" : "Foto " + (i + 1)) + "</span></div>"; }).join("");
  $(".drop").setAttribute("data-sim", "Aquí podrías subir y ordenar las fotos. En esta demo no se sube ningún archivo.");

  var newOp = "venta";
  $$("[data-seg] button").forEach(function (b) {
    b.addEventListener("click", function () {
      newOp = b.dataset.op;
      $$("[data-seg] button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      $("[data-affix]").textContent = newOp === "alquiler" ? "€/mes" : "€";
      var pr = $('[data-in="price"]');
      if (newOp === "alquiler" && +pr.value > 20000) pr.value = 1200;
      if (newOp === "venta" && +pr.value < 20000) pr.value = 295000;
      renderPreview();
    });
  });
  var pvArt = art({ kind: "patio", wall: "#F6EDE0", seed: 31 }, "Vista previa de la foto de portada");
  function val(k) { return $('[data-in="' + k + '"]').value; }
  function renderPreview() {
    $("[data-pv-art]").innerHTML = pvArt;
    $("[data-pv-title]").textContent = val("title") || "Sin título";
    $("[data-pv-zone]").textContent = val("zone") || "Ubicación";
    var n = parseInt(String(val("price")).replace(/\D/g, ""), 10) || 0;
    $("[data-pv-price]").textContent = D.fmt(n) + (newOp === "alquiler" ? " €/mes" : " €");
    var f = [];
    if (+val("beds")) f.push(val("beds") + " hab.");
    if (+val("baths")) f.push(val("baths") + (+val("baths") > 1 ? " baños" : " baño"));
    if (+val("m2")) f.push(val("m2") + " m²");
    $("[data-pv-facts]").textContent = f.join(" · ");
    var s = D.STATUS[val("status")];
    var pill = $("[data-pv-status]");
    pill.className = "pill pill--" + s.tone;
    pill.textContent = s.label;
  }
  $("[data-new]").addEventListener("input", renderPreview);
  $("[data-new]").addEventListener("change", renderPreview);
  $("[data-new]").addEventListener("submit", function (e) {
    e.preventDefault();
    toast("En la versión final, «" + (val("title") || "el inmueble") + "» aparecería publicado en tu web en ese momento. Aquí no se crea nada.");
  });

  /* Leads */
  var sel = 1;
  var ICON = {
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 20l1.4-4.2A8 8 0 1 1 8.4 18.7z"/></svg>',
    ok: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4 4L19 7"/></svg>',
  };
  function initials(n) { return n.split(" ").map(function (w) { return w[0]; }).slice(0, 2).join(""); }
  function renderLeads() {
    $("[data-leads]").innerHTML = LEADS.map(function (l) {
      return (
        '<li><button type="button" class="lead' + (l.state === "atendida" ? " is-done" : "") + '" role="option" aria-selected="' + (l.id === sel) + '" data-lead-id="' + l.id + '">' +
        '<span class="av" style="--c:' + l.c + '">' + initials(l.name) + "</span>" +
        "<span><b>" + (l.state === "nueva" ? '<i class="new" aria-label="Nueva"></i>' : "") + l.name + "</b><p>" + l.ref + " · " + esc(l.msg) + "</p></span>" +
        "<time>" + l.when + "</time></button></li>"
      );
    }).join("");
    renderLead();
  }
  function renderLead() {
    var l = LEADS.filter(function (x) { return x.id === sel; })[0];
    var p = byRef(l.ref);
    $("[data-lead]").innerHTML =
      '<div class="who"><span class="av" style="--c:' + l.c + '">' + initials(l.name) + "</span><div><h2>" + l.name + '</h2><div class="meta"><span>Interesada/o en <b>' + l.ref + "</b></span><span>" + l.when + "</span><span>Desde el formulario de la ficha</span></div></div></div>" +
      '<blockquote class="quote">“' + esc(l.msg) + "”</blockquote>" +
      '<div class="about"><span class="th">' + thumb(p) + "</span><div><b>" + esc(p.title) + '</b><span class="muted">' + p.ref + " · " + p.zone + " · " + D.price(p) + "</span></div><span style=\"margin-left:auto\">" + statusPill(p) + "</span></div>" +
      '<div class="meta"><span>Teléfono: <span class="mono">' + l.phone + "</span></span><span>Estado: " + (l.state === "nueva" ? '<span class="pill pill--new">Sin atender</span>' : '<span class="pill pill--ok">Atendida</span>') + "</span></div>" +
      '<div class="acts">' +
      '<button class="btn btn--ghost" data-sim="Abriría la consulta completa con el historial de mensajes de ' + l.name + '.">' + ICON.eye + "Ver consulta</button>" +
      '<button class="btn btn--ghost" data-sim="Llamaría a ' + l.name + ' desde el móvil con un toque. Número oculto en la demo.">' + ICON.phone + "Llamar</button>" +
      '<button class="btn btn--ghost" data-sim="Abriría WhatsApp con un mensaje preparado sobre ' + l.ref + '.">' + ICON.wa + "WhatsApp</button>" +
      (l.state === "nueva" ? '<button class="btn btn--primary" data-done="' + l.id + '">' + ICON.ok + "Marcar como atendida</button>" : "") +
      "</div>";
  }
  $("[data-leads]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-lead-id]");
    if (!b) return;
    sel = +b.dataset.leadId;
    $$("[data-lead-id]").forEach(function (x) { x.setAttribute("aria-selected", String(x === b)); });
    renderLead();
  });
  $("[data-lead]").addEventListener("click", function (e) {
    var b = e.target.closest("[data-done]");
    if (!b) return;
    LEADS.forEach(function (l) { if (l.id === +b.dataset.done) l.state = "atendida"; });
    renderLeads();
    badges();
    toast("Consulta marcada como atendida en esta vista previa. No se guarda.");
  });

  /* Owners */
  function renderOwners() {
    $("[data-owners]").innerHTML = OWNERS.map(function (o) {
      return (
        '<tr><td><span class="owner"><span class="av" style="--c:' + o.c + '">' + initials(o.name) + "</span>" + o.name + '</span></td><td class="mono">' + o.phone + "</td><td>" + o.zone + "</td><td>" + o.type + "</td><td>" + o.date + '</td><td><span class="pill pill--' + o.tone + '">' + o.state + "</span></td>" +
        '<td><button class="btn btn--ghost btn--sm" data-sim="Llamaría a ' + o.name + ' para concertar la visita de valoración.">' + ICON.phone + "Llamar</button></td></tr>"
      );
    }).join("");
  }

  badges();
  route();
})();
