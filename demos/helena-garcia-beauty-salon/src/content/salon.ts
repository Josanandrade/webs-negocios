// Helena García · Beauty Salon — datos de la demo.
// Solo información encontrada en fuentes públicas (Booksy, Páginas Amarillas,
// Cylex, Instagram). Lo que no está confirmado lleva `verify: true` y aparece
// en /propuesta como pendiente de validar con el salón.

export const salon = {
  name: "Helena García",
  tagline: "Beauty Salon",
  town: "Bormujos",
  address: {
    line1: "Av. del Aljarafe, 65",
    line2: "Edificio Cerro Colarte · Local 12",
    city: "41930 Bormujos, Sevilla",
  },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Av.+del+Aljarafe+65+Cerro+Colarte+Bormujos",
  // Cylex. Páginas Amarillas recoge además un fijo (955 712 105). A confirmar.
  phone: { display: "644 69 43 28", href: "tel:+34644694328", verify: true },
  // No hay evidencia pública de que atiendan por WhatsApp: desactivado.
  whatsappEnabled: false,
  instagram: { handle: "@salon.helenagarcia", url: "https://www.instagram.com/salon.helenagarcia/" },
  booksyUrl: "https://booksy.com/es-es/86162_helena-garcia-beauty-salon_salon-de-unas_29853_bormujos",
  rating: { score: "5,0", reviews: "+100", source: "Booksy" },
  // Páginas Amarillas. A confirmar.
  hours: [
    { days: "Lunes a viernes", time: "10:00–15:00 · 17:00–20:00" },
    { days: "Sábado", time: "10:00–14:00" },
    { days: "Domingo", time: "Cerrado" },
  ],
} as const;

export type CategoryId = "manos" | "pies" | "laser" | "mirada";

export type Service = {
  name: string;
  note?: string;
  duration?: string;
  price?: string; // texto ya formateado; sin precio → "Consultar"
};

export type Category = {
  id: CategoryId;
  label: string;
  short: string;
  intro: string;
  services: Service[];
};

// Precios y duraciones de referencia publicados en Booksy (consultados en
// octubre de 2026). Las capturas de Booksy no siempre coinciden entre sí; donde
// había contradicción se muestra "Consultar".
export const categories: Category[] = [
  {
    id: "manos",
    label: "Manos",
    short: "Manicura",
    intro: "Manicura rusa, semipermanente y mantenimiento. Primero la uña sana; después, el color.",
    services: [
      { name: "Rusa express", note: "Sin esmaltado", duration: "20 min", price: "12 €" },
      {
        name: "Manicura rusa con semipermanente",
        note: "Con refuerzo para que dure más",
        duration: "1 h 15 min",
      },
      { name: "Mantenimiento", note: "Cada 15 días", duration: "50 min", price: "23 €" },
      {
        name: "Primera visita",
        note: "Si vienes de otro salón",
        duration: "1 h",
        price: "30 €",
      },
      { name: "Retirada de semipermanente", price: "desde 8 €" },
      { name: "Diseño en uñas largas", note: "Extra sobre tu manicura", price: "desde 10 €" },
    ],
  },
  {
    id: "pies",
    label: "Pies",
    short: "Pedicura",
    intro: "Pedicura básica o rusa, con o sin esmaltado. Pies cuidados todo el año.",
    services: [
      { name: "Pedicura básica", note: "Sin esmaltado", duration: "30 min", price: "15 €" },
      { name: "Pedicura rusa express", note: "Sin esmaltado", duration: "55 min", price: "30 €" },
    ],
  },
  {
    id: "laser",
    label: "Láser",
    short: "Depilación láser",
    intro: "Depilación láser facial y corporal, por zonas o en packs. Empieza con una prueba gratuita.",
    services: [
      { name: "Prueba de láser", note: "Para valorar tu piel", price: "Gratis" },
      { name: "Zona pequeña", duration: "30 min", price: "7 €" },
      { name: "Packs facial y corporal", duration: "40 min", price: "desde 20 €" },
      { name: "Casi todo el cuerpo" },
      { name: "Depilación tradicional" },
    ],
  },
  {
    id: "mirada",
    label: "Mirada",
    short: "Pestañas y cejas",
    intro: "Lifting de pestañas y laminado de cejas para una mirada despierta sin maquillaje.",
    services: [
      { name: "Lifting de pestañas", duration: "1 h 30 min", price: "32 €" },
      {
        name: "Pack Glamor",
        note: "Lifting de pestañas + laminado de cejas",
        duration: "1 h 30 min",
        price: "52 €",
      },
    ],
  },
];

export const featured = [
  {
    category: "manos" as CategoryId,
    kicker: "La más pedida",
    title: "Manicura rusa",
    text: "Cutícula limpia, uña perfilada y semipermanente pegado a la base. Se nota de cerca.",
    from: "desde 12 €",
    tone: "cherry",
  },
  {
    category: "manos" as CategoryId,
    kicker: "Cada 15 días",
    title: "Mantenimiento",
    text: "Tus uñas siempre a punto, sin esperar a que se estropeen. Agenda fija y listo.",
    from: "23 €",
    tone: "butter",
  },
  {
    category: "laser" as CategoryId,
    kicker: "Prueba gratis",
    title: "Depilación láser",
    text: "Facial y corporal, por zonas o en packs. Antes de empezar, probamos en tu piel.",
    from: "desde 7 €",
    tone: "lilac",
  },
  {
    category: "mirada" as CategoryId,
    kicker: "Mirada lista",
    title: "Lifting + cejas",
    text: "Lifting de pestañas solo o en pack con laminado de cejas. Despiertas ya arreglada.",
    from: "desde 32 €",
    tone: "blush",
  },
] as const;

// Fragmentos breves de reseñas públicas en Booksy (sin nombre de la autora).
// Antes de publicar: pedir permiso o enlazar a la reseña original.
export const reviews = [
  { quote: "Ha tenido siempre en cuenta la salud de mi uña.", topic: "Manicura" },
  { quote: "Una gran profesional.", topic: "Atención" },
  { quote: "Resultado increíble.", topic: "Lifting de pestañas" },
] as const;

export const marquee = [
  "Manicura rusa",
  "Semipermanente",
  "Mantenimiento 15 días",
  "Pedicura",
  "Depilación láser",
  "Lifting de pestañas",
  "Laminado de cejas",
];
