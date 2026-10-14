"use client";

import { useId, useRef, useState } from "react";
import { techniques } from "@/content/salon";
import { Strands } from "./Strands";
import { BookingTrigger } from "./Booking";

export function ColorLab() {
  const [active, setActive] = useState(techniques[3].id);
  const tabsRef = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");
  const current = techniques.find((t) => t.id === active) ?? techniques[0];

  // Radiogroup con flechas: cambio inmediato, sin animar la selección del teclado.
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const i = techniques.findIndex((t) => t.id === active);
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const next = techniques[(i + step + techniques.length) % techniques.length];
    setActive(next.id);
    tabsRef.current?.querySelector<HTMLButtonElement>(`[data-id="${next.id}"]`)?.focus();
  }

  return (
    <div className="lab">
      <div className="lab-visual">
        <Strands id={`lab-${uid}`} strands={current.strands} className="strands-lab" />
        <p className="lab-caption">Ilustración orientativa · no es un trabajo del salón</p>
      </div>
      <div className="lab-panel">
        <div
          ref={tabsRef}
          className="lab-tabs"
          role="radiogroup"
          aria-label="Técnica de color"
          onKeyDown={onKeyDown}
        >
          {techniques.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              data-id={t.id}
              aria-checked={t.id === active}
              tabIndex={t.id === active ? 0 : -1}
              className="lab-tab"
              onClick={() => setActive(t.id)}
            >
              {t.id === "natural" ? "Antes" : t.name}
            </button>
          ))}
        </div>
        <div className="lab-copy" aria-live="polite">
          <h3 className="lab-name">{current.name}</h3>
          <p>{current.line}</p>
        </div>
        <p className="lab-note">
          Cada pelo parte de una base distinta. En el salón te dicen qué técnica te va y cuánto
          aclarar sin castigarlo.
        </p>
        <BookingTrigger className="btn btn-hot" preset="color">
          Pedir cita para color
        </BookingTrigger>
      </div>
    </div>
  );
}
