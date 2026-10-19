(() => {
  // Teléfono público del salón (fijo). WhatsApp sin confirmar: cambiar aquí si tienen otro número.
  const WA_NUMBER = "34955715970";
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
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
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
  window.addEventListener("resize", () => { if (window.innerWidth > 1020) setMenu(false); });

  // Aparición suave.
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  // Filtros de la galería.
  const works = document.querySelectorAll(".work");
  const filterBtns = document.querySelectorAll(".filters button");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
      const f = btn.dataset.filter;
      works.forEach((w) => w.classList.toggle("is-hidden", f !== "all" && w.dataset.cat !== f));
    });
  });

  // Formulario de cita: prepara el mensaje y lo abre en WhatsApp.
  const form = document.getElementById("cita-form");
  const dia = document.getElementById("dia");
  const error = document.getElementById("form-error");
  const done = document.getElementById("form-done");
  const preview = document.getElementById("form-preview");
  const sendWa = document.getElementById("send-wa");
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  dia.min = iso(new Date());

  const pickService = (name) => {
    const input = form.querySelector(`input[name="servicio"][value="${name}"]`);
    if (input) input.checked = true;
  };
  document.querySelectorAll("[data-service]").forEach((a) => {
    a.addEventListener("click", () => pickService(a.dataset.service));
  });

  const showError = (msg) => { error.textContent = msg; error.hidden = false; };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    error.hidden = true;
    const data = new FormData(form);
    const servicio = data.get("servicio");
    const nombre = (data.get("nombre") || "").trim();
    const fecha = data.get("dia");
    if (!servicio) return showError("Elige qué te quieres hacer.");
    if (!fecha) return showError("Elige el día que prefieres.");
    const d = new Date(`${fecha}T12:00:00`);
    if (d.getDay() === 0) return showError("Los domingos el salón está cerrado. Elige otro día.");
    if (!nombre) return showError("Escribe tu nombre para saber quién pide la cita.");

    let franja = data.get("franja");
    if (d.getDay() === 6 && franja === "tarde") franja = "mañana";
    const nota = (data.get("nota") || "").trim();
    const fechaTxt = d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
    const msg = [
      `Hola, soy ${nombre}. Me gustaría pedir cita en Ma Ji Var.`,
      `Servicio: ${servicio}`,
      `Día: ${fechaTxt}, por la ${franja}`,
      nota ? `Comentario: ${nota}` : ""
    ].filter(Boolean).join("\n");

    preview.textContent = msg;
    sendWa.href = waLink(msg);
    done.hidden = false;
    done.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  // Abierto ahora (horario público: L–V 10–17, S 10–14, hora de España).
  const openNow = document.getElementById("open-now");
  try {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const day = get("weekday");
    const mins = Number(get("hour")) * 60 + Number(get("minute"));
    const weekday = ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(day);
    const open = (weekday && mins >= 600 && mins < 1020) || (day === "Sat" && mins >= 600 && mins < 840);
    openNow.textContent = open ? "Abierto ahora" : "Ahora cerrado · pide tu cita y te respondemos";
    openNow.classList.toggle("is-open", open);
    openNow.hidden = false;
  } catch (_) { /* sin indicador */ }
})();
