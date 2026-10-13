"use client";

import { openState, useMadridNow } from "@/lib/hours";

// Estado en vivo según el horario publicado (hora de Camas).
export function OpenStatus({ className = "" }: { className?: string }) {
  const now = useMadridNow();
  const state = now ? openState(now.day, now.minutes) : null;
  return (
    <p
      className={`status ${state ? (state.open ? "status--open" : "status--closed") : ""} ${className}`}
      aria-live="polite"
    >
      <span className="status__dot" aria-hidden="true" />
      <span>{state ? state.label : "Consulta nuestro horario"}</span>
    </p>
  );
}
