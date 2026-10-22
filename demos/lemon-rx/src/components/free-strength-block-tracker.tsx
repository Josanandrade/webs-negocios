"use client";

import Link from "next/link";
import { useEffect, useId, useOptimistic, useRef, useState, useTransition } from "react";
import { deleteBlockResult, saveBlockNote, setBlockDone } from "@/app/(app)/actions";
import { saveFreeStrengthResult, type FreeStrengthDraft } from "@/app/(app)/free-strength-actions";
import { formatKg } from "@/lib/scores";
import type { Block, BlockLog, BlockResult, BuilderComplexView, BuilderExerciseView, BuilderSectionView } from "@/lib/types";
import { expectedWeightCount } from "@/lib/unified-strength";

type Notify = (text: string, tone?: "ok" | "error") => void;
export type FreeStrengthBlockView = Block & {
  log: BlockLog | null;
  result: BlockResult | null;
  builderSectionsView?: BuilderSectionView[];
};

type RecordableItemView = BuilderExerciseView | BuilderComplexView;
type LoadItemView = RecordableItemView;
type SavedFreeResult = {
  version: 2 | 3;
  sections: Array<{
    section_id: string;
    count: number;
    exercises: Array<{ item_id: string; weights: number[] }>;
    completed_item_ids?: string[];
  }>;
};

function readSaved(value: string | null | undefined): SavedFreeResult | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<SavedFreeResult>;
    if ((parsed.version !== 2 && parsed.version !== 3) || !Array.isArray(parsed.sections)) return null;
    return parsed as SavedFreeResult;
  } catch { return null; }
}

function recordableItems(section: BuilderSectionView): RecordableItemView[] {
  return section.items.filter((item): item is RecordableItemView => item.type === "exercise" || item.type === "complex");
}
function loadItems(section: BuilderSectionView): LoadItemView[] { return recordableItems(section).filter((item) => item.track_load); }
function completionItems(section: BuilderSectionView): RecordableItemView[] { return recordableItems(section).filter((item) => !item.track_load); }
function fmtPct(value: number) { return Number.isInteger(value) ? String(value) : String(value).replace(".", ","); }
function itemName(item: RecordableItemView) { return item.type === "exercise" ? item.movement_name : `Complex · ${item.movement_details.map((row) => row.name).join(" + ")}`; }

function prescription(item: LoadItemView) {
  const min = item.percentage_min;
  const max = item.percentage_max ?? min;
  if (min == null || max == null) return null;
  const pct = min === max ? `${fmtPct(min)}% 1RM` : `${fmtPct(min)}–${fmtPct(max)}% 1RM`;
  const minKg = item.suggested_kg_min;
  const maxKg = item.suggested_kg_max ?? minKg;
  const kg = minKg != null && maxKg != null ? minKg === maxKg ? `${formatKg(minKg)} kg` : `${formatKg(minKg)}–${formatKg(maxKg)} kg` : null;
  return { pct, kg };
}

function LoadTarget({ item, compact = false }: { item: LoadItemView; compact?: boolean }) {
  const target = prescription(item);
  if (!target) return null;
  if (!target.kg) return <p className={`${compact ? "mt-1 text-[12px]" : "mt-1.5 text-[13px]"} text-chalk-3`}><span className="font-semibold text-chalk-2">{target.pct}</span> · <Link href="/rms" className="underline decoration-line-strong underline-offset-2 hover:text-chalk">Añade tu 1RM para calcular los kg</Link></p>;
  return <p className={`${compact ? "mt-1 text-[12px]" : "mt-1.5 text-[13px]"} font-semibold text-lemon`}>{target.pct} → {target.kg}{item.rm_1 != null && <span className="font-normal text-chalk-3"> · RM {formatKg(item.rm_1)} kg</span>}</p>;
}

function sectionBadge(section: BuilderSectionView) {
  const format = section.format ?? (section.count_type === "rounds" ? "rounds" : "sets");
  if (format === "free") return "Tramos / libre";
  const count = section.count_min === section.count_max ? String(section.count_min) : `${section.count_min}–${section.count_max}`;
  if (format === "emom") return `EMOM · ${count} rondas${section.emom_interval_seconds ? ` · cada ${section.emom_interval_seconds}s` : ""}`;
  return `${count} ${format}`;
}

