"use client";

import { useEffect, useRef, useState } from "react";
import { business } from "@/content/site";

const links = [
  { href: "#tratamientos", label: "Tratamientos" },
  { href: "#visitanos", label: "Visítanos" },
  { href: "#cita", label: "Pedir cita" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="header" data-open={open || undefined}>
      <div className="header__inner">
        <a href="#inicio" className="wordmark" aria-label={`${business.name}, inicio`}>
          <span className="wordmark__name">Evelyn</span>
          <span className="wordmark__sub">Centro de Estética</span>
        </a>

        <nav className="nav" aria-label="Principal">
          <ul>
            {links.slice(0, 2).map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
          <a className="btn btn--accent btn--sm" href="#cita">
            Pedir cita
          </a>
        </nav>

        <button
          ref={buttonRef}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="menu-movil"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="visually-hidden">{open ? "Cerrar menú" : "Abrir menú"}</span>
          <span className="menu-toggle__bars" aria-hidden="true" />
        </button>
      </div>

      <div id="menu-movil" className="sheet" hidden={!open}>
        <ul>
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a className="sheet__phone" href={business.phone.href}>
          Llamar al {business.phone.display}
        </a>
      </div>
    </header>
  );
}
