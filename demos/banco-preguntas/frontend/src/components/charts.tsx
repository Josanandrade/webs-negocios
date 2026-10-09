import { useEffect, useRef, useState } from "react";

/** Ancho real del contenedor (las gráficas se dibujan a su tamaño, sin deformar el texto). */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);   // 0 = aún sin medir: no se dibuja
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.floor(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}

export interface Point {
  label: string; // para el tooltip
  value: number;
}

/**
 * Evolución de una serie sobre una escala fija (p. ej. notas de 0 a 10).
 * Línea de 2px, punto final etiquetado, línea de referencia discreta y tooltip
 * (ratón, dedo o teclado).
 */
export function LineChart({
  points,
  max,
  reference,
  referenceLabel,
  format = (v) => String(v),
  ariaLabel,
}: {
  points: Point[];
  max: number;
  reference?: number;
  referenceLabel?: string;
  format?: (v: number) => string;
  ariaLabel: string;
}) {
  const { ref, width } = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const height = 200;
  const pad = { top: 16, right: 64, bottom: 22, left: 28 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const x = (i: number) => pad.left + (points.length === 1 ? w / 2 : (i / (points.length - 1)) * w);
  const y = (v: number) => pad.top + h - (Math.max(0, Math.min(max, v)) / max) * h;
  const ticks = [0, max / 2, max];
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.value)}`).join(" ");
  const last = points.length - 1;

  function pick(clientX: number) {
    const rect = ref.current!.getBoundingClientRect();
    const rel = clientX - rect.left - pad.left;
    const i = points.length === 1 ? 0 : Math.round((rel / w) * (points.length - 1));
    setHover(Math.max(0, Math.min(last, i)));
  }

  return (
    <div ref={ref} className="relative w-full min-w-0 select-none" style={{ height }}>
      {width > 0 && (
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={ariaLabel}
        tabIndex={0}
        onMouseMove={(e) => pick(e.clientX)}
        onMouseLeave={() => setHover(null)}
        onTouchStart={(e) => pick(e.touches[0].clientX)}
        onTouchMove={(e) => pick(e.touches[0].clientX)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setHover((h) => Math.min(last, (h ?? -1) + 1));
          if (e.key === "ArrowLeft") setHover((h) => Math.max(0, (h ?? last + 1) - 1));
        }}
        onBlur={() => setHover(null)}
        className="overflow-visible focus:outline-none"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={pad.left + w} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" strokeWidth={1} />
            <text x={pad.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-slate-500 text-[11px] tabular-nums">
              {format(t)}
            </text>
          </g>
        ))}
        {reference !== undefined && (
          <g>
            <line x1={pad.left} x2={pad.left + w} y1={y(reference)} y2={y(reference)} className="stroke-slate-400 dark:stroke-slate-600" strokeWidth={1} />
            {referenceLabel && (
              <text x={pad.left + w + 4} y={y(reference)} dy="0.32em" className="fill-slate-500 text-[11px]">
                {referenceLabel}
              </text>
            )}
          </g>
        )}
        {hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + h} stroke="var(--chart-grid)" strokeWidth={1} />
        )}
        <path d={path} fill="none" stroke="var(--chart-series)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) =>
          i === last || i === hover ? (
            <circle key={i} cx={x(i)} cy={y(p.value)} r={i === hover ? 5 : 4} fill="var(--chart-series)" stroke="var(--chart-surface)" strokeWidth={2} />
          ) : null,
        )}
        {points.length > 0 && hover === null && (
          <text x={x(last) + 8} y={y(points[last].value)} dy="0.32em" className="fill-slate-700 text-xs font-semibold tabular-nums dark:fill-slate-200">
            {format(points[last].value)}
          </text>
        )}
      </svg>
      )}
      {width > 0 && hover !== null && points[hover] && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg dark:bg-slate-100 dark:text-slate-900"
          style={{ left: Math.min(Math.max(x(hover), 70), width - 70), top: Math.max(0, y(points[hover].value) - 52) }}
        >
          <div className="font-semibold tabular-nums">{format(points[hover].value)}</div>
          <div className="max-w-64 truncate opacity-80">{points[hover].label}</div>
        </div>
      )}
    </div>
  );
}

export interface Bar {
  key: string;
  label: string;
  value: number | null; // 0..1
  detail: string; // tooltip y texto accesible
}

/** Barras horizontales de una sola serie (porcentajes), valor en la punta. */
export function BarList({ bars, format }: { bars: Bar[]; format: (v: number | null) => string }) {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <ul className="space-y-3">
      {bars.map((b) => (
        <li
          key={b.key}
          className="relative"
          onMouseEnter={() => setHover(b.key)}
          onMouseLeave={() => setHover(null)}
          onFocus={() => setHover(b.key)}
          onBlur={() => setHover(null)}
          tabIndex={0}
          aria-label={`${b.label}: ${format(b.value)}. ${b.detail}`}
        >
          <div className="mb-1 truncate text-sm" title={b.label}>
            {b.label}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 flex-1">
              <div
                className="h-full rounded-r-[4px] transition-[width]"
                style={{ width: `${Math.max((b.value ?? 0) * 100, b.value ? 1 : 0)}%`, background: "var(--chart-series)" }}
              />
            </div>
            <span className="w-12 shrink-0 text-right text-sm font-medium tabular-nums">{format(b.value)}</span>
          </div>
          {hover === b.key && (
            <div className="pointer-events-none absolute right-0 top-0 z-10 -translate-y-full rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg dark:bg-slate-100 dark:text-slate-900">
              {b.detail}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
