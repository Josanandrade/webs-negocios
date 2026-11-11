"use client";

import { useMemo } from "react";
import { fmt, fromIso, nextWorkdays, slotsFor, useTodayIso, type Day } from "./agenda";
import { useBooking } from "./BookingStore";

// Tarjeta del inicio: los próximos huecos libres, a un toque de reservar.
export default function NextSlots() {
  const { quickPick } = useBooking();
  const today = useTodayIso();

  const items = useMemo(() => {
    if (!today) return null;
    const out: { day: Day; time: string }[] = [];
    for (const day of nextWorkdays(6, fromIso(today))) {
      const s = slotsFor(day);
      // Un hueco de mañana y uno de tarde por día, para variar.
      const m = s.morning.find((x) => x.free);
      const a = s.afternoon.find((x) => x.free);
      if (m) out.push({ day, time: m.time });
      if (a) out.push({ day, time: a.time });
      if (out.length >= 4) break;
    }
    return out.slice(0, 4);
  }, [today]);

  return (
    <div className="ns" aria-label="Próximas horas disponibles">
      <div className="ns-head">
        <span className="ns-live" aria-hidden />
        <p>Próximas horas libres</p>
        <span className="ns-tag">Ejemplo</span>
      </div>
      <ul className="ns-list">
        {(items ?? Array.from({ length: 4 }, () => null)).map((it, i) =>
          it ? (
            <li key={it.day.iso + it.time}>
              <button type="button" onClick={() => quickPick(it.day.iso, it.time)}>
                <span className="ns-date">
                  <span className="ns-wd">{fmt.wd(it.day.date)}</span>
                  <span className="ns-n">{it.day.date.getDate()}</span>
                  <span className="ns-m">{fmt.month(it.day.date)}</span>
                </span>
                <span className="ns-time mono">{it.time}</span>
                <span className="ns-go">Reservar</span>
              </button>
            </li>
          ) : (
            <li key={i} className="ns-skel" aria-hidden />
          ),
        )}
      </ul>
      <a className="ns-all" href="#cita">
        Ver toda la agenda
      </a>
    </div>
  );
}
