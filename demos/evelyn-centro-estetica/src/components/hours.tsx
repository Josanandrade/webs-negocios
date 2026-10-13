"use client";

import { useSyncExternalStore } from "react";
import { hours } from "@/content/site";

const weekday = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const dayIndex: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Día y hora actuales en Sevilla, como "d|HH:MM" para que el snapshot sea estable. */
function readNow(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${dayIndex[get("weekday")]}|${get("hour")}:${get("minute")}`;
}

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 30_000);
  return () => window.clearInterval(id);
}

function useMadridNow() {
  const snap = useSyncExternalStore(subscribe, readNow, () => null);
  if (!snap) return null;
  const [d, time] = snap.split("|");
  return { day: Number(d), time };
}

function statusText(day: number, time: string) {
  const today = hours.find((h) => h.day === day)?.hours;
  if (today && time < today.close) {
    return time >= today.open
      ? { open: true, text: `Abierto ahora, hasta las ${today.close}` }
      : { open: false, text: `Hoy abre a las ${today.open}` };
  }
  for (let i = 1; i <= 7; i++) {
    const next = (day + i) % 7;
    const h = hours.find((x) => x.day === next)?.hours;
    if (h) {
      const when = i === 1 ? "mañana" : `el ${weekday[next]}`;
      return { open: false, text: `Cerrado ahora. Abre ${when} a las ${h.open}` };
    }
  }
  return { open: false, text: "Cerrado" };
}

export function OpenStatus() {
  const now = useMadridNow();
  if (!now) return <span className="status">Lunes a sábado</span>;
  const s = statusText(now.day, now.time);
  return (
    <span className="status" data-open={s.open || undefined}>
      <span className="status__dot" aria-hidden="true" />
      {s.text}
    </span>
  );
}

export function HoursTable() {
  const now = useMadridNow();
  return (
    <table className="hours">
      <caption className="visually-hidden">Horario de apertura</caption>
      <tbody>
        {hours.map((h) => {
          const isToday = now?.day === h.day;
          return (
            <tr key={h.day} aria-current={isToday ? "date" : undefined}>
              <th scope="row">
                {h.label}
                {isToday ? <span className="hours__today">hoy</span> : null}
              </th>
              <td>{h.hours ? `${h.hours.open} – ${h.hours.close}` : "Cerrado"}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
