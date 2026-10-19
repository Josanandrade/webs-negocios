(() => {
  // Móvil público en Fresha. WhatsApp sin confirmar: cambiar aquí si el salón usa otro número.
  const WA_NUMBER = "34616499044";
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

  // Selector de color por tono de piel (consejos del blog de Sonia).
  const tips = {
    clara: {
      title: "Piel clara",
      text: "Mejor huir de los colores extremos: tonos suaves y naturales que iluminen sin endurecer las facciones.",
      colors: [["#E6CFA6", "Miel"], ["#C9A47A", "Beige"], ["#8F6A4A", "Avellana"]],
    },
    amarillenta: {
      title: "Tono amarillento",
      text: "Te favorecen los tonos más oscuros, que equilibran la piel y dan profundidad a la mirada.",
      colors: [["#5A3B2A", "Chocolate"], ["#3B2A22", "Castaño oscuro"], ["#231A17", "Moreno"]],
    },
    rosada: {
      title: "Tono rosado",
      text: "Rubios y castaños son tus aliados: suavizan la rojez y quedan muy naturales.",
      colors: [["#E9D3A8", "Rubio"], ["#B88A5E", "Rubio oscuro"], ["#7A5238", "Castaño"]],
    },
    morena: {
      title: "Piel morena",
      text: "Avellanas, caramelos y rojizos dan calidez y brillo. Perfectos para mechas con luz.",
      colors: [["#9A6A44", "Avellana"], ["#C27C3E", "Caramelo"], ["#8E3B24", "Rojizo"]],
    },
  };
  const skinBtns = document.querySelectorAll("[data-skin]");
  const swatches = document.getElementById("swatches");
  const tipTitle = document.getElementById("tip-title");
  const tipText = document.getElementById("tip-text");
  const showSkin = (key) => {
    const t = tips[key];
    tipTitle.textContent = t.title;
    tipText.textContent = t.text;
    swatches.innerHTML = t.colors.map(([c, n]) => `<span style="background:${c}">${n}</span>`).join("");
    skinBtns.forEach((b) => b.setAttribute("aria-checked", String(b.dataset.skin === key)));
  };
  skinBtns.forEach((b) => b.addEventListener("click", () => showSkin(b.dataset.skin)));
  showSkin("clara");

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

  // Solicitud de cita: prepara el mensaje y abre WhatsApp. No envía datos a ningún servidor.
  const form = document.getElementById("ask");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const msg = `Hola Sonia${name ? `, soy ${name}` : ""}. Me gustaría pedir cita para ${data.get("svc")}, ${data.get("when")}. ¡Gracias!`;
    window.open(waLink(msg), "_blank", "noopener");
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();
