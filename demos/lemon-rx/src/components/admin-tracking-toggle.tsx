"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function AdminTrackingToggle({ open }: { open: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function toggle() {
    const params = new URLSearchParams(searchParams.toString());
    if (open) {
      params.delete("seguimiento");
      params.delete("evolucion");
    } else {
      params.set("seguimiento", "1");
      if (!params.has("evolucion")) params.set("evolucion", "1");
    }
    const query = params.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={open}
      aria-controls="admin-seguimiento-content"
      disabled={pending}
      className="day-trigger group flex min-h-16 w-full items-center justify-between gap-4 px-1 text-left disabled:opacity-60"
    >
      <span>
        <span className="eyebrow block">Seguimiento</span>
        <span className="mt-1 block font-display text-[24px] font-bold uppercase">Evolución de atletas</span>
      </span>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden className="shrink-0 text-chalk-3 transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
        <path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square" />
      </svg>
    </button>
  );
}
