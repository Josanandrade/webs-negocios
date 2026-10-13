"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { categories, site, type CategoryId } from "@/content/site";

type BookingApi = { open: (category?: CategoryId) => void };

const BookingContext = createContext<BookingApi | null>(null);

/*
  Hoja de reserva. No crea citas: ayuda a elegir familia de tratamiento y
  lleva a la agenda online que el centro ya usa, o a llamar.
  <dialog> nativo: foco atrapado, Escape y fondo inerte sin librerías.
*/
export function BookingProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [choice, setChoice] = useState<CategoryId | null>(null);

  const open = useCallback((category?: CategoryId) => {
    setChoice(category ?? null);
    dialogRef.current?.showModal();
  }, []);

  const close = useCallback(() => dialogRef.current?.close(), []);

  // Bloquea el scroll del fondo mientras la hoja está abierta.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const sync = () =>
      document.documentElement.classList.toggle("is-locked", dialog.open);
    const observer = new MutationObserver(sync);
    observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
    return () => observer.disconnect();
  }, []);

  const selected = categories.find((c) => c.id === choice);

  return (
    <BookingContext.Provider value={{ open }}>
      {children}
      <dialog
        ref={dialogRef}
        className="sheet"
        aria-labelledby="sheet-title"
        onClick={(e) => {
          // Clic en el velo (fuera del panel) cierra.
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="sheet__panel">
          <div className="sheet__grip" aria-hidden="true" />
          <div className="sheet__head">
            <h2 id="sheet-title" className="sheet__title">
              Pedir cita
            </h2>
            <button type="button" className="sheet__close" onClick={close}>
              <span className="sr-only">Cerrar</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <fieldset className="sheet__choices">
            <legend>¿Qué te apetece?</legend>
            {categories.map((c) => (
              <label key={c.id} className="choice">
                <input
                  type="radio"
                  name="category"
                  value={c.id}
                  checked={choice === c.id}
                  onChange={() => setChoice(c.id)}
                />
                <span>{c.name}</span>
              </label>
            ))}
          </fieldset>

          <p className="sheet__hint" aria-live="polite">
            {selected
              ? `${selected.name}: elige día y hora en la agenda online y recibirás la confirmación de tu cita.`
              : "Elige una familia o ve directa a la agenda: allí verás todos los tratamientos y los huecos libres."}
          </p>

          <div className="sheet__actions">
            <a
              className="btn btn--solid"
              href={site.booking.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver horas libres
            </a>
            <a className="btn btn--ghost" href={site.phone.href}>
              Llamar al {site.phone.display}
            </a>
          </div>

          <p className="sheet__note">
            Propuesta de diseño: el botón abre la agenda de {site.booking.platform} que
            Pura Bellezza ya utiliza. Esta página no reserva nada por sí misma.
          </p>
        </div>
      </dialog>
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking fuera de BookingProvider");
  return ctx;
}

export function BookButton({
  children,
  category,
  className = "btn btn--solid",
}: {
  children: ReactNode;
  category?: CategoryId;
  className?: string;
}) {
  const { open } = useBooking();
  return (
    <button
      type="button"
      className={className}
      aria-haspopup="dialog"
      onClick={() => open(category)}
    >
      {children}
    </button>
  );
}
