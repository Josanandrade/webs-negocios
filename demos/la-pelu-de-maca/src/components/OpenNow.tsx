"use client";

import { formatTime, hours, type Slot } from "@/content/salon";
import { useMadridNow } from "./useMadridNow";

const DAY_NAMES = ["el domingo", "el lunes", "el martes", "el miércoles", "el jueves", "el viernes", "el sábado"];

function slotsFor(day: number): Slot[] {
  return hours.find((h) => h.days.includes(day))?.slots ?? [];
}

function status(day: number, minutes: number) {
  const current = slotsFor(day).find(([a, b]) => minutes >= a && minutes < b);
  if (current) return { open: true, text: `Abierto ahora · hasta las ${formatTime(current[1])}` };

  const later = slotsFor(day).find(([a]) => a > minutes);
  if (later) return { open: false, text: `Cerrado ahora · abre hoy a las ${formatTime(later[0])}` };

  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const first = slotsFor(d)[0];
    if (!first) continue;
    const when = i === 1 ? "mañana" : DAY_NAMES[d];
    return { open: false, text: `Cerrado ahora · abre ${when} a las ${formatTime(first[0])}` };
  }
  return { open: false, text: "Cerrado ahora" };
}

export function OpenNow({ className = "" }: { className?: string }) {
  const now = useMadridNow();
  const s = now ? status(now.day, now.minutes) : null;
  return (
    <p className={`open-now ${className}`} data-state={s ? (s.open ? "open" : "closed") : "idle"} aria-live="polite">
      <span className="open-now__dot" aria-hidden="true" />
      <span>{s ? s.text : "Cita por teléfono"}</span>
    </p>
  );
}
