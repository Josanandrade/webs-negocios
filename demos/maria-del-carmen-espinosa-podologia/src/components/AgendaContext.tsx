"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { buildDays, type Day } from "@/lib/agenda";

// Estado compartido entre el formulario de cita y la vista de agenda.
// Vive solo en memoria de la pestaña: al recargar desaparece.

export type Request = {
  dayKey: string;
  time: string;
  name: string;
  surname: string;
  phone: string;
  email: string;
  firstVisit: "si" | "no";
  note: string;
  code: string;
};

type Ctx = {
  days: Day[] | null;
  request: Request | null;
  setRequest: (r: Request | null) => void;
};

const AgendaContext = createContext<Ctx | null>(null);

export function AgendaProvider({ children }: { children: React.ReactNode }) {
  const [days, setDays] = useState<Day[] | null>(null);
  const [request, setRequest] = useState<Request | null>(null);

  // Los huecos dependen de la fecha del visitante: se calculan ya en el navegador.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setDays(buildDays(new Date())), []);

  return <AgendaContext.Provider value={{ days, request, setRequest }}>{children}</AgendaContext.Provider>;
}

export function useAgenda() {
  const ctx = useContext(AgendaContext);
  if (!ctx) throw new Error("useAgenda fuera de AgendaProvider");
  return ctx;
}
