"use client";

import type { Movement } from "@/lib/strength";
import type { BuilderItem, BuilderSection } from "@/lib/types";
import { MovementPicker } from "@/components/movement-picker";

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (Number(c) ^ ((Math.random() * 16) >> (Number(c) / 4))).toString(16));
}

export function newBuilderSection(label = "A.1"): BuilderSection {
  return {
    id: newId(),
    label,
    count_type: "sets",
    count_min: 1,
    count_max: 1,
    items: [{ id: newId(), type: "exercise", movement_id: "", reps: 1, instruction: "", track_load: true, percentage_min: null, percentage_max: null }],
  };
}

function move<T>(rows: T[], index: number, delta: -1 | 1) {
  const target = index + delta;
  if (target < 0 || target >= rows.length) return rows;
  const next = [...rows];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function positiveInt(value: string, fallback: number, max = 100) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? Math.min(n, max) : fallback;
}

function percentageOrNull(value: string) {
  if (!value.trim()) return null;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n > 0 && n <= 200 ? Math.round(n * 100) / 100 : null;
}

function nextBlockLabel(sections: BuilderSection[]) {
  const last = sections.at(-1)?.label.trim().toUpperCase() ?? "";
  const match = last.match(/^([A-Z]+)\.(\d+)$/);
  return match ? `${match[1]}.${Number(match[2]) + 1}` : `A.${sections.length + 1}`;
}

