/*
  Pura Bellezza — datos de la demo.

  Regla: aquí solo entra información pública y verificable (ver README). Los textos están redactados desde cero; no se copian
  descripciones de directorios ni de plataformas.
*/

export const site = {
  name: "Pura Bellezza",
  kind: "Estética y bienestar",
  town: "Bormujos",
  province: "Sevilla",
  address: {
    street: "Av. de la Constitución, 9, local A",
    postal: "41930 Bormujos, Sevilla",
  },
  phone: {
    display: "658 90 83 27",
    href: "tel:+34658908327",
  },
  // El número es un móvil, pero no hemos confirmado que el centro atienda
  // por WhatsApp. Activarlo solo cuando el centro lo confirme.
  whatsappEnabled: false,
  instagram: {
    handle: "@purabellezza",
    href: "https://www.instagram.com/purabellezza/",
  },
  // Canal de reserva que el centro usa hoy. La demo enlaza a su ficha
  // pública; no crea citas por su cuenta.
  booking: {
    platform: "Booksy",
    href: "https://booksy.com/es-es/85273_pura-bellezza_salon-de-unas_29853_bormujos",
  },
  maps: {
    href: "https://www.google.com/maps/search/?api=1&query=Pura+Bellezza+Av.+de+la+Constituci%C3%B3n+9+Bormujos",
  },
  // Horario publicado en directorios. Pendiente de confirmar con el centro.
  hours: [
    { days: "Lunes a viernes", time: "9:00 – 20:00" },
    { days: "Sábado y domingo", time: "Cerrado" },
  ],
  rating: {
    // Booksy muestra 5,0 con entre 549 y 664 reseñas según la página
    // consultada. Usamos la cifra prudente.
    score: "5,0",
    source: "Booksy",
    count: "Más de 500 reseñas",
  },
} as const;

export type CategoryId = "rostro" | "mirada" | "manos" | "cuerpo";

export type Category = {
  id: CategoryId;
  name: string;
  intro: string;
  items: { name: string; note: string }[];
};

/*
  Carta de tratamientos. Solo servicios que aparecen en la ficha pública de
  reservas o en los directorios del centro. Sin precios: los que circulan
  proceden de fichas de terceros y no hemos podido comprobar que estén al día.
*/
export const categories: Category[] = [
  {
    id: "rostro",
    name: "Rostro",
    intro: "Piel limpia, luminosa y cuidada, con tratamientos que se adaptan a cómo está tu piel ese día.",
    items: [
      {
        name: "Higiene facial",
        note: "Limpieza profunda, extracción y una hidratación a medida. El punto de partida de cualquier rutina.",
      },
      {
        name: "Higiene con punta de diamante",
        note: "Añade una exfoliación mecánica suave que deja la piel más uniforme y receptiva.",
      },
      {
        name: "Radiofrecuencia facial",
        note: "Calor controlado para trabajar la firmeza. En sesiones de 30 o 60 minutos.",
      },
    ],
  },
  {
    id: "mirada",
    name: "Mirada",
    intro: "Pestañas y cejas trabajadas con paciencia, pensando en tu forma de ojos y no en una plantilla.",
    items: [
      {
        name: "Extensiones pelo a pelo",
        note: "Un acabado natural que realza sin que se note dónde empieza la extensión.",
      },
      {
        name: "Volumen y megavolumen",
        note: "Más densidad para quien busca una mirada intensa.",
      },
      {
        name: "Relleno de pestañas",
        note: "Mantenimiento para que tus extensiones sigan como el primer día.",
      },
      {
        name: "Diseño de cejas",
        note: "Depilación y forma pensadas para tu rostro.",
      },
    ],
  },
  {
    id: "manos",
    name: "Manos y pies",
    intro: "Manicura y pedicura con calma, cuidando la uña natural tanto como el color.",
    items: [
      {
        name: "Manicura",
        note: "Limado, cutículas e hidratación. Sencilla y bien hecha.",
      },
      {
        name: "Semipermanente con base rubber",
        note: "Color que aguanta y una base que protege la uña.",
      },
      {
        name: "Uñas acrílicas",
        note: "Primera puesta y mantenimiento, con la forma y el largo que prefieras.",
      },
      {
        name: "Pedicura",
        note: "Básica o completa, para unos pies cuidados todo el año.",
      },
    ],
  },
  {
    id: "cuerpo",
    name: "Cuerpo",
    intro: "Tratamientos corporales y masajes para sentirte bien en tu piel, sin promesas milagro.",
    items: [
      {
        name: "Radiofrecuencia corporal",
        note: "Sesiones para trabajar la firmeza de la piel en las zonas que elijas.",
      },
      {
        name: "Masajes",
        note: "Un rato para soltar tensión y desconectar de la semana.",
      },
      {
        name: "Depilación",
        note: "Con cera o con láser, según la zona y tu tipo de vello.",
      },
    ],
  },
];

/* Los cuatro tratamientos que abren la web: uno por familia. */
export const highlights: {
  category: CategoryId;
  title: string;
  line: string;
  photo: PhotoKey;
}[] = [
  {
    category: "rostro",
    title: "Higiene facial",
    line: "El ritual que tu piel agradece cada temporada.",
    photo: "facial",
  },
  {
    category: "mirada",
    title: "Pestañas pelo a pelo",
    line: "Mirada despierta sin renunciar a lo natural.",
    photo: "lashes",
  },
  {
    category: "manos",
    title: "Manicura semipermanente",
    line: "Color impecable que te dura semanas.",
    photo: "nails",
  },
  {
    category: "cuerpo",
    title: "Radiofrecuencia",
    line: "Firmeza trabajada con constancia, en rostro o cuerpo.",
    photo: "body",
  },
];

export type PhotoKey = "hero" | "facial" | "lashes" | "nails" | "body" | "space";
