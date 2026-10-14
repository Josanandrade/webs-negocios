// Datos públicos verificados de la clínica. Cualquier cambio aquí debe
// poder justificarse con una fuente pública o con el propio negocio.

export const clinic = {
  name: "Clínica del Pie Alquería",
  short: "Alquería",
  sector: "Podología",
  street: "Ctra. Almensilla, 3",
  postalCode: "41110",
  town: "Bollullos de la Mitación",
  province: "Sevilla",
  phone: "685 89 82 65",
  phoneHref: "tel:+34685898265",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=Cl%C3%ADnica+del+Pie+Alquer%C3%ADa+Ctra.+Almensilla+3+Bollullos+de+la+Mitaci%C3%B3n",
} as const;

// Tipos de cita genéricos: no se nombran tratamientos ni especialidades
// concretas porque no hay fuente pública que las confirme.
export type VisitType = {
  id: string;
  code: string;
  name: string;
  forWho: string;
  detail: string;
};

export const visitTypes: VisitType[] = [
  {
    id: "primera",
    code: "PV",
    name: "Primera visita",
    forWho: "Pacientes nuevos",
    detail: "Para venir por primera vez a la clínica. Indica el motivo de consulta y el podólogo lo valorará en la cita.",
  },
  {
    id: "revision",
    code: "RS",
    name: "Revisión o seguimiento",
    forWho: "Pacientes de la clínica",
    detail: "Si ya eres paciente y tienes que volver, o te indicaron una nueva visita.",
  },
  {
    id: "consulta",
    code: "CP",
    name: "Consulta de podología",
    forWho: "Cualquier motivo",
    detail: "Si no sabes qué tipo de cita elegir. Cuéntanos el motivo y la clínica te orientará.",
  },
];
