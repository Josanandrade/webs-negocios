"use client";

import { useEffect, useState } from "react";
import { salon } from "@/content/salon";
import { Icon } from "./Icon";

/* Barra fija en móvil: aparece cuando los botones del hero ya no se ven. */
export function CallBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero-actions");
    const visit = document.getElementById("visita");
    if (!hero) return;
    const seen = new Map<Element, boolean>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) seen.set(e.target, e.isIntersecting);
      setVisible(!seen.get(hero) && !(visit && seen.get(visit)) && hero.getBoundingClientRect().top < 0);
    });
    io.observe(hero);
    if (visit) io.observe(visit);
    return () => io.disconnect();
  }, []);

  return (
    <div className="callbar" data-visible={visible || undefined} inert={!visible}>
      <a className="btn btn--primary" href={salon.phoneHref}>
        <Icon name="phone" />
        Llamar
      </a>
      <a className="btn btn--ghost" href={salon.mapsUrl} target="_blank" rel="noopener noreferrer">
        <Icon name="pin" />
        Cómo llegar
      </a>
    </div>
  );
}
