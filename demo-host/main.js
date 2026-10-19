(() => {
  // Móvil público del centro (Fresha). WhatsApp sin confirmar: cambiar aquí si usan otro número.
  const WA_NUMBER = "34691847764";
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

  // Pestañas de la carta de tratamientos.
  const tabs = [...document.querySelectorAll(".tab")];
  const selectTab = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tab));
    tab.addEventListener("keydown", (e) => {
      const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (dir) selectTab(tabs[(i + dir + tabs.length) % tabs.length], true);
    });
  });
  document.querySelectorAll("[data-tab-link]").forEach((a) => {
    a.addEventListener("click", () => selectTab(document.getElementById(`tab-${a.dataset.tabLink}`)));
  });

  // Tratamientos elegidos desde la carta: se añaden a la nota del formulario.
  const form = document.getElementById("form");
  const picked = new Set();
  document.querySelectorAll("[data-pick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const name = btn.dataset.pick;
      if (picked.has(name)) { picked.delete(name); btn.classList.remove("is-picked"); btn.textContent = "Pedir"; return; }
      picked.add(name);
      btn.classList.add("is-picked");
      btn.textContent = "Añadido";
    });
  });

  // Solicitud de cita: prepara el mensaje de WhatsApp, no envía datos a ningún servidor.
  const error = form.querySelector("[data-error]");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const nombre = (data.get("nombre") || "").trim();
    const servicios = [...data.getAll("servicio"), ...picked];
    if (!nombre || !servicios.length) {
      error.hidden = false;
      return;
    }
    error.hidden = true;
    const nota = (data.get("nota") || "").trim();
    const lines = [
      `Hola Mari Paz, soy ${nombre}.`,
      `Me gustaría pedir cita para: ${servicios.join(", ")}.`,
      `Me viene bien: ${data.get("cuando")}.`,
    ];
    if (nota) lines.push(nota);
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });

  // Horario e indicador "Abierto ahora" (hora de España).
  const HOURS = { 2: [[9.5, 13.5]], 3: [[9.5, 13.5]], 4: [[9.5, 13.5]], 5: [[9.5, 13.5]], 6: [[10, 14]] };
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
  const day = now.getDay();
  const h = now.getHours() + now.getMinutes() / 60;
  const open = (HOURS[day] || []).some(([a, b]) => h >= a && h < b);
  const todayRow = document.querySelector(`[data-week] [data-day="${day}"]`);
  if (todayRow) todayRow.classList.add("is-today");
  document.querySelector("[data-open-dot]").classList.toggle("is-open", open);
  document.querySelector("[data-open-text]").textContent = open ? "Abierto ahora" : "Ahora cerrado · escríbenos";

  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = now.getFullYear(); });
})();
