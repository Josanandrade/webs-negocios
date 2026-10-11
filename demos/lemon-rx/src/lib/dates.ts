// Fechas "solo día" (YYYY-MM-DD) tratadas siempre en UTC para evitar
// desfases de zona horaria. "Hoy" se calcula en la zona del box.

export const TIME_ZONE = "Europe/Madrid";

const DAY_MS = 86_400_000;

export const DAY_NAMES = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MONTHS_LONG = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parse(value));
}

function parse(iso: string) {
  return Date.parse(`${iso}T00:00:00Z`);
}

function toIso(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number) {
  return toIso(parse(iso) + days * DAY_MS);
}

/** 1 = lunes … 7 = domingo */
export function isoDayOfWeek(iso: string) {
  const d = new Date(parse(iso)).getUTCDay();
  return d === 0 ? 7 : d;
}

export function mondayOf(iso: string) {
  return addDays(iso, 1 - isoDayOfWeek(iso));
}

export function todayIso(now = new Date()) {
  // en-CA formatea como YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function currentWeekStart(now = new Date()) {
  return mondayOf(todayIso(now));
}

export function weekDates(start: string) {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

function parts(iso: string) {
  const d = new Date(parse(iso));
  return { day: d.getUTCDate(), month: d.getUTCMonth(), year: d.getUTCFullYear() };
}

/** "12 OCT" */
export function shortDate(iso: string) {
  const { day, month } = parts(iso);
  return `${day} ${MONTHS_SHORT[month].toUpperCase()}`;
}

/** "12 — 18 OCT" o "28 SEP — 4 OCT" */
export function weekRangeShort(start: string) {
  const a = parts(start);
  const b = parts(addDays(start, 6));
  if (a.month === b.month) return `${a.day} — ${b.day} ${MONTHS_SHORT[b.month].toUpperCase()}`;
  return `${a.day} ${MONTHS_SHORT[a.month].toUpperCase()} — ${b.day} ${MONTHS_SHORT[b.month].toUpperCase()}`;
}

/** "12 al 18 de octubre" (para frases) */
export function weekRangeSentence(start: string) {
  const a = parts(start);
  const b = parts(addDays(start, 6));
  if (a.month === b.month) return `${a.day} al ${b.day} de ${MONTHS_LONG[b.month]}`;
  return `${a.day} de ${MONTHS_LONG[a.month]} al ${b.day} de ${MONTHS_LONG[b.month]}`;
}

/** "12 - 18 OCTUBRE 2026" */
export function weekRangeLong(start: string) {
  const a = parts(start);
  const b = parts(addDays(start, 6));
  const tail = `${MONTHS_LONG[b.month].toUpperCase()} ${b.year}`;
  if (a.month === b.month) return `${a.day} – ${b.day} ${tail}`;
  const head = a.year === b.year ? MONTHS_LONG[a.month].toUpperCase() : `${MONTHS_LONG[a.month].toUpperCase()} ${a.year}`;
  return `${a.day} ${head} – ${b.day} ${tail}`;
}

export function formatJoined(timestamp: string) {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp));
}
