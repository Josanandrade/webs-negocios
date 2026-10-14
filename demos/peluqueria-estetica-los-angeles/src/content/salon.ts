// Contenido de la demo. Solo datos con fuente pública (ver docs/INTERNAL_AUDIT.md).
// Lo que no se ha podido confirmar no aparece o queda detrás de un flag.

export const salon = {
  name: "Los Ángeles",
  fullName: "Peluquería y Estética Los Ángeles",
  kind: "Peluquería · Estética",
  town: "Dos Hermanas",
  address: {
    street: "Av. de España, 110 N",
    postal: "41702 Dos Hermanas, Sevilla",
  },
  phone: {
    display: "601 53 66 12",
    href: "tel:+34601536612",
  },
  // El número es móvil, pero ninguna fuente confirma que atiendan por WhatsApp.
  // Activar solo cuando el salón lo confirme.
  whatsappEnabled: false,
  whatsappNumber: "34601536612",
  directionsHref:
    "https://www.google.com/maps/dir/?api=1&destination=Peluquer%C3%ADa%20y%20est%C3%A9tica%20Los%20%C3%81ngeles%2C%20Av.%20de%20Espa%C3%B1a%20110%2C%20Dos%20Hermanas",
  facebookHref: "https://www.facebook.com/trinoelid/",
  rating: {
    value: "4,6",
    // Directorios con datos de Google entre 176 y 193 reseñas: se redondea a la baja.
    countLabel: "más de 170 reseñas",
    source: "Google",
  },
} as const;

// Horario: las fuentes coinciden en viernes, sábado y domingo.
// Lunes a jueves varían (mañanas seguras; tardes y lunes, sin confirmar).
export const hours: { day: string; time: string; note?: string }[] = [
  { day: "Martes a jueves", time: "Mañanas", note: "Tardes, consultar" },
  { day: "Viernes", time: "9:30 – 20:00", note: "Sin cerrar a mediodía" },
  { day: "Sábado", time: "9:30 – 14:00" },
  { day: "Lunes", time: "Consultar" },
  { day: "Domingo", time: "Cerrado" },
];

export type ServiceGroup = {
  id: string;
  index: string;
  title: string;
  kicker: string;
  lead: string;
  items: string[];
};

export const serviceGroups: ServiceGroup[] = [
  {
    id: "corte",
    index: "01",
    title: "Corte y peinado",
    kicker: "Mujer y hombre",
    lead: "Cortes para ella y para él, y peinados para cuando el día lo pide.",
    items: ["Corte de mujer", "Corte de hombre", "Peinados", "Rizos", "Trenzas"],
  },
  {
    id: "color",
    index: "02",
    title: "Color y mechas",
    kicker: "Donde se nota el cambio",
    lead: "Desde cubrir canas hasta un balayage que ilumina sin raíz marcada.",
    items: ["Coloración", "Mechas", "Balayage"],
  },
  {
    id: "tratamientos",
    index: "03",
    title: "Tratamientos y textura",
    kicker: "Pelo sano, pelo nuevo",
    lead: "Para recuperar el pelo dañado, alisarlo, darle forma o ganar largo.",
    items: [
      "Tratamientos capilares",
      "Keratina",
      "Alisado permanente",
      "Permanente",
      "Extensiones",
    ],
  },
  {
    id: "estetica",
    index: "04",
    title: "Estética",
    kicker: "Manos, pies y piel",
    lead: "Uñas cuidadas y depilación en el mismo sitio donde te haces el pelo.",
    items: [
      "Manicura",
      "Pedicura",
      "Depilación facial y corporal",
      "Cejas con hilo",
      "Tratamientos faciales y corporales",
    ],
  },
];

// Técnicas de color para la carta interactiva. Es una ilustración de qué hace
// cada técnica, no un trabajo del salón.
export type Technique = {
  id: string;
  name: string;
  line: string;
  // Paradas de color de raíz a puntas para cada mechón.
  strands: string[][];
};

const base = ["#2a1a12", "#3a2418", "#3a2418"];
const espresso = "#2a1a12";
const chestnut = "#5a3521";
const caramel = "#a8672f";
const honey = "#d7a05a";
const sand = "#ecd2a2";
const copper = "#b4501f";
const copperLight = "#d9773a";

export const techniques: Technique[] = [
  {
    id: "natural",
    name: "Tu punto de partida",
    line: "El color que traes. A partir de aquí se decide todo lo demás.",
    strands: Array.from({ length: 9 }, () => base),
  },
  {
    id: "color",
    name: "Coloración",
    line: "Un tono uniforme de raíz a puntas. Cubre canas y cambia la base.",
    strands: Array.from({ length: 9 }, () => [copper, copper, copperLight]),
  },
  {
    id: "mechas",
    name: "Mechas",
    line: "Mechones aclarados desde la raíz que dan luz y movimiento.",
    strands: Array.from({ length: 9 }, (_, i) =>
      i % 2 === 0 ? [honey, sand, sand] : [espresso, chestnut, chestnut],
    ),
  },
  {
    id: "balayage",
    name: "Balayage",
    line: "Aclarado a mano alzada: raíz natural y puntas luminosas, sin cortes.",
    strands: Array.from({ length: 9 }, (_, i) =>
      i % 3 === 1 ? [espresso, chestnut, caramel] : [espresso, caramel, honey],
    ),
  },
];

// Temas que se repiten en las reseñas públicas, resumidos (sin copiar textos).
export const reviewThemes = [
  {
    title: "Cambios que superan lo esperado",
    body: "Clientas que llegan pidiendo un cambio grande y salen contentas con el resultado.",
  },
  {
    title: "Te aconsejan de verdad",
    body: "Recomiendan el tratamiento adecuado incluso con el pelo muy castigado.",
  },
  {
    title: "Trato de casa",
    body: "Un equipo cercano y profesional al que muchas clientas vuelven durante años.",
  },
];
