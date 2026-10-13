"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

// Barra de llamada en móvil: aparece al dejar atrás el inicio y se oculta
// cuando la sección de contacto ya está en pantalla.
export function StickyCall() {
  const [heroVisible, setHeroVisible] = useState(true);
  const [contactVisible, setContactVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("inicio");
    const contact = document.getElementById("contacto");
    if (!hero || !contact || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) setHeroVisible(entry.isIntersecting);
        if (entry.target === contact) setContactVisible(entry.isIntersecting);
      }
    });
    io.observe(hero);
    io.observe(contact);
    return () => io.disconnect();
  }, []);

  const visible = !heroVisible && !contactVisible;

  return (
    <div className={`sticky-call ${visible ? "is-visible" : ""}`} aria-hidden={!visible}>
      <a href={site.phone.href} className="btn sticky-call__btn" tabIndex={visible ? 0 : -1}>
        <PhoneIcon /> Llamar · {site.phone.display}
      </a>
    </div>
  );
}

export function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="icon">
      <path
        d="M6.6 3.5h2.6l1.4 4-2 1.4a12 12 0 0 0 6.5 6.5l1.4-2 4 1.4v2.6a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
