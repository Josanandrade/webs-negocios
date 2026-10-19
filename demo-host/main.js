// Mar Mejías Peluquería · Amanda Ferrer Uñas — demo estática.
// Todas las reservas se completan en Booksy: cambia aquí la URL si el salón usa otro perfil.
const BOOKSY_URL = "https://booksy.com/es-es/125969_amanda-ferrer_salon-de-unas_29895_mairena-del-aljarafe";

document.documentElement.classList.replace("no-js", "js");

// Botones de reserva -> perfil de Booksy en pestaña nueva
document.querySelectorAll("[data-booksy]").forEach((a) => {
  a.href = BOOKSY_URL;
  a.target = "_blank";
  a.rel = "noopener";
});

// Cabecera con borde al hacer scroll
const nav = document.querySelector(".nav");
const bookBar = document.querySelector(".book-bar");
const hero = document.querySelector(".hero");
const onScroll = () => {
  nav.classList.toggle("is-scrolled", window.scrollY > 8);
  if (bookBar && hero) {
    bookBar.classList.toggle("is-visible", window.scrollY > hero.offsetHeight * 0.6);
  }
};
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Menú móvil
const toggle = document.querySelector(".nav__toggle");
const menu = document.getElementById("menu");
const setMenu = (open) => {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  menu.hidden = !open;
};
toggle.addEventListener("click", () => setMenu(menu.hidden));
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) setMenu(false); });

// Pestañas de la carta
const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
const selectTab = (tab) => {
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
  });
};
tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    selectTab(next);
    next.focus();
  });
});

// Aparición suave al hacer scroll
const items = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  items.forEach((el) => io.observe(el));
} else {
  items.forEach((el) => el.classList.add("is-in"));
}