function SchemePrescription({ item }: { item: LoadItemView }) {
  if (!item.scheme_targets?.length) return null;
  return <div className="mt-2 space-y-1">{item.scheme_targets.map((row, index) => <p key={index} className="text-[13px] text-chalk-2"><strong className="font-semibold text-chalk">{row.sets > 1 ? `${row.sets}×${row.reps}` : row.reps}</strong> · <span className="text-lemon">{fmtPct(row.percentage)}%</span>{row.kg != null ? <span className="text-lemon"> → {formatKg(row.kg)} kg</span> : <span className="text-chalk-3"> · añade tu RM para calcular kg</span>}</p>)}</div>;
}

export function FreeStrengthBlockTracker({ block, notify }: { block: FreeStrengthBlockView; notify: Notify }) {
  const [open, setOpen] = useState(false);
  const sections = block.builderSectionsView ?? [];
  const done = block.log?.done ?? false;
  return <section>
    <div className="flex items-start justify-between gap-3"><div className="min-w-0 pt-3"><h3 className="font-display text-[15px] font-bold uppercase tracking-[0.12em] text-lemon">{block.title || "Strength"}</h3></div><DoneToggle block={block} notify={notify} onResult={() => setOpen(true)} /></div>
    <div className="mt-3 space-y-3">{sections.map((section) => <div key={section.id} className="rounded-sm border border-line bg-ink-2 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="font-display text-[20px] font-bold uppercase text-chalk">{section.label || "Bloque"}</p><p className="font-display text-[14px] font-bold uppercase tracking-[0.05em] text-chalk-3">{sectionBadge(section)}</p></div>
      <div className="mt-3 space-y-3">{section.items.map((item) => {
        if (item.type === "exercise") return <div key={item.id} className="text-[17px] leading-snug">{item.scheme?.length ? <div><p><strong className="font-semibold text-chalk">{item.movement_name}</strong>{item.instruction && <span className="ml-2 text-chalk-2">· {item.instruction}</span>}</p><SchemePrescription item={item} /></div> : <div className="flex items-start gap-3"><span className="w-8 shrink-0 text-right font-display text-[18px] font-bold text-lemon">{item.reps}</span><div className="min-w-0 flex-1"><p><strong className="font-semibold text-chalk">{item.movement_name}</strong>{item.instruction && <span className="ml-2 text-chalk-2">· {item.instruction}</span>}</p>{item.track_load ? <LoadTarget item={item} compact /> : <p className="mt-1 text-[12px] font-semibold uppercase tracking-[0.05em] text-chalk-3">Registrar · Hecho</p>}</div></div>}</div>;
        if (item.type === "complex") return <div key={item.id} className="rounded-sm border-l-2 border-lemon/60 pl-3"><div className="flex items-center justify-between gap-2"><p className="font-display text-[14px] font-bold uppercase tracking-[0.06em] text-lemon">Complex</p>{!item.track_load && <span className="text-[11px] font-semibold uppercase text-chalk-3">Registrar · Hecho</span>}</div><div className="mt-1 space-y-0.5">{item.movement_details.map((row, index) => <p key={index} className="text-[16px] text-chalk"><strong>{row.reps}</strong> {row.name}</p>)}</div>{item.instruction && <p className="mt-1 text-[14px] text-chalk-2">{item.instruction}</p>}{item.track_load && (item.scheme?.length ? <SchemePrescription item={item} /> : <LoadTarget item={item} compact />)}</div>;
        if (item.type === "rest") return <div key={item.id} className="py-1"><span className="inline-flex rounded-full border border-lemon/50 bg-lemon/10 px-3 py-1.5 font-display text-[14px] font-bold uppercase tracking-[0.08em] text-lemon">Rest · {item.duration}</span></div>;
        return <p key={item.id} className="border-l-2 border-line-strong pl-3 text-[15px] italic text-chalk-2">{item.text}</p>;
      })}</div>
    </div>)}</div>
    {block.content && <p className="workout-text mt-3 whitespace-pre-wrap text-[17px] leading-[1.55] text-chalk-2">{block.content}</p>}
    <ResultCard block={block} onEdit={() => setOpen(true)} />
    <NotePanel blockId={block.id} note={block.log?.note ?? ""} notify={notify} />
    <ResultDialog open={open} block={block} done={done} notify={notify} onClose={() => setOpen(false)} />
  </section>;
}

