"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SCORE_TYPES } from "@/lib/scores";
import type { ComplexMovementRow, ScoreType, StrengthSchemeRow } from "@/lib/types";
import type { Movement } from "@/lib/strength";
import { MovementPicker } from "@/components/movement-picker";

export type EditableBlock = {
  id: string;
  title: string;
  content: string;
  score_type: ScoreType;
  sets_count?: number | null;
  reps_per_set?: number | null;
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

export const BLOCK_PRESETS = ["Warm Up", "Mobility", "Activation", "Strength", "Weightlifting", "Skill", "Gymnastics", "Conditioning", "WOD", "Accessory", "Core", "Cool Down", "Notes"];

function autosize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  const scrollY = window.scrollY;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight + 2}px`;
  if (window.scrollY !== scrollY) window.scrollTo({ top: scrollY, behavior: "instant" });
}
function intOr(value: string, fallback: number) { const n = Number(value); return Number.isInteger(n) && n > 0 ? n : fallback; }
function pctOr(value: string, fallback: number) { const n = Number(value.replace(",", ".")); return Number.isFinite(n) && n > 0 ? n : fallback; }
function intervalLabel(seconds: number | null | undefined) {
  if (!seconds) return "";
  if (seconds < 60) return `${seconds}\"`;
  const min = Math.floor(seconds / 60); const sec = seconds % 60;
  return sec ? `${min}'${String(sec).padStart(2, "0")}\"` : `${min}'`;
}

