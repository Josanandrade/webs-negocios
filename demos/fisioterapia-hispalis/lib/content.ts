/**
 * Textos de la web. Redactados de nuevo a partir de la información factual de
 * la web oficial (no se copian bloques). Sin promesas de resultados.
 */

export type CaseOption = {
  id: string;
  label: string;
  title: string;
  body: string;
  /** Mensaje de WhatsApp prellenado: el paciente solo tiene que pulsar «enviar». */
  message: string;
};

export const caseOptions: CaseOption[] = [
  {
    id: "espalda",
    label: "Me duele la espalda o el cuello",
    title: "Dolor de espalda, cuello o articulaciones",
    body: "Empezamos por entender de dónde viene el dolor y qué te impide hacer. Con eso diseñamos un plan con terapia manual, ejercicio y las técnicas que encajen contigo.",
    message:
      "Hola Angélica, te escribo desde la web. Tengo dolor de espalda/cuello y me gustaría pedir una cita de valoración.",
  },
  {
    id: "lesion",
    label: "Me he lesionado",
    title: "Lesiones deportivas y traumatológicas",
    body: "Una lesión mal recuperada suele volver. Trabajamos para que recuperes la movilidad y la fuerza, y vuelvas a tu actividad con seguridad.",
    message:
      "Hola Angélica, te escribo desde la web. Me he lesionado y me gustaría saber si me podéis ayudar y pedir cita.",
  },
  {
    id: "ictus",
    label: "Rehabilitación tras un ictus",
    title: "Rehabilitación neurológica",
    body: "Tras un ictus u otra afección neurológica, cada pequeño avance cuenta. Planteamos objetivos realistas y trabajamos de forma constante, implicando a la familia.",
    message:
      "Hola Angélica, te escribo desde la web. Quería información sobre rehabilitación neurológica tras un ictus.",
  },
  {
    id: "mayores",
    label: "Para mi padre o mi madre",
    title: "Fisioterapia para personas mayores",
    body: "Mantener la movilidad es mantener la autonomía. Sesiones tranquilas, adaptadas a su ritmo, para que se mueva con más confianza en su día a día.",
    message:
      "Hola Angélica, te escribo desde la web. Quería información sobre fisioterapia para mi padre/madre.",
  },
  {
    id: "peques",
    label: "Para mi bebé o mi hijo",
    title: "Fisioterapia pediátrica",
    body: "Acompañamos a bebés y niños con terapias personalizadas según su etapa de desarrollo motor, y siempre de la mano de la familia.",
    message:
      "Hola Angélica, te escribo desde la web. Quería información sobre fisioterapia pediátrica para mi hijo/a.",
  },
];

export type Area = {
  id: string;
  number: string;
  title: string;
  lead: string;
  forWhom: string[];
  approach: string;
  /** Cómo se nombra en el mensaje de WhatsApp. */
  topic: string;
};

