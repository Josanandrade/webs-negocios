// Fuente única de datos de la demo de Centro Jalis.
// Todo lo que aparece aquí procede de fuentes públicas (perfil de reservas en
// Booksy, Fresha, página de Facebook "centrojalis" y directorios locales),
// consultadas en octubre de 2026. Ver /propuesta para el detalle de fuentes y
// lo que se ha descartado. Nada de lo que no está aquí debe darse por cierto.

export const site = {
  name: "Jalis",
  fullName: "Jalis · Centro de belleza y bienestar",
  town: "Castilleja de la Cuesta",
  // Respuesta del propio centro en Booksy: "llevamos ya más de 18 años"
  // (otra respuesta habla de 20). Usamos la cifra prudente.
  years: 18,
  address: {
    street: "Calle Zambra, locales 6 y 7",
    corner: "Acceso también por C/ Seguirilla, local 7",
    postal: "41950 Castilleja de la Cuesta, Sevilla",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Jalis+centro+de+belleza+Calle+Zambra+Castilleja+de+la+Cuesta",
  },
  phone: { display: "695 91 58 37", href: "tel:+34695915837" },
  landline: { display: "954 16 23 78", href: "tel:+34954162378" },
  email: "centrojalis@gmail.com",
  // WhatsApp sin confirmar: el botón no se muestra hasta que el centro lo valide.
  whatsappEnabled: false,
  booksyUrl:
    "https://booksy.com/es-es/47664_centro-jalis_cuidado-de-la-piel_29868_castilleja-de-la-cuesta",
  facebookUrl: "https://www.facebook.com/centrojalis/",
  // Horario publicado en directorios (coinciden dos fuentes). A confirmar.
  hours: [
    { days: "Lunes", time: "16:00 – 20:00" },
    { days: "Martes a viernes", time: "9:00 – 19:00" },
    { days: "Sábado y domingo", time: "Cerrado" },
  ],
  ratings: [
    { value: "5,0", source: "Booksy", detail: "141 reseñas" },
    { value: "4,9", source: "Google", detail: "media publicada" },
  ],
} as const;

export type Treatment = {
  name: string;
  note?: string;
  duration?: string;
  price?: string;
};

export type Area = {
  id: string;
  index: string;
  name: string;
  lede: string;
  items: Treatment[];
};

// Precios: los publicados en su perfil de Booksy. Son referencia y pueden
// haber cambiado; la web real los leería del centro o los omitiría.
export const areas: Area[] = [
  {
    id: "facial",
    index: "01",
    name: "Facial",
    lede:
      "De la higiene bien hecha a la aparatología: protocolos que se adaptan al tipo de piel y a lo que cada una necesita en cada momento.",
    items: [
      { name: "Higiene facial", price: "45 €" },
      { name: "Higiene spa", note: "Con masaje de manos o pies", price: "50 €" },
      { name: "Higiene + tratamiento", note: "Según tipo de piel", price: "60 €" },
      {
        name: "Tratamiento estrella",
        note: "Cinco técnicas en una sesión",
        price: "80 €",
      },
      { name: "Radiofrecuencia facial", duration: "1 h", price: "65 €" },
      { name: "Dermapen", note: "Solo o combinado en bono" },
      { name: "Dermaplaning" },
      { name: "Microdermoabrasión" },
      { name: "Exfoliación química" },
      { name: "Tratamiento para piel con acné" },
    ],
  },
  {
    id: "corporal",
    index: "02",
    name: "Corporal",
    lede:
      "Tratamientos para celulitis, grasa localizada y flacidez con aparatología específica, organizados en bonos para trabajar con constancia.",
    items: [
      {
        name: "Remodelación corporal",
        note: "Celulitis, grasa localizada y flacidez · bono de 3 sesiones",
        price: "120 €",
      },
      { name: "Tratamiento corporal Ártico", duration: "1 h 30 min", price: "80 €" },
      { name: "Higiene de espalda", price: "40 €" },
      { name: "Presoterapia", note: "Consultar disponibilidad" },
    ],
  },
  {
    id: "depilacion",
    index: "03",
    name: "Depilación",
    lede:
      "Láser para resultados a largo plazo, cera e hilo para el día a día. Cada zona, con la técnica que mejor le va.",
    items: [
      { name: "Láser · axilas", duration: "10 min", price: "25 €" },
      { name: "Láser · brazos", duration: "30 min", price: "60 €" },
      { name: "Láser · piernas completas", duration: "45 min", price: "100 €" },
      { name: "Láser facial", note: "Por zonas" },
      { name: "Cera · axilas", duration: "15 min", price: "8 €" },
      { name: "Cejas", duration: "15 min", price: "8 €" },
      { name: "Depilación con hilo" },
    ],
  },
  {
    id: "manos",
    index: "04",
    name: "Manos y pies",
    lede:
      "Manicura y pedicura con el mismo cuidado que el resto de la carta: técnica limpia, acabados duraderos y tiempo suficiente para hacerlo bien.",
    items: [
      { name: "Manicura tradicional", note: "Sin esmaltado", duration: "40 min", price: "12 €" },
      { name: "Manicura semipermanente" },
      {
        name: "Rubber + pedicura semipermanente",
        note: "Solo esmaltado",
        duration: "2 h 10 min",
        price: "45 €",
      },
      {
        name: "Gel + pedicura semipermanente",
        note: "Solo esmaltado",
        duration: "2 h 25 min",
        price: "55 €",
      },
      {
        name: "Rubber + pedicura completa",
        note: "Esmaltado y durezas",
        duration: "2 h 30 min",
        price: "55 €",
      },
    ],
  },
  {
    id: "mirada",
    index: "05",
    name: "Mirada y maquillaje",
    lede:
      "Cejas diseñadas para tu rostro y maquillaje para los días que importan, también el de la boda.",
    items: [
      { name: "Diseño de cejas + depilación", duration: "20 min", price: "10 €" },
      { name: "Cejas + bozo", duration: "15 min", price: "8,50 €" },
      { name: "Maquillaje" },
      { name: "Maquillaje de novia" },
    ],
  },
];

