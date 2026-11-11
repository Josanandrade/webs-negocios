"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { practice, reasons, type Reason } from "@/content/site";

// Solicitud de cita 100 % simulada: no hay red, ni base de datos, ni correo.
// Todo vive en el estado de este componente y se pierde al recargar.

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];
const WEEKDAY_LONG = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTH = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

// Horas de ejemplo (el horario real no está publicado).
const MORNING = ["09:30", "10:15", "11:00", "11:45", "12:30", "13:15"];
const AFTERNOON = ["17:00", "17:45", "18:30", "19:15"];

const BOOKING_WINDOW_DAYS = 35;

// Hash estable para que la agenda de ejemplo no cambie en cada render.
const seeded = (s: string) => {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0) / 4294967295;
};

const ymd = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const longDate = (d: Date) => `${WEEKDAY_LONG[d.getDay()]} ${d.getDate()} de ${MONTH[d.getMonth()]}`;
const isTaken = (day: string, time: string) => seeded(`${day}|${time}`) > 0.6;
const isFull = (day: string) => seeded(day) > 0.85;

type DayState = "past" | "weekend" | "full" | "open" | "out";

function dayState(d: Date, today: Date): DayState {
  const diff = (startOfDay(d).getTime() - today.getTime()) / 86400000;
  if (diff < 1) return "past";
  if (diff > BOOKING_WINDOW_DAYS) return "out";
  if (d.getDay() === 0 || d.getDay() === 6) return "weekend";
  if (isFull(ymd(d))) return "full";
  return "open";
}

function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7; // semana empieza en lunes
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: lead }, () => null);
  for (let i = 1; i <= days; i++) cells.push(new Date(year, month, i));
  while (cells.length % 7) cells.push(null);
  return cells;
}

const STATE_LABEL: Record<DayState, string> = {
  past: "no disponible",
  weekend: "cerrado",
  full: "completo",
  open: "con horas libres",
  out: "aún sin agenda",
};

