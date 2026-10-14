"use client";

import { createContext, useContext, useState } from "react";

// Estado compartido de la reserva simulada: lo usan el acceso rápido del
// inicio, el asistente de cita y la vista de agenda de la clínica.
// Nada sale del navegador y nada se guarda al recargar.

export type Patient = {
  name: string;
  phone: string;
  email: string;
  birth: string;
  reason: string;
  reminder: "sms" | "email";
};

export type Draft = {
  step: 0 | 1 | 2 | 3 | 4;
  typeId: string | null;
  dayIso: string | null;
  time: string | null;
  patient: Patient;
};

export type Booking = {
  code: string;
  typeId: string;
  dayIso: string;
  time: string;
  patient: Patient;
};

const emptyPatient: Patient = { name: "", phone: "", email: "", birth: "", reason: "", reminder: "sms" };
const emptyDraft: Draft = { step: 0, typeId: null, dayIso: null, time: null, patient: emptyPatient };

type Store = {
  draft: Draft;
  setDraft: (patch: Partial<Draft>) => void;
  booking: Booking | null;
  confirm: () => void;
  reset: () => void;
  quickPick: (dayIso: string, time: string) => void;
};

const Ctx = createContext<Store | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraftState] = useState<Draft>(emptyDraft);
  const [booking, setBooking] = useState<Booking | null>(null);

  const setDraft = (patch: Partial<Draft>) => setDraftState((d) => ({ ...d, ...patch }));

  const confirm = () => {
    const { typeId, dayIso, time, patient } = draft;
    if (!typeId || !dayIso || !time) return;
    const code = `ALQ-${dayIso.slice(5).replace("-", "")}-${time.replace(":", "")}`;
    setBooking({ code, typeId, dayIso, time, patient });
    setDraft({ step: 4 });
  };

  const reset = () => {
    setDraftState(emptyDraft);
    setBooking(null);
  };

  // Desde el inicio: se elige un hueco y se empieza por el tipo de cita.
  const quickPick = (dayIso: string, time: string) => {
    setDraftState({ ...emptyDraft, dayIso, time });
    setBooking(null);
    document.getElementById("cita")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Ctx.Provider value={{ draft, setDraft, booking, confirm, reset, quickPick }}>{children}</Ctx.Provider>
  );
}

export function useBooking() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useBooking fuera de BookingProvider");
  return s;
}
