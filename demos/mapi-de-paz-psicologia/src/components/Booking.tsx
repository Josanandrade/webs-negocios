"use client";

import { useMemo, useRef, useState } from "react";
import { formats } from "@/content/site";

// Solicitud de cita simulada: no envía nada, no guarda nada y no llama a
// ningún servicio. Los horarios son orientativos y se generan en el navegador.

const modes = [
  { id: "presencial", title: "En consulta", line: "Calle Larga, 76 · Bollullos de la Mitación" },
  { id: "online", title: "Online", line: "Por videollamada, desde donde estés" },
];

const SLOTS = ["10:00", "11:00", "12:00", "17:00", "18:00", "19:00"];
const steps = ["Sesión", "Modalidad", "Día y hora", "Tus datos"];

const fmtDay = new Intl.DateTimeFormat("es-ES", { weekday: "short" });
const fmtMonth = new Intl.DateTimeFormat("es-ES", { month: "short" });
const fmtLong = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long" });

function workingDays(count: number) {
  const out: Date[] = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  while (out.length < count) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) out.push(new Date(d));
  }
  return out;
}

// Ocupación ficticia y estable por día, para que la agenda parezca real.
function taken(date: Date) {
  const n = date.getDate() * 7 + date.getMonth() * 3;
  return SLOTS.filter((_, i) => (n + i * 5) % 3 === 0);
}

type Data = { name: string; phone: string; email: string; note: string; contact: string; consent: boolean };
const empty: Data = { name: "", phone: "", email: "", note: "", contact: "llamada", consent: false };

