"use client";

import { useEffect, useId, useOptimistic, useRef, useState, useTransition } from "react";
import { deleteBlockResult, saveBlockNote, setBlockDone } from "@/app/(app)/actions";
import { saveStrengthResult } from "@/app/(app)/strength-actions";
import { emptyDraft, formatKg, formatLoadWeights, loadSetWeights, type ScoreDraft } from "@/lib/scores";
import type { Block, BlockLog, BlockResult, ComplexMovementRow, StrengthSchemeRow } from "@/lib/types";

type SuggestedSet = { reps: number; percentage: number; kg: number };
type ComplexMovementDetail = ComplexMovementRow & { name: string };
export type StrengthBlockView = Block & {
  log: BlockLog | null;
  result: BlockResult | null;
  suggestedSets?: SuggestedSet[];
  suggestedEmomKg?: number;
  complexMovementDetails?: ComplexMovementDetail[];
};
type Notify = (text: string, tone?: "ok" | "error") => void;

function expandedScheme(scheme: StrengthSchemeRow[] | null | undefined) {
  return (scheme ?? []).flatMap((row) => Array.from({ length: row.sets }, () => ({ reps: row.reps, percentage: row.percentage })));
}
function intervalLabel(seconds: number | null | undefined) {
  if (!seconds) return "—";
  if (seconds < 60) return `${seconds}\"`;
  const min = Math.floor(seconds / 60); const sec = seconds % 60;
  return sec ? `${min}'${String(sec).padStart(2, "0")}\"` : `${min}'`;
}

