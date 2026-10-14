// Datos públicos de la consulta. Solo lo que aparece en fuentes públicas
// (ver docs/INTERNAL_AUDIT.md). Nada de horarios, precios ni tratamientos
// concretos: no están publicados.

export const practice = {
  name: "María Campos Rodríguez",
  firstName: "María",
  role: "Podóloga",
  town: "Pilas",
  street: "Avenida Aljarafe, 19, bajo 3",
  postcode: "41840",
  province: "Sevilla",
  phone: "954 750 555",
  phoneHref: "tel:+34954750555",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=Avenida+Aljarafe+19+41840+Pilas+Sevilla",
};

// Motivos de cita genéricos: no describen tratamientos ni especialidades.
export type Reason = {
  id: string;
  label: string;
  inSentence: string;
  hint: string;
};

export const reasons: Reason[] = [
  {
    id: "primera",
    label: "Primera visita",
    inSentence: "una primera visita",
    hint: "Si es la primera vez que vienes a la consulta.",
  },
  {
    id: "revision",
    label: "Revisión o seguimiento",
    inSentence: "una revisión",
    hint: "Si ya eres paciente y te toca volver.",
  },
  {
    id: "molestia",
    label: "Tengo una molestia",
    inSentence: "consultar una molestia",
    hint: "Cuéntalo en una línea y María lo verá antes de tu cita.",
  },
  {
    id: "otro",
    label: "Otro motivo",
    inSentence: "otro motivo",
    hint: "Para cualquier otra consulta.",
  },
];
