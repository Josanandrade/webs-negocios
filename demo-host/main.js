(() => {
  // Teléfono público del centro (fijo, 955 71 70 96). WhatsApp sin confirmar: cambiar aquí si tienen móvil.
  const WA_NUMBER = "34955717096";
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

  // Carta de tratamientos: pestañas.
  const catalog = document.querySelector(".catalog");
  const tabs = [...document.querySelectorAll('.tabs [role="tab"]')];
  const panels = [...document.querySelectorAll(".panel")];
  const search = document.getElementById("search");
  const empty = document.getElementById("empty");
  const showTab = (name, focus = false) => {
    tabs.forEach((t) => {
      const on = t.dataset.tab === name;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
      if (on) t.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
    panels.forEach((p) => p.classList.toggle("is-active", p.dataset.panel === name));
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => {
      if (search.value) { search.value = ""; runSearch(); }
      showTab(t.dataset.tab);
    });
    t.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      showTab(next.dataset.tab, true);
    });
  });
  document.querySelectorAll(".index [data-tab]").forEach((a) => {
    a.addEventListener("click", () => {
      if (search.value) { search.value = ""; runSearch(); }
      showTab(a.dataset.tab);
    });
  });
  showTab("facial");

  // Carta de tratamientos: buscador.
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const runSearch = () => {
    const q = norm(search.value.trim());
    catalog.classList.toggle("is-searching", q.length > 0);
    let total = 0;
    panels.forEach((p) => {
      let hits = 0;
      p.querySelectorAll(".item").forEach((item) => {
        const text = norm(item.textContent + " " + (item.dataset.k || ""));
        const hit = !q || q.split(/\s+/).every((w) => text.includes(w));
        item.classList.toggle("is-hidden", !hit);
        if (hit) hits++;
      });
      p.classList.toggle("is-empty", hits === 0);
      total += hits;
    });
    empty.hidden = !(q && total === 0);
  };
  search.addEventListener("input", runSearch);

  // Formulario de cita: prepara el mensaje y lo abre en WhatsApp.
  const form = document.getElementById("cita-form");
  const servicio = document.getElementById("servicio");
  const dia = document.getElementById("dia");
  const error = document.getElementById("form-error");
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  dia.min = iso(new Date());

  document.querySelectorAll("[data-service]").forEach((a) => {
    a.addEventListener("click", () => {
      const opt = [...servicio.options].find((o) => o.value === a.dataset.service);
      if (opt) servicio.value = opt.value;
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = form.nombre.value.trim();
    if (!nombre || !servicio.value) {
      error.hidden = false;
      (nombre ? servicio : form.nombre).focus();
      return;
    }
    error.hidden = true;
    const franja = form.querySelector('input[name="franja"]:checked').value;
    let fecha = "";
    if (dia.value) {
      const [y, m, d] = dia.value.split("-").map(Number);
      fecha = new Date(y, m - 1, d).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
    }
    const lines = [
      `Hola, soy ${nombre}. Me gustaría pedir cita en Espacio de Belleza Rosa.`,
      `Tratamiento: ${servicio.value}`,
      fecha ? `Día preferido: ${fecha}, por la ${franja}` : `Mejor por la ${franja}`,
    ];
    const nota = form.nota.value.trim();
    if (nota) lines.push(`Comentario: ${nota}`);
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });

  // Abierto ahora (horario de Fresha y directorios: L–V 9:30–20:00, S 9:30–14:00).
  const HOURS = { 1: [570, 1200], 2: [570, 1200], 3: [570, 1200], 4: [570, 1200], 5: [570, 1200], 6: [570, 840] };
  const now = new Date();
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  const status = document.getElementById("status");
  const text = status.querySelector(".status__text");
  const today = HOURS[day];
  const fmt = (m) => `${Math.floor(m / 60)}:${pad(m % 60)}`;
  if (today && mins >= today[0] && mins < today[1]) {
    status.classList.add("is-open");
    text.textContent = `Abierto ahora · hasta las ${fmt(today[1])}`;
  } else {
    status.classList.add("is-closed");
    let next = today && mins < today[0] ? `hoy a las ${fmt(today[0])}` : null;
    if (!next) {
      for (let i = 1; i <= 7; i++) {
        const d = (day + i) % 7;
        if (HOURS[d]) {
          next = i === 1 ? `mañana a las ${fmt(HOURS[d][0])}` : `el ${["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][d]} a las ${fmt(HOURS[d][0])}`;
          break;
        }
      }
    }
    text.textContent = `Cerrado ahora · abrimos ${next}`;
  }
  document.querySelectorAll(".hours tr[data-days]").forEach((tr) => {
    if (tr.dataset.days.split(",").map(Number).includes(day)) tr.classList.add("is-today");
  });

  document.getElementById("year").textContent = String(now.getFullYear());
})();
