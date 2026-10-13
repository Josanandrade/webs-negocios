"use client";

import { useEffect, useId, useOptimistic, useRef, useState, useTransition } from "react";
import { deleteBlockResult, saveBlockNote, setBlockDone } from "@/app/(app)/actions";
import { saveStrengthResult } from "@/app/(app)/strength-actions";
import { emptyDraft, formatKg, formatLoadWeights, formatScore, type ScoreDraft } from "@/lib/scores";
import type { Block, BlockLog, BlockResult, StrengthSchemeRow } from "@/lib/types";

type SuggestedSet = { reps: number; percentage: number; kg: number };
export type StrengthBlockView = Block & { log: BlockLog | null; result: BlockResult | null; suggestedSets?: SuggestedSet[] };
type Notify = (text: string, tone?: "ok" | "error") => void;

function expandedScheme(scheme: StrengthSchemeRow[] | null | undefined) {
  return (scheme ?? []).flatMap((row) => Array.from({ length: row.sets }, () => ({ reps: row.reps, percentage: row.percentage })));
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
        </div>
        <DoneToggle block={block} notify={notify} onResult={() => setOpen(true)} />
      </div>

      {block.content && <p className="workout-text mt-2 whitespace-pre-wrap text-[19px] leading-[1.55] text-chalk sm:text-[20px]">{block.content}</p>}
      {block.is_complex ? <p className="mt-2 text-[14px] font-semibold uppercase tracking-[0.08em] text-chalk-3">Complex · sin soltar la barra</p> : schemeSets.length > 0 ? <div className="mt-3 flex flex-wrap gap-2">{(block.strength_scheme ?? []).map((r, i) => <span key={i} className="rounded-sm border border-line bg-ink-2 px-2 py-1 font-display text-[15px] font-bold text-chalk-2">{r.sets}×{r.reps} <span className="text-lemon">@{r.percentage}%</span></span>)}</div> : null}

      {!block.is_complex && (block.suggestedSets?.length ?? 0) > 0 && (
        <div className="mt-4 rounded-sm border border-line bg-ink-2 p-3">
          <p className="eyebrow">Tus pesos según tu 1RM</p>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
            {block.suggestedSets!.map((s, i) => <p key={i} className="text-[14px] text-chalk-2"><span className="font-semibold text-chalk">Serie {i + 1}</span><br />{s.reps} reps · {s.percentage}% · <strong className="text-lemon">{formatKg(s.kg)} kg</strong></p>)}
          </div>
        </div>
      )}

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
  if (!result) return <div className="mt-5 rounded-sm border border-line bg-ink-2 px-4 py-3"><button type="button" onClick={onEdit} className="btn-primary w-full sm:w-auto">{block.is_complex ? "Apuntar peso máximo" : "Apuntar mis pesos"}</button></div>;
  const lines = !block.is_complex ? formatLoadWeights(result.reps_detail) : null;
  return <div className="mt-5 rounded-sm border border-line bg-ink-2 px-4 py-3"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="eyebrow">{block.is_complex ? "Tu peso máximo válido" : "Tus pesos"}</p><p className="mt-1 font-display text-[24px] font-bold uppercase">{formatScore("load", result)}</p>{lines && <div className="mt-2 grid grid-cols-2 gap-x-5 gap-y-1 text-[15px] text-chalk-2 sm:grid-cols-3">{lines.map((line) => <span key={line}>{line}</span>)}</div>}</div><button type="button" onClick={onEdit} className="press h-11 px-1 text-[15px] font-semibold text-chalk-2 hover:text-chalk">Editar</button></div></div>;
}

function ResultDialog({ open, block, done, notify, onClose }: { open: boolean; block: StrengthBlockView; done: boolean; notify: Notify; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { const d = ref.current; if (!d) return; if (open && !d.open) d.showModal(); if (!open && d.open) d.close(); }, [open]);
  async function skip() { setBusy(true); const r = await setBlockDone(block.id, true); setBusy(false); if (!r.ok) return notify(r.error, "error"); notify("Marcado como hecho"); onClose(); }
  return <dialog ref={ref} onCancel={(e) => { e.preventDefault(); if (!busy) onClose(); }} onClick={(e) => { if (e.target === ref.current && !busy) onClose(); }} className="confirm-dialog m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-md border border-line-strong bg-ink-2 p-0 text-chalk">{open && <div className="pt-5"><div className="px-4"><p className="eyebrow">{block.title} · {block.is_complex ? "Complex" : block.movement?.name ?? "Fuerza"}</p><h2 className="mt-1 font-display text-[26px] font-bold uppercase leading-tight">{block.result ? "Editar resultado" : block.is_complex ? "¿Cuál ha sido tu peso máximo válido?" : "¿Qué peso has usado en cada serie?"}</h2></div><ResultForm block={block} onDone={onClose} notify={notify} />{!done && !block.result && <div className="border-t border-line px-4 py-3"><button type="button" onClick={skip} disabled={busy} className="press h-11 text-[15px] font-semibold text-chalk-3 hover:text-chalk">{busy ? "Un momento…" : "Marcar como hecho sin resultado"}</button></div>}</div>}</dialog>;
}

function ResultForm({ block, onDone, notify }: { block: StrengthBlockView; onDone: () => void; notify: Notify }) {
  const id = useId();
  const schemeSets = expandedScheme(block.strength_scheme);
  const count = block.is_complex ? null : schemeSets.length || block.sets_count;
  const [draft, setDraft] = useState<ScoreDraft>(() => emptyDraft(block.result, count));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const setSeries = (i: number, v: string) => { setDraft((d) => { const next = [...d.setKgs]; next[i] = v; return { ...d, setKgs: next }; }); setError(null); };
  function submit(e: React.FormEvent) { e.preventDefault(); setError(null); startTransition(async () => { const r = await saveStrengthResult(block.id, draft); if (!r.ok) return setError(r.error); notify("Resultado guardado"); onDone(); }); }
  function remove() { if (!window.confirm("¿Borrar tu resultado de este bloque?")) return; startTransition(async () => { const r = await deleteBlockResult(block.id); if (!r.ok) return setError(r.error); notify("Resultado borrado"); onDone(); }); }
  return <form onSubmit={submit} className="space-y-4 px-4 py-4" noValidate>
    {block.is_complex ? <div><p className="label">Peso máximo válido</p><NumberField id={`${id}-kg`} value={draft.kg} onChange={(v) => setDraft((d) => ({ ...d, kg: v }))} autoFocus /><p className="mt-2 text-[13px] text-chalk-3">En “Notas” puedes apuntar el resto de pesos que probaste durante el complex.</p></div> : schemeSets.length > 0 ? <div><p className="label">Peso usado en cada serie</p><div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">{schemeSets.map((s, i) => { const suggested = block.suggestedSets?.[i]; return <div key={i}><p className="mb-1 text-[13px] font-semibold text-chalk-3">Serie {i + 1} · {s.reps} reps · {s.percentage}%</p>{suggested && <p className="mb-1 text-[13px] text-lemon">Objetivo: {formatKg(suggested.kg)} kg</p>}<NumberField id={`${id}-set-${i}`} value={draft.setKgs[i] ?? ""} onChange={(v) => setSeries(i, v)} autoFocus={i === 0} /></div>; })}</div></div> : <div><p className="label">Peso máximo</p><NumberField id={`${id}-kg`} value={draft.kg} onChange={(v) => setDraft((d) => ({ ...d, kg: v }))} autoFocus /></div>}
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
