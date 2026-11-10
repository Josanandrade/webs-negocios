"use client";

import { useState } from "react";

type Athlete = { id: string; full_name: string; email: string | null };
export function BillingForm({ athletes, action }: { athletes: Athlete[]; action: (form: FormData) => Promise<void> }) {
  const [kind, setKind] = useState<"payment" | "courtesy">("payment");
  return <section className="mt-8 rounded-sm border border-line bg-ink-2 p-5">
    <h2 className="font-display text-2xl font-bold uppercase">Nuevo registro</h2>
    <form action={action} className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="sm:col-span-2 text-sm">Atleta
        <select name="user_id" required className="field mt-1 w-full" defaultValue=""><option value="" disabled>Selecciona un atleta</option>{athletes.map(a => <option key={a.id} value={a.id}>{a.full_name || a.email}</option>)}</select>
      </label>
      <label className="text-sm">Tipo
        <select name="kind" value={kind} onChange={e => setKind(e.target.value as "payment" | "courtesy")} className="field mt-1 w-full"><option value="payment">Pago</option><option value="courtesy">Cortesía</option></select>
      </label>
      {kind === "payment" && <label className="text-sm">Importe (€)
        <input name="amount" inputMode="decimal" required placeholder="35,00" className="field mt-1 w-full" />
      </label>}
      <label className="text-sm">Inicio de cobertura
        <input type="date" name="starts_on" required className="field mt-1 w-full" />
      </label>
      <label className="text-sm">Fin de cobertura (inclusive)
        <input type="date" name="ends_on" required className="field mt-1 w-full" />
      </label>
      {kind === "payment" && <label className="text-sm">Fecha de pago
        <input type="date" name="paid_on" required className="field mt-1 w-full" />
      </label>}
      <label className="sm:col-span-2 text-sm">Observaciones (opcional)
        <textarea name="note" maxLength={1000} rows={2} className="field mt-1 w-full" placeholder="Motivo de la cortesía o referencia del pago" />
      </label>
      <button type="submit" className="btn-primary sm:col-span-2">Guardar {kind === "courtesy" ? "cortesía" : "pago"}</button>
    </form>
  </section>;
}
