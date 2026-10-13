"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { CalendarIcon, PhoneIcon } from "./icons";

/**
 * Barra de contacto persistente en móvil. Aparece tras el hero y se oculta al
 * llegar a la sección de contacto para no tapar el formulario.
 */
export function MobileCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("inicio");
    const contact = document.getElementById("contacto");
    if (!hero || !contact) return;
    let pastHero = false;
    let atContact = false;
    const update = () => setVisible(pastHero && !atContact);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.target === hero) pastHero = !e.isIntersecting;
          if (e.target === contact) atContact = e.isIntersecting;
        }
        update();
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(hero);
    io.observe(contact);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-paper/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-300 lg:hidden ${
        visible ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
      aria-hidden={!visible}
      inert={!visible}
    >
      <div className="mx-auto flex max-w-md gap-2">
        <a href={site.phoneHref} className="btn btn-primary flex-1 !min-h-12 !px-3">
          <PhoneIcon className="size-[1.1rem]" /> Llamar
        </a>
        <a href="#contacto" className="btn btn-ghost flex-1 !min-h-12 !px-3 bg-paper">
          <CalendarIcon className="size-[1.1rem]" /> Pedir cita
        </a>
      </div>
    </div>
  );
}
