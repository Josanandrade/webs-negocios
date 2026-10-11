"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ToastMessage = { id: number; text: string; tone: "ok" | "error" };

/** Aviso breve y no intrusivo. Se anuncia a lectores de pantalla. */
export function useToast() {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((text: string, tone: "ok" | "error" = "ok") => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), text, tone });
    timer.current = setTimeout(() => setToast(null), tone === "error" ? 6000 : 2600);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { toast, show };
}

export function Toast({ toast, className = "" }: { toast: ToastMessage | null; className?: string }) {
  return (
    <div aria-live="polite" role="status" className={`pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4 ${className}`}>
      {toast && (
        <p
          key={toast.id}
          className={`toast max-w-md rounded-sm px-4 py-3 text-[15px] font-semibold ${
            toast.tone === "error" ? "bg-danger text-ink" : "bg-chalk text-ink"
          }`}
        >
          {toast.text}
        </p>
      )}
    </div>
  );
}
