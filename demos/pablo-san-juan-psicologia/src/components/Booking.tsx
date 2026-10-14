"use client";

// Solicitud de cita SIMULADA. Todo vive en el estado de React:
// sin fetch, sin almacenamiento, sin emails, sin calendarios externos.
import { useMemo, useState, useSyncExternalStore } from "react";
import { business } from "@/content/site";

const MORNING = ["10:00", "11:00", "12:00"];
const AFTERNOON = ["16:30", "17:30", "18:30", "19:30"];
const ALL = [...MORNING, ...AFTERNOON];
const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie"];
const WEEKS = 3;

type Day = { key: string; date: Date; past: boolean };

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

// Ocupación de ejemplo, determinista por fecha y hora.
function isTaken(day: Day, time: string) {
  const seed = [...`${day.key}|${time}`].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return seed % 5 < 2;
}

function freeSlots(day: Day) {
  return day.past ? [] : ALL.filter((t) => !isTaken(day, t));
}

// Tres semanas laborables a partir del lunes de esta semana.
function buildDays(today: Date): Day[] {
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  const dow = (start.getDay() + 6) % 7; // 0 = lunes
  start.setDate(start.getDate() - (dow > 4 ? dow - 7 : dow));
  const days: Day[] = [];
  for (let w = 0; w < WEEKS; w++) {
    for (let i = 0; i < 5; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + w * 7 + i);
      days.push({ key: dayKey(d), date: d, past: d <= today });
    }
  }
  return days;
}

// Las fechas se calculan solo en el navegador (la página es estática):
// en el servidor no hay "hoy" y se pinta un calendario vacío.
const noop = () => () => {};
const todayKey = () => new Date().toDateString();

const fmtLong = (d: Date) =>
  d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
const fmtMonth = (d: Date) => d.toLocaleDateString("es-ES", { month: "long" });

