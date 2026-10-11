"use client";

import { useState } from "react";
import { BLOCK_PRESETS } from "./block-editor";

/** Añadir bloque: elige un nombre habitual o empieza en blanco. Ningún nombre es obligatorio. */
export function AddBlock({ onAdd }: { onAdd: (title: string) => void }) {
  const [open, setOpen] = useState(false);

  function pick(title: string) {
    setOpen(false);
    onAdd(title);
  }

  return (
    <div className="mt-4">
      <datalist id="block-presets">
        {BLOCK_PRESETS.map((p) => (
          <option key={p} value={p.toUpperCase()} />
        ))}
      </datalist>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn w-full border border-dashed border-line-strong text-chalk-2 hover:text-chalk"
        >
          + Añadir bloque
        </button>
      ) : (
        <div className="enter rounded-sm border border-line-strong">
          <div className="flex items-center justify-between border-b border-line pl-4">
            <p className="eyebrow">Tipo de bloque</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="press h-12 px-4 text-[15px] font-semibold text-chalk-3 hover:text-chalk"
            >
              Cerrar
            </button>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3">
            {BLOCK_PRESETS.map((p) => (
              <li key={p} className="border-b border-line odd:border-r sm:odd:border-r-0 sm:[&:not(:nth-child(3n))]:border-r">
                <button
                  type="button"
                  onClick={() => pick(p.toUpperCase())}
                  className="day-trigger flex h-12 w-full items-center px-4 text-left font-display text-[16px] font-bold uppercase tracking-[0.06em]"
                >
                  {p}
                </button>
              </li>
            ))}
            <li className="col-span-2 sm:col-span-3">
              <button
                type="button"
                onClick={() => pick("")}
                className="day-trigger flex h-12 w-full items-center px-4 text-left text-[16px] font-semibold text-lemon"
              >
                En blanco, con mi propio nombre
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
