(function () {
  var PHONE = "34666909745";

  function waUrl(text) {
    return "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(text);
  }

  // Enlaces de WhatsApp con mensaje prellenado
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.href = waUrl(a.getAttribute("data-wa"));
    a.target = "_blank";
    a.rel = "noopener";
  });

  // Menú móvil
  var burger = document.querySelector(".burger");
  var menu = document.getElementById("menu");
  burger.addEventListener("click", function () {
    var open = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!open));
    menu.classList.toggle("open", !open);
  });
  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      burger.setAttribute("aria-expanded", "false");
      menu.classList.remove("open");
    });
  });

  // Abierto ahora (L-V 10-20, S 10-14)
  var now = new Date();
  var d = now.getDay();
  var h = now.getHours() + now.getMinutes() / 60;
  var open = (d >= 1 && d <= 5 && h >= 10 && h < 20) || (d === 6 && h >= 10 && h < 14);
  var dot = document.getElementById("open-dot");
  var openText = document.getElementById("open-text");
  if (open) {
    dot.classList.add("open");
    openText.textContent = "Abierto ahora · Av. Colón 29, Gines";
  } else {
    openText.textContent = "Ahora cerrado · escríbenos y te contestamos";
  }
  var today = document.querySelector('.hours tr[data-d="' + d + '"]');
  if (today) today.classList.add("today");

  // Ticket de turno
  var svc = "Corte y peinado";
  var when = "por la mañana";
  var send = document.getElementById("ticket-send");
  var ticketNo = document.getElementById("ticket-no");
  function updateTicket() {
    send.href = waUrl("Hola R&C, quería pedir cita para " + svc.toLowerCase() + " " + when + ". ¿Qué hueco tenéis?");
  }
  function pick(group, attr, setter) {
    group.forEach(function (b) {
      b.addEventListener("click", function () {
        group.forEach(function (x) { x.classList.remove("is-on"); });
        b.classList.add("is-on");
        setter(b.getAttribute(attr));
        ticketNo.textContent = "Nº 0" + (20 + Math.floor(Math.random() * 79));
        updateTicket();
      });
    });
  }
  pick([].slice.call(document.querySelectorAll(".opt[data-svc]")), "data-svc", function (v) { svc = v; });
  pick([].slice.call(document.querySelectorAll(".opt[data-when]")), "data-when", function (v) { when = v; });
  send.target = "_blank";
  send.rel = "noopener";
  updateTicket();

  // Pestañas de servicios
  var tabs = [].slice.call(document.querySelectorAll(".tab"));
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      tabs.forEach(function (x) {
        x.classList.toggle("is-on", x === t);
        x.setAttribute("aria-selected", String(x === t));
      });
      document.querySelectorAll("[data-panel]").forEach(function (p) {
        p.hidden = p.getAttribute("data-panel") !== t.getAttribute("data-tab");
      });
    });
  });

  // Selector de tipo de pelo
  var HAIR = {
    liso: {
      tag: "Pelo liso",
      title: "Luz y movimiento sin perder caída",
      text: "Un buen corte con capas suaves y unas mechas o un balayage dan vida al pelo liso sin que pierda su caída natural.",
      list: ["Corte con capas", "Mechas o balayage", "Peinado de acabado"]
    },
    ondulado: {
      tag: "Pelo ondulado",
      title: "Ondas definidas, no encrespadas",
      text: "Cortamos respetando la onda y te recomendamos cómo secarla. Si prefieres llevarlo liso, valoramos un alisado o keratina.",
      list: ["Corte para ondas", "Keratina", "Color con luz"]
    },
    rizado: {
      tag: "Pelo rizado",
      title: "Tus rizos, como tienen que ser",
      text: "Corte pensado para rizo, hidratación y pautas para casa. Nada de alisarlos a la fuerza si no quieres.",
      list: ["Corte para rizos", "Tratamiento hidratante", "Pautas de cuidado"]
    },
    danado: {
      tag: "Pelo castigado",
      title: "Primero recuperar, luego decidir",
      text: "Si el pelo viene de muchos tintes o planchas, empezamos por sanearlo. Después vemos color, keratina o extensiones para ganar largo.",
      list: ["Saneado", "Keratina", "Extensiones"]
    }
  };
  var htBtns = [].slice.call(document.querySelectorAll(".ht-btn"));
  var htCta = document.getElementById("ht-cta");
  function setHair(key) {
    var o = HAIR[key];
    document.getElementById("ht-tag").textContent = o.tag;
    document.getElementById("ht-title").textContent = o.title;
    document.getElementById("ht-text").textContent = o.text;
    document.getElementById("ht-list").innerHTML = o.list.map(function (x) { return "<li>" + x + "</li>"; }).join("");
    htCta.href = waUrl("Hola R&C, tengo el " + o.tag.toLowerCase() + " y quería que me aconsejarais. ¿Cuándo puedo pasarme?");
    htCta.target = "_blank";
    htCta.rel = "noopener";
  }
  htBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      htBtns.forEach(function (x) {
        x.classList.toggle("is-on", x === b);
        x.setAttribute("aria-checked", String(x === b));
      });
      setHair(b.getAttribute("data-type"));
    });
  });
  setHair("liso");

  // Aparición al hacer scroll
  var els = document.querySelectorAll(".sec-head, .svc-grid, .ht-wrap, .gal, .about, .rev-row, .where");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
  }

  document.getElementById("year").textContent = now.getFullYear();
})();
