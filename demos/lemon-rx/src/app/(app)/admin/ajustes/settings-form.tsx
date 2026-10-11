"use client";

import { useOptimistic, useTransition } from "react";
import { setSetting } from "../actions";
import { Toast, useToast } from "@/components/toast";
import type { Settings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: Settings }) {
  const [optimistic, apply] = useOptimistic(settings, (s, patch: Partial<Settings>) => ({ ...s, ...patch }));
  const [, startTransition] = useTransition();
  const { toast, show } = useToast();

  function toggle(key: keyof Settings) {
    const value = !optimistic[key];
    startTransition(async () => {
      apply({ [key]: value });
      const result = await setSetting(key, value);
      show(result.ok ? "Ajuste guardado" : result.error, result.ok ? "ok" : "error");
    });
  }

  return (
    <>
      <section aria-labelledby="acceso" className="mt-8">
        <h2 id="acceso" className="eyebrow">
          Acceso
        </h2>
        <ul className="mt-3 border-t border-line">
          <SettingRow
            id="auto_block_unpaid"
            title="Ocultar programación automáticamente a usuarios que no hayan pagado"
            description={
              optimistic.auto_block_unpaid
                ? "Activado: solo ven la programación los usuarios con pago «Pagado» y acceso «Activo»."
                : "Desactivado: el estado de pago no bloquea. Basta con que el acceso esté «Activo»."
            }
            checked={optimistic.auto_block_unpaid}
            onToggle={() => toggle("auto_block_unpaid")}
          />
          <SettingRow
            id="show_past_weeks"
            title="Mostrar semanas anteriores"
            description={
              optimistic.show_past_weeks
                ? "Los usuarios pueden consultar semanas ya pasadas."
                : "Los usuarios solo ven la semana actual y las siguientes publicadas."
            }
            checked={optimistic.show_past_weeks}
            onToggle={() => toggle("show_past_weeks")}
          />
        </ul>
        <p className="mt-4 text-[15px] leading-relaxed text-chalk-3">
          Independientemente de estos ajustes, puedes bloquear o activar a cualquier usuario desde Usuarios.
        </p>
      </section>
      <Toast toast={toast} className="bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-8" />
    </>
  );
}

function SettingRow({
  id,
  title,
  description,
  checked,
  onToggle,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="flex items-start justify-between gap-5 border-b border-line py-5">
      <div className="min-w-0">
        <p id={`${id}-label`} className="text-[17px] font-semibold leading-snug">
          {title}
        </p>
        <p id={`${id}-desc`} className="mt-1.5 text-[15px] leading-relaxed text-chalk-2">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-desc`}
        onClick={onToggle}
        className={`switch press relative mt-0.5 after:absolute after:-inset-2 after:content-[''] h-8 w-[3.25rem] shrink-0 rounded-full border ${
          checked ? "border-lemon bg-lemon" : "border-line-strong bg-ink-3"
        }`}
      >
        <span className="sr-only">{checked ? "ON" : "OFF"}</span>
        <span
          aria-hidden
          className={`absolute left-[3px] top-[3px] h-6 w-6 rounded-full ${checked ? "bg-lemon-ink" : "bg-chalk-3"}`}
          style={{ transform: checked ? "translateX(1.25rem)" : "translateX(0)" }}
        />
      </button>
    </li>
  );
}
