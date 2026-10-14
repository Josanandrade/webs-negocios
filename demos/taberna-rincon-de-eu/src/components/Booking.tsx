"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { business, lunchSlots } from "@/content/site";

// Reserva SIMULADA: no hay red, ni base de datos, ni emails. Todo vive en el
// estado de este componente y se pierde al recargar.

type Day = { iso: string; dow: string; num: number; month: string; closed: boolean };

const DOW = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MONTH = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DOW_LONG = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function nextDays(count: number): Day[] {
  const out: Day[] = [];
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const day = new Date(d);
    day.setDate(d.getDate() + i);
    out.push({
      iso: `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`,
      dow: DOW[day.getDay()],
      num: day.getDate(),
      month: MONTH[day.getMonth()],
      closed: day.getDay() === 0,
    });
  }
  return out;
}

// Ocupación de ejemplo, estable para cada día y turno.
function seed(s: string) {
  let h = 7;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}
function slotFull(iso: string, slot: string, guests: number) {
  const h = seed(iso + slot) % 10;
  return h < 3 || (guests >= 6 && h < 5);
}

function longDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d, 12);
  return `${DOW_LONG[date.getDay()]} ${d} de ${["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"][m - 1]}`;
}

const SAMPLE_BOOKINGS = [
  { time: "13:30", guests: 4, note: "patio si puede ser" },
  { time: "14:00", guests: 2, note: "" },
  { time: "14:30", guests: 6, note: "una trona" },
];

