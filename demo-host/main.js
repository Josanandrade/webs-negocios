/* Carmen Soto · Peluquería & Estilismo — demo estática */
(function () {
  "use strict";

  // Datos de contacto. El teléfono no se ha podido confirmar en fuentes públicas:
  // rellenar PHONE (solo dígitos, sin prefijo) antes de enseñar la demo.
  // Mientras esté vacío, WhatsApp abre el selector de contactos con el mensaje listo
  // y los botones de llamada se ocultan.
  var CONFIG = {
    PHONE: "",
    NAME: "Carmen Soto Peluquería & Estilismo"
  };

  document.documentElement.classList.remove("no-js");
  document.documentElement.classList.add("js");

  function waLink(text) {
    var base = CONFIG.PHONE ? "https://wa.me/34" + CONFIG.PHONE : "https://wa.me/";
    return base + "?text=" + encodeURIComponent(text);
  }
  function prettyPhone(p) {
    return p.replace(/^(\d{3})(\d{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4");
  }

  var GREETING = "Hola, Carmen. Me gustaría pedir cita en el salón.";

  // ---- Enlaces de WhatsApp y llamada ----
  document.querySelectorAll("[data-wa-direct]").forEach(function (a) {
    a.href = waLink(GREETING);
    a.target = "_blank";
    a.rel = "noopener";
  });
  document.querySelectorAll("[data-call]").forEach(function (a) {
    if (CONFIG.PHONE) {
      a.href = "tel:+34" + CONFIG.PHONE;
    } else {
      a.hidden = true;
    }
  });
  if (CONFIG.PHONE) {
    document.querySelectorAll("[data-phone-label]").forEach(function (el) {
      el.textContent = prettyPhone(CONFIG.PHONE);
    });
  }

  // ---- Temporada en la portada ----
  var m = new Date().getMonth();
  var season = m < 2 || m === 11 ? "Invierno" : m < 5 ? "Primavera" : m < 8 ? "Verano" : "Otoño";
  document.querySelectorAll("[data-season]").forEach(function (el) { el.textContent = season + " " + new Date().getFullYear(); });
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // ---- Menú móvil ----
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "Abrir menú" : "Cerrar menú");
      menu.classList.toggle("is-open", !open);
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menú");
        menu.classList.remove("is-open");
      }
    });
  }

  // ---- Grupos de chips (selección única) ----
  var picks = {};
  document.querySelectorAll(".chips[data-group]").forEach(function (group) {
    var name = group.getAttribute("data-group");
    group.querySelectorAll(".chip").forEach(function (chip) {
      chip.setAttribute("aria-pressed", "false");
      chip.addEventListener("click", function () {
        group.querySelectorAll(".chip").forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
        chip.setAttribute("aria-pressed", "true");
        picks[name] = chip.getAttribute("data-value");
        if (name !== "slot") updateFinder();
      });
    });
  });

  // ---- Test de estilo ----
  var finderText = document.querySelector("[data-finder-text]");
  var finderCta = document.querySelector("[data-finder-cta]");
  var serviceSelect = document.querySelector("select[name='servicio']");
  var noteField = document.querySelector("textarea[name='nota']");

  function recommend(goal, hair, time) {
    if (goal === "un peinado para un evento") {
      return { title: "Peinado o recogido", service: "Peinado o recogido",
        text: hair === "rizado" ? "Un recogido que aproveche tu rizo natural, con prueba previa si es para una boda." :
          "Ondas o recogido según el vestido. Trae una foto del look y lo vemos juntas." };
    }
    if (goal === "un cambio de look") {
      return { title: time === "5 minutos" ? "Corte con forma y color de bajo mantenimiento" : "Corte y color con estilismo",
        service: "Asesoría de estilismo",
        text: "Empezamos con una asesoría: vemos tu rostro, tu textura " + (hair ? "(" + hair + ") " : "") + "y te proponemos un cambio que encaje con tus " + (time || "mañanas") + "." };
    }
    return { title: hair === "rizado" || hair === "ondulado" ? "Saneado de puntas y tratamiento de hidratación" : "Saneado de puntas y brillo",
      service: "Tratamiento capilar",
      text: "Mantener también es cuidar: cortamos lo justo y recuperamos el brillo para que el pelo luzca sano." };
  }

  function updateFinder() {
    if (!finderText || !picks.goal || !picks.hair || !picks.time) return;
    var r = recommend(picks.goal, picks.hair, picks.time);
    finderText.innerHTML = "<strong></strong>";
    finderText.firstChild.textContent = r.title;
    finderText.appendChild(document.createTextNode(r.text));
    if (finderCta) {
      finderCta.hidden = false;
      finderCta.onclick = function () {
        if (serviceSelect) serviceSelect.value = r.service;
        if (noteField && !noteField.value) noteField.value = "Busco " + picks.goal + ". Tengo el pelo " + picks.hair + " y por la mañana tengo " + picks.time + ".";
      };
    }
  }

  // ---- Servicios del índice preseleccionan el formulario ----
  document.querySelectorAll("[data-service]").forEach(function (a) {
    a.addEventListener("click", function () {
      if (serviceSelect) serviceSelect.value = a.getAttribute("data-service");
    });
  });

  // ---- Próximos días (martes a sábado, horario por confirmar) ----
  var daysWrap = document.querySelector("[data-days]");
  var DAY = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  var DAY_LONG = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var MONTH = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  if (daysWrap) {
    var d = new Date();
    var count = 0;
    while (count < 6) {
      d.setDate(d.getDate() + 1);
      var wd = d.getDay();
      if (wd === 0) continue; // domingo cerrado (supuesto)
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "day";
      btn.setAttribute("aria-pressed", "false");
      btn.dataset.value = DAY_LONG[wd] + " " + d.getDate() + " de " + MONTH[d.getMonth()];
      btn.innerHTML = "<small>" + DAY[wd] + "</small><b>" + d.getDate() + "</b>";
      btn.setAttribute("aria-label", btn.dataset.value);
      daysWrap.appendChild(btn);
      count++;
    }
    daysWrap.addEventListener("click", function (e) {
      var b = e.target.closest(".day");
      if (!b) return;
      daysWrap.querySelectorAll(".day").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", "true");
      picks.day = b.dataset.value;
    });
  }

  // ---- Formulario → WhatsApp ----
  var form = document.getElementById("ticket");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.nombre.value.trim();
      var lines = ["Hola, Carmen" + (name ? ", soy " + name : "") + ". Me gustaría pedir cita."];
      lines.push("Servicio: " + form.servicio.value);
      if (picks.day || picks.slot) lines.push("Cuándo: " + [picks.day, picks.slot].filter(Boolean).join(", "));
      var note = form.nota.value.trim();
      if (note) lines.push("Nota: " + note);
      lines.push("¡Gracias!");
      window.open(waLink(lines.join("\n")), "_blank", "noopener");
    });
  }

  // ---- Aparición suave ----
  var targets = document.querySelectorAll(".section__head, .toc__item, .studio__text, .finder, .look, .salon__plate, .salon__letter, .quote, .ticket, .where__map, .ccard");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(function (t) { t.classList.add("reveal"); io.observe(t); });
  }
})();
