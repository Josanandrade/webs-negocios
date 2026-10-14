// Todos los datos del negocio viven aquí. Cada valor procede de una fuente
// pública identificada; los descartes y su motivo están en la documentación
// interna del repositorio (no se publica).

export const business = {
  name: "Marta Benítez",
  descriptor: "Belleza & Barbería",
  legalLine: "Salón de belleza Marta Benítez & Barbería especializada",
  since: 2016,
  street: "C/ Alarcón, 7, Local A",
  corner: "Esquina con C/ Zurbarán",
  city: "41701 Dos Hermanas, Sevilla",
  phone: { display: "854 70 58 94", href: "tel:+34854705894" },
  whatsapp: {
    display: "654 42 06 22",
    href: "https://wa.me/34654420622?text=Hola%2C%20quer%C3%ADa%20pedir%20cita%20en%20Marta%20Ben%C3%ADtez.",
  },
  booking: "https://booksy.com/es-es/129298_salon-de-belleza-marta-benitez_peluqueria_29946_dos-hermanas",
  maps: "https://www.google.com/maps/search/?api=1&query=Calle%20Alarc%C3%B3n%207%2C%2041701%20Dos%20Hermanas",
  instagram: { handle: "@salondebellezamartabenitez", href: "https://www.instagram.com/salondebellezamartabenitez/" },
  facebook: "https://www.facebook.com/SalondeBellezaMB/",
  email: "salondebellezamb@gmail.com",
  amenities: ["Entrada accesible en silla de ruedas", "Pago con tarjeta y móvil"],
} as const;

/** 0 = domingo … 6 = sábado. Tramos en minutos desde medianoche. */
export type Slot = readonly [number, number];
export const hours: readonly { day: string; short: string; slots: readonly Slot[] }[] = [
  { day: "Domingo", short: "Dom", slots: [] },
  { day: "Lunes", short: "Lun", slots: [[17 * 60, 20 * 60 + 30]] },
  { day: "Martes", short: "Mar", slots: [[10 * 60, 13 * 60 + 30], [17 * 60, 20 * 60 + 30]] },
  { day: "Miércoles", short: "Mié", slots: [[10 * 60, 13 * 60 + 30], [17 * 60, 20 * 60 + 30]] },
  { day: "Jueves", short: "Jue", slots: [[10 * 60, 13 * 60 + 30], [17 * 60, 20 * 60 + 30]] },
  { day: "Viernes", short: "Vie", slots: [[10 * 60, 13 * 60 + 30], [17 * 60, 20 * 60 + 30]] },
  { day: "Sábado", short: "Sáb", slots: [[9 * 60, 14 * 60]] },
];

export const reputation = {
  rating: "4,6",
  count: 106,
  source: "Booksy",
  reviews: [
    {
      quote: "Iba con unas ideas, me ha aconsejado y he salido super contenta con el resultado y sobre todo por el trato recibido.",
      author: "Luisa",
      service: "Tinte + marcado + corte",
    },
    {
      quote: "Puntuales, y realizan su trabajo excelente, muy recomendable!",
      author: "Arnold",
      service: "Corte caballero",
    },
    {
      quote: "Todo perfecto muchísimas gracias ❤️",
      author: "Laura",
      service: "Cejas y esmalte permanente",
    },
  ],
} as const;

export type Service = { name: string; price?: string; time?: string; note?: string };
export type Group = { title: string; items: Service[] };
export type Area = {
  id: "cabello" | "barberia" | "estetica" | "laser";
  index: string;
  label: string;
  kicker: string;
  lead: string;
  groups: Group[];
};

