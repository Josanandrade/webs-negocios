"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

export type EditableBlock = { id: string; title: string; content: string };

export const BLOCK_PRESETS = [
  "Warm Up",
  "Mobility",
  "Activation",
  "Strength",
  "Weightlifting",
  "Skill",
  "Gymnastics",
  "Conditioning",
  "WOD",
  "Accessory",
  "Core",
  "Cool Down",
  "Notes",
];

// Ajusta la altura al contenido sin mover la página: al poner height:auto el
// documento encoge un instante y el navegador recoloca el scroll (salto hacia arriba).
function autosize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  const scrollY = window.scrollY;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight + 2}px`;
  if (window.scrollY !== scrollY) window.scrollTo({ top: scrollY, behavior: "instant" });
}

export function BlockEditor({
  block,
  index,
  total,
  autoFocus,
  onChange,
  onMove,
  onDelete,
}: {
  block: EditableBlock;
  index: number;
  total: number;
  autoFocus: boolean;
  onChange: (patch: Partial<EditableBlock>) => void;
  onMove: (delta: -1 | 1) => void;
  onDelete: () => void;
}) {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useLayoutEffect(() => autosize(textRef.current), [block.content]);

  useEffect(() => {
    if (autoFocus) textRef.current?.focus({ preventScroll: false });
    // Solo al montar el bloque nuevo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!confirmDelete) return;
    const t = setTimeout(() => setConfirmDelete(false), 3500);
    return () => clearTimeout(t);
  }, [confirmDelete]);

  const label = block.title.trim() || `Bloque ${index + 1}`;

  return (
    <li
      className="rounded-sm border border-line bg-ink-2"
      style={{ viewTransitionName: `block-${block.id}` }}
    >
      <div className="flex items-center gap-1 border-b border-line pl-3">
        <input
          value={block.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Nombre del bloque"
          aria-label={`Nombre del bloque ${index + 1}`}
          maxLength={80}
          list="block-presets"
          autoCapitalize="characters"
          className="h-12 min-w-0 flex-1 bg-transparent font-display text-[18px] font-bold uppercase tracking-[0.08em] text-lemon placeholder:font-semibold placeholder:normal-case placeholder:tracking-normal placeholder:text-chalk-3 focus:outline-none"
        />
        <IconButton label={`Subir ${label}`} onClick={() => onMove(-1)} disabled={index === 0}>
          <path d="M6 15l6-6 6 6" />
        </IconButton>
        <IconButton label={`Bajar ${label}`} onClick={() => onMove(1)} disabled={index === total - 1}>
          <path d="M6 9l6 6 6-6" />
        </IconButton>
        {confirmDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="press h-12 shrink-0 px-3 font-display text-[15px] font-bold uppercase tracking-[0.04em] text-danger"
          >
            Eliminar
          </button>
        ) : (
          <IconButton label={`Eliminar ${label}`} onClick={() => setConfirmDelete(true)}>
            <path d="M6 6l12 12M18 6L6 18" />
          </IconButton>
        )}
      </div>
      <textarea
        ref={textRef}
        value={block.content}
        onChange={(e) => {
          onChange({ content: e.target.value });
          autosize(e.target);
        }}
        placeholder={"Back Squat\n5 x 5 @ 75%\nRest 2'"}
        aria-label={`Contenido de ${label}`}
        rows={4}
        spellCheck={false}
        autoCapitalize="sentences"
        className="workout-text block min-h-32 w-full resize-none bg-transparent px-3 py-3 text-[17px] leading-[1.55] text-chalk placeholder:text-chalk-3/60 focus:outline-none"
      />
    </li>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="press flex h-12 w-11 shrink-0 items-center justify-center text-chalk-2 hover:text-chalk disabled:text-chalk-3/30"
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square" aria-hidden>
        {children}
      </svg>
    </button>
  );
}
