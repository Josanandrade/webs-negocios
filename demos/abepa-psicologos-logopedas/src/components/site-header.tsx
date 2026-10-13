"use client";

import { useEffect, useRef, useState } from "react";
import { nav, primaryPhone } from "@/lib/site";
import { PhoneIcon } from "./icons";
import { Wordmark } from "./wordmark";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const mq = window.matchMedia("(min-width: 60em)");
    const onMq = () => mq.matches && setOpen(false);
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    document.documentElement.classList.add("menu-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
      document.documentElement.classList.remove("menu-open");
    };
  }, [open]);

  return (
    <header className="header" data-scrolled={scrolled || undefined} data-open={open || undefined}>
      <div className="header__bar container">
        <a href="#inicio" className="header__brand" onClick={() => setOpen(false)}>
          <Wordmark />
        </a>

        <nav className="header__nav" aria-label="Principal">
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__actions">
          <a href={primaryPhone.href} className="btn btn--small btn--ghost header__call">
            <PhoneIcon className="btn__icon" />
            <span>{primaryPhone.display}</span>
          </a>
          <a href="#contacto" className="btn btn--small btn--solid header__cta">
            Pedir cita
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="header__toggle"
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="visually-hidden">{open ? "Cerrar menú" : "Abrir menú"}</span>
            <span className="header__burger" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="menu-movil" className="header__sheet" hidden={!open}>
        <nav aria-label="Menú móvil" className="container">
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#contacto" onClick={() => setOpen(false)}>
                Contacto
              </a>
            </li>
          </ul>
          <a href={primaryPhone.href} className="btn btn--solid btn--block">
            <PhoneIcon className="btn__icon" />
            Llamar al {primaryPhone.display}
          </a>
        </nav>
      </div>
    </header>
  );
}
