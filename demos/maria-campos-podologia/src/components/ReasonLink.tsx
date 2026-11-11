"use client";

// Preselecciona un motivo en la reserva y baja hasta ella.
export default function ReasonLink({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <a
      href="#cita"
      className="reason-link"
      onClick={() => window.dispatchEvent(new CustomEvent("mc:reason", { detail: id }))}
    >
      {children}
    </a>
  );
}
