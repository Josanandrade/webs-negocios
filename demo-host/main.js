(function () {
  var PHONE = "34623480455";

  function waUrl(text) {
    return "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(text);
  }

  function setWa(a, text) {
    a.href = waUrl(text);
    a.target = "_blank";
    a.rel = "noopener";
  }

  // Enlaces de WhatsApp con mensaje prellenado
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    setWa(a, a.getAttribute("data-wa"));
  });

  // Menú móvil
  var burger = document.querySelector(".burger");
  var menu = document.getElementById("menu");
  function closeMenu() {
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Abrir menú");
    menu.classList.remove("open");
  }
  burger.addEventListener("click", function () {
    var open = burger.getAttribute("aria-expanded") === "true";
    if (open) { closeMenu(); return; }
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Cerrar menú");
    menu.classList.add("open");
  });
  menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });

  // Abierto ahora (hora de Madrid)
  var SHOPS = {
    mec: { el: "live-mec", hours: { 1: [7, 16], 2: [7, 16], 3: [7, 16], 4: [7, 16], 5: [7, 15] } },
    cyp: { el: "live-cyp", hours: { 1: [7, 15], 2: [7, 15], 3: [7, 15], 4: [7, 15], 5: [7, 15] } }
  };
  function madridNow() {
    try {
      var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
      var map = {};
      parts.forEach(function (p) { map[p.type] = p.value; });
      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { d: days[map.weekday], h: (parseInt(map.hour, 10) % 24) + parseInt(map.minute, 10) / 60 };
    } catch (e) {
      var n = new Date();
      return { d: n.getDay(), h: n.getHours() + n.getMinutes() / 60 };
    }
  }
  var now = madridNow();
  Object.keys(SHOPS).forEach(function (k) {
    var s = SHOPS[k];
    var el = document.getElementById(s.el);
    var span = s.hours[now.d];
    var open = !!span && now.h >= span[0] && now.h < span[1];
    el.classList.toggle("is-open", open);
    el.textContent = open ? "Abierto ahora" : "Cerrado ahora · escríbenos";
  });

  // ¿Qué le pasa a tu coche?
  var MEC = { shop: "mec", name: "Mecánica · Umbrete", place: "taller de mecánica de Umbrete" };
  var CYP = { shop: "cyp", name: "Chapa y pintura · Espartinas", place: "taller de chapa y pintura de Espartinas" };
  var PROBLEMS = {
    ruido: { t: MEC, what: "hace un ruido raro", tip: "Cuéntanos cuándo suena (al frenar, al girar, en frío…) y te damos cita." },
    testigo: { t: MEC, what: "se le ha encendido un testigo", tip: "Si puedes, manda una foto del cuadro con el testigo encendido." },
    revision: { t: MEC, what: "le toca revisión o cambio de aceite", tip: "Dinos el modelo y los kilómetros y te buscamos hueco." },
    frenos: { t: MEC, what: "tiene algo raro en los frenos", tip: "Si notas ruido o vibración al frenar, mejor no esperar." },
    ruedas: { t: MEC, what: "necesita neumáticos o alineación", tip: "Dinos la medida que viene en el lateral de la rueda." },
    aire: { t: MEC, what: "el aire acondicionado no enfría", tip: "Te damos cita para revisar el aire." },
    golpe: { t: CYP, what: "tiene un golpe o una abolladura", tip: "Manda un par de fotos del golpe y te decimos qué necesita." },
    pintura: { t: CYP, what: "tiene arañazos o daños en la pintura", tip: "Con unas fotos de cerca y de lejos nos hacemos una idea." },
    accidente: { t: CYP, what: "ha tenido un accidente", tip: "Escríbenos con fotos y te contamos cómo lo hacemos." }
  };
  var chips = document.querySelectorAll(".chip");
  var card = document.getElementById("tri-card");
  var triBtn = document.getElementById("tri-btn");
  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      chips.forEach(function (x) { x.setAttribute("aria-checked", String(x === c)); });
      var p = PROBLEMS[c.getAttribute("data-k")];
      card.setAttribute("data-shop", p.t.shop);
      document.getElementById("tri-label").textContent = "Tu coche va al";
      document.getElementById("tri-shop").textContent = p.t.name;
      document.getElementById("tri-tip").textContent = p.tip;
      document.getElementById("tri-btn-text").textContent = p.t.shop === "cyp" ? "Enviar fotos por WhatsApp" : "Pedir cita por WhatsApp";
      setWa(triBtn, "Hola, he visto vuestra web. Mi coche " + p.what + ", ¿me podéis ayudar en el " + p.t.place + "?");
    });
  });

  // Antes / después
  var range = document.getElementById("ba-range");
  var before = document.getElementById("ba-before");
  var handle = document.getElementById("ba-handle");
  function setBa(v) {
    before.style.clipPath = "inset(0 " + (100 - v) + "% 0 0)";
    handle.style.left = v + "%";
  }
  range.addEventListener("input", function () { setBa(range.value); });
  setBa(range.value);

  // Botón flotante con selector de taller
  var fab = document.getElementById("fab");
  var fabMenu = document.getElementById("fab-menu");
  function setFab(open) {
    fab.setAttribute("aria-expanded", String(open));
    fabMenu.hidden = !open;
  }
  fab.addEventListener("click", function (e) {
    e.stopPropagation();
    setFab(fab.getAttribute("aria-expanded") !== "true");
  });
  fabMenu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setFab(false); }); });
  document.addEventListener("click", function (e) {
    if (!document.getElementById("fab-wrap").contains(e.target)) setFab(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { setFab(false); closeMenu(); }
  });

  // Aparición al hacer scroll
  var els = document.querySelectorAll(".sec-head, .shop-head, .spec, .info, .ba, .cyp-grid, .photo-cta, .scores, .quotes, .where-grid");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
