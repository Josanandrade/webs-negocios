"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { practice, reasons, type Reason } from "@/content/site";

// Reserva 100 % simulada: no hay red, ni base de datos, ni correo. Todo vive
// en el estado de este componente y se pierde al recargar.

type Step = "reason" | "day" | "time" | "details" | "done";

type Day = { key: string; date: Date; full: boolean };

const WEEKDAY = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const WEEKDAY_LONG = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTH = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

const MORNING = ["09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30"];
const AFTERNOON = ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30"];

// Hash estable para que la «agenda de ejemplo» no cambie en cada render.
const seeded = (s: string) => {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0) / 4294967295;
};

const ymd = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

function nextDays(from: Date, count: number): Day[] {
  const out: Day[] = [];
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  while (out.length < count) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd === 0 || wd === 6) continue;
    const key = ymd(d);
    out.push({ key, date: new Date(d), full: seeded(key) > 0.86 });
  }
  return out;
}

const isTaken = (day: string, time: string) => seeded(`${day}|${time}`) > 0.62;

const longDate = (d: Date) => `${WEEKDAY_LONG[d.getDay()]} ${d.getDate()} de ${MONTH[d.getMonth()]}`;

export default function Booking() {
  const [days, setDays] = useState<Day[]>([]);
  const [step, setStep] = useState<Step>("reason");
  const [reason, setReason] = useState<Reason | null>(null);
  const [day, setDay] = useState<Day | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", note: "", consent: false });
  const [tried, setTried] = useState(false);
  const [code, setCode] = useState("");
  const top = useRef<HTMLDivElement>(null);

  // Las fechas se calculan en el navegador para no fijarlas en el build.
  useEffect(() => {
    const t = window.setTimeout(() => setDays(nextDays(new Date(), 15)), 0);
    return () => window.clearTimeout(t);
  }, []);

  // Los motivos de la sección «Motivos de cita» preseleccionan aquí.
  useEffect(() => {
    const onPick = (e: Event) => {
      const r = reasons.find((x) => x.id === (e as CustomEvent<string>).detail);
      if (!r) return;
      setReason(r);
      setStep(day ? (time ? "details" : "time") : "day");
    };
    window.addEventListener("mc:reason", onPick);
    return () => window.removeEventListener("mc:reason", onPick);
  }, [day, time]);

  const go = (s: Step) => {
    setStep(s);
    // Tras cada paso, que el panel nuevo quede a la vista (sobre todo en móvil).
    requestAnimationFrame(() => {
      const el = top.current?.querySelector<HTMLElement>(".panel, .done");
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.top < 70 || r.top > window.innerHeight * 0.55) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const freeCount = useMemo(() => {
    if (!day) return 0;
    return [...MORNING, ...AFTERNOON].filter((t) => !isTaken(day.key, t)).length;
  }, [day]);

  const phoneOk = /^[6789]\d{8}$/.test(form.phone.replace(/\s/g, ""));
  const nameOk = form.name.trim().split(/\s+/).length >= 2;
  const emailOk = !form.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const detailsOk = phoneOk && nameOk && emailOk && form.consent;

  const confirm = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!detailsOk) return;
    setCode(`MC-${Math.floor(1000 + seeded(`${form.phone}|${day?.key}|${time}`) * 8999)}`);
    go("done");
  };

  const reset = () => {
    setReason(null);
    setDay(null);
    setTime(null);
    setForm({ name: "", phone: "", email: "", note: "", consent: false });
    setTried(false);
    go("reason");
  };

  const blank = (label: string, value: string | null, target: Step, enabled: boolean) => (
    <button
      type="button"
      className={`blank${value ? " is-filled" : ""}${step === target ? " is-active" : ""}`}
      onClick={() => enabled && step !== "done" && go(target)}
      disabled={!enabled || step === "done"}
      aria-label={value ? `${label}: ${value}. Cambiar` : `Elegir ${label}`}
    >
      {value ?? label}
    </button>
  );

  return (
    <div className="booking" ref={top}>
      <p className="sentence" aria-live="polite">
        Quiero pedir cita para {blank("motivo", reason?.inSentence ?? null, "reason", true)} el{" "}
        {blank("día", day ? longDate(day.date) : null, "day", !!reason)} a las{" "}
        {blank("hora", time, "time", !!day)}.
      </p>

      <ol className="progress" aria-label="Pasos de la reserva">
        {(["reason", "day", "time", "details", "done"] as Step[]).map((s, i) => (
          <li key={s} className={s === step ? "is-now" : ""}>
            <span>{i + 1}</span>
            {["Motivo", "Día", "Hora", "Tus datos", "Listo"][i]}
          </li>
        ))}
      </ol>

      {step === "reason" && (
        <fieldset className="panel">
          <legend>¿Por qué quieres venir?</legend>
          <div className="reasons">
            {reasons.map((r) => (
              <button
                type="button"
                key={r.id}
                className={`reason${reason?.id === r.id ? " is-on" : ""}`}
                onClick={() => {
                  setReason(r);
                  go(day ? "time" : "day");
                }}
              >
                <strong>{r.label}</strong>
                <span>{r.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {step === "day" && (
        <fieldset className="panel">
          <legend>Elige un día</legend>
          <p className="panel-note">Días con huecos libres en las próximas tres semanas.</p>
          <div className="days" role="list">
            {days.map((d) => (
              <button
                type="button"
                role="listitem"
                key={d.key}
                className={`day${day?.key === d.key ? " is-on" : ""}`}
                disabled={d.full}
                onClick={() => {
                  setDay(d);
                  setTime(null);
                  go("time");
                }}
              >
                <small>{WEEKDAY[d.date.getDay()]}</small>
                <b>{d.date.getDate()}</b>
                <small>{d.full ? "completo" : MONTH[d.date.getMonth()].slice(0, 3)}</small>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {step === "time" && day && (
        <fieldset className="panel">
          <legend>¿A qué hora te viene bien?</legend>
          <p className="panel-note">
            {longDate(day.date)} · {freeCount} huecos libres
          </p>
          {[
            ["Mañana", MORNING],
            ["Tarde", AFTERNOON],
          ].map(([label, list]) => (
            <div className="times" key={label as string}>
              <h4>{label as string}</h4>
              <div>
                {(list as string[]).map((t) => {
                  const taken = isTaken(day.key, t);
                  return (
                    <button
                      type="button"
                      key={t}
                      className={`time${time === t ? " is-on" : ""}`}
                      disabled={taken}
                      aria-label={taken ? `${t}, ocupado` : t}
                      onClick={() => {
                        setTime(t);
                        go("details");
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </fieldset>
      )}

      {step === "details" && (
        <form className="panel details" onSubmit={confirm} noValidate>
          <fieldset>
            <legend>Tus datos para la ficha</legend>
            <p className="panel-note">Solo lo necesario para tener tu ficha lista el día de la cita.</p>
            <label>
              Nombre y apellidos
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
                aria-invalid={tried && !nameOk}
              />
              {tried && !nameOk && <em>Escribe nombre y al menos un apellido.</em>}
            </label>
            <label>
              Teléfono móvil
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                inputMode="tel"
                autoComplete="tel"
                placeholder="600 000 000"
                aria-invalid={tried && !phoneOk}
              />
              {tried && !phoneOk && <em>Revisa el número: 9 cifras.</em>}
            </label>
            <label>
              <span>
                Correo <span className="opt">(opcional)</span>
              </span>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                inputMode="email"
                autoComplete="email"
                aria-invalid={tried && !emailOk}
              />
              {tried && !emailOk && <em>Ese correo no parece completo.</em>}
            </label>
            <label className="wide">
              <span>
                ¿Algo que María deba saber antes? <span className="opt">(opcional)</span>
              </span>
              <textarea
                rows={3}
                maxLength={280}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder={reason?.id === "molestia" ? "Por ejemplo: desde cuándo te molesta y en qué pie." : ""}
              />
            </label>
            <label className="check wide">
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => setForm({ ...form, consent: e.target.checked })}
              />
              <span>
                Acepto que la consulta guarde estos datos para gestionar mi cita.
                {tried && !form.consent && <em> Necesario para continuar.</em>}
              </span>
            </label>
          </fieldset>
          <div className="details-foot">
            <button type="button" className="link" onClick={() => go("time")}>
              ← Cambiar hora
            </button>
            <button type="submit" className="btn btn-honey">
              Confirmar cita
            </button>
          </div>
        </form>
      )}

      {step === "done" && reason && day && time && (
        <div className="done">
          <article className="ticket" aria-label="Tu cita">
            <header>
              <span>Tu cita</span>
              <span className="code">{code}</span>
            </header>
            <p className="ticket-when">
              <b>{time}</b>
              <span>{longDate(day.date).replace(/^./, (c) => c.toUpperCase())}</span>
            </p>
            <dl>
              <div>
                <dt>Motivo</dt>
                <dd>{reason.label}</dd>
              </div>
              <div>
                <dt>Con</dt>
                <dd>{practice.name}</dd>
              </div>
              <div>
                <dt>Dónde</dt>
                <dd>
                  {practice.street}, {practice.town}
                </dd>
              </div>
            </dl>
            <p className="ticket-foot">
              Recibirías un recordatorio el día antes, con un enlace para cambiarla o anularla.
            </p>
          </article>

          <aside className="backstage" aria-label="Así le llega a la consulta">
            <h4>Y así le llega a María</h4>
            <div className="agenda">
              <p className="agenda-day">{longDate(day.date)}</p>
              {[...MORNING, ...AFTERNOON]
                .filter((t) => t === time || isTaken(day.key, t))
                .slice(0, 7)
                .map((t) => (
                  <div key={t} className={`slot${t === time ? " is-new" : ""}`}>
                    <span>{t}</span>
                    <span>{t === time ? form.name.trim() : "Paciente"}</span>
                    {t === time && <i>nueva</i>}
                  </div>
                ))}
            </div>
            <div className="file">
              <p className="file-title">Ficha</p>
              <dl>
                <div>
                  <dt>Paciente</dt>
                  <dd>{form.name.trim()}</dd>
                </div>
                <div>
                  <dt>Móvil</dt>
                  <dd>{form.phone}</dd>
                </div>
                {form.email && (
                  <div>
                    <dt>Correo</dt>
                    <dd>{form.email}</dd>
                  </div>
                )}
                <div>
                  <dt>Motivo</dt>
                  <dd>{reason.label}</dd>
                </div>
                {form.note.trim() && (
                  <div>
                    <dt>Nota</dt>
                    <dd>«{form.note.trim()}»</dd>
                  </div>
                )}
              </dl>
            </div>
            <p className="backstage-note">Sin una sola llamada para cuadrar el hueco.</p>
          </aside>

          <div className="done-foot">
            <p className="sim">
              Esto es una demostración: no se ha reservado ninguna cita ni se ha enviado ningún dato.
            </p>
            <button type="button" className="link" onClick={reset}>
              Probar otra vez
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
