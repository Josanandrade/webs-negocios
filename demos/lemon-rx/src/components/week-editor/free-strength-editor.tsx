"use client";

import type { Movement } from "@/lib/strength";
import type { BuilderComplexItem, BuilderItem, BuilderSection, BuilderSectionFormat, ComplexMovementRow, StrengthSchemeRow } from "@/lib/types";
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
    format: "sets",
    emom_interval_seconds: null,
    items: [{ id: newId(), type: "exercise", movement_id: "", reps: 1, instruction: "", track_load: true, percentage_min: null, percentage_max: null, scheme: null }],
  };
}

type LegacyStrengthShape = {
  movement_id?: string | null;
  strength_scheme?: StrengthSchemeRow[] | null;
  is_complex?: boolean;
  complex_movements?: ComplexMovementRow[] | null;
  rm_reference_movement_id?: string | null;
  is_emom?: boolean;
  emom_reps?: number | null;
  emom_interval_seconds?: number | null;
  emom_rounds?: number | null;
  emom_percentage?: number | null;
};

/** Convierte en memoria un bloque antiguo al constructor unificado sin cambiar su id ni su histórico. */
export function legacyStrengthToBuilderSections(block: LegacyStrengthShape): BuilderSection[] {
  const isEmom = Boolean(block.is_emom);
  const section: BuilderSection = {
    id: newId(),
    label: "A.1",
    count_type: isEmom ? "rounds" : "sets",
    count_min: isEmom ? Math.max(1, Number(block.emom_rounds || 1)) : 1,
    count_max: isEmom ? Math.max(1, Number(block.emom_rounds || 1)) : 1,
    format: isEmom ? "emom" : "free",
    emom_interval_seconds: isEmom ? block.emom_interval_seconds ?? null : null,
    items: [],
  };

  if (block.is_complex && block.complex_movements?.length) {
    section.items = [{
      id: newId(),
      type: "complex",
      movements: block.complex_movements.map((row) => ({ ...row })),
      rm_reference_movement_id: block.rm_reference_movement_id ?? null,
      instruction: "",
      track_load: true,
      percentage_min: isEmom ? block.emom_percentage ?? null : null,
      percentage_max: isEmom ? block.emom_percentage ?? null : null,
      scheme: !isEmom && block.strength_scheme?.length ? block.strength_scheme.map((row) => ({ ...row })) : null,
    }];
    return [section];
  }

  if (block.movement_id) {
    section.items = [{
      id: newId(),
      type: "exercise",
      movement_id: block.movement_id,
      reps: isEmom ? Math.max(1, Number(block.emom_reps || 1)) : 1,
      instruction: "",
      track_load: true,
      percentage_min: isEmom ? block.emom_percentage ?? null : null,
      percentage_max: isEmom ? block.emom_percentage ?? null : null,
      scheme: !isEmom && block.strength_scheme?.length ? block.strength_scheme.map((row) => ({ ...row })) : null,
    }];
    return [section];
  }

  return [newBuilderSection()];
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

function getFormat(section: BuilderSection): BuilderSectionFormat {
  return section.format ?? (section.count_type === "rounds" ? "rounds" : "sets");
}

function emptyScheme(): StrengthSchemeRow[] {
  return [{ sets: 1, reps: 1, percentage: 70 }];
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
      ? { id: newId(), type, movement_id: "", reps: 1, instruction: "", track_load: true, percentage_min: null, percentage_max: null, scheme: null }
      : type === "complex"
        ? { id: newId(), type, movements: [{ movement_id: "", reps: 1 }], rm_reference_movement_id: null, instruction: "", track_load: true, percentage_min: null, percentage_max: null, scheme: null }
        : type === "rest"
          ? { id: newId(), type, duration: "" }
          : { id: newId(), type, text: "" };
    patchSection(sectionIndex, { items: [...section.items, item] });
  }
  function addBlock() {
    onChange([...sections, newBuilderSection(nextBlockLabel(sections))]);
  }
  function changeFormat(index: number, format: BuilderSectionFormat) {
    if (format === "free") return patchSection(index, { format, count_type: "sets", count_min: 1, count_max: 1, emom_interval_seconds: null });
    if (format === "emom") return patchSection(index, { format, count_type: "rounds", emom_interval_seconds: sections[index].emom_interval_seconds ?? null });
    patchSection(index, { format, count_type: format, emom_interval_seconds: null });
  }

  return <div className="space-y-4">
    <div className="rounded-sm border border-lemon/30 bg-lemon/5 px-3 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="font-display text-[16px] font-bold uppercase text-lemon">Constructor Strength / Weightlifting</p><p className="mt-1 max-w-xl text-[13px] leading-relaxed text-chalk-3">Un único constructor para todo: bloques A.1, A.2…, sets, rounds, EMOM, ejercicios, Complex, tramos, descansos e indicaciones.</p></div>
        <button type="button" className="btn-primary h-10 shrink-0" onClick={addBlock}>+ Añadir bloque {nextBlockLabel(sections)}</button>
      </div>
    </div>

    {sections.map((section, sectionIndex) => {
      const format = getFormat(section);
      const showCount = format !== "free";
      return <section key={section.id} className="rounded-sm border border-line bg-ink p-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-display text-[13px] font-bold uppercase tracking-[0.08em] text-chalk-3">Bloque</span>
          <input value={section.label} onChange={(e) => patchSection(sectionIndex, { label: e.target.value.slice(0, 30) })} placeholder="A.1" aria-label={`Nombre del bloque ${sectionIndex + 1}`} className="field w-24 font-display font-bold uppercase" />
          <select value={format} onChange={(e) => changeFormat(sectionIndex, e.target.value as BuilderSectionFormat)} className="field w-auto min-w-32">
            <option value="sets">Sets</option>
            <option value="rounds">Rounds</option>
            <option value="emom">EMOM</option>
            <option value="free">Libre / tramos</option>
          </select>
          {showCount && <>
            <span className="text-[13px] text-chalk-3">de</span>
            <input type="number" min={1} max={100} value={section.count_min} onChange={(e) => { const min = positiveInt(e.target.value, section.count_min); patchSection(sectionIndex, { count_min: min, count_max: Math.max(min, section.count_max) }); }} aria-label={`Mínimo de ${section.count_type} de ${section.label}`} className="field w-16 text-center font-display font-bold" />
            <span className="text-[13px] text-chalk-3">a</span>
            <input type="number" min={1} max={100} value={section.count_max} onChange={(e) => { const max = positiveInt(e.target.value, section.count_max); patchSection(sectionIndex, { count_max: Math.max(section.count_min, max) }); }} aria-label={`Máximo de ${section.count_type} de ${section.label}`} className="field w-16 text-center font-display font-bold" />
            <span className="text-[13px] text-chalk-3">{format === "emom" ? "rondas" : format}</span>
          </>}
          <div className="ml-auto flex items-center">
            <MiniButton label="Subir bloque" onClick={() => onChange(move(sections, sectionIndex, -1))} disabled={sectionIndex === 0}>↑</MiniButton>
            <MiniButton label="Bajar bloque" onClick={() => onChange(move(sections, sectionIndex, 1))} disabled={sectionIndex === sections.length - 1}>↓</MiniButton>
            <MiniButton label="Eliminar bloque" danger onClick={() => onChange(sections.filter((_, i) => i !== sectionIndex))} disabled={sections.length === 1}>×</MiniButton>
          </div>
        </div>
        {format === "emom" && <label className="mt-3 block max-w-52"><span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.05em] text-chalk-3">Intervalo · cada</span><div className="relative"><input type="number" min={1} max={3600} value={section.emom_interval_seconds ?? ""} onChange={(e) => patchSection(sectionIndex, { emom_interval_seconds: e.target.value ? positiveInt(e.target.value, 1, 3600) : null })} placeholder="Ej. 90" className="field w-full pr-10 text-right font-display font-bold" /><span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[12px] text-chalk-3">seg</span></div></label>}
        {showCount && <p className="mt-2 text-[12px] text-chalk-3">Si el número es fijo, pon el mismo valor en ambos campos. Ej.: 3–4 sets o 6–6 rondas.</p>}

        <div className="mt-4 space-y-2">
          {section.items.map((item, itemIndex) => <div key={item.id} className="rounded-sm border border-line bg-ink-2 p-2">
            {item.type === "exercise" && <ExerciseEditor item={item} sectionLabel={section.label} movements={movements} onPatch={(patch) => patchItem(sectionIndex, itemIndex, patch)} />}
            {item.type === "complex" && <ComplexEditor item={item} sectionLabel={section.label} movements={movements} onPatch={(patch) => patchItem(sectionIndex, itemIndex, patch)} />}
            {item.type === "rest" && <div className="flex items-center gap-2"><span className="shrink-0 rounded-full border border-lemon/50 bg-lemon/10 px-3 py-2 font-display text-[14px] font-bold uppercase tracking-[0.08em] text-lemon">Rest</span><input value={item.duration} onChange={(e) => patchItem(sectionIndex, itemIndex, { duration: e.target.value.slice(0, 40) })} placeholder={'Indica el descanso: 30", 90", 2 min, 2–3 min…'} aria-label="Duración del descanso" className="field min-w-0 flex-1" /></div>}
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
          <button type="button" className="btn-ghost h-10" onClick={() => addItem(sectionIndex, "complex")}>+ Complex</button>
          <button type="button" className="btn-ghost h-10" onClick={() => addItem(sectionIndex, "rest")}>+ Rest</button>
          <button type="button" className="btn-ghost h-10" onClick={() => addItem(sectionIndex, "note")}>+ Indicación</button>
        </div>
      </section>;
    })}

    <button type="button" className="btn-secondary w-full" onClick={addBlock}>+ Añadir otro bloque ({nextBlockLabel(sections)})</button>
  </div>;
}

function ExerciseEditor({ item, sectionLabel, movements, onPatch }: {
  item: Extract<BuilderItem, { type: "exercise" }>;
  sectionLabel: string;
  movements: Movement[];
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  const scheme = item.scheme ?? [];
  const usesScheme = scheme.length > 0;
  return <div className="space-y-2">
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
      <MovementPicker movements={movements} value={item.movement_id} onChange={(movement_id) => onPatch({ movement_id })} placeholder="Buscar ejercicio…" ariaLabel={`Ejercicio de ${sectionLabel}`} className="min-w-0" />
      <label className="flex min-h-11 items-center gap-2 whitespace-nowrap px-1 text-[13px] font-semibold text-chalk-2"><input type="checkbox" checked={item.track_load} onChange={(e) => onPatch({ track_load: e.target.checked, ...(e.target.checked ? {} : { percentage_min: null, percentage_max: null, scheme: null }) })} className="h-4 w-4 accent-[var(--color-lemon)]" />Registrar carga</label>
    </div>
    {item.track_load && <div className="flex flex-wrap items-center gap-2"><button type="button" className={`press min-h-9 rounded-sm border px-3 text-[13px] font-semibold ${usesScheme ? "border-lemon text-lemon" : "border-line-strong text-chalk-2"}`} onClick={() => onPatch(usesScheme ? { scheme: null } : { scheme: emptyScheme(), percentage_min: null, percentage_max: null })}>{usesScheme ? "✓ Tramos series · reps · %" : "+ Usar tramos"}</button><span className="text-[12px] text-chalk-3">Para bloques tipo 4 @70% · 3×3 @75% · 2×1 @85%.</span></div>}
    {usesScheme ? <SchemeEditor rows={scheme} onChange={(next) => onPatch({ scheme: next })} /> : <div className={`grid gap-2 ${item.track_load ? "sm:grid-cols-[84px_112px_112px_minmax(0,1fr)]" : "sm:grid-cols-[84px_minmax(0,1fr)]"}`}>
      <label><span className="mb-1 block text-[11px] font-semibold uppercase text-chalk-3">Reps</span><input type="number" min={1} max={500} value={item.reps} onChange={(e) => onPatch({ reps: positiveInt(e.target.value, item.reps, 500) })} className="field w-full text-center" /></label>
      {item.track_load && <><PctField label="% 1RM desde" value={item.percentage_min} placeholder="85" onChange={(value) => onPatch({ percentage_min: value })} /><PctField label="% 1RM hasta" value={item.percentage_max} placeholder={item.percentage_min != null ? String(item.percentage_min) : "90"} onChange={(value) => onPatch({ percentage_max: value })} /></>}
      <label><span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.05em] text-chalk-3">Indicación opcional</span><input value={item.instruction} onChange={(e) => onPatch({ instruction: e.target.value.slice(0, 120) })} placeholder="Dip lento, 3030, RPE 8…" className="field w-full" /></label>
    </div>}
    {usesScheme && <input value={item.instruction} onChange={(e) => onPatch({ instruction: e.target.value.slice(0, 120) })} placeholder="Indicación opcional del movimiento" className="field w-full" />}
  </div>;
}

function ComplexEditor({ item, sectionLabel, movements, onPatch }: {
  item: BuilderComplexItem;
  sectionLabel: string;
  movements: Movement[];
  onPatch: (patch: Record<string, unknown>) => void;
}) {
  const scheme = item.scheme ?? [];
  const usesScheme = scheme.length > 0;
  const selectedIds = item.movements.map((row) => row.movement_id).filter(Boolean);
  const rmOptions = movements.filter((movement) => selectedIds.includes(movement.id) && (movement.is_rm_eligible || movement.id === item.rm_reference_movement_id));
  function patchMovement(index: number, patch: Partial<ComplexMovementRow>) {
    const next = item.movements.map((row, i) => i === index ? { ...row, ...patch } : row);
    const ids = new Set(next.map((row) => row.movement_id));
    onPatch({ movements: next, rm_reference_movement_id: item.rm_reference_movement_id && ids.has(item.rm_reference_movement_id) ? item.rm_reference_movement_id : null });
  }
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-display text-[15px] font-bold uppercase text-lemon">Complex</p><p className="text-[12px] text-chalk-3">Varios movimientos enlazados con la misma carga.</p></div><label className="flex min-h-10 items-center gap-2 text-[13px] font-semibold text-chalk-2"><input type="checkbox" checked={item.track_load} onChange={(e) => onPatch({ track_load: e.target.checked, ...(e.target.checked ? {} : { percentage_min: null, percentage_max: null, scheme: null }) })} className="h-4 w-4 accent-[var(--color-lemon)]" />Registrar carga</label></div>
    <div className="space-y-2">{item.movements.map((row, i) => <div key={i} className="grid grid-cols-[minmax(0,1fr)_84px_36px] gap-2"><MovementPicker movements={movements} value={row.movement_id} onChange={(movement_id) => patchMovement(i, { movement_id })} placeholder="Buscar movimiento…" ariaLabel={`Movimiento ${i + 1} del Complex de ${sectionLabel}`} /><div className="relative"><input type="number" min={1} max={100} value={row.reps} onChange={(e) => patchMovement(i, { reps: positiveInt(e.target.value, row.reps) })} className="field w-full pr-8 text-center" /><span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-chalk-3">rep</span></div><button type="button" aria-label="Eliminar movimiento" onClick={() => onPatch({ movements: item.movements.filter((_, idx) => idx !== i), rm_reference_movement_id: null })} disabled={item.movements.length === 1} className="press h-11 text-danger disabled:opacity-30">×</button></div>)}</div>
    <button type="button" className="btn-ghost h-9" onClick={() => onPatch({ movements: [...item.movements, { movement_id: "", reps: 1 }] })}>+ Movimiento al Complex</button>
    {item.track_load && <>
      <label className="block"><span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.05em] text-chalk-3">RM de referencia</span><MovementPicker movements={rmOptions} value={item.rm_reference_movement_id ?? ""} onChange={(rm_reference_movement_id) => onPatch({ rm_reference_movement_id })} placeholder="Buscar RM de referencia…" ariaLabel="RM de referencia del Complex" /><span className="mt-1 block text-[11px] text-chalk-3">Se usa para calcular los kg objetivo cuando indiques un %.</span></label>
      <div className="flex flex-wrap items-center gap-2"><button type="button" className={`press min-h-9 rounded-sm border px-3 text-[13px] font-semibold ${usesScheme ? "border-lemon text-lemon" : "border-line-strong text-chalk-2"}`} onClick={() => onPatch(usesScheme ? { scheme: null } : { scheme: emptyScheme(), percentage_min: null, percentage_max: null })}>{usesScheme ? "✓ Tramos series · reps · %" : "+ Usar tramos"}</button></div>
      {usesScheme ? <SchemeEditor rows={scheme} onChange={(next) => onPatch({ scheme: next })} /> : <div className="grid gap-2 sm:grid-cols-2"><PctField label="% 1RM desde" value={item.percentage_min} placeholder="70" onChange={(value) => onPatch({ percentage_min: value })} /><PctField label="% 1RM hasta" value={item.percentage_max} placeholder={item.percentage_min != null ? String(item.percentage_min) : ""} onChange={(value) => onPatch({ percentage_max: value })} /></div>}
    </>}
    <input value={item.instruction} onChange={(e) => onPatch({ instruction: e.target.value.slice(0, 120) })} placeholder="Indicación opcional del Complex" className="field w-full" />
  </div>;
}

function SchemeEditor({ rows, onChange }: { rows: StrengthSchemeRow[]; onChange: (rows: StrengthSchemeRow[]) => void }) {
  function patch(index: number, patchValue: Partial<StrengthSchemeRow>) { onChange(rows.map((row, i) => i === index ? { ...row, ...patchValue } : row)); }
  return <div className="rounded-sm border border-line bg-ink p-2"><div className="flex items-center justify-between gap-2"><p className="label">Tramos</p><button type="button" className="btn-ghost h-9" onClick={() => onChange([...rows, { sets: 1, reps: 1, percentage: 70 }])}>+ Tramo</button></div><div className="mt-2 space-y-2">{rows.map((row, i) => <div key={i} className="grid grid-cols-[1fr_1fr_1fr_36px] gap-2"><NumberMini label="Series" value={row.sets} onChange={(value) => patch(i, { sets: value })} /><NumberMini label="Reps" value={row.reps} onChange={(value) => patch(i, { reps: value })} /><label><span className="mb-1 block text-[10px] font-semibold uppercase text-chalk-3">% 1RM</span><div className="relative"><input type="text" inputMode="decimal" value={row.percentage} onChange={(e) => patch(i, { percentage: percentageOrNull(e.target.value) ?? row.percentage })} className="field w-full pr-6 text-right" /><span className="pointer-events-none absolute right-2 top-1/2 translate-y-0 text-[11px] text-chalk-3">%</span></div></label><button type="button" aria-label="Eliminar tramo" disabled={rows.length === 1} onClick={() => onChange(rows.filter((_, idx) => idx !== i))} className="press mt-5 h-10 text-danger disabled:opacity-30">×</button></div>)}</div></div>;
}

function NumberMini({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label><span className="mb-1 block text-[10px] font-semibold uppercase text-chalk-3">{label}</span><input type="number" min={1} max={100} value={value} onChange={(e) => onChange(positiveInt(e.target.value, value))} className="field w-full text-center" /></label>;
}

function PctField({ label, value, placeholder, onChange }: { label: string; value: number | null; placeholder: string; onChange: (value: number | null) => void }) {
  return <label><span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.05em] text-chalk-3">{label}</span><div className="relative"><input type="text" inputMode="decimal" value={value ?? ""} onChange={(e) => onChange(percentageOrNull(e.target.value))} placeholder={placeholder} className="field w-full pr-7 text-right font-display font-bold" /><span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[12px] text-chalk-3">%</span></div></label>;
}

function MiniButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: string }) {
  return <button type="button" title={label} aria-label={label} onClick={onClick} disabled={disabled} className={`press flex h-9 w-9 items-center justify-center text-[18px] font-bold disabled:opacity-25 ${danger ? "text-danger" : "text-chalk-3 hover:text-chalk"}`}>{children}</button>;
}
