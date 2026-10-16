"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

export async function setMyEvolutionVisibility(value: boolean): Promise<Result> {
  const viewer = await requireAdmin();
  const supabase = await createClient();
  const { error, count } = await supabase
    .from("profiles")
    .update({ show_evolution_as_athlete: Boolean(value) }, { count: "exact" })
    .eq("id", viewer.profile.id)
    .eq("role", "admin");

  if (error || !count) return { ok: false, error: "No se ha podido guardar el ajuste." };
  revalidatePath("/admin", "layout");
  revalidatePath("/cuenta");
  revalidatePath("/admin/ajustes");
  return { ok: true };
}
