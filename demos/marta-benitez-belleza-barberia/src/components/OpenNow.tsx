"use client";

import { useSyncExternalStore } from "react";
import { getStatus, type Status } from "./hours";

// Se recalcula cada minuto. En el HTML estático no se pinta nada, para que
// el estado nunca quede congelado con la hora del build.
let cached: Status | null = null;
const read = () => {
  const next = getStatus();
  if (!cached || cached.label !== next.label) cached = next;
  return cached;
};
const subscribe = (cb: () => void) => {
  const id = window.setInterval(cb, 60_000);
  return () => window.clearInterval(id);
};

export function useOpenStatus() {
  return useSyncExternalStore(subscribe, read, () => null);
}

export default function OpenNow({ className = "" }: { className?: string }) {
  const status = useOpenStatus();
  return (
    <p className={`open-now ${className}`} data-open={status?.open ?? undefined} aria-live="polite">
      {status ? (
        <>
          <span className="open-now__dot" aria-hidden="true" />
          {status.label}
        </>
      ) : (
        <span className="open-now__placeholder">&nbsp;</span>
      )}
    </p>
  );
}
