(function () {
  var V = window.VILLALON, A = window.VILLALON_ART, C = V.CONFIG;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- datos de contacto ---------- */
  $$("[data-tel]").forEach(function (a) { a.href = V.tel(); });
  $$("[data-tel-text]").forEach(function (el) { el.textContent = C.telefono; });
  $$("[data-dir]").forEach(function (el) { el.textContent = C.direccion; });
  $$("[data-horario]").forEach(function (el) { el.textContent = C.horario; });
  $$("[data-wa]").forEach(function (a) {
    var url = V.wa(a.getAttribute("data-wa"));
    if (url) a.href = url; else { a.removeAttribute("target"); a.href = "#contacto"; }
  });
  if (!C.whatsapp) $$("[data-wa-only]").forEach(function (el) { el.hidden = true; });
  var anio = $("#anio"); if (anio) anio.textContent = new Date().getFullYear();

  /* ---------- menú ---------- */
  var burger = $(".burger"), menu = $("#menu");
  burger.addEventListener("click", function () {
    var open = burger.getAttribute("aria-expanded") !== "true";
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.body.classList.toggle("menu-abierto", open);
  });
  menu.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { burger.setAttribute("aria-expanded", "false"); document.body.classList.remove("menu-abierto"); }
  });

  /* ---------- inmuebles ---------- */
  var todos = V.inmuebles();
  var ORDEN = { disponible: 0, reservado: 1, alquilado: 2, vendido: 2 };
  todos.sort(function (a, b) { return ORDEN[a.estado] - ORDEN[b.estado]; });

  function datos(p) {
    var d = [];
    if (p.hab) d.push('<li><svg viewBox="0 0 24 24"><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 15h18M6 10V7h5v3"/></svg>' + p.hab + ' hab.</li>');
    d.push('<li><svg viewBox="0 0 24 24"><path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM6 12V5a2 2 0 0 1 4 0"/></svg>' + p.banos + (p.banos > 1 ? " baños" : " baño") + '</li>');
    d.push('<li><svg viewBox="0 0 24 24"><path d="M4 4h16v16H4zM4 9h5V4"/></svg>' + p.m2 + ' m²</li>');
    return '<ul class="datos-mini">' + d.join("") + "</ul>";
  }
  function badges(p) {
    var s = '<span class="badge badge--op">' + (p.operacion === "venta" ? "Venta" : "Alquiler") + "</span>";
    if (p.estado !== "disponible") s += '<span class="badge badge--' + p.estado + '">' + V.ESTADOS[p.estado] + "</span>";
    return '<div class="badges">' + s + "</div>";
  }
  function url(p) { return "inmueble/?id=" + encodeURIComponent(p.id); }
  function imagen(p) { return p.foto ? '<img src="' + p.foto + '" alt="">' : A.portada(p); }

  function fichaGrande(p, i) {
    return '<a class="ficha' + (i === 0 ? " ficha--xl" : "") + '" href="' + url(p) + '">' +
      '<div class="ficha__img">' + imagen(p) + badges(p) + "</div>" +
      '<div class="ficha__cuerpo"><p class="ficha__meta">' + p.tipo + " · " + p.zona + "</p>" +
      "<h3>" + p.titulo + "</h3>" + datos(p) + "</div>" +
      '<div class="ficha__precio"><b>' + V.precio(p) + '</b><span>Ver ficha →</span></div></a>';
  }
  function fichaFila(p) {
    return '<a class="fila' + (p.estado === "vendido" || p.estado === "alquilado" ? " fila--cerrada" : "") + '" href="' + url(p) + '">' +
      '<div class="fila__img">' + imagen(p) + badges(p) + "</div>" +
      '<div class="fila__cuerpo"><p class="ficha__meta">' + p.tipo + " · " + p.zona + "</p>" +
      "<h3>" + p.titulo + "</h3>" + datos(p) + '<p class="fila__precio">' + V.precio(p) + "</p></div></a>";
  }

  var destacados = todos.filter(function (p) { return p.destacado && p.estado !== "vendido" && p.estado !== "alquilado"; }).slice(0, 4);
  $("#destacados-lista").innerHTML = destacados.map(fichaGrande).join("");

  /* pines del mapa del hero */
  var POS = [[30, 22], [74, 18], [22, 74], [80, 62]];
  $("#barrio-pins").innerHTML = destacados.map(function (p, i) {
    var pos = POS[i % POS.length];
    return '<a class="pin" style="left:' + pos[0] + "%;top:" + pos[1] + '%" href="' + url(p) + '" aria-label="' + p.titulo + ", " + V.precio(p) + '">' +
      "<b>" + V.precio(p) + "</b><small>" + p.tipo + " · " + p.zona + "</small></a>";
  }).join("");

  /* ---------- buscador y filtros ---------- */
  var fTipo = $("#f-tipo"), fZona = $("#f-zona"), fPrecio = $("#f-precio");
  V.TIPOS.forEach(function (t) { fTipo.add(new Option(t, t)); });
  V.ZONAS.forEach(function (z) { fZona.add(new Option(z, z)); });
  var PRECIOS = { venta: [100000, 150000, 200000, 250000, 300000, 400000], alquiler: [600, 750, 900, 1200] };
  function opcionesPrecio(op) {
    fPrecio.innerHTML = "";
    fPrecio.add(new Option("Sin límite", ""));
    PRECIOS[op].forEach(function (n) { fPrecio.add(new Option("Hasta " + V.precio({ precio: n, operacion: op }), n)); });
  }
  opcionesPrecio("venta");
  $$('input[name="op"]').forEach(function (r) { r.addEventListener("change", function () { opcionesPrecio(r.value); }); });

  var filtro = { op: "", tipo: "", zona: "", max: 0 };
  function pinta() {
    var res = todos.filter(function (p) {
      return (!filtro.op || p.operacion === filtro.op) && (!filtro.tipo || p.tipo === filtro.tipo) &&
        (!filtro.zona || p.zona === filtro.zona) && (!filtro.max || p.precio <= filtro.max);
    });
    $("#lista").innerHTML = res.map(fichaFila).join("");
    $("#vacio").hidden = res.length > 0;
    var partes = [];
    if (filtro.op) partes.push(filtro.op === "venta" ? "en venta" : "en alquiler");
    if (filtro.tipo) partes.push(filtro.tipo.toLowerCase());
    if (filtro.zona) partes.push("en " + filtro.zona);
    if (filtro.max) partes.push("hasta " + V.precio({ precio: filtro.max, operacion: filtro.op || "venta" }));
    $("#resultado").textContent = res.length + (res.length === 1 ? " inmueble" : " inmuebles") + (partes.length ? " · " + partes.join(", ") : "");
    $$("#filtros [data-op]").forEach(function (b) { b.classList.toggle("is-on", b.getAttribute("data-op") === filtro.op); });
    $("#limpiar").hidden = !(filtro.tipo || filtro.zona || filtro.max);
  }
  pinta();

  $("#buscador").addEventListener("submit", function (e) {
    e.preventDefault();
    filtro = { op: $('input[name="op"]:checked').value, tipo: fTipo.value, zona: fZona.value, max: +fPrecio.value || 0 };
    pinta();
    $("#inmuebles").scrollIntoView({ behavior: "smooth" });
  });
  $$("#filtros [data-op]").forEach(function (b) {
    b.addEventListener("click", function () {
      filtro.op = b.getAttribute("data-op");
      if (filtro.max && filtro.op) filtro.max = 0;
      pinta();
    });
  });
  $("#limpiar").addEventListener("click", function () { filtro = { op: filtro.op, tipo: "", zona: "", max: 0 }; fTipo.value = ""; fZona.value = ""; fPrecio.value = ""; pinta(); });

  /* ---------- formularios (demo: no se envían) ---------- */
  $$("form.form").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      $$("[required]", f).forEach(function (i) {
        var vacio = !i.value.trim();
        i.closest(".campo").classList.toggle("campo--error", vacio);
        if (vacio && ok) { i.focus(); ok = false; }
      });
      if (!ok) return;
      $(".form__ok", f).hidden = false;
      $("button[type=submit]", f).disabled = true;
    });
    f.addEventListener("input", function (e) { var c = e.target.closest(".campo"); if (c) c.classList.remove("campo--error"); });
  });
  $$("[data-asunto]").forEach(function (a) {
    a.addEventListener("click", function () { $("#asunto").value = a.getAttribute("data-asunto"); });
  });
})();