// Precios y duraciones: carta pública del salón en Booksy (14/10/2026).
export const areas: Area[] = [
  {
    id: "cabello",
    index: "01",
    label: "Cabello",
    kicker: "Corte, color y peinado",
    lead: "Del corte de diario a las mechas completas, el alisado o el recogido de un día grande.",
    groups: [
      {
        title: "Corte y peinado",
        items: [
          { name: "Corte mujer", price: "15 €", time: "30 min" },
          { name: "Corte y peinado", price: "35 €", time: "30 min" },
          { name: "Corte de niña", price: "15 €", time: "20 min" },
          { name: "Corte de flequillo", price: "4 €", time: "10 min" },
          { name: "Lavar y peinar", price: "20 €", time: "35 min" },
          { name: "Peinado pelo corto", price: "12 €", time: "15 min" },
          { name: "Peinado media melena", price: "15 €", time: "20 min" },
          { name: "Peinado con ondas", price: "25 €", time: "35 min" },
        ],
      },
      {
        title: "Color",
        items: [
          { name: "Tinte", price: "27 €", time: "30 min" },
          { name: "Tinte + marcado", price: "47 €", time: "40 min" },
          { name: "Tinte + marcado + corte", price: "62 €", time: "45 min" },
          { name: "Contorno", price: "15 €", time: "25 min" },
          { name: "Matizadores", price: "15 €", time: "25 min" },
          { name: "Mechas, solo contorno", price: "42 €", time: "2 h" },
          { name: "Mechas completas", price: "85 €", time: "3 h" },
        ],
      },
      {
        title: "Tratamiento y forma",
        items: [
          { name: "Olaplex", price: "40 €", time: "55 min" },
          { name: "Alisados", price: "130 €", time: "1 h" },
          { name: "Permanente", price: "55 €", time: "1 h" },
        ],
      },
      {
        title: "Eventos",
        items: [
          { name: "Recogido", price: "40 €", time: "30 min" },
          { name: "Semirrecogido", price: "35 €", time: "10 min" },
          { name: "Recogido con coletas", price: "30 €", time: "30 min" },
        ],
      },
    ],
  },
  {
    id: "barberia",
    index: "02",
    label: "Barbería",
    kicker: "Corte caballero y cuidado masculino",
    lead: "Barbería especializada dentro del mismo salón: corte, cejas, depilación y láser pensados para hombre.",
    groups: [
      {
        title: "Barbería",
        items: [{ name: "Corte caballero", note: "Precio en el salón" }],
      },
      {
        title: "Cuidado masculino",
        items: [
          { name: "Cejas hombre", price: "8 €", time: "15 min" },
          { name: "Axilas hombre", price: "10 €", time: "15 min" },
          { name: "Brazos hombre", price: "18 €", time: "25 min" },
          { name: "Espalda hombre", price: "20 €", time: "20 min" },
          { name: "Pecho hombre", price: "20 €", time: "25 min" },
          { name: "Piernas completas hombre", price: "25 €", time: "50 min" },
        ],
      },
      {
        title: "Láser",
        items: [{ name: "Perfilado de barba con láser", note: "Por zona · consulta" }],
      },
    ],
  },
  {
    id: "estetica",
    index: "03",
    label: "Estética",
    kicker: "Mirada, manos y piel",
    lead: "Cejas a hilo, laminado, lifting de pestañas, uñas, depilación y cuidado facial.",
    groups: [
      {
        title: "Cejas y pestañas",
        items: [
          { name: "Cejas mujer", price: "7 €", time: "15 min" },
          { name: "Depilación con hilo", price: "11 €", time: "30 min" },
          { name: "Hilo ceja + bozo", price: "18 €", time: "30 min" },
          { name: "Hilo facial", price: "30 €", time: "1 h 30 min" },
          { name: "Henna + cejas", price: "18 €", time: "15 min" },
          { name: "Laminado de ceja", price: "26 €", time: "30 min" },
          { name: "Lifting de pestañas", price: "35 €", time: "1 h" },
        ],
      },
      {
        title: "Uñas",
        items: [
          { name: "Manicura", price: "10 €", time: "20 min" },
          { name: "Esmalte permanente", price: "18 €", time: "40 min" },
          { name: "Esmalte permanente con refuerzo", price: "24 €", time: "30 min" },
          { name: "Esmalte de pies", price: "13 €", time: "15 min" },
          { name: "Esmalte permanente pies", price: "18 €", time: "25 min" },
          { name: "Pedicura completa", price: "20 €", time: "45 min" },
          { name: "Pedicura semipermanente", price: "25 €", time: "40 min" },
        ],
      },
      {
        title: "Facial",
        items: [
          { name: "Higiene facial", price: "40 €", time: "1 h" },
          { name: "Higiene facial con punta de diamante", price: "45 €", time: "1 h" },
          { name: "Tratamiento Probiome Peel", price: "80 €", time: "1 h 30 min" },
        ],
      },
      {
        title: "Depilación",
        items: [
          { name: "Bozo", price: "5 €", time: "5 min" },
          { name: "Mentón", price: "5 €", time: "5 min" },
          { name: "Cejas + bozo", price: "13 €", time: "15 min" },
          { name: "Axilas", price: "7 €", time: "15 min" },
          { name: "Ingles", price: "15 €", time: "15 min" },
          { name: "Ingles completas", price: "20 €", time: "30 min" },
          { name: "Medias piernas", price: "15 €", time: "25 min" },
          { name: "Piernas completas", price: "20 €", time: "45 min" },
        ],
      },
    ],
  },
  {
    id: "laser",
    index: "04",
    label: "Láser",
    kicker: "Técnica avanzada",
    lead: "Depilación láser médica por zonas, eliminación de tatuajes y micropigmentación.",
    groups: [
      {
        title: "Depilación láser médica",
        items: [
          { name: "Zonas pequeñas", note: "Bozo, mentón, patilla, entrecejo, manos, pies" },
          { name: "Zonas medias", note: "Axilas, ingles, cuello, hombros, perfilado de barba" },
          { name: "Zonas amplias", note: "Pecho, abdomen, medias piernas, cara completa" },
          { name: "Zonas completas", note: "Piernas completas, espalda, pecho y abdomen" },
        ],
      },
      {
        title: "Técnicas",
        items: [
          { name: "Eliminación de tatuajes", note: "Valoración previa" },
          { name: "Micropigmentación", note: "Valoración previa" },
        ],
      },
    ],
  },
];

/**
 * Fotografías reales del salón. Vacío a propósito: todavía no hay material
 * cedido por el negocio. Al añadir una entrada (src en public/assets/...),
 * el panel gráfico de esa área se sustituye por la foto sin tocar el diseño.
 */
export const photos: Partial<Record<Area["id"] | "salon", { src: string; alt: string }>> = {};
