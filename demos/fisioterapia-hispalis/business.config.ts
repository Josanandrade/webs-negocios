/**
 * Fisioterapia Híspalis — datos del negocio (única fuente de verdad).
 *
 * Todo lo que aparece en la web sale de aquí. Cada dato lleva su origen.
 * Investigación hecha en octubre de 2026 a partir de la web oficial
 * (fisioterapiahispalis.com: inicio, tratamientos, modalidades, precios y
 * contacto) contrastada con Facebook y directorios públicos (Fresha,
 * tufisioterapeuta.es, efisioterapia.net, mejoresdesevilla.com).
 *
 * Regla: si un dato no está verificado, NO se muestra como hecho. Los campos
 * marcados como pendientes quedan preparados pero ocultos.
 */

export const business = {
  name: "Fisioterapia Híspalis",
  legalTagline: "Clínica de Fisioterapia y Rehabilitación",
  city: "Dos Hermanas",
  province: "Sevilla",

  professional: {
    name: "Angélica Argüello",
    firstName: "Angélica",
    role: "Fisioterapeuta colegiada",
    // Web oficial (página de contacto): «Fisioterapeuta colegiada nº 4584».
    // No se ha podido consultar el registro del Colegio desde esta investigación.
    collegiateNumber: "4584",
    // Web oficial (inicio): «sus manos y sus 15 años de experiencia».
    // Directorios: «más de 15 años». Fecha de redacción de la web desconocida.
    yearsExperience: 15,
  },

  contact: {
    // Web oficial (contacto) + Fresha + directorios: coinciden.
    phoneDisplay: "679 355 828",
    phoneE164: "+34679355828",
    // Web oficial: «llamando al teléfono 679 355 828 (también por WhatsApp)».
    whatsapp: "34679355828",
    email: "angelica@fisioterapiahispalis.com",
  },

  address: {
    street: "C/ Betis, 7 · local",
    postalCode: "41701",
    city: "Dos Hermanas",
    province: "Sevilla",
    // Web oficial: «junto a los pisos de chocolate».
    landmark: "Junto a los «pisos de chocolate»",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Fisioterapia+H%C3%ADspalis+Calle+Betis+7+41701+Dos+Hermanas",
  },

  social: {
    // Página oficial verificada. No se ha encontrado Instagram.
    facebook: "https://www.facebook.com/fisioterapiahispalis/",
  },

  /**
   * Horario: las fuentes NO coinciden (Fresha/tufisioterapeuta: L–J 9:30–20:00,
   * V 9:30–14:00; efisioterapia.net: 9:00–14:00 y 14:00–21:00). No se publica
   * hasta que la clínica lo confirme. Rellenar aquí y se mostrará solo.
   */
  hours: null as null | { days: string; time: string }[],

  /**
   * Reseñas: los agregadores públicos (tufisioterapeuta.es, mejoresdesevilla.com)
   * recogen una valoración de 5/5 con 52–53 opiniones. No se ha podido abrir la
   * ficha de Google directamente. Se muestra como «reseñas públicas».
   */
  rating: {
    value: "5,0",
    count: "más de 50",
    sourceNote: "Valoración media en reseñas públicas de pacientes (octubre 2026).",
  },

  /**
   * Precios publicados en la web oficial (página «Precios/ofertas»): primera
   * sesión 40 €, sesión 45 € (50 min), bono 5 sesiones 215 €, urgencias fin de
   * semana/festivos 70 €. No consta la fecha de actualización → se mantienen
   * ocultos en la demo hasta que la clínica confirme que siguen vigentes.
   */
  showPrices: false,
  sessionMinutes: 50, // Web oficial (precios): sesiones de 50 minutos.
} as const;

/** Mensaje de WhatsApp prellenado (la persona puede editarlo antes de enviar). */
export function whatsappLink(message?: string) {
  const base = `https://wa.me/${business.contact.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const telLink = `tel:${business.contact.phoneE164}`;
export const mailLink = `mailto:${business.contact.email}`;
