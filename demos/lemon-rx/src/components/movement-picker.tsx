"use client";

import { useEffect, useMemo, useState } from "react";
import type { Movement } from "@/lib/strength";

type Props = {
  movements: Movement[];
  value?: string | null;
  onChange: (movementId: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
};

function normalize(text: string) {
  return text.trim().toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function MovementPicker({ movements, value, onChange, placeholder = "Buscar movimiento…", ariaLabel = "Movimiento", className = "" }: Props) {
  const selected = movements.find((movement) => movement.id === value);
  const [query, setQuery] = useState(selected?.name ?? "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) setQuery(selected?.name ?? "");
  }, [selected?.name, open]);

  const filtered = useMemo(() => {
    const needle = normalize(query);
    if (!needle || selected?.name === query) return movements;
    return movements.filter((movement) => normalize(movement.name).includes(needle));
  }, [movements, query, selected?.name]);

  function choose(movement: Movement) {
    onChange(movement.id);
    setQuery(movement.name);
    setOpen(false);
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          value={query}
          onFocus={(event) => { setOpen(true); event.currentTarget.select(); }}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
          onBlur={() => setTimeout(() => { setOpen(false); setQuery(selected?.name ?? ""); }, 120)}
          onKeyDown={(event) => {
            if (event.key === "Escape") { setOpen(false); setQuery(selected?.name ?? ""); event.currentTarget.blur(); }
            if (event.key === "Enter" && open && filtered[0]) { event.preventDefault(); choose(filtered[0]); }
          }}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-label={ariaLabel}
          placeholder={placeholder}
          autoComplete="off"
          className="field w-full pr-10"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[14px] text-chalk-3">⌕</span>
      </div>
      {open && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-sm border border-line-strong bg-ink-2 shadow-2xl">
          {filtered.length ? filtered.map((movement) => (
            <button
              key={movement.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(movement)}
              className={`block min-h-11 w-full border-b border-line px-3 py-2 text-left text-[15px] last:border-b-0 hover:bg-ink ${movement.id === value ? "font-semibold text-lemon" : "text-chalk-2"}`}
            >
              {movement.name}
            </button>
          )) : <p className="px-3 py-4 text-[14px] text-chalk-3">No hay movimientos que coincidan con la búsqueda.</p>}
        </div>
      )}
    </div>
  );
}
