// Datos de Animalex. Solo lo que coincide en varias fuentes públicas
// (ver docs/INTERNAL_AUDIT.md). Lo no verificado no aparece en la web.

export const site = {
  name: "Animalex",
  tagline: "Tienda de animales en El Cerro, Sevilla",
  phone: "607 49 14 86",
  phoneHref: "tel:+34607491486",
  // Móvil del negocio. Pendiente de confirmar que atiende WhatsApp:
  // si no, poner a false y la web solo ofrece llamada.
  whatsappEnabled: true,
  whatsappNumber: "34607491486",
  address: {
    street: "C. Lisboa, 49",
    postal: "41006 Sevilla",
    area: "El Cerro",
  },
  maps: {
    directions:
      "https://www.google.com/maps/dir/?api=1&destination=Animalex%2C%20C.%20Lisboa%2049%2C%2041006%20Sevilla&destination_place_id=ChIJew6SAO1uEg0R2Rxx2W2lRMo",
    place:
      "https://www.google.com/maps/search/?api=1&query=Animalex%20C.%20Lisboa%2049%20Sevilla&query_place_id=ChIJew6SAO1uEg0R2Rxx2W2lRMo",
  },
} as const;

export type Slot = readonly [open: string, close: string];

// 0 = domingo … 6 = sábado. Horas en hora de Madrid.
export const hours: Record<number, readonly Slot[]> = {
  1: [["9:30", "15:00"], ["17:30", "21:30"]],
  2: [["9:30", "15:00"], ["17:30", "21:30"]],
  3: [["9:30", "15:00"], ["17:30", "21:30"]],
  4: [["9:30", "15:00"], ["17:30", "21:30"]],
  5: [["9:30", "15:00"], ["17:30", "21:30"]],
  6: [["9:30", "15:00"]],
  0: [],
};

export const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export type AnimalId = "perro" | "gato" | "otra";

export const animals: {
  id: AnimalId;
  label: string;
  forLabel: string;
  lines: string[];
  note?: string;
}[] = [
  {
    id: "perro",
    label: "Perro",
    forLabel: "mi perro",
    lines: ["Alimentación de varias marcas", "Correas y paseo", "Juguetes", "Higiene y cuidado", "Transportines"],
  },
  {
    id: "gato",
    label: "Gato",
    forLabel: "mi gato",
    lines: ["Alimentación de varias marcas", "Higiene y cuidado", "Juguetes", "Transportines", "Accesorios"],
  },
  {
    id: "otra",
    label: "Otras mascotas",
    forLabel: "mi mascota",
    lines: [],
    note: "Cuéntanos qué animal tienes y te decimos qué hay en tienda para él antes de que vengas.",
  },
];

export type CategoryId = "alimentacion" | "higiene" | "juguetes" | "paseo" | "transporte" | "accesorios";

export const categories: {
  id: CategoryId;
  n: string;
  name: string;
  short: string;
  text: string;
  tone: string;
}[] = [
  {
    id: "alimentacion",
    n: "01",
    name: "Alimentación",
    short: "alimentación",
    text: "Pienso y comida de varias marcas para perros y gatos. Si buscas una en concreto, pregunta.",
    tone: "orange",
  },
  {
    id: "higiene",
    n: "02",
    name: "Higiene y cuidado",
    short: "higiene y cuidado",
    text: "Lo del día a día para tenerlo limpio y cuidado en casa.",
    tone: "teal",
  },
  {
    id: "juguetes",
    n: "03",
    name: "Juguetes",
    short: "juguetes",
    text: "Para morder, perseguir y entretenerse. Te ayudamos a elegir según tamaño y carácter.",
    tone: "yellow",
  },
  {
    id: "paseo",
    n: "04",
    name: "Correas y paseo",
    short: "correas y paseo",
    text: "Correas y lo necesario para salir a la calle con él.",
    tone: "blue",
  },
  {
    id: "transporte",
    n: "05",
    name: "Transportines",
    short: "transportines",
    text: "Para el veterinario, el coche o un viaje. Dinos qué animal y cuánto pesa.",
    tone: "violet",
  },
  {
    id: "accesorios",
    n: "06",
    name: "Accesorios",
    short: "accesorios",
    text: "Todo lo demás que hace falta en casa. Si no lo ves, pregunta.",
    tone: "green",
  },
];

export const perks = [
  { title: "Te atiende su dueño", text: "Cuéntale qué animal tienes, su edad o qué te preocupa, y te orienta." },
  { title: "Reparto a domicilio", text: "Pregunta zonas y condiciones al hacer tu pedido por teléfono." },
  { title: "Tarjeta y móvil", text: "Puedes pagar con tarjeta de crédito, débito o con el móvil." },
  { title: "Acceso adaptado", text: "Entrada accesible para sillas de ruedas." },
];

// Temas que se repiten en las opiniones públicas. Sin citas ni cifras.
export const praise = [
  { word: "Asesoran", text: "Lo que más se repite: te aconsejan antes de comprar." },
  { word: "Buenos precios", text: "Es de lo que más destacan sus clientes." },
  { word: "Variedad", text: "Variedad de productos y para distintos animales." },
  { word: "Buen trato", text: "Atención cercana, de tienda de barrio." },
];
