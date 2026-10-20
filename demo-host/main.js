(function () {
  var PHONE = "34614266599";

  function waUrl(text) {
    return "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(text);
  }

  function bindWa(a) {
    a.href = waUrl(a.getAttribute("data-wa"));
    a.target = "_blank";
    a.rel = "noopener";
  }

  // Enlaces de WhatsApp con mensaje prellenado
  document.querySelectorAll("[data-wa]").forEach(bindWa);

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

  // Selector de objetivo
  var goals = {
    forma: {
      title: "Ponerte en forma, sin agobios",
      text: "Combina máquinas guiadas con alguna clase en grupo. El equipo te orienta para que no vayas a ciegas.",
      zones: ["Máquinas", "Clases dirigidas", "Cardio"],
      msg: "Hola, he visto vuestra web. Quiero ponerme en forma, ¿me contáis cómo empezar?"
    },
    fuerza: {
      title: "Más fuerza, semana a semana",
      text: "Sala de musculación y peso libre para progresar con cargas, con alguien cerca que revise tu técnica.",
      zones: ["Musculación", "Peso libre"],
      msg: "Hola, he visto vuestra web. Me gustaría entrenar fuerza, ¿me dais información?"
    },
    peso: {
      title: "Mover el cuerpo y soltar kilos",
      text: "Cintas, bicis y elípticas para el cardio, más clases en grupo que hacen que la hora pase volando.",
      zones: ["Cardio", "Clases dirigidas", "Máquinas"],
      msg: "Hola, he visto vuestra web. Quiero perder peso, ¿me contáis qué puedo hacer en el gym?"
    },
    volver: {
      title: "Volver, esta vez para quedarte",
      text: "Si hace tiempo que no entrenas, empieza poco a poco. Aquí hay gente que te anima a venir de forma regular.",
      zones: ["A tu ritmo", "Equipo cercano", "Clases dirigidas"],
      msg: "Hola, he visto vuestra web. Hace tiempo que no entreno y quiero volver, ¿cómo empiezo?"
    }
  };
  var keys = Object.keys(goals);
  var panel = document.querySelector(".goal-panel");
  var tabs = document.querySelectorAll(".goal-tabs button");
  function pick(btn) {
    var g = goals[btn.getAttribute("data-goal")];
    tabs.forEach(function (t) { t.setAttribute("aria-selected", String(t === btn)); });
    document.getElementById("goal-num").textContent = "0" + (keys.indexOf(btn.getAttribute("data-goal")) + 1);
    document.getElementById("goal-title").textContent = g.title;
    document.getElementById("goal-text").textContent = g.text;
    var ul = document.getElementById("goal-zones");
    ul.innerHTML = "";
    g.zones.forEach(function (z) {
      var li = document.createElement("li");
      li.textContent = z;
      ul.appendChild(li);
    });
    var cta = document.getElementById("goal-cta");
    cta.setAttribute("data-wa", g.msg);
    bindWa(cta);
    panel.classList.remove("swap");
    void panel.offsetWidth;
    panel.classList.add("swap");
  }
  tabs.forEach(function (t) {
    t.addEventListener("click", function () { pick(t); });
  });

  // Aparición al hacer scroll
  var els = document.querySelectorAll(".sec-head, .goal-ui, .zone, .crew-card, .rev, .step-list li, .where-info, .map");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) {
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
