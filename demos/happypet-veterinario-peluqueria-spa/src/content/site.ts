// Contenido de la web. Solo datos públicos del negocio; las fuentes y lo
// que queda por confirmar están en docs/INTERNAL_AUDIT.md.

export const business = {
  name: "HappyPet",
  tagline: "Centro veterinario · Peluquería & Spa",
  town: "Bollullos de la Mitación",
  address: "C. Virgen de la Soledad, 8",
  postal: "41110 Bollullos de la Mitación, Sevilla",
  phone: "955 27 71 19",
  phoneHref: "tel:+34955277119",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=HappyPet+Centro+Veterinario+C.+Virgen+de+la+Soledad+8+Bollullos+de+la+Mitaci%C3%B3n",
  facebookHref: "https://www.facebook.com/Veterinariahappypet76/",
} as const;

type Slot = readonly [number, number];
const h = (hh: number, mm = 0) => hh * 60 + mm;
const weekday: readonly Slot[] = [
  [h(9, 30), h(14)],
  [h(17), h(19, 30)],
];

// Índice 0 = domingo, como Date#getDay().
export const hours: readonly { day: string; slots: readonly Slot[] }[] = [
  { day: "Domingo", slots: [] },
  { day: "Lunes", slots: weekday },
  { day: "Martes", slots: weekday },
  { day: "Miércoles", slots: weekday },
  { day: "Jueves", slots: weekday },
  { day: "Viernes", slots: weekday },
  { day: "Sábado", slots: [] },
];

export type Area = "salud" | "cuidado";

export const areas = {
  salud: {
    label: "Veterinaria",
    kicker: "Salud",
    title: "Consulta veterinaria para perros y gatos",
    intro:
      "Revisamos, prevenimos y tratamos. Te explicamos qué vemos y qué opciones hay, sin prisas y con palabras claras.",
    services: [
      {
        name: "Consulta",
        text: "Cuando algo no va como siempre: no come, está más apagado, se rasca, cojea o simplemente te deja con la duda.",
      },
      {
        name: "Medicina preventiva",
        text: "Vacunas, desparasitación y revisiones periódicas para adelantarnos a los problemas en cada etapa de su vida.",
      },
      {
        name: "Diagnóstico y tratamiento",
        text: "Exploramos, valoramos y te proponemos el tratamiento adecuado, contándote el porqué de cada paso.",
      },
      {
        name: "Seguimiento",
        text: "Si hace falta volver, lo dejamos organizado: cuándo, para qué y qué observar en casa mientras tanto.",
      },
    ],
    note: "Atención con cita previa. Llámanos y te damos hora.",
  },
  cuidado: {
    label: "Peluquería & Spa",
    kicker: "Cuidado",
    title: "Peluquería y spa con mano tranquila",
    intro:
      "Baño, corte e higiene a su ritmo. Que salga limpio y guapo, sí, pero sobre todo que salga a gusto.",
    services: [
      {
        name: "Baño y secado",
        text: "Champú adecuado a su pelo y su piel, aclarado a fondo y secado con calma, sin agobios.",
      },
      {
        name: "Corte y arreglo",
        text: "Arreglo de mantenimiento, corte a tu gusto o según su raza. Lo hablamos antes de empezar.",
      },
      {
        name: "Higiene",
        text: "Uñas, oídos y zonas delicadas: lo pequeño que en casa cuesta y que marca la diferencia.",
      },
      {
        name: "Spa",
        text: "Un baño más mimado y un cuidado extra de piel y pelo para cuando quieres algo especial.",
      },
    ],
    note: "Perros y gatos. Con cita previa para que no tenga que esperar.",
  },
} as const;

/** Ayuda para elegir: situación → área. */
export const situations: readonly {
  id: string;
  label: string;
  area: Area | "fuera";
  answer: string;
}[] = [
  {
    id: "raro",
    label: "Le noto raro: no come, vomita, cojea…",
    area: "salud",
    answer:
      "Llámanos, cuéntanos qué notas y desde cuándo, y te decimos cuándo traerlo.",
  },
  {
    id: "vacuna",
    label: "Le toca vacuna o revisión",
    area: "salud",
    answer:
      "Pide cita. Si tienes su cartilla a mano, tráela: así vemos qué le toca.",
  },
  {
    id: "bano",
    label: "Necesita baño, corte o deshacer nudos",
    area: "cuidado",
    answer:
      "Al llamar dinos raza o tamaño y cómo tiene el pelo, para reservarle el tiempo que necesita.",
  },
  {
    id: "unas",
    label: "Uñas, oídos o higiene",
    area: "cuidado",
    answer:
      "Lo hacemos en peluquería. Si notas mal olor, enrojecimiento o dolor, mejor que lo vea antes la veterinaria.",
  },
  {
    id: "noche",
    label: "Es de noche o fin de semana y es grave",
    area: "fuera",
    answer:
      "Fuera de nuestro horario, acude a un servicio de urgencias veterinarias. En cuanto abramos, puedes llamarnos para el seguimiento.",
  },
];

export const visitSteps = [
  {
    title: "Nos llamas",
    text: "Cuéntanos qué necesita y para qué parte es. Si dudas, te ayudamos a decidir.",
  },
  {
    title: "Te damos hora",
    text: "Así llegas sin esperas y le dedicamos el tiempo que corresponde.",
  },
  {
    title: "Llegada tranquila",
    text: "Le dejamos olfatear y presentarse. Ni prisas ni sustos innecesarios.",
  },
  {
    title: "Te lo contamos",
    text: "Qué hemos visto o qué le hemos hecho, y qué hacer en casa si hace falta.",
  },
] as const;

// Reseñas públicas de Google (texto original, firmadas con nombre e inicial).
export const reviews = [
  {
    text: "Yngrid es la combinación perfecta entre profesionalidad y ternura hacia los animales.",
    author: "Eva C.",
  },
  {
    text: "Más cariñosas con las mascotas imposible. Peluquería y veterinaria perfectas. Me encanta.",
    author: "Raquel M.",
  },
  {
    text: "Nos atendieron bien y nos resolvieron el problema de nuestra gata.",
    author: "Claudio V.",
  },
  { text: "Siempre genial, mi perrito encantado de ir.", author: "Coral E." },
  { text: "Profesionales comprometidos.", author: "Tania M." },
] as const;

export const faqs = [
  {
    q: "¿Hace falta pedir cita?",
    a: "Sí, trabajamos con cita tanto en veterinaria como en peluquería. Llámanos al 955 27 71 19 y buscamos el hueco que mejor te venga.",
  },
  {
    q: "¿Atendéis gatos?",
    a: "Sí, perros y gatos. Si tu gato se estresa con las salidas, avísanos al pedir cita y lo organizamos para que esté el menor tiempo posible.",
  },
  {
    q: "¿Qué hago si es una urgencia fuera de horario?",
    a: "Acude a un servicio de urgencias veterinarias. Dentro de nuestro horario, llámanos antes de venir para poder recibirte.",
  },
  {
    q: "¿Puedo aprovechar la visita para veterinaria y peluquería?",
    a: "Están en el mismo centro. Coméntalo al pedir cita y te decimos cómo organizarlo según lo que necesite.",
  },
  {
    q: "¿Cuánto dura la peluquería?",
    a: "Depende del tamaño, el tipo de pelo y cómo esté de nudos. Al pedir cita te damos una idea y te avisamos cuando puedas recogerlo.",
  },
  {
    q: "¿El centro es accesible?",
    a: "Sí, la entrada es accesible en silla de ruedas.",
  },
] as const;
