"use client";

import { useEffect, useState } from "react";

// Botón fijo de reserva en móvil. Se oculta cuando la reserva ya está a la vista.
export default function MobileCta() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById("reservar");
    if (!target) return;
    const io = new IntersectionObserver(([e]) => setHidden(e.isIntersecting), { threshold: 0.05 });
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <a href="#reservar" className={`mobile-cta${hidden ? " is-hidden" : ""}`} aria-hidden={hidden} tabIndex={hidden ? -1 : undefined}>
      Reservar mesa
    </a>
  );
}
