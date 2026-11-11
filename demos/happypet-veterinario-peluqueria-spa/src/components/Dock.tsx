"use client";

import { useEffect, useState } from "react";
import { business } from "@/content/site";

// Barra de acciones en móvil: aparece cuando la portada sale de pantalla
// (la portada ya tiene sus propios botones) y se oculta al llegar al contacto.
export default function Dock() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("inicio");
    const contact = document.getElementById("contacto");
    if (!hero || !contact) return;
    const state = { hero: true, contact: false };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) state[e.target === hero ? "hero" : "contact"] = e.isIntersecting;
      setVisible(!state.hero && !state.contact);
    });
    io.observe(hero);
    io.observe(contact);
    return () => io.disconnect();
  }, []);

  return (
    <nav className="dock" data-visible={visible} aria-label="Acciones rápidas" inert={!visible}>
      <a className="dock__btn dock__btn--main" href={business.phoneHref}>
        Llamar y pedir cita
      </a>
      <a className="dock__btn" href={business.mapsHref} target="_blank" rel="noopener noreferrer">
        Cómo llegar
      </a>
    </nav>
  );
}
