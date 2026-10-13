// Datos del centro usados en la demo. Fuente única: si un dato no está aquí,
// la web no lo muestra.
//
// Solo se incluye lo que aparece en la web actual del centro (abepa.es) o de
// forma coincidente en varias fichas públicas. Horario, tarifas, nº de reseñas
// y especialidades que solo citan los directorios quedan fuera hasta que el
// centro las confirme. Ver README.md («Información verificada»).

export const site = {
  name: "Centro Abepa",
  legalName: "Abepa Psicólogos y Logopedas",
  descriptor: "Psicólogos y logopedas",
  city: "Tomares",
  province: "Sevilla",
  years: "Más de 20 años",
  address: {
    street: "Av. de los Olivos, 25",
    postalCode: "41940",
    locality: "Tomares, Sevilla",
  },
  phones: [
    { label: "Teléfono", display: "954 15 19 54", href: "tel:+34954151954" },
    { label: "Móvil", display: "637 70 64 47", href: "tel:+34637706447" },
  ],
  email: "secretaria@abepa.es",
  // Enlace de búsqueda: no incrusta mapas ni carga nada de terceros.
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Abepa Psicólogos y Logopedas, Av. de los Olivos 25, 41940 Tomares"),
} as const;

export const primaryPhone = site.phones[0];

export const nav = [
  { href: "#areas", label: "Áreas" },
  { href: "#para-quien", label: "A quién ayudamos" },
  { href: "#primera-cita", label: "Primera cita" },
  { href: "#equipo", label: "Equipo" },
  { href: "#preguntas", label: "Preguntas" },
] as const;

export type AreaId = "psicologia" | "logopedia" | "pedagogia";

export type Area = {
  id: AreaId;
  name: string;
  short: string;
  lead: string;
  ages: string;
  topics: { title: string; detail: string }[];
};

// Temas tomados de las páginas de cada área en abepa.es, reescritos en
// lenguaje llano. No se añade nada que el centro no publique.
export const areas: Area[] = [
  {
    id: "psicologia",
    name: "Psicología",
    short: "Emociones, conducta y desarrollo",
    lead:
      "Un espacio para entender lo que está pasando —en un niño, en un adolescente o en ti— y encontrar una forma de manejarlo que funcione en el día a día.",
    ages: "Infancia, adolescencia y adultos",
    topics: [
      { title: "Bienestar emocional", detail: "Cuando el malestar, la preocupación o el ánimo bajo empiezan a pesar más de la cuenta." },
      { title: "Conducta", detail: "Rabietas que no ceden, conflictos que se repiten en casa o en clase." },
      { title: "Desarrollo", detail: "Dudas sobre si un niño o una niña avanza a su ritmo." },
      { title: "Alimentación", detail: "Una relación con la comida que preocupa." },
      { title: "Cuerpo y emoción", detail: "Molestias físicas en las que el estrés tiene mucho que ver." },
      { title: "Sexualidad y personalidad", detail: "Acompañamiento en terapia sexual y en dificultades de la personalidad." },
    ],
  },
  {
    id: "logopedia",
    name: "Logopedia",
    short: "Habla, lenguaje, lectura y voz",
    lead:
      "Valoración y tratamiento de la voz, el habla y el lenguaje, oral y escrito. Para niños, adolescentes y también personas adultas.",
    ages: "Infancia, adolescencia y adultos",
    topics: [
      { title: "Pronunciación", detail: "Sonidos que cuesta articular (dislalias)." },
      { title: "Lenguaje", detail: "Dificultades para comprender o para expresarse." },
      { title: "Lectura y escritura", detail: "Dislexia y retraso lector." },
      { title: "Fluidez", detail: "Tartamudez (disfemia) y ritmo del habla." },
      { title: "Voz", detail: "Ronquera, fatiga o cambios en la voz (disfonía)." },
    ],
  },
  {
    id: "pedagogia",
    name: "Pedagogía",
    short: "Aprendizaje y estudio",
    lead:
      "Apoyo al rendimiento académico desde el inicio de la escolarización hasta el final de los estudios, con evaluación y seguimiento continuo.",
    ages: "Etapa escolar y estudios",
    topics: [
      { title: "Evaluación psicopedagógica", detail: "Para saber por qué cuesta aprender y por dónde empezar." },
      { title: "Hábitos y técnicas de estudio", detail: "Organización, planificación y método." },
      { title: "Memoria y concentración", detail: "Estrategias concretas para estudiar mejor." },
      { title: "Atención e hiperactividad", detail: "Apoyo escolar a alumnado con TDAH, dificultades de aprendizaje o TEA." },
      { title: "Volver a estudiar", detail: "Acompañamiento a quien dejó los estudios y quiere retomarlos." },
    ],
  },
];

