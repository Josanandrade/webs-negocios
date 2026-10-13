"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { PhoneIcon } from "./icons";
import { Wordmark } from "./Wordmark";

const nav = [
  { href: "#para-quien", label: "Para quién" },
  { href: "#que-tratamos", label: "Qué tratamos" },
  { href: "#esperanza", label: "Esperanza" },
  { href: "#como-trabajamos", label: "Cómo trabajamos" },
  { href: "#opiniones", label: "Opiniones" },
  { href: "#contacto", label: "Contacto" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // El menú móvil va fuera de <header>: el backdrop-filter del header crearía
  // un bloque contenedor y el panel "fixed" quedaría recortado a su altura.
  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-[background-color,box-shadow] duration-300 ${
          scrolled || open ? "bg-paper/95 shadow-[0_1px_0_rgb(29_41_37/0.08)] backdrop-blur" : "bg-paper/0"
        }`}
      >
        <div className="container-x flex h-[4.5rem] items-center justify-between gap-4">
          <a href="#inicio" className="rounded-lg" aria-label={`${site.name}, ir al inicio`}>
            <Wordmark />
          </a>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-7 text-[0.95rem]">
              {nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="link-underline decoration-transparent hover:decoration-current">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <a href={site.phoneHref} className="btn btn-primary hidden !min-h-11 !px-5 !py-2 sm:inline-flex">
              <PhoneIcon className="size-4" />
              <span>{site.phone}</span>
            </a>
            <button
              ref={buttonRef}
              type="button"
              className="grid size-11 place-items-center rounded-full ring-1 ring-ink/20 lg:hidden"
              aria-expanded={open}
              aria-controls="menu-movil"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
              <span aria-hidden className="relative block h-3 w-5">
                <span
                  className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-ink transition-transform duration-300 ${open ? "translate-y-[5px] rotate-45" : ""}`}
                />
                <span
                  className={`absolute bottom-0 left-0 h-0.5 w-5 rounded bg-ink transition-transform duration-300 ${open ? "-translate-y-[5px] -rotate-45" : ""}`}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        id="menu-movil"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-[4.5rem] z-40 overflow-y-auto bg-paper lg:hidden"
      >
        <nav aria-label="Menú móvil" className="container-x flex min-h-full flex-col pb-10 pt-6">
          <ul className="flex flex-col">
            {nav.map((item) => (
              <li key={item.href} className="border-b border-ink/10">
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between py-4 font-serif text-2xl"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-col gap-3 pt-8">
            <a href={site.phoneHref} className="btn btn-primary w-full">
              <PhoneIcon /> Llamar al {site.phone}
            </a>
            <a href="#contacto" onClick={() => setOpen(false)} className="btn btn-ghost w-full">
              Pedir cita por escrito
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
