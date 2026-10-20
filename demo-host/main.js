(function () {
  var PHONE = "34647424911";

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
  function setMenu(open) {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    menu.classList.toggle("open", open);
  }
  burger.addEventListener("click", function () {
    setMenu(burger.getAttribute("aria-expanded") !== "true");
  });
  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });

  // Abierto ahora (L-V 10-14 y 17:30-20:30)
  var now = new Date();
  var d = now.getDay();
  var h = now.getHours() + now.getMinutes() / 60;
  var open = d >= 1 && d <= 5 && ((h >= 10 && h < 14) || (h >= 17.5 && h < 20.5));
  var dot = document.getElementById("open-dot");
  var openText = document.getElementById("open-text");
  if (open) {
    dot.classList.add("open");
    openText.textContent = "Abierto ahora · te esperamos en tienda";
  } else {
    openText.textContent = "Ahora cerrado · escríbenos y te contestamos";
  }
  var today = document.querySelector('.hours tr[data-d="' + d + '"]');
  if (today) today.classList.add("today");

  // Compositor de mensaje
  var state = { room: "el salón", scope: "renovarlo entero" };
  var fin = document.getElementById("fin");
  var noteText = document.getElementById("note-text");
  var send = document.getElementById("send");
  function compose() {
    var msg;
    if (state.scope === "ver ideas") {
      msg = "Hola, he visto vuestra web y me gustaría ver ideas para " + state.room + ".";
    } else if (state.scope === "una pieza concreta") {
      msg = "Hola, he visto vuestra web y busco una pieza concreta para " + state.room + ".";
    } else {
      msg = "Hola, he visto vuestra web y quiero renovar " + state.room + ".";
    }
    var SPECIAL = {
      electro: {
        "renovarlo entero": "quiero renovar los electrodomésticos de casa.",
        "una pieza concreta": "busco un electrodoméstico concreto.",
        "ver ideas": "quería ver qué electrodomésticos tenéis."
      },
      descanso: {
        "renovarlo entero": "quiero cambiar el colchón y la base.",
        "una pieza concreta": "busco un colchón o una almohada.",
        "ver ideas": "quería ver qué colchones tenéis."
      }
    };
    if (SPECIAL[state.room]) msg = "Hola, he visto vuestra web y " + SPECIAL[state.room][state.scope];
    if (fin.checked) msg += " También me interesa la financiación.";
    msg += " ¿Me podéis informar?";
    noteText.textContent = "“" + msg + "”";
    send.href = waUrl(msg);
  }
  document.querySelectorAll(".chips").forEach(function (group) {
    var key = group.getAttribute("data-group");
    var btns = [].slice.call(group.querySelectorAll(".chip"));
    btns.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.classList.contains("is-on")));
      b.addEventListener("click", function () {
        btns.forEach(function (x) {
          x.classList.toggle("is-on", x === b);
          x.setAttribute("aria-pressed", String(x === b));
        });
        state[key] = b.getAttribute("data-v");
        compose();
      });
    });
  });
  fin.addEventListener("change", compose);
  send.target = "_blank";
  send.rel = "noopener";
  compose();

  // Aparición al hacer scroll
  var els = document.querySelectorAll(".sec-head, .cat, .steps, .composer, .stores");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    els.forEach(function (el) { el.classList.add("reveal"); io.observe(el); });
  }

  document.getElementById("year").textContent = now.getFullYear();
})();