export type Audience = {
  id: string;
  tab: string;
  title: string;
  body: string;
  signals: string[];
  areas: AreaId[];
};

// Público verificado: la logopedia del centro atiende a niños, adolescentes y
// adultos; la pedagogía cubre toda la etapa escolar.
export const audiences: Audience[] = [
  {
    id: "infancia",
    tab: "Infancia",
    title: "Vienes por tu hijo o tu hija",
    body:
      "Muchas familias llegan con una duda más que con un diagnóstico. Está bien así: os escuchamos, observamos y os decimos con claridad qué vemos y qué recomendamos.",
    signals: [
      "Le cuesta pronunciar algunos sonidos o hacerse entender",
      "Aprender a leer y escribir se le está haciendo cuesta arriba",
      "Notáis cambios en su conducta o en cómo gestiona lo que siente",
      "Os preguntáis si su desarrollo va a su ritmo",
    ],
    areas: ["logopedia", "psicologia", "pedagogia"],
  },
  {
    id: "adolescencia",
    tab: "Adolescencia",
    title: "Etapa escolar y adolescencia",
    body:
      "Los estudios, las emociones y la relación con la familia se mezclan mucho en estos años. Contar con psicología y pedagogía en el mismo sitio ayuda a mirar el conjunto.",
    signals: [
      "Estudia, pero las notas no acompañan",
      "Le cuesta organizarse, concentrarse o memorizar",
      "Atención e hiperactividad que afectan en clase",
      "Ansiedad, ánimo bajo o una relación difícil con la comida",
    ],
    areas: ["pedagogia", "psicologia", "logopedia"],
  },
  {
    id: "adultos",
    tab: "Adultos",
    title: "Vienes por ti",
    body:
      "Abepa no es solo un centro infantil. También atendemos a personas adultas, en psicología y en logopedia, con la misma cercanía.",
    signals: [
      "Una temporada de malestar que no termina de pasar",
      "Estrés que se nota también en el cuerpo",
      "Cambios en la voz o fatiga al hablar",
      "Tartamudez que sigue presente en la edad adulta",
    ],
    areas: ["psicologia", "logopedia"],
  },
];

// Equipo tal y como aparece en la web actual del centro. Confirmar que sigue
// vigente antes de publicar (ver README_ASSETS.md para fotos).
export const team = [
  { name: "Paloma Megina", role: "Psicóloga colegiada", area: "psicologia" },
  { name: "Javier Rodríguez Pineda", role: "Psicólogo general sanitario colegiado", area: "psicologia" },
  { name: "Eugenia Moreno", role: "Logopeda colegiada", area: "logopedia" },
  { name: "Carmen Moreno", role: "Psicopedagoga", area: "pedagogia" },
  { name: "Elena Pérez", role: "Maestra de educación infantil", area: "pedagogia" },
] as const satisfies readonly { name: string; role: string; area: AreaId }[];

// Proceso de primera cita: redacción comercial genérica, a validar con el
// centro antes de publicar.
export const steps = [
  {
    title: "Nos llamas o nos escribes",
    body: "Cuéntanos brevemente qué os preocupa. Si no sabes si es cosa de psicología, logopedia o pedagogía, no pasa nada: para eso estamos.",
  },
  {
    title: "Primera entrevista",
    body: "Un rato con calma para escuchar, preguntar y conocer la historia. Si traes informes anteriores, nos ayudan.",
  },
  {
    title: "Valoración",
    body: "Cuando hace falta, una evaluación para tener una imagen clara antes de proponer nada.",
  },
  {
    title: "Plan y seguimiento",
    body: "Os explicamos qué proponemos, quién del equipo lo llevará y cómo iremos viendo los avances.",
  },
] as const;

export const faqs = [
  {
    q: "¿Cómo sé si necesito psicólogo, logopeda o pedagogo?",
    a: "No hace falta saberlo para llamar. En la primera conversación te orientamos y te decimos qué profesional del equipo encaja mejor con lo que necesitáis.",
  },
  {
    q: "¿Atendéis también a personas adultas?",
    a: "Sí. Psicología y logopedia atienden a niños, adolescentes y adultos.",
  },
  {
    q: "¿Las sesiones son presenciales?",
    a: "Atendemos en el centro, en Tomares. Algunas sesiones pueden hacerse online: pregúntanos si es una opción en tu caso.",
  },
  {
    q: "¿Qué llevo a la primera cita?",
    a: "Nada imprescindible. Si tienes informes del colegio, del pediatra o de otros profesionales, tráelos: nos ayudan a entender el punto de partida.",
  },
  {
    q: "¿Cuánto cuesta y cuál es el horario?",
    a: "Te lo indicamos por teléfono o por correo, según el tipo de sesión y el profesional.",
  },
] as const;
