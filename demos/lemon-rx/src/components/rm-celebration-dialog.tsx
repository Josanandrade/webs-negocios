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
      // Si sessionStorage está bloqueado, mostramos la celebración igualmente.
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

  const achievementText = celebration?.message.replace(/^🏆\s*¡Enhorabuena!\s*/, "") ?? "";

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) rememberAndClose();
      }}
      className="m-0 h-[100dvh] max-h-none w-screen max-w-none border-0 bg-ink p-0 text-chalk backdrop:bg-ink"
    >
      {celebration && (
        <div className="relative min-h-[100dvh] overflow-hidden bg-ink">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-24 top-[8%] h-72 w-72 rounded-full border-[38px] border-lemon/10" />
            <div className="absolute -right-28 bottom-[12%] h-80 w-80 rounded-full border-[46px] border-lemon/10" />
            <div className="absolute left-[10%] top-[18%] font-display text-[42px] font-black text-lemon/25">✦</div>
            <div className="absolute right-[12%] top-[26%] rotate-12 font-display text-[32px] font-black text-lemon/20">✦</div>
            <div className="absolute bottom-[20%] left-[16%] -rotate-12 font-display text-[28px] font-black text-lemon/20">✦</div>
            <div className="absolute left-0 right-0 top-0 h-1.5 bg-lemon" />
          </div>

          <div className="relative mx-auto flex min-h-[100dvh] max-w-3xl flex-col px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(2rem+env(safe-area-inset-top))] sm:px-8 sm:py-10">
            <div className="flex justify-end">
              <button
                type="button"
                disabled={pending}
                onClick={rememberAndClose}
                aria-label="Cerrar celebración"
                className="press flex h-11 w-11 items-center justify-center rounded-full border border-line-strong bg-ink-2 text-[24px] text-chalk-2 hover:text-chalk"
              >
                ×
              </button>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center py-5 text-center sm:py-8">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-lemon bg-lemon/10 text-[52px] shadow-[0_0_60px_rgba(223,255,0,0.16)] sm:h-28 sm:w-28 sm:text-[62px]">
                🏆
              </div>

              <p className="mt-6 font-display text-[16px] font-extrabold uppercase tracking-[0.28em] text-lemon sm:text-[18px]">Nuevo récord personal</p>
              <h2 className="mt-3 font-display text-[60px] font-black uppercase leading-[0.82] tracking-[-0.035em] text-chalk sm:text-[88px]">
                ¡VAMOS!
              </h2>
              <p className="mt-6 max-w-2xl font-display text-[27px] font-extrabold uppercase leading-[1.02] text-chalk sm:text-[38px]">
                {achievementText}
              </p>
              <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-chalk-2 sm:text-[18px]">
                Has superado tu mejor marca. Esto merece celebrarse como toca. 🔥
              </p>
            </div>

            <div className="mx-auto w-full max-w-xl rounded-md border border-line-strong bg-ink-2/95 p-4 shadow-2xl sm:p-5">
              <p className="font-display text-[18px] font-bold uppercase text-chalk">¿Lo compartimos con el resto?</p>
              <p className="mt-1 text-[14px] leading-snug text-chalk-3">Tu RM ya está guardado. Publicarlo en HOME es totalmente opcional.</p>

              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-sm border border-line bg-ink px-3 py-3.5">
                <input
                  type="checkbox"
                  checked={share}
                  disabled={pending}
                  onChange={(event) => setShare(event.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-lemon)]"
                />
                <span>
                  <span className="block text-[15px] font-semibold text-chalk">Compartir este logro en HOME</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-chalk-3">La casilla viene desmarcada por defecto.</span>
                </span>
              </label>

              {error && <p className="mt-3 text-[14px] font-semibold text-danger">{error}</p>}

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button type="button" disabled={pending} onClick={rememberAndClose} className="btn-secondary w-full">Ahora no</button>
                <button type="button" disabled={pending} onClick={confirm} className="btn-primary w-full">
                  {pending ? "Compartiendo…" : share ? "Compartir en HOME" : "Guardar y continuar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
