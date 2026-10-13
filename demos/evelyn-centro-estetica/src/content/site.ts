// Datos públicos del negocio. Solo información contrastada en su ficha de
// reservas (Fresha) y directorios; la trazabilidad de cada dato está en
// docs/INTERNAL_AUDIT.md (no se despliega).

export const business = {
  name: "Evelyn Centro de Estética",
  shortName: "Evelyn",
  neighbourhood: "Pino Montano",
  city: "Sevilla",
  address: {
    street: "Av. de Pino Montano, 3",
    postalCode: "41008",
    locality: "Sevilla",
  },
  phone: {
    display: "623 42 94 64",
    href: "tel:+34623429464",
  },
  booking: {
    label: "Reservar en línea",
    href: "https://www.fresha.com/lvp/evelyn-centro-de-estetica-avenida-de-pino-montano-sevilla-JQwaR6",
  },
  maps: {
    google:
      "https://www.google.com/maps/search/?api=1&query=Evelyn%20Centro%20de%20Est%C3%A9tica%2C%20Av.%20de%20Pino%20Montano%203%2C%2041008%20Sevilla",
    apple:
      "https://maps.apple.com/?q=Evelyn%20Centro%20de%20Est%C3%A9tica&address=Av.%20de%20Pino%20Montano%203%2C%2041008%20Sevilla",
  },
} as const;

/** 0 = domingo … 6 = sábado. `null` = cerrado. */
export type DayHours = { open: string; close: string } | null;

export const hours: { day: number; label: string; hours: DayHours }[] = [
  { day: 1, label: "Lunes", hours: { open: "10:30", close: "18:30" } },
  { day: 2, label: "Martes", hours: { open: "10:30", close: "19:30" } },
  { day: 3, label: "Miércoles", hours: { open: "10:30", close: "18:30" } },
  { day: 4, label: "Jueves", hours: { open: "10:30", close: "19:30" } },
  { day: 5, label: "Viernes", hours: { open: "10:30", close: "19:30" } },
  { day: 6, label: "Sábado", hours: { open: "10:30", close: "14:00" } },
  { day: 0, label: "Domingo", hours: null },
];

export type Treatment = { name: string; description: string };
export type TreatmentGroup = {
  id: string;
  title: string;
  intro: string;
  treatments: Treatment[];
};

export const treatmentGroups: TreatmentGroup[] = [
  {
    id: "facial",
    title: "Facial",
    intro:
      "La mayor parte de la carta está dedicada al rostro: desde una limpieza a fondo hasta tratamientos de renovación.",
    treatments: [
      {
        name: "Tratamiento facial",
        description: "Cuidado completo del rostro adaptado a tu tipo de piel.",
      },
      {
        name: "Limpieza con extracciones",
        description: "Higiene profunda para despejar poros y puntos negros.",
      },
      {
        name: "Facial para piel con acné",
        description: "Un protocolo pensado para pieles con tendencia acneica.",
      },
      {
        name: "Peeling químico",
        description: "Exfoliación que ayuda a renovar la capa superficial de la piel.",
      },
      {
        name: "Dermaplaning",
        description: "Exfoliación manual que retira células muertas y vello fino.",
      },
      {
        name: "Facial masculino",
        description: "El cuidado facial, ajustado a la piel masculina.",
      },
    ],
  },
  {
    id: "corporal",
    title: "Corporal",
    intro: "Tiempo para el cuerpo: trabajo de remodelación y masaje para soltar tensión.",
    treatments: [
      {
        name: "Remodelación corporal",
        description: "Tratamiento orientado a moldear y cuidar la silueta.",
      },
      {
        name: "Masaje de espalda",
        description: "Para descargar la zona donde más se acumula el día a día.",
      },
    ],
  },
  {
    id: "cejas",
    title: "Cejas",
    intro: "Definición precisa, pelo a pelo.",
    treatments: [
      {
        name: "Depilación con hilo",
        description: "Técnica precisa para dar forma a las cejas sin cera.",
      },
    ],
  },
  {
    id: "maquillaje",
    title: "Maquillaje",
    intro: "Para un evento, una cita o simplemente un día especial.",
    treatments: [
      {
        name: "Servicio de maquillaje",
        description: "Maquillaje profesional pensado para la ocasión.",
      },
    ],
  },
];

/**
 * Fotografías reales del centro. Mientras no haya material propio verificado
 * cada hueco se muestra como un panel de luz neutro (sin imágenes de stock).
 * Ver public/assets/evelyn-centro-estetica/README_ASSETS.md.
 */
export const photos: Record<"hero" | "facial" | "space", { src: string; alt: string } | null> = {
  hero: null,
  facial: null,
  space: null,
};
