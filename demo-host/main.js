(function () {
  "use strict";

  // Móvil público (Fresha / infopeluquerías). Sin confirmar que tenga WhatsApp.
  var WA_NUMBER = "34618745554";

  // Horario según la ficha de Fresha: [apertura, cierre] en minutos, null = cerrado. 0 = domingo.
  var HOURS = [null, [600, 1200], [600, 1080], null, [600, 1080], [600, 1200], [600, 840]];
  var DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  function waLink(text) {
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
  }

  // Menú móvil
  var burger = document.querySelector(".burger");
  var menu = document.getElementById("menu");
  if (burger && menu) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      burger.setAttribute("aria-label", open ? "Abrir menú" : "Cerrar menú");
      menu.hidden = open;
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        menu.hidden = true;
        burger.setAttribute("aria-expanded", "false");
        burger.setAttribute("aria-label", "Abrir menú");
      }
    });
  }

  // Tonos de inspiración: cambian la melena del espejo del hero
  var TONES = {
    miel: { a: "#5A3622", b: "#C98F4E", c: "#E2B477", name: "Castaño con mechas miel", svc: "Mechas y reflejos" },
    balayage: { a: "#3B2A20", b: "#E3C08A", c: "#F4DDB0", name: "Balayage rubio", svc: "Mechas balayage" },
    cobrizo: { a: "#7A2E14", b: "#D06A35", c: "#EC9A5E", name: "Cobrizo", svc: "Tinte" },
    chocolate: { a: "#2A1A14", b: "#5E3B2A", c: "#8A5A3E", name: "Chocolate", svc: "Tinte" },
    ceniza: { a: "#8C8172", b: "#E6DDCC", c: "#F5EFE2", name: "Rubio ceniza", svc: "Mechas balayage" }
  };
  var currentTone = null;
  var root = document.documentElement;
  var toneName = document.querySelector("[data-tone-name]");
  var swatches = document.querySelectorAll("[data-tone]");
  function setTone(key) {
    var t = TONES[key];
    if (!t) return;
    root.style.setProperty("--hair-a", t.a);
    root.style.setProperty("--hair-b", t.b);
    root.style.setProperty("--hair-c", t.c);
    if (toneName) toneName.textContent = t.name;
    swatches.forEach(function (b) {
      b.setAttribute("aria-checked", String(b.getAttribute("data-tone") === key));
    });
  }
  swatches.forEach(function (b) {
    b.addEventListener("click", function () {
      currentTone = b.getAttribute("data-tone");
      setTone(currentTone);
    });
  });
  var toneCta = document.querySelector("[data-tone-cta]");
  if (toneCta) {
    toneCta.addEventListener("click", function () {
      var key = currentTone || "miel";
      currentTone = key;
      var box = document.querySelector('[data-services] input[value="' + TONES[key].svc + '"]');
      if (box) box.checked = true;
      updatePreview();
    });
  }
  // Ciclo suave de tonos en el hero hasta que la clienta elija uno
  var order = Object.keys(TONES);
  var idx = 0;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    var cycle = setInterval(function () {
      if (currentTone) { clearInterval(cycle); return; }
      idx = (idx + 1) % order.length;
      setTone(order[idx]);
    }, 3600);
  }

  // Filtros de galería
  var filterBtns = document.querySelectorAll("[data-filter]");
  var shots = document.querySelectorAll(".shot");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) { b.classList.toggle("is-on", b === btn); });
      shots.forEach(function (s) {
        s.classList.toggle("is-hidden", f !== "todo" && s.getAttribute("data-cat") !== f);
      });
    });
  });

  // Horario: marca hoy y dice si está abierto
  var now = new Date();
  var today = now.getDay();
  var rows = document.querySelectorAll(".hours dl div");
  rows.forEach(function (row) {
    var dt = row.querySelector("dt");
    if (dt && dt.textContent.trim() === DAY_NAMES[today]) row.classList.add("is-today");
  });
  var nowEl = document.querySelector("[data-now]");
  if (nowEl) {
    var mins = now.getHours() * 60 + now.getMinutes();
    var h = HOURS[today];
    if (h && mins >= h[0] && mins < h[1]) {
      nowEl.textContent = "Ahora abierto · hoy hasta las " + Math.floor(h[1] / 60) + ":00";
    } else {
      var next = 1;
      while (next < 8 && !HOURS[(today + next) % 7]) next++;
      if (h && mins < h[0]) {
        nowEl.textContent = "Hoy abrimos a las 10:00";
      } else {
        nowEl.textContent = "Ahora cerrado · abrimos el " + DAY_NAMES[(today + next) % 7].toLowerCase() + " a las 10:00";
      }
    }
  }

  // Planificador de cita → WhatsApp
  var form = document.querySelector("[data-planner]");
  var preview = document.querySelector("[data-preview]");
  var afternoon = document.querySelector("[data-afternoon] input");

  function buildMessage() {
    var services = Array.prototype.map.call(
      form.querySelectorAll("[data-services] input:checked"),
      function (i) { return i.value.toLowerCase(); }
    );
    var day = (form.querySelector('input[name="dia"]:checked') || {}).value || "cualquier día";
    var slot = (form.querySelector('input[name="franja"]:checked') || {}).value || "";
    var name = form.nombre.value.trim();

    var msg = "Hola Toñi" + (name ? ", soy " + name : "") + ". ";
    msg += "Quería pedir cita para " + (services.length ? services.join(", ") : "arreglarme el pelo") + ".";
    if (currentTone && services.some(function (s) { return /tinte|mechas|balayage/.test(s); })) {
      msg += " Me ha gustado el tono " + TONES[currentTone].name.toLowerCase() + ".";
    }
    msg += "\n" + (day === "cualquier día" ? "Me viene bien cualquier día" : "Me vendría bien el " + day) + " " + slot + ".";
    msg += "\n¿Qué hueco tienes? Gracias.";
    return msg;
  }

  function updatePreview() {
    if (!form || !preview) return;
    var sat = form.querySelector('input[name="dia"][value="sábado"]');
    if (afternoon) {
      afternoon.disabled = !!(sat && sat.checked);
      afternoon.closest("label").classList.toggle("is-closed", afternoon.disabled);
      if (afternoon.disabled && afternoon.checked) {
        form.querySelector('input[name="franja"][value="por la mañana"]').checked = true;
      }
    }
    preview.textContent = buildMessage();
  }

  if (form) {
    form.addEventListener("change", updatePreview);
    form.addEventListener("input", updatePreview);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      window.open(waLink(buildMessage()), "_blank", "noopener");
    });
    updatePreview();
  }

  // Enlaces directos de WhatsApp (tarjeta de contacto y botón flotante)
  document.querySelectorAll("[data-wa-direct]").forEach(function (a) {
    a.setAttribute("href", waLink("Hola Toñi, quería pedir cita en la peluquería."));
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener");
  });

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = now.getFullYear();

  // Aparición al hacer scroll
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-in"); });
  }
})();