export const areas: Area[] = [
  {
    id: "dolor-y-lesiones",
    number: "01",
    title: "Dolor y lesiones",
    topic: "fisioterapia para un dolor o una lesión",
    lead: "Fisioterapia traumatológica, reumatológica y deportiva.",
    forWhom: [
      "Dolor de espalda y cuello",
      "Lesiones deportivas",
      "Afecciones traumatológicas",
      "Afecciones reumáticas",
    ],
    approach:
      "Combinamos terapia manual, ejercicio terapéutico y, cuando aporta, técnicas como la punción seca o el vendaje neuromuscular.",
  },
  {
    id: "neurologica",
    number: "02",
    title: "Rehabilitación neurológica",
    topic: "rehabilitación neurológica",
    lead: "Recuperar funciones tras un ictus u otras afecciones neurológicas.",
    forWhom: [
      "Personas que han sufrido un ictus",
      "Otras afecciones neurológicas",
      "Familias que acompañan la recuperación",
    ],
    approach:
      "Trabajo progresivo y constante, con enfoques específicos de neurorrehabilitación como el concepto Bobath o la neurodinamia.",
  },
  {
    id: "mayores",
    number: "03",
    title: "Personas mayores",
    topic: "fisioterapia para personas mayores",
    lead: "Moverse mejor para seguir siendo independiente.",
    forWhom: [
      "Pérdida de movilidad o fuerza",
      "Dolor articular",
      "Recuperar confianza al moverse",
    ],
    approach:
      "Sesiones adaptadas a su ritmo y a su situación. Si desplazarse es un problema, pregúntanos por la atención a domicilio.",
  },
  {
    id: "pediatrica",
    number: "04",
    title: "Fisioterapia pediátrica",
    topic: "fisioterapia pediátrica",
    lead: "Bebés y niños, en cada etapa de su desarrollo.",
    forWhom: [
      "Parálisis cerebral infantil",
      "Síndrome de Down",
      "Alteraciones del desarrollo motor",
    ],
    approach:
      "Terapias totalmente personalizadas según la etapa de desarrollo motor de cada niño, con métodos como Vojta o Bobath.",
  },
];

export const methodSteps = [
  {
    title: "Te escuchamos",
    body: "Qué te pasa, desde cuándo y, sobre todo, qué te gustaría volver a hacer. Tu objetivo marca el tratamiento.",
  },
  {
    title: "Valoración detallada",
    body: "Exploramos con calma para entender el origen del problema, no solo dónde duele.",
  },
  {
    title: "Plan personalizado",
    body: "Te explicamos qué vamos a hacer y por qué. Sin sesiones de cadena ni protocolos iguales para todos.",
  },
  {
    title: "Tratamiento y seguimiento",
    body: "Sesiones de 50 minutos y pautas para que también avances en casa. Ajustamos el plan según evolucionas.",
  },
];

export const techniques = [
  "Terapia manual",
  "Masaje terapéutico",
  "Ejercicio terapéutico",
  "Punción seca",
  "Vendaje neuromuscular",
  "Electroterapia",
  "Ultrasonidos",
  "Infrarrojos",
  "Microondas",
  "Magnetoterapia",
  "Concepto Bobath",
  "Método Vojta",
  "Neurodinamia",
];

export const reviewThemes = [
  {
    title: "Profesionalidad",
    body: "Es lo que más se repite en las opiniones: la sensación de estar en buenas manos.",
  },
  {
    title: "Trato cercano",
    body: "Pacientes que destacan el trato humano y la cercanía en cada sesión.",
  },
  {
    title: "Vocación",
    body: "«Una gran profesional, y además con vocación»: así la describen.",
  },
];

export const faqs = [
  {
    q: "¿Cómo pido cita?",
    a: "Por WhatsApp o llamando al teléfono de la clínica. También puedes escribir un email. Cuéntanos brevemente qué te pasa y te proponemos un hueco.",
  },
  {
    q: "¿Cuánto dura una sesión?",
    a: "Las sesiones duran 50 minutos. En la primera dedicamos el tiempo necesario a la valoración antes de empezar el tratamiento.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "Te informamos de las tarifas y de los bonos de sesiones antes de empezar, sin ningún compromiso. Escríbenos por WhatsApp y te lo contamos.",
  },
  {
    q: "¿Atendéis a domicilio?",
    a: "Sí, además de en la clínica se realizan sesiones a domicilio. Consúltanos disponibilidad y condiciones para tu zona.",
  },
  {
    q: "¿Y en fin de semana o festivo?",
    a: "Los fines de semana y festivos se atienden urgencias. Escríbenos y te decimos si hay disponibilidad.",
  },
  {
    q: "¿Qué tengo que llevar a la primera sesión?",
    a: "Ropa cómoda y, si los tienes, informes médicos o pruebas recientes relacionadas con tu problema. Nos ayudan a afinar la valoración.",
  },
];
