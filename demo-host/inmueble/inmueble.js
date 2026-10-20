(function () {
  var V = window.VILLALON, A = window.VILLALON_ART, C = V.CONFIG;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  $$("[data-dir]").forEach(function (el) { el.textContent = C.direccion; });
  $("#anio").textContent = new Date().getFullYear();

  var id = new URLSearchParams(location.search).get("id");
  var todos = V.inmuebles();
  var p = todos.find(function (x) { return x.id === id; });
  var main = $("#ficha");

  if (!p) {
    main.innerHTML = '<div class="no-hay"><h1>Este inmueble ya no está publicado</h1><p>Puede que se haya vendido o alquilado. Echa un vistazo a lo que tenemos ahora.</p><a class="btn btn--ink" href="../#inmuebles">Ver inmuebles</a></div>';
    return;
  }
  document.title = p.titulo + " · Villalón";

  var cerrado = p.estado === "vendido" || p.estado === "alquilado";
  var fotos = A.galeria(p);
  if (p.foto) fotos.unshift({ k: "foto", svg: '<img src="' + p.foto + '" alt="">' });
  var msg = "Hola, me interesa el inmueble «" + p.titulo + "» (" + p.zona + ", " + V.precio(p) + ") que he visto en vuestra web.";
  var wa = V.wa(msg);

  function icono(d) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + d + '"/></svg>'; }
  var DATOS = [
    p.hab ? ["Dormitorios", p.hab, "M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 15h18M6 10V7h5v3"] : null,
    ["Baños", p.banos, "M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM6 12V5a2 2 0 0 1 4 0"],
    ["Superficie", p.m2 + " m²", "M4 4h16v16H4zM4 9h5V4"],
    ["Tipo", p.tipo, "M4 11 12 4l8 7M6 10v10h12V10"],
    ["Planta", p.planta, "M5 20V8h5V4h9v16M9 12h2M9 16h2M14 8h2M14 12h2M14 16h2"],
    ["Operación", p.operacion === "venta" ? "Venta" : "Alquiler", "M7 7h10l-3-3M17 17H7l3 3"]
  ].filter(Boolean);

  var similares = todos.filter(function (x) { return x.id !== p.id && x.operacion === p.operacion && x.estado !== "vendido" && x.estado !== "alquilado"; }).slice(0, 3);

  main.innerHTML =
    '<nav class="migas" aria-label="Ruta"><a href="../">Inicio</a> / <a href="../#inmuebles">Inmuebles</a> / <span>' + p.zona + "</span></nav>" +
    '<div class="ficha-pag__grid">' +
      '<div class="ficha-pag__main">' +
        '<section class="galeria" aria-label="Galería">' +
          '<div class="galeria__track" id="track">' + fotos.map(function (f, i) {
            return '<figure class="galeria__slide" data-i="' + i + '">' + f.svg + "<figcaption>" + (A.VISTAS[f.k] || "Foto") + "</figcaption></figure>";
          }).join("") + "</div>" +
          '<span class="galeria__n" id="gn">1 / ' + fotos.length + "</span>" +
          '<button class="galeria__btn galeria__btn--prev" type="button" aria-label="Foto anterior">‹</button><button class="galeria__btn galeria__btn--next" type="button" aria-label="Foto siguiente">›</button>' +
          '<div class="galeria__thumbs">' + fotos.map(function (f, i) {
            return '<button type="button" data-i="' + i + '" aria-label="Ver ' + (A.VISTAS[f.k] || "foto") + '"' + (i === 0 ? ' class="is-on"' : "") + ">" + f.svg + "</button>";
          }).join("") + "</div>" +
        "</section>" +
        '<header class="ficha-pag__head">' +
          '<div class="ficha-pag__chips"><span class="badge badge--op">' + (p.operacion === "venta" ? "Venta" : "Alquiler") + "</span>" +
            (p.estado !== "disponible" ? '<span class="badge badge--' + p.estado + '">' + V.ESTADOS[p.estado] + "</span>" : '<span class="badge badge--libre">Disponible</span>') + "</div>" +
          "<h1>" + p.titulo + "</h1>" +
          '<p class="ficha-pag__zona">' + p.tipo + " en " + p.zona + ", Sevilla</p>" +
          '<p class="ficha-pag__precio' + (cerrado ? " is-cerrado" : "") + '">' + V.precio(p) + "</p>" +
        "</header>" +
        '<ul class="datos-grid">' + DATOS.map(function (d) { return "<li>" + icono(d[2]) + "<span>" + d[0] + "</span><b>" + d[1] + "</b></li>"; }).join("") + "</ul>" +
        '<section class="bloque"><h2>Descripción</h2><p>' + p.descripcion + "</p></section>" +
        '<section class="bloque"><h2>Características</h2><ul class="extras">' + p.extras.map(function (e) { return "<li>" + e + "</li>"; }).join("") + "</ul></section>" +
        '<section class="bloque"><h2>Ubicación aproximada</h2>' +
          '<div class="ubicacion"><svg viewBox="0 0 400 200" aria-hidden="true"><rect width="400" height="200" fill="#EFE7D6"/>' +
          '<g fill="#E3D6BC"><rect x="10" y="10" width="110" height="60" rx="6"/><rect x="134" y="10" width="120" height="60" rx="6"/><rect x="268" y="10" width="122" height="60" rx="6"/><rect x="10" y="86" width="80" height="104" rx="6"/><rect x="290" y="86" width="100" height="104" rx="6"/></g>' +
          '<rect x="104" y="86" width="172" height="104" rx="10" fill="#C9D7B8"/><path d="M0 78 H400 M97 0 V200 M283 0 V200" stroke="#fff" stroke-width="9"/>' +
          '<circle cx="190" cy="120" r="64" fill="#1F3A5A" opacity=".12"/><circle cx="190" cy="120" r="64" fill="none" stroke="#1F3A5A" stroke-width="2" stroke-dasharray="5 6"/>' +
          '<circle cx="190" cy="120" r="8" fill="#D9A43B" stroke="#1F3A5A" stroke-width="3"/></svg>' +
          "<p><b>" + p.zona + ", Sevilla.</b> Por privacidad del propietario mostramos solo la zona. Te damos la dirección exacta al concertar la visita.</p></div>" +
        "</section>" +
      "</div>" +
      '<aside class="ficha-pag__side" id="info">' +
        '<form class="tarjeta form" id="form-info" novalidate>' +
          '<p class="form__precio">' + V.precio(p) + "</p>" +
          "<h3>Quiero información</h3>" +
          '<p class="form__sub">' + (cerrado ? "Este inmueble ya está " + V.ESTADOS[p.estado].toLowerCase() + ". Te avisamos si entra algo parecido." : "Te llamamos para resolver dudas o concertar una visita.") + "</p>" +
          '<label class="campo"><span>Nombre</span><input name="nombre" autocomplete="name" required></label>' +
          '<label class="campo"><span>Teléfono</span><input name="telefono" type="tel" inputmode="tel" autocomplete="tel" required></label>' +
          '<label class="campo"><span>Mensaje</span><textarea name="mensaje" rows="3">' + msg + "</textarea></label>" +
          '<button class="btn btn--alb btn--block" type="submit">Quiero información</button>' +
          (wa ? '<a class="btn btn--wa btn--block" href="' + wa + '" target="_blank" rel="noopener">Preguntar por WhatsApp</a>' : "") +
          '<a class="btn btn--linea btn--block" href="' + V.tel() + '">Llamar al ' + C.telefono + "</a>" +
          '<p class="form__ok" hidden role="status">Gracias. En la web real tu solicitud llegaría a la agencia y al panel de gestión.</p>' +
        "</form>" +
        '<p class="ref">Ref. ' + p.id.toUpperCase().slice(0, 14) + "</p>" +
      "</aside>" +
    "</div>" +
    (similares.length ? '<section class="similares"><h2>También te puede interesar</h2><div class="similares__grid">' + similares.map(function (s) {
      return '<a class="mini" href="?id=' + encodeURIComponent(s.id) + '"><div class="mini__img">' + (s.foto ? '<img src="' + s.foto + '" alt="">' : A.portada(s)) + '</div><div><p class="ficha__meta">' + s.tipo + " · " + s.zona + "</p><b>" + s.titulo + "</b><span>" + V.precio(s) + "</span></div></a>";
    }).join("") + "</div></section>" : "") +
    '<div class="barra-movil"><div><small>' + (p.operacion === "venta" ? "Precio" : "Alquiler") + "</small><b>" + V.precio(p) + '</b></div><a class="btn btn--alb" href="#info">Quiero información</a>' +
      (wa ? '<a class="btn btn--wa btn--icono" href="' + wa + '" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm5.9 15.7c-.3-.2-1.9-1-2.2-1-.3-.1-.5-.2-.7.1l-1 1.3c-.2.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5 1-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.5c.2.2 2.4 3.6 5.7 5 2.1.9 3 1 4 .8.7-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg></a>' : "") +
    "</div>";

  /* galería: deslizar en móvil, flechas y miniaturas */
  var track = $("#track"), n = fotos.length, actual = 0;
  function ir(i) { i = (i + n) % n; track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" }); }
  track.addEventListener("scroll", function () {
    var i = Math.round(track.scrollLeft / track.clientWidth);
    if (i === actual) return;
    actual = i;
    $("#gn").textContent = (i + 1) + " / " + n;
    $$(".galeria__thumbs button").forEach(function (b, j) { b.classList.toggle("is-on", j === i); });
  }, { passive: true });
  $(".galeria__btn--prev").addEventListener("click", function () { ir(actual - 1); });
  $(".galeria__btn--next").addEventListener("click", function () { ir(actual + 1); });
  $$(".galeria__thumbs button").forEach(function (b) { b.addEventListener("click", function () { ir(+b.getAttribute("data-i")); }); });

  var f = $("#form-info");
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
})();
