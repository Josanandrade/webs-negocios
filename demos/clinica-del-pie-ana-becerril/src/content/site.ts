// Datos públicos de la consulta. Solo lo que aparece en fuentes públicas
// (ver docs/INTERNAL_AUDIT.md). Si algo cambia, se cambia aquí y nada más.

export const practice = {
  name: "Clínica del Pie",
  professional: "Ana Mª Becerril",
  role: "Podóloga",
  town: "Pilas",
  street: "C. Médico José Manuel Bolaños Custodio, 40",
  postcode: "41840",
  province: "Sevilla",
  phone: "954 751 875",
  phoneHref: "tel:+34954751875",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("C. Médico José Manuel Bolaños Custodio 40, 41840 Pilas, Sevilla"),
};

// Motivos genéricos: no describen tratamientos ni patologías.
export const reasons = [
  { id: "primera", label: "Primera consulta", hint: "Nunca he venido a esta consulta" },
  { id: "volver", label: "Volver a consulta", hint: "Ya he venido antes" },
  { id: "otro", label: "Otro motivo", hint: "Lo explico en la nota" },
] as const;

export type Reason = (typeof reasons)[number];

export const faqs = [
  {
    q: "¿Cómo pido cita desde esta web?",
    a: "Pulse «Pedir cita», elija el motivo, el día y la hora que le vengan bien y escriba su nombre y su teléfono. Son tres pasos y no hace falta registrarse.",
  },
  {
    q: "¿Puedo seguir pidiendo cita por teléfono?",
    a: `Sí. El teléfono de la consulta es el ${practice.phone}. La web es una forma más de pedirla, sin esperar a que le cojan el teléfono.`,
  },
  {
    q: "¿La cita queda confirmada al enviar la solicitud?",
    a: "La web registra su solicitud con el día y la hora elegidos. La consulta la revisa y, si hiciera falta cambiar algo, le llama al teléfono que haya indicado.",
  },
  {
    q: "¿Y si no puedo ir el día elegido?",
    a: `Llame al ${practice.phone} y le buscan otro hueco.`,
  },
  {
    q: "¿Qué horario tiene la consulta?",
    a: `El horario no está publicado todavía. Para confirmarlo, llame al ${practice.phone}. Los huecos de la agenda de esta página son de ejemplo.`,
  },
  {
    q: "¿Dónde está la consulta?",
    a: `En ${practice.street}, ${practice.postcode} ${practice.town} (${practice.province}).`,
  },
];
