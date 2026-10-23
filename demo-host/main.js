(function () {
  "use strict";
  var D = window.FE, C = D.config;
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* WhatsApp */
  function waLink(msg) { return "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent(msg); }
  if (!C.whatsapp) doc.classList.add("no-wa");
  $$("[data-wa]").forEach(function (a) { a.href = waLink(a.getAttribute("data-wa")); a.target = "_blank"; a.rel = "noopener"; });

  /* Cabecera */
  var top = $("#top");
  var onScroll = function () { top.classList.toggle("is-scrolled", window.scrollY > 8); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  var burger = $("#burger"), nav = $("#nav");
  burger.addEventListener("click", function () {
    var open = burger.getAttribute("aria-expanded") !== "true";
    burger.setAttribute("aria-expanded", open); nav.classList.toggle("is-open", open);
  });
  $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { burger.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); }); });

  /* Sección activa en el menú */
  var links = {}; $$("a", nav).forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  var secObs = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting && links[e.target.id]) {
        $$("a", nav).forEach(function (a) { a.classList.remove("is-active"); });
        links[e.target.id].classList.add("is-active");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  Object.keys(links).forEach(function (id) { var el = document.getElementById(id); if (el) secObs.observe(el); });

  /* Contadores */
  function count(el) {
    var to = +el.getAttribute("data-count"), suf = el.getAttribute("data-suffix") || "";
    if (el.hasAttribute("data-plain")) return;
    if (reduce) { el.textContent = to + suf; return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(to * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* Entradas por scroll con escalonado por grupo */
  var revObs = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      $$("[data-count]", e.target).forEach(count);
      revObs.unobserve(e.target);
    });
  }, { threshold: .15, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach(function (el) {
    var sibs = $$(":scope > .reveal", el.parentElement), i = sibs.indexOf(el);
    el.style.setProperty("--d", Math.min(i, 6) * 70 + "ms");
    revObs.observe(el);
  });

  /* Plano del hero: se dibuja solo */
  var plan = $(".plan");
  $$(".draw", plan).forEach(function (p) { try { p.style.setProperty("--len", Math.ceil(p.getTotalLength())); } catch (e) {} });
  requestAnimationFrame(function () { requestAnimationFrame(function () { plan.classList.add("is-drawn"); }); });

  /* Interruptores segmentados */
  function seg(root, onChange) {
    var btns = $$(".seg__btn", root);
    btns.forEach(function (b, i) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) { x.classList.toggle("is-on", x === b); x.setAttribute("aria-checked", x === b); });
        root.setAttribute("data-pos", i);
        if (onChange) onChange(b);
      });
    });
  }

  /* Listado */
  var list = $("#list"), empty = $("#empty");
  var state = { op: "todos", type: "", zone: "" };
  function money(p, op) {
    return p.toLocaleString("es-ES") + " €" + (op === "alquiler" ? "<small>/mes</small>" : "");
  }
  function card(p, i) {
    var closed = p.status === "vendido" || p.status === "alquilado";
    var specs = p.beds ? p.beds + " hab · " + p.baths + (p.baths === 1 ? " baño" : " baños") + " · " + p.m2 + " m²" : p.m2 + " m² · " + p.baths + " aseo";
    return '<button class="prop' + (closed ? " is-closed" : "") + '" style="--i:' + i + '" data-id="' + p.id + '" aria-label="Ver ficha: ' + p.title + '">' +
      '<div class="prop__media">' + FEArt.svg(p.art, p.tone) +
      '<div class="prop__badges"><span class="st-badge st-badge--' + p.status + '">' + D.statusLabel[p.status] + '</span><span class="prop__ex">Inmueble de ejemplo</span></div></div>' +
      '<div class="prop__body"><span class="prop__ref mono">' + p.id + " · " + p.type + " en " + p.op + '</span>' +
      '<h3 class="prop__title">' + p.title + '</h3><span class="prop__zone">' + p.zone + ', Sevilla</span>' +
      '<div class="prop__foot"><span class="prop__price">' + money(p.price, p.op) + '</span><span class="prop__specs">' + specs + '</span></div></div></button>';
  }
  function render() {
    var items = D.listings.filter(function (p) {
      return (state.op === "todos" || p.op === state.op) && (!state.type || p.type === state.type) && (!state.zone || p.zone === state.zone);
    });
    list.innerHTML = items.map(card).join("");
    empty.hidden = items.length > 0;
  }
  render();
  list.addEventListener("click", function (e) { var b = e.target.closest(".prop"); if (b) openDrawer(b.getAttribute("data-id"), b); });

  var chips = $$(".filters .chip");
  function setChip(v) { chips.forEach(function (c) { c.classList.toggle("is-on", c.getAttribute("data-f") === v); }); }
  chips.forEach(function (c) { c.addEventListener("click", function () { state.op = c.getAttribute("data-f"); setChip(state.op); render(); }); });
  $("#reset").addEventListener("click", function () { state = { op: "todos", type: "", zone: "" }; setChip("todos"); $("#s-type").value = ""; $("#s-zone").value = ""; render(); });

  var searchOp = "venta";
  seg($("#search .seg"), function (b) { searchOp = b.getAttribute("data-op"); });
  $("#search").addEventListener("submit", function (e) {
    e.preventDefault();
    state = { op: searchOp, type: $("#s-type").value, zone: $("#s-zone").value };
    setChip(searchOp); render();
    document.getElementById("inmuebles").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  });

  /* Ficha */
  var drawer = $("#drawer"), panel = $(".drawer__panel", drawer), lastFocus = null;
  function openDrawer(id, from) {
    var p = D.listings.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    lastFocus = from;
    $("#d-art").innerHTML = FEArt.svg(p.art, p.tone);
    $("#d-ref").textContent = p.id + " · " + p.type + " en " + p.op + " · " + D.statusLabel[p.status];
    $("#d-title").textContent = p.title;
    $("#d-price").innerHTML = money(p.price, p.op);
    $("#d-specs").innerHTML = (p.beds ? "<li><b>" + p.beds + "</b>habitaciones</li>" : "<li><b>—</b>diáfano</li>") + "<li><b>" + p.baths + "</b>" + (p.baths === 1 ? "baño" : "baños") + "</li><li><b>" + p.m2 + "</b>m²</li>";
    $("#d-text").textContent = p.text + " " + p.zone + ", Sevilla.";
    $("#d-tags").innerHTML = p.tags.map(function (t) { return "<li>" + t + "</li>"; }).join("");
    $("#d-wa").href = waLink("Hola, me interesa el inmueble " + p.id + " (" + p.title + ") que he visto en vuestra web.");
    $$(".drawer__body > *", drawer).forEach(function (el, i) { el.style.setProperty("--i", i); });
    drawer.classList.add("is-open"); drawer.setAttribute("aria-hidden", "false"); document.body.classList.add("lock");
    setTimeout(function () { panel.focus(); }, 60);
  }
  function closeDrawer() {
    drawer.classList.remove("is-open"); drawer.setAttribute("aria-hidden", "true"); document.body.classList.remove("lock");
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  $$("[data-close]", drawer).forEach(function (b) { b.addEventListener("click", closeDrawer); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer(); });

  /* Formulario de propietarios → WhatsApp */
  var sellMode = "vender";
  seg($("#sell-form .seg"), function (b) { sellMode = b.getAttribute("data-v"); $("#sell-form h3").textContent = sellMode === "vender" ? "Quiero vender mi vivienda" : "Quiero alquilar mi vivienda"; });
  $("#sell-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target, msg = $(".form__msg", f), bad = [];
    ["nombre", "tel", "zona"].forEach(function (n) { var el = f.elements[n]; el.classList.remove("is-bad"); if (!el.checkValidity() || !el.value.trim()) bad.push(el); });
    if (bad.length) {
      bad.forEach(function (el) { void el.offsetWidth; el.classList.add("is-bad"); });
      msg.textContent = "Revisa los campos marcados."; msg.classList.add("is-err"); bad[0].focus(); return;
    }
    msg.classList.remove("is-err");
    var text = "Hola, soy " + f.elements.nombre.value.trim() + ". Quiero " + sellMode + " un/a " + f.elements.tipo.value.toLowerCase() + " en " + f.elements.zona.value.trim() + ". Mi teléfono: " + f.elements.tel.value.trim() + ".";
    if (C.whatsapp) { window.open(waLink(text), "_blank", "noopener"); msg.textContent = "Abriendo WhatsApp con tu mensaje…"; }
    else { msg.textContent = "Llámanos al " + C.phone + " y te atendemos."; }
  });

  /* Mockup del panel: el estado de un inmueble cambia solo */
  var cyc = $("[data-cycle]");
  if (cyc && !reduce) {
    var states = [["Disponible", "st--ok"], ["Reservado", "st--res"], ["Vendido", "st--sold"]], k = 0;
    var mockObs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !cyc._t) {
          cyc._t = setInterval(function () {
            k = (k + 1) % states.length;
            cyc.classList.remove("st--ok", "st--res", "st--sold", "is-flip"); void cyc.offsetWidth;
            cyc.classList.add(states[k][1], "is-flip"); cyc.textContent = states[k][0];
          }, 2400);
        } else if (!e.isIntersecting && cyc._t) { clearInterval(cyc._t); cyc._t = null; }
      });
    });
    mockObs.observe(cyc);
  }
})();
