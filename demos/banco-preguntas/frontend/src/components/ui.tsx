import { type ButtonHTMLAttributes, type ReactNode, useEffect, useRef } from "react";
import { Link } from "react-router";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 disabled:bg-brand-600/50",
  secondary:
    "bg-white text-slate-800 ring-1 ring-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-800",
  ghost: "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/50",
};

export function Button({
  variant = "primary",
  busy = false,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; busy?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || busy}
      className={`inline-flex min-h-10 max-w-full items-center justify-center gap-2 whitespace-normal break-words rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
    >
      {busy && <Spinner small />}
      {children}
    </button>
  );
}

export function ButtonLink({ to, variant = "primary", children, className = "" }: { to: string; variant?: Variant; children: ReactNode; className?: string }) {
  return (
    <Link
      to={to}
      className={`inline-flex min-h-10 max-w-full items-center justify-center gap-2 whitespace-normal break-words rounded-lg px-4 py-2 text-center text-sm font-medium transition-colors ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 max-w-full rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5 dark:bg-slate-900 dark:ring-slate-800 ${className}`}>
      {children}
    </section>
  );
}

export function PageTitle({ children, actions, subtitle }: { children: ReactNode; actions?: ReactNode; subtitle?: ReactNode }) {
  return (
    <div className="mb-5 flex min-w-0 max-w-full flex-wrap items-end justify-between gap-3">
      <div className="min-w-0 max-w-full flex-1">
        <h1 className="break-words text-xl font-semibold tracking-tight sm:text-2xl">{children}</h1>
        {subtitle && <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex min-w-0 max-w-full flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const TONES = {
  slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  brand: "bg-brand-100 text-brand-900 dark:bg-brand-900/60 dark:text-brand-100",
  green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
  red: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
  amber: "bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200",
} as const;

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: keyof typeof TONES }) {
  return <span className={`inline-flex max-w-full items-center break-words rounded-full px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}>{children}</span>;
}

export function Spinner({ small = false }: { small?: boolean }) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${small ? "h-4 w-4" : "h-6 w-6"}`}
    />
  );
}

export function Loading() {
  return (
    <div className="flex justify-center py-12 text-brand-600">
      <Spinner />
    </div>
  );
}

export function ErrorBox({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  if (!error) return null;
  const msg = error instanceof Error ? error.message : String(error);
  return (
    <div role="alert" className="flex min-w-0 max-w-full flex-wrap items-center justify-between gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800 ring-1 ring-red-200 dark:bg-red-950/40 dark:text-red-200 dark:ring-red-900">
      <span className="min-w-0 flex-1 break-words">{msg}</span>
      {onRetry && (
        <button onClick={onRetry} className="font-medium underline">
          Reintentar
        </button>
      )}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="min-w-0 max-w-full rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
      <p className="break-words font-medium">{title}</p>
      {children && <div className="mt-2 break-words text-sm text-slate-600 dark:text-slate-400">{children}</div>}
    </div>
  );
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div
        className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: max > 0 ? `${pct}%` : "15%" }} />
      </div>
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block min-w-0 max-w-full">
      <span className="mb-1 block break-words text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="mt-1 block break-words text-xs text-slate-500 dark:text-slate-400">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "block min-h-10 w-full min-w-0 max-w-full rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 dark:bg-slate-900 dark:ring-slate-700";

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="min-w-0 max-w-full rounded-xl bg-white p-4 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
      <div className="break-words text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 break-words text-2xl font-semibold tabular-nums">{value}</div>
      {hint && <div className="mt-0.5 break-words text-xs text-slate-500 dark:text-slate-400">{hint}</div>}
    </div>
  );
}

/** Diálogo modal accesible basado en <dialog>. */
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal?.();
    if (!open && d.open) d.close?.();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-lg overflow-x-hidden rounded-xl bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-900/50 dark:bg-slate-900 dark:text-slate-100"
    >
      {open && (
        <div className="min-w-0 max-w-full p-5">
          <h2 className="mb-3 break-words text-lg font-semibold">{title}</h2>
          {children}
        </div>
      )}
    </dialog>
  );
}
