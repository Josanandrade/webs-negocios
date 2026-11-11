"use client";

import { formatSlots, hours } from "@/content/salon";
import { useMadridNow } from "./useMadridNow";

export function HoursList() {
  const now = useMadridNow();
  return (
    <dl className="hours">
      {hours.map((row) => {
        const today = now !== null && row.days.includes(now.day);
        return (
          <div key={row.label} className="hours__row" data-today={today || undefined}>
            <dt>
              {row.label}
              {today && <span className="hours__today">hoy</span>}
            </dt>
            <dd>{formatSlots(row.slots)}</dd>
          </div>
        );
      })}
    </dl>
  );
}
