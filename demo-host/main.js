(() => {
  // Móvil público del centro (Fresha y directorio comercial de Bormujos). WhatsApp sin confirmar: cambiar aquí si usan otro número.
  const WA_NUMBER = "34698932596";
  // Horario del directorio comercial de Bormujos (por confirmar): [día 0=domingo..6=sábado] -> tramos [inicio, fin] en minutos.
  const HOURS = {
    1: [[600, 840], [960, 1200]], 2: [[600, 840], [960, 1200]], 3: [[600, 840], [960, 1200]],
    4: [[600, 840], [960, 1200]], 5: [[600, 840], [960, 1200]],
  };
  const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
  const root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Enlaces de WhatsApp con mensaje preparado.
  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = waLink(a.dataset.wa);
    a.target = "_blank";
    a.rel = "noopener";
  });

  // Cabecera y botón flotante al hacer scroll.
  const nav = document.querySelector(".nav");
  const fab = document.querySelector(".fab");
  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 10);
    fab.classList.toggle("is-hidden", window.scrollY < 560);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Menú móvil.
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("menu");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    menu.hidden = !open;
    nav.classList.toggle("is-scrolled", open || window.scrollY > 10);
  };
  toggle.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });

  // Mechones del hero: se dibujan al cargar.
  if (!reduced) document.querySelectorAll(".hero .strand").forEach((s) => s.classList.add("is-drawing"));

  // Laboratorio de balayage.
  const lab = document.getElementById("lab-form");
  if (lab) {
    const stops = {
      root: document.getElementById("labRoot"),
      mid: document.getElementById("labMid"),
      light: document.getElementById("labLight"),
      tip: document.getElementById("labTip"),
    };
    const caption = document.getElementById("labCaption");
    const send = document.getElementById("labSend");
    const niveles = { 1: ["sutil", 0.58, 0.88], 2: ["natural", 0.42, 0.78], 3: ["luminoso", 0.26, 0.62] };
    const update = () => {
      const base = lab.querySelector('input[name="base"]:checked');
      const luz = lab.querySelector('input[name="luz"]:checked');
      const [nombreNivel, midOff, lightOff] = niveles[lab.nivel.value];
      stops.root.setAttribute("stop-color", base.dataset.c);
      stops.mid.setAttribute("stop-color", base.dataset.c);
      stops.mid.setAttribute("offset", midOff);
      stops.light.setAttribute("stop-color", luz.dataset.c);
      stops.light.setAttribute("offset", lightOff);
      stops.tip.setAttribute("stop-color", luz.dataset.t);
      caption.textContent = `${base.value} con luz ${luz.value}, efecto ${nombreNivel}`;
      send.href = waLink(`Hola Lore, me gustaría valorar un balayage: base ${base.value.toLowerCase()} con luz ${luz.value} y un efecto ${nombreNivel}. ¿Cuándo podría ir?`);
      send.target = "_blank";
      send.rel = "noopener";
    };
    lab.addEventListener("input", update);
    lab.addEventListener("submit", (e) => e.preventDefault());
    update();
  }

  // Galería con visor.
  const lightbox = document.getElementById("lightbox");
  if (lightbox && typeof lightbox.showModal === "function") {
    const img = lightbox.querySelector("img");
    document.querySelectorAll(".shot").forEach((b) => {
      b.addEventListener("click", () => {
        img.src = b.dataset.full;
        img.alt = b.querySelector("img").alt;
        lightbox.showModal();
      });
    });
    lightbox.querySelector(".lightbox__close").addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.close(); });
  }

  // Indicador de abierto ahora (hora de Madrid).
  const openNow = document.getElementById("openNow");
  if (openNow) {
    try {
      const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
      const get = (t) => parts.find((p) => p.type === t).value;
      const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
      const mins = Number(get("hour")) * 60 + Number(get("minute"));
      const isOpen = (HOURS[day] || []).some(([a, b]) => mins >= a && mins < b);
      openNow.textContent = isOpen ? "Abierto ahora" : "Cerrado ahora";
      openNow.classList.toggle("is-closed", !isOpen);
      openNow.hidden = false;
    } catch (_) { /* sin indicador */ }
  }

  // Aparición suave de bloques.
  const targets = document.querySelectorAll(".head, .svc, .tech, .ext__art, .ext__copy, .est__list li, .shot, .plate, .about__copy, .quote, .ask, .visit__map, .visit__info, .ccard");
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach((el) => { el.classList.add("reveal"); io.observe(el); });
  }

  // Formulario de cita: prepara el mensaje de WhatsApp (no envía datos a ningún servidor).
  const form = document.getElementById("ask");
  const preview = document.getElementById("preview");
  const buildMsg = () => {
    const d = new FormData(form);
    const nombre = (d.get("nombre") || "").trim();
    const servicios = d.getAll("servicio");
    const nota = (d.get("nota") || "").trim();
    let msg = `Hola Lore, soy ${nombre || "…"}.`;
    msg += `\nMe gustaría pedir cita para: ${servicios.length ? servicios.join(", ").toLowerCase() : "…"}.`;
    msg += `\nMe vendría bien ${d.get("cuando")}, ${d.get("franja")}.`;
    if (nota) msg += `\n${nota}`;
    return msg;
  };
  const render = () => { preview.textContent = buildMsg(); };
  form.addEventListener("input", render);
  form.addEventListener("change", render);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    window.open(waLink(buildMsg()), "_blank", "noopener");
  });
  render();
})();
