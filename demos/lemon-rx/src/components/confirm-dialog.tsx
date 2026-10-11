"use client";

import { useEffect, useRef } from "react";

/** Diálogo modal nativo: foco atrapado, Esc para cerrar y accesible sin librerías. */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  danger,
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onCancel();
      }}
      onClick={(e) => {
        if (e.target === ref.current && !busy) onCancel();
      }}
      className="confirm-dialog m-auto w-[calc(100%-2rem)] max-w-md rounded-md border border-line-strong bg-ink-2 p-0 text-chalk"
    >
      <div className="p-6">
        <h2 className="font-display text-[26px] font-bold uppercase leading-tight text-balance">{title}</h2>
        {body && <p className="mt-3 text-[16px] leading-relaxed text-chalk-2">{body}</p>}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={busy}>
            Cancelar
          </button>
          <button
            type="button"
            className={danger ? "btn-danger" : "btn-primary"}
            onClick={onConfirm}
            disabled={busy}
            aria-busy={busy}
            autoFocus
          >
            {busy ? "Un momento…" : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