export function Booking() {
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState("");
  const [mode, setMode] = useState("");
  const [dayIdx, setDayIdx] = useState<number | null>(null);
  const [time, setTime] = useState("");
  const [data, setData] = useState<Data>(empty);
  const [tried, setTried] = useState(false);
  const top = useRef<HTMLDivElement>(null);

  const go = (n: number) => {
    setStep(n);
    setTried(false);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const reset = () => {
    setKind("");
    setMode("");
    setDayIdx(null);
    setTime("");
    setData(empty);
    go(0);
  };

  const kindTitle = formats.find((f) => f.id === kind)?.title ?? "";
  const modeTitle = modes.find((m) => m.id === mode)?.title ?? "";

  const dataOk = data.name.trim().length > 1 && /\d{9}/.test(data.phone.replace(/\D/g, "")) && data.consent;

  return (
    <div className="booking" ref={top}>
      {step < 4 && (
        <ol className="booking__progress" aria-label="Pasos">
          {steps.map((s, i) => (
            <li key={s} className={i === step ? "is-current" : i < step ? "is-done" : ""} aria-current={i === step ? "step" : undefined}>
              <span>{i + 1}</span> <b>{s}</b>
            </li>
          ))}
        </ol>
      )}

      {step === 0 && (
        <fieldset className="booking__step">
          <legend>¿Qué tipo de sesión te gustaría?</legend>
          <div className="choices">
            {formats.map((f) => (
              <label key={f.id} className={`choice ${kind === f.id ? "is-on" : ""}`}>
                <input type="radio" name="kind" value={f.id} checked={kind === f.id} onChange={() => setKind(f.id)} />
                <span className="choice__title">{f.title}</span>
                <span className="choice__line">{f.line}</span>
              </label>
            ))}
          </div>
          <p className="booking__hint">Si dudas, elige la que más se acerque: podréis ajustarlo después.</p>
          <div className="booking__nav">
            <span />
            <button type="button" className="btn" disabled={!kind} onClick={() => go(1)}>Continuar</button>
          </div>
        </fieldset>
      )}

      {step === 1 && (
        <fieldset className="booking__step">
          <legend>¿Dónde prefieres la sesión?</legend>
          <div className="choices choices--two">
            {modes.map((m) => (
              <label key={m.id} className={`choice ${mode === m.id ? "is-on" : ""}`}>
                <input type="radio" name="mode" value={m.id} checked={mode === m.id} onChange={() => setMode(m.id)} />
                <span className="choice__title">{m.title}</span>
                <span className="choice__line">{m.line}</span>
              </label>
            ))}
          </div>
          <div className="booking__nav">
            <button type="button" className="btn btn--quiet" onClick={() => go(0)}>Volver</button>
            <button type="button" className="btn" disabled={!mode} onClick={() => go(2)}>Continuar</button>
          </div>
        </fieldset>
      )}

      {step === 2 && (
        <DayAndTime
          dayIdx={dayIdx}
          time={time}
          onDay={(i) => {
            setDayIdx(i);
            setTime("");
          }}
          onTime={setTime}
          onBack={() => go(1)}
          onNext={() => go(3)}
        />
      )}

      {step === 3 && (
        <form
          className="booking__step"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (dataOk) go(4);
          }}
        >
          <fieldset>
            <legend>Unos datos para poder confirmarte</legend>
            <p className="booking__hint">No hace falta que cuentes nada sobre el motivo de la consulta. Eso, mejor en persona.</p>
            <div className="fields">
              <label className="field">
                <span>Nombre</span>
                <input autoComplete="name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} aria-invalid={tried && data.name.trim().length < 2} />
              </label>
              <label className="field">
                <span>Teléfono</span>
                <input type="tel" inputMode="tel" autoComplete="tel" value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} aria-invalid={tried && !/\d{9}/.test(data.phone.replace(/\D/g, ""))} />
              </label>
              <label className="field field--wide">
                <span>Email <em>(opcional)</em></span>
                <input type="email" autoComplete="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
              </label>
              <div className="field field--wide">
                <span id="pref">¿Cómo prefieres que te contactemos?</span>
                <div className="pills" role="radiogroup" aria-labelledby="pref">
                  {["llamada", "whatsapp", "email"].map((c) => (
                    <label key={c} className={`pill ${data.contact === c ? "is-on" : ""}`}>
                      <input type="radio" name="contact" value={c} checked={data.contact === c} onChange={() => setData({ ...data, contact: c })} />
                      {c === "llamada" ? "Llamada" : c === "whatsapp" ? "WhatsApp" : "Email"}
                    </label>
                  ))}
                </div>
              </div>
              <label className="field field--wide">
                <span>Algo que debamos saber <em>(opcional)</em></span>
                <textarea rows={3} placeholder="Por ejemplo: prefiero que no me llamen por la mañana." value={data.note} onChange={(e) => setData({ ...data, note: e.target.value })} />
              </label>
              <label className="check field--wide">
                <input type="checkbox" checked={data.consent} onChange={(e) => setData({ ...data, consent: e.target.checked })} aria-invalid={tried && !data.consent} />
                <span>Acepto que se usen estos datos solo para gestionar mi cita.</span>
              </label>
            </div>
            {tried && !dataOk && <p className="booking__error" role="alert">Revisa el nombre, un teléfono de 9 cifras y la casilla de privacidad.</p>}
          </fieldset>
          <aside className="booking__recap" aria-label="Resumen">
            {kindTitle} · {modeTitle} · <Moment dayIdx={dayIdx} time={time} />
          </aside>
          <div className="booking__nav">
            <button type="button" className="btn btn--quiet" onClick={() => go(2)}>Volver</button>
            <button type="submit" className="btn">Solicitar cita</button>
          </div>
        </form>
      )}

      {step === 4 && dayIdx !== null && (
        <Done kindTitle={kindTitle} modeTitle={modeTitle} dayIdx={dayIdx} time={time} data={data} onReset={reset} />
      )}
    </div>
  );
}

