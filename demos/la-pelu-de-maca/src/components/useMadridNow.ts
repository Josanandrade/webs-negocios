"use client";

import { useSyncExternalStore } from "react";

/* Día (0 = domingo) y minuto del día en Dos Hermanas, refrescado cada 30 s. */
export type MadridNow = { day: number; minutes: number };

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function snapshot(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  return `${DAYS.indexOf(get("weekday"))}:${Number(get("hour")) * 60 + Number(get("minute"))}`;
}

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 30_000);
  return () => window.clearInterval(id);
}

export function useMadridNow(): MadridNow | null {
  const value = useSyncExternalStore(subscribe, snapshot, () => null);
  if (!value) return null;
  const [day, minutes] = value.split(":").map(Number);
  return { day, minutes };
}
