"use client";

import { useEffect, useState } from "react";

/** Barra fija en móvil. Aparece cuando los botones de la portada salen de pantalla. */
export function MobileBar({ phoneHref }: { phoneHref: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const target = document.querySelector("[data-hero-actions]");
    if (!target) return;
    const io = new IntersectionObserver(([entry]) => {
      setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <div className="mobile-bar" data-shown={shown || undefined} inert={!shown}>
      <a className="btn btn--ghost" href={phoneHref}>
        <svg className="icon" viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M6.6 2.5H4.2A1.7 1.7 0 0 0 2.5 4.3c.3 7.1 6 12.9 13.2 13.2a1.7 1.7 0 0 0 1.8-1.7v-2.4l-3.6-1.5-1.8 1.8a10 10 0 0 1-5.8-5.8l1.8-1.8z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        Llamar
      </a>
      <a className="btn btn--accent" href="#cita">
        Pedir cita
      </a>
    </div>
  );
}
