"use client";

import { useId, useRef, useState } from "react";
import { categories, salon, type CategoryId } from "@/content/salon";

const SLOTS = ["Mañana", "Tarde", "Sábado"] as const;

// Asistente de cita en tres toques. En la demo no se crea ninguna reserva:
// el último paso explica qué haría la versión real (abrir la agenda del salón
// con el servicio ya elegido).
export function Booking() {
  const [cat, setCat] = useState<CategoryId | null>(null);
  const [service, setService] = useState<string | null>(null);
  const [slot, setSlot] = useState<(typeof SLOTS)[number] | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const uid = useId();

  const category = categories.find((c) => c.id === cat);
  const ready = Boolean(cat && service && slot);

  return (
    <div className="booking">
      <fieldset className="booking__step">
        <legend>
          <span className="booking__num" aria-hidden="true">1</span>
          ¿Qué te apetece?
        </legend>
        <div className="chips">
          {categories.map((c) => (
            <label key={c.id} className="chip">
              <input
                type="radio"
                name={`${uid}-cat`}
                checked={cat === c.id}
                onChange={() => {
                  setCat(c.id);
                  setService(null);
                }}
              />
              <span>{c.short}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="booking__step" disabled={!category}>
        <legend>
          <span className="booking__num" aria-hidden="true">2</span>
          Elige tratamiento
        </legend>
        {category ? (
          <div className="chips">
            {category.services.map((s) => (
              <label key={s.name} className="chip">
                <input
                  type="radio"
                  name={`${uid}-svc`}
                  checked={service === s.name}
                  onChange={() => setService(s.name)}
                />
                <span>{s.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <p className="booking__hint">Primero elige una categoría.</p>
        )}
      </fieldset>

      <fieldset className="booking__step" disabled={!service}>
        <legend>
          <span className="booking__num" aria-hidden="true">3</span>
          ¿Cuándo te viene mejor?
        </legend>
        <div className="chips">
          {SLOTS.map((s) => (
            <label key={s} className="chip">
              <input
                type="radio"
                name={`${uid}-slot`}
                checked={slot === s}
                onChange={() => setSlot(s)}
              />
              <span>{s}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="booking__summary" aria-live="polite">
        <p className="booking__sum-text">
          {ready ? (
            <>
              <strong>{service}</strong> · {slot === "Sábado" ? "sábado por la mañana" : `por la ${slot!.toLowerCase()}`}
            </>
          ) : (
            "Tu cita aparecerá aquí."
          )}
        </p>
        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={!ready}
          onClick={() => dialogRef.current?.showModal()}
        >
          Ver huecos libres
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className="sheet"
        aria-labelledby={`${uid}-title`}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className="sheet__body">
          <p className="eyebrow">Modo demo</p>
          <h3 id={`${uid}-title`} className="sheet__title">
            Aquí se abriría la agenda
          </h3>
          <p>
            En la web real, este botón lleva a la agenda de Helena con <strong>{service}</strong> ya
            seleccionado, para elegir día y hora en un toque. En esta demo no se crea ninguna
            reserva.
          </p>
          <div className="sheet__actions">
            <a className="btn btn--primary" href={salon.booksyUrl} target="_blank" rel="noopener noreferrer">
              Ver agenda actual en Booksy
            </a>
            <button type="button" className="btn btn--ghost" onClick={() => dialogRef.current?.close()}>
              Cerrar
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
