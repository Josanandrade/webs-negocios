"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#enfoque", label: "Enfoque" },
  { href: "#sesiones", label: "Sesiones" },
  { href: "#acompanamiento", label: "Acompañamiento" },
  { href: "#consulta", label: "La consulta" },
];

export function Masthead() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="masthead">
      <div className="masthead__row">
        <a href="#inicio" className="wordmark" onClick={() => setOpen(false)}>
          <span className="wordmark__name">Mapi de Paz</span>
          <span className="wordmark__sub">Consulta de Psicología</span>
        </a>
        <nav className="masthead__nav" aria-label="Secciones">
          {links.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
          <a href="#cita" className="masthead__cta">Pedir cita</a>
        </nav>
        <button
          type="button"
          className="masthead__toggle"
          aria-expanded={open}
          aria-controls="menu-movil"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Cerrar" : "Menú"}
        </button>
      </div>
      <div id="menu-movil" className={`sheet ${open ? "is-open" : ""}`} hidden={!open}>
        <nav aria-label="Secciones">
          {[...links, { href: "#cita", label: "Pedir cita" }].map((l, i) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              <span className="sheet__num">{String(i + 1).padStart(2, "0")}</span>
              {l.label}
            </a>
          ))}
        </nav>
        <p className="sheet__foot">Calle Larga, 76 · Bollullos de la Mitación</p>
      </div>
    </header>
  );
}
