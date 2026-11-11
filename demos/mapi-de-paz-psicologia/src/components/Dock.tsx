"use client";

import { useEffect, useState } from "react";

// Botón flotante en móvil; se retira mientras se ve el botón de la portada o la
// sección de cita, para no duplicar llamadas a la acción.
export function Dock() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const targets = [document.querySelector(".cover__actions"), document.getElementById("cita")].filter(
      (el): el is Element => el !== null,
    );
    const visible = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        setHidden(visible.size > 0 || window.scrollY < 200);
      },
      { threshold: 0.05 },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <a href="#cita" className={`dock ${hidden ? "is-hidden" : ""}`} aria-hidden={hidden} tabIndex={hidden ? -1 : 0}>
      Pedir cita
    </a>
  );
}
