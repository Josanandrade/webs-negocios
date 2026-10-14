"use client";

import { longDate, shortWeekday } from "@/lib/agenda";
import { useAgenda } from "./AgendaContext";

// Vista de la agenda tal y como la vería la consulta en el móvil.
export default function AgendaView() {
  const { days, request } = useAgenda();
  if (!days) return <div className="phone phone-loading" aria-hidden="true" />;

  const day = days.find((d) => d.key === request?.dayKey) ?? days.find((d) => d.slots.some((s) => !s.free)) ?? days[0];
  const week = days.slice(0, 5);

  return (
    <div className="phone" role="img" aria-label={`Agenda de la consulta, ${longDate(day.date)}${request ? `, con la cita de ${request.name} a las ${request.time}` : ""}`}>
      <div className="phone-bar">
        <span>Agenda</span>
        <span className="phone-pill">{request ? "1 cita nueva" : "Al día"}</span>
      </div>
      <div className="phone-week" aria-hidden="true">
        {week.map((d) => (
          <span key={d.key} className={d.key === day.key ? "is-on" : ""}>
            <small>{shortWeekday(d.date)}</small>
            {d.date.getDate()}
          </span>
        ))}
      </div>
      <p className="phone-date">{longDate(day.date)}</p>
      <ul className="phone-list" aria-hidden="true">
        {day.slots.map((s) => {
          const mine = request && request.dayKey === day.key && request.time === s.time;
          if (mine)
            return (
              <li key={s.time} className="row row-new">
                <time>{s.time}</time>
                <span className="row-body">
                  <strong>
                    {request.name} {request.surname}
                  </strong>
                  <span>
                    Reservada online · {request.firstVisit === "si" ? "primera vez" : "ya es paciente"}
                  </span>
                  <span className="row-file">
                    Tel. {request.phone}
                    {request.email && <> · {request.email}</>}
                    {request.note && <em>“{request.note}”</em>}
                  </span>
                </span>
              </li>
            );
          return (
            <li key={s.time} className={`row ${s.free ? "row-free" : "row-busy"}`}>
              <time>{s.time}</time>
              <span className="row-body">{s.free ? "Libre · visible en la web" : "Cita"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
