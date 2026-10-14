"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { Movement } from "@/lib/strength";
import type { BuilderSection } from "@/lib/types";
import type { EditableBlock } from "./block-editor";
import { FreeStrengthEditor, newBuilderSection } from "./free-strength-editor";

export type FreeEditableBlock = EditableBlock & { builder_sections: BuilderSection[] };

function autosize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight + 2}px`;
}

export function FreeStrengthBlockEditor({ block, index, total, movements, onChange, onMove, onDelete, onUseClassic }: {
  block: FreeEditableBlock;
  index: number;
  total: number;
  movements: Movement[];
  onChange: (patch: Partial<FreeEditableBlock>) => void;
  onMove: (delta: -1 | 1) => void;
  onDelete: () => void;
  onUseClassic: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => autosize(textRef.current), [block.content]);
  const label = block.title.trim() || `Bloque ${index + 1}`;

  return <li className="rounded-sm border border-line bg-ink-2" style={{ viewTransitionName: `block-${block.id}` }}>
    <div className="flex items-center gap-1 border-b border-line pl-3">
      <input value={block.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="Nombre del bloque" aria-label={`Nombre del bloque ${index + 1}`} maxLength={80} autoCapitalize="characters" className="h-12 min-w-0 flex-1 bg-transparent font-display text-[18px] font-bold uppercase tracking-[0.08em] text-lemon placeholder:font-semibold placeholder:normal-case placeholder:tracking-normal placeholder:text-chalk-3 focus:outline-none" />
      <IconButton label={`Subir ${label}`} onClick={() => onMove(-1)} disabled={index === 0}>↑</IconButton>
      <IconButton label={`Bajar ${label}`} onClick={() => onMove(1)} disabled={index === total - 1}>↓</IconButton>
      {confirmDelete ? <button type="button" onClick={onDelete} className="press h-12 shrink-0 px-3 font-display text-[15px] font-bold uppercase tracking-[0.04em] text-danger">Eliminar</button> : <IconButton label={`Eliminar ${label}`} onClick={() => setConfirmDelete(true)}>×</IconButton>}
    </div>

    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-3 py-2">
      <div><p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-chalk-3">Resultado</p><p className="mt-0.5 text-[14px] font-semibold text-lemon">Ranking · kilos totales movidos</p></div>
      <button type="button" onClick={onUseClassic} className="press min-h-10 text-[13px] font-semibold text-chalk-3 hover:text-chalk">Usar editor clásico</button>
    </div>

    <div className="border-b border-line px-3 py-4">
      <FreeStrengthEditor sections={block.builder_sections.length ? block.builder_sections : [newBuilderSection()]} movements={movements} onChange={(builder_sections) => onChange({ builder_sections })} />
    </div>

    <label className="block px-3 py-4"><span className="label">Indicaciones generales opcionales</span><textarea ref={textRef} value={block.content} onChange={(e) => { onChange({ content: e.target.value }); autosize(e.target); }} placeholder="Cualquier indicación adicional del bloque" rows={2} className="field mt-1 min-h-20 resize-none py-3" /></label>
  </li>;
}

function IconButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: string }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className="press flex h-12 w-11 shrink-0 items-center justify-center text-[20px] font-bold text-chalk-2 hover:text-chalk disabled:text-chalk-3/30">{children}</button>;
}
