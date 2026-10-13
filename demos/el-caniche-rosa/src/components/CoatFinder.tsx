"use client";

import { useState } from "react";
import { coats, services, site, type CoatId } from "@/content/site";

/*
  «¿Qué le toca?»: orientación por tipo de pelo. No reserva nada; recomienda
  el servicio y lleva a la agenda que el negocio ya usa.
*/
export function CoatFinder() {
  const [coat, setCoat] = useState<CoatId>("crece");
  const current = coats.find((c) => c.id === coat)!;
  const service = services.find((s) => s.id === current.service)!;

  return (
    <div className="finder">
      <fieldset className="finder__options">
        <legend className="finder__legend">Tu perro…</legend>
        {coats.map((c) => (
          <label key={c.id} className="option">
            <input
              type="radio"
              name="coat"
              value={c.id}
              checked={coat === c.id}
              onChange={() => setCoat(c.id)}
            />
            <span className="option__dot" aria-hidden="true" />
            <span className="option__text">
              <span className="option__label">{c.label}</span>
              <span className="option__hint">{c.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="finder__result" aria-live="polite">
        <div key={coat} className="finder__card">
          <p className="finder__kicker">Le toca</p>
          <p className="finder__service">{service.name}</p>
          <p className="finder__note">{current.note}</p>
          <a className="btn btn--ink" href={site.booksy} target="_blank" rel="noopener">
            Ver huecos en Booksy
            <span className="sr-only"> (se abre en otra pestaña)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
