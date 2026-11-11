// Contenido de la demo. Solo datos con fuente pública (ver docs/INTERNAL_AUDIT.md).
// Lo que no se ha podido confirmar (horas exactas, precios, valoraciones)
// se deja fuera o se presenta en términos genéricos.

export const business = {
  name: "Taberna Rincón de Eu",
  shortName: "Rincón de Eu",
  town: "Pilas",
  since: 1988,
  cook: "Eustaquio Sánchez, «Eu»",
  address: "Calle Murillo, 14",
  postal: "41840 Pilas, Sevilla",
  landmark: "En el centro del pueblo, junto al parque José Suárez Cuesta",
  phone: "636 38 52 71",
  phoneHref: "tel:+34636385271",
  mapsHref: "https://www.google.com/maps/dir/?api=1&destination=37.3022263,-6.3047197",
} as const;

// Recorrido de la casa, tal y como lo describen prensa y guías.
export const house = [
  {
    key: "barra",
    title: "La barra en U",
    text: "Nada más entrar, la barra con la cocina a la vista. Aquí empieza todo: se ve lo que sale y se pregunta lo que hay.",
  },
  {
    key: "saloncitos",
    title: "Los saloncitos",
    text: "Varios comedores pequeños, con vigas de madera, muebles antiguos y fotos de familia. Mesas para compartir sin prisa.",
  },
  {
    key: "patio",
    title: "El patio",
    text: "Al fondo, el patio con plantas. La parte más tranquila de una casa de pueblo convertida en taberna.",
  },
] as const;

// Platos citados en prensa gastronómica y reseñas públicas.
// No es una carta fija: en la casa no hay carta impresa y la oferta cambia
// cada día según el mercado. Sin precios.
export const sung = [
  {
    group: "Del tomate y para empezar",
    dishes: [
      "Tomate con ventresca",
      "Tomate con jamón, hierbabuena y cebolleta",
      "Anchoas de Santoña",
      "Croquetas caseras",
      "Tabla de quesos",
    ],
  },
  {
    group: "De la lonja",
    dishes: [
      "Mejillones de O Grove",
      "Boquerones",
      "Gambas rebozadas",
      "Calamares de potera",
      "Almejas de carril",
      "Bacalao con tomate",
    ],
  },
  {
    group: "De cuchara",
    dishes: [
      "Fabes",
      "Menudo",
      "Garbanzos con langostinos",
      "Habas con calamares",
      "Sangre encebollá",
    ],
  },
  {
    group: "De la carne",
    dishes: ["Presa ibérica", "Pluma", "Flamenquines", "Brochetas de solomillo", "Churrasco de bellota"],
  },
] as const;

// Lo que conviene saber antes de venir (todo con fuente pública).
export const goodToKnow = [
  {
    title: "Solo efectivo",
    text: "No se paga con tarjeta. Mejor venir con efectivo.",
  },
  {
    title: "Sin carta impresa",
    text: "Te cantan en la mesa los platos del día. Si quieres saber el precio de algo, se pregunta.",
  },
  {
    title: "Mediodías, de lunes a sábado",
    text: "Abre para almuerzos. Domingo, cerrado.",
  },
  {
    title: "Mejor con reserva",
    text: "La casa es pequeña y se llena. Reservar evita quedarse sin mesa.",
  },
  {
    title: "Para compartir",
    text: "Los platos se piden al centro, para la mesa.",
  },
  {
    title: "Casa antigua",
    text: "Varios saloncitos y pasos estrechos. Si vienes con carrito o necesitas un acceso cómodo, indícalo al reservar.",
  },
] as const;

// Turnos de mediodía de la demo. El horario exacto no está confirmado
// (las fuentes no coinciden), así que solo se muestra como ejemplo.
export const lunchSlots = ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30"] as const;
