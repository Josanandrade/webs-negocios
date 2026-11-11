"use client";

import { useMemo, useRef, useState } from "react";
import { clinic, visitTypes } from "@/content/site";
import { freeCount, fmt, fromIso, nextWorkdays, slotsFor, useTodayIso, type Day } from "./agenda";
import { useBooking, type Patient } from "./BookingStore";

const STEPS = ["Tipo de cita", "Día y hora", "Tus datos", "Revisar"];

export default function Booking() {
  const { draft, setDraft, booking, confirm, reset } = useBooking();
  const top = useRef<HTMLDivElement>(null);

  // Las fechas dependen del día en que se abre la web: se calculan en el navegador.
  const today = useTodayIso();
  const days = useMemo(() => (today ? nextWorkdays(10, fromIso(today)) : []), [today]);

  const type = visitTypes.find((t) => t.id === draft.typeId) ?? null;
  const step = draft.step;

  const go = (s: typeof step) => {
    setDraft({ step: s });
    const el = top.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bk" ref={top}>
      <div className="bk-main">
        {step < 4 && (
          <ol className="bk-steps" aria-label="Pasos de la reserva">
            {STEPS.map((label, i) => (
              <li key={label} data-state={i < step ? "done" : i === step ? "now" : "next"}>
                <button type="button" onClick={() => i < step && go(i as typeof step)} disabled={i >= step}>
                  <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                  {label}
                </button>
              </li>
            ))}
          </ol>
        )}

        {step === 0 && (
          <fieldset className="bk-panel">
            <legend>¿Qué tipo de cita necesitas?</legend>
            <div className="bk-types">
              {visitTypes.map((t) => (
                <label key={t.id} className="bk-type" data-on={draft.typeId === t.id}>
                  <input
                    type="radio"
                    name="tipo"
                    value={t.id}
                    checked={draft.typeId === t.id}
                    onChange={() => setDraft({ typeId: t.id })}
                  />
                  <span className="bk-code mono">{t.code}</span>
                  <span className="bk-type-txt">
                    <strong>{t.name}</strong>
                    <small>{t.forWho}</small>
                    <span>{t.detail}</span>
                  </span>
                </label>
              ))}
            </div>
            <Nav next={() => go(1)} canNext={!!type} />
          </fieldset>
        )}

        {step === 1 && (
          <fieldset className="bk-panel">
            <legend>Elige día y hora</legend>
            <DayStrip days={days} value={draft.dayIso} onPick={(iso) => setDraft({ dayIso: iso, time: null })} />
            <Slots
              day={days.find((d) => d.iso === draft.dayIso) ?? null}
              value={draft.time}
              onPick={(time) => setDraft({ time })}
            />
            <p className="bk-note">Horarios de ejemplo. En la web real se mostraría la agenda configurada por la clínica.</p>
            <Nav back={() => go(0)} next={() => go(2)} canNext={!!draft.dayIso && !!draft.time} />
          </fieldset>
        )}

        {step === 2 && <PatientForm onBack={() => go(1)} onNext={() => go(3)} />}

        {step === 3 && type && draft.dayIso && draft.time && (
          <div className="bk-panel">
            <h3 className="bk-legend">Revisa y confirma</h3>
            <dl className="bk-review">
              <div><dt>Cita</dt><dd>{type.name}</dd></div>
              <div><dt>Día</dt><dd>{fmt.long(fromIso(draft.dayIso))}</dd></div>
              <div><dt>Hora</dt><dd className="mono">{draft.time}</dd></div>
              <div><dt>Paciente</dt><dd>{draft.patient.name}</dd></div>
              <div><dt>Teléfono</dt><dd className="mono">{draft.patient.phone}</dd></div>
              {draft.patient.email && <div><dt>Email</dt><dd>{draft.patient.email}</dd></div>}
              {draft.patient.reason && <div><dt>Motivo</dt><dd>{draft.patient.reason}</dd></div>}
              <div><dt>Lugar</dt><dd>{clinic.street}, {clinic.town}</dd></div>
            </dl>
            <p className="bk-demo" role="note">
              Demostración: al confirmar no se crea ninguna cita ni se envía ningún dato.
            </p>
            <Nav
              back={() => go(2)}
              next={() => {
                confirm();
                top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              canNext
              nextLabel="Confirmar cita"
            />
          </div>
        )}

        {step === 4 && booking && type && (
          <div className="bk-panel bk-done" role="status">
            <div className="bk-check" aria-hidden>
              <svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7" /></svg>
            </div>
            <p className="eyebrow">Cita registrada (simulación)</p>
            <h3>
              {fmt.long(fromIso(booking.dayIso))}, <span className="mono">{booking.time}</span>
            </h3>
            <p>
              {type.name} en {clinic.name}. Localizador <strong className="mono">{booking.code}</strong>.
            </p>
            <ul className="bk-after">
              <li>Con la web real, recibirías la confirmación por {booking.patient.reminder === "sms" ? "SMS" : "email"} y un recordatorio antes de la cita.</li>
              <li>Podrías cambiar o anular la cita desde el enlace del mensaje, sin llamar.</li>
              <li>La clínica ya tendría tu ficha básica en su agenda (míralo justo debajo).</li>
            </ul>
            <p className="bk-demo" role="note">
              Esto es una demostración: no se ha reservado nada y tus datos no han salido de este navegador.
            </p>
            <div className="bk-nav">
              <a className="btn btn-ghost" href="#clinica-agenda">Ver cómo le llega a la clínica</a>
              <button type="button" className="btn btn-line" onClick={reset}>Hacer otra prueba</button>
            </div>
          </div>
        )}
      </div>

      <aside className="bk-side" aria-label="Resumen de tu cita">
        <p className="bk-side-h">Tu cita</p>
        <Row k="Tipo" v={type?.name} />
        <Row k="Día" v={draft.dayIso ? fmt.long(fromIso(draft.dayIso)) : null} />
        <Row k="Hora" v={draft.time} mono />
        <Row k="Paciente" v={draft.patient.name || null} />
        <div className="bk-side-foot">
          <span>{clinic.street}</span>
          <span>{clinic.postalCode} {clinic.town}</span>
        </div>
      </aside>
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string | null | undefined; mono?: boolean }) {
  return (
    <div className="bk-row" data-empty={!v}>
      <span>{k}</span>
      <strong className={mono ? "mono" : undefined}>{v ?? "—"}</strong>
    </div>
  );
}

function Nav({
  back,
  next,
  canNext,
  nextLabel = "Continuar",
}: {
  back?: () => void;
  next: () => void;
  canNext: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="bk-nav">
      {back && (
        <button type="button" className="btn btn-line" onClick={back}>
          Atrás
        </button>
      )}
      <button type="button" className="btn btn-solid" onClick={next} disabled={!canNext}>
        {nextLabel}
      </button>
    </div>
  );
}

function DayStrip({ days, value, onPick }: { days: Day[]; value: string | null; onPick: (iso: string) => void }) {
  if (!days.length) return <div className="bk-days" aria-busy />;
  return (
    <div className="bk-days" role="radiogroup" aria-label="Día">
      {days.map((d) => {
        const n = freeCount(d);
        return (
          <button
            key={d.iso}
            type="button"
            role="radio"
            aria-checked={value === d.iso}
            className="bk-day"
            disabled={n === 0}
            onClick={() => onPick(d.iso)}
          >
            <span className="bk-day-wd">{fmt.wd(d.date)}</span>
            <span className="bk-day-n">{d.date.getDate()}</span>
            <span className="bk-day-m">{fmt.month(d.date)}</span>
            <span className="bk-day-free" data-low={n <= 3}>
              {n} libres
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Slots({ day, value, onPick }: { day: Day | null; value: string | null; onPick: (t: string) => void }) {
  const s = useMemo(() => (day ? slotsFor(day) : null), [day]);
  if (!day || !s) return <p className="bk-empty">Selecciona un día para ver las horas disponibles.</p>;
  const group = (label: string, list: { time: string; free: boolean }[]) =>
    list.length ? (
      <div className="bk-slotgroup">
        <p>{label}</p>
        <div className="bk-slots" role="radiogroup" aria-label={label}>
          {list.map((x) => (
            <button
              key={x.time}
              type="button"
              role="radio"
              aria-checked={value === x.time}
              className="bk-slot mono"
              disabled={!x.free}
              onClick={() => onPick(x.time)}
            >
              {x.time}
            </button>
          ))}
        </div>
      </div>
    ) : (
      <div className="bk-slotgroup">
        <p>{label}</p>
        <p className="bk-empty">Sin consulta este día.</p>
      </div>
    );
  return (
    <div className="bk-slotwrap">
      <p className="bk-dayname">{fmt.long(day.date)}</p>
      {group("Mañana", s.morning)}
      {group("Tarde", s.afternoon)}
    </div>
  );
}

function PatientForm({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const { draft, setDraft } = useBooking();
  const p = draft.patient;
  const [consent, setConsent] = useState(false);
  const [touched, setTouched] = useState(false);
  const set = (patch: Partial<Patient>) => setDraft({ patient: { ...p, ...patch } });

  const digits = p.phone.replace(/\D/g, "");
  const errors = {
    name: p.name.trim().length < 3 ? "Escribe nombre y apellidos." : "",
    phone: !/^[6789]\d{8}$/.test(digits) ? "Teléfono de 9 cifras." : "",
    email: p.email && !/^\S+@\S+\.\S+$/.test(p.email) ? "Revisa el email." : "",
    consent: !consent ? "Necesario para continuar." : "",
  };
  const ok = !Object.values(errors).some(Boolean);

  return (
    <form
      className="bk-panel"
      noValidate
      onSubmit={(e) => {
        // Formulario simulado: nunca se envía.
        e.preventDefault();
        setTouched(true);
        if (ok) onNext();
      }}
    >
      <h3 className="bk-legend">Ficha básica del paciente</h3>
      <p className="bk-sub">Solo lo necesario para que la clínica te identifique y pueda avisarte.</p>
      <div className="bk-fields">
        <Field label="Nombre y apellidos" error={touched ? errors.name : ""} wide>
          <input autoComplete="name" value={p.name} onChange={(e) => set({ name: e.target.value })} />
        </Field>
        <Field label="Teléfono móvil" error={touched ? errors.phone : ""}>
          <input inputMode="tel" autoComplete="tel" value={p.phone} onChange={(e) => set({ phone: e.target.value })} />
        </Field>
        <Field label="Email" hint="Opcional" error={touched ? errors.email : ""}>
          <input type="email" autoComplete="email" value={p.email} onChange={(e) => set({ email: e.target.value })} />
        </Field>
        <Field label="Fecha de nacimiento" hint="Opcional">
          <input type="date" value={p.birth} onChange={(e) => set({ birth: e.target.value })} />
        </Field>
        <Field label="Avisos de la cita">
          <select value={p.reminder} onChange={(e) => set({ reminder: e.target.value as Patient["reminder"] })}>
            <option value="sms">Por SMS</option>
            <option value="email">Por email</option>
          </select>
        </Field>
        <Field label="Motivo de la consulta" hint="Opcional, en pocas palabras" wide>
          <textarea rows={3} maxLength={240} value={p.reason} onChange={(e) => set({ reason: e.target.value })} />
        </Field>
      </div>
      <label className="bk-consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>Acepto que la clínica use estos datos para gestionar mi cita.</span>
      </label>
      {touched && errors.consent && <p className="bk-err">{errors.consent}</p>}
      <div className="bk-nav">
        <button type="button" className="btn btn-line" onClick={onBack}>
          Atrás
        </button>
        <button type="submit" className="btn btn-solid">
          Revisar cita
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  wide,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="bk-field" data-wide={wide} data-error={!!error}>
      <span className="bk-label">
        {label} {hint && <em>{hint}</em>}
      </span>
      {children}
      {error && <span className="bk-err">{error}</span>}
    </label>
  );
}
