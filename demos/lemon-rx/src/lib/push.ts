import "server-only";
import webpush from "web-push";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseEnv } from "@/lib/supabase/env";

export type PushTarget = { endpoint: string; p256dh: string; auth: string };
export type PushMessage = { title: string; body: string; url: string; tag?: string };

export function vapidPublicKey() {
  return process.env.VAPID_PUBLIC_KEY ?? null;
}

export function pushConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

export async function sendPush(targets: PushTarget[], message: PushMessage) {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) throw new Error("Notificaciones sin configurar");

  const subject = process.env.VAPID_SUBJECT ?? process.env.SITE_URL ?? "mailto:admin@lemonrx.app";
  const payload = JSON.stringify(message);
  const gone: string[] = [];
  let sent = 0;

  await Promise.all(
    targets.map(async (t) => {
      try {
        await webpush.sendNotification({ endpoint: t.endpoint, keys: { p256dh: t.p256dh, auth: t.auth } }, payload, {
          vapidDetails: { subject, publicKey, privateKey },
          TTL: 60 * 60 * 24,
          urgency: "high",
        });
        sent++;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) gone.push(t.endpoint);
        else console.error("Web Push", status, (err as Error).message);
      }
    }),
  );
  return { sent, gone };
}

function systemDb() {
  const { url, key } = supabaseEnv();
  return createSupabaseClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function notifyUser(recipientId: string, message: PushMessage) {
  const token = process.env.PUSH_SECRET;
  if (!token || !pushConfigured()) return 0;
  const db = systemDb();
  const { data, error } = await db.rpc("user_push_targets", { p_recipient: recipientId, p_token: token });
  if (error) {
    console.error("Aviso social:", error.message);
    return 0;
  }
  const targets = (data ?? []) as PushTarget[];
  if (targets.length === 0) return 0;
  const { sent, gone } = await sendPush(targets, message);
  if (gone.length > 0) await db.rpc("forget_push_subscriptions", { p_endpoints: gone, p_token: token });
  return sent;
}

export async function notifyAdminsOfSignup(userId: string) {
  const token = process.env.PUSH_SECRET;
  if (!token || !pushConfigured()) return;

  const db = systemDb();
  const { data, error } = await db.rpc("signup_push_targets", { p_user_id: userId, p_token: token });
  if (error) {
    console.error("Aviso de registro:", error.message);
    return;
  }
  const rows = (data ?? []) as (PushTarget & { full_name: string; email: string })[];
  if (rows.length === 0) return;

  const { full_name, email } = rows[0];
  const who = full_name.trim() || email;
  const { gone } = await sendPush(rows, {
    title: "Nuevo registro en Lemon RX",
    body: `${who}${full_name.trim() ? ` (${email})` : ""} se ha registrado. Está pendiente de que le deis acceso.`,
    url: "/admin/usuarios?filtro=nuevos",
    tag: `registro-${userId}`,
  });
  if (gone.length > 0) await db.rpc("forget_push_subscriptions", { p_endpoints: gone, p_token: token });
}
