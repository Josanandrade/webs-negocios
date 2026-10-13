"use client";

import { useEffect } from "react";

// Entrada suave de bloques al hacer scroll, una sola vez.
// - Sin JS el contenido se ve igual (la clase se añade aquí).
// - Lo que ya está en pantalla al cargar no se oculta (sin parpadeo).
// - Con "reducir movimiento" no se activa.
export function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const vh = window.innerHeight;
    for (const el of els) {
      if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add("is-in");
    }
    document.documentElement.classList.add("reveal-ready");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => !el.classList.contains("is-in") && io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
