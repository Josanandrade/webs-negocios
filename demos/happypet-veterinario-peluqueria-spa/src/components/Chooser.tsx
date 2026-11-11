"use client";

import { useState } from "react";
import { areas, business, situations } from "@/content/site";
import Icon from "./Icon";

// "¿Qué necesita hoy?": orienta hacia veterinaria o peluquería y termina
// siempre en una llamada. No envía ni guarda ningún dato.
export default function Chooser() {
  const [picked, setPicked] = useState<string | null>(null);
  const current = situations.find((s) => s.id === picked);

  return (
    <div className="chooser">
      <fieldset className="chooser__options">
        <legend className="sr-only">Elige lo que más se parece a tu caso</legend>
        {situations.map((s) => (
          <label key={s.id} className="chip" data-area={s.area}>
            <input
              type="radio"
              name="situacion"
              value={s.id}
              checked={picked === s.id}
              onChange={() => setPicked(s.id)}
            />
            <span>{s.label}</span>
          </label>
        ))}
      </fieldset>

      <div className="chooser__answer" aria-live="polite" data-area={current?.area ?? "none"}>
        {current ? (
          <div key={current.id} className="answer">
            <p className="answer__tag">
              <Icon name={current.area === "fuera" ? "moon" : current.area} />
              {current.area === "fuera" ? "Fuera de horario" : areas[current.area].label}
            </p>
            <p className="answer__text">{current.answer}</p>
            {current.area !== "fuera" ? (
              <div className="answer__actions">
                <a className="btn btn--solid" href={business.phoneHref}>
                  <Icon name="phone" />
                  Llamar al {business.phone}
                </a>
                <a className="btn btn--ghost" href={`#${current.area}`}>
                  Ver {areas[current.area].label.toLowerCase()}
                </a>
              </div>
            ) : (
              <div className="answer__actions">
                <a className="btn btn--ghost" href="#contacto">
                  Ver nuestro horario
                </a>
              </div>
            )}
          </div>
        ) : (
          <p className="answer answer--empty">
            Elige una opción y te decimos con quién hablar y qué tener a mano al llamar.
          </p>
        )}
      </div>
    </div>
  );
}
