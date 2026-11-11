"use client";

import { hours } from "@/content/site";
import { formatSlots } from "./hours";
import { useOpenStatus } from "./OpenNow";

// Semana empezando en lunes; el día de hoy (hora de Madrid) se resalta.
const order = [1, 2, 3, 4, 5, 6, 0];

export default function HoursTable() {
  const status = useOpenStatus();
  return (
    <dl className="hours">
      {order.map((d) => (
        <div key={d} className="hours__row" data-today={status?.today === d || undefined}>
          <dt>
            {hours[d].day}
            {status?.today === d && <span className="sr-only"> (hoy)</span>}
          </dt>
          <dd>{formatSlots(hours[d].slots)}</dd>
        </div>
      ))}
    </dl>
  );
}
