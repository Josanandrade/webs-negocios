"use client";

import { useEffect, useRef, useState } from "react";
import { nav, site } from "@/lib/site";

export function SiteHeader() {
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
    <header className="header">
      <div className="container header__inner">
        <a href="#inicio" className="wordmark" onClick={() => setOpen(false)}>
          <span className="wordmark__name">{site.name}</span>
          <span className="wordmark__role">
            {site.role} · {site.city}
          </span>
        </a>

        <nav aria-label="Principal" className="header__nav">
          <ul id="menu-principal" className={`header__links ${open ? "is-open" : ""}`}>
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
            <li className="header__menu-cta">
              <a href="#contacto" className="btn" onClick={() => setOpen(false)}>
                Pedir cita
              </a>
            </li>
          </ul>
          <a href="#contacto" className="btn btn--small header__cta">
            Pedir cita
          </a>
          <button
            ref={buttonRef}
            type="button"
            className="header__toggle"
            aria-expanded={open}
            aria-controls="menu-principal"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="visually-hidden">{open ? "Cerrar menú" : "Abrir menú"}</span>
            <span className="header__toggle-icon" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </header>
  );
}
