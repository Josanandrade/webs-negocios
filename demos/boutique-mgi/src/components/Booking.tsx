"use client";

import { useState } from "react";
import { business, moments, treatments } from "@/content/mgi";

// Asistente de cita: ayuda a decidir qué pedir y termina en el canal real
// del centro (teléfono). No envía datos a ningún sitio ni crea reservas.
export function Booking() {
  const [selected, setSelected] = useState<string[]>([]);
  const [moment, setMoment] = useState<string>("flexible");
  const [copied, setCopied] = useState(false);

  const toggle = (id: string) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const names = treatments.filter((t) => selected.includes(t.id)).map((t) => t.name.toLowerCase());
  const momentLabel = moments.find((m) => m.id === moment)?.label.toLowerCase();
  const message = names.length
    ? `Hola, me gustaría pedir cita para ${joinEs(names)}${
        moment !== "flexible" ? `, ${momentLabel}` : ""
      }. ¿Qué disponibilidad tenéis?`
    : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="booking">
      <fieldset className="booking__group">
        <legend className="booking__legend">
          <span className="booking__step">1</span> ¿Qué te apetece?
        </legend>
        <div className="chips">
          {treatments.map((t) => (
            <button
              key={t.id}
              type="button"
              className="chip"
              aria-pressed={selected.includes(t.id)}
              onClick={() => toggle(t.id)}
            >
              {t.short}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="booking__group">
        <legend className="booking__legend">
          <span className="booking__step">2</span> ¿Cuándo te viene mejor?
        </legend>
        <div className="chips" role="radiogroup" aria-label="Momento preferido">
          {moments.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              className="chip"
              aria-checked={moment === m.id}
              onClick={() => setMoment(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="booking__summary" aria-live="polite">
        <p className="booking__legend">
          <span className="booking__step">3</span> Llama y confirma tu hueco
        </p>
        {message ? (
          <p className="booking__message">“{message}”</p>
        ) : (
          <p className="booking__hint">Elige uno o varios tratamientos y te preparamos el mensaje.</p>
        )}
        <div className="booking__actions">
          <a className="btn btn--solid" href={business.phoneHref}>
            Llamar · {business.phoneDisplay}
          </a>
          {message && (
            <button type="button" className="btn btn--ghost" onClick={copy}>
              {copied ? "Mensaje copiado" : "Copiar mensaje"}
            </button>
          )}
        </div>
        <p className="booking__note">
          La cita se confirma directamente con el centro. Esta página no guarda ni envía tus datos.
        </p>
      </div>
    </div>
  );
}

function joinEs(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}
