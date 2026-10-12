"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isIsoDate, isoDayOfWeek, weekRangeSentence } from "@/lib/dates";
import { emailConfigured, sendEmails, weekPublishedEmail, type Recipient } from "@/lib/email";
import { pushConfigured, sendPush } from "@/lib/push";
import { SCORE_TYPE_VALUES } from "@/lib/scores";
import type { AccessStatus, PaymentStatus, Role, ScoreType, WeekStatus } from "@/lib/types";

// Cada acción comprueba el rol en servidor (requireAdmin) y además la base de
// datos vuelve a comprobarlo con RLS. Nunca se confía en lo que oculta la UI.

type Result = { ok: true; at?: string; notified?: number } | { ok: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------- semanas

export async function createWeek(form: FormData) {
  await requireAdmin();
  const start = String(form.get("start_date") ?? "");
  if (!isIsoDate(start) || isoDayOfWeek(start) !== 1) redirect("/admin/programacion?error=fecha");

  const supabase = await createClient();
  const { data: existing } = await supabase.from("weeks").select("id").eq("start_date", start).maybeSingle();
  if (existing) redirect(`/admin/programacion/${existing.id}`);

  const { data: claims } = await supabase.auth.getClaims();
  const { data, error } = await supabase
    .from("weeks")
    .insert({ start_date: start, created_by: claims?.claims?.sub, updated_by: claims?.claims?.sub })
    .select("id")
    .single();
  if (error || !data) redirect("/admin/programacion?error=crear");

  revalidatePath("/admin", "layout");
  redirect(`/admin/programacion/${data.id}`);
}

export type BlockInput = { id: string; title: string; content: string; score_type: ScoreType };
export type DayInput = { date: string; blocks: BlockInput[] };

export async function saveWeek(weekId: string, days: DayInput[]): Promise<Result> {
  await requireAdmin();
  if (!UUID.test(weekId)) return { ok: false, error: "Semana no válida." };

  const clean: DayInput[] = [];
  for (const day of days) {
    if (!isIsoDate(day.date)) return { ok: false, error: "Fecha no válida." };
    const blocks = day.blocks
      .filter((b) => UUID.test(b.id))
      .map((b) => ({
        id: b.id,
        title: String(b.title).slice(0, 80),
        content: String(b.content).slice(0, 20000),
        score_type: SCORE_TYPE_VALUES.includes(b.score_type) ? b.score_type : "none",
      }))
      // Un bloque completamente vacío no se guarda.
      .filter((b) => b.title.trim() || b.content.trim());
    clean.push({ date: day.date, blocks });
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("save_week_content", { p_week_id: weekId, p_days: clean });
  if (error) return { ok: false, error: "No se ha podido guardar. Revisa tu conexión y vuelve a intentarlo." };

  revalidatePath("/", "layout");
  return { ok: true, at: new Date().toISOString() };
}

export async function setWeekStatus(weekId: string, status: WeekStatus): Promise<Result> {
  await requireAdmin();
  if (!UUID.test(weekId) || (status !== "draft" && status !== "published"))
    return { ok: false, error: "Petición no válida." };

  const supabase = await createClient();
  const { data: week, error } = await supabase
    .from("weeks")
    .update({ status })
    .eq("id", weekId)
    .select("start_date")
    .single();
  if (error || !week) return { ok: false, error: "No se ha podido cambiar el estado." };

  revalidatePath("/", "layout");
  if (status !== "published") return { ok: true };
  const notified = await notifyWeekPublished(weekId, week.start_date);
  return { ok: true, notified };
}

/**
 * Avisa por email a todos los usuarios la primera vez que se publica una
 * semana. La base de datos marca la semana como avisada antes de enviar, así
 * que despublicar y volver a publicar no repite el email. El envío se hace
 * después de responder, para que publicar no espere al correo.
 */
async function notifyWeekPublished(weekId: string, startDate: string) {
  if (!emailConfigured()) return 0;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("claim_week_notification", { p_week_id: weekId });
  const recipients = (data ?? []) as Recipient[];
  if (error || recipients.length === 0) return 0;

  const origin = (process.env.SITE_URL ?? "").replace(/\/$/, "");
  const url = `${origin}/?semana=${startDate}`;
  const range = weekRangeSentence(startDate);
  after(async () => {
    try {
      await sendEmails(recipients.map((r) => weekPublishedEmail(r, range, url)));
    } catch (err) {
      console.error("Aviso de semana publicada no enviado", err);
      // Sin marcar: la próxima vez que se publique se vuelve a intentar.
      await supabase.from("weeks").update({ notified_at: null }).eq("id", weekId);
    }
  });
  return recipients.length;
}

export async function deleteWeek(weekId: string): Promise<Result> {
  await requireAdmin();
  if (!UUID.test(weekId)) return { ok: false, error: "Semana no válida." };
  const supabase = await createClient();
  // Solo se borran borradores; una semana publicada hay que despublicarla antes.
  const { error, count } = await supabase
    .from("weeks")
    .delete({ count: "exact" })
    .eq("id", weekId)
    .eq("status", "draft");
  if (error || !count) return { ok: false, error: "Solo se pueden eliminar semanas en borrador." };
  revalidatePath("/", "layout");
  return { ok: true };
}

// ---------------------------------------------------------------- usuarios

async function updateProfile(userId: string, patch: Record<string, string>): Promise<Result> {
  const viewer = await requireAdmin();
  if (!UUID.test(userId)) return { ok: false, error: "Usuario no válido." };
  if (userId === viewer.profile.id && "role" in patch)
    return { ok: false, error: "No puedes cambiar tu propio rol." };

  const supabase = await createClient();
  const { error, count } = await supabase.from("profiles").update(patch, { count: "exact" }).eq("id", userId);
  if (error || !count) return { ok: false, error: "No se ha podido guardar el cambio." };
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function setPayment(userId: string, value: PaymentStatus) {
  if (value !== "paid" && value !== "pending") return { ok: false, error: "Valor no válido." } as Result;
  return updateProfile(userId, { payment_status: value });
}

export async function setAccess(userId: string, value: AccessStatus) {
  if (value !== "active" && value !== "blocked") return { ok: false, error: "Valor no válido." } as Result;
  return updateProfile(userId, { access_status: value });
}

export async function setRole(userId: string, value: Role) {
  if (value !== "admin" && value !== "athlete") return { ok: false, error: "Valor no válido." } as Result;
  return updateProfile(userId, value === "admin" ? { role: value, access_status: "active" } : { role: value });
}

// ---------------------------------------------------------------- ajustes

export async function setSetting(key: "auto_block_unpaid" | "show_past_weeks", value: boolean): Promise<Result> {
  const viewer = await requireAdmin();
  if (key !== "auto_block_unpaid" && key !== "show_past_weeks") return { ok: false, error: "Ajuste no válido." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("app_settings")
    .update({ [key]: Boolean(value), updated_by: viewer.profile.id })
    .eq("id", true);
  if (error) return { ok: false, error: "No se ha podido guardar el ajuste." };
  revalidatePath("/", "layout");
  return { ok: true };
}

// ---------------------------------------------------------------- notificaciones

type PushSubscriptionInput = { endpoint: string; keys: { p256dh: string; auth: string } };

export async function savePushSubscription(sub: PushSubscriptionInput): Promise<Result> {
  await requireAdmin();
  const endpoint = String(sub?.endpoint ?? "");
  const p256dh = String(sub?.keys?.p256dh ?? "");
  const auth = String(sub?.keys?.auth ?? "");
  if (!endpoint.startsWith("https://") || !p256dh || !auth) return { ok: false, error: "Este navegador no ha dado permiso." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("save_push_subscription", { p_endpoint: endpoint, p_p256dh: p256dh, p_auth: auth });
  if (error) return { ok: false, error: "No se han podido activar las notificaciones." };
  return { ok: true };
}

export async function removePushSubscription(endpoint: string): Promise<Result> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", String(endpoint));
  if (error) return { ok: false, error: "No se han podido desactivar las notificaciones." };
  return { ok: true };
}

/** Manda una notificación de prueba a todos los dispositivos del admin actual. */
export async function sendTestPush(): Promise<Result> {
  const viewer = await requireAdmin();
  if (!pushConfigured()) return { ok: false, error: "Las notificaciones aún no están configuradas en el servidor." };

  const supabase = await createClient();
  const { data } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", viewer.profile.id);
  if (!data?.length) return { ok: false, error: "Activa primero las notificaciones en este móvil." };

  const name = viewer.profile.full_name.split(" ")[0];
  const { sent, gone } = await sendPush(data, {
    title: "Nuevo registro en Lemon RX",
    body: `Prueba: así te avisaremos cuando alguien se registre${name ? `, ${name}` : ""}.`,
    url: "/admin/usuarios?filtro=nuevos",
    tag: "prueba",
  });
  if (gone.length > 0) await supabase.from("push_subscriptions").delete().in("endpoint", gone);
  if (sent === 0) return { ok: false, error: "No se ha podido entregar. Desactiva y vuelve a activar las notificaciones." };
  return { ok: true };
}
