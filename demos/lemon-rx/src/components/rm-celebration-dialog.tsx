"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { shareRmAchievements } from "@/app/(app)/rm-share-actions";
import type { RmCelebration } from "@/lib/rm-achievements";

export function RmCelebrationDialog({ celebration }: { celebration: RmCelebration | null }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [share, setShare] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !celebration) return;
    const key = `lemon-rx:rm-celebration:${celebration.id}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
    } catch {
      // Si sessionStorage está bloqueado, mostramos el diálogo igualmente.
    }
    setShare(false);
    setError(null);
    if (!dialog.open) dialog.showModal();
  }, [celebration]);

  function rememberAndClose() {
    if (celebration) {
      try {
        window.sessionStorage.setItem(`lemon-rx:rm-celebration:${celebration.id}`, "1");
      } catch {
        // El cierre no depende de sessionStorage.
      }
    }
    ref.current?.close();
  }

  function confirm() {
    if (!celebration) return;
    if (!share) {
      rememberAndClose();
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await shareRmAchievements(celebration.achievementIds);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      rememberAndClose();
    });
  }

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) rememberAndClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current && !pending) rememberAndClose();
      }}
      className="confirm-dialog m-auto w-[calc(100%-2rem)] max-w-md rounded-md border border-line-strong bg-ink-2 p-0 text-chalk"
    >
      {celebration && (
        <div className="p-5">
          <p className="eyebrow text-lemon">Nuevo récord</p>
          <h2 className="mt-1 font-display text-[28px] font-extrabold uppercase leading-tight">🏆 ¡Enhorabuena!</h2>
          <p className="mt-4 text-[17px] leading-[1.55] text-chalk-2">{celebration.message.replace(/^🏆\s*¡Enhorabuena!\s*/, "")}</p>
          <p className="mt-4 text-[15px] font-semibold text-chalk">¿Quieres compartirlo con el resto de atletas en la HOME?</p>

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-sm border border-line bg-ink px-3 py-3">
            <input
              type="checkbox"
              checked={share}
              disabled={pending}
              onChange={(event) => setShare(event.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-lemon)]"
            />
            <span>
              <span className="block text-[15px] font-semibold text-chalk">Compartir este logro en HOME</span>
              <span className="mt-0.5 block text-[13px] leading-snug text-chalk-3">Si no lo marcas, tu RM se guarda igualmente y no se publica.</span>
            </span>
          </label>

          {error && <p className="mt-3 text-[14px] font-semibold text-danger">{error}</p>}

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" disabled={pending} onClick={rememberAndClose} className="btn-secondary">Cerrar</button>
            <button type="button" disabled={pending} onClick={confirm} className="btn-primary">
              {pending ? "Compartiendo…" : share ? "Compartir y continuar" : "Continuar sin compartir"}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
