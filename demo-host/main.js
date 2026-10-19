// Fon Peluqueros · demo
(function () {
  document.documentElement.classList.replace("no-js", "js");

  // Móvil público del salón (WhatsApp sin confirmar)
  var WA_NUMBER = "34651611780";
  var waUrl = function (text) { return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(text); };

  document.querySelectorAll("[data-wa]").forEach(function (el) {
    el.href = waUrl(el.getAttribute("data-wa"));
    el.target = "_blank";
    el.rel = "noopener";
  });

  // Menú móvil
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("menu");
  toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.setAttribute("aria-label", open ? "Abrir menú" : "Cerrar menú");
    menu.hidden = open;
  });
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) { toggle.setAttribute("aria-expanded", "false"); menu.hidden = true; }
  });

  // Nav con borde y botón flotante al hacer scroll
  var nav = document.querySelector(".nav");
  var fab = document.querySelector(".fab");
  var onScroll = function () {
    var y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 8);
    fab.classList.toggle("is-visible", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ¿Abierto ahora? (hora de Madrid). L–V 10–14 y 17–20.
  var SLOTS = [[600, 840], [1020, 1200]];
  var madrid = function () {
    try {
      var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      var get = function (t) { return parts.find(function (p) { return p.type === t; }).value; };
      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { day: days[get("weekday")], min: (+get("hour") % 24) * 60 + +get("minute") };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  };
  var fmt = function (m) { return Math.floor(m / 60) + ":" + String(m % 60).padStart(2, "0"); };
  var updateToday = function () {
    var now = madrid();
    var dot = document.querySelector("[data-open-dot]");
    var label = document.querySelector("[data-open-label]");
    var sub = document.querySelector("[data-open-sub]");
    document.querySelectorAll("[data-week] li").forEach(function (li) {
      li.classList.toggle("is-today", +li.getAttribute("data-day") === now.day);
    });
    var workday = now.day >= 1 && now.day <= 5;
    var current = workday && SLOTS.find(function (s) { return now.min >= s[0] && now.min < s[1]; });
    var next = workday && SLOTS.find(function (s) { return now.min < s[0]; });
    dot.className = "today__dot " + (current ? "is-open" : "is-closed");
    if (current) {
      label.textContent = "Abierto ahora";
      sub.textContent = "Hoy atendemos hasta las " + fmt(current[1]) + ". Escríbenos y te decimos si hay hueco.";
    } else if (next) {
      label.textContent = "Ahora cerrado";
      sub.textContent = "Hoy abrimos a las " + fmt(next[0]) + ". Puedes dejarnos tu mensaje ya.";
    } else {
      label.textContent = "Ahora cerrado";
      sub.textContent = "Déjanos tu mensaje por WhatsApp y te contestamos en cuanto abramos.";
    }
  };
  updateToday();
  setInterval(updateToday, 60000);

  // Filtros de galería
  var chips = document.querySelectorAll(".chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.getAttribute("data-filter");
      chips.forEach(function (c) { c.classList.toggle("is-active", c === chip); });
      document.querySelectorAll(".shot").forEach(function (s) {
        s.classList.toggle("is-hidden", f !== "all" && s.getAttribute("data-cat") !== f);
      });
    });
  });

  // Formulario de cita → mensaje de WhatsApp
  var form = document.querySelector("[data-booking]");
  var preview = document.querySelector("[data-preview]");
  var buildMsg = function () {
    var data = new FormData(form);
    var name = (data.get("nombre") || "").trim();
    return "Hola" + (name ? ", soy " + name : "") + ". Me gustaría pedir cita en Fon Peluqueros para " +
      data.get("servicio") + ", " + data.get("franja") + ". ¿Qué hueco tenéis?";
  };
  var refresh = function () { preview.textContent = "«" + buildMsg() + "»"; };
  form.addEventListener("input", refresh);
  form.addEventListener("change", refresh);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    window.open(waUrl(buildMsg()), "_blank", "noopener");
  });
  refresh();

  // Aparición al hacer scroll
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-in"); });
  }

  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();
})();
