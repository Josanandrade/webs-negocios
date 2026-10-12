"use client";

import { useEffect, useState, useTransition } from "react";
import { removePushSubscription, savePushSubscription, sendTestPush } from "../actions";
import { Toast, useToast } from "@/components/toast";

type State = "loading" | "unconfigured" | "ios-install" | "unsupported" | "denied" | "off" | "on";

function base64UrlToBytes(value: string) {
  const base64 = (value + "=".repeat((4 - (value.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function isIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
}

async function registration() {
  return navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });
}

/** Activar en este móvil las notificaciones de registros nuevos y mandar una de prueba. */
export function PushSettings({ publicKey }: { publicKey: string | null }) {
  const [state, setState] = useState<State>("loading");
  const [pending, startTransition] = useTransition();
  const { toast, show } = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let next: State;
      if (!publicKey) next = "unconfigured";
      else if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window))
        next = isIos() && !isStandalone() ? "ios-install" : "unsupported";
      else if (Notification.permission === "denied") next = "denied";
      else {
        const sub = await (await registration()).pushManager.getSubscription();
        // Mantiene el dispositivo vinculado a la cuenta con la que se ha entrado.
        if (sub) await savePushSubscription(sub.toJSON() as Parameters<typeof savePushSubscription>[0]);
        next = sub ? "on" : "off";
      }
      if (!cancelled) setState(next);
    })().catch(() => !cancelled && setState("unsupported"));
    return () => {
      cancelled = true;
    };
  }, [publicKey]);

  function enable() {
    if (!publicKey) return;
    startTransition(async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setState(permission === "denied" ? "denied" : "off");
          return;
        }
        const reg = await registration();
        await navigator.serviceWorker.ready;
        const sub =
          (await reg.pushManager.getSubscription()) ??
          (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlToBytes(publicKey) }));
        const result = await savePushSubscription(sub.toJSON() as Parameters<typeof savePushSubscription>[0]);
        if (!result.ok) return show(result.error, "error");
        setState("on");
        show("Notificaciones activadas");
      } catch {
        show("No se han podido activar. Inténtalo de nuevo.", "error");
      }
    });
  }

  function disable() {
    startTransition(async () => {
      const sub = await (await registration()).pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      setState("off");
      show("Notificaciones desactivadas en este dispositivo");
    });
  }

  function test() {
    startTransition(async () => {
      const result = await sendTestPush();
      show(result.ok ? "Enviada. Te llegará en unos segundos." : result.error, result.ok ? "ok" : "error");
    });
  }

  return (
    <section aria-labelledby="notificaciones" className="mt-10">
      <h2 id="notificaciones" className="eyebrow">
        Notificaciones
      </h2>
      <div className="mt-3 border-y border-line py-5">
        <p className="text-[17px] font-semibold leading-snug">Avisarme cuando alguien se registre</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-chalk-2">
          Te llega una notificación al móvil, como la de cualquier app, cada vez que un usuario nuevo se registra.
          Se activa en cada dispositivo por separado.
        </p>

        {state === "loading" && <p className="mt-4 text-[15px] text-chalk-3">Comprobando este dispositivo…</p>}

        {state === "unconfigured" && (
          <p className="mt-4 text-[15px] leading-relaxed text-chalk-3">
            Las notificaciones aún no están configuradas en el servidor.
          </p>
        )}

        {state === "ios-install" && (
          <div className="mt-4 text-[15px] leading-relaxed text-chalk-2">
            <p className="font-semibold text-chalk">En iPhone, primero añade Lemon RX a la pantalla de inicio:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Abre esta página en Safari.</li>
              <li>
                Toca el botón <span className="font-semibold text-chalk">Compartir</span> (el cuadrado con la flecha hacia
                arriba).
              </li>
              <li>
                Elige <span className="font-semibold text-chalk">Añadir a pantalla de inicio</span>.
              </li>
              <li>Abre Lemon RX desde el icono nuevo, entra en Ajustes y activa las notificaciones aquí.</li>
            </ol>
          </div>
        )}

        {state === "unsupported" && (
          <p className="mt-4 text-[15px] leading-relaxed text-chalk-3">
            Este navegador no permite notificaciones. En Android usa Chrome; en iPhone, Safari con la app añadida a la
            pantalla de inicio.
          </p>
        )}

        {state === "denied" && (
          <p className="mt-4 text-[15px] leading-relaxed text-chalk-3">
            Has bloqueado las notificaciones para Lemon RX. Permítelas en los ajustes del móvil (Notificaciones → Lemon RX)
            y vuelve a esta pantalla.
          </p>
        )}

        {state === "off" && (
          <button type="button" className="btn-primary mt-5 w-full sm:w-auto" disabled={pending} onClick={enable}>
            {pending ? "Activando…" : "Activar notificaciones"}
          </button>
        )}

        {state === "on" && (
          <>
            <p className="mt-4 text-[15px] font-semibold text-lemon">Activadas en este dispositivo.</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button type="button" className="btn-primary" disabled={pending} onClick={test}>
                Enviar notificación de prueba
              </button>
              <button type="button" className="btn-ghost" disabled={pending} onClick={disable}>
                Desactivar
              </button>
            </div>
          </>
        )}
      </div>
      <Toast toast={toast} className="bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-8" />
    </section>
  );
}
