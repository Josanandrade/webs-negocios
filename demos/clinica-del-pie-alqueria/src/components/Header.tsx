"use client";

import { useEffect, useState } from "react";
import { clinic } from "@/content/site";
import Mark from "./Mark";

const LINKS = [
  { href: "#consultas", label: "Consultas" },
  { href: "#como", label: "Cómo reservar" },
  { href: "#clinica", label: "La clínica" },
  { href: "#contacto", label: "Contacto" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className="hd" data-scrolled={scrolled} data-open={open}>
      <div className="wrap hd-in">
        <a href="#inicio" className="hd-brand" onClick={() => setOpen(false)}>
          <Mark />
          <span>
            <strong>{clinic.name}</strong>
            <small>Podología · {clinic.town}</small>
          </span>
        </a>
        <nav className="hd-nav" aria-label="Principal">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href={clinic.phoneHref} className="hd-phone mono">
            {clinic.phone}
          </a>
        </nav>
        <a href="#cita" className="btn btn-solid hd-cta">
          Pedir cita
        </a>
        <button
          type="button"
          className="hd-burger"
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
