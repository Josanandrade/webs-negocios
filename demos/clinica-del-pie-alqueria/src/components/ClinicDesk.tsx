"use client";

import { visitTypes } from "@/content/site";
import { fmt, fromIso, nextWorkdays, slotsFor, useTodayIso } from "./agenda";
import { useBooking } from "./BookingStore";

// Vista de la agenda desde dentro de la clínica. Los demás pacientes son
// huecos ocupados anónimos: no se inventan nombres de personas reales.

type Row = { time: string; kind: "busy" | "free" | "new"; label: string; code?: string };

export default function ClinicDesk() {
  const { booking } = useBooking();
  const today = useTodayIso();
  const fallbackIso = today ? nextWorkdays(1, fromIso(today))[0].iso : null;

  const iso = booking?.dayIso ?? fallbackIso;
  const type = booking ? visitTypes.find((t) => t.id === booking.typeId) : null;

  let rows: Row[] = [];
  if (iso) {
    const day = { iso, date: fromIso(iso) };
    const s = slotsFor(day);
    rows = [...s.morning, ...s.afternoon].map((x) =>
      booking && x.time === booking.time
        ? { time: x.time, kind: "new", label: booking.patient.name, code: type?.code }
        : x.free
          ? { time: x.time, kind: "free", label: "Libre" }
          : { time: x.time, kind: "busy", label: "Ocupado" },
    );
  }
  const busy = rows.filter((r) => r.kind !== "free").length;

  return (
    <div className="desk" id="clinica-agenda">
      <div className="desk-bar">
        <span className="desk-dots" aria-hidden><i /><i /><i /></span>
        <p>Agenda de la clínica</p>
        <span className="desk-day">{iso ? fmt.long(fromIso(iso)) : ""}</span>
      </div>
      <div className="desk-body">
        <div className="desk-agenda">
          <div className="desk-stats">
            <span><strong className="mono">{busy}</strong> citas</span>
            <span><strong className="mono">{rows.length - busy}</strong> huecos</span>
            <span><strong className="mono">0</strong> llamadas para cuadrar</span>
          </div>
          <ol className="desk-list">
            {rows.map((r) => (
              <li key={r.time} data-kind={r.kind}>
                <span className="mono">{r.time}</span>
                <span className="desk-label">
                  {r.kind === "new" && <b className="desk-new">Nueva · web</b>}
                  {r.label}
                </span>
                {r.code && <span className="desk-code mono">{r.code}</span>}
              </li>
            ))}
          </ol>
        </div>

        <div className="desk-file">
          <p className="desk-file-h">
            Ficha del paciente
            <span className="desk-pill" data-on={!!booking}>{booking ? "Recibida desde la web" : "Ejemplo"}</span>
          </p>
          {booking && type ? (
            <dl>
              <div><dt>Paciente</dt><dd>{booking.patient.name}</dd></div>
              <div><dt>Teléfono</dt><dd className="mono">{booking.patient.phone}</dd></div>
              <div><dt>Email</dt><dd>{booking.patient.email || "—"}</dd></div>
              <div><dt>F. nacimiento</dt><dd className="mono">{booking.patient.birth || "—"}</dd></div>
              <div><dt>Tipo de cita</dt><dd>{type.name}</dd></div>
              <div><dt>Motivo</dt><dd>{booking.patient.reason || "No indicado"}</dd></div>
              <div><dt>Avisos</dt><dd>{booking.patient.reminder === "sms" ? "SMS" : "Email"} · recordatorio programado</dd></div>
              <div><dt>Localizador</dt><dd className="mono">{booking.code}</dd></div>
            </dl>
          ) : (
            <div className="desk-placeholder">
              <p>Haz una reserva de prueba en el apartado anterior y la verás aparecer aquí, con sus datos ya ordenados.</p>
              <a className="btn btn-solid" href="#cita">Probar la reserva</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
