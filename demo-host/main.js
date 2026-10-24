(function () {
  var PHONE = "34607658153";

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
    if (open) return closeMenu();
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Cerrar menú");
    menu.classList.add("open");
  });
  menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  // Selector de medida
  function fill(sel, from, to, step, def) {
    for (var v = from; v <= to; v += step) {
      var o = document.createElement("option");
      o.value = o.textContent = String(v);
      if (v === def) o.selected = true;
      sel.appendChild(o);
    }
  }
  var ancho = document.getElementById("f-ancho");
  var perfil = document.getElementById("f-perfil");
  var llanta = document.getElementById("f-llanta");
  var coche = document.getElementById("f-coche");
  var send = document.getElementById("picker-send");
  var preview = document.getElementById("preview-text");
  fill(ancho, 135, 325, 10, 205);
  fill(perfil, 25, 80, 5, 55);
  fill(llanta, 13, 22, 1, 16);

  function pickerMsg() {
    var qty = document.querySelector('input[name="qty"]:checked').value;
    var medida = ancho.value + "/" + perfil.value + " R" + llanta.value;
    var car = coche.value.trim();
    var n = qty === "1" ? "un neumático" : qty + " neumáticos";
    return "Hola, quería información para " + n + " " + medida + (car ? " (" + car + ")" : "") + ". ¿Qué opciones tenéis?";
  }
  function updatePicker() {
    var msg = pickerMsg();
    preview.textContent = msg;
    setWa(send, msg);
  }
  document.getElementById("picker").addEventListener("input", updatePicker);
  document.getElementById("picker").addEventListener("change", updatePicker);
  document.getElementById("picker").addEventListener("submit", function (e) { e.preventDefault(); });
  updatePicker();

  // Síntomas
  var syms = document.querySelectorAll(".sym");
  var card = document.getElementById("sym-card");
  var answer = document.getElementById("sym-a");
  var symSend = document.getElementById("sym-send");
  syms.forEach(function (b) {
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () {
      syms.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", "true");
      card.classList.add("on");
      card.querySelector(".sym-q").textContent = "Solemos revisar";
      answer.textContent = b.getAttribute("data-svc");
      setWa(symSend, "Hola, a mi coche le pasa que " + b.getAttribute("data-sym") + ". ¿Cuándo podría pasar para que lo miréis?");
      if (window.matchMedia("(max-width: 820px)").matches) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  });
})();
