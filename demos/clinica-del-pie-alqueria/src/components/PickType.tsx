"use client";

import { useBooking } from "./BookingStore";

// Desde la lista de consultas: deja elegido el tipo y lleva a la agenda.
export default function PickType({ id, label }: { id: string; label: string }) {
  const { setDraft, booking, reset } = useBooking();
  return (
    <button
      type="button"
      className="btn btn-line btn-sm"
      onClick={() => {
        if (booking) reset();
        setDraft({ typeId: id, step: 1 });
        document.getElementById("cita")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      {label}
    </button>
  );
}
