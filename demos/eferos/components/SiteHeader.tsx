"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { business } from "@/business.config";
import { telHref } from "@/lib/site";
import Logo from "./Logo";
import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cerrar al navegar (ajuste de estado durante el render, sin efecto)
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Si la ventana pasa a escritorio con el menú abierto (p. ej. girar una tablet),
  // el panel se oculta por CSS: cerrarlo también en estado para liberar el scroll.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia("(min-width: 901px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [open]);

  // Bloqueo de scroll, Escape y foco dentro del panel móvil
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("a")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key !== "Tab" || !panel) return;
      const focusables = [toggleRef.current, ...panel.querySelectorAll<HTMLElement>("a")].filter(
        Boolean,
      ) as HTMLElement[];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <header className={`${styles.header} ${scrolled || open ? styles.solid : ""} ${open ? styles.isOpen : ""}`}>
      <div className={`wrap ${styles.bar}`}>
        <Link href="/" className={styles.brand}>
          <Logo tone={open ? "light" : "ink"} />
          <span className="visually-hidden"> Fisioterapia, ir al inicio</span>
        </Link>

        <nav className={styles.nav} aria-label="Principal">
          <ul role="list">
            {business.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.navLink}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <a href={telHref} className={styles.phone}>
            <span className="visually-hidden">Llamar al </span>
            {business.contact.phoneDisplay}
          </a>
          <a href={business.booking.url} className={`btn ${styles.cta}`} target="_blank" rel="noopener">
            {business.booking.label}
            <span className="arrow" aria-hidden="true">→</span>
          </a>
        </div>

        <button
          ref={toggleRef}
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls="menu-movil"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.toggleText}>{open ? "Cerrar" : "Menú"}</span>
          <span className={styles.toggleIcon} aria-hidden="true">
            <span />
            <span />
          </span>
        </button>
      </div>

      <div
        id="menu-movil"
        ref={panelRef}
        className={`${styles.panel} on-pine`}
        hidden={!open}
      >
        <nav aria-label="Menú móvil" className="wrap">
          <ul role="list" className={styles.panelList}>
            {business.nav.map((item, i) => (
              <li key={item.href} style={{ ["--i" as string]: i }}>
                <Link href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className={styles.panelFoot}>
            <a href={business.booking.url} className="btn btn--light" target="_blank" rel="noopener">
              {business.booking.label} online
              <span className="arrow" aria-hidden="true">→</span>
            </a>
            <div className={styles.panelContact}>
              <a href={business.contact.whatsappUrl} target="_blank" rel="noopener" className="link">
                WhatsApp
              </a>
              <a href={telHref} className="link tabular">
                {business.contact.phoneDisplay}
              </a>
            </div>
            <p className="label">
              {business.address.street} · {business.address.locality}
            </p>
          </div>
        </nav>
      </div>
    </header>
  );
}
