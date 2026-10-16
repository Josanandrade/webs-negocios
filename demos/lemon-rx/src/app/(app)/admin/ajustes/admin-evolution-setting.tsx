"use client";

import { useState, useTransition } from "react";
import { Toast, useToast } from "@/components/toast";
import { setMyEvolutionVisibility } from "./evolution-action";

export function AdminEvolutionSetting({ initialValue }: { initialValue: boolean }) {
  const [checked, setChecked] = useState(initialValue);
  const [pending, startTransition] = useTransition();
  const { toast, show } = useToast();

  function toggle() {
    const next = !checked;
    setChecked(next);
    startTransition(async () => {
      const result = await setMyEvolutionVisibility(next);
      if (!result.ok) setChecked(!next);
      show(result.ok ? "Ajuste guardado" : result.error, result.ok ? "ok" : "error");
    });
  }

  return (
    <>
      <section aria-labelledby="evolucion-admin" className="mt-10 border-t border-line pt-8">
        <p className="eyebrow">Tu actividad</p>
        <h2 id="evolucion-admin" className="mt-1 font-display text-[22px] font-bold uppercase">Evolución como atleta</h2>
        <div className="mt-4 flex items-start justify-between gap-5 border-y border-line py-5">
          <div className="min-w-0">
            <p id="show-evolution-label" className="text-[17px] font-semibold leading-snug">Mostrar mi evolución como atleta</p>
            <p id="show-evolution-desc" className="mt-1.5 text-[15px] leading-relaxed text-chalk-2">
              {checked
                ? "Tu actividad entra en los cálculos de evolución y será visible para el resto de admins/coachs igual que la de cualquier atleta."
                : "Tu actividad queda fuera del panel de evolución de admins/coachs. Puedes seguir usando la programación con normalidad."}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-labelledby="show-evolution-label"
            aria-describedby="show-evolution-desc"
            onClick={toggle}
            disabled={pending}
            className={`switch press relative mt-0.5 h-8 w-[3.25rem] shrink-0 rounded-full border after:absolute after:-inset-2 after:content-[''] ${checked ? "border-lemon bg-lemon" : "border-line-strong bg-ink-3"}`}
          >
            <span className="sr-only">{checked ? "ON" : "OFF"}</span>
            <span aria-hidden className={`absolute left-[3px] top-[3px] h-6 w-6 rounded-full ${checked ? "bg-lemon-ink" : "bg-chalk-3"}`} style={{ transform: checked ? "translateX(1.25rem)" : "translateX(0)" }} />
          </button>
        </div>
      </section>
      <Toast toast={toast} className="bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-8" />
    </>
  );
}
