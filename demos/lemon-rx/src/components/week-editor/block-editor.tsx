"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SCORE_TYPES } from "@/lib/scores";
import type { ScoreType, StrengthSchemeRow } from "@/lib/types";
import type { Movement } from "@/lib/strength";

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
};

export const BLOCK_PRESETS = ["Warm Up", "Mobility", "Activation", "Strength", "Weightlifting", "Skill", "Gymnastics", "Conditioning", "WOD", "Accessory", "Core", "Cool Down", "Notes"];

function autosize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  const scrollY = window.scrollY;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight + 2}px`;
  if (window.scrollY !== scrollY) window.scrollTo({ top: scrollY, behavior: "instant" });
}

function intOr(value: string, fallback: number) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}
function pctOr(value: string, fallback: number) {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : fallback;
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
  const scheme = block.strength_scheme ?? [];
  const complex = Boolean(block.is_complex);

  function patchRow(i: number, patch: Partial<StrengthSchemeRow>) {
    onChange({ strength_scheme: scheme.map((r, idx) => idx === i ? { ...r, ...patch } : r) });
  }

  return (
    <li className="rounded-sm border border-line bg-ink-2" style={{ viewTransitionName: `block-${block.id}` }}>
      <div className="flex items-center gap-1 border-b border-line pl-3">
        <input value={block.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="Nombre del bloque" aria-label={`Nombre del bloque ${index + 1}`} maxLength={80} list="block-presets" autoCapitalize="characters" className="h-12 min-w-0 flex-1 bg-transparent font-display text-[18px] font-bold uppercase tracking-[0.08em] text-lemon placeholder:font-semibold placeholder:normal-case placeholder:tracking-normal placeholder:text-chalk-3 focus:outline-none" />
        <IconButton label={`Subir ${label}`} onClick={() => onMove(-1)} disabled={index === 0}><path d="M6 15l6-6 6 6" /></IconButton>
        <IconButton label={`Bajar ${label}`} onClick={() => onMove(1)} disabled={index === total - 1}><path d="M6 9l6 6 6-6" /></IconButton>
        {confirmDelete ? <button type="button" onClick={onDelete} className="press h-12 shrink-0 px-3 font-display text-[15px] font-bold uppercase tracking-[0.04em] text-danger">Eliminar</button> : <IconButton label={`Eliminar ${label}`} onClick={() => setConfirmDelete(true)}><path d="M6 6l12 12M18 6L6 18" /></IconButton>}
      </div>

      {(!isLoad || complex) && (
        <textarea ref={textRef} value={block.content} onChange={(e) => { onChange({ content: e.target.value }); autosize(e.target); }} placeholder={complex ? "Ej.: 1 Power Clean + 1 Hang Squat Clean + 1 Front Squat + 1 Split Jerk\nSin soltar la barra" : "Escribe el contenido del bloque"} aria-label={`Contenido de ${label}`} rows={4} spellCheck={false} autoCapitalize="sentences" className="workout-text block min-h-32 w-full resize-none bg-transparent px-3 py-3 text-[17px] leading-[1.55] text-chalk placeholder:text-chalk-3/60 focus:outline-none" />
      )}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line px-3 py-2">
        <label htmlFor={`score-${block.id}`} className="text-[13px] font-semibold uppercase tracking-[0.08em] text-chalk-3">Resultado</label>
        <select id={`score-${block.id}`} value={block.score_type} onChange={(e) => {
          const score_type = e.target.value as ScoreType;
          onChange(score_type === "load" ? { score_type, strength_scheme: block.strength_scheme?.length ? block.strength_scheme : [{ sets: 1, reps: 1, percentage: 70 }] } : { score_type, movement_id: null, strength_scheme: null, is_complex: false, sets_count: null, reps_per_set: null });
        }} className={`h-11 min-w-0 flex-1 rounded-sm border border-line-strong bg-ink px-2 text-[15px] focus:border-lemon focus:outline-none sm:flex-none ${block.score_type === "none" ? "text-chalk-2" : "text-lemon"}`}>
          {SCORE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.value === "none" ? "Sin ranking" : t.value === "load" ? t.label : `Ranking · ${t.label}`}</option>)}
        </select>
        <p className="w-full text-[13px] text-chalk-3 sm:w-auto">{SCORE_TYPES.find((t) => t.value === block.score_type)?.hint}</p>
      </div>

      {isLoad && (
        <div className="space-y-4 border-t border-line px-3 py-4">
          <label className="flex min-h-11 items-center gap-3 text-[16px] font-semibold">
            <input type="checkbox" checked={complex} onChange={(e) => onChange(e.target.checked ? { is_complex: true, movement_id: null, strength_scheme: null } : { is_complex: false, content: "", strength_scheme: [{ sets: 1, reps: 1, percentage: 70 }] })} className="h-5 w-5 accent-[var(--color-lemon)]" />
            Complex
          </label>
          <p className="text-[13px] text-chalk-3">{complex ? "Varios movimientos enlazados sin soltar la barra. Escribe el complex en texto libre; cada atleta guardará su peso máximo válido." : "Trabajo de fuerza por movimiento. Todos los porcentajes se calculan sobre el 1RM del atleta."}</p>

          {!complex && (
            <>
              <label className="block">
                <span className="label">Movimiento</span>
                <select value={block.movement_id ?? ""} onChange={(e) => onChange({ movement_id: e.target.value || null })} className="field mt-1 w-full">
                  <option value="">Elige un movimiento</option>
                  {movements.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </label>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="label">Series · reps · % 1RM</p>
                  <button type="button" className="btn-ghost h-10" onClick={() => onChange({ strength_scheme: [...scheme, { sets: 1, reps: 1, percentage: 70 }] })}>+ Añadir tramo</button>
                </div>
                <div className="mt-2 space-y-2">
                  {scheme.map((row, i) => (
                    <div key={i} className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto] items-center gap-2 rounded-sm border border-line bg-ink px-2 py-2">
                      <input aria-label={`Series tramo ${i + 1}`} type="number" min={1} max={50} value={row.sets} onChange={(e) => patchRow(i, { sets: intOr(e.target.value, 1) })} className="field min-w-0 text-center font-display font-bold" />
                      <span className="text-chalk-3">×</span>
                      <input aria-label={`Repeticiones tramo ${i + 1}`} type="number" min={1} max={100} value={row.reps} onChange={(e) => patchRow(i, { reps: intOr(e.target.value, 1) })} className="field min-w-0 text-center font-display font-bold" />
                      <span className="text-chalk-3">@</span>
                      <div className="relative min-w-0"><input aria-label={`Porcentaje tramo ${i + 1}`} type="number" step="0.5" min={1} max={200} value={row.percentage} onChange={(e) => patchRow(i, { percentage: pctOr(e.target.value, 70) })} className="field w-full pr-8 text-center font-display font-bold" /><span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-chalk-3">%</span></div>
                      <button type="button" aria-label={`Eliminar tramo ${i + 1}`} onClick={() => onChange({ strength_scheme: scheme.filter((_, idx) => idx !== i) })} disabled={scheme.length === 1} className="press h-10 w-8 text-danger disabled:opacity-30">×</button>
                    </div>
                  ))}
                </div>
                {scheme.length > 0 && <p className="mt-2 text-[14px] font-semibold text-chalk-2">{scheme.map((r) => `${r.sets}×${r.reps} @${r.percentage}%`).join(" · ")}</p>}
              </div>
            </>
          )}
        </div>
      )}
    </li>
  );
}

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className="press flex h-12 w-11 shrink-0 items-center justify-center text-chalk-2 hover:text-chalk disabled:text-chalk-3/30"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square" aria-hidden>{children}</svg></button>;
}
