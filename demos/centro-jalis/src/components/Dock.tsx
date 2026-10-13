"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/jalis";

// Barra inferior en móvil: aparece al dejar atrás la portada y se oculta al
// llegar al bloque de reserva para no duplicar acciones.
export function Dock() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("inicio");
    const booking = document.getElementById("reservar");
    if (!hero || !booking) return;
    let heroOut = false;
    let bookingIn = false;
    const update = () => setShow(heroOut && !bookingIn);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) heroOut = !e.isIntersecting;
        if (e.target === booking) bookingIn = e.isIntersecting;
      }
      update();
    });
    io.observe(hero);
    io.observe(booking);
    return () => io.disconnect();
  }, []);

  return (
    <div className={`dock${show ? " is-visible" : ""}`} aria-hidden={!show}>
      <a href={site.phone.href} className="dock__btn" tabIndex={show ? 0 : -1}>
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        Llamar
      </a>
      <a href="#reservar" className="dock__btn dock__btn--primary" tabIndex={show ? 0 : -1}>
        Reservar cita
      </a>
    </div>
  );
}
