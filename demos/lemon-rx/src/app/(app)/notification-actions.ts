"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };
type PushSubscriptionInput = { endpoint: string; keys: { p256dh: string; auth: string } };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function programViewer() {
  const viewer = await getViewer();
  if (!viewer.canViewProgram) return null;
  return viewer;
}

export async function saveUserPushSubscription(sub: PushSubscriptionInput): Promise<Result> {
  const viewer = await programViewer();
  if (!viewer) return { ok: false, error: "No tienes acceso a la programación." };
  const endpoint = String(sub?.endpoint ?? "");
  const p256dh = String(sub?.keys?.p256dh ?? "");
  const auth = String(sub?.keys?.auth ?? "");
  if (!endpoint.startsWith("https://") || !p256dh || !auth) return { ok: false, error: "Este navegador no ha dado permiso." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("save_push_subscription", { p_endpoint: endpoint, p_p256dh: p256dh, p_auth: auth });
  if (error) return { ok: false, error: "No se han podido activar las notificaciones." };
  return { ok: true };
}

export async function removeUserPushSubscription(endpoint: string): Promise<Result> {
  const viewer = await programViewer();
  if (!viewer) return { ok: false, error: "No tienes acceso a la programación." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", String(endpoint))
    .eq("user_id", viewer.profile.id);
  if (error) return { ok: false, error: "No se han podido desactivar las notificaciones." };
  return { ok: true };
}

export async function markNotificationRead(id: string): Promise<void> {
  const viewer = await programViewer();
  if (!viewer || !UUID.test(id)) return;
  const supabase = await createClient();
  await supabase
    .from("app_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("recipient_id", viewer.profile.id);
  revalidatePath("/notificaciones");
  revalidatePath("/", "layout");
}

export async function openNotification(id: string, href: string): Promise<never> {
  const safeHref = href.startsWith("/") && !href.startsWith("//") ? href : "/notificaciones";
  await markNotificationRead(id);
  redirect(safeHref);
}

export async function markAllNotificationsRead(): Promise<void> {
  const viewer = await programViewer();
  if (!viewer) return;
  const supabase = await createClient();
  await supabase
    .from("app_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", viewer.profile.id)
    .is("read_at", null);
  revalidatePath("/notificaciones");
  revalidatePath("/", "layout");
}
