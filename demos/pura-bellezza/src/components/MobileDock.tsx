"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { BookButton } from "./Booking";

/*
  Barra inferior en móvil. Aparece cuando los botones del hero salen de la
  pantalla, para que reservar o llamar esté siempre a un pulgar.
*/
export function MobileDock() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById("hero-actions");
    if (!target) return;
    const io = new IntersectionObserver(([entry]) =>
      setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <div className="dock" data-visible={visible} inert={!visible}>
      <a className="btn btn--ghost dock__call" href={site.phone.href}>
        Llamar
      </a>
      <BookButton className="btn btn--solid dock__book">Pedir cita</BookButton>
    </div>
  );
}
