"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ToastMessage = { id: number; text: string; tone: "ok" | "error" };

const EVENT_NAME = "lemon-rx:toast";
const STORAGE_KEY = "lemon-rx:last-toast";

/**
 * Aviso global que sobrevive a router.refresh()/revalidaciones. Guardamos el
 * último mensaje unos segundos en sessionStorage para que, si React remonta
 * el árbol justo después de guardar, el usuario siga viendo la confirmación.
 */
export function notifyToast(text: string, tone: "ok" | "error" = "ok") {
  if (typeof window === "undefined") return;
  const message: ToastMessage = { id: Date.now(), text, tone };
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(message));
  } catch {
    // El aviso sigue funcionando por evento aunque sessionStorage esté bloqueado.
  }
  window.dispatchEvent(new CustomEvent<ToastMessage>(EVENT_NAME, { detail: message }));
}

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

export function GlobalToast() {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function clearStored(id: number) {
      try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const stored = JSON.parse(raw) as ToastMessage;
        if (stored.id === id) window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // Nada que hacer.
      }
    }

    function display(message: ToastMessage) {
      clearTimeout(timer.current);
      setToast(message);
      timer.current = setTimeout(() => {
        setToast(null);
        clearStored(message.id);
      }, message.tone === "error" ? 6000 : 3200);
    }

    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as ToastMessage;
        if (Date.now() - stored.id <= 10000) display(stored);
        else window.sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // sessionStorage puede estar bloqueado en algún navegador.
    }

    const listener = (event: Event) => display((event as CustomEvent<ToastMessage>).detail);
    window.addEventListener(EVENT_NAME, listener);
    return () => {
      clearTimeout(timer.current);
      window.removeEventListener(EVENT_NAME, listener);
    };
  }, []);

  return <Toast toast={toast} className="bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-8" />;
}

export function Toast({ toast, className = "" }: { toast: ToastMessage | null; className?: string }) {
  return (
    <div aria-live="polite" role="status" className={`pointer-events-none fixed inset-x-0 z-[80] flex justify-center px-4 ${className}`}>
      {toast && (
        <p
          key={toast.id}
          className={`toast max-w-md rounded-sm px-4 py-3 text-[15px] font-semibold shadow-lg ${
            toast.tone === "error" ? "bg-danger text-ink" : "bg-chalk text-ink"
          }`}
        >
          {toast.text}
        </p>
      )}
    </div>
  );
}
