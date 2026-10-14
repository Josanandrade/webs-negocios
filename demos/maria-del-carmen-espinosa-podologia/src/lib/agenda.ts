// Agenda de demostración. Las horas y los huecos ocupados se generan en el
// navegador a partir de la fecha: no hay horario real publicado ni ningún
// servidor detrás.

export type Slot = { time: string; free: boolean };
export type Day = { key: string; date: Date; slots: Slot[] };

const MORNING = ["09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00"];
const AFTERNOON = ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30"];
export const TIMES = [...MORNING, ...AFTERNOON];
export const isMorning = (t: string) => MORNING.includes(t);

// Pseudoaleatorio estable: el mismo día enseña siempre los mismos huecos.
const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
};

const pad = (n: number) => String(n).padStart(2, "0");
export const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Lo que queda de esta semana y las dos siguientes (de lunes a viernes).
export function buildDays(now: Date): Day[] {
  const days: Day[] = [];
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monday = new Date(cursor);
  monday.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7) + (cursor.getDay() === 0 || cursor.getDay() === 6 ? 7 : 0));
  const last = new Date(monday);
  last.setDate(monday.getDate() + 18);
  while (cursor <= last) {
    const wd = cursor.getDay();
    if (wd !== 0 && wd !== 6) {
      const key = dayKey(cursor);
      const isToday = key === dayKey(now);
      const slots = TIMES.map((time) => {
        const [h, m] = time.split(":").map(Number);
        const past = isToday && h * 60 + m < now.getHours() * 60 + now.getMinutes() + 60;
        return { time, free: !past && hash(key + time) > 0.48 };
      });
      days.push({ key, date: new Date(cursor), slots });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export const weekdayName = (d: Date) => WEEKDAYS[d.getDay()];
export const shortWeekday = (d: Date) => WEEKDAYS[d.getDay()].slice(0, 3);
export const monthName = (d: Date) => MONTHS[d.getMonth()];
export const longDate = (d: Date) => `${weekdayName(d)} ${d.getDate()} de ${monthName(d)}`;
