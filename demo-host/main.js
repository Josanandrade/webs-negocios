(() => {
  // Móvil público del estudio (Fresha y directorios). WhatsApp sin confirmar: cambiar aquí si usan otro número.
  const WA_NUMBER = "34695634092";
  const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
  const root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  // Enlaces de WhatsApp con mensaje preparado.
  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = waLink(a.dataset.wa);
    a.target = "_blank";
    a.rel = "noopener";
  });

  // Cabecera al hacer scroll.
  const nav = document.querySelector(".nav");
  const fab = document.querySelector(".fab");
  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
    fab.classList.toggle("is-hidden", window.scrollY < 520);
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
  };
  toggle.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });

  // Abanico de colores: se abre al cargar.
  const fan = document.getElementById("fan");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (fan && !reduced) {
    fan.classList.add("is-closed");
    requestAnimationFrame(() => setTimeout(() => fan.classList.remove("is-closed"), 250));
  }

  // Aparición suave de bloques.
  const targets = document.querySelectorAll(".section__head, .svc, .bcard, .shot, .about__plate, .about__copy, .quote, .ask, .visit__map, .visit__info");
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
    const name = (d.get("nombre") || "").toString().trim();
    const hello = name ? `Hola María, soy ${name}.` : "Hola María.";
    return `${hello} Me gustaría pedir cita para ${d.get("servicio")}, ${d.get("franja")}. ¿Qué huecos tenéis?`;
  };
  const render = () => { preview.textContent = buildMsg(); };
  form.addEventListener("input", render);
  form.addEventListener("change", render);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    window.open(waLink(buildMsg()), "_blank", "noopener");
  });
  render();

  // Indicador "Abierto ahora" (hora de Madrid). Horario: L–V 9:30–13:30 y 16:00–20:00.
  const HOURS = { 1: [[570, 810], [960, 1200]], 2: [[570, 810], [960, 1200]], 3: [[570, 810], [960, 1200]], 4: [[570, 810], [960, 1200]], 5: [[570, 810], [960, 1200]] };
  try {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    const min = parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10);
    const slots = HOURS[day] || [];
    const isOpen = slots.some(([a, b]) => min >= a && min < b);
    const el = document.getElementById("open");
    const fmt = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
    let text;
    if (isOpen) {
      const end = slots.find(([a, b]) => min >= a && min < b)[1];
      text = `Abierto ahora · hasta las ${fmt(end)}`;
    } else {
      const next = slots.find(([a]) => min < a);
      text = next ? `Cerrado ahora · abrimos a las ${fmt(next[0])}` : "Cerrado ahora · te leemos por WhatsApp";
      el.classList.add("is-closed");
    }
    document.getElementById("openText").textContent = text;
    el.hidden = false;
  } catch (_) { /* sin indicador */ }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