export default function Booking() {
  const [days, setDays] = useState<Day[]>([]);
  const [guests, setGuests] = useState<number | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState<{ code: string } | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Al confirmar o empezar de nuevo, se lleva la vista al principio del bloque.
  useEffect(() => {
    if (done) topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [done]);

  // Las fechas se calculan en el navegador: la web es estática y el día de
  // compilación no sirve.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDays(nextDays(15));
  }, []);

  const bigGroup = guests === 9;
  const phoneOk = phone.replace(/\D/g, "").length >= 9;
  const nameOk = name.trim().length >= 2;
  const ready = guests !== null && !bigGroup && date && slot && nameOk && phoneOk;

  const step = !guests || bigGroup ? 1 : !date ? 2 : !slot ? 3 : 4;

  const agenda = useMemo(() => {
    if (!done || !slot || !guests) return [];
    const mine = { time: slot, guests, note: notes.trim(), mine: true };
    return [...SAMPLE_BOOKINGS.map((b) => ({ ...b, mine: false })), mine].sort((a, b) => a.time.localeCompare(b.time));
  }, [done, slot, guests, notes]);

  function confirm(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!ready) return;
    const code = "EU-" + (seed(name + phone + date + slot) % 9000 + 1000);
    setDone({ code });
  }

  function reset() {
    setGuests(null);
    setDate(null);
    setSlot(null);
    setName("");
    setPhone("");
    setNotes("");
    setTouched(false);
    setDone(null);
  }

  if (done && date && slot && guests) {
    return (
      <div className="bk-done" ref={topRef}>
        <div className="ticket" role="status" aria-live="polite">
          <p className="ticket-head">Comanda de reserva</p>
          <p className="ticket-code">{done.code}</p>
          <dl className="ticket-lines">
            <div><dt>Mesa para</dt><dd>{guests} {guests === 1 ? "persona" : "personas"}</dd></div>
            <div><dt>Día</dt><dd>{longDate(date)}</dd></div>
            <div><dt>Hora</dt><dd>{slot}</dd></div>
            <div><dt>A nombre de</dt><dd>{name.trim()}</dd></div>
            {notes.trim() && <div><dt>Nota</dt><dd>{notes.trim()}</dd></div>}
          </dl>
          <p className="ticket-cash">Recuerda: aquí se paga en efectivo.</p>
          <span className="stamp" aria-hidden="true">Apuntada</span>
          <p className="ticket-demo">Simulación de demostración: no se ha enviado ninguna reserva ni se ha guardado ningún dato.</p>
          <button type="button" className="btn btn-ghost" onClick={reset}>Hacer otra reserva</button>
        </div>

        <div className="backroom">
          <p className="backroom-kicker">Y así le llegaría a la casa</p>
          <h3>Mediodía del {longDate(date)}</h3>
          <p className="backroom-intro">Sin libreta ni mensajes sueltos: cada reserva entra ordenada por hora, con su nota.</p>
          <ol className="backroom-list">
            {agenda.map((b, i) => (
              <li key={i} className={b.mine ? "is-mine" : ""}>
                <span className="br-time">{b.time}</span>
                <span className="br-guests">{b.guests} pers.</span>
                <span className="br-note">{b.mine ? `${name.trim()}${b.note ? " · " + b.note : ""}` : b.note || "—"}</span>
              </li>
            ))}
          </ol>
          <p className="backroom-foot">Reservas de ejemplo para ilustrar la vista interna.</p>
        </div>
      </div>
    );
  }

  return (
    <form className="pad" onSubmit={confirm} noValidate>
      <div className="pad-rings" aria-hidden="true" />
      <ol className="pad-steps" aria-label="Pasos de la reserva">
        {["Comensales", "Día", "Hora", "Tus datos"].map((s, i) => (
          <li key={s} className={step === i + 1 ? "is-now" : step > i + 1 ? "is-done" : ""}>{s}</li>
        ))}
      </ol>

      <fieldset className="pad-block">
        <legend><span className="pad-n">1</span> ¿Cuántos sois?</legend>
        <div className="guests">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <button
              key={n}
              type="button"
              className={`guest${guests === n ? " is-on" : ""}`}
              aria-pressed={guests === n}
              onClick={() => { setGuests(n); setSlot(null); }}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className={`guest guest-more${bigGroup ? " is-on" : ""}`}
            aria-pressed={bigGroup}
            onClick={() => { setGuests(9); setSlot(null); }}
          >
            Más de 8
          </button>
        </div>
        {bigGroup && (
          <p className="pad-note">
            Para grupos grandes la casa prefiere hablarlo antes: los saloncitos son pequeños.{" "}
            <a href={business.phoneHref}>Llamar al {business.phone}</a>
          </p>
        )}
      </fieldset>

      <fieldset className="pad-block" disabled={!guests || bigGroup}>
        <legend><span className="pad-n">2</span> ¿Qué día?</legend>
        <div className="days">
          {days.length === 0 && <span className="pad-note">Cargando calendario…</span>}
          {days.map((d) => (
            <button
              key={d.iso}
              type="button"
              className={`day${date === d.iso ? " is-on" : ""}`}
              disabled={d.closed}
              aria-pressed={date === d.iso}
              aria-label={`${longDate(d.iso)}${d.closed ? ", cerrado" : ""}`}
              onClick={() => { setDate(d.iso); setSlot(null); }}
            >
              <span className="day-dow">{d.dow}</span>
              <span className="day-num">{d.num}</span>
              <span className="day-month">{d.closed ? "cerrado" : d.month}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="pad-block" disabled={!date || !guests || bigGroup}>
        <legend><span className="pad-n">3</span> ¿A qué hora?</legend>
        {date && guests && !bigGroup ? (
          <div className="slots">
            {lunchSlots.map((s) => {
              const full = slotFull(date, s, guests);
              return (
                <button
                  key={s}
                  type="button"
                  className={`slot${slot === s ? " is-on" : ""}`}
                  disabled={full}
                  aria-pressed={slot === s}
                  onClick={() => setSlot(s)}
                >
                  {s}
                  <small>{full ? "completo" : "libre"}</small>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="pad-note">Elige antes los comensales y el día.</p>
        )}
        <p className="pad-hint">Turnos de mediodía de ejemplo.</p>
      </fieldset>

      <fieldset className="pad-block" disabled={!slot}>
        <legend><span className="pad-n">4</span> ¿A nombre de quién?</legend>
        <div className="fields">
          <label>
            Nombre
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={touched && !nameOk} />
            {touched && !nameOk && <span className="err">Escribe un nombre.</span>}
          </label>
          <label>
            Teléfono
            <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" aria-invalid={touched && !phoneOk} />
            {touched && !phoneOk && <span className="err">Necesitamos un teléfono de 9 cifras.</span>}
          </label>
          <label className="wide">
            Algo que debamos saber <span className="opt">(opcional)</span>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Alergias, trona, carrito, preferís patio…" />
          </label>
        </div>
      </fieldset>

      <div className="pad-foot">
        <button type="submit" className="btn btn-red" disabled={!slot}>Apuntar la reserva</button>
        <p>Demo: no se envía nada.</p>
      </div>
    </form>
  );
}
