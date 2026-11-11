import { hours } from "@/content/site";

const fmt = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;

export const formatSlots = (slots: readonly (readonly [number, number])[]) =>
  slots.length ? slots.map(([a, b]) => `${fmt(a)}–${fmt(b)}`).join(" y ") : "Cerrado";

/** Hora local del salón, sea cual sea la zona del visitante. */
function madridNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export type Status = { open: boolean; label: string; today: number };

export function getStatus(date?: Date): Status {
  const { day, minutes } = madridNow(date);
  const slot = hours[day].slots.find(([a, b]) => minutes >= a && minutes < b);
  if (slot) return { open: true, label: `Abierto ahora, hasta las ${fmt(slot[1])}`, today: day };

  const later = hours[day].slots.find(([a]) => a > minutes);
  if (later) return { open: false, label: `Cerrado ahora, abre hoy a las ${fmt(later[0])}`, today: day };

  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const first = hours[d].slots[0];
    if (first) {
      const when = i === 1 ? "mañana" : `el ${hours[d].day.toLowerCase()}`;
      return { open: false, label: `Cerrado ahora, abre ${when} a las ${fmt(first[0])}`, today: day };
    }
  }
  return { open: false, label: "Cerrado", today: day };
}
