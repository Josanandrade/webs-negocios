// The Barber Migue · demo comercial
// Datos de contacto: rellenar cuando el negocio los confirme.
// Sin teléfono, WhatsApp abre el chat para que el usuario elija contacto.
const PHONE = "";       // ej. "600123456" (sin prefijo)
const WA_NUMBER = "";   // ej. "34600123456" (con prefijo 34)
const INSTAGRAM = "";   // ej. "https://www.instagram.com/usuario/"
const ADDRESS = "";     // ej. "C/ Ejemplo, 1 · 41840 Pilas"

document.documentElement.classList.remove("no-js");

const waLink = (text) => {
  const q = "?text=" + encodeURIComponent(text);
  return WA_NUMBER ? `https://wa.me/${WA_NUMBER}${q}` : `https://wa.me/${q}`;
};
const baseMsg = (service) =>
  `Hola Migue, quería pedir cita${service ? " para " + service.toLowerCase() : ""}. ¿Qué huecos tienes?`;

// Enlaces de WhatsApp
document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = waLink(baseMsg(a.dataset.service));
  a.target = "_blank";
  a.rel = "noopener";
});

// Llamada
document.querySelectorAll("[data-call]").forEach((a) => {
  if (PHONE) a.href = `tel:+34${PHONE}`;
});
if (PHONE) {
  const pretty = PHONE.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
  document.querySelectorAll("[data-phone-label]").forEach((el) => (el.textContent = pretty));
}

// Instagram
document.querySelectorAll("[data-ig]").forEach((a) => {
  if (INSTAGRAM) {
    a.href = INSTAGRAM;
    a.target = "_blank";
    a.rel = "noopener";
    const handle = INSTAGRAM.replace(/\/$/, "").split("/").pop();
    document.querySelectorAll("[data-ig-label]").forEach((el) => (el.textContent = "@" + handle));
  } else {
    a.href = "#galeria";
  }
});

// Dirección
if (ADDRESS) {
  document.querySelectorAll("[data-address]").forEach((el) => (el.textContent = ADDRESS));
  const maps = document.getElementById("mapsLink");
  if (maps) maps.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("The Barber Migue " + ADDRESS);
}

// Menú móvil
const toggle = document.querySelector(".nav__toggle");
const menu = document.getElementById("menu");
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!open));
  toggle.setAttribute("aria-label", open ? "Abrir menú" : "Cerrar menú");
  menu.hidden = open;
});
menu.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menú");
    menu.hidden = true;
  })
);

// Selector de cortes
const CUTS = [
  ["Low fade", "El degradado empieza justo encima de la oreja y baja hasta la nuca. Discreto, limpio y fácil de llevar al trabajo."],
  ["Mid fade", "La transición arranca a media altura del lateral. Más contraste sin llegar a ser radical: el término medio que pide casi todo el mundo."],
  ["High fade", "El degradado sube alto y baja hasta la piel. Mucho contraste con la parte de arriba y nuca muy limpia."],
  ["Clásico", "Laterales a tijera o con número largo, sin piel. Un corte de siempre, bien perfilado, que crece con buena forma."],
];
const cutButtons = document.querySelectorAll(".cut");
const cutTitle = document.getElementById("cutTitle");
const cutText = document.getElementById("cutText");
const cutCta = document.getElementById("cutCta");
cutButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    cutButtons.forEach((b) => {
      b.classList.toggle("is-active", b === btn);
      b.setAttribute("aria-selected", String(b === btn));
    });
    const [name, text] = CUTS[Number(btn.dataset.cut)];
    cutTitle.textContent = name;
    cutText.textContent = text;
    cutCta.href = waLink(baseMsg(name));
  })
);

// Formulario de reserva → WhatsApp
const daySel = document.getElementById("b-day");
const DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const today = new Date();
for (let i = 0, added = 0; added < 8 && i < 14; i++) {
  const d = new Date(today);
  d.setDate(today.getDate() + i);
  if (d.getDay() === 0) continue;
  const label = i === 0 ? "Hoy" : i === 1 ? "Mañana" : `${DAYS[d.getDay()][0].toUpperCase()}${DAYS[d.getDay()].slice(1)} ${d.getDate()}`;
  daySel.add(new Option(label, label));
  added++;
}
daySel.add(new Option("Me da igual el día", "cualquier día"));

document.getElementById("booking").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target.elements;
  const name = f["name"].value.trim();
  if (!name) {
    f["name"].classList.add("is-invalid");
    f["name"].focus();
    return;
  }
  f["name"].classList.remove("is-invalid");
  const service = f.service.value;
  const note = f.note.value.trim();
  const msg = `Hola Migue, soy ${name}. Quería pedir cita para ${service.toLowerCase()} (${f.day.value.toLowerCase()}, ${f.slot.value.toLowerCase()}).${note ? " " + note + "." : ""} ¿Tienes hueco?`;
  window.open(waLink(msg), "_blank", "noopener");
});

document.getElementById("year").textContent = new Date().getFullYear();