export default function Booking() {
  const todayStr = useSyncExternalStore(noop, todayKey, () => null);
  const [dayK, setDayK] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [ok, setOk] = useState(false);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState(false);

  const today = useMemo(() => (todayStr ? new Date() : null), [todayStr]);
  const days = useMemo(() => (today ? buildDays(today) : []), [today]);
  const day = days.find((d) => d.key === dayK) ?? null;
  const firstOpen = days.find((d) => freeSlots(d).length > 0);

  const months = useMemo(() => {
    const set = new Set(days.map((d) => fmtMonth(d.date)));
    return days.length ? `${[...set].join(" – ")} ${days[days.length - 1].date.getFullYear()}` : "";
  }, [days]);

  const phoneOk = phone.replace(/\D/g, "").length >= 9;
  const canSend = !!day && !!time && name.trim().length > 1 && phoneOk && ok;

  function pickDay(d: Day) {
    setDayK(d.key);
    setTime(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (canSend) {
      setDone(true);
      document.getElementById("cita")?.scrollIntoView({ block: "start" });
    }
  }

  function reset() {
    setDone(false);
    setTried(false);
    setDayK(null);
    setTime(null);
    setName("");
    setPhone("");
    setNote("");
    setOk(false);
  }

  return (
    <section className="book" id="cita" aria-labelledby="cita-t">
      <div className="wrap">
        <div className="book__head">
          <p className="label">Cita</p>
          <h2 id="cita-t" className="h2">
            Mira la agenda, <em>elige tu hueco</em> y deja tus datos.
          </h2>
          <p className="book__demo">
            <span aria-hidden="true">●</span> Demostración: no se reserva, no se envía y no se guarda nada. Horario de
            ejemplo.
          </p>
        </div>

        {done && day && time ? (
          <div className="note" role="status" aria-live="polite">
            <p className="note__kicker">Solicitud anotada · simulación</p>
            <p className="note__main">
              {name.trim().split(" ")[0]}, tu solicitud para el <strong>{fmtLong(day.date)}</strong> a las{" "}
              <strong>{time}</strong> quedaría así en la agenda de Pablo.
            </p>
            <dl className="note__sheet">
              <div>
                <dt>Tipo</dt>
                <dd>Solicitud de cita</dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd>{phone}</dd>
              </div>
              {note.trim() && (
                <div>
                  <dt>Comentario</dt>
                  <dd>{note.trim()}</dd>
                </div>
              )}
            </dl>
            <p className="note__small">
              En la web real, Pablo recibiría el aviso y te llamaría para confirmarla. Esto es una demostración: no
              se ha enviado ni guardado ningún dato.
            </p>
            <button type="button" className="btn btn--ghost" onClick={reset}>
              Probar otra fecha
            </button>
          </div>
        ) : (
          <form className="book__grid" onSubmit={submit} noValidate>
            {/* 1 · Calendario de pared */}
            <fieldset className="cal">
              <legend className="step">
                <span>1</span> Día
              </legend>
              <p className="cal__month">{months || " "}</p>
              <div className="cal__grid" role="group" aria-label="Días laborables de las próximas semanas">
                {WEEKDAYS.map((w) => (
                  <span key={w} className="cal__wd" aria-hidden="true">
                    {w}
                  </span>
                ))}
                {today
                  ? days.map((d) => {
                      const free = freeSlots(d).length;
                      const selected = d.key === dayK;
                      return (
                        <button
                          key={d.key}
                          type="button"
                          className={`cal__day${selected ? " is-on" : ""}`}
                          disabled={free === 0}
                          aria-pressed={selected}
                          aria-label={`${fmtLong(d.date)}: ${free ? `${free} huecos libres` : "sin huecos"}`}
                          onClick={() => pickDay(d)}
                        >
                          <span className="cal__num">{d.date.getDate()}</span>
                          <span className="cal__dots" aria-hidden="true">
                            {ALL.map((t, i) => (
                              <i key={t} className={i < free ? "on" : ""} />
                            ))}
                          </span>
                        </button>
                      );
                    })
                  : Array.from({ length: WEEKS * 5 }, (_, i) => <span key={i} className="cal__day is-ghost" />)}
              </div>
              <p className="cal__legend">
                <span className="cal__dots" aria-hidden="true">
                  <i className="on" />
                </span>{" "}
                Cada punto es un hueco libre.
                {firstOpen && !day && (
                  <>
                    {" "}
                    <button type="button" className="textlink" onClick={() => pickDay(firstOpen)}>
                      Primer día con huecos
                    </button>
                  </>
                )}
              </p>
            </fieldset>

            {/* 2 · Hora */}
            <fieldset className="hours" disabled={!day}>
              <legend className="step">
                <span>2</span> Hora
              </legend>
              <p className="hours__day">{day ? fmtLong(day.date) : "Elige primero un día"}</p>
              {[
                { label: "Mañana", list: MORNING },
                { label: "Tarde", list: AFTERNOON },
              ].map((g) => (
                <div key={g.label} className="hours__group">
                  <p className="hours__label">{g.label}</p>
                  <div className="hours__list">
                    {g.list.map((t) => {
                      const taken = !day || isTaken(day, t);
                      return (
                        <button
                          key={t}
                          type="button"
                          className={`hour${time === t ? " is-on" : ""}`}
                          disabled={taken}
                          aria-pressed={time === t}
                          onClick={() => setTime(t)}
                        >
                          {t}
                          {day && taken && <span className="sr">, ocupado</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </fieldset>

            {/* 3 · Datos */}
            <fieldset className="data" disabled={!time}>
              <legend className="step">
                <span>3</span> Tus datos
              </legend>
              <p className="data__type">
                Tipo de cita: <strong>Solicitar cita</strong>
              </p>
              <label className="field">
                <span>Nombre</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                  aria-invalid={tried && name.trim().length < 2}
                />
              </label>
              <label className="field">
                <span>Teléfono</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  autoComplete="off"
                  aria-invalid={tried && !phoneOk}
                />
              </label>
              <label className="field">
                <span>
                  Comentario <em>(opcional)</em>
                </span>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
              </label>
              <label className="check">
                <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} />
                <span>Entiendo que es una demostración y que mis datos no se envían ni se guardan.</span>
              </label>
              {tried && !canSend && (
                <p className="data__err" role="alert">
                  Revisa el nombre, un teléfono de 9 cifras y la casilla.
                </p>
              )}
              <button type="submit" className="btn btn--wide">
                {day && time ? `Solicitar ${day.date.getDate()} a las ${time}` : "Solicitar cita"}
              </button>
              <p className="data__alt">
                ¿Prefieres hablar? <a href={business.phoneHref}>{business.phoneDisplay}</a>
              </p>
            </fieldset>
          </form>
        )}
      </div>
    </section>
  );
}
