"use client";

import { useEffect, useRef, useState } from "react";
import { agenda, business } from "@/content/site";

// Reserva SIMULADA: todo ocurre en memoria del navegador. No hay fetch, ni
// almacenamiento, ni envío de datos a ningún servicio.

type Day = { key: string; date: Date };
type Slot = { day: string; hour: number };
type Kind = "primera" | "paciente";

const kinds: { id: Kind; label: string; hint: string }[] = [
  { id: "primera", label: "Primera cita", hint: "Es la primera vez que vienes" },
  { id: "paciente", label: "Solicitar cita", hint: "Ya has venido a consulta" },
];

const dayFmt = new Intl.DateTimeFormat("es-ES", { weekday: "short" });
const numFmt = new Intl.DateTimeFormat("es-ES", { day: "numeric" });
const monthFmt = new Intl.DateTimeFormat("es-ES", { month: "long" });
const longFmt = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" });

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Ocupación de ejemplo, estable para cada fecha y hora.
function busy(dayKey: string, hour: number) {
  let h = 7;
  for (const c of `${dayKey}-${hour}`) h = (h * 31 + c.charCodeAt(0)) % 9973;
  return h % 10 < 3;
}

// Bloques de cinco días laborables (lunes a viernes) a partir de mañana.
function buildWeeks(today: Date, count: number): Day[][] {
  const days: Day[] = [];
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  while (days.length < count * 5) {
    if (d.getDay() !== 0 && d.getDay() !== 6) days.push({ key: iso(d), date: new Date(d) });
    d.setDate(d.getDate() + 1);
  }
  return Array.from({ length: count }, (_, w) => days.slice(w * 5, w * 5 + 5));
}

const hours = Array.from({ length: agenda.lastStartHour - agenda.firstHour + 1 }, (_, i) => agenda.firstHour + i);

