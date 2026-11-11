"use client";

import { useEffect } from "react";

/*
  Revelado suave al hacer scroll. Sin JavaScript (o con reduced motion) todo
  se ve desde el principio: el estado oculto solo existe bajo .reveal-ready.
*/
export function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    // Lo que ya está en pantalla no se oculta: evita parpadeos al cargar.
    for (const el of items) {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) el.classList.add("is-in");
    }
    document.documentElement.classList.add("reveal-ready");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    for (const el of items) if (!el.classList.contains("is-in")) io.observe(el);
    return () => io.disconnect();
  }, []);

  return null;
}
