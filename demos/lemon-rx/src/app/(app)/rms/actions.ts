"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Result = { ok: true } | { ok: false; error: string };

function kg(value: unknown) {
  const raw = String(value ?? "").trim().replace(",", ".");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 && n <= 2000 ? Math.round(n * 100) / 100 : NaN;
}

export async function saveMovementRms(movementId: string, values: { rm_1?: string; rm_2?: string; rm_3?: string; rm_4?: string; rm_5?: string }): Promise<Result> {
  const viewer = await getViewer();
  if (!UUID.test(movementId)) return { ok: false, error: "Movimiento no válido." };
  const parsed = { rm_1: kg(values.rm_1), rm_2: kg(values.rm_2), rm_3: kg(values.rm_3), rm_4: kg(values.rm_4), rm_5: kg(values.rm_5) };
  if (Object.values(parsed).some((v) => Number.isNaN(v))) return { ok: false, error: "Revisa los kilos introducidos." };
  const supabase = await createClient();
  const allEmpty = Object.values(parsed).every((v) => v == null);
  if (allEmpty) {
    const { error } = await supabase.from("user_rms").delete().eq("user_id", viewer.profile.id).eq("movement_id", movementId);
    if (error) return { ok: false, error: "No se han podido actualizar tus RM." };
  } else {
    const { error } = await supabase.from("user_rms").upsert({ user_id: viewer.profile.id, movement_id: movementId, ...parsed, updated_at: new Date().toISOString() }, { onConflict: "user_id,movement_id" });
    if (error) return { ok: false, error: "No se han podido actualizar tus RM." };
  }
  revalidatePath("/rms");
  revalidatePath("/");
  return { ok: true };
}

export async function addMovement(name: string, groupName = "Other"): Promise<Result> {
  const viewer = await getViewer();
  if (!viewer.isAdmin) return { ok: false, error: "Solo un admin puede añadir movimientos." };
  const clean = name.trim().replace(/\s+/g, " ");
  if (clean.length < 2 || clean.length > 80) return { ok: false, error: "Escribe un nombre válido." };
  const supabase = await createClient();
  const { error } = await supabase.from("movements").insert({ name: clean, group_name: groupName.trim() || "Other", created_by: viewer.profile.id, sort_order: 9999 });
  if (error) return { ok: false, error: error.code === "23505" ? "Ese movimiento ya existe." : "No se ha podido añadir el movimiento." };
  revalidatePath("/rms");
  revalidatePath("/admin/programacion", "layout");
  return { ok: true };
}

export async function removeMovement(movementId: string): Promise<Result> {
  const viewer = await getViewer();
  if (!viewer.isAdmin) return { ok: false, error: "Solo un admin puede eliminar movimientos." };
  if (!UUID.test(movementId)) return { ok: false, error: "Movimiento no válido." };
  const supabase = await createClient();
  const { error } = await supabase.from("movements").update({ is_active: false, updated_at: new Date().toISOString() }).eq("id", movementId);
  if (error) return { ok: false, error: "No se ha podido eliminar el movimiento." };
  revalidatePath("/rms");
  revalidatePath("/admin/programacion", "layout");
  return { ok: true };
}
