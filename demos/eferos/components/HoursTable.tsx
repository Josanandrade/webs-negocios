"use client";

import { useSyncExternalStore } from "react";
import { business } from "@/business.config";
import { formatRange } from "@/lib/hours";
import styles from "./HoursTable.module.css";

/** Horario con el día actual resaltado (hora de Madrid, solo en cliente). */
const noop = () => () => {};

function madridWeekday() {
  const name = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Europe/Madrid" }).format(new Date());
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(name);
}

export default function HoursTable() {
  // En servidor no hay "hoy" fiable: se resalta solo tras hidratar.
  const today = useSyncExternalStore<number | null>(noop, madridWeekday, () => null);

  return (
    <table className={styles.table}>
      <caption className="visually-hidden">Horario de apertura</caption>
      <tbody>
        {business.hours.map((row) => {
          const isToday = today !== null && row.dayIndexes.includes(today);
          return (
            <tr key={row.days} data-today={isToday || undefined}>
              <th scope="row">
                {row.days}
                {isToday && <span className={styles.today}>Hoy</span>}
              </th>
              <td className="tabular">{formatRange(row)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
