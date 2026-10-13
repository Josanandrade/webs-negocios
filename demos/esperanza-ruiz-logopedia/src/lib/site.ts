// Datos del negocio. Todo lo que aparece aquí está contrastado en fuentes
// públicas (web oficial esperanzaruizlogopedia.com y su ficha de Doctoralia)
// a fecha de octubre de 2026. Lo que NO se ha podido verificar se deja fuera
// a propósito (ver README.md → "Datos dudosos").

export const site = {
  name: "Centro de Logopedia Esperanza Ruiz",
  shortName: "Esperanza Ruiz",
  professional: "Esperanza Ruiz Naranjo",
  // Nº de colegiada publicado en la web oficial y en Doctoralia.
  collegiate: "29/1210",
  phone: "625 903 387",
  phoneHref: "tel:+34625903387",
  email: "esperanzaruiz78@gmail.com",
  address: {
    building: "Edificio Cristina",
    street: "Paseo de las Delicias, 1",
    postalCode: "41001",
    city: "Sevilla",
    // La web oficial lo sitúa junto a Puerta Jerez, el Metro y el parking.
    landmark: "Junto a Puerta Jerez",
  },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Centro+de+Logopedia+Esperanza+Ruiz+Paseo+de+las+Delicias+1+Sevilla",
  reviewsUrl: "https://www.google.com/search?q=Centro+de+Logopedia+Esperanza+Ruiz+Sevilla+opiniones",
  officialUrl: "https://www.esperanzaruizlogopedia.com/",
  // Puntuación media coincidente en todos los directorios consultados.
  // El recuento de reseñas varía entre fuentes, así que no se muestra.
  rating: 5,
} as const;

export const assetBase = "/assets/esperanza-ruiz-logopedia";

export type AreaId = "habla" | "lenguaje" | "voz" | "orofacial" | "alimentacion" | "neuro";

export type Area = {
  id: AreaId;
  title: string;
  /** Nombre clínico tal y como lo publica el centro. */
  clinical: string;
  summary: string;
  signs: string[];
  forWhom: ("infancia" | "adultos" | "neuro")[];
};

export const areas: Area[] = [
  {
    id: "habla",
    title: "Habla y pronunciación",
    clinical: "Alteraciones del habla",
    summary:
      "Cuando algunos sonidos no salen como deberían, el mensaje se entiende peor y hablar puede empezar a dar vergüenza.",
    signs: [
      "Le cuesta pronunciar determinados sonidos, como la r o la s",
      "Cambia unos sonidos por otros o se los salta",
      "A las personas de fuera les cuesta entenderle",
    ],
    forWhom: ["infancia", "adultos"],
  },
  {
    id: "lenguaje",
    title: "Comprender y expresarse",
    clinical: "Comprensión y expresión del lenguaje",
    summary:
      "Encontrar las palabras, ordenar una frase o entender lo que se le pide son la base para comunicarse, aprender y relacionarse.",
    signs: [
      "Habla menos de lo esperado para su edad",
      "Le cuesta construir frases o contar lo que le ha pasado",
      "Parece no entender bien instrucciones o preguntas",
    ],
    forWhom: ["infancia", "adultos", "neuro"],
  },
  {
    id: "voz",
    title: "Voz",
    clinical: "Alteraciones de la voz",
    summary:
      "La voz es una herramienta de trabajo y de relación. Cuando se cansa o cambia, conviene cuidarla a tiempo.",
    signs: [
      "Ronquera que no termina de irse",
      "La voz se cansa o se apaga al final del día",
      "Notas esfuerzo o molestias al hablar",
    ],
    forWhom: ["adultos", "infancia"],
  },
  {
    id: "orofacial",
    title: "Boca, lengua y ortodoncia",
    clinical: "Anomalías dento-faciales y ortodoncia",
    summary:
      "La posición de la lengua y los labios influye en cómo hablamos, tragamos y en la estabilidad de un tratamiento de ortodoncia.",
    signs: [
      "Respira por la boca o la mantiene abierta",
      "Empuja los dientes con la lengua al tragar",
      "Su ortodoncista recomienda apoyo de logopedia",
    ],
    forWhom: ["infancia", "adultos"],
  },
  {
    id: "alimentacion",
    title: "Masticar y tragar",
    clinical: "Alteraciones de la alimentación: masticación y deglución atípica",
    summary:
      "Masticar y tragar bien es salud y también calidad de vida. Se trabaja con ejercicios concretos y pautas para el día a día.",
    signs: [
      "Mastica poco o evita ciertas texturas",
      "Traga de forma poco eficaz o con esfuerzo",
      "La lengua no se coloca bien al tragar",
    ],
    forWhom: ["infancia", "adultos", "neuro"],
  },
  {
    id: "neuro",
    title: "Tras un daño neurológico",
    clinical: "Daño neurológico: afasias, disartrias, Parkinson, ELA, ictus",
    summary:
      "Después de un ictus o con una enfermedad neurológica, la comunicación puede cambiar. Se trabaja para mantener y recuperar autonomía.",
    signs: [
      "Tras un ictus le cuesta encontrar palabras o entender",
      "El habla se ha vuelto lenta, débil o poco clara",
      "Convive con Parkinson o ELA y la comunicación se resiente",
    ],
    forWhom: ["neuro", "adultos"],
  },
];

