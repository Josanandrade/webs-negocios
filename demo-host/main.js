(function () {
  "use strict";
  document.documentElement.classList.replace("no-js", "js");

  // Móvil del directorio; WhatsApp sin confirmar (ver auditoría interna)
  var WA_NUMBER = "34744635882";
  function waLink(text) {
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text);
  }

  // Horario: [apertura, cierre] en minutos por día (0 = domingo)
  var HOURS = {
    0: null,
    1: null,
    2: [600, 1050],
    3: [600, 1050],
    4: [600, 1050],
    5: [600, 900],
    6: [600, 840]
  };

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Menú móvil
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Abrir menú" : "Cerrar menú");
      menu.hidden = open;
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menú");
        menu.hidden = true;
      }
    });
  }

  // Abierto ahora + día de hoy en la tabla (hora de Madrid)
  (function () {
    var now;
    try {
      now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
    } catch (e) {
      now = new Date();
    }
    var d = now.getDay();
    var m = now.getHours() * 60 + now.getMinutes();
    var row = document.querySelector('.hours tr[data-d="' + d + '"]');
    if (row) row.classList.add("is-today");
    var el = document.getElementById("openNow");
    if (!el) return;
    var h = HOURS[d];
    if (h && m >= h[0] && m < h[1]) {
      var close = h[1];
      el.textContent = "Abierto hasta las " + Math.floor(close / 60) + ":" + String(close % 60).padStart(2, "0");
    } else {
      el.textContent = "Cerrado ahora · cita por WhatsApp";
    }
  })();

  // Aparición al hacer scroll
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("is-in"); });
  }

  // Selector de zonas de láser
  var ZONES = {
    mujer: ["Facial", "Axilas", "Brazos", "Ingles", "Piernas", "Pecho/abdomen", "Espalda"],
    hombre: ["Facial", "Axilas", "Brazos", "Pecho/abdomen", "Espalda", "Piernas", "Ingles"]
  };
  var LABELS = { "Facial": "Rostro", "Pecho/abdomen": "Pecho y abdomen" };
  var chipsBox = document.getElementById("zoneChips");
  var summary = document.getElementById("zoneSummary");
  var zoneWa = document.getElementById("zoneWa");
  var pts = document.querySelectorAll(".body__pts circle");
  var set = "mujer";
  var selected = [];
  var prev = "Es mi primera vez";

  function label(z) { return LABELS[z] || z; }

  function renderChips() {
    chipsBox.innerHTML = "";
    ZONES[set].forEach(function (z) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.textContent = label(z);
      b.dataset.z = z;
      b.setAttribute("aria-pressed", selected.indexOf(z) > -1 ? "true" : "false");
      chipsBox.appendChild(b);
    });
  }

  function updateZones() {
    pts.forEach(function (p) {
      p.classList.toggle("is-on", selected.indexOf(p.dataset.z) > -1);
    });
    chipsBox.querySelectorAll(".chip").forEach(function (c) {
      c.setAttribute("aria-pressed", selected.indexOf(c.dataset.z) > -1 ? "true" : "false");
    });
    var names = selected.map(label).join(", ").toLowerCase();
    var who = set === "mujer" ? "mujer" : "hombre";
    if (!selected.length) {
      summary.textContent = "Elige al menos una zona.";
      zoneWa.href = waLink("Hola, me gustaría información sobre depilación láser en Centro Naturláser.");
      return;
    }
    summary.textContent = "Depilación láser (" + who + "): " + names + ". " + prev + ".";
    zoneWa.href = waLink(
      "Hola, me gustaría una valoración de depilación láser en Centro Naturláser.\n" +
      "Zonas (" + who + "): " + names + ".\n" + prev + ".\n¿Qué días tenéis disponibles?"
    );
  }

  if (chipsBox) {
    renderChips();
    updateZones();
    chipsBox.addEventListener("click", function (e) {
      var c = e.target.closest(".chip");
      if (!c) return;
      var z = c.dataset.z;
      var i = selected.indexOf(z);
      if (i > -1) selected.splice(i, 1); else selected.push(z);
      updateZones();
    });
    document.querySelectorAll(".zones__toggle button").forEach(function (b) {
      b.addEventListener("click", function () {
        set = b.dataset.set;
        document.querySelectorAll(".zones__toggle button").forEach(function (o) {
          o.setAttribute("aria-selected", String(o === b));
        });
        selected = selected.filter(function (z) { return ZONES[set].indexOf(z) > -1; });
        renderChips();
        updateZones();
      });
    });
    pts.forEach(function (p) {
      p.style.cursor = "pointer";
      p.addEventListener("click", function () {
        var z = p.dataset.z;
        var i = selected.indexOf(z);
        if (i > -1) selected.splice(i, 1); else selected.push(z);
        updateZones();
      });
    });
    document.querySelectorAll("#prevSeg button").forEach(function (b) {
      b.addEventListener("click", function () {
        prev = b.dataset.v;
        document.querySelectorAll("#prevSeg button").forEach(function (o) {
          o.setAttribute("aria-pressed", String(o === b));
        });
        updateZones();
      });
    });
  }

  // Pestañas facial / corporal / bienestar
  var tabs = document.querySelectorAll(".tabs__list [role=tab]");
  tabs.forEach(function (t, idx) {
    t.addEventListener("click", function () { activate(t); });
    t.addEventListener("keydown", function (e) {
      var n = null;
      if (e.key === "ArrowRight") n = tabs[(idx + 1) % tabs.length];
      if (e.key === "ArrowLeft") n = tabs[(idx - 1 + tabs.length) % tabs.length];
      if (n) { e.preventDefault(); activate(n); n.focus(); }
    });
  });
  function activate(t) {
    tabs.forEach(function (o) {
      var on = o === t;
      o.setAttribute("aria-selected", String(on));
      o.tabIndex = on ? 0 : -1;
      document.getElementById(o.getAttribute("aria-controls")).hidden = !on;
    });
  }
  if (tabs.length) activate(tabs[0]);

  // Mensaje genérico en los botones de WhatsApp
  var hello = waLink("Hola, me gustaría pedir cita en Centro Naturláser.");
  ["heroWa", "ctaWa", "fabWa"].forEach(function (id) {
    var a = document.getElementById(id);
    if (a) a.href = hello;
  });

  // Solicitud de cita → WhatsApp
  var form = document.getElementById("citaForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.nombre.value.trim();
      if (!name) {
        form.nombre.setAttribute("aria-invalid", "true");
        form.nombre.focus();
        return;
      }
      form.nombre.removeAttribute("aria-invalid");
      var msg = "Hola, soy " + name + ". Me gustaría pedir cita en Centro Naturláser.\n" +
        "Tratamiento: " + form.tratamiento.value + ".\n" +
        "Preferencia: " + form.franja.value + ".";
      var c = form.comentario.value.trim();
      if (c) msg += "\n" + c;
      window.open(waLink(msg), "_blank", "noopener");
    });
  }
})();
