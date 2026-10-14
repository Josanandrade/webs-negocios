"use client";

import { useEffect, useState } from "react";
import { business } from "@/content/site";

// Barra de acciones en móvil: aparece cuando la portada sale de pantalla
// (la portada ya tiene sus propios botones) y se oculta al llegar al pie.
export default function Dock() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("inicio");
    const footer = document.getElementById("visita");
    if (!hero || !footer) return;
    const state = { hero: true, footer: false };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) state[e.target === hero ? "hero" : "footer"] = e.isIntersecting;
      setVisible(!state.hero && !state.footer);
    });
    io.observe(hero);
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  return (
    <nav className="dock" data-visible={visible} aria-label="Acciones rápidas" inert={!visible}>
      <a className="dock__btn dock__btn--main" href={business.booking} target="_blank" rel="noopener noreferrer">
        Reservar
      </a>
      <a className="dock__btn" href={business.whatsapp.href} target="_blank" rel="noopener noreferrer">
        WhatsApp
      </a>
      <a className="dock__btn" href={business.phone.href}>
        Llamar
      </a>
    </nav>
  );
}
