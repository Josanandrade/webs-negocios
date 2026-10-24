import { useSyncExternalStore } from "react";

// Disponibilidad simulada. No hay agenda real detrás: los huecos se generan
// en el navegador a partir de la fecha y son los mismos para cada día.

export type Day = { iso: string; date: Date };
export type Slot = { time: string; free: boolean };

// Franjas de ejemplo. La clínica configuraría aquí su horario real.
const MORNING = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00"];
const AFTERNOON = ["17:30", "18:00", "18:30", "19:00", "19:30", "20:00"];

export const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Próximos días laborables (lunes a viernes) a partir de mañana.
export function nextWorkdays(count: number, from = new Date()): Day[] {
  const days: Day[] = [];
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  while (days.length < count) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) days.push({ iso: toIso(d), date: new Date(d) });
  }
  return days;
}

// Pseudoaleatorio estable por fecha: el mismo día enseña siempre los mismos huecos.
function seeded(iso: string) {
  let h = 2166136261;
  for (const c of iso) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function slotsFor(day: Day): { morning: Slot[]; afternoon: Slot[] } {
  const rnd = seeded(day.iso);
  // Un día a la semana (el miércoles) solo hay tarde, para que la demo
  // enseñe que la agenda puede tener días distintos.
  const wd = day.date.getDay();
  const morning = wd === 3 ? [] : MORNING.map((time) => ({ time, free: rnd() > 0.42 }));
  const afternoon = AFTERNOON.map((time) => ({ time, free: rnd() > 0.45 }));
  return { morning, afternoon };
}

export const freeCount = (day: Day) => {
  const s = slotsFor(day);
  return [...s.morning, ...s.afternoon].filter((x) => x.free).length;
};

const WD = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const WD_LONG = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTH = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MONTH_LONG = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export const fmt = {
  wd: (d: Date) => WD[d.getDay()],
  month: (d: Date) => MONTH[d.getMonth()],
  long: (d: Date) => `${WD_LONG[d.getDay()]} ${d.getDate()} de ${MONTH_LONG[d.getMonth()]}`,
};

export function fromIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Fecha de hoy solo en el navegador (en la exportación estática no hay "hoy"):
// el servidor devuelve null y el cliente la fecha ISO actual.
const noop = () => () => {};
export function useTodayIso(): string | null {
  return useSyncExternalStore(noop, () => toIso(new Date()), () => null);
}
