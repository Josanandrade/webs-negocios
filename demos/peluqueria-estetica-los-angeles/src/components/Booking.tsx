"use client";

import { useEffect, useRef, useState } from "react";
import { salon, serviceGroups } from "@/content/salon";

const OPEN_EVENT = "losangeles:booking";

const moments = ["Por la mañana", "Viernes por la tarde", "Sábado por la mañana", "Me da igual"];

type OpenDetail = { preset?: string };

export function BookingTrigger({
  children,
  className,
  preset,
}: {
  children: React.ReactNode;
  className?: string;
  preset?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      aria-haspopup="dialog"
      onClick={() =>
        window.dispatchEvent(new CustomEvent<OpenDetail>(OPEN_EVENT, { detail: { preset } }))
      }
    >
      {children}
    </button>
  );
}

// Hoja de cita: ayuda a preparar la llamada. No envía datos a ningún sitio.
export function Booking() {
  const ref = useRef<HTMLDialogElement>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [moment, setMoment] = useState<string | null>(null);

  useEffect(() => {
    function onOpen(e: Event) {
      const preset = (e as CustomEvent<OpenDetail>).detail?.preset;
      setPicked(preset ? [preset] : []);
      setMoment(null);
      const dialog = ref.current;
      if (dialog && !dialog.open) {
        dialog.removeAttribute("data-closing");
        dialog.showModal();
      }
    }
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  function close() {
    const dialog = ref.current;
    if (!dialog || dialog.hasAttribute("data-closing")) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      dialog.close();
      return;
    }
    dialog.setAttribute("data-closing", "");
    // La salida es más corta que la entrada; cerramos al terminar.
    const done = () => {
      dialog.removeAttribute("data-closing");
      dialog.close();
    };
    dialog.addEventListener("animationend", done, { once: true });
    window.setTimeout(() => dialog.open && done(), 260);
  }

  function toggle(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  const names = serviceGroups
    .filter((g) => picked.includes(g.id))
    .map((g) => g.title.toLowerCase());
  const what = names.length ? names.join(", ").replace(/, ([^,]*)$/, " y $1") : "una cita";
  const message = `Hola, quería pedir cita para ${what}${moment && moment !== "Me da igual" ? `, ${moment.toLowerCase()}` : ""}.`;
  const waHref = `https://wa.me/${salon.whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby="sheet-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="sheet-inner">
        <div className="sheet-head">
          <h2 id="sheet-title" className="sheet-title">
            Pide tu cita
          </h2>
          <button type="button" className="sheet-close" onClick={close} aria-label="Cerrar">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <fieldset className="sheet-set">
          <legend>¿Qué te quieres hacer?</legend>
          <div className="chips">
            {serviceGroups.map((g) => (
              <button
                key={g.id}
                type="button"
                className="chip"
                aria-pressed={picked.includes(g.id)}
                onClick={() => toggle(g.id)}
              >
                {g.title}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="sheet-set">
          <legend>¿Cuándo te viene mejor?</legend>
          <div className="chips">
            {moments.map((m) => (
              <button
                key={m}
                type="button"
                className="chip"
                aria-pressed={moment === m}
                onClick={() => setMoment(moment === m ? null : m)}
              >
                {m}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="sheet-summary">
          <p className="sheet-label">Al llamar, solo tienes que decir:</p>
          <p className="sheet-quote">«{message}»</p>
        </div>

        <div className="sheet-actions">
          <a className="btn btn-hot btn-block" href={salon.phone.href}>
            <PhoneIcon />
            Llamar al {salon.phone.display}
          </a>
          {salon.whatsappEnabled && (
            <a className="btn btn-line btn-block" href={waHref} target="_blank" rel="noopener noreferrer">
              Enviar por WhatsApp
            </a>
          )}
        </div>
        <p className="sheet-fine">
          Esta página no guarda ni envía tus datos. La cita se confirma con el salón.
        </p>
      </div>
    </dialog>
  );
}

export function PhoneIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6.6 3.5h2.6l1.4 4.1-2 1.4a12.4 12.4 0 0 0 6.4 6.4l1.4-2 4.1 1.4v2.6a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z" />
    </svg>
  );
}