export default function Booking() {
  const [weeks, setWeeks] = useState<Day[][] | null>(null);
  const [week, setWeek] = useState(0);
  const [focusDay, setFocusDay] = useState(0);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [kind, setKind] = useState<Kind>("primera");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Slot | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Las fechas dependen del día en que se visita: se calculan en el cliente.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fecha local del visitante, solo tras montar
    setWeeks(buildWeeks(new Date(), 2));
  }, []);

  const days = weeks?.[week] ?? [];
  const monthLabel = days.length
    ? cap(
        monthFmt.format(days[0].date) === monthFmt.format(days[4].date)
          ? monthFmt.format(days[0].date)
          : `${monthFmt.format(days[0].date)} – ${monthFmt.format(days[4].date)}`,
      )
    : "";

  function pick(s: Slot) {
    setSlot(s);
    setDone(null);
    setErrors({});
    // En móvil el formulario queda debajo: lo acercamos.
    if (window.matchMedia("(max-width: 899px)").matches) {
      requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Escribe tu nombre.";
    if (!/^[6789]\d{8}$/.test(phone.replace(/[\s.-]/g, ""))) next.phone = "Escribe un teléfono de 9 cifras.";
    if (!consent) next.consent = "Necesitamos tu permiso para poder contactarte.";
    setErrors(next);
    if (Object.keys(next).length || !slot) return;
    setDone(slot);
  }

  function reset() {
    setSlot(null);
    setDone(null);
    setName("");
    setPhone("");
    setConsent(false);
    setKind("primera");
  }

  const slotDate = (s: Slot) => {
    const d = weeks?.flat().find((x) => x.key === s.day);
    return d ? `${cap(longFmt.format(d.date))}, ${hh(s.hour)}` : "";
  };

  return (
    <div className="booking">
      <div className="cal" aria-label="Disponibilidad semanal">
        <div className="cal-top">
          <p className="cal-month" aria-live="polite">
            {monthLabel || " "}
          </p>
          <div className="cal-weeks" role="group" aria-label="Semana">
            <button type="button" onClick={() => setWeek(0)} aria-pressed={week === 0} disabled={!weeks}>
              Próximos días
            </button>
            <button type="button" onClick={() => setWeek(1)} aria-pressed={week === 1} disabled={!weeks}>
              Más adelante
            </button>
          </div>
        </div>

        {/* Pestañas de día: solo visibles en móvil. */}
        <div className="cal-tabs" role="tablist" aria-label="Día">
          {days.map((d, i) => {
            return (
              <button
                key={d.key}
                type="button"
                role="tab"
                aria-selected={focusDay === i}
                onClick={() => setFocusDay(i)}
              >
                <span>{dayFmt.format(d.date).replace(".", "")}</span>
                <strong>{numFmt.format(d.date)}</strong>
              </button>
            );
          })}
        </div>

        <div className="cal-grid">
          {!weeks &&
            Array.from({ length: 5 }, (_, i) => <div key={i} className="cal-col cal-col-skeleton" aria-hidden="true" />)}
          {days.map((d, i) => {
            return (
              <div key={d.key} className={`cal-col${focusDay === i ? " is-focus" : ""}`}>
                <p className="cal-day">
                  <span>{dayFmt.format(d.date).replace(".", "")}</span>
                  <strong>{numFmt.format(d.date)}</strong>
                </p>
                <ul>
                  {hours.map((h) => {
                    const taken = busy(d.key, h);
                    const chosen = slot?.day === d.key && slot.hour === h;
                    const mine = done?.day === d.key && done.hour === h;
                    return (
                      <li key={h}>
                        <button
                          type="button"
                          className={`slot${taken ? " is-taken" : ""}${chosen ? " is-chosen" : ""}${mine ? " is-mine" : ""}`}
                          disabled={taken || !!done}
                          aria-pressed={chosen}
                          aria-label={`${cap(longFmt.format(d.date))}, ${hh(h)}${taken ? ", ocupado" : ""}`}
                          onClick={() => pick({ day: d.key, hour: h })}
                        >
                          {mine ? "Tu cita" : taken ? "—" : hh(h)}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="cal-legend">
          <span className="lg lg-free" /> Libre <span className="lg lg-taken" /> Ocupado
          <span className="lg lg-chosen" /> Tu elección
        </p>
      </div>

      <div className="panel" ref={panelRef}>
        {done ? (
          <div className="ticket" role="status">
            <p className="ticket-kicker">Solicitud recibida</p>
            <p className="ticket-when">{slotDate(done)}</p>
            <dl className="ticket-data">
              <div>
                <dt>Cita</dt>
                <dd>{kinds.find((k) => k.id === kind)?.label}</dd>
              </div>
              <div>
                <dt>A nombre de</dt>
                <dd>{name.trim()}</dd>
              </div>
              <div>
                <dt>Lugar</dt>
                <dd>
                  {business.street}, {business.town}
                </dd>
              </div>
            </dl>
            <p className="ticket-note">
              La consulta te llamaría al {phone.trim()} para confirmar la hora.
            </p>
            <p className="demo-flag">Demostración: no se ha reservado nada ni se ha enviado ningún dato.</p>
            <button type="button" className="btn btn-ghost" onClick={reset}>
              Hacer otra solicitud
            </button>
          </div>
        ) : slot ? (
          <form className="form" onSubmit={submit} noValidate>
            <p className="form-when">
              <span>Hueco elegido</span>
              <strong>{slotDate(slot)}</strong>
            </p>

            <fieldset className="kinds">
              <legend>Tipo de cita</legend>
              {kinds.map((k) => (
                <label key={k.id} className={kind === k.id ? "is-on" : ""}>
                  <input
                    type="radio"
                    name="kind"
                    value={k.id}
                    checked={kind === k.id}
                    onChange={() => setKind(k.id)}
                  />
                  <span>{k.label}</span>
                  <small>{k.hint}</small>
                </label>
              ))}
            </fieldset>

            <label className="field">
              <span>Nombre</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "e-name" : undefined}
              />
              {errors.name && <em id="e-name">{errors.name}</em>}
            </label>
            <label className="field">
              <span>Teléfono</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                autoComplete="off"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "e-phone" : undefined}
              />
              {errors.phone && <em id="e-phone">{errors.phone}</em>}
            </label>
            <p className="form-hint">No hace falta que expliques el motivo de la consulta.</p>

            <label className="check">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>Acepto que la consulta me llame a este teléfono para confirmar la cita.</span>
            </label>
            {errors.consent && <em className="check-error">{errors.consent}</em>}

            <div className="form-actions">
              <button type="submit" className="btn">
                Solicitar esta hora
              </button>
              <button type="button" className="link" onClick={() => setSlot(null)}>
                Cambiar hueco
              </button>
            </div>
            <p className="demo-flag">Reserva de demostración: no se envía ni se guarda nada.</p>
          </form>
        ) : (
          <div className="panel-empty">
            <p className="panel-empty-t">Elige un hueco libre</p>
            <p>
              Verás aquí el resumen de tu solicitud. Si lo prefieres, llama al{" "}
              <a href={business.phoneHref}>{business.phoneDisplay}</a>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