function DayAndTime({
  dayIdx,
  time,
  onDay,
  onTime,
  onBack,
  onNext,
}: {
  dayIdx: number | null;
  time: string;
  onDay: (i: number) => void;
  onTime: (t: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  // Solo se monta en el navegador (paso 3), así que la fecha es la del visitante.
  const days = useMemo(() => workingDays(10), []);
  const busy = dayIdx === null ? [] : taken(days[dayIdx]);

  return (
    <fieldset className="booking__step">
      <legend>Elige un día y una hora</legend>
      <div className="days" role="radiogroup" aria-label="Día">
        {days.map((d, i) => (
          <label key={d.toISOString()} className={`day ${dayIdx === i ? "is-on" : ""}`}>
            <input type="radio" name="day" checked={dayIdx === i} onChange={() => onDay(i)} />
            <span className="day__wd">{fmtDay.format(d).replace(".", "")}</span>
            <span className="day__n">{d.getDate()}</span>
            <span className="day__m">{fmtMonth.format(d).replace(".", "")}</span>
          </label>
        ))}
      </div>
      {dayIdx === null ? (
        <p className="booking__hint">Toca un día para ver las horas libres.</p>
      ) : (
        <div className="times" role="radiogroup" aria-label="Hora">
          <p className="times__label">Mañana</p>
          <p className="times__label times__label--pm">Tarde</p>
          {SLOTS.map((t) => {
            const off = busy.includes(t);
            return (
              <label key={t} className={`time ${time === t ? "is-on" : ""} ${off ? "is-off" : ""} ${t < "14" ? "am" : "pm"}`}>
                <input type="radio" name="time" disabled={off} checked={time === t} onChange={() => onTime(t)} />
                {t}
                {off && <span className="sr-only"> (ocupado)</span>}
              </label>
            );
          })}
        </div>
      )}
      <p className="booking__hint booking__hint--small">Horarios orientativos de demostración.</p>
      <div className="booking__nav">
        <button type="button" className="btn btn--quiet" onClick={onBack}>Volver</button>
        <button type="button" className="btn" disabled={dayIdx === null || !time} onClick={onNext}>Continuar</button>
      </div>
    </fieldset>
  );
}

function Moment({ dayIdx, time }: { dayIdx: number | null; time: string }) {
  const day = useMemo(() => (dayIdx === null ? null : workingDays(10)[dayIdx]), [dayIdx]);
  if (!day) return null;
  return (
    <>
      {fmtLong.format(day)}, {time} h
    </>
  );
}

function Done({
  kindTitle,
  modeTitle,
  dayIdx,
  time,
  data,
  onReset,
}: {
  kindTitle: string;
  modeTitle: string;
  dayIdx: number;
  time: string;
  data: Data;
  onReset: () => void;
}) {
  const day = useMemo(() => workingDays(10)[dayIdx], [dayIdx]);
  const busy = taken(day);
  const first = data.name.trim().split(/\s+/)[0];

  return (
    <div className="done" role="status">
      <div className="done__letter">
        <p className="done__kicker">Solicitud preparada</p>
        <h3>Gracias, {first}.</h3>
        <p>
          Has pedido <strong>{kindTitle.toLowerCase()}</strong>, {modeTitle.toLowerCase()}, el{" "}
          <strong>{fmtLong.format(day)}</strong> a las <strong>{time} h</strong>.
        </p>
        <p>En una web real, la consulta confirmaría la cita por {data.contact === "llamada" ? "teléfono" : data.contact === "whatsapp" ? "WhatsApp" : "email"} y recibirías un recordatorio el día antes.</p>
        <p className="done__demo">Esto es una demostración: no se ha enviado ningún dato ni se ha reservado ninguna cita.</p>
        <button type="button" className="btn btn--quiet" onClick={onReset}>Empezar de nuevo</button>
      </div>

      <div className="ledger" aria-label="Así lo vería la consulta (simulación)">
        <p className="ledger__head">
          <span>Así lo vería la consulta</span>
          <span className="ledger__tag">simulación</span>
        </p>
        <p className="ledger__day">{fmtLong.format(day)}</p>
        <ul>
          {SLOTS.map((t) => {
            const mine = t === time;
            const off = busy.includes(t);
            return (
              <li key={t} className={mine ? "is-new" : off ? "is-off" : ""}>
                <span className="ledger__t">{t}</span>
                <span>
                  {mine ? (
                    <>
                      <strong>{data.name.trim()}</strong> · {kindTitle} · {modeTitle}
                      <em>Nueva solicitud · pendiente de confirmar</em>
                    </>
                  ) : off ? (
                    "Ocupado"
                  ) : (
                    "Libre"
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="ledger__foot">La solicitud llega ordenada en la agenda, con el tipo de sesión, la modalidad y la forma de contacto preferida: sin mensajes de ida y vuelta para cuadrar la hora.</p>
      </div>
    </div>
  );
}
