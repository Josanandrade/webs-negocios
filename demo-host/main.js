(function () {
  var PHONE = "34626685358";

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
    burger.setAttribute("aria-label", open ? "Abrir menú" : "Cerrar menú");
    menu.classList.toggle("open", !open);
  });
  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Abrir menú");
      menu.classList.remove("open");
    });
  });

  // Parte de taller: compone el mensaje de WhatsApp
  var veh = "coche";
  var when = "Si puede ser, lo antes posible.";
  var modelo = document.getElementById("modelo");
  var text = document.getElementById("parte-text");
  var send = document.getElementById("parte-send");
  var no = document.getElementById("parte-no");
  var checks = [].slice.call(document.querySelectorAll(".chk"));

  function list(items) {
    if (items.length < 2) return items.join("");
    return items.slice(0, -1).join(", ") + " y " + items[items.length - 1];
  }

  function compose() {
    var issues = checks.filter(function (c) { return c.classList.contains("is-on"); })
      .map(function (c) { return c.getAttribute("data-issue"); });
    var m = modelo.value.trim();
    var who = (veh === "furgoneta" ? "una furgoneta" : "un coche") + (m ? " (" + m + ")" : "");
    var msg = "Hola, he visto vuestra web. Tengo " + who;
    msg += issues.length ? ": " + list(issues) + "." : " y quería que le echarais un vistazo.";
    msg += " " + when + " ¿Cuándo podría llevarlo?";
    text.textContent = msg;
    send.href = waUrl(msg);
  }

  function bump() {
    no.textContent = "Nº " + String(1 + Math.floor(Math.random() * 9998)).padStart(4, "0");
  }

  function radio(selector, attr, setter) {
    var group = [].slice.call(document.querySelectorAll(selector));
    group.forEach(function (b) {
      b.addEventListener("click", function () {
        group.forEach(function (x) {
          x.classList.toggle("is-on", x === b);
          x.setAttribute("aria-pressed", String(x === b));
        });
        setter(b.getAttribute(attr));
        compose();
      });
    });
  }
  radio(".opt[data-veh]", "data-veh", function (v) { veh = v; });
  radio(".opt[data-when]", "data-when", function (v) { when = v; });

  checks.forEach(function (c) {
    c.addEventListener("click", function () {
      var on = !c.classList.contains("is-on");
      c.classList.toggle("is-on", on);
      c.setAttribute("aria-pressed", String(on));
      bump();
      compose();
    });
  });
  modelo.addEventListener("input", compose);
  document.getElementById("parte-form").addEventListener("submit", function (e) { e.preventDefault(); });

  send.target = "_blank";
  send.rel = "noopener";
  bump();
  compose();
})();