export const audiences = [
  {
    id: "infancia",
    eyebrow: "Para familias",
    title: "Tu hijo o tu hija",
    text: "Si algo en su forma de hablar, entender o comer te preocupa, una valoración te ayuda a saber si hay que intervenir y cómo acompañarle en casa.",
    areas: ["habla", "lenguaje", "orofacial", "alimentacion"] as AreaId[],
  },
  {
    id: "adultos",
    eyebrow: "Para adultos",
    title: "Tú mismo o tú misma",
    text: "La voz que se cansa, una pronunciación que te acompaña desde siempre o una ortodoncia que necesita apoyo. Nunca es tarde para trabajarlo.",
    areas: ["voz", "habla", "orofacial", "alimentacion"] as AreaId[],
  },
  {
    id: "neuro",
    eyebrow: "Daño neurológico",
    title: "Un familiar tras un ictus o con una enfermedad neurológica",
    text: "Acompañamos a la persona y a quienes la cuidan para recuperar, mantener y adaptar la comunicación y la deglución.",
    areas: ["neuro", "alimentacion", "lenguaje"] as AreaId[],
  },
] as const;

export const steps = [
  {
    title: "Nos cuentas qué ocurre",
    text: "Una llamada o un mensaje para entender el motivo de consulta y orientarte sobre la primera cita.",
  },
  {
    title: "Valoración",
    text: "Pruebas y observación para entender qué pasa exactamente y desde dónde partimos. Si tienes informes previos, tráelos.",
  },
  {
    title: "Plan claro",
    text: "Te explicamos qué vamos a trabajar, con qué objetivos y cómo puedes ayudar fuera de la consulta.",
  },
  {
    title: "Tratamiento y seguimiento",
    text: "Sesiones adaptadas a cada persona y revisión de la evolución, contando con la familia y con otros profesionales cuando hace falta.",
  },
] as const;

// Temas que se repiten en las valoraciones públicas consultadas (directorios
// y fichas de reseñas). Son resúmenes, no citas literales.
export const reviewThemes = [
  { title: "Trato cercano", text: "Pacientes y familias destacan la paciencia y la calidez en cada sesión." },
  { title: "Eficacia", text: "Se repite el agradecimiento por la evolución conseguida durante el tratamiento." },
  { title: "Confianza de las familias", text: "Madres y padres hablan de la suerte de haber dado con ella." },
  { title: "Flexibilidad", text: "Facilidades para encajar las sesiones en el horario de cada familia." },
] as const;

export const faqs = [
  {
    q: "¿Atendéis a niños y también a adultos?",
    a: "Sí. El centro trabaja con la infancia, con adultos y con personas que han sufrido un daño neurológico. En la primera llamada te orientamos según el caso.",
  },
  {
    q: "No sé si lo que le pasa necesita logopedia. ¿Qué hago?",
    a: "Llama y cuéntalo. Muchas consultas empiezan con una duda, y una valoración sirve precisamente para salir de ella.",
  },
  {
    q: "¿Necesito informe médico para pedir cita?",
    a: "No es imprescindible para pedir una valoración. Si tienes informes del pediatra, neurólogo, otorrino u ortodoncista, tráelos: ayudan a afinar el plan.",
  },
  {
    q: "¿Trabajáis con mutuas o seguros?",
    a: "La atención es privada. Consúltanos por teléfono las condiciones y tarifas actualizadas.",
  },
  {
    q: "¿Es posible hacer alguna sesión online?",
    a: "En algunos casos puede valorarse. Pregúntanos y vemos juntos si encaja con tu situación.",
  },
  {
    q: "¿Cómo llego al centro?",
    a: "Estamos en el Edificio Cristina, Paseo de las Delicias 1, junto a Puerta Jerez. Tienes Metro y tranvía a un paso y aparcamiento público al lado.",
  },
] as const;
