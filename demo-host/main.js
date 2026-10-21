(function () {
  var PHONE = "34605386295";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function waUrl(text) {
    return "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(text);
  }

  // Enlaces de WhatsApp con mensaje prellenado
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.href = waUrl(a.getAttribute("data-wa"));
    a.target = "_blank";
    a.rel = "noopener";
  });

  // Entrada del hero
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { root.classList.add("is-ready"); });
  });

  // Navegación: borde al hacer scroll y barra móvil
  var nav = document.querySelector(".nav");
  var mbar = document.getElementById("mbar");
  var quoteSec = document.getElementById("presupuesto");
  var quoteVisible = false;
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle("scrolled", y > 8);
    mbar.classList.toggle("show", y > 480 && !quoteVisible);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      quoteVisible = entries[0].isIntersecting;
      onScroll();
    }, { threshold: 0.15 }).observe(quoteSec);
  }

  // Menú móvil
  var burger = document.querySelector(".burger");
  var menu = document.getElementById("menu");
  function closeMenu() {
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Abrir menú");
    menu.classList.remove("open");
  }
  burger.addEventListener("click", function () {
    if (burger.getAttribute("aria-expanded") === "true") { closeMenu(); return; }
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Cerrar menú");
    menu.classList.add("open");
  });
  menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  document.addEventListener("click", function (e) {
    if (menu.classList.contains("open") && !menu.contains(e.target) && !burger.contains(e.target)) closeMenu();
  });

  // Revelado al hacer scroll, con escalonado por grupo
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (e) { return e.isIntersecting; });
      batch.forEach(function (e, i) {
        e.target.style.setProperty("--d", Math.min(i * 60, 300) + "ms");
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // Elementos que animan al entrar
  ["layers", "map"].forEach(function (cls) {
    var el = document.querySelector("." + cls);
    if (!el) return;
    if (!("IntersectionObserver" in window) || reduce) { el.classList.add("in"); return; }
    var o = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { el.classList.add("in"); o.disconnect(); }
    }, { threshold: 0.25 });
    o.observe(el);
  });

  // ----- Presupuesto: preselección del tipo -----
  var form = document.getElementById("qform");
  var seg = document.getElementById("seg-type");
  function preselect(type) {
    var input = form.querySelector('input[name="tipo"][value="' + type + '"]');
    if (!input) return;
    input.checked = true;
    seg.classList.remove("invalid");
    seg.classList.remove("pulse-in");
    void seg.offsetWidth;
    seg.classList.add("pulse-in");
  }
  document.querySelectorAll(".qchip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      document.querySelectorAll(".qchip").forEach(function (c) { c.classList.toggle("is-on", c === chip); });
      preselect(chip.getAttribute("data-type"));
      setTimeout(function () {
        quoteSec.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }, reduce ? 0 : 160);
    });
  });
  document.querySelectorAll("[data-prefill]").forEach(function (a) {
    a.addEventListener("click", function () { preselect(a.getAttribute("data-prefill")); });
  });

  // ----- Tabs cocina / baño -----
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  var pill = document.querySelector(".tab-pill");
  function placePill(tab) {
    pill.style.width = tab.offsetWidth + "px";
    pill.style.transform = "translateX(" + (tab.offsetLeft - 5) + "px)";
  }
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle("is-on", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute("aria-controls"));
      panel.hidden = !on;
      panel.classList.toggle("enter", on);
    });
    placePill(tab);
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectTab(t); });
    t.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        var next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
        next.focus();
        selectTab(next);
      }
    });
  });
  placePill(tabs[0]);
  window.addEventListener("resize", function () { placePill(document.querySelector(".tab.is-on")); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placePill(document.querySelector(".tab.is-on")); });

  // ----- Antes / después -----
  var ba = document.getElementById("ba");
  var range = ba.querySelector(".ba-range");
  var useBefore = document.getElementById("ba-before-use");
  var useAfter = document.getElementById("ba-after-use");
  function setPos(v) { ba.style.setProperty("--pos", v + "%"); }
  range.addEventListener("input", function () { setPos(range.value); });
  range.addEventListener("pointerdown", function () { ba.classList.add("dragging"); });
  window.addEventListener("pointerup", function () { ba.classList.remove("dragging"); });

  // Pista inicial: el control se desliza una vez al entrar en pantalla
  if ("IntersectionObserver" in window && !reduce) {
    var hinted = false;
    new IntersectionObserver(function (en, obs) {
      if (!en[0].isIntersecting || hinted) return;
      hinted = true; obs.disconnect();
      var start = performance.now();
      var dur = 1400;
      (function tick(now) {
        var t = Math.min((now - start) / dur, 1);
        // ida y vuelta suave: 50 → 32 → 66 → 50
        var v = 50 + Math.sin(t * Math.PI * 2) * -18 * (1 - t * 0.25);
        if (t >= 1) v = 50;
        setPos(v); range.value = v;
        if (t < 1) requestAnimationFrame(tick);
      })(start);
    }, { threshold: 0.6 }).observe(ba);
  }

  document.querySelectorAll(".ba-opt").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".ba-opt").forEach(function (o) { o.classList.toggle("is-on", o === b); });
      var k = b.getAttribute("data-ba");
      useBefore.setAttribute("href", "#" + k + "-old");
      useAfter.setAttribute("href", "#" + k + "-new");
      ba.classList.remove("swap"); void ba.offsetWidth; ba.classList.add("swap");
    });
  });

  // ----- Portfolio: filtros -----
  var items = Array.prototype.slice.call(document.querySelectorAll(".pf"));
  document.querySelectorAll(".filter").forEach(function (f) {
    f.addEventListener("click", function () {
      document.querySelectorAll(".filter").forEach(function (o) { o.classList.toggle("is-on", o === f); });
      var cat = f.getAttribute("data-f");
      items.forEach(function (it) {
        var show = cat === "all" || it.getAttribute("data-cat") === cat;
        if (show) {
          it.classList.remove("gone");
          requestAnimationFrame(function () { it.classList.remove("out"); });
        } else {
          it.classList.add("out");
          setTimeout(function () { if (it.classList.contains("out")) it.classList.add("gone"); }, reduce ? 0 : 280);
        }
      });
    });
  });

  // ----- Proceso: línea de progreso ligada al scroll -----
  var steps = document.getElementById("steps");
  var line = steps.querySelector(".steps-line span");
  var stepEls = steps.querySelectorAll(".step");
  var ticking = false;
  function updateSteps() {
    ticking = false;
    var r = steps.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh * 0.75 - r.top) / (r.height || 1);
    p = Math.max(0, Math.min(1, p));
    line.style.setProperty("--p", p.toFixed(3));
    stepEls.forEach(function (s, i) { s.classList.toggle("lit", p >= i / (stepEls.length - 1) - 0.02); });
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateSteps); }
  }, { passive: true });
  window.addEventListener("resize", updateSteps);
  updateSteps();

  // ----- FAQ: apertura animada -----
  document.querySelectorAll(".faq details").forEach(function (d) {
    var s = d.querySelector("summary");
    s.addEventListener("click", function (e) {
      e.preventDefault();
      if (d.open) {
        d.classList.remove("open-anim");
        setTimeout(function () { d.open = false; }, reduce ? 0 : 300);
      } else {
        d.open = true;
        requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add("open-anim"); }); });
      }
    });
  });

  // ----- Consulta de zona -----
  document.getElementById("zone-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var input = document.getElementById("zone-input");
    var v = input.value.trim();
    if (!v) { input.classList.add("invalid"); input.focus(); return; }
    input.classList.remove("invalid");
    window.open(waUrl("Hola, tengo una obra en " + v + ". ¿Trabajáis en esa zona?"), "_blank", "noopener");
  });

  // ----- Formulario de presupuesto -----
  var err = document.getElementById("q-error");
  var done = document.getElementById("q-done");
  var waBtn = document.getElementById("q-wa");

  form.querySelectorAll("input, select, textarea").forEach(function (el) {
    el.addEventListener("input", function () {
      el.classList.remove("invalid");
      if (el.name === "tipo") seg.classList.remove("invalid");
      if (el.name === "ok") el.closest(".check").classList.remove("invalid");
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = new FormData(form);
    var missing = [];
    var first = null;

    if (!data.get("tipo")) { seg.classList.add("invalid"); missing.push("tipo de reforma"); first = first || seg.querySelector("input"); }
    [["zona", "municipio"], ["nombre", "nombre"]].forEach(function (pair) {
      var el = form.elements[pair[0]];
      if (!el.value.trim()) { el.classList.add("invalid"); missing.push(pair[1]); first = first || el; }
    });
    var tel = form.elements.tel;
    var digits = tel.value.replace(/\D/g, "");
    if (digits.length < 9) { tel.classList.add("invalid"); missing.push("teléfono válido"); first = first || tel; }
    var ok = form.elements.ok;
    if (!ok.checked) { ok.closest(".check").classList.add("invalid"); missing.push("aceptar el uso de datos"); first = first || ok; }

    if (missing.length) {
      err.textContent = "Falta: " + missing.join(", ") + ".";
      err.hidden = false;
      if (first) first.focus({ preventScroll: false });
      return;
    }
    err.hidden = true;

    var lines = [
      "Hola, quiero pedir presupuesto (desde la web de Reformas Rivera).",
      "",
      "• Tipo: " + data.get("tipo")
    ];
    if (data.get("vivienda")) lines.push("• Vivienda: " + data.get("vivienda"));
    if (data.get("m2")) lines.push("• Superficie aprox.: " + data.get("m2") + " m²");
    lines.push("• Municipio: " + data.get("zona").trim());
    if (data.get("cuando")) lines.push("• Plazo: " + data.get("cuando"));
    if (data.get("msg").trim()) lines.push("", data.get("msg").trim());
    lines.push("", "Nombre: " + data.get("nombre").trim(), "Teléfono: " + tel.value.trim());

    var url = waUrl(lines.join("\n"));
    waBtn.href = url;
    done.hidden = false;
    done.focus();
    window.open(url, "_blank", "noopener");
  });

  document.getElementById("q-reset").addEventListener("click", function () {
    done.hidden = true;
    form.elements.nombre.focus();
  });
})();
