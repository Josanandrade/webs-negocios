"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Result = { ok: true } | { ok: false; error: string };

export async function shareRmAchievements(achievementIds: string[]): Promise<Result> {
  const viewer = await getViewer();
  if (!viewer.canViewProgram) return { ok: false, error: "No tienes acceso a la programación." };

  const ids = [...new Set(Array.isArray(achievementIds) ? achievementIds : [])];
  if (ids.length === 0 || ids.length > 10 || ids.some((id) => !UUID.test(id))) {
    return { ok: false, error: "No se ha podido compartir este logro." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("share_rm_achievements", { p_achievement_ids: ids });
  if (error) return { ok: false, error: "No se ha podido compartir el RM. Inténtalo de nuevo." };

  revalidatePath("/home");
  return { ok: true };
}
