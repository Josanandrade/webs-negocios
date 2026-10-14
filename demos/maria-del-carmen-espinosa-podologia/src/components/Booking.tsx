"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { appointmentType, practice } from "@/content/site";
import { isMorning, longDate, shortWeekday, monthName, type Day } from "@/lib/agenda";
import { useAgenda, type Request } from "./AgendaContext";

type Step = "when" | "who" | "check" | "done";
type Fields = Omit<Request, "dayKey" | "time" | "code">;
type Errors = Partial<Record<keyof Fields | "consent", string>>;

const EMPTY: Fields = { name: "", surname: "", phone: "", email: "", firstVisit: "si", note: "" };
const STEPS: { id: Exclude<Step, "done">; label: string }[] = [
  { id: "when", label: "Día y hora" },
  { id: "who", label: "Tus datos" },
  { id: "check", label: "Confirmar" },
];

const mondayOf = (d: Date) => {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
};
// Nombre de la semana contado desde la de hoy (el fin de semana ya mira a la siguiente).
const weekLabel = (first: Date) => {
  const ahead = Math.round((mondayOf(first).getTime() - mondayOf(new Date()).getTime()) / (7 * 864e5));
  return ["Esta semana", "La semana que viene", "Dentro de dos semanas", "Dentro de tres semanas"][ahead] ?? "Más adelante";
};

function groupByWeek(days: Day[]) {
  const weeks: Day[][] = [];
  let last = -1;
  for (const d of days) {
    // Lunes de la semana como identificador.
    const id = mondayOf(d.date).getTime();
    if (id !== last) {
      weeks.push([]);
      last = id;
    }
    weeks[weeks.length - 1].push(d);
  }
  return weeks;
}

function validate(f: Fields, consent: boolean): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Escribe tu nombre.";
  if (f.surname.trim().length < 2) e.surname = "Escribe al menos un apellido.";
  const digits = f.phone.replace(/[\s.-]/g, "").replace(/^\+?34/, "");
  if (!/^[6789]\d{8}$/.test(digits)) e.phone = "Necesitamos un teléfono de 9 cifras para avisarte.";
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Revisa el correo o déjalo en blanco.";
  if (!consent) e.consent = "Marca la casilla para poder continuar.";
  return e;
}

