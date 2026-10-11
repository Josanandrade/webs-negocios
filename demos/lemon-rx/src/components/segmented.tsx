"use client";

export type SegmentOption<T extends string> = { value: T; label: string; tone?: "ok" | "warn" };

/** Control segmentado de dos estados: grande, claro y sin ambigüedad en móvil. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: T | null;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-2 rounded-sm border border-line-strong p-0.5">
      {options.map((o) => {
        const selected = o.value === value;
        const tone =
          selected && o.tone === "ok"
            ? "bg-lemon text-lemon-ink"
            : selected && o.tone === "warn"
              ? "bg-danger/15 text-danger"
              : selected
                ? "bg-ink-3 text-chalk"
                : "text-chalk-3 hover:text-chalk-2";
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => !selected && onChange(o.value)}
            className={`press h-11 rounded-[3px] px-2 font-display text-[15px] font-bold uppercase tracking-[0.05em] ${tone}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
