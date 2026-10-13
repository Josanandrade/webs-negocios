"use client";

import { scheduleRows } from "@/content/clinic";
import { useMadridNow } from "@/lib/hours";

export function HoursTable() {
  const now = useMadridNow();
  return (
    <dl className="hours">
      {scheduleRows.map((row) => {
        const isToday = now ? row.dayNums.includes(now.day) : false;
        return (
          <div key={row.days} className={`hours__row ${isToday ? "is-today" : ""}`}>
            <dt>
              {row.days}
              {isToday ? <span className="hours__today">Hoy</span> : null}
            </dt>
            <dd>
              {row.hours.length ? (
                row.hours.map((h) => <span key={h}>{h}</span>)
              ) : (
                <span className="hours__closed">Cerrado</span>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
