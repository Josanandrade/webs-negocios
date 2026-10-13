"use client";

import { useState, useTransition } from "react";
import { setUserSex } from "../actions";
import type { Sex } from "@/lib/types";

export function SexForm({ userId, initialSex }: { userId: string; initialSex: Sex | null }) {
  const [sex, setSex] = useState<Sex | "">(initialSex ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    if (sex !== "male" && sex !== "female") {
      setMessage("Selecciona Hombre o Mujer.");
      return;
    }
    setMessage(null);
    startTransition(async () => {
      const result = await setUserSex(userId, sex);
      setMessage(result.ok ? "Guardado." : result.error);
    });
  }

  return (
    <div className="mt-5 rounded-sm border border-line bg-ink-2 p-4">
      <p className="eyebrow">Sexo para rankings</p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="athlete-sex" className="label">Sexo</label>
          <select id="athlete-sex" value={sex} onChange={(e) => { setSex(e.target.value as Sex | ""); setMessage(null); }} className="field">
            <option value="">Sin informar</option>
            <option value="male">Hombre</option>
            <option value="female">Mujer</option>
          </select>
        </div>
        <button type="button" onClick={save} disabled={pending || sex === initialSex} className="btn-secondary">
          {pending ? "Guardando…" : "Guardar"}
        </button>
      </div>
      <p className="mt-2 text-[13px] text-chalk-3">Los usuarios sin sexo informado no aparecen en los rankings hasta que se complete este dato.</p>
      {message && <p className="mt-2 text-[14px] text-chalk-2">{message}</p>}
    </div>
  );
}
