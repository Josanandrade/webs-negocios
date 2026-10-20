/*
 * Configuración de la demo · Jesús Losada Gestor Inmobiliario
 * ------------------------------------------------------------
 * No se ha podido confirmar un teléfono público del negocio, así que
 * los números se dejan vacíos. Basta con rellenarlos aquí (solo dígitos,
 * con prefijo 34 en whatsapp) para que aparezcan en toda la web:
 *   telefono: "954000000"     whatsapp: "34600000000"
 * Mientras whatsapp esté vacío, los botones abren WhatsApp con el
 * mensaje ya escrito para que el usuario elija el contacto.
 */
window.JL_CONFIG = {
  nombre: "Jesús Losada",
  marca: "Jesús Losada · Gestor Inmobiliario",
  telefono: "",
  whatsapp: "",
  email: "",
  zona: "Sevilla y el Aljarafe"
};

window.JL = {
  wa(text) {
    const n = (window.JL_CONFIG.whatsapp || "").replace(/\D/g, "");
    return "https://wa.me/" + n + "?text=" + encodeURIComponent(text || "Hola Jesús, te escribo desde tu web.");
  },
  tel() {
    const t = (window.JL_CONFIG.telefono || "").replace(/\D/g, "");
    return t ? "tel:+34" + t : "";
  },
  telLabel() {
    const t = (window.JL_CONFIG.telefono || "").replace(/\D/g, "");
    return t.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4");
  },
  // Separador de miles también en cifras de 4 dígitos (Intl no lo pone en es-ES).
  miles(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); },
  euros(n, op) {
    const s = JL.miles(n) + " €";
    return op === "alquiler" ? s + "/mes" : s;
  },
  // Rellena enlaces y textos marcados con data-wa, data-tel, data-zona.
  bind(root = document) {
    root.querySelectorAll("[data-wa]").forEach(a => { a.href = JL.wa(a.dataset.wa); a.target = "_blank"; a.rel = "noopener"; });
    const tel = JL.tel();
    root.querySelectorAll("[data-tel]").forEach(el => {
      if (tel) { el.hidden = false; if (el.tagName === "A") el.href = tel; el.querySelectorAll("[data-tel-label]").forEach(s => s.textContent = JL.telLabel()); }
      else el.hidden = true;
    });
    root.querySelectorAll("[data-zona]").forEach(el => el.textContent = window.JL_CONFIG.zona);
    if (window.JL_CONFIG.email) root.querySelectorAll("[data-email]").forEach(el => { el.hidden = false; el.href = "mailto:" + JL_CONFIG.email; el.textContent = JL_CONFIG.email; });
  }
};
