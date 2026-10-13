// Datos de la clínica. Solo lo verificado en fuentes vinculadas al negocio
// (ficha de Google / negocio.site, web clinicaveterinariacamas.com, Instagram
// y Facebook oficiales). Detalle de fuentes y dudas: docs/INTERNAL_AUDIT.md.

export const clinic = {
  name: "Clínica Veterinaria Camas",
  short: "Veterinaria Camas",
  address: {
    street: "Calle Santa Paula, 6",
    postal: "41900",
    city: "Camas",
    province: "Sevilla",
  },
  phone: { label: "954 39 23 03", href: "tel:+34954392303" },
  whatsapp: { label: "691 30 46 13", number: "34691304613" },
  maps:
    "https://www.google.com/maps/search/?api=1&query=Cl%C3%ADnica%20Veterinaria%20Camas%2C%20Calle%20Santa%20Paula%206%2C%2041900%20Camas%2C%20Sevilla",
  appleMaps: "https://maps.apple.com/?q=Cl%C3%ADnica%20Veterinaria%20Camas&address=Calle%20Santa%20Paula%206%2C%2041900%20Camas",
  instagram: "https://www.instagram.com/clinicaveterinariacamas/",
  facebook: "https://www.facebook.com/ClinicaVeterinariaCamas/",
  rating: { value: "4,4", count: "más de 100" },
};

export function whatsappHref(text?: string) {
  const base = `https://wa.me/${clinic.whatsapp.number}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

// Horario publicado en la ficha de Google del negocio. 0 = domingo.
// Cada tramo en minutos desde medianoche.
export type Range = [open: number, close: number];
const h = (hh: number, mm = 0) => hh * 60 + mm;
const weekday: Range[] = [
  [h(10), h(13, 30)],
  [h(17), h(20)],
];

export const schedule: Record<number, Range[]> = {
  0: [],
  1: weekday,
  2: weekday,
  3: weekday,
  4: weekday,
  5: weekday,
  6: [[h(10), h(13)]],
};

export const scheduleRows = [
  { days: "Lunes a viernes", dayNums: [1, 2, 3, 4, 5], hours: ["10:00 – 13:30", "17:00 – 20:00"] },
  { days: "Sábados", dayNums: [6], hours: ["10:00 – 13:00"] },
  { days: "Domingos", dayNums: [0], hours: [] as string[] },
];

export type Service = {
  id: string;
  title: string;
  text: string;
  points?: string[];
};

// Atención del día a día.
export const everyday: Service[] = [
  {
    id: "consulta",
    title: "Consulta general",
    text: "Revisiones, dudas y ese «no lo veo como siempre». Exploramos con calma y te explicamos qué vemos y qué opciones hay.",
  },
  {
    id: "prevencion",
    title: "Vacunas y desparasitación",
    text: "Su calendario de vacunas al día y un plan contra parásitos internos, pulgas y garrapatas adaptado a cómo vive.",
  },
  {
    id: "pasaporte",
    title: "Cartilla y pasaporte",
    text: "Te ayudamos a tener su documentación sanitaria en orden y a pasar de la cartilla antigua al pasaporte.",
  },
  {
    id: "peluqueria",
    title: "Peluquería canina y felina",
    text: "Baño, corte y arreglo para perros y gatos, en el mismo sitio donde ya conocen su historial.",
  },
];

// Consultas por área, tal como las presenta la propia clínica.
export const areas: Service[] = [
  {
    id: "cirugia",
    title: "Cirugía",
    text: "Valoramos cada caso, te explicamos la intervención y el postoperatorio antes de decidir nada.",
  },
  {
    id: "cardiologia",
    title: "Cardiología",
    text: "Seguimiento del corazón en animales mayores o con soplos, toses o cansancio que llaman la atención.",
  },
  {
    id: "dermatologia",
    title: "Dermatología",
    text: "Picores, rojeces, caída de pelo u otitis que vuelven. Buscamos la causa, no solo calmar el síntoma.",
  },
  {
    id: "odontologia",
    title: "Odontología",
    text: "Revisión de boca y limpieza dental, con valoración previa a la anestesia.",
  },
  {
    id: "oftalmologia",
    title: "Oftalmología",
    text: "Ojos rojos, legañas, párpados, úlceras de córnea, cataratas o glaucoma.",
  },
  {
    id: "reproduccion",
    title: "Reproducción",
    text: "Estudio de fertilidad y acompañamiento en gestación y parto.",
    points: ["Citología vaginal", "Estudios hormonales", "Ecografía", "Evaluación del esperma"],
  },
  {
    id: "comportamiento",
    title: "Comportamiento",
    text: "Miedos, ansiedad, marcaje o convivencia complicada. El equipo tiene amplia experiencia en etología.",
  },
];

export const whenToCome = [
  { title: "Come o bebe distinto", text: "Cambios de apetito o de sed que duran más de un par de días." },
  { title: "Se rasca sin parar", text: "Picor, rojeces, calvas o se lame mucho una misma zona." },
  { title: "Sus ojos o sus orejas", text: "Lagrimeo, legañas, ojos rojos, mal olor o sacude la cabeza." },
  { title: "Mal aliento", text: "O le cuesta masticar, o mastica solo por un lado." },
  { title: "Cojea o le cuesta moverse", text: "Sobre todo si no mejora en uno o dos días." },
  { title: "Está más apagado", text: "Duerme más, juega menos o se esconde. Tú lo conoces mejor que nadie." },
];

export const firstVisit = [
  {
    title: "Pide cita",
    text: "Por teléfono o WhatsApp. Cuéntanos qué animal es y el motivo, y te damos hueco.",
  },
  {
    title: "Trae lo que tengas",
    text: "Cartilla o pasaporte, informes anteriores y el nombre de su pienso o medicación.",
  },
  {
    title: "Exploración sin prisas",
    text: "Le conocemos, le revisamos de arriba abajo y respondemos a todas tus dudas.",
  },
  {
    title: "Te vas con un plan",
    text: "Vacunas, desparasitación, alimentación y cuándo volver. Todo explicado con claridad.",
  },
];

export const faqs = [
  {
    q: "¿Atendéis urgencias?",
    a: "Dentro de nuestro horario, llámanos y te diremos cómo actuar y si puedes venir directamente. Fuera de horario, acude a un servicio de urgencias veterinarias 24 horas.",
  },
  {
    q: "¿Necesito pedir cita?",
    a: "Sí, te recomendamos pedirla por teléfono o WhatsApp. Así te esperamos y el rato en la sala es más corto para ti y para tu animal.",
  },
  {
    q: "¿Qué animales atendéis?",
    a: "Perros y gatos. Si tienes otra especie, llámanos antes y te orientamos.",
  },
  {
    q: "Tengo un cachorro o un gatito nuevo, ¿cuándo voy?",
    a: "Cuanto antes, mejor. En la primera revisión le exploramos, empezamos su calendario de vacunas y desparasitación y te aconsejamos sobre alimentación y educación básica.",
  },
  {
    q: "¿Cómo llevo a mi gato si se estresa?",
    a: "En transportín cerrado, con una manta que huela a casa y, si puedes, deja el transportín a la vista unos días antes para que se acostumbre.",
  },
];
