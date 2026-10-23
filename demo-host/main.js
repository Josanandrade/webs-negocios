(function () {
  var D = window.MB, C = D.CONFIG;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Cabecera y menú */
  var top = $("[data-top]"), fab = $("[data-fab]");
  function onScroll() {
    var y = window.scrollY;
    top.classList.toggle("is-scrolled", y > 10);
    if (fab) fab.classList.toggle("show", y > window.innerHeight * .8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var menuBtn = $("[data-menu-btn]"), menu = $("[data-menu]");
  function setMenu(open) {
    menuBtn.setAttribute("aria-expanded", String(open));
    menu.hidden = !open;
  }
  menuBtn.addEventListener("click", function () { setMenu(menu.hidden); });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !menu.hidden) setMenu(false); });

  /* Revelado */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
  $$(".reveal").forEach(function (el) { io.observe(el); });

  /* Calle del hero */
  var street = $("[data-street]");
  function edificio(x, w, floors, hue, seed) {
    var fh = 44, base = 470, H = floors * fh, t = base - H, s = "";
    var r = (function (n) { return function () { n = (n * 9301 + 49297) % 233280; return n / 233280; }; })(seed);
    s += '<rect x="' + x + '" y="' + t + '" width="' + w + '" height="' + H + '" fill="' + hue + '"/>';
    s += '<rect x="' + (x - 4) + '" y="' + (t - 8) + '" width="' + (w + 8) + '" height="8" fill="#F4EFE7"/>';
    var cols = Math.max(2, Math.round(w / 52)), cw = w / cols;
    for (var f = 0; f < floors - 1; f++) {
      for (var c = 0; c < cols; c++) {
        var wx = x + c * cw + cw * .24, wy = t + 10 + f * fh, ww = cw * .52, wh = fh * .56, lit = r() > .7;
        s += '<rect x="' + wx + '" y="' + wy + '" width="' + ww + '" height="' + wh + '" rx="1.5" fill="' + (lit ? "#F2D49B" : "#3A3F4A") + '"' + (lit ? ' class="art-lit"' : "") + '/>';
        s += '<rect x="' + (wx - 4) + '" y="' + (wy + wh - 2) + '" width="' + (ww + 8) + '" height="3" fill="#16181D" opacity=".7"/>';
        if (r() > .5) {
          var col = r() > .45 ? "#A23B22" : "#6E7F4E", n = 5, sw = (ww + 8) / n, st = "";
          for (var k = 0; k < n; k += 2) st += '<rect x="' + (wx - 4 + k * sw) + '" y="' + (wy - 5) + '" width="' + sw + '" height="10" fill="' + col + '"/>';
          s += '<rect x="' + (wx - 4) + '" y="' + (wy - 5) + '" width="' + (ww + 8) + '" height="10" fill="#F4EFE7"/>' + st;
        }
      }
    }
    s += '<path d="M' + (x + w / 2 - 18) + ' ' + base + ' v-26 a18 18 0 0 1 36 0 v26z" fill="#3B2B22"/>';
    return s;
  }
  function arbol(x, r) {
    return '<g class="sway"><rect x="' + (x - 4) + '" y="360" width="8" height="112" fill="#5B4A3A"/>' +
      '<circle cx="' + x + '" cy="' + (350 - r * .3) + '" r="' + r + '" fill="#6E7F4E"/>' +
      '<circle cx="' + (x - r * .75) + '" cy="368" r="' + r * .7 + '" fill="#7E9160"/>' +
      '<circle cx="' + (x + r * .8) + '" cy="364" r="' + r * .66 + '" fill="#5F7043"/></g>';
  }
  if (street) {
    street.innerHTML =
      '<defs><linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6DDC0"/><stop offset=".7" stop-color="#F3E6D4"/></linearGradient></defs>' +
      '<rect width="640" height="520" fill="url(#cielo)"/>' +
      '<g class="layer" data-depth="0.15"><circle cx="500" cy="110" r="46" fill="#EDB68A" opacity=".6"/>' +
        '<path d="M150 470 V250 h26 v-34 h-6 v-22 h10 v-24 l6 -18 l6 18 v24 h10 v22 h-6 v34 h26 V470z" fill="#E5C9A7"/>' +
        '<rect x="0" y="330" width="640" height="140" fill="#EBD3B4"/>' +
        '<path d="M0 330 h70 v-30 h60 v30 h140 v-44 h80 v44 h120 v-20 h70 v20 h100 v140 H0z" fill="#E7CBA8"/></g>' +
      '<g class="layer" data-depth="0.35">' + edificio(30, 190, 7, "#C98B5E", 7) + edificio(236, 160, 8, "#E3C9A6", 19) + edificio(412, 210, 6, "#B6704F", 31) + '</g>' +
      '<g class="layer" data-depth="0.6"><rect x="0" y="470" width="640" height="50" fill="#D9CDBB"/><rect x="0" y="470" width="640" height="3" fill="#16181D" opacity=".2"/>' +
        arbol(20, 58) + arbol(230, 50) + arbol(600, 62) + '</g>';
  }
  var layers = $$(".layer", street);
  var heroArt = $("[data-parallax]");
  var px = 0, py = 0, sy = 0, ticking = false;
  function paint() {
    ticking = false;
    layers.forEach(function (l) {
      var d = parseFloat(l.getAttribute("data-depth"));
      l.style.transform = "translate(" + (px * d * 14).toFixed(2) + "px," + (py * d * 8 + sy * d * -0.12).toFixed(2) + "px)";
    });
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }
  if (!reduce && heroArt) {
    window.addEventListener("scroll", function () { sy = Math.min(window.scrollY, 700); req(); }, { passive: true });
    if (window.matchMedia("(hover: hover)").matches) {
      heroArt.addEventListener("pointermove", function (e) {
        var b = heroArt.getBoundingClientRect();
        px = (e.clientX - b.left) / b.width - .5; py = (e.clientY - b.top) / b.height - .5; req();
      });
      heroArt.addEventListener("pointerleave", function () { px = py = 0; req(); });
    }
  }

  /* Ficha flotante que recorre la cartera de ejemplo */
  var publicados = D.inmuebles.filter(function (p) { return p.publicado; });
  var dots = $("[data-ficha-dots]"), fi = 0, fTimer = null, DUR = 3600;
  if (dots) {
    dots.innerHTML = publicados.slice(0, 5).map(function () { return "<i></i>"; }).join("");
    var fichaEls = { art: $("[data-ficha-art]"), ref: $("[data-ficha-ref]"), title: $("[data-ficha-title]"), meta: $("[data-ficha-meta]"), price: $("[data-ficha-price]") };
    function showFicha(i) {
      var p = publicados[i];
      fichaEls.art.innerHTML = D.art(p, { uid: "f" });
      fichaEls.ref.textContent = p.ref + " · " + (p.operacion === "venta" ? "Venta" : "Alquiler");
      fichaEls.title.textContent = p.titulo;
      fichaEls.meta.textContent = (p.hab ? p.hab + " hab · " : "") + p.m2 + " m²";
      fichaEls.price.textContent = D.fmtPrecio(p);
      [fichaEls.art, fichaEls.title, fichaEls.price].forEach(function (el) { el.classList.remove("swap"); void el.offsetWidth; el.classList.add("swap"); });
      $$("i", dots).forEach(function (d, k) { d.className = k < i ? "done" : k === i ? "on" : ""; d.style.setProperty("--dur", DUR + "ms"); });
    }
    function next() { fi = (fi + 1) % Math.min(5, publicados.length); showFicha(fi); }
    showFicha(0);
    if (!reduce) {
      var start = function () { if (!fTimer) fTimer = setInterval(next, DUR); };
      var stop = function () { clearInterval(fTimer); fTimer = null; };
      start();
      document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    }
  }

  /* Cartera */
  var grid = $("[data-grid]");
  grid.innerHTML = publicados.map(function (p, i) {
    var cerrado = p.estado === "vendido" || p.estado === "alquilado";
    return '<button class="card-inm' + (cerrado ? " cerrado" : "") + '" type="button" data-op="' + p.operacion + '" data-i="' + D.inmuebles.indexOf(p) + '">' +
      '<div class="card-art">' + D.art(p, { uid: "c" + i }) + '<span class="tag-ej">Ejemplo</span><span class="estado ' + p.estado + '">' + D.ESTADOS[p.estado] + '</span></div>' +
      '<div class="card-body"><p class="card-ref">' + p.ref + '<span>' + p.zona + '</span></p>' +
      '<p class="card-title">' + p.titulo + '</p>' +
      '<p class="card-specs">' + (p.hab ? "<span>" + p.hab + " hab.</span>" : "") + "<span>" + p.banos + " baño" + (p.banos > 1 ? "s" : "") + "</span><span>" + p.m2 + " m²</span><span>" + p.tipo + "</span></p>" +
      '<p class="card-price">' + D.fmtPrecio(p) + '<small>' + (p.operacion === "venta" ? "Venta" : "Alquiler") + "</small></p></div></button>";
  }).join("");

  var filtros = $("[data-filtros]"), pill = $("[data-pill]");
  function movePill(btn, instant) {
    if (instant) pill.style.transition = "none";
    pill.style.width = btn.offsetWidth + "px";
    pill.style.transform = "translateX(" + btn.offsetLeft + "px)";
    if (instant) { void pill.offsetWidth; pill.style.transition = ""; }
  }
  var activeBtn = $("button[aria-selected='true']", filtros);
  requestAnimationFrame(function () { movePill(activeBtn, true); });
  if (document.fonts) document.fonts.ready.then(function () { movePill(activeBtn, true); });
  window.addEventListener("resize", function () { movePill(activeBtn, true); });
  filtros.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b || b === activeBtn) return;
    activeBtn.setAttribute("aria-selected", "false"); b.setAttribute("aria-selected", "true"); activeBtn = b; movePill(b);
    var f = b.getAttribute("data-f"), k = 0;
    $$(".card-inm", grid).forEach(function (c) {
      var show = f === "todos" || c.getAttribute("data-op") === f;
      c.classList.toggle("is-hidden", !show);
      c.classList.remove("enter");
      if (show) { void c.offsetWidth; c.style.setProperty("--d", (k++ * 50) + "ms"); c.classList.add("enter"); }
    });
  });

  /* Hoja de detalle */
  var sheet = $("[data-sheet]");
  grid.addEventListener("click", function (e) {
    var c = e.target.closest(".card-inm"); if (!c) return;
    var p = D.inmuebles[+c.getAttribute("data-i")];
    $("[data-s-art]", sheet).innerHTML = D.art(p, { uid: "s" });
    $("[data-s-ref]", sheet).textContent = p.ref + " · " + p.zona;
    $("[data-s-title]", sheet).textContent = p.titulo;
    $("[data-s-price]", sheet).textContent = D.fmtPrecio(p);
    var rows = [["Operación", p.operacion === "venta" ? "Venta" : "Alquiler"], ["Estado", D.ESTADOS[p.estado]], ["Superficie", p.m2 + " m²"], ["Planta", p.planta]];
    if (p.hab) rows.splice(3, 0, ["Dormitorios", p.hab]);
    rows.push(["Baños", p.banos]);
    $("[data-s-dl]", sheet).innerHTML = rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join("");
    $("[data-s-desc]", sheet).textContent = p.desc;
    $("[data-s-extras]", sheet).innerHTML = p.extras.map(function (x) { return "<li>" + x + "</li>"; }).join("");
    sheet.showModal();
  });
  function closeSheet() {
    if (!sheet.open) return;
    if (reduce) { sheet.close(); return; }
    sheet.classList.add("closing");
    setTimeout(function () { sheet.classList.remove("closing"); sheet.close(); }, 200);
  }
  $$("[data-close]", sheet).forEach(function (b) { b.addEventListener("click", closeSheet); });
  sheet.addEventListener("click", function (e) { if (e.target === sheet) closeSheet(); });
  sheet.addEventListener("cancel", function (e) { e.preventDefault(); closeSheet(); });

  /* Formularios de demostración */
  $$("[data-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = $$("[required]", form).filter(function (i) { return !i.checkValidity(); });
      $$(".invalid", form).forEach(function (i) { i.classList.remove("invalid"); });
      if (bad.length) { bad.forEach(function (i) { void i.offsetWidth; i.classList.add("invalid"); }); bad[0].focus(); return; }
      var ok = $("[data-ok]", form); ok.hidden = false;
      form.querySelector("button[type=submit]").textContent = "Enviado (demostración)";
    });
    form.addEventListener("input", function (e) { e.target.classList.remove("invalid"); });
  });

  /* Contacto según los datos confirmados */
  var cc = $("[data-contact]"), items = [];
  if (C.telefono) items.push('<a href="tel:' + C.telefono.replace(/\s/g, "") + '"><span>Llamar</span><b>' + C.telefono + "</b></a>");
  if (C.whatsapp) items.push('<a href="https://wa.me/34' + C.whatsapp.replace(/\s/g, "") + '" target="_blank" rel="noopener"><span>WhatsApp</span><b>' + C.whatsapp + "</b></a>");
  if (C.email) items.push('<a href="mailto:' + C.email + '"><span>Email</span><b>' + C.email + "</b></a>");
  if (C.direccion) items.push("<a href=\"#contacto\"><span>Oficina</span><b>" + C.direccion + "</b></a>");
  if (items.length) cc.innerHTML = items.join(""); else cc.remove();

  /* Mini panel de la sección comercial: un estado que cambia solo */
  var rowsEl = $("[data-shot-rows]");
  if (rowsEl) {
    var sample = D.inmuebles.slice(0, 4);
    rowsEl.innerHTML = sample.map(function (p, i) {
      return '<div class="shot-row"><div class="th">' + D.art(p, { uid: "m" + i }) + '</div><div><b>' + p.titulo + '</b><small>' + p.ref + " · " + D.fmtPrecio(p) + '</small></div><span class="pill ' + p.estado + '" data-shot-pill="' + i + '">' + D.ESTADOS[p.estado] + "</span></div>";
    }).join("");
    if (!reduce) {
      var cycle = ["disponible", "reservado", "vendido"], ci = 0, target = $("[data-shot-pill='0']");
      var shotIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting && !target._t) target._t = setInterval(function () {
            ci = (ci + 1) % cycle.length;
            target.className = "pill " + cycle[ci]; target.textContent = D.ESTADOS[cycle[ci]];
            void target.offsetWidth; target.classList.add("flash");
          }, 2200);
          if (!e.isIntersecting && target._t) { clearInterval(target._t); target._t = null; }
        });
      });
      shotIO.observe(rowsEl);
    }
  }
})();
