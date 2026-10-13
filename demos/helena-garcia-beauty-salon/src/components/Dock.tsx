"use client";

import { useEffect, useState } from "react";
import { salon } from "@/content/salon";

// Barra inferior en móvil: aparece al salir del hero y se oculta cuando la
// reserva o el CTA final ya están en pantalla (no duplicar botones).
export function Dock() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("inicio");
    const targets = ["reserva", "final"].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!hero) return;
    const state = { pastHero: false, onTarget: new Set<Element>() };
    const update = () => setShow(state.pastHero && state.onTarget.size === 0);

    const heroIo = new IntersectionObserver(([e]) => {
      state.pastHero = !e.isIntersecting;
      update();
    });
    const targetIo = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) state.onTarget.add(e.target);
        else state.onTarget.delete(e.target);
      }
      update();
    });
    heroIo.observe(hero);
    targets.forEach((t) => targetIo.observe(t));
    return () => {
      heroIo.disconnect();
      targetIo.disconnect();
    };
  }, []);

  return (
    <nav className={`dock ${show ? "is-shown" : ""}`} aria-label="Acciones rápidas" inert={!show}>
      <a className="btn btn--primary dock__main" href="#reserva">
        Reservar cita
      </a>
      <a className="dock__icon" href={salon.phone.href} aria-label={`Llamar al ${salon.phone.display}`}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
        </svg>
      </a>
      <a
        className="dock__icon"
        href={salon.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Cómo llegar (abre Google Maps)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
        </svg>
      </a>
    </nav>
  );
}
