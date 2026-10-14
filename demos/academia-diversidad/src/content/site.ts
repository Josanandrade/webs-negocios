// Datos públicos de la academia. Solo lo que se ha podido sostener:
// nombre, localidad y teléfono. Cursos, niveles, horarios, modalidades y
// precios NO figuran porque no se han podido confirmar.
export const academy = {
  name: "Academia Diversidad",
  town: "Aznalcázar",
  province: "Sevilla",
  phoneDisplay: "680 990 641",
  phoneHref: "tel:+34680990641",
  mapsHref: "https://www.google.com/maps/search/?api=1&query=Academia+Diversidad+Aznalc%C3%A1zar",
} as const;

export const nav = [
  { href: "#academia", label: "La academia" },
  { href: "#empezar", label: "Cómo empezar" },
  { href: "#preguntas", label: "Preguntas" },
  { href: "#contacto", label: "Contacto" },
] as const;

export const audiences = {
  familia: {
    label: "Soy familia",
    title: "Para madres, padres y tutores",
    intro:
      "Elegir dónde se forma tu hijo o tu hija es una decisión importante. Aquí puedes contarnos su situación con calma y resolver dudas antes de dar ningún paso.",
    points: [
      { k: "Cuéntanos su punto de partida", v: "Qué le cuesta, qué le motiva y qué os gustaría conseguir." },
      { k: "Pregunta todo lo que necesites", v: "Opciones, organización y cómo funciona la academia, sin compromiso." },
      { k: "Decide con la información delante", v: "Te contestamos por el medio que prefieras: llamada o email." },
    ],
  },
  alumno: {
    label: "Soy alumno/a",
    title: "Para quien viene a aprender",
    intro:
      "Da igual desde dónde empieces. Lo importante es saber qué necesitas y encontrar la forma de avanzar a tu ritmo, con alguien al lado.",
    points: [
      { k: "Explica qué quieres conseguir", v: "Un objetivo concreto o simplemente ir más seguro. Ambas valen." },
      { k: "Conoce tus opciones", v: "La academia te cuenta qué puede encajar contigo." },
      { k: "Empieza sin rodeos", v: "Dejas tus datos y la academia se pone en contacto contigo." },
    ],
  },
} as const;

export const steps = [
  { n: "01", t: "Nos escribes o llamas", d: "Con el formulario de esta página o al teléfono de la academia." },
  { n: "02", t: "Te contactamos", d: "Por llamada o email, como nos hayas indicado." },
  { n: "03", t: "Vemos qué necesitas", d: "Hablamos del punto de partida y de lo que quieres conseguir." },
  { n: "04", t: "Das el paso", d: "Si encaja, te explicamos cómo formalizar la matrícula." },
] as const;

export const faqs = [
  {
    q: "¿Qué cursos o materias ofrece la academia?",
    a: "Para saber qué opciones hay ahora mismo, lo más fiable es preguntarlo directamente: cuéntanos qué necesitas en el formulario o llama al 680 990 641 y te explicamos qué opciones hay.",
  },
  {
    q: "¿Dónde está la academia?",
    a: "En Aznalcázar (Sevilla). Si es tu primera visita, llámanos y te indicamos cómo llegar.",
  },
  {
    q: "¿Pedir información me compromete a algo?",
    a: "No. Enviar una solicitud solo sirve para que la academia te contacte y resuelva tus dudas.",
  },
  {
    q: "¿Qué diferencia hay entre «Pedir información» y «Quiero apuntarme»?",
    a: "Con la primera nos haces llegar tus dudas. Con la segunda nos indicas que ya quieres empezar, y la academia te explica los pasos para formalizar la matrícula.",
  },
  {
    q: "¿Puedo llamar en lugar de rellenar el formulario?",
    a: "Claro. El teléfono de la academia es el 680 990 641.",
  },
  {
    q: "¿Qué hacéis con mis datos?",
    a: "Se usan solo para responder a tu solicitud.",
  },
] as const;
