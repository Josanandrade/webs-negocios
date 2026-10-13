"use client";

import { useEffect, useState } from "react";
import { primaryPhone } from "@/lib/site";
import { PhoneIcon } from "./icons";

// Barra de contacto fija solo en móvil. Aparece al dejar atrás el hero y se
// esconde al llegar al bloque de contacto, donde ya están las mismas acciones.
export function StickyCall() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("inicio");
    const contact = document.getElementById("contacto");
    if (!hero || !contact) return;
    let pastHero = false;
    let atContact = false;
    const update = () => setVisible(pastHero && !atContact);
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) pastHero = !e.isIntersecting;
        if (e.target === contact) atContact = e.isIntersecting;
      }
      update();
    });
    io.observe(hero);
    io.observe(contact);
    return () => io.disconnect();
  }, []);

  return (
    <div className="sticky-call" data-visible={visible || undefined} aria-hidden={!visible} inert={!visible}>
      <a href={primaryPhone.href} className="btn btn--solid">
        <PhoneIcon className="btn__icon" />
        Llamar
      </a>
      <a href="#contacto" className="btn btn--soft">
        Pedir primera cita
      </a>
    </div>
  );
}
