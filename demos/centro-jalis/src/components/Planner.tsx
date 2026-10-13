"use client";

import { useId, useState } from "react";
import { areas, site } from "@/content/jalis";

const slots = ["Mañana", "Tarde", "Me da igual"] as const;

// Asistente de cita: ayuda a decidir y deja el mensaje preparado. No envía ni
// guarda nada; termina en los canales públicos del centro (teléfono y Booksy).
export function Planner() {
  const id = useId();
  const [areaId, setAreaId] = useState(areas[0].id);
  const [treatment, setTreatment] = useState("");
  const [slot, setSlot] = useState<(typeof slots)[number]>("Me da igual");
  const [copied, setCopied] = useState(false);

  const area = areas.find((a) => a.id === areaId) ?? areas[0];
  const chosen = treatment || `Asesoramiento en ${area.name.toLowerCase()}`;
  const message = `Hola, me gustaría pedir cita en Jalis para: ${chosen}. Preferencia: ${slot.toLowerCase()}.`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="planner">
      <fieldset className="planner__step">
        <legend>
          <span className="planner__n">1</span> ¿Qué te interesa?
        </legend>
        <div className="chips" role="radiogroup" aria-label="Área de tratamiento">
          {areas.map((a) => (
            <label key={a.id} className="chip">
              <input
                type="radio"
                name={`${id}-area`}
                value={a.id}
                checked={a.id === areaId}
                onChange={() => {
                  setAreaId(a.id);
                  setTreatment("");
                }}
              />
              <span>{a.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="planner__step">
        <legend>
          <span className="planner__n">2</span> Elige tratamiento <span className="planner__opt">(opcional)</span>
        </legend>
        <label className="sr-only" htmlFor={`${id}-t`}>
          Tratamiento
        </label>
        <div className="select">
          <select id={`${id}-t`} value={treatment} onChange={(e) => setTreatment(e.target.value)}>
            <option value="">Aún no lo sé: que me orienten</option>
            {area.items.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset className="planner__step">
        <legend>
          <span className="planner__n">3</span> ¿Cuándo te viene mejor?
        </legend>
        <div className="chips" role="radiogroup" aria-label="Franja horaria">
          {slots.map((s) => (
            <label key={s} className="chip">
              <input type="radio" name={`${id}-slot`} value={s} checked={s === slot} onChange={() => setSlot(s)} />
              <span>{s}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="planner__summary" aria-live="polite">
        <p className="planner__label">Tu mensaje</p>
        <p className="planner__msg">“{message}”</p>
        <div className="planner__actions">
          <a className="btn btn--dark" href={site.booksyUrl} target="_blank" rel="noopener noreferrer nofollow">
            Reservar online
            <span className="sr-only"> (abre su perfil de reservas en otra pestaña)</span>
          </a>
          <a className="btn btn--outline" href={site.phone.href}>
            Llamar · {site.phone.display}
          </a>
          {site.whatsappEnabled && (
            <a
              className="btn btn--outline"
              href={`https://wa.me/34695915837?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noopener noreferrer nofollow"
            >
              WhatsApp
            </a>
          )}
          <button type="button" className="btn btn--ghost" onClick={copy}>
            {copied ? "Copiado" : "Copiar mensaje"}
          </button>
        </div>
        <p className="planner__fine">
          Demo: aquí no se envía ni se guarda ningún dato. La reserva se hace en los canales habituales del centro.
        </p>
      </div>
    </div>
  );
}
