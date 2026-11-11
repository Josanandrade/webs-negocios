// Datos de la demo de Boutique de belleza MG&I.
//
// Regla de oro: aquí solo entra lo que hemos podido contrastar en fuentes
// públicas. Lo que está pendiente de confirmar con el centro se marca con
// `pendiente` y se resuelve en la reunión, no inventándolo.

export const business = {
  name: "MG&I",
  legalLabel: "Boutique de belleza MG&I",
  city: "Sevilla",
  street: "C. José María de Pereda, 3, local 2",
  postalCode: "41006",
  // Teléfono publicado en fichas públicas. Pendiente de confirmar con el centro
  // si también atienden por WhatsApp antes de activar ese canal.
  phoneDisplay: "656 86 31 07",
  phoneHref: "tel:+34656863107",
  whatsappEnabled: false,
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=C.+Jos%C3%A9+Mar%C3%ADa+de+Pereda+3+41006+Sevilla",
} as const;

export type Treatment = {
  id: string;
  name: string;
  short: string;
  kicker: string;
  body: string;
  includes: string[];
};

// Servicios que aparecen en la información pública localizada. Se presentan
// sin precios ni duraciones porque no hemos podido verificarlos.
export const treatments: Treatment[] = [
  {
    id: "cejas",
    name: "Cejas con hilo",
    short: "Cejas",
    kicker: "La firma de la casa",
    body: "Diseño y depilación de cejas con hilo. Una técnica precisa, pelo a pelo, para respetar tu forma natural y dar a la mirada la definición que busca.",
    includes: ["Estudio de la forma", "Depilación con hilo", "Acabado y perfilado"],
  },
  {
    id: "hilo-facial",
    name: "Depilación facial con hilo",
    short: "Facial con hilo",
    kicker: "Precisión sin cera",
    body: "Labio, mentón, mejillas o rostro completo. El hilo retira el vello con control y sin aplicar cera sobre la piel del rostro.",
    includes: ["Labio superior", "Mentón", "Rostro completo"],
  },
  {
    id: "facial",
    name: "Tratamientos faciales",
    short: "Facial",
    kicker: "Piel limpia, piel tranquila",
    body: "Limpieza facial con extracciones para una piel más limpia, fresca y cuidada. Te explicamos qué necesita tu piel antes de empezar.",
    includes: ["Limpieza en profundidad", "Extracciones", "Hidratación final"],
  },
  {
    id: "dermaplaning",
    name: "Dermaplaning",
    short: "Dermaplaning",
    kicker: "Luz y textura",
    body: "Exfoliación manual que retira células muertas y vello fino de la superficie. La piel queda más suave y el maquillaje se asienta mejor.",
    includes: ["Exfoliación manual", "Retirada de vello fino", "Piel lista para maquillaje"],
  },
  {
    id: "maquillaje",
    name: "Maquillaje",
    short: "Maquillaje",
    kicker: "Para el día que importa",
    body: "Maquillaje para eventos, celebraciones o una cita especial. Luminoso, pensado para tu piel y para que dure.",
    includes: ["Preparación de la piel", "Maquillaje completo", "Acabado duradero"],
  },
];

export const visitSteps = [
  {
    title: "Te escuchamos",
    body: "Qué quieres conseguir, cómo es tu rutina y qué te ha funcionado antes.",
  },
  {
    title: "Diseñamos contigo",
    body: "Forma, intensidad y acabado se deciden contigo delante del espejo.",
  },
  {
    title: "Trabajamos con calma",
    body: "Sin prisas. Atención personal de principio a fin.",
  },
  {
    title: "Te vas con pautas",
    body: "Cuidados para los días siguientes y cuándo conviene volver.",
  },
];

export const moments = [
  { id: "manana", label: "Por la mañana" },
  { id: "tarde", label: "Por la tarde" },
  { id: "flexible", label: "Me da igual" },
] as const;
