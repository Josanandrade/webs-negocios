"use client";

import { useEffect, useState, useTransition } from "react";
import { markNotificationRead, removeUserPushSubscription, saveUserPushSubscription } from "@/app/(app)/notification-actions";

type State = "loading" | "hidden" | "ios-install" | "unsupported" | "denied" | "off" | "on";

function base64UrlToBytes(value: string) {
  const base64 = (value + "=".repeat((4 - (value.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function usesPublicKey(sub: PushSubscription, publicKey: string) {
  const current = sub.options.applicationServerKey;
  if (!current) return false;
  const actual = new Uint8Array(current);
  const expected = base64UrlToBytes(publicKey);
  return actual.length === expected.length && actual.every((byte, index) => byte === expected[index]);
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

export function PushOptIn({ publicKey, notificationId, compact = false }: { publicKey: string | null; notificationId?: string; compact?: boolean }) {
  const [state, setState] = useState<State>("loading");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let next: State;
      if (!publicKey) next = "unsupported";
      else if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) next = isIos() && !isStandalone() ? "ios-install" : "unsupported";
      else if (Notification.permission === "denied") next = "denied";
      else {
        let sub = await (await registration()).pushManager.getSubscription();
        if (sub && !usesPublicKey(sub, publicKey)) {
          await removeUserPushSubscription(sub.endpoint);
          await sub.unsubscribe();
          sub = null;
        }
        if (sub) await saveUserPushSubscription(sub.toJSON() as Parameters<typeof saveUserPushSubscription>[0]);
        next = sub ? "on" : "off";
      }
      if (!cancelled) setState(next);
    })().catch(() => !cancelled && setState("unsupported"));
    return () => { cancelled = true; };
  }, [publicKey]);

  function acknowledge() {
    if (notificationId) startTransition(async () => { await markNotificationRead(notificationId); setState("hidden"); });
    else setState("hidden");
  }

  function enable() {
    if (!publicKey) return;
    startTransition(async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return setState(permission === "denied" ? "denied" : "off");
        const reg = await registration();
        await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();
        if (sub && !usesPublicKey(sub, publicKey)) {
          await removeUserPushSubscription(sub.endpoint);
          await sub.unsubscribe();
          sub = null;
        }
        sub ??= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlToBytes(publicKey) });
        const result = await saveUserPushSubscription(sub.toJSON() as Parameters<typeof saveUserPushSubscription>[0]);
        if (!result.ok) return setState("off");
        if (notificationId) await markNotificationRead(notificationId);
        setState("on");
      } catch {
        setState("off");
      }
    });
  }

  if (state === "loading" || state === "hidden") return null;
  const shell = compact ? "rounded-md border border-line bg-ink-2 p-4" : "fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-lg rounded-lg border border-line-strong bg-ink-2 p-4 shadow-2xl md:bottom-6";

  return <aside className={shell} aria-label="Activar notificaciones">
    <p className="eyebrow">Notificaciones</p>
    <h2 className="mt-1 font-display text-[22px] font-bold uppercase">No te pierdas nada de Lemon RX</h2>
    {state === "off" && <><p className="mt-2 text-[14px] leading-[1.5] text-chalk-2">Actívalas en este dispositivo para enterarte de reacciones, comentarios y respuestas.</p><div className="mt-4 flex gap-2"><button type="button" onClick={enable} disabled={pending} className="btn-primary flex-1">{pending ? "Activando…" : "Activar notificaciones"}</button><button type="button" onClick={acknowledge} className="btn-ghost">Ahora no</button></div></>}
    {state === "on" && <><p className="mt-2 text-[14px] font-semibold text-lemon">Notificaciones activadas en este dispositivo.</p>{notificationId && <button type="button" onClick={acknowledge} className="btn-ghost mt-3">Cerrar</button>}</>}
    {state === "denied" && <><p className="mt-2 text-[14px] leading-[1.5] text-chalk-2">Las notificaciones están bloqueadas para Lemon RX. Actívalas desde los ajustes del navegador o del móvil.</p><button type="button" onClick={acknowledge} className="btn-ghost mt-3">Entendido</button></>}
    {state === "ios-install" && <><p className="mt-2 text-[14px] leading-[1.5] text-chalk-2">En iPhone, añade primero Lemon RX a la pantalla de inicio desde Safari y abre la app desde ese icono. Después podrás activar las notificaciones.</p><button type="button" onClick={acknowledge} className="btn-ghost mt-3">Entendido</button></>}
    {state === "unsupported" && <><p className="mt-2 text-[14px] leading-[1.5] text-chalk-2">Este navegador no permite Web Push en esta configuración.</p><button type="button" onClick={acknowledge} className="btn-ghost mt-3">Cerrar</button></>}
  </aside>;
}
