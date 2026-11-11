import { dayNames, hours } from "@/content/site";

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const weekdayIndex: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Día (0–6) y minuto del día en hora de Madrid. */
export function madridNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  return { day: weekdayIndex[get("weekday")] ?? 0, minute: Number(get("hour")) * 60 + Number(get("minute")) };
}

export type Status = { open: boolean; label: string };

export function statusAt(day: number, minute: number): Status {
  for (const [from, to] of hours[day]) {
    if (minute >= toMin(from) && minute < toMin(to)) {
      return { open: true, label: `Abierto · hasta las ${to}` };
    }
  }
  const later = hours[day].find(([from]) => toMin(from) > minute);
  if (later) return { open: false, label: `Cerrado · abre a las ${later[0]}` };
  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const first = hours[d][0];
    if (first) {
      const when = i === 1 ? "mañana" : `el ${dayNames[d].toLowerCase()}`;
      return { open: false, label: `Cerrado · abre ${when} a las ${first[0]}` };
    }
  }
  return { open: false, label: "Cerrado" };
}