export function StrengthBlockTracker({ block, notify }: { block: StrengthBlockView; notify: Notify }) {
  const [open, setOpen] = useState(false);
  const done = block.log?.done ?? false;
  const schemeSets = expandedScheme(block.strength_scheme);
  return (
    <section>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 pt-3">
          <h3 className="font-display text-[15px] font-bold uppercase tracking-[0.12em] text-lemon">{block.title || "Strength"}</h3>
          {!block.is_complex && block.movement?.name && <p className="mt-2 font-display text-[24px] font-bold uppercase leading-none text-chalk">{block.movement.name}</p>}
          {block.is_complex && <p className="mt-2 font-display text-[24px] font-bold uppercase leading-none text-chalk">Complex</p>}
        </div>
        <DoneToggle block={block} notify={notify} onResult={() => setOpen(true)} />
      </div>

      {block.is_complex && (block.complexMovementDetails?.length ?? 0) > 0 && <div className="mt-3 rounded-sm border border-line bg-ink-2 p-3"><p className="eyebrow">Secuencia</p><div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[18px] font-semibold text-chalk">{block.complexMovementDetails!.map((m, i) => <span key={`${m.movement_id}-${i}`} className="inline-flex items-center gap-2"><span>{m.reps} {m.name}</span>{i < block.complexMovementDetails!.length - 1 && <span className="text-chalk-3">+</span>}</span>)}</div>{block.rm_reference_movement?.name && <p className="mt-2 text-[13px] text-chalk-3">% calculado sobre tu 1RM de <strong className="text-chalk-2">{block.rm_reference_movement.name}</strong></p>}</div>}

      {block.is_emom ? <div className="mt-3 flex flex-wrap gap-2"><span className="rounded-sm border border-line bg-ink-2 px-2 py-1 font-display text-[15px] font-bold text-chalk-2">EMOM · {block.emom_rounds ?? "—"} rondas</span><span className="rounded-sm border border-line bg-ink-2 px-2 py-1 font-display text-[15px] font-bold text-chalk-2">Cada {intervalLabel(block.emom_interval_seconds)}</span>{!block.is_complex && block.emom_reps && <span className="rounded-sm border border-line bg-ink-2 px-2 py-1 font-display text-[15px] font-bold text-chalk-2">{block.emom_reps} reps</span>}<span className="rounded-sm border border-line bg-ink-2 px-2 py-1 font-display text-[15px] font-bold text-lemon">@{block.emom_percentage ?? "—"}%</span></div> : schemeSets.length > 0 ? <div className="mt-3 flex flex-wrap gap-2">{(block.strength_scheme ?? []).map((r, i) => <span key={i} className="rounded-sm border border-line bg-ink-2 px-2 py-1 font-display text-[15px] font-bold text-chalk-2">{block.is_complex ? `${r.sets} ${r.sets === 1 ? "serie" : "series"}` : `${r.sets}×${r.reps}`} <span className="text-lemon">@{r.percentage}%</span></span>)}</div> : null}

      {block.content && <p className="workout-text mt-3 whitespace-pre-wrap text-[17px] leading-[1.55] text-chalk-2">{block.content}</p>}

      {block.is_emom && block.suggestedEmomKg != null && <div className="mt-4 rounded-sm border border-line bg-ink-2 p-3"><p className="eyebrow">Tu peso objetivo según tu 1RM</p><p className="mt-1 font-display text-[30px] font-bold text-lemon">{formatKg(block.suggestedEmomKg)} kg</p><p className="mt-1 text-[13px] text-chalk-3">Úsalo como referencia para las {block.emom_rounds} rondas.</p></div>}

      {!block.is_emom && (block.suggestedSets?.length ?? 0) > 0 && <div className="mt-4 rounded-sm border border-line bg-ink-2 p-3"><p className="eyebrow">Tus pesos según tu 1RM</p><div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">{block.suggestedSets!.map((s, i) => <p key={i} className="text-[14px] text-chalk-2"><span className="font-semibold text-chalk">Serie {i + 1}</span><br />{!block.is_complex && `${s.reps} reps · `}{s.percentage}% · <strong className="text-lemon">{formatKg(s.kg)} kg</strong></p>)}</div></div>}

      <ResultCard block={block} onEdit={() => setOpen(true)} />
      <NotePanel blockId={block.id} note={block.log?.note ?? ""} notify={notify} />
      <ResultDialog open={open} block={block} done={done} notify={notify} onClose={() => setOpen(false)} />
    </section>
  );
}

function DoneToggle({ block, notify, onResult }: { block: StrengthBlockView; notify: Notify; onResult: () => void }) {
  const [optimistic, setOptimistic] = useOptimistic(block.log?.done ?? false);
  const [, startTransition] = useTransition();
  function toggle() {
    const next = !optimistic;
    if (next && !block.result) return onResult();
    startTransition(async () => { setOptimistic(next); const r = await setBlockDone(block.id, next); if (!r.ok) notify(r.error, "error"); });
  }
  return <button type="button" aria-pressed={optimistic} onClick={toggle} className={`press flex h-11 shrink-0 items-center gap-2 rounded-sm px-3 font-display text-[14px] font-bold uppercase tracking-[0.06em] ${optimistic ? "bg-lemon text-lemon-ink" : "border border-line-strong text-chalk-2 hover:text-chalk"}`}><span aria-hidden className={`flex h-[18px] w-[18px] items-center justify-center rounded-[3px] ${optimistic ? "bg-lemon-ink text-lemon" : "border-2 border-chalk-3"}`}>{optimistic ? "✓" : ""}</span>{optimistic ? "Hecho" : "Marcar hecho"}</button>;
}

function ResultCard({ block, onEdit }: { block: StrengthBlockView; onEdit: () => void }) {
  const result = block.result;
  if (!result) return <div className="mt-5 rounded-sm border border-line bg-ink-2 px-4 py-3"><button type="button" onClick={onEdit} className="btn-primary w-full sm:w-auto">{block.is_emom ? "Apuntar pesos del EMOM" : "Apuntar mis pesos"}</button></div>;
  const saved = loadSetWeights(result.reps_detail);
  const normalLines = !block.is_emom ? formatLoadWeights(result.reps_detail) : null;
  return <div className="mt-5 rounded-sm border border-line bg-ink-2 px-4 py-3"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="eyebrow">{block.is_emom ? (saved?.length ? "Tus pesos por ronda" : "Tu peso utilizado") : "Tus pesos"}</p>{block.is_emom && !saved?.length && result.kg != null && <p className="mt-1 font-display text-[24px] font-bold uppercase text-lemon">{formatKg(result.kg)} kg</p>}{block.is_emom && saved?.length && <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-1 text-[15px] text-chalk-2 sm:grid-cols-3">{saved.map((kg, i) => <span key={i}>Ronda {i + 1}: <strong className="text-chalk">{formatKg(kg)} kg</strong></span>)}</div>}{!block.is_emom && normalLines && <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-1 text-[15px] text-chalk-2 sm:grid-cols-3">{normalLines.map((line) => <span key={line}>{line}</span>)}</div>}{!block.is_emom && !normalLines && result.kg != null && <p className="mt-1 font-display text-[24px] font-bold uppercase text-lemon">{formatKg(result.kg)} kg</p>}{result.total_load != null && <p className="mt-3 border-t border-line pt-2 text-[14px] text-chalk-3">Total movido: <strong className="font-display text-[21px] text-lemon">{formatKg(result.total_load)} kg</strong></p>}</div><button type="button" onClick={onEdit} className="press h-11 px-1 text-[15px] font-semibold text-chalk-2 hover:text-chalk">Editar</button></div></div>;
}

function ResultDialog({ open, block, done, notify, onClose }: { open: boolean; block: StrengthBlockView; done: boolean; notify: Notify; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { const d = ref.current; if (!d) return; if (open && !d.open) d.showModal(); if (!open && d.open) d.close(); }, [open]);
  async function skip() { setBusy(true); const r = await setBlockDone(block.id, true); setBusy(false); if (!r.ok) return notify(r.error, "error"); notify("Marcado como hecho"); onClose(); }
  const subtitle = block.is_complex ? "Complex" : block.movement?.name ?? "Fuerza";
  return <dialog ref={ref} onCancel={(e) => { e.preventDefault(); if (!busy) onClose(); }} onClick={(e) => { if (e.target === ref.current && !busy) onClose(); }} className="confirm-dialog m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-md border border-line-strong bg-ink-2 p-0 text-chalk">{open && <div className="pt-5"><div className="px-4"><p className="eyebrow">{block.title} · {subtitle}</p><h2 className="mt-1 font-display text-[26px] font-bold uppercase leading-tight">{block.result ? "Editar resultado" : block.is_emom ? "¿Qué peso has usado en cada ronda?" : "¿Qué peso has usado en cada serie?"}</h2></div><ResultForm block={block} onDone={onClose} notify={notify} />{!done && !block.result && <div className="border-t border-line px-4 py-3"><button type="button" onClick={skip} disabled={busy} className="press h-11 text-[15px] font-semibold text-chalk-3 hover:text-chalk">{busy ? "Un momento…" : "Marcar como hecho sin resultado"}</button></div>}</div>}</dialog>;
}

function ResultForm({ block, onDone, notify }: { block: StrengthBlockView; onDone: () => void; notify: Notify }) {
  const id = useId();
  const schemeSets = expandedScheme(block.strength_scheme);
  const savedRoundWeights = block.is_emom ? loadSetWeights(block.result?.reps_detail ?? "") : null;
  const [sameWeight, setSameWeight] = useState(() => Boolean(block.is_emom && block.result && !savedRoundWeights?.length && block.result.kg != null));
  const initialCount = block.is_emom ? block.emom_rounds : schemeSets.length || block.sets_count;
  const [draft, setDraft] = useState<ScoreDraft>(() => emptyDraft(block.result, initialCount));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const rounds = block.emom_rounds ?? 0;
  const setSeries = (i: number, v: string) => { setDraft((d) => { const next = [...d.setKgs]; next[i] = v; return { ...d, setKgs: next }; }); setError(null); };
  function toggleSameWeight(next: boolean) {
    setSameWeight(next); setError(null);
    setDraft((d) => next
      ? { ...d, kg: d.kg || d.setKgs.find((v) => v.trim()) || "", setKgs: [] }
      : { ...d, kg: "", setKgs: Array.from({ length: rounds }, (_, i) => d.setKgs[i] ?? d.kg ?? "") });
  }
  function submit(e: React.FormEvent) { e.preventDefault(); setError(null); startTransition(async () => { const r = await saveStrengthResult(block.id, draft); if (!r.ok) return setError(r.error); notify("Resultado guardado"); onDone(); }); }
  function remove() { if (!window.confirm("¿Borrar tu resultado de este bloque?")) return; startTransition(async () => { const r = await deleteBlockResult(block.id); if (!r.ok) return setError(r.error); notify("Resultado borrado"); onDone(); }); }

  return <form onSubmit={submit} className="space-y-4 px-4 py-4" noValidate>
    {block.is_emom ? <div className="space-y-4">
      <label className="flex min-h-11 items-center gap-3 text-[15px] font-semibold"><input type="checkbox" checked={sameWeight} onChange={(e) => toggleSameWeight(e.target.checked)} className="h-5 w-5 accent-[var(--color-lemon)]" />He usado el mismo peso en todas las rondas</label>
      {sameWeight ? <div><p className="label">Peso usado en todas las rondas</p>{block.suggestedEmomKg != null && <p className="mb-2 text-[13px] text-lemon">Objetivo: {formatKg(block.suggestedEmomKg)} kg</p>}<NumberField id={`${id}-kg`} value={draft.kg} onChange={(v) => { setDraft((d) => ({ ...d, kg: v })); setError(null); }} autoFocus /></div> : <div><p className="label">Peso usado en cada ronda</p><div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">{Array.from({ length: rounds }, (_, i) => <div key={i}><p className="mb-1 text-[13px] font-semibold text-chalk-3">Ronda {i + 1}</p>{block.suggestedEmomKg != null && <p className="mb-1 text-[12px] text-lemon">Obj. {formatKg(block.suggestedEmomKg)} kg</p>}<NumberField id={`${id}-round-${i}`} value={draft.setKgs[i] ?? ""} onChange={(v) => setSeries(i, v)} autoFocus={i === 0} /></div>)}</div></div>}
    </div> : schemeSets.length > 0 ? <div><p className="label">Peso usado en cada serie</p><div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">{schemeSets.map((s, i) => { const suggested = block.suggestedSets?.[i]; return <div key={i}><p className="mb-1 text-[13px] font-semibold text-chalk-3">Serie {i + 1}{!block.is_complex ? ` · ${s.reps} reps` : ""} · {s.percentage}%</p>{suggested && <p className="mb-1 text-[13px] text-lemon">Objetivo: {formatKg(suggested.kg)} kg</p>}<NumberField id={`${id}-set-${i}`} value={draft.setKgs[i] ?? ""} onChange={(v) => setSeries(i, v)} autoFocus={i === 0} /></div>; })}</div></div> : <div><p className="label">Peso utilizado</p><NumberField id={`${id}-kg`} value={draft.kg} onChange={(v) => setDraft((d) => ({ ...d, kg: v }))} autoFocus /></div>}
    {error && <p role="alert" className="border-l-2 border-danger pl-3 text-[15px] text-danger">{error}</p>}
    <div className="flex flex-wrap items-center gap-3"><button type="submit" className="btn-primary" disabled={pending}>{pending ? "Guardando…" : "Guardar resultado"}</button><button type="button" className="btn-ghost" onClick={onDone} disabled={pending}>Cancelar</button>{block.result && <button type="button" onClick={remove} disabled={pending} className="press ml-auto h-11 text-[14px] font-semibold text-danger/80 hover:text-danger">Borrar</button>}</div>
  </form>;
}

function NumberField({ id, value, onChange, autoFocus }: { id: string; value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  return <div className="relative w-full"><input id={id} value={value} onChange={(e) => onChange(e.target.value)} inputMode="decimal" autoComplete="off" autoFocus={autoFocus} aria-label="Kilos" maxLength={8} className="field w-full pr-12 font-display text-[22px] font-bold" /><span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[14px] text-chalk-3">kg</span></div>;
}

function NotePanel({ blockId, note, notify }: { blockId: string; note: string; notify: Notify }) {
  const id = useId(); const [editing, setEditing] = useState(false); const [draft, setDraft] = useState(note); const [pending, startTransition] = useTransition(); const [error, setError] = useState<string | null>(null);
  function open() { setDraft(note); setError(null); setEditing(true); }
  function save() { startTransition(async () => { const r = await saveBlockNote(blockId, draft); if (!r.ok) return setError(r.error); notify(draft.trim() ? "Nota guardada" : "Nota borrada"); setEditing(false); }); }
  if (editing) return <div className="mt-4"><label htmlFor={id} className="label">Tu nota</label><textarea id={id} value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} maxLength={2000} autoFocus placeholder="Sensaciones, otros pesos, adaptaciones…" className="field resize-y py-3 leading-[1.5]" /><p className="mt-1.5 text-[13px] text-chalk-3">Solo la ves tú y los coaches.</p>{error && <p role="alert" className="mt-2 text-danger">{error}</p>}<div className="mt-3 flex gap-3"><button type="button" className="btn-secondary" onClick={save} disabled={pending}>{pending ? "Guardando…" : "Guardar nota"}</button><button type="button" className="btn-ghost" onClick={() => setEditing(false)} disabled={pending}>Cancelar</button></div></div>;
  if (note) return <div className="mt-4 border-l-2 border-line-strong pl-3"><p className="eyebrow">Tu nota</p><p className="mt-1 whitespace-pre-wrap text-[16px] leading-[1.5] text-chalk-2">{note}</p><button type="button" onClick={open} className="press -ml-1 mt-1 h-11 px-1 text-[15px] font-semibold text-chalk-3 hover:text-chalk">Editar nota</button></div>;
  return <button type="button" onClick={open} className="press -ml-1 mt-3 h-11 px-1 text-[15px] font-semibold text-chalk-3 hover:text-chalk">+ Añadir nota</button>;
}
