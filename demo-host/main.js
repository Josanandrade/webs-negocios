// Datos del negocio. Teléfono público en su ficha (sin reclamar) de Fresha.
// WhatsApp: es un móvil, pero no está confirmado que tenga WhatsApp.
const NEGOCIO = {
  nombre: "Peluquería Rafael Lobo",
  telefono: "34621023914",
  whatsapp: "34621023914",
};

// Valoración: déjalo en null hasta confirmarla en Google con el propio negocio.
// Ejemplo: { valor: "4,9", fuente: "en Google" }
const VALORACION = null;

const waUrl = (text) =>
  `https://wa.me/${NEGOCIO.whatsapp}?text=${encodeURIComponent(text)}`;
const saludo = `Hola, quería pedir turno en ${NEGOCIO.nombre}.`;

document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = waUrl(saludo);
  a.target = "_blank";
  a.rel = "noopener";
});
document.querySelectorAll("[data-tel]").forEach((a) => {
  a.href = `tel:+${NEGOCIO.telefono}`;
});
document.querySelectorAll("[data-wa-service]").forEach((a) => {
  a.href = waUrl(`Hola, quería pedir turno para: ${a.dataset.waService}.`);
  a.target = "_blank";
  a.rel = "noopener";
});

if (VALORACION) {
  document.getElementById("ratingValue").textContent = VALORACION.valor;
  document.getElementById("ratingSource").textContent = VALORACION.fuente;
  document.getElementById("rating").hidden = false;
}

document.getElementById("year").textContent = new Date().getFullYear();

// Cabecera y menú móvil
const header = document.getElementById("top");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const burger = document.getElementById("burger");
const nav = document.getElementById("nav");
burger.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
});
nav.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    nav.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  })
);

// Número de turno del ticket del hero
const num = document.getElementById("ticketNum");
let n = 7;
setInterval(() => {
  n = n >= 12 ? 1 : n + 1;
  num.textContent = String(n).padStart(2, "0");
}, 2600);

// Formulario de turno -> mensaje de WhatsApp
const form = document.getElementById("turnoForm");
const preview = document.getElementById("turnoPreview");
const nameInput = document.getElementById("turnoName");
const choice = (group) =>
  form.querySelector(`[data-group="${group}"] .chip.is-on`).textContent.trim();

function buildMessage() {
  const nombre = nameInput.value.trim();
  const dia = choice("dia");
  const franja = choice("franja");
  const cuando =
    dia === "Lo antes posible" ? "lo antes posible" : `el ${dia.toLowerCase()}`;
  const hora =
    franja === "Me da igual" ? "a cualquier hora" : `por la ${franja.toLowerCase()}`;
  return `Hola${nombre ? `, soy ${nombre}` : ""}. Quería pedir turno en ${NEGOCIO.nombre} para ${choice("servicio").toLowerCase()}, ${cuando}, ${hora}. ¿Tenéis hueco?`;
}
const refresh = () => (preview.textContent = buildMessage());

form.querySelectorAll(".chips").forEach((group) =>
  group.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    group.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-on"));
    chip.classList.add("is-on");
    refresh();
  })
);
nameInput.addEventListener("input", refresh);
form.addEventListener("submit", (e) => {
  e.preventDefault();
  window.open(waUrl(buildMessage()), "_blank", "noopener");
});
refresh();

// Aparición suave al hacer scroll
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    }),
  { threshold: 0.12 }
);
document
  .querySelectorAll(".sec-head, .svc, .steps li, .gal, .about-grid > *, .rev, .turno-card > *, .loc-grid > *, .c-card")
  .forEach((el) => {
    el.classList.add("reveal");
    io.observe(el);
  });
