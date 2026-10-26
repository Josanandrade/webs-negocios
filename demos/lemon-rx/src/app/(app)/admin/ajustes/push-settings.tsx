"use client";

import { useEffect, useState, useTransition } from "react";
import { removePushSubscription, savePushSubscription, sendTestPush } from "../actions";
import { notifyToast } from "@/components/toast";

type State = "loading" | "unconfigured" | "ios-install" | "unsupported" | "denied" | "off" | "on";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null;

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

/** Activar en este móvil las notificaciones de registros nuevos y mandar una de prueba. */
export function PushSettings() {
  const [state, setState] = useState<State>("loading");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setErrorText(null);
      let next: State;
      if (!PUBLIC_KEY) next = "unconfigured";
      else if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window))
        next = isIos() && !isStandalone() ? "ios-install" : "unsupported";
      else if (Notification.permission === "denied") next = "denied";
      else {
        let sub = await (await registration()).pushManager.getSubscription();
        if (sub && !usesPublicKey(sub, PUBLIC_KEY)) {
          await removePushSubscription(sub.endpoint);
          await sub.unsubscribe();
          sub = null;
        }
        if (sub) {
          const saved = await savePushSubscription(sub.toJSON() as Parameters<typeof savePushSubscription>[0]);
          if (!saved.ok) {
            setErrorText(saved.error);
            next = "off";
          } else next = "on";
        } else next = "off";
      }
      if (!cancelled) setState(next);
    })().catch((error) => {
      if (cancelled) return;
      setErrorText(error instanceof Error ? error.message : "No se ha podido comprobar este dispositivo.");
      setState("unsupported");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function enable() {
    if (!PUBLIC_KEY) return;
    setErrorText(null);
    startTransition(async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setState(permission === "denied" ? "denied" : "off");
          return;
        }
        const reg = await registration();
        await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();
        if (sub && !usesPublicKey(sub, PUBLIC_KEY)) {
          await removePushSubscription(sub.endpoint);
          await sub.unsubscribe();
          sub = null;
        }
        sub ??= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64UrlToBytes(PUBLIC_KEY) });
        const result = await savePushSubscription(sub.toJSON() as Parameters<typeof savePushSubscription>[0]);
        if (!result.ok) {
          setErrorText(result.error);
          setState("off");
          notifyToast(result.error, "error");
          return;
        }
        setState("on");
        notifyToast("Notificaciones activadas y confirmadas en el servidor.");
      } catch (error) {
        const message = error instanceof Error && error.message ? error.message : "No se han podido activar. Inténtalo de nuevo.";
        setErrorText(message);
        setState("off");
        notifyToast(message, "error");
      }
    });
  }

  function disable() {
    setErrorText(null);
    startTransition(async () => {
      const sub = await (await registration()).pushManager.getSubscription();
      if (sub) {
        const removed = await removePushSubscription(sub.endpoint);
        if (!removed.ok) {
          setErrorText(removed.error);
          notifyToast(removed.error, "error");
          return;
        }
        await sub.unsubscribe();
      }
      setState("off");
      notifyToast("Notificaciones desactivadas en este dispositivo.");
    });
  }

  function test() {
    setErrorText(null);
    startTransition(async () => {
      const result = await sendTestPush();
      if (result.ok) notifyToast("Notificación de prueba enviada.");
      else {
        setErrorText(result.error);
        notifyToast(result.error, "error");
      }
    });
  }

  return (
    <section aria-labelledby="notificaciones" className="mt-10">
      <h2 id="notificaciones" className="eyebrow">Notificaciones</h2>
      <div className="mt-3 border-y border-line py-5">
        <p className="text-[17px] font-semibold leading-snug">Avisarme cuando alguien se registre</p>
        <p className="mt-1.5 text-[15px] leading-relaxed text-chalk-2">
          Te llega una notificación al móvil, como la de cualquier app, cada vez que un usuario nuevo se registra. Se activa en cada dispositivo por separado.
        </p>

        {state === "loading" && <p className="mt-4 text-[15px] text-chalk-3">Comprobando este dispositivo…</p>}
        {state === "unconfigured" && <p className="mt-4 text-[15px] leading-relaxed text-danger">Falta la clave pública de notificaciones en esta versión de Lemon RX.</p>}
        {state === "ios-install" && (
          <div className="mt-4 text-[15px] leading-relaxed text-chalk-2">
            <p className="font-semibold text-chalk">En iPhone, primero añade Lemon RX a la pantalla de inicio:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5"><li>Abre esta página en Safari.</li><li>Toca <span className="font-semibold text-chalk">Compartir</span>.</li><li>Elige <span className="font-semibold text-chalk">Añadir a pantalla de inicio</span>.</li><li>Abre Lemon RX desde ese icono y vuelve a Ajustes.</li></ol>
          </div>
        )}
        {state === "unsupported" && <p className="mt-4 text-[15px] leading-relaxed text-chalk-3">Este navegador no permite notificaciones. En Android usa Chrome; en iPhone, Safari con Lemon RX añadida a la pantalla de inicio.</p>}
        {state === "denied" && <p className="mt-4 text-[15px] leading-relaxed text-chalk-3">Has bloqueado las notificaciones para Lemon RX. Permítelas en los ajustes del dispositivo y vuelve a esta pantalla.</p>}

        {errorText && <p role="alert" className="mt-4 rounded-sm border border-danger/50 bg-danger/10 px-3 py-2 text-[14px] font-semibold text-danger">{errorText}</p>}

        {state === "off" && <button type="button" className="btn-primary mt-5 w-full sm:w-auto" disabled={pending} onClick={enable}>{pending ? "Activando…" : "Activar notificaciones"}</button>}
        {state === "on" && (
          <>
            <p className="mt-4 text-[15px] font-semibold text-lemon">Activadas y confirmadas en el servidor.</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button type="button" className="btn-primary" disabled={pending} onClick={test}>Enviar notificación de prueba</button>
              <button type="button" className="btn-ghost" disabled={pending} onClick={disable}>Desactivar</button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
