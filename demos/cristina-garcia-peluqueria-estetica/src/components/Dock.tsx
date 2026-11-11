"use client";

import { useEffect, useState } from "react";
import { business } from "@/content/site";

// Barra de acciones en móvil: aparece cuando la portada sale de pantalla
// (la portada ya tiene sus propios botones) y se retira al llegar a «Visítanos».
export default function Dock() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("inicio");
    const visit = document.getElementById("visita");
    if (!hero || !visit) return;
    const state = { hero: true, visit: false };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) state[e.target === hero ? "hero" : "visit"] = e.isIntersecting;
      setVisible(!state.hero && !state.visit);
    });
    io.observe(hero);
    io.observe(visit);
    return () => io.disconnect();
  }, []);

  return (
    <nav className="dock" data-visible={visible} aria-label="Acciones rápidas" inert={!visible}>
      <a className="dock__btn dock__btn--main" href={business.booking} target="_blank" rel="noopener noreferrer">
        Reservar cita
      </a>
      <a className="dock__btn" href={business.phone.href}>
        Llamar
      </a>
      <a className="dock__btn" href={business.maps} target="_blank" rel="noopener noreferrer">
        Cómo llegar
      </a>
    </nav>
  );
}