export function FreeStrengthEditor({ sections, movements, onChange }: {
  sections: BuilderSection[];
  movements: Movement[];
  onChange: (sections: BuilderSection[]) => void;
}) {
  function patchSection(index: number, patch: Partial<BuilderSection>) {
    onChange(sections.map((section, i) => i === index ? { ...section, ...patch } : section));
  }
  function patchItem(sectionIndex: number, itemIndex: number, patch: Record<string, unknown>) {
    const section = sections[sectionIndex];
    patchSection(sectionIndex, { items: section.items.map((item, i) => i === itemIndex ? { ...item, ...patch } as BuilderItem : item) });
  }
  function addItem(sectionIndex: number, type: BuilderItem["type"]) {
    const section = sections[sectionIndex];
    const item: BuilderItem = type === "exercise"
      ? { id: newId(), type, movement_id: "", reps: 1, instruction: "", track_load: true, percentage_min: null, percentage_max: null }
      : type === "rest"
        ? { id: newId(), type, duration: "" }
        : { id: newId(), type, text: "" };
    patchSection(sectionIndex, { items: [...section.items, item] });
  }
  function addBlock() {
    onChange([...sections, newBuilderSection(nextBlockLabel(sections))]);
  }

  return <div className="space-y-4">
    <div className="rounded-sm border border-lemon/30 bg-lemon/5 px-3 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="font-display text-[16px] font-bold uppercase text-lemon">Constructor libre</p><p className="mt-1 text-[13px] leading-relaxed text-chalk-3">Crea tantos bloques como necesites: A.1, A.2, A.3… Cada bloque puede tener ejercicios, descansos e indicaciones.</p></div>
        <button type="button" className="btn-primary h-10 shrink-0" onClick={addBlock}>+ Añadir bloque {nextBlockLabel(sections)}</button>
      </div>
    </div>

    {sections.map((section, sectionIndex) => <section key={section.id} className="rounded-sm border border-line bg-ink p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-[13px] font-bold uppercase tracking-[0.08em] text-chalk-3">Bloque</span>
        <input value={section.label} onChange={(e) => patchSection(sectionIndex, { label: e.target.value.slice(0, 30) })} placeholder="A.1" aria-label={`Nombre del bloque ${sectionIndex + 1}`} className="field w-24 font-display font-bold uppercase" />
        <span className="text-[13px] text-chalk-3">de</span>
        <input type="number" min={1} max={100} value={section.count_min} onChange={(e) => { const min = positiveInt(e.target.value, section.count_min); patchSection(sectionIndex, { count_min: min, count_max: Math.max(min, section.count_max) }); }} aria-label={`Mínimo de ${section.count_type} de ${section.label}`} className="field w-16 text-center font-display font-bold" />
        <span className="text-[13px] text-chalk-3">a</span>
        <input type="number" min={1} max={100} value={section.count_max} onChange={(e) => { const max = positiveInt(e.target.value, section.count_max); patchSection(sectionIndex, { count_max: Math.max(section.count_min, max) }); }} aria-label={`Máximo de ${section.count_type} de ${section.label}`} className="field w-16 text-center font-display font-bold" />
        <select value={section.count_type} onChange={(e) => patchSection(sectionIndex, { count_type: e.target.value === "rounds" ? "rounds" : "sets" })} className="field w-auto min-w-28">
          <option value="sets">sets</option>
          <option value="rounds">rounds</option>
        </select>
        <div className="ml-auto flex items-center">
          <MiniButton label="Subir bloque" onClick={() => onChange(move(sections, sectionIndex, -1))} disabled={sectionIndex === 0}>↑</MiniButton>
          <MiniButton label="Bajar bloque" onClick={() => onChange(move(sections, sectionIndex, 1))} disabled={sectionIndex === sections.length - 1}>↓</MiniButton>
          <MiniButton label="Eliminar bloque" danger onClick={() => onChange(sections.filter((_, i) => i !== sectionIndex))} disabled={sections.length === 1}>×</MiniButton>
        </div>
      </div>
      <p className="mt-2 text-[12px] text-chalk-3">Si el número es fijo, pon el mismo valor en ambos campos. Ej.: 3–4 sets o 3–3 rounds.</p>

      <div className="mt-4 space-y-2">
        {section.items.map((item, itemIndex) => <div key={item.id} className="rounded-sm border border-line bg-ink-2 p-2">
          {item.type === "exercise" && <div className="space-y-2">
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_84px_auto]">
              <MovementPicker movements={movements} value={item.movement_id} onChange={(movement_id) => patchItem(sectionIndex, itemIndex, { movement_id })} placeholder="Buscar ejercicio…" ariaLabel={`Ejercicio de ${section.label}`} className="min-w-0" />
              <div className="relative"><input type="number" min={1} max={500} value={item.reps} onChange={(e) => patchItem(sectionIndex, itemIndex, { reps: positiveInt(e.target.value, item.reps, 500) })} aria-label="Repeticiones" className="field w-full pr-9 text-center" /><span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-chalk-3">reps</span></div>
              <label className="flex min-h-11 items-center gap-2 whitespace-nowrap px-1 text-[13px] font-semibold text-chalk-2"><input type="checkbox" checked={item.track_load} onChange={(e) => patchItem(sectionIndex, itemIndex, { track_load: e.target.checked, ...(e.target.checked ? {} : { percentage_min: null, percentage_max: null }) })} className="h-4 w-4 accent-[var(--color-lemon)]" />Registrar carga</label>
            </div>
            {item.track_load && <div className="grid gap-2 sm:grid-cols-[112px_112px_minmax(0,1fr)]">
              <label><span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.05em] text-chalk-3">% 1RM desde</span><div className="relative"><input type="text" inputMode="decimal" value={item.percentage_min ?? ""} onChange={(e) => patchItem(sectionIndex, itemIndex, { percentage_min: percentageOrNull(e.target.value) })} placeholder="85" className="field w-full pr-7 text-right font-display font-bold" /><span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[12px] text-chalk-3">%</span></div></label>
              <label><span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.05em] text-chalk-3">% 1RM hasta</span><div className="relative"><input type="text" inputMode="decimal" value={item.percentage_max ?? ""} onChange={(e) => patchItem(sectionIndex, itemIndex, { percentage_max: percentageOrNull(e.target.value) })} placeholder={item.percentage_min != null ? String(item.percentage_min) : "90"} className="field w-full pr-7 text-right font-display font-bold" /><span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[12px] text-chalk-3">%</span></div></label>
              <label><span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.05em] text-chalk-3">Indicación opcional</span><input value={item.instruction} onChange={(e) => patchItem(sectionIndex, itemIndex, { instruction: e.target.value.slice(0, 120) })} placeholder="3030, RPE 8, touch & go…" className="field w-full" /></label>
            </div>}
            {!item.track_load && <input value={item.instruction} onChange={(e) => patchItem(sectionIndex, itemIndex, { instruction: e.target.value.slice(0, 120) })} placeholder="Indicación opcional: 3030, controlado, unbroken…" className="field w-full" />}
          </div>}

          {item.type === "rest" && <div className="flex items-center gap-2">
            <span className="shrink-0 rounded-full border border-lemon/50 bg-lemon/10 px-3 py-2 font-display text-[14px] font-bold uppercase tracking-[0.08em] text-lemon">Rest</span>
            <input value={item.duration} onChange={(e) => patchItem(sectionIndex, itemIndex, { duration: e.target.value.slice(0, 40) })} placeholder={'Indica el descanso: 30", 90", 2 min, 2–3 min…'} aria-label="Duración del descanso" className="field min-w-0 flex-1" />
          </div>}

          {item.type === "note" && <input value={item.text} onChange={(e) => patchItem(sectionIndex, itemIndex, { text: e.target.value.slice(0, 300) })} placeholder="Indicación libre" className="field w-full" />}

          <div className="mt-2 flex justify-end gap-1 border-t border-line pt-1">
            <MiniButton label="Subir elemento" onClick={() => patchSection(sectionIndex, { items: move(section.items, itemIndex, -1) })} disabled={itemIndex === 0}>↑</MiniButton>
            <MiniButton label="Bajar elemento" onClick={() => patchSection(sectionIndex, { items: move(section.items, itemIndex, 1) })} disabled={itemIndex === section.items.length - 1}>↓</MiniButton>
            <MiniButton label="Eliminar elemento" danger onClick={() => patchSection(sectionIndex, { items: section.items.filter((_, i) => i !== itemIndex) })}>×</MiniButton>
          </div>
        </div>)}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn-ghost h-10" onClick={() => addItem(sectionIndex, "exercise")}>+ Ejercicio</button>
        <button type="button" className="btn-ghost h-10" onClick={() => addItem(sectionIndex, "rest")}>+ Rest</button>
        <button type="button" className="btn-ghost h-10" onClick={() => addItem(sectionIndex, "note")}>+ Indicación</button>
      </div>
    </section>)}

    <button type="button" className="btn-secondary w-full" onClick={addBlock}>+ Añadir otro bloque ({nextBlockLabel(sections)})</button>
  </div>;
}

function MiniButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: string }) {
  return <button type="button" title={label} aria-label={label} onClick={onClick} disabled={disabled} className={`press flex h-9 w-9 items-center justify-center text-[18px] font-bold disabled:opacity-25 ${danger ? "text-danger" : "text-chalk-3 hover:text-chalk"}`}>{children}</button>;
}
