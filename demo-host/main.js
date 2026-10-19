(() => {
  // Datos de contacto. Sin confirmar a 19/10/2026: rellenar antes de enseñar la demo.
  // Mientras PHONE esté vacío, WhatsApp abre un mensaje sin destinatario y se ocultan las filas de teléfono.
  const CONFIG = {
    PHONE: "",            // ej. "34600000000" (con prefijo 34, sin espacios)
    PHONE_LABEL: "",      // ej. "600 00 00 00"
    ADDRESS: "",          // ej. "C/ Ejemplo, 1 · 41806 Umbrete (Sevilla)"
    INSTAGRAM: "",        // ej. "muah.amparosalado" (sin @)
  };

  const root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  const waLink = (text) => CONFIG.PHONE
    ? `https://wa.me/${CONFIG.PHONE}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;

  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = waLink(a.dataset.wa);
    a.target = "_blank";
    a.rel = "noopener";
  });

  if (CONFIG.PHONE) {
    document.querySelectorAll("[data-tel]").forEach((a) => { a.href = `tel:+${CONFIG.PHONE}`; a.hidden = false; });
    document.querySelectorAll("[data-tel-text]").forEach((a) => { a.href = `tel:+${CONFIG.PHONE}`; a.textContent = CONFIG.PHONE_LABEL || CONFIG.PHONE; });
    document.querySelectorAll("[data-phone-row]").forEach((el) => { el.hidden = false; });
  }
  if (CONFIG.ADDRESS) {
    document.querySelectorAll("[data-address]").forEach((el) => { el.textContent = CONFIG.ADDRESS; });
  }
  if (CONFIG.INSTAGRAM) {
    document.querySelectorAll("[data-ig]").forEach((a) => { a.href = `https://www.instagram.com/${CONFIG.INSTAGRAM}/`; a.textContent = `@${CONFIG.INSTAGRAM}`; });
    document.querySelectorAll("[data-ig-row]").forEach((el) => { el.hidden = false; });
  }
  const mapsQuery = CONFIG.ADDRESS || "Muah By Amparo Salado, Umbrete, Sevilla";
  document.querySelectorAll("[data-maps]").forEach((a) => {
    a.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;
  });
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

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

  // Formulario: prepara el mensaje de WhatsApp en el navegador, no envía datos a ningún servidor.
  const form = document.getElementById("form-cita");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const servicios = data.getAll("servicio");
    const nombre = (data.get("nombre") || "").trim();
    const ocasion = data.get("ocasion");
    const fecha = data.get("fecha");
    const nota = (data.get("nota") || "").trim();
    const lines = [`¡Hola Amparo!${nombre ? ` Soy ${nombre}.` : ""} Quería pedir cita en Muah.`];
    if (servicios.length) lines.push(`Servicio: ${servicios.join(", ")}`);
    if (ocasion) lines.push(`Ocasión: ${ocasion}`);
    if (fecha) lines.push(`Fecha: ${new Date(fecha + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}`);
    if (nota) lines.push(nota);
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });
})();
