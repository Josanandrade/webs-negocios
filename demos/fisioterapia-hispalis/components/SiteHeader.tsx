"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { business, telLink, whatsappLink } from "@/business.config";
import { PhoneIcon, WhatsAppIcon } from "./Icons";
import { Logo } from "./Logo";
import styles from "./SiteHeader.module.css";

const nav = [
  { href: "#tratamientos", label: "Tratamientos" },
  { href: "#angelica", label: "Angélica" },
  { href: "#como-trabajamos", label: "Cómo trabajamos" },
  { href: "#preguntas", label: "Preguntas" },
  { href: "#ubicacion", label: "Dónde estamos" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
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
    const onResize = () => window.innerWidth >= 960 && setOpen(false);
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <header className={`${styles.header} ${scrolled || open ? styles.solid : ""}`}>
      <div className={`container ${styles.bar}`}>
        <a href="#inicio" className={styles.brand} onClick={() => setOpen(false)}>
          <Logo />
        </a>

        <nav className={styles.nav} aria-label="Principal">
          <ul role="list">
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <a className={styles.phone} href={telLink}>
            <PhoneIcon />
            <span>{business.contact.phoneDisplay}</span>
          </a>
          <a
            className={`btn btn--primary ${styles.cta}`}
            href={whatsappLink("Hola Angélica, te escribo desde la web. Me gustaría pedir cita.")}
            target="_blank"
            rel="noopener"
          >
            Pedir cita
          </a>
          <button
            ref={toggleRef}
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="visually-hidden">{open ? "Cerrar menú" : "Abrir menú"}</span>
            <span className={styles.burger} data-open={open} aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <div id="menu-movil" className={styles.sheet} data-open={open} hidden={!open}>
        <nav aria-label="Menú móvil" className="container">
          <ul role="list" className={styles.sheetList}>
            {nav.map((item, i) => (
              <li key={item.href} style={{ "--i": i } as CSSProperties}>
                <a href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className={styles.sheetCtas}>
            <a className="btn btn--primary" href={whatsappLink("Hola Angélica, te escribo desde la web. Me gustaría pedir cita.")} target="_blank" rel="noopener">
              <WhatsAppIcon /> Escribir por WhatsApp
            </a>
            <a className="btn btn--ghost" href={telLink}>
              <PhoneIcon /> Llamar al {business.contact.phoneDisplay}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
