"use client";

import { useEffect, useRef, useState } from "react";
import { Wordmark } from "./Brand";

const links = [
  { href: "#tratamientos", label: "Tratamientos" },
  { href: "#centro", label: "El centro" },
  { href: "#cita", label: "Tu cita" },
  { href: "#opiniones", label: "Opiniones" },
  { href: "#visitanos", label: "Visítanos" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.classList.add("menu-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("menu-open");
    };
  }, [open]);

  return (
    <header className={`header${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`}>
      <div className="header__bar">
        <a href="#inicio" className="header__brand" aria-label="Jalis, ir al inicio" onClick={() => setOpen(false)}>
          <Wordmark compact />
        </a>
        <nav className="header__nav" aria-label="Principal">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#reservar" className="btn btn--small btn--light header__cta">
          Reservar cita
        </a>
        <button
          ref={buttonRef}
          type="button"
          className="header__toggle"
          aria-expanded={open}
          aria-controls="menu-movil"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
          <span className="header__burger" aria-hidden="true" />
        </button>
      </div>
      <div id="menu-movil" className="header__sheet" hidden={!open}>
        <nav aria-label="Menú móvil">
          <ol>
            {links.map((l, i) => (
              <li key={l.href} style={{ "--i": i } as React.CSSProperties}>
                <a href={l.href} onClick={() => setOpen(false)}>
                  <span className="header__num">0{i + 1}</span>
                  {l.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <a href="#reservar" className="btn btn--light btn--block" onClick={() => setOpen(false)}>
          Reservar cita
        </a>
      </div>
    </header>
  );
}
