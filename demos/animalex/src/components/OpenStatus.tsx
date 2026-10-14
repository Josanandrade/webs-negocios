"use client";

import { useSyncExternalStore } from "react";
import { madridNow, statusAt } from "@/lib/hours";

// El estado depende de la hora del visitante, así que solo existe en cliente.
// El servidor pinta un hueco del mismo tamaño para no mover el layout.
function subscribe(cb: () => void) {
  const id = window.setInterval(cb, 30_000);
  return () => window.clearInterval(id);
}

function snapshot() {
  const { day, minute } = madridNow();
  const s = statusAt(day, minute);
  return `${s.open ? 1 : 0}|${s.label}`;
}

export function OpenStatus({ className = "" }: { className?: string }) {
  const value = useSyncExternalStore(subscribe, snapshot, () => null);
  if (!value) return <span className={`status status--pending ${className}`} aria-hidden="true" />;
  const [open, label] = value.split("|");
  return (
    <span className={`status ${open === "1" ? "status--open" : "status--closed"} ${className}`}>
      <span className="status__dot" aria-hidden="true" />
      {label}
    </span>
  );
}
