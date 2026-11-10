"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isIsoDate } from "@/lib/dates";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function addSubscriptionPeriod(form: FormData) {
  const viewer = await requireAdmin();
  const userId = String(form.get("user_id") ?? "");
  const kind = String(form.get("kind") ?? "");
  const start = String(form.get("starts_on") ?? "");
  const end = String(form.get("ends_on") ?? "");
  const note = String(form.get("note") ?? "").trim();
  const amount = String(form.get("amount") ?? "");
  const paidOn = String(form.get("paid_on") ?? "");
  const base = "/admin/facturacion";
  const fail = (code: string) => redirect(base + "?error=" + code);
  if (!UUID.test(userId) || !["payment", "courtesy"].includes(kind)) fail("datos");
  if (!isIsoDate(start) || !isIsoDate(end) || end < start || note.length > 1000) fail("fechas");
  const cents = kind === "payment" && /^\d{1,7}([.,]\d{1,2})?$/.test(amount)
    ? Math.round(Number(amount.replace(",", ".")) * 100) : null;
  if (kind === "payment" && (cents === null || !isIsoDate(paidOn))) fail("importe");
  const supabase = await createClient();
  const { data: athlete } = await supabase.from("profiles").select("id,role").eq("id", userId).maybeSingle();
  if (!athlete || athlete.role !== "athlete") fail("usuario");
  const { error } = await supabase.from("athlete_subscription_periods").insert({
    user_id: userId, starts_on: start, ends_on: end, kind,
    amount_cents: kind === "payment" ? cents : null,
    paid_on: kind === "payment" ? paidOn : null,
    note, created_by: viewer.profile.id,
  });
  if (error) {
    console.error("Billing insert:", error.message);
    fail("guardar");
  }
  revalidatePath(base);
  redirect(base + "?ok=registrado");
}

export async function voidSubscriptionPeriod(form: FormData) {
  const viewer = await requireAdmin();
  const id = String(form.get("period_id") ?? "");
  if (!UUID.test(id)) redirect("/admin/facturacion?error=datos");
  const supabase = await createClient();
  const { data, error } = await supabase.from("athlete_subscription_periods")
    .update({ voided_at: new Date().toISOString(), voided_by: viewer.profile.id })
    .eq("id", id).is("voided_at", null).select("id").maybeSingle();
  if (error || !data) redirect("/admin/facturacion?error=anular");
  revalidatePath("/admin/facturacion");
  redirect("/admin/facturacion?ok=anulado");
}