function DoneToggle({ block, notify, onResult }: { block: FreeStrengthBlockView; notify: Notify; onResult: () => void }) {
  const [optimistic, setOptimistic] = useOptimistic(block.log?.done ?? false);
  const [, startTransition] = useTransition();
  function toggle() {
    const next = !optimistic;
    if (next && !block.result) return onResult();
    startTransition(async () => { setOptimistic(next); const result = await setBlockDone(block.id, next); if (!result.ok) notify(result.error, "error"); });
  }
  return <button type="button" aria-pressed={optimistic} onClick={toggle} className={`press flex h-11 shrink-0 items-center gap-2 rounded-sm px-3 font-display text-[14px] font-bold uppercase tracking-[0.06em] ${optimistic ? "bg-lemon text-lemon-ink" : "border border-line-strong text-chalk-2 hover:text-chalk"}`}><span aria-hidden className={`flex h-[18px] w-[18px] items-center justify-center rounded-[3px] ${optimistic ? "bg-lemon-ink text-lemon" : "border-2 border-chalk-3"}`}>{optimistic ? "✓" : ""}</span>{optimistic ? "Hecho" : "Marcar hecho"}</button>;
}

function ResultCard({ block, onEdit }: { block: FreeStrengthBlockView; onEdit: () => void }) {
  const result = block.result;
  if (!result) return <div className="mt-5 rounded-sm border border-line bg-ink-2 px-4 py-3"><button type="button" onClick={onEdit} className="btn-primary w-full sm:w-auto">Registrar resultado</button></div>;
  const saved = readSaved(result.reps_detail);
  const sectionMap = new Map((block.builderSectionsView ?? []).map((section) => [section.id, section]));
  return <div className="mt-5 rounded-sm border border-line bg-ink-2 px-4 py-3"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><p className="eyebrow">Tu resultado</p>
    {result.total_load != null && <p className="mt-1 font-display text-[30px] font-bold text-lemon">{formatKg(result.total_load)} kg <span className="text-[14px] text-chalk-3">totales</span></p>}
    {saved && <div className="mt-3 space-y-3">{saved.sections.map((savedSection) => { const section = sectionMap.get(savedSection.section_id); if (!section) return null; const completed = new Set(savedSection.completed_item_ids ?? []); return <div key={savedSection.section_id}><p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-chalk-3">{section.label}</p>{savedSection.exercises.map((exercise) => { const item = recordableItems(section).find((row) => row.id === exercise.item_id); return item ? <p key={exercise.item_id} className="mt-1 text-[14px] text-chalk-2"><span className="font-semibold text-chalk">{itemName(item)}:</span> {exercise.weights.map((kg) => `${formatKg(kg)} kg`).join(" · ")}</p> : null; })}{completionItems(section).filter((item) => completed.has(item.id)).map((item) => <p key={item.id} className="mt-1 text-[14px] text-chalk-2"><span className="font-semibold text-chalk">{itemName(item)}:</span> <span className="font-semibold text-lemon">✓ Hecho</span></p>)}</div>; })}</div>}
    {!saved && result.kg != null && <p className="mt-2 text-[14px] text-chalk-2">Peso máximo registrado: <strong className="text-chalk">{formatKg(result.kg)} kg</strong></p>}
    {saved && result.total_load == null && result.kg == null && <p className="mt-2 font-semibold text-lemon">✓ Movimientos completados</p>}
  </div><button type="button" onClick={onEdit} className="press h-11 px-1 text-[15px] font-semibold text-chalk-2 hover:text-chalk">Editar</button></div></div>;
}

function ResultDialog({ open, block, done, notify, onClose }: { open: boolean; block: FreeStrengthBlockView; done: boolean; notify: Notify; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { const dialog = ref.current; if (!dialog) return; if (open && !dialog.open) dialog.showModal(); if (!open && dialog.open) dialog.close(); }, [open]);
  async function skip() { setBusy(true); const result = await setBlockDone(block.id, true); setBusy(false); if (!result.ok) return notify(result.error, "error"); notify("Marcado como hecho"); onClose(); }
  return <dialog ref={ref} onCancel={(e) => { e.preventDefault(); if (!busy) onClose(); }} onClick={(e) => { if (e.target === ref.current && !busy) onClose(); }} className="confirm-dialog m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-md border border-line-strong bg-ink-2 p-0 text-chalk">{open && <div className="pt-5"><div className="px-4"><p className="eyebrow">{block.title}</p><h2 className="mt-1 font-display text-[26px] font-bold uppercase leading-tight">{block.result ? "Editar resultado" : "Registrar resultado"}</h2><p className="mt-2 text-[14px] text-chalk-3">Introduce los kilos donde corresponda y marca como hechos los movimientos sin carga.</p></div><ResultForm block={block} onDone={onClose} notify={notify} />{!done && !block.result && <div className="border-t border-line px-4 py-3"><button type="button" onClick={skip} disabled={busy} className="press h-11 text-[15px] font-semibold text-chalk-3 hover:text-chalk">{busy ? "Un momento…" : "Marcar todo el bloque como hecho sin resultado"}</button></div>}</div>}</dialog>;
}

function ResultForm({ block, onDone, notify }: { block: FreeStrengthBlockView; onDone: () => void; notify: Notify }) {
  const id = useId();
  const sections = block.builderSectionsView ?? [];
  const saved = readSaved(block.result?.reps_detail);
  const [counts, setCounts] = useState<Record<string, number>>(() => Object.fromEntries(sections.map((section) => { const previous = saved?.sections.find((row) => row.section_id === section.id)?.count; return [section.id, previous && previous >= section.count_min && previous <= section.count_max ? previous : section.count_min]; })));
  const [weights, setWeights] = useState<Record<string, string[]>>(() => {
    const entries: Array<[string, string[]]> = [];
    for (const section of sections) { const previousSection = saved?.sections.find((row) => row.section_id === section.id); for (const item of loadItems(section)) { const previous = previousSection?.exercises.find((row) => row.item_id === item.id)?.weights ?? []; entries.push([item.id, previous.map(String)]); } }
    return Object.fromEntries(entries);
  });
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    const entries: Array<[string, boolean]> = [];
    for (const section of sections) { const doneIds = new Set(saved?.sections.find((row) => row.section_id === section.id)?.completed_item_ids ?? []); for (const item of completionItems(section)) entries.push([item.id, doneIds.has(item.id)]); }
    return Object.fromEntries(entries);
  });
  const [sameWeight, setSameWeight] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  function setCount(sectionId: string, next: number) { setCounts((current) => ({ ...current, [sectionId]: next })); setError(null); }
  function setWeight(itemId: string, index: number, value: string) { setWeights((current) => { const next = [...(current[itemId] ?? [])]; next[index] = value; return { ...current, [itemId]: next }; }); setError(null); }
  function toggleSame(itemId: string, next: boolean) { setSameWeight((current) => ({ ...current, [itemId]: next })); setError(null); }
  function submit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    const missingDone = sections.flatMap(completionItems).some((item) => !completed[item.id]);
    if (missingDone) return setError("Marca como hechos todos los movimientos pendientes antes de guardar.");
    const draft: FreeStrengthDraft = { sections: sections.map((section) => { const count = counts[section.id] ?? section.count_min; return { section_id: section.id, count, exercises: loadItems(section).map((item) => { const expected = expectedWeightCount(item, count); const values = weights[item.id] ?? []; const normalized = sameWeight[item.id] ? Array.from({ length: expected }, () => values[0] ?? "") : Array.from({ length: expected }, (_, i) => values[i] ?? ""); return { item_id: item.id, weights: normalized }; }), completed_item_ids: completionItems(section).filter((item) => completed[item.id]).map((item) => item.id) }; }) };
    startTransition(async () => { const result = await saveFreeStrengthResult(block.id, draft); if (!result.ok) return setError(result.error); notify("Resultado guardado"); onDone(); });
  }
  function remove() { if (!window.confirm("¿Borrar tu resultado de este bloque?")) return; startTransition(async () => { const result = await deleteBlockResult(block.id); if (!result.ok) return setError(result.error); notify("Resultado borrado"); onDone(); }); }

  return <form onSubmit={submit} className="space-y-5 px-4 py-4" noValidate>
    {sections.map((section) => { const count = counts[section.id] ?? section.count_min; const items = recordableItems(section); if (!items.length) return null; return <section key={section.id} className="rounded-sm border border-line bg-ink p-3"><div className="flex flex-wrap items-center justify-between gap-3"><p className="font-display text-[18px] font-bold uppercase text-chalk">{section.label}</p>{section.count_min !== section.count_max ? <label className="flex items-center gap-2 text-[13px] text-chalk-3">He hecho <select value={count} onChange={(e) => setCount(section.id, Number(e.target.value))} className="field h-10 w-20">{Array.from({ length: section.count_max - section.count_min + 1 }, (_, i) => section.count_min + i).map((n) => <option key={n} value={n}>{n}</option>)}</select> {section.count_type}</label> : <span className="text-[13px] text-chalk-3">{sectionBadge(section)}</span>}</div>
      <div className="mt-4 space-y-6">{items.map((item) => item.track_load ? <WeightEntry key={item.id} id={id} item={item} section={section} count={count} values={weights[item.id] ?? []} same={Boolean(sameWeight[item.id])} onSame={(next) => toggleSame(item.id, next)} onWeight={(index, value) => setWeight(item.id, index, value)} /> : <CompletionEntry key={item.id} item={item} checked={Boolean(completed[item.id])} onChange={(checked) => { setCompleted((current) => ({ ...current, [item.id]: checked })); setError(null); }} />)}</div>
    </section>; })}
    {error && <p role="alert" className="text-[14px] font-semibold text-danger">{error}</p>}
    <div className="flex flex-wrap gap-2"><button type="submit" disabled={pending} className="btn-primary flex-1 sm:flex-none">{pending ? "Guardando…" : "Guardar resultado"}</button>{block.result && <button type="button" disabled={pending} onClick={remove} className="btn-ghost text-danger">Borrar resultado</button>}</div>
  </form>;
}

function CompletionEntry({ item, checked, onChange }: { item: RecordableItemView; checked: boolean; onChange: (checked: boolean) => void }) {
  return <div className={`rounded-sm border p-3 ${checked ? "border-lemon/60 bg-lemon/5" : "border-line bg-ink-2"}`}><button type="button" aria-pressed={checked} onClick={() => onChange(!checked)} className="press flex min-h-11 w-full items-center justify-between gap-3 text-left"><div><p className="text-[15px] font-semibold text-chalk">{itemName(item)}</p><p className="mt-1 text-[12px] text-chalk-3">Sin registro de kilos</p></div><span className={`flex h-8 shrink-0 items-center gap-2 rounded-sm px-3 font-display text-[13px] font-bold uppercase ${checked ? "bg-lemon text-lemon-ink" : "border border-line-strong text-chalk-2"}`}><span>{checked ? "✓" : ""}</span>{checked ? "Hecho" : "Marcar hecho"}</span></button></div>;
}

function WeightEntry({ id, item, section, count, values, same, onSame, onWeight }: { id: string; item: LoadItemView; section: BuilderSectionView; count: number; values: string[]; same: boolean; onSame: (next: boolean) => void; onWeight: (index: number, value: string) => void }) {
  const expected = expectedWeightCount(item, count);
  const hasScheme = Boolean(item.scheme?.length);
  const targets = item.scheme_targets?.flatMap((row) => Array.from({ length: row.sets }, () => row)) ?? [];
  return <div><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-[15px] font-semibold text-chalk">{itemName(item)}</p>{hasScheme ? <SchemePrescription item={item} /> : <LoadTarget item={item} />}</div><label className="flex items-center gap-2 text-[13px] font-semibold text-chalk-3"><input type="checkbox" checked={same} onChange={(e) => onSame(e.target.checked)} className="h-4 w-4 accent-[var(--color-lemon)]" />Mismo peso en todos</label></div>
    {same ? <div className="mt-2 max-w-40"><NumberField id={`${id}-${item.id}-same`} value={values[0] ?? ""} onChange={(value) => onWeight(0, value)} /></div> : <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{Array.from({ length: expected }, (_, index) => { const target = targets[index]; return <label key={index}><span className="mb-1 block text-[11px] font-semibold uppercase text-chalk-3">{hasScheme ? `Set ${index + 1}${target ? ` · ${fmtPct(target.percentage)}%` : ""}` : `${section.count_type === "rounds" ? "Ronda" : "Set"} ${index + 1}`}</span><NumberField id={`${id}-${item.id}-${index}`} value={values[index] ?? ""} onChange={(value) => onWeight(index, value)} />{target?.kg != null && <span className="mt-1 block text-[11px] text-lemon">Objetivo {formatKg(target.kg)} kg</span>}</label>; })}</div>}
  </div>;
}

function NumberField({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) { return <div className="relative"><input id={id} type="text" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, "").slice(0, 8))} placeholder="0" className="field w-full pr-9 text-right font-display text-[20px] font-bold" /><span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[12px] text-chalk-3">kg</span></div>; }

function NotePanel({ blockId, note, notify }: { blockId: string; note: string; notify: Notify }) {
  const [value, setValue] = useState(note);
  const [pending, startTransition] = useTransition();
  useEffect(() => setValue(note), [note]);
  function save() { startTransition(async () => { const result = await saveBlockNote(blockId, value); if (!result.ok) return notify(result.error, "error"); notify("Nota guardada"); }); }
  return <div className="mt-5"><label className="label" htmlFor={`note-${blockId}`}>Mi nota</label><textarea id={`note-${blockId}`} value={value} onChange={(e) => setValue(e.target.value)} placeholder="Sensaciones, técnica, molestias…" rows={2} className="field mt-1 min-h-20 w-full resize-y py-2.5" /><div className="mt-2 flex justify-end"><button type="button" disabled={pending || value === note} onClick={save} className="btn-ghost h-10">{pending ? "Guardando…" : "Guardar nota"}</button></div></div>;
}
