"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addMovement, removeMovement, saveMovementRms, setMovementRmEligibility } from "./actions";
import type { Movement, UserRm } from "@/lib/strength";
import { MovementPicker } from "@/components/movement-picker";
import { Toast, useToast } from "@/components/toast";

type Props = { movements: Movement[]; rms: UserRm[]; isAdmin: boolean };

function value(v: number | null | undefined) { return v == null ? "" : String(Number(v)).replace(".", ","); }

export function RmEditor({ movements, rms, isAdmin }: Props) {
  const router = useRouter();
  const { toast, show } = useToast();
  const rmMovements = useMemo(() => movements.filter((movement) => movement.is_rm_eligible), [movements]);
  const initial = useMemo(() => Object.fromEntries(rms.map((r) => [r.movement_id, { rm_1: value(r.rm_1), rm_2: value(r.rm_2), rm_3: value(r.rm_3), rm_4: value(r.rm_4), rm_5: value(r.rm_5) }])), [rms]);
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>(initial);
  const [selected, setSelected] = useState(rmMovements[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const current = drafts[selected] ?? { rm_1: "", rm_2: "", rm_3: "", rm_4: "", rm_5: "" };
  const selectedMovement = rmMovements.find((m) => m.id === selected);

  useEffect(() => {
    if (!rmMovements.some((movement) => movement.id === selected)) setSelected(rmMovements[0]?.id ?? "");
  }, [rmMovements, selected]);

  function setField(key: string, val: string) { setDrafts((d) => ({ ...d, [selected]: { ...current, [key]: val } })); }
  function save() {
    startTransition(async () => {
      const result = await saveMovementRms(selected, current);
      if (result.ok) show(result.message ?? "RM guardados correctamente."); else show(result.error, "error");
    });
  }

  return (
    <>
      <div className="mt-6 rounded-sm border border-line bg-ink-2 p-4">
        <label className="block">
          <span className="label">Movimiento</span>
          <MovementPicker className="mt-1" movements={rmMovements} value={selected} onChange={setSelected} placeholder="Buscar movimiento con RM…" ariaLabel="Buscar movimiento para informar RM" />
        </label>
        {rmMovements.length === 0 && <p className="mt-4 text-[14px] text-chalk-3">No hay movimientos habilitados para informar RM.</p>}
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
      {isAdmin && <div className="mt-6"><MovementAdmin movements={movements} notify={show} onRefresh={() => router.refresh()} /></div>}
      <Toast toast={toast} className="bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-8" />
    </>
  );
}

function MovementAdmin({ movements, notify, onRefresh }: { movements: Movement[]; notify: (text: string, tone?: "ok" | "error") => void; onRefresh: () => void }) {
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const filtered = movements.filter((movement) => movement.name.toLocaleLowerCase("es").includes(query.trim().toLocaleLowerCase("es")));

  return <details className="rounded-sm border border-line bg-ink-2">
    <summary className="press flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
      <div><p className="eyebrow">Admin</p><h2 className="mt-0.5 font-display text-[20px] font-bold uppercase">Gestionar movimientos</h2></div>
      <span className="text-[13px] font-semibold text-chalk-3">Abrir ▾</span>
    </summary>
    <div className="border-t border-line p-4">
      <p className="text-[14px] text-chalk-3">El catálogo sirve para toda la programación. Marca <strong className="text-chalk-2">Mostrar en RM</strong> solo en los movimientos donde tenga sentido informar una marca. Desmarcarlo no borra el movimiento ni los RM ya guardados.</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej.: Pause Front Squat" className="field flex-1" /><button type="button" disabled={pending || !name.trim()} className="btn-secondary" onClick={() => startTransition(async () => { const r = await addMovement(name); if (r.ok) { setName(""); notify(r.message ?? "Movimiento guardado correctamente."); onRefresh(); } else notify(r.error, "error"); })}>{pending ? "Guardando…" : "Añadir"}</button></div>
      <label className="mt-4 block"><span className="label">Buscar en el catálogo</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Escribe para filtrar movimientos…" className="field mt-1 w-full" /></label>
      <div className="mt-4 max-h-96 overflow-y-auto border-t border-line">
        {filtered.map((m) => <div key={m.id} className="flex min-h-12 items-center gap-3 border-b border-line py-2">
          <span className="min-w-0 flex-1 text-[15px] text-chalk-2">{m.name}</span>
          <label className="flex shrink-0 items-center gap-2 rounded-sm border border-line px-2 py-1.5 text-[12px] font-semibold text-chalk-2" title="Mostrar este movimiento en la pestaña RM de los usuarios"><input type="checkbox" checked={m.is_rm_eligible} disabled={pending} onChange={(e) => { const enabled = e.target.checked; startTransition(async () => { const r = await setMovementRmEligibility(m.id, enabled); if (r.ok) { notify(r.message ?? (enabled ? "Movimiento activado para RM." : "Movimiento ocultado de RM.")); onRefresh(); } else notify(r.error, "error"); }); }} className="h-4 w-4 accent-[var(--color-lemon)]" />Mostrar en RM</label>
          {removing === m.id ? <span className="flex shrink-0 items-center gap-2"><button type="button" disabled={pending} className="press text-[13px] font-semibold text-danger" onClick={() => startTransition(async () => { const r = await removeMovement(m.id); if (r.ok) { setRemoving(null); notify(r.message ?? "Movimiento eliminado del catálogo."); onRefresh(); } else notify(r.error, "error"); })}>Confirmar</button><button type="button" className="press text-[13px] text-chalk-3" onClick={() => setRemoving(null)}>Cancelar</button></span> : <button type="button" className="press shrink-0 text-[13px] font-semibold text-danger/80 hover:text-danger" onClick={() => setRemoving(m.id)}>Eliminar</button>}
        </div>)}
        {filtered.length === 0 && <p className="py-4 text-[14px] text-chalk-3">No hay movimientos que coincidan con la búsqueda.</p>}
      </div>
    </div>
  </details>;
}