function icsFor(r: Request, d: Date) {
  const [h, m] = r.time.split(":").map(Number);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m);
  const end = new Date(start.getTime() + 30 * 60000);
  const fmt = (x: Date) =>
    `${x.getFullYear()}${String(x.getMonth() + 1).padStart(2, "0")}${String(x.getDate()).padStart(2, "0")}T${String(
      x.getHours(),
    ).padStart(2, "0")}${String(x.getMinutes()).padStart(2, "0")}00`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//demo//cita//ES",
    "BEGIN:VEVENT",
    `UID:${r.code}@demo`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${appointmentType} (demostración)`,
    `LOCATION:${practice.street}\\, ${practice.postcode} ${practice.town}`,
    "DESCRIPTION:Cita de demostración. No existe en la agenda real de la consulta.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export default function Booking() {
  const { days, request, setRequest } = useAgenda();
  const [step, setStep] = useState<Step>("when");
  const [dayKey, setDayKey] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const headRef = useRef<HTMLHeadingElement>(null);
  const timesRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const weeks = useMemo(() => (days ? groupByWeek(days) : []), [days]);
  const day = days?.find((d) => d.key === dayKey) ?? null;
  const freeOf = (d: Day) => d.slots.filter((s) => s.free).length;

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headRef.current?.focus();
  }, [step]);

  const set = (k: keyof Fields) => (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFields((f) => ({ ...f, [k]: ev.target.value }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submitWho = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate(fields, consent);
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    setStep("check");
  };

  const confirm = () => {
    if (!day || !time) return;
    setSending(true);
    // Simulación: no se envía nada a ningún sitio.
    window.setTimeout(() => {
      const code = `MCE-${String(Math.floor(1000 + Math.random() * 9000))}`;
      setRequest({ ...fields, dayKey: day.key, time, code });
      setSending(false);
      setStep("done");
    }, 700);
  };

  const restart = () => {
    setRequest(null);
    setDayKey(null);
    setTime(null);
    setFields(EMPTY);
    setConsent(false);
    setErrors({});
    setStep("when");
  };

  const downloadIcs = () => {
    if (!request || !day) return;
    const url = URL.createObjectURL(new Blob([icsFor(request, day.date)], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "cita-podologia-demo.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="booking">
      {/* Resguardo: se va rellenando mientras eliges. */}
      <aside className={`stub ${step === "done" ? "stub-done" : ""}`} aria-label="Resumen de tu cita">
        <p className="stub-kicker">{step === "done" ? "Cita reservada" : "Tu cita"}</p>
        <dl>
          <div>
            <dt>Consulta</dt>
            <dd>{appointmentType}</dd>
          </div>
          <div>
            <dt>Día</dt>
            <dd className={day ? "" : "empty"}>{day ? longDate(day.date) : "Sin elegir"}</dd>
          </div>
          <div>
            <dt>Hora</dt>
            <dd className={time ? "" : "empty"}>{time ?? "Sin elegir"}</dd>
          </div>
          <div>
            <dt>Paciente</dt>
            <dd className={fields.name ? "" : "empty"}>
              {fields.name ? `${fields.name} ${fields.surname}`.trim() : "Sin rellenar"}
            </dd>
          </div>
        </dl>
        <p className="stub-place">
          {practice.street}
          <br />
          {practice.postcode} {practice.town}
        </p>
        {step === "done" && request && <p className="stub-code">Código {request.code}</p>}
      </aside>

      <div className="panel">
        {step !== "done" && (
          <ol className="progress" aria-label="Pasos para pedir cita">
            {STEPS.map((s, i) => (
              <li key={s.id} className={i < stepIndex ? "is-done" : i === stepIndex ? "is-now" : ""} aria-current={i === stepIndex ? "step" : undefined}>
                <span>{i + 1}</span> {s.label}
              </li>
            ))}
          </ol>
        )}

        {step === "when" && (
          <div>
            <h3 ref={headRef} tabIndex={-1}>
              ¿Qué día te viene bien?
            </h3>
            {!days && <p className="muted">Cargando huecos…</p>}
            {weeks.map((week, wi) => (
              <fieldset key={wi} className="week">
                <legend>
                  {weekLabel(week[0].date)} <span>· {monthName(week[0].date)}</span>
                </legend>
                <div className="days">
                  {week.map((d) => {
                    const free = freeOf(d);
                    return (
                      <button
                        key={d.key}
                        type="button"
                        className={`day ${dayKey === d.key ? "is-on" : ""}`}
                        disabled={free === 0}
                        aria-pressed={dayKey === d.key}
                        aria-label={`${longDate(d.date)}, ${free === 0 ? "sin huecos" : `${free} horas libres`}`}
                        onClick={() => {
                          setDayKey(d.key);
                          setTime(null);
                          // En móvil las horas quedan debajo: las acercamos.
                          window.setTimeout(() => timesRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
                        }}
                      >
                        <span className="day-wd">{shortWeekday(d.date)}</span>
                        <span className="day-n">{d.date.getDate()}</span>
                        <span className="day-free">{free === 0 ? "lleno" : `${free} libres`}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            {day && (
              <div className="times" aria-live="polite" ref={timesRef}>
                <p className="times-head">
                  Horas libres el <strong>{longDate(day.date)}</strong>
                </p>
                {(["Mañana", "Tarde"] as const).map((part) => {
                  const slots = day.slots.filter((s) => (part === "Mañana" ? isMorning(s.time) : !isMorning(s.time)));
                  return (
                    <div key={part} className="times-row">
                      <span className="times-part">{part}</span>
                      <div className="chips">
                        {slots.map((s) => (
                          <button
                            key={s.time}
                            type="button"
                            className={`chip ${time === s.time ? "is-on" : ""}`}
                            disabled={!s.free}
                            aria-pressed={time === s.time}
                            aria-label={s.free ? `A las ${s.time}` : `${s.time}, ocupada`}
                            onClick={() => setTime(s.time)}
                          >
                            {s.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="panel-foot">
              <p className="muted small">Días y horas de demostración.</p>
              <button type="button" className="btn btn-main" disabled={!day || !time} onClick={() => setStep("who")}>
                Seguir con mis datos
              </button>
            </div>
          </div>
        )}

        {step === "who" && (
          <form onSubmit={submitWho} noValidate>
            <h3 ref={headRef} tabIndex={-1}>
              ¿A nombre de quién?
            </h3>
            <p className="muted">Lo justo para poder avisarte si hay que cambiar algo.</p>
            <div className="grid2">
              <Field id="name" label="Nombre" error={errors.name}>
                <input id="f-name" autoComplete="given-name" value={fields.name} onChange={set("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "e-name" : undefined} />
              </Field>
              <Field id="surname" label="Apellidos" error={errors.surname}>
                <input id="f-surname" autoComplete="family-name" value={fields.surname} onChange={set("surname")} aria-invalid={!!errors.surname} aria-describedby={errors.surname ? "e-surname" : undefined} />
              </Field>
              <Field id="phone" label="Teléfono móvil" error={errors.phone}>
                <input id="f-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="600 000 000" value={fields.phone} onChange={set("phone")} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "e-phone" : undefined} />
              </Field>
              <Field id="email" label="Correo electrónico" optional error={errors.email}>
                <input id="f-email" type="email" inputMode="email" autoComplete="email" value={fields.email} onChange={set("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "e-email" : undefined} />
              </Field>
            </div>

            <fieldset className="choice">
              <legend>¿Es tu primera vez en la consulta?</legend>
              {(
                [
                  ["si", "Sí, es la primera vez"],
                  ["no", "No, ya he venido antes"],
                ] as const
              ).map(([v, l]) => (
                <label key={v} className={`radio ${fields.firstVisit === v ? "is-on" : ""}`}>
                  <input type="radio" name="firstVisit" value={v} checked={fields.firstVisit === v} onChange={() => setFields((f) => ({ ...f, firstVisit: v }))} />
                  {l}
                </label>
              ))}
            </fieldset>

            <Field id="note" label="¿Algo que quieras contar antes de la cita?" optional>
              <textarea id="f-note" rows={3} maxLength={300} value={fields.note} onChange={set("note")} placeholder="Por ejemplo: qué te molesta o desde cuándo." />
            </Field>

            <label className={`consent ${errors.consent ? "has-error" : ""}`}>
              <input
                id="f-consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  if (errors.consent) setErrors((x) => ({ ...x, consent: undefined }));
                }}
                aria-describedby={errors.consent ? "e-consent" : undefined}
              />
              <span>Acepto que la consulta use estos datos solo para gestionar mi cita.</span>
            </label>
            {errors.consent && (
              <p id="e-consent" className="error">
                {errors.consent}
              </p>
            )}

            <div className="panel-foot">
              <button type="button" className="btn btn-quiet" onClick={() => setStep("when")}>
                Volver
              </button>
              <button type="submit" className="btn btn-main">
                Revisar la cita
              </button>
            </div>
          </form>
        )}

        {step === "check" && day && time && (
          <div>
            <h3 ref={headRef} tabIndex={-1}>
              Repasa y confirma
            </h3>
            <ul className="review">
              <li>
                <span>Cuándo</span>
                <strong>
                  {longDate(day.date)}, a las {time}
                </strong>
                <button type="button" className="link" onClick={() => setStep("when")}>
                  Cambiar
                </button>
              </li>
              <li>
                <span>Quién</span>
                <strong>
                  {fields.name} {fields.surname} · {fields.phone}
                  {fields.email && ` · ${fields.email}`}
                </strong>
                <button type="button" className="link" onClick={() => setStep("who")}>
                  Cambiar
                </button>
              </li>
              <li>
                <span>Primera vez</span>
                <strong>{fields.firstVisit === "si" ? "Sí" : "No"}</strong>
              </li>
              {fields.note && (
                <li>
                  <span>Nota</span>
                  <strong className="note">{fields.note}</strong>
                </li>
              )}
            </ul>
            <p className="demo-note">Es una demostración: al confirmar no se envía nada ni se crea ninguna cita real.</p>
            <div className="panel-foot">
              <button type="button" className="btn btn-quiet" onClick={() => setStep("who")}>
                Volver
              </button>
              <button type="button" className="btn btn-main" onClick={confirm} disabled={sending} aria-busy={sending}>
                {sending ? "Reservando…" : "Confirmar cita"}
              </button>
            </div>
          </div>
        )}

        {step === "done" && request && day && (
          <div className="done">
            <span className="done-mark" aria-hidden="true">
              <svg viewBox="0 0 40 40">
                <path d="M11 21l6 6 13-14" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h3 ref={headRef} tabIndex={-1}>
              Listo, {request.name}. Te esperamos el {longDate(day.date)} a las {request.time}.
            </h3>
            <p>
              Tu hueco ya aparece en la agenda de la consulta. Si necesitas cambiarlo, puedes volver a pedir cita aquí o llamar al{" "}
              <a href={practice.phoneHref}>{practice.phone}</a>.
            </p>
            <p className="demo-note">Demostración: no se ha enviado ningún mensaje ni se ha guardado ningún dato.</p>
            <div className="done-actions">
              <a href="#agenda" className="btn btn-main">
                Ver cómo le llega a la consulta
              </a>
              <button type="button" className="btn btn-quiet" onClick={downloadIcs}>
                Añadir a mi calendario
              </button>
              <button type="button" className="link" onClick={restart}>
                Pedir otra cita
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ id, label, optional, error, children }: { id: string; label: string; optional?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      <label htmlFor={`f-${id}`}>
        {label} {optional && <span className="opt">(opcional)</span>}
      </label>
      {children}
      {error && (
        <p id={`e-${id}`} className="error">
          {error}
        </p>
      )}
    </div>
  );
}
