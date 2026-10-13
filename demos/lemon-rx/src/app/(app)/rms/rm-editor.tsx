"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addMovement, removeMovement, saveMovementRms } from "./actions";
import type { Movement, UserRm } from "@/lib/strength";
import { Toast, useToast } from "@/components/toast";

type Props = { movements: Movement[]; rms: UserRm[]; isAdmin: boolean };

function value(v: number | null | undefined) { return v == null ? "" : String(Number(v)).replace(".", ","); }

export function RmEditor({ movements, rms, isAdmin }: Props) {
  const router = useRouter();
  const { toast, show } = useToast();
  const initial = useMemo(() => Object.fromEntries(rms.map((r) => [r.movement_id, { rm_1: value(r.rm_1), rm_2: value(r.rm_2), rm_3: value(r.rm_3), rm_4: value(r.rm_4), rm_5: value(r.rm_5) }])), [rms]);
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>(initial);
  const [selected, setSelected] = useState(movements[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const current = drafts[selected] ?? { rm_1: "", rm_2: "", rm_3: "", rm_4: "", rm_5: "" };
  const selectedMovement = movements.find((m) => m.id === selected);

  function setField(key: string, val: string) { setDrafts((d) => ({ ...d, [selected]: { ...current, [key]: val } })); }
  function save() {
    startTransition(async () => {
      const result = await saveMovementRms(selected, current);
      if (result.ok) show("RM actualizados"); else show(result.error, "error");
    });
  }

  return (
    <>
      {isAdmin && <MovementAdmin movements={movements} notify={show} onRefresh={() => router.refresh()} />}
      <div className="mt-6 rounded-sm border border-line bg-ink-2 p-4">
        <label className="block"><span className="label">Movimiento</span><select value={selected} onChange={(e) => setSelected(e.target.value)} className="field mt-1 w-full"><option value="">Elige un movimiento</option>{movements.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
        {selectedMovement && (
          <div className="mt-5">
            <h2 className="font-display text-[26px] font-bold uppercase text-lemon">{selectedMovement.name}</h2>
            <p className="mt-1 text-[14px] text-chalk-3">Introduce tus mejores marcas. Los porcentajes de Strength y Weightlifting siempre se calcularán sobre el 1RM.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {([1,2,3,4,5] as const).map((n) => <label key={n} className="block"><span className="label">{n}RM</span><div className="relative mt-1"><input inputMode="decimal" value={current[`rm_${n}`] ?? ""} onChange={(e) => setField(`rm_${n}`, e.target.value)} className="field w-full pr-10 font-display text-[20px] font-bold" placeholder="—" /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-chalk-3">kg</span></div></label>)}
            </div>
            <button type="button" onClick={save} disabled={pending} className="btn-primary mt-5">{pending ? "Guardando…" : "Guardar RM"}</button>
          </div>
        )}
      </div>
      <Toast toast={toast} />
    </>
  );
}

function MovementAdmin({ movements, notify, onRefresh }: { movements: Movement[]; notify: (text: string, tone?: "ok" | "error") => void; onRefresh: () => void }) {
  const [name, setName] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return <div className="rounded-sm border border-line bg-ink-2 p-4">
    <p className="eyebrow">Admin</p>
    <h2 className="mt-1 font-display text-[22px] font-bold uppercase">Gestionar movimientos</h2>
    <p className="mt-1 text-[14px] text-chalk-3">El catálogo es común para RM's y Strength/Weightlifting. Al eliminar un movimiento deja de aparecer para nuevas programaciones, pero se conserva en entrenamientos e históricos antiguos.</p>
    <div className="mt-3 flex flex-col gap-2 sm:flex-row"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej.: Pause Front Squat" className="field flex-1" /><button type="button" disabled={pending || !name.trim()} className="btn-secondary" onClick={() => startTransition(async () => { const r = await addMovement(name); if (r.ok) { setName(""); notify("Movimiento añadido"); onRefresh(); } else notify(r.error, "error"); })}>{pending ? "Añadiendo…" : "Añadir"}</button></div>
    <div className="mt-5 max-h-72 overflow-y-auto border-t border-line pt-3">
      {movements.map((m) => <div key={m.id} className="flex min-h-11 items-center justify-between gap-3 border-b border-line py-2"><span className="text-[15px] text-chalk-2">{m.name}</span>{removing === m.id ? <span className="flex items-center gap-2"><button type="button" disabled={pending} className="press text-[14px] font-semibold text-danger" onClick={() => startTransition(async () => { const r = await removeMovement(m.id); if (r.ok) { setRemoving(null); notify("Movimiento eliminado del catálogo"); onRefresh(); } else notify(r.error, "error"); })}>Confirmar</button><button type="button" className="press text-[14px] text-chalk-3" onClick={() => setRemoving(null)}>Cancelar</button></span> : <button type="button" className="press text-[14px] font-semibold text-danger/80 hover:text-danger" onClick={() => setRemoving(m.id)}>Eliminar</button>}</div>)}
    </div>
  </div>;
}