export default function Booking() {
  const [today, setToday] = useState<Date | null>(null);
  const [view, setView] = useState<{ y: number; m: number } | null>(null);
  const [reason, setReason] = useState<Reason | null>(null);
  const [day, setDay] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", note: "", consent: false });
  const [tried, setTried] = useState(false);
  const [sent, setSent] = useState<{ code: string } | null>(null);
  const reasonRef = useRef<HTMLFieldSetElement>(null);
  const dayRef = useRef<HTMLFieldSetElement>(null);
  const timesRef = useRef<HTMLFieldSetElement>(null);
  const dataRef = useRef<HTMLFieldSetElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  // La fecha se calcula en el navegador para no fijarla en el build.
  useEffect(() => {
    const t = window.setTimeout(() => {
      const now = startOfDay(new Date());
      setToday(now);
      setView({ y: now.getFullYear(), m: now.getMonth() });
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const cells = useMemo(() => (view ? monthGrid(view.y, view.m) : []), [view]);

  const canPrev = !!(view && today && (view.y > today.getFullYear() || view.m > today.getMonth()));
  const lastBookable = today ? new Date(today.getTime() + BOOKING_WINDOW_DAYS * 86400000) : null;
  const canNext = !!(view && lastBookable && (view.y < lastBookable.getFullYear() || view.m < lastBookable.getMonth()));

  const moveMonth = (delta: number) =>
    setView((v) => {
      if (!v) return v;
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  const pickDay = (d: Date) => {
    setDay(d);
    setTime(null);
    window.setTimeout(() => timesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const pickTime = (t: string) => {
    setTime(t);
    window.setTimeout(() => dataRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const phoneDigits = form.phone.replace(/\D/g, "");
  const errors = {
    reason: !reason ? "Elija el motivo de la cita." : "",
    day: !day ? "Elija un día en el calendario." : "",
    time: !time ? "Elija una hora." : "",
    name: form.name.trim().length < 2 ? "Escriba su nombre." : "",
    phone: phoneDigits.length < 9 ? "Escriba un teléfono de 9 cifras." : "",
    consent: !form.consent ? "Marque la casilla para poder enviar la solicitud." : "",
  };
  const firstError = Object.values(errors).find(Boolean);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (firstError) {
      // Lleva al primer paso que falta, para no tener que buscarlo.
      const target = errors.reason ? reasonRef : errors.day ? dayRef : errors.time ? timesRef : dataRef;
      target.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const code = `AB-${String(Math.floor(seeded(`${form.name}${form.phone}${e.timeStamp}`) * 9000) + 1000)}`;
    setSent({ code });
    window.setTimeout(() => {
      doneRef.current?.focus({ preventScroll: true });
      doneRef.current?.scrollIntoView({ block: "start" });
    }, 50);
  };

  const reset = () => {
    setReason(null);
    setDay(null);
    setTime(null);
    setForm({ name: "", phone: "", note: "", consent: false });
    setTried(false);
    setSent(null);
  };

  if (sent && day && time && reason) {
    return (
      <div className="done" ref={doneRef} tabIndex={-1} aria-live="polite">
        <div className="slip">
          <div className="slip__head">
            <span className="slip__seal" aria-hidden="true">✓</span>
            <div>
              <p className="slip__kicker">Solicitud registrada</p>
              <h3 className="slip__title">Gracias, {form.name.trim().split(" ")[0]}.</h3>
            </div>
          </div>
          <dl className="slip__rows">
            <div><dt>Día</dt><dd>{longDate(day)}</dd></div>
            <div><dt>Hora</dt><dd>{time}</dd></div>
            <div><dt>Motivo</dt><dd>{reason.label}</dd></div>
            <div><dt>Consulta</dt><dd>{practice.role} {practice.professional}<br />{practice.street}, {practice.town}</dd></div>
            <div><dt>Referencia</dt><dd className="slip__code">{sent.code}</dd></div>
          </dl>
          <p className="slip__note">
            Si hubiera que cambiar algo, la consulta le llamará al {form.phone}. Para anularla, llame al{" "}
            <a href={practice.phoneHref}>{practice.phone}</a>.
          </p>
          <div className="slip__actions">
            <button type="button" className="btn btn--ghost" onClick={() => window.print()}>
              Imprimir este resguardo
            </button>
            <button type="button" className="btn btn--link" onClick={reset}>
              Pedir otra cita
            </button>
          </div>
        </div>
        <p className="demo-note">Demostración: no se ha enviado ni guardado ningún dato.</p>
      </div>
    );
  }

  return (
    <form className="booking" onSubmit={submit} noValidate>
      <div className="booking__main">
        <fieldset className="step" ref={reasonRef}>
          <legend><span className="step__n">1</span> ¿Por qué pide la cita?</legend>
          <div className="reasons">
            {reasons.map((r) => (
              <label key={r.id} className={`reason${reason?.id === r.id ? " is-on" : ""}`}>
                <input type="radio" name="reason" checked={reason?.id === r.id} onChange={() => setReason(r)} />
                <span className="reason__label">{r.label}</span>
                <span className="reason__hint">{r.hint}</span>
              </label>
            ))}
          </div>
          {tried && errors.reason && <p className="err">{errors.reason}</p>}
        </fieldset>

        <fieldset className="step" ref={dayRef}>
          <legend><span className="step__n">2</span> Elija el día</legend>
          <div className="cal" aria-busy={!view}>
            <div className="cal__bar">
              <button type="button" className="cal__nav" onClick={() => moveMonth(-1)} disabled={!canPrev} aria-label="Mes anterior">
                ‹ <span>Anterior</span>
              </button>
              <p className="cal__month" aria-live="polite">{view ? `${MONTH[view.m]} ${view.y}` : "Cargando…"}</p>
              <button type="button" className="cal__nav" onClick={() => moveMonth(1)} disabled={!canNext} aria-label="Mes siguiente">
                <span>Siguiente</span> ›
              </button>
            </div>
            <div className="cal__grid" role="group" aria-label="Calendario de citas">
              {WEEKDAYS.map((w) => (
                <span key={w} className="cal__wd" aria-hidden="true">{w}</span>
              ))}
              {today &&
                cells.map((d, i) => {
                  if (!d) return <span key={`e${i}`} className="cal__cell cal__cell--empty" />;
                  const st = dayState(d, today);
                  const on = day && ymd(day) === ymd(d);
                  return (
                    <button
                      key={ymd(d)}
                      type="button"
                      className={`cal__cell cal__cell--${st}${on ? " is-on" : ""}`}
                      disabled={st !== "open"}
                      aria-pressed={!!on}
                      aria-label={`${longDate(d)}, ${STATE_LABEL[st]}`}
                      onClick={() => pickDay(d)}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
            </div>
            <ul className="cal__legend">
              <li><span className="dot dot--open" /> Con horas libres</li>
              <li><span className="dot dot--full" /> Completo</li>
              <li><span className="dot dot--off" /> Cerrado o sin agenda</li>
            </ul>
          </div>
          {tried && errors.day && <p className="err">{errors.day}</p>}
        </fieldset>

        <fieldset className="step" ref={timesRef}>
          <legend><span className="step__n">3</span> Elija la hora</legend>
          {!day ? (
            <p className="step__wait">Primero elija un día en el calendario.</p>
          ) : (
            <>
              <p className="step__for">Horas para el <strong>{longDate(day)}</strong>:</p>
              {[{ label: "Mañana", list: MORNING }, { label: "Tarde", list: AFTERNOON }].map((g) => (
                <div key={g.label} className="times">
                  <p className="times__label">{g.label}</p>
                  <div className="times__list">
                    {g.list.map((t) => {
                      const taken = isTaken(ymd(day), t);
                      return (
                        <button
                          key={t}
                          type="button"
                          className={`time${time === t ? " is-on" : ""}`}
                          disabled={taken}
                          aria-pressed={time === t}
                          aria-label={taken ? `${t}, ocupada` : t}
                          onClick={() => pickTime(t)}
                        >
                          {t}
                          {taken && <span className="time__taken">ocupada</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
          {tried && errors.time && <p className="err">{errors.time}</p>}
        </fieldset>

        <fieldset className="step" ref={dataRef}>
          <legend><span className="step__n">4</span> Sus datos</legend>
          <div className="fields">
            <label className="field">
              <span>Nombre y apellidos</span>
              <input
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                aria-invalid={tried && !!errors.name}
              />
              {tried && errors.name && <span className="err">{errors.name}</span>}
            </label>
            <label className="field">
              <span>Teléfono</span>
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                aria-invalid={tried && !!errors.phone}
              />
              {tried && errors.phone && <span className="err">{errors.phone}</span>}
            </label>
            <label className="field field--wide">
              <span>Nota para la consulta <em>(opcional)</em></span>
              <textarea
                rows={3}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Por ejemplo: prefiero que me llamen por la tarde."
              />
            </label>
          </div>
          <label className="check">
            <input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} />
            <span>Acepto que la consulta use estos datos solo para gestionar mi cita.</span>
          </label>
          {tried && errors.consent && <p className="err">{errors.consent}</p>}
        </fieldset>
      </div>

      <aside className="summary" aria-label="Resumen de su cita">
        <p className="summary__title">Su cita</p>
        <dl>
          <div><dt>Motivo</dt><dd>{reason ? reason.label : <span className="tbd">por elegir</span>}</dd></div>
          <div><dt>Día</dt><dd>{day ? longDate(day) : <span className="tbd">por elegir</span>}</dd></div>
          <div><dt>Hora</dt><dd>{time ?? <span className="tbd">por elegir</span>}</dd></div>
          <div><dt>Nombre</dt><dd>{form.name.trim() || <span className="tbd">por escribir</span>}</dd></div>
        </dl>
        <button type="submit" className="btn btn--primary btn--block">Enviar solicitud</button>
        {tried && firstError && <p className="err" role="alert">{firstError}</p>}
        <p className="summary__alt">
          ¿Prefiere llamar? <a href={practice.phoneHref}>{practice.phone}</a>
        </p>
      </aside>
    </form>
  );
}
