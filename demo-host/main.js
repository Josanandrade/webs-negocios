(() => {
  // Móvil público del centro (Fresha "Llamar para reservar"). WhatsApp sin confirmar: cambiar aquí si usan otro número.
  const WA_NUMBER = "34628857439";
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

  // Pestañas de servicios.
  const tabs = [...document.querySelectorAll('[role="tab"]')];
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
      const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      selectTab(tabs[(i + step + tabs.length) % tabs.length], true);
    });
  });
  // "Ver servicios de…" abre la pestaña correspondiente.
  document.querySelectorAll("[data-tab]").forEach((a) => {
    a.addEventListener("click", () => selectTab(document.getElementById(`t-${a.dataset.tab}`)));
  });

  // Filtro de galería.
  const chips = document.querySelectorAll("[data-filter]");
  chips.forEach((chip) => chip.addEventListener("click", () => {
    chips.forEach((c) => { c.classList.toggle("is-on", c === chip); c.setAttribute("aria-pressed", String(c === chip)); });
    document.querySelectorAll(".tile").forEach((tile) => {
      tile.classList.toggle("is-hidden", chip.dataset.filter !== "all" && tile.dataset.cat !== chip.dataset.filter);
    });
  }));

  // Pedir cita: prepara el mensaje de WhatsApp (no envía datos a ningún servidor).
  const form = document.getElementById("booker");
  const preview = document.getElementById("preview");
  const list = (items) => items.length > 1 ? `${items.slice(0, -1).join(", ")} y ${items.at(-1)}` : items[0];
  const buildMessage = () => {
    const data = new FormData(form);
    const svcs = data.getAll("svc");
    const name = (data.get("name") || "").trim();
    let msg = `Hola Mamen${name ? `, soy ${name}` : ""}. Me gustaría pedir cita`;
    if (svcs.length) msg += ` para ${list(svcs)}`;
    msg += `, ${data.get("when")}. ¿Qué huecos tenéis?`;
    return msg;
  };
  const refresh = () => { preview.textContent = buildMessage(); };
  form.addEventListener("input", refresh);
  form.addEventListener("change", refresh);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    window.open(waLink(buildMessage()), "_blank", "noopener");
  });
  refresh();

  // Aparición suave.
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
