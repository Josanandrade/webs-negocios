// Helena García · Beauty Salon — datos de la demo.
// Solo información encontrada en fuentes públicas (ficha de Booksy en primer
// lugar). Fuentes, conflictos y datos descartados: docs/INTERNAL_AUDIT.md.

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
  // Coinciden Páginas Amarillas, Fresha y Cylex.
  phone: { display: "644 69 43 28", href: "tel:+34644694328" },
  // No hay evidencia pública de que atiendan por WhatsApp: desactivado.
  whatsappEnabled: false,
  instagram: { handle: "@salon.helenagarcia", url: "https://www.instagram.com/salon.helenagarcia/" },
  booksyUrl: "https://booksy.com/es-es/86162_helena-garcia-beauty-salon_salon-de-unas_29853_bormujos",
  rating: { score: "5,0", reviews: "+100", source: "Booksy" },
  // Booksy indica atención solo con cita previa. El horario no se muestra
  // porque Booksy y Páginas Amarillas no coinciden.
  appointmentOnly: true,
} as const;

export type CategoryId = "unas" | "mirada" | "facial" | "depilacion";

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
// octubre de 2026). Donde las capturas no coinciden o no hay precio fiable se
// muestra "Consultar".
export const categories: Category[] = [
  {
    id: "unas",
    label: "Uñas",
    short: "Manicura y pedicura",
    intro: "Manicura rusa, semipermanente, mantenimiento y pedicura. Primero la uña sana; después, el color.",
    services: [
      { name: "Rusa express", note: "Manicura sin esmaltado", duration: "20 min", price: "12 €" },
      {
        name: "Manicura rusa con semipermanente",
        note: "Con refuerzo para que dure más",
        duration: "1 h 15 min",
      },
      { name: "Mantenimiento", note: "Cada 15 días", duration: "50 min", price: "23 €" },
      { name: "Primera visita", note: "Si vienes de otro salón", duration: "1 h", price: "30 €" },
      { name: "Pedicura básica", note: "Sin esmaltado", duration: "30 min", price: "15 €" },
      { name: "Pedicura rusa express", note: "Sin esmaltado", duration: "55 min", price: "30 €" },
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
  {
    id: "facial",
    label: "Facial",
    short: "Tratamiento facial",
    intro: "Tratamientos faciales según lo que pide tu piel: hidratación intensa o cuidado para pieles sensibles.",
    services: [
      { name: "AQUAPURE", note: "Hidratación intensiva", duration: "1 h", price: "42 €" },
      { name: "SENSASKIN", note: "Para pieles sensibles", duration: "1 h 15 min", price: "45 €" },
      { name: "Higiene facial" },
    ],
  },
  {
    id: "depilacion",
    label: "Depilación",
    short: "Depilación",
    intro: "Láser facial y corporal, por zonas o en packs, y depilación tradicional. El láser empieza con una prueba gratuita.",
    services: [
      { name: "Prueba de láser", note: "Para valorar tu piel", price: "Gratis" },
      { name: "Láser · zona pequeña", duration: "30 min", price: "7 €" },
      { name: "Láser · packs facial y corporal", duration: "40 min", price: "desde 20 €" },
      { name: "Láser · casi todo el cuerpo" },
      { name: "Depilación tradicional", note: "Facial y corporal" },
    ],
  },
];

export const featured = [
  {
    category: "unas" as CategoryId,
    kicker: "La más pedida",
    title: "Manicura rusa",
    text: "Cutícula limpia, uña perfilada y semipermanente pegado a la base. Se nota de cerca.",
    from: "desde 12 €",
    tone: "cherry",
  },
  {
    category: "mirada" as CategoryId,
    kicker: "Mirada lista",
    title: "Lifting + cejas",
    text: "Lifting de pestañas solo o en pack con laminado de cejas. Despiertas ya arreglada.",
    from: "desde 32 €",
    tone: "blush",
  },
  {
    category: "facial" as CategoryId,
    kicker: "Piel a punto",
    title: "Tratamiento facial",
    text: "Hidratación intensiva o cuidado para pieles sensibles. Una hora para tu cara.",
    from: "desde 42 €",
    tone: "lilac",
  },
  {
    category: "depilacion" as CategoryId,
    kicker: "Prueba gratis",
    title: "Depilación láser",
    text: "Facial y corporal, por zonas o en packs. Antes de empezar, probamos en tu piel.",
    from: "desde 7 €",
    tone: "butter",
  },
  {
    category: "unas" as CategoryId,
    kicker: "Pies de verano",
    title: "Pedicura",
    text: "Básica o rusa, para llevar los pies cuidados todo el año, no solo en sandalias.",
    from: "desde 15 €",
    tone: "white",
  },
  {
    category: "depilacion" as CategoryId,
    kicker: "De siempre",
    title: "Depilación con cera",
    text: "Depilación tradicional facial y corporal, para quien prefiere el método de toda la vida.",
    from: "Consultar",
    tone: "ink",
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
  "Lifting de pestañas",
  "Tratamientos faciales",
  "Pedicura",
  "Depilación láser",
  "Laminado de cejas",
  "Semipermanente",
  "Depilación con cera",
];
