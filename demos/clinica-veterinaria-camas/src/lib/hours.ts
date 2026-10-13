import { useSyncExternalStore } from "react";
import { schedule } from "@/content/clinic";

const DAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const WD: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Madrid",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// "día:minutos" en hora de Camas, estable durante un minuto.
function snapshot() {
  const parts = fmt.formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  return `${WD[get("weekday")]}:${Number(get("hour")) * 60 + Number(get("minute"))}`;
}

function subscribe(cb: () => void) {
  const id = window.setInterval(cb, 30_000);
  document.addEventListener("visibilitychange", cb);
  return () => {
    window.clearInterval(id);
    document.removeEventListener("visibilitychange", cb);
  };
}

// null en el servidor y en el primer render: nunca hay desajuste de hidratación.
export function useMadridNow(): { day: number; minutes: number } | null {
  const snap = useSyncExternalStore(subscribe, snapshot, () => null);
  if (!snap) return null;
  const [day, minutes] = snap.split(":").map(Number);
  return { day, minutes };
}

const hhmm = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;

export type OpenState = { open: boolean; label: string };

export function openState(day: number, minutes: number): OpenState {
  const today = schedule[day];
  const now = today.find(([o, c]) => minutes >= o && minutes < c);
  if (now) return { open: true, label: `Abierto ahora · hasta las ${hhmm(now[1])}` };

  const later = today.find(([o]) => o > minutes);
  if (later) return { open: false, label: `Cerrado ahora · abre hoy a las ${hhmm(later[0])}` };

  for (let i = 1; i <= 7; i++) {
    const d = (day + i) % 7;
    const first = schedule[d][0];
    if (!first) continue;
    const when = i === 1 ? "mañana" : `el ${DAYS[d]}`;
    return { open: false, label: `Cerrado ahora · abre ${when} a las ${hhmm(first[0])}` };
  }
  return { open: false, label: "Cerrado ahora" };
}
