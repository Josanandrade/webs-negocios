"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isIsoDate, isoDayOfWeek } from "@/lib/dates";
import { SCORE_TYPE_VALUES } from "@/lib/scores";
import type { AccessStatus, PaymentStatus, Role, ScoreType, WeekStatus } from "@/lib/types";

// Cada acción comprueba el rol en servidor (requireAdmin) y además la base de
// datos vuelve a comprobarlo con RLS. Nunca se confía en lo que oculta la UI.

type Result = { ok: true; at?: string } | { ok: false; error: string };

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
  const { error } = await supabase.from("weeks").update({ status }).eq("id", weekId);
  if (error) return { ok: false, error: "No se ha podido cambiar el estado." };

  revalidatePath("/", "layout");
  return { ok: true };
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