export function BlockEditor({ block, index, total, autoFocus, movements, onChange, onMove, onDelete }: {
  block: EditableBlock;
  index: number;
  total: number;
  autoFocus: boolean;
  movements: Movement[];
  onChange: (patch: Partial<EditableBlock>) => void;
  onMove: (delta: -1 | 1) => void;
  onDelete: () => void;
}) {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  useLayoutEffect(() => autosize(textRef.current), [block.content]);
  useEffect(() => { if (autoFocus) textRef.current?.focus({ preventScroll: false }); }, [autoFocus]);
  useEffect(() => { if (!confirmDelete) return; const t = setTimeout(() => setConfirmDelete(false), 3500); return () => clearTimeout(t); }, [confirmDelete]);

  const label = block.title.trim() || `Bloque ${index + 1}`;
  const isLoad = block.score_type === "load";
  const complex = Boolean(block.is_complex);
  const emom = Boolean(block.is_emom);
  const scheme = block.strength_scheme ?? [];
  const complexRows = block.complex_movements ?? [];
  const normalizedTitle = block.title.trim().toLowerCase();
  const isLegacyStrength = !isLoad && (normalizedTitle === "strength" || normalizedTitle === "weightlifting");
  const selectedComplexIds = Array.from(new Set(complexRows.map((r) => r.movement_id).filter(Boolean)));
  const rmMovements = movements.filter((movement) => movement.is_rm_eligible || movement.id === block.movement_id || movement.id === block.rm_reference_movement_id);
  const complexRmMovements = movements.filter((movement) => selectedComplexIds.includes(movement.id) && (movement.is_rm_eligible || movement.id === block.rm_reference_movement_id));

  function patchRow(i: number, patch: Partial<StrengthSchemeRow>) {
    onChange({ strength_scheme: scheme.map((r, idx) => idx === i ? { ...r, ...patch } : r) });
  }
  function patchComplexRow(i: number, patch: Partial<ComplexMovementRow>) {
    const next = complexRows.map((r, idx) => idx === i ? { ...r, ...patch } : r);
    const refs = new Set(next.map((r) => r.movement_id));
    onChange({ complex_movements: next, rm_reference_movement_id: block.rm_reference_movement_id && refs.has(block.rm_reference_movement_id) ? block.rm_reference_movement_id : null });
  }
  function convertLegacyStrength() {
    onChange({ score_type: "load", movement_id: null, strength_scheme: [{ sets: 1, reps: 1, percentage: 70 }], is_complex: false, complex_movements: null, rm_reference_movement_id: null, is_emom: false, emom_reps: null, emom_interval_seconds: null, emom_rounds: null, emom_percentage: null, sets_count: null, reps_per_set: null });
  }
  function toggleComplex(next: boolean) {
    onChange(next
      ? { is_complex: true, movement_id: null, complex_movements: complexRows.length ? complexRows : [{ movement_id: "", reps: 1 }], rm_reference_movement_id: null, emom_reps: null, strength_scheme: emom ? null : [{ sets: 1, reps: 1, percentage: 70 }] }
      : { is_complex: false, complex_movements: null, rm_reference_movement_id: null, movement_id: null, emom_reps: emom ? 1 : null, strength_scheme: emom ? null : [{ sets: 1, reps: 1, percentage: 70 }] });
  }
  function toggleEmom(next: boolean) {
    onChange(next
      ? { is_emom: true, strength_scheme: null, emom_reps: complex ? null : block.emom_reps ?? 1, emom_interval_seconds: block.emom_interval_seconds ?? 90, emom_rounds: block.emom_rounds ?? 6, emom_percentage: block.emom_percentage ?? 70 }
      : { is_emom: false, emom_reps: null, emom_interval_seconds: null, emom_rounds: null, emom_percentage: null, strength_scheme: scheme.length ? scheme : [{ sets: 1, reps: 1, percentage: 70 }] });
  }

  return (
    <li className="rounded-sm border border-line bg-ink-2" style={{ viewTransitionName: `block-${block.id}` }}>
      <div className="flex items-center gap-1 border-b border-line pl-3">
        <input value={block.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="Nombre del bloque" aria-label={`Nombre del bloque ${index + 1}`} maxLength={80} list="block-presets" autoCapitalize="characters" className="h-12 min-w-0 flex-1 bg-transparent font-display text-[18px] font-bold uppercase tracking-[0.08em] text-lemon placeholder:font-semibold placeholder:normal-case placeholder:tracking-normal placeholder:text-chalk-3 focus:outline-none" />
        <IconButton label={`Subir ${label}`} onClick={() => onMove(-1)} disabled={index === 0}><path d="M6 15l6-6 6 6" /></IconButton>
        <IconButton label={`Bajar ${label}`} onClick={() => onMove(1)} disabled={index === total - 1}><path d="M6 9l6 6 6-6" /></IconButton>
        {confirmDelete ? <button type="button" onClick={onDelete} className="press h-12 shrink-0 px-3 font-display text-[15px] font-bold uppercase tracking-[0.04em] text-danger">Eliminar</button> : <IconButton label={`Eliminar ${label}`} onClick={() => setConfirmDelete(true)}><path d="M6 6l12 12M18 6L6 18" /></IconButton>}
      </div>

      {!isLoad && <textarea ref={textRef} value={block.content} onChange={(e) => { onChange({ content: e.target.value }); autosize(e.target); }} placeholder="Escribe el contenido del bloque" aria-label={`Contenido de ${label}`} rows={4} spellCheck={false} autoCapitalize="sentences" className="workout-text block min-h-32 w-full resize-none bg-transparent px-3 py-3 text-[17px] leading-[1.55] text-chalk placeholder:text-chalk-3/60 focus:outline-none" />}

      {isLegacyStrength && <div className="border-t border-line bg-ink px-3 py-3"><p className="text-[14px] font-semibold text-chalk">Este bloque usa el formato antiguo de {block.title.trim()}.</p><p className="mt-1 text-[13px] text-chalk-3">Puedes pasarlo al nuevo modelo manteniendo este mismo bloque y su histórico.</p><button type="button" onClick={convertLegacyStrength} className="btn-primary mt-3">Pasar al nuevo modelo</button></div>}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line px-3 py-2">
        <label htmlFor={`score-${block.id}`} className="text-[13px] font-semibold uppercase tracking-[0.08em] text-chalk-3">Resultado</label>
        <select id={`score-${block.id}`} value={block.score_type} onChange={(e) => {
          const score_type = e.target.value as ScoreType;
          onChange(score_type === "load"
            ? { score_type, strength_scheme: [{ sets: 1, reps: 1, percentage: 70 }], is_complex: false, complex_movements: null, rm_reference_movement_id: null, is_emom: false, emom_reps: null, emom_interval_seconds: null, emom_rounds: null, emom_percentage: null }
            : { score_type, movement_id: null, strength_scheme: null, is_complex: false, complex_movements: null, rm_reference_movement_id: null, is_emom: false, emom_reps: null, emom_interval_seconds: null, emom_rounds: null, emom_percentage: null, sets_count: null, reps_per_set: null });
        }} className={`h-11 min-w-0 flex-1 rounded-sm border border-line-strong bg-ink px-2 text-[15px] focus:border-lemon focus:outline-none sm:flex-none ${block.score_type === "none" ? "text-chalk-2" : "text-lemon"}`}>
          {SCORE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.value === "none" ? "Sin ranking" : t.value === "load" ? t.label : `Ranking · ${t.label}`}</option>)}
        </select>
        <p className="w-full text-[13px] text-chalk-3 sm:w-auto">{SCORE_TYPES.find((t) => t.value === block.score_type)?.hint}</p>
      </div>

      {isLoad && <div className="space-y-5 border-t border-line px-3 py-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex min-h-12 items-center gap-3 rounded-sm border border-line bg-ink px-3 text-[16px] font-semibold"><input type="checkbox" checked={complex} onChange={(e) => toggleComplex(e.target.checked)} className="h-5 w-5 accent-[var(--color-lemon)]" /><span><strong className="block">Complex</strong><span className="text-[12px] font-normal text-chalk-3">Varios movimientos enlazados</span></span></label>
          <label className="flex min-h-12 items-center gap-3 rounded-sm border border-line bg-ink px-3 text-[16px] font-semibold"><input type="checkbox" checked={emom} onChange={(e) => toggleEmom(e.target.checked)} className="h-5 w-5 accent-[var(--color-lemon)]" /><span><strong className="block">Formato EMOM</strong><span className="text-[12px] font-normal text-chalk-3">Trabajo por intervalos y rondas</span></span></label>
        </div>

        {complex ? <div>
          <div className="flex items-center justify-between gap-3"><p className="label">Movimientos del Complex</p><button type="button" className="btn-ghost h-10" onClick={() => onChange({ complex_movements: [...complexRows, { movement_id: "", reps: 1 }] })}>+ Movimiento</button></div>
          <div className="mt-2 space-y-2">{complexRows.map((row, i) => <div key={i} className="grid grid-cols-[minmax(0,1fr)_82px_36px] gap-2 rounded-sm border border-line bg-ink p-2"><MovementPicker movements={movements} value={row.movement_id} onChange={(movement_id) => patchComplexRow(i, { movement_id })} ariaLabel={`Movimiento ${i + 1} del Complex`} placeholder="Buscar movimiento…" className="min-w-0" /><div className="relative"><input type="number" min={1} max={100} value={row.reps} onChange={(e) => patchComplexRow(i, { reps: intOr(e.target.value, 1) })} aria-label={`Repeticiones del movimiento ${i + 1}`} className="field w-full pr-8 text-center" /><span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[12px] text-chalk-3">rep</span></div><button type="button" aria-label={`Eliminar movimiento ${i + 1}`} onClick={() => onChange({ complex_movements: complexRows.filter((_, idx) => idx !== i), rm_reference_movement_id: null })} disabled={complexRows.length === 1} className="press h-11 text-danger disabled:opacity-30">×</button></div>)}</div>
          <label className="mt-3 block"><span className="label">RM de referencia</span><MovementPicker movements={complexRmMovements} value={block.rm_reference_movement_id ?? ""} onChange={(rm_reference_movement_id) => onChange({ rm_reference_movement_id })} placeholder="Buscar RM de referencia…" ariaLabel="RM de referencia del Complex" className="mt-1" /><span className="mt-1 block text-[12px] text-chalk-3">Solo aparecen como referencia los movimientos del Complex habilitados para RM.</span></label>
        </div> : <label className="block"><span className="label">Movimiento</span><MovementPicker movements={rmMovements} value={block.movement_id ?? ""} onChange={(movement_id) => onChange({ movement_id })} placeholder="Buscar movimiento…" ariaLabel="Movimiento de fuerza" className="mt-1" /></label>}

        {emom ? <div className="rounded-sm border border-line bg-ink p-3">
          <p className="label">Configuración del EMOM</p>
          <div className={`mt-2 grid gap-3 ${complex ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
            {!complex && <label><span className="mb-1 block text-[12px] text-chalk-3">Reps</span><input type="number" min={1} max={100} value={block.emom_reps ?? 1} onChange={(e) => onChange({ emom_reps: intOr(e.target.value, 1) })} className="field w-full text-center" /></label>}
            <label><span className="mb-1 block text-[12px] text-chalk-3">Cada (seg)</span><input type="number" min={1} max={3600} value={block.emom_interval_seconds ?? 90} onChange={(e) => onChange({ emom_interval_seconds: intOr(e.target.value, 90) })} className="field w-full text-center" /></label>
            <label><span className="mb-1 block text-[12px] text-chalk-3">Rondas</span><input type="number" min={1} max={100} value={block.emom_rounds ?? 6} onChange={(e) => onChange({ emom_rounds: intOr(e.target.value, 6) })} className="field w-full text-center" /></label>
            <label><span className="mb-1 block text-[12px] text-chalk-3">% 1RM</span><div className="relative"><input type="number" step="0.5" min={1} max={200} value={block.emom_percentage ?? 70} onChange={(e) => onChange({ emom_percentage: pctOr(e.target.value, 70) })} className="field w-full pr-8 text-center" /><span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-chalk-3">%</span></div></label>
          </div>
          <p className="mt-3 text-[14px] font-semibold text-chalk-2">{block.emom_rounds ?? 6} rondas · cada {intervalLabel(block.emom_interval_seconds ?? 90)} · {block.emom_percentage ?? 70}% 1RM</p>
        </div> : <div>
          <div className="flex items-center justify-between gap-3"><p className="label">{complex ? "Series · % 1RM" : "Series · reps · % 1RM"}</p><button type="button" className="btn-ghost h-10" onClick={() => onChange({ strength_scheme: [...scheme, { sets: 1, reps: complex ? 1 : 1, percentage: 70 }] })}>+ Añadir tramo</button></div>
          <div className="mt-2 space-y-2">{scheme.map((row, i) => complex ? <div key={i} className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2 rounded-sm border border-line bg-ink px-2 py-2"><input aria-label={`Series tramo ${i + 1}`} type="number" min={1} max={100} value={row.sets} onChange={(e) => patchRow(i, { sets: intOr(e.target.value, 1), reps: 1 })} className="field min-w-0 text-center font-display font-bold" /><span className="text-chalk-3">series @</span><div className="relative min-w-0"><input aria-label={`Porcentaje tramo ${i + 1}`} type="number" step="0.5" min={1} max={200} value={row.percentage} onChange={(e) => patchRow(i, { percentage: pctOr(e.target.value, 70), reps: 1 })} className="field w-full pr-8 text-center font-display font-bold" /><span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-chalk-3">%</span></div><button type="button" aria-label={`Eliminar tramo ${i + 1}`} onClick={() => onChange({ strength_scheme: scheme.filter((_, idx) => idx !== i) })} disabled={scheme.length === 1} className="press h-10 w-8 text-danger disabled:opacity-30">×</button></div> : <div key={i} className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto] items-center gap-2 rounded-sm border border-line bg-ink px-2 py-2"><input aria-label={`Series tramo ${i + 1}`} type="number" min={1} max={100} value={row.sets} onChange={(e) => patchRow(i, { sets: intOr(e.target.value, 1) })} className="field min-w-0 text-center font-display font-bold" /><span className="text-chalk-3">×</span><input aria-label={`Repeticiones tramo ${i + 1}`} type="number" min={1} max={100} value={row.reps} onChange={(e) => patchRow(i, { reps: intOr(e.target.value, 1) })} className="field min-w-0 text-center font-display font-bold" /><span className="text-chalk-3">@</span><div className="relative min-w-0"><input aria-label={`Porcentaje tramo ${i + 1}`} type="number" step="0.5" min={1} max={200} value={row.percentage} onChange={(e) => patchRow(i, { percentage: pctOr(e.target.value, 70) })} className="field w-full pr-8 text-center font-display font-bold" /><span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-chalk-3">%</span></div><button type="button" aria-label={`Eliminar tramo ${i + 1}`} onClick={() => onChange({ strength_scheme: scheme.filter((_, idx) => idx !== i) })} disabled={scheme.length === 1} className="press h-10 w-8 text-danger disabled:opacity-30">×</button></div>)}</div>
          {scheme.length > 0 && <p className="mt-2 text-[14px] font-semibold text-chalk-2">{scheme.map((r) => complex ? `${r.sets} ${r.sets === 1 ? "serie" : "series"} @${r.percentage}%` : `${r.sets}×${r.reps} @${r.percentage}%`).join(" · ")}</p>}
        </div>}

        <label className="block"><span className="label">Indicaciones opcionales</span><textarea ref={textRef} value={block.content} onChange={(e) => { onChange({ content: e.target.value }); autosize(e.target); }} placeholder={complex ? "Ej.: sin soltar la barra, touch & go, desde hang…" : "Ej.: pausa de 2 s abajo, tempo, sensaciones…"} rows={2} className="field mt-1 min-h-20 resize-none py-3" /></label>
      </div>}
    </li>
  );
}

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className="press flex h-12 w-11 shrink-0 items-center justify-center text-chalk-2 hover:text-chalk disabled:text-chalk-3/30"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square" aria-hidden>{children}</svg></button>;
}