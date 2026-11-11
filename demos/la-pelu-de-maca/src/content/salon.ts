/*
  Contenido de la web. Solo datos localizados en fuentes públicas del salón
  (ver docs/INTERNAL_AUDIT.md). Si algo no está verificado, no aparece aquí.
*/

export const salon = {
  name: "La Pelu de Maca",
  street: "Av. Reyes Católicos, 1, 1B",
  city: "41702 Dos Hermanas, Sevilla",
  phoneDisplay: "954 03 45 88",
  phoneHref: "tel:+34954034588",
  instagramHandle: "@lodemaca.pelu",
  instagramUrl: "https://www.instagram.com/lodemaca.pelu/",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=La+Pelu+de+Maca%2C+Av.+Reyes+Cat%C3%B3licos+1%2C+Dos+Hermanas",
  rating: { value: "4,8", count: 70, source: "Google" },
} as const;

/* Horario. Días con la numeración de Date#getDay (0 = domingo). Minutos desde las 00:00. */
export type Slot = [open: number, close: number];

export const hours: { label: string; days: number[]; slots: Slot[] }[] = [
  { label: "Lunes a jueves", days: [1, 2, 3, 4], slots: [[570, 810], [990, 1230]] },
  { label: "Viernes", days: [5], slots: [[570, 1200]] },
  { label: "Sábado", days: [6], slots: [[540, 840]] },
  { label: "Domingo", days: [0], slots: [] },
];

export function formatTime(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

export function formatSlots(slots: Slot[]) {
  if (slots.length === 0) return "Cerrado";
  return slots.map(([a, b]) => `${formatTime(a)} – ${formatTime(b)}`).join(" · ");
}

export const team = [
  { name: "Maca", role: "la dueña", tone: "tomato" },
  { name: "Carmen", role: "compi", tone: "butter" },
  { name: "Mari Carmen", role: "compi", tone: "sage" },
] as const;

export const services = [
  {
    key: "corte",
    title: "Corte",
    text: "Para cambiar de look o para mantener el de siempre, bien hecho.",
  },
  {
    key: "color",
    title: "Color",
    text: "Para cubrir canas, darle luz a tu tono o atreverte con algo nuevo.",
  },
  {
    key: "peinado",
    title: "Peinado",
    text: "Para un día especial, una cita importante o porque te apetece.",
  },
  {
    key: "cuidado",
    title: "Cuidado del pelo",
    text: "Tratamientos para que el pelo se vea sano entre visita y visita.",
  },
] as const;

/*
  Fragmentos de reseñas públicas de Google tal como los recoge el directorio
  Volumus. Sin nombre de autora porque la fuente no lo muestra. Las que
  aparecen cortadas en la fuente se marcan con «…».
*/
export const reviews = [
  {
    text: "La mejor peluquería. Dueña muy simpática, cuando vas, repites seguro por lo acogedoras que son. Risas aseguradas.",
    tone: "butter",
  },
  {
    text: "Maca y su equipo al completo son únicas. No sólo te peinan, dan color o cortan con muchísimo estilo…",
    tone: "blush",
  },
  {
    text: "Ambiente agradable, muy buenas profesionales, calidad precio inmejorable. ¡La mejor peluquería!",
    tone: "sage",
  },
  {
    text: "Macarena es una chica muy profesional, al igual que sus compis Carmen y Mari Carmen…",
    tone: "paper",
  },
] as const;