// Pasos del "Tratamiento estrella", tal y como lo describe el centro.
export const signatureSteps = [
  { name: "Higiene", text: "Limpieza profunda como base de todo lo demás." },
  { name: "Espátula ultrasónica", text: "Renovación suave de la superficie de la piel." },
  { name: "Dermapen", text: "Estímulo controlado para trabajar textura y luminosidad." },
  { name: "Radiofrecuencia", text: "Calor profundo orientado a la firmeza." },
  { name: "Masaje", text: "Cierre relajante para terminar la sesión." },
];

export const pillars = [
  {
    title: "Oficio",
    text:
      "Más de dieciocho años en la calle Zambra, con clientas que vuelven y lo recomiendan.",
  },
  {
    title: "Técnica",
    text:
      "Radiofrecuencia, dermapen o láser conviven con la cosmética manual de siempre. Se elige lo que tu piel necesita, no lo que está de moda.",
  },
  {
    title: "Trato",
    text:
      "Es lo que más repiten sus reseñas: atención cercana, sin prisas y con cuidado en cada detalle.",
  },
];

export const visitSteps = [
  {
    title: "Reserva a tu manera",
    text: "Online a cualquier hora o por teléfono en horario del centro.",
  },
  {
    title: "Cuéntanos qué buscas",
    text: "Si dudas entre tratamientos, el equipo te orienta antes de empezar.",
  },
  {
    title: "Tu sesión, sin prisas",
    text: "Cabina preparada y el tiempo que el tratamiento necesita.",
  },
  {
    title: "Continuidad con bonos",
    text: "Para lo que funciona por sesiones, bonos que hacen el plan más cómodo.",
  },
];

// Temas recurrentes en las reseñas públicas. Solo se cita textualmente lo
// verificado; el resto se presenta como tema, no como cita.
export const reviewThemes = [
  {
    title: "El trato",
    text: "La atención cercana es lo primero que destacan quienes valoran el centro.",
    quote: "Trato excelente",
    source: "Reseña en Booksy · láser facial",
  },
  {
    title: "La profesionalidad",
    text: "Se valora que cada servicio lo haga alguien que domina la técnica.",
    quote: "Profesionales al 100 %",
    source: "Reseña en Booksy · láser facial",
  },
  {
    title: "El detalle",
    text: "Cejas, cera o facial: el cuidado en cada paso aparece una y otra vez.",
  },
];
