// Free Style · demo: menú, WhatsApp, horario en vivo, galería y formulario de cita.
(() => {
  const WA_NUMBER = "34658472580";
  document.documentElement.classList.replace("no-js", "js");

  const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

  // Enlaces de WhatsApp con mensaje predefinido
  document.querySelectorAll("[data-wa]").forEach((a) => {
    a.href = waLink(a.dataset.wa);
    a.target = "_blank";
    a.rel = "noopener";
  });

  // Menú móvil
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

  // Horario: abierto / cerrado ahora (hora de Madrid)
  const HOURS = { 0: null, 1: null, 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [9, 20], 6: [9, 14] };
  try {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    const now = Number(get("hour")) + Number(get("minute")) / 60;
    const today = document.querySelector(`.hours tr[data-day="${day}"]`);
    if (today) today.classList.add("is-today");
    const status = document.querySelector("[data-open-status]");
    const span = HOURS[day];
    if (status) {
      if (span && now >= span[0] && now < span[1]) {
        status.textContent = `Abierto ahora · hasta las ${span[1]}:00`;
        status.classList.add("is-open");
      } else {
        let next = day, label = "";
        for (let i = 1; i <= 7; i++) {
          const d = (day + (span && now < span[0] ? 0 : i)) % 7;
          if (HOURS[d]) { next = d; break; }
        }
        const names = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
        label = next === day ? `hoy a las ${HOURS[next][0]}:00` : next === (day + 1) % 7 ? `mañana a las ${HOURS[next][0]}:00` : `el ${names[next]} a las ${HOURS[next][0]}:00`;
        status.textContent = `Cerrado ahora · abrimos ${label}`;
        status.classList.add("is-closed");
      }
    }
  } catch (_) { /* sin Intl: se queda el horario estático */ }

  // Aparición al hacer scroll
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  // Galería ampliada
  const box = document.getElementById("lightbox");
  if (box && typeof box.showModal === "function") {
    const img = box.querySelector("img");
    const cap = box.querySelector("p");
    document.querySelectorAll(".gal").forEach((g) => {
      g.addEventListener("click", () => {
        const src = g.querySelector("img");
        img.src = src.src;
        img.alt = src.alt;
        cap.textContent = g.dataset.caption || "";
        box.showModal();
      });
    });
    box.querySelector(".lightbox__close").addEventListener("click", () => box.close());
    box.addEventListener("click", (e) => { if (e.target === box) box.close(); });
  }

  // Enlaces "pedir cita de peluquería/estética" preseleccionan el servicio
  const form = document.getElementById("booking-form");
  document.querySelectorAll("[data-service]").forEach((a) => {
    a.addEventListener("click", () => {
      const radio = form.querySelector(`input[name="servicio"][value="${a.dataset.service}"]`);
      if (radio) radio.checked = true;
    });
  });

  // Formulario: compone el mensaje y abre WhatsApp (no envía ni guarda nada)
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const nombre = (data.get("nombre") || "").toString().trim();
    const input = form.querySelector('input[name="nombre"]');
    const hint = document.getElementById("form-hint");
    if (!nombre) {
      input.classList.add("is-invalid");
      input.focus();
      hint.textContent = "Escribe tu nombre para que sepamos quién eres.";
      return;
    }
    input.classList.remove("is-invalid");
    const nota = (data.get("nota") || "").toString().trim();
    const msg = [
      `Hola Free Style, soy ${nombre} 👋`,
      `Me gustaría pedir cita para: ${data.get("servicio")}.`,
      `Día: ${data.get("dia")} · Mejor por la ${data.get("franja")}.`,
      nota ? `Comentario: ${nota}` : "",
    ].filter(Boolean).join("\n");
    window.open(waLink(msg), "_blank", "noopener");
    hint.textContent = "Se ha abierto WhatsApp con tu mensaje. Te confirmamos la hora por allí.";
  });

  // Oculta el botón flotante cuando se ve la sección de cita
  const float = document.querySelector(".wa-float");
  const booking = document.getElementById("cita");
  if (float && booking && "IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => float.classList.toggle("is-hidden", en.isIntersecting), { threshold: 0.2 }).observe(booking);
  }
})();
