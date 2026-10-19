(() => {
  const WA_NUMBER = "34622080207";
  const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
  document.documentElement.classList.remove("no-js");

  // Enlaces directos a WhatsApp con mensaje preparado.
  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = waLink(a.dataset.wa);
    a.target = "_blank";
    a.rel = "noopener";
  });

  // Cabecera y botón flotante según el scroll.
  const nav = document.querySelector(".nav");
  const float = document.querySelector(".wa-float");
  const hero = document.querySelector(".hero");
  const onScroll = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
    float.classList.toggle("is-visible", window.scrollY > hero.offsetHeight * 0.6);
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
  window.addEventListener("resize", () => { if (window.innerWidth > 1020) setMenu(false); });

  // Aparición suave al hacer scroll.
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
  document.querySelectorAll(".filters button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filters button").forEach((b) => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
      const f = btn.dataset.filter;
      works.forEach((w) => w.classList.toggle("is-hidden", f !== "all" && w.dataset.cat !== f));
    });
  });

  // Visor de trabajos.
  const box = document.getElementById("lightbox");
  if (box && typeof box.showModal === "function") {
    const img = box.querySelector("img");
    const caption = box.querySelector("p");
    works.forEach((w) => {
      w.addEventListener("click", () => {
        const src = w.querySelector("img");
        img.src = src.src;
        img.alt = src.alt;
        caption.textContent = w.querySelector("span").textContent;
        box.showModal();
      });
    });
    box.querySelector(".lightbox__close").addEventListener("click", () => box.close());
    box.addEventListener("click", (e) => { if (e.target === box) box.close(); });
  }

  // Formulario: compone el mensaje y abre WhatsApp. No envía ni guarda nada.
  const form = document.getElementById("booking");
  const error = document.getElementById("booking-error");
  const name = form.elements.nombre;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = name.value.trim();
    if (!nombre) {
      error.hidden = false;
      name.classList.add("is-invalid");
      name.focus();
      return;
    }
    error.hidden = true;
    name.classList.remove("is-invalid");
    const servicio = form.elements.servicio.value;
    const franja = form.elements.franja.value;
    const idea = form.elements.idea.value.trim();
    const lines = [
      `Hola Celia, soy ${nombre} 😊`,
      `Me gustaría pedir cita para ${servicio}.`,
      idea ? `Mi idea: ${idea}` : "",
      `Me viene mejor por la ${franja === "cuando haya hueco" ? "mañana o la tarde, cuando haya hueco" : franja}.`,
    ].filter(Boolean);
    window.open(waLink(lines.join("\n")), "_blank", "noopener");
  });
  name.addEventListener("input", () => {
    if (name.value.trim()) { error.hidden = true; name.classList.remove("is-invalid"); }
  });
})();
