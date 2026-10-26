"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Result = { ok: true; message?: string } | { ok: false; error: string };
type RmValues = { rm_1: number | null; rm_2: number | null; rm_3: number | null; rm_4: number | null; rm_5: number | null };

function kg(value: unknown) {
  const raw = String(value ?? "").trim().replace(",", ".");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 && n <= 2000 ? Math.round(n * 100) / 100 : NaN;
}

function normalizeRmRow(value: Partial<RmValues> | null | undefined): RmValues {
  return {
    rm_1: value?.rm_1 == null ? null : Number(value.rm_1),
    rm_2: value?.rm_2 == null ? null : Number(value.rm_2),
    rm_3: value?.rm_3 == null ? null : Number(value.rm_3),
    rm_4: value?.rm_4 == null ? null : Number(value.rm_4),
    rm_5: value?.rm_5 == null ? null : Number(value.rm_5),
  };
}

function rmsEqual(a: RmValues, b: RmValues) {
  return a.rm_1 === b.rm_1 && a.rm_2 === b.rm_2 && a.rm_3 === b.rm_3 && a.rm_4 === b.rm_4 && a.rm_5 === b.rm_5;
}

export async function saveMovementRms(movementId: string, values: { rm_1?: string; rm_2?: string; rm_3?: string; rm_4?: string; rm_5?: string }): Promise<Result> {
  const viewer = await getViewer();
  if (!UUID.test(movementId)) return { ok: false, error: "Movimiento no válido." };
  const parsed: RmValues = { rm_1: kg(values.rm_1), rm_2: kg(values.rm_2), rm_3: kg(values.rm_3), rm_4: kg(values.rm_4), rm_5: kg(values.rm_5) };
  if (Object.values(parsed).some((v) => Number.isNaN(v))) return { ok: false, error: "Revisa los kilos introducidos." };
  const supabase = await createClient();
  const [{ data: movement }, { data: current }] = await Promise.all([
    supabase.from("movements").select("id").eq("id", movementId).eq("is_active", true).eq("is_rm_eligible", true).maybeSingle(),
    supabase.from("user_rms").select("rm_1, rm_2, rm_3, rm_4, rm_5").eq("user_id", viewer.profile.id).eq("movement_id", movementId).maybeSingle<Partial<RmValues>>(),
  ]);
  if (!movement) return { ok: false, error: "Este movimiento no está habilitado para registrar RM." };

  const previous = normalizeRmRow(current);
  const allEmpty = Object.values(parsed).every((v) => v == null);
  const changed = !rmsEqual(previous, parsed);
  const recordedAt = new Date().toISOString();

  if (allEmpty) {
    const { error } = await supabase.from("user_rms").delete().eq("user_id", viewer.profile.id).eq("movement_id", movementId);
    if (error) return { ok: false, error: "No se han podido actualizar tus RM." };
    if (changed && current) {
      await supabase.from("user_rm_history").insert({
        user_id: viewer.profile.id,
        movement_id: movementId,
        rm_1: null,
        rm_2: null,
        rm_3: null,
        rm_4: null,
        rm_5: null,
        source: "deleted",
        recorded_at: recordedAt,
      });
    }
  } else {
    const { error } = await supabase.from("user_rms").upsert({ user_id: viewer.profile.id, movement_id: movementId, ...parsed, updated_at: recordedAt }, { onConflict: "user_id,movement_id" });
    if (error) return { ok: false, error: "No se han podido actualizar tus RM." };
    if (changed) {
      await supabase.from("user_rm_history").insert({
        user_id: viewer.profile.id,
        movement_id: movementId,
        ...parsed,
        source: "user_update",
        recorded_at: recordedAt,
      });
    }
  }
  revalidatePath("/rms");
  revalidatePath("/");
  return { ok: true, message: "RM guardados correctamente." };
}

export async function addMovement(name: string, groupName = "Other"): Promise<Result> {
  const viewer = await getViewer();
  if (!viewer.isAdmin) return { ok: false, error: "Solo un admin puede añadir movimientos." };
  const clean = name.trim().replace(/\s+/g, " ");
  if (clean.length < 2 || clean.length > 80) return { ok: false, error: "Escribe un nombre válido." };
  const supabase = await createClient();

  const { data: existing, error: lookupError } = await supabase
    .from("movements")
    .select("id, is_active")
    .ilike("name", clean)
    .limit(1)
    .maybeSingle<{ id: string; is_active: boolean }>();

  if (lookupError) return { ok: false, error: "No se ha podido comprobar el catálogo de movimientos." };

  if (existing) {
    if (existing.is_active) return { ok: false, error: "Ese movimiento ya existe y está activo." };
    const { error } = await supabase
      .from("movements")
      .update({ is_active: true, is_rm_eligible: true, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) return { ok: false, error: "El movimiento existe, pero no se ha podido reactivar." };
    revalidatePath("/rms");
    revalidatePath("/admin/programacion", "layout");
    return { ok: true, message: "Movimiento reactivado y guardado correctamente." };
  }

  const { error } = await supabase.from("movements").insert({ name: clean, group_name: groupName.trim() || "Other", created_by: viewer.profile.id, sort_order: 9999, is_rm_eligible: true });
  if (error) return { ok: false, error: error.code === "23505" ? "Ese movimiento ya existe." : "No se ha podido añadir el movimiento." };
  revalidatePath("/rms");
  revalidatePath("/admin/programacion", "layout");
  return { ok: true, message: "Movimiento guardado correctamente." };
}

export async function setMovementRmEligibility(movementId: string, enabled: boolean): Promise<Result> {
  const viewer = await getViewer();
  if (!viewer.isAdmin) return { ok: false, error: "Solo un admin puede cambiar los movimientos de RM." };
  if (!UUID.test(movementId)) return { ok: false, error: "Movimiento no válido." };
  const supabase = await createClient();
  const { error } = await supabase.from("movements").update({ is_rm_eligible: Boolean(enabled), updated_at: new Date().toISOString() }).eq("id", movementId).eq("is_active", true);
  if (error) return { ok: false, error: "No se ha podido actualizar el movimiento." };
  revalidatePath("/rms");
  revalidatePath("/");
  return { ok: true, message: enabled ? "Movimiento activado para RM." : "Movimiento ocultado de RM." };
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
  return { ok: true, message: "Movimiento eliminado del catálogo." };
}
