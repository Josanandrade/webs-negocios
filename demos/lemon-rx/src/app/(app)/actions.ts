"use server";

import { refresh, revalidatePath } from "next/cache";
import { getViewer } from "@/lib/auth";
import { blockRmAchievementMessage } from "@/lib/rm-achievements-server";
import { createClient } from "@/lib/supabase/server";
import { parseScore, type ScoreDraft } from "@/lib/scores";
import type { Division, ScoreType } from "@/lib/types";

// Acciones del atleta sobre sus propios bloques. getViewer() comprueba la
// sesión y el acceso; la RLS vuelve a exigir que user_id sea el suyo, que
// tenga acceso a la programación y que el bloque sea visible para él.

type Result = { ok: true; message?: string } | { ok: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NOTE_MAX = 2000;

async function athlete(blockId: string) {
  const viewer = await getViewer();
  if (!viewer.canViewProgram || !UUID.test(blockId)) return null;
  return viewer.profile.id;
}

export async function setBlockDone(blockId: string, done: boolean): Promise<Result> {
  const userId = await athlete(blockId);
  if (!userId) return { ok: false, error: "No se ha podido guardar." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("block_logs")
    .upsert({ user_id: userId, block_id: blockId, done: Boolean(done) }, { onConflict: "user_id,block_id" });
  if (error) return { ok: false, error: "No se ha podido guardar. Revisa tu conexión." };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveBlockNote(blockId: string, note: string): Promise<Result> {
  const userId = await athlete(blockId);
  if (!userId) return { ok: false, error: "No se ha podido guardar la nota." };
  const clean = String(note ?? "").trim().slice(0, NOTE_MAX);
  const supabase = await createClient();
  const { error } = await supabase
    .from("block_logs")
    .upsert({ user_id: userId, block_id: blockId, note: clean }, { onConflict: "user_id,block_id" });
  if (error) return { ok: false, error: "No se ha podido guardar la nota. Revisa tu conexión." };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveBlockResult(blockId: string, division: Division, draft: ScoreDraft): Promise<Result> {
  const userId = await athlete(blockId);
  if (!userId) return { ok: false, error: "No se ha podido guardar el resultado." };

  const startedAt = new Date().toISOString();
  const supabase = await createClient();
  // El tipo de resultado lo marca el bloque (y la RLS confirma que puede verlo).
  const { data: block } = await supabase
    .from("workout_blocks")
    .select("score_type")
    .eq("id", blockId)
    .maybeSingle<{ score_type: ScoreType }>();
  if (!block || block.score_type === "none") return { ok: false, error: "Este bloque no tiene ranking." };
  // En fuerza no hay categorías: se guarda como RX.
  if (block.score_type === "load") division = "rx";
  if (division !== "rx" && division !== "intermediate") return { ok: false, error: "Elige RX o Intermedio." };

  const parsed = parseScore(block.score_type, {
    min: String(draft?.min ?? ""),
    sec: String(draft?.sec ?? ""),
    capped: Boolean(draft?.capped),
    rounds: String(draft?.rounds ?? ""),
    reps: String(draft?.reps ?? ""),
    kg: String(draft?.kg ?? ""),
    prescribed: draft?.prescribed === "yes" || draft?.prescribed === "no" ? draft.prescribed : "",
    detail: String(draft?.detail ?? ""),
  });
  if (!parsed.ok) return parsed;

  const { error } = await supabase
    .from("block_results")
    .upsert({ user_id: userId, block_id: blockId, division, ...parsed.score }, { onConflict: "user_id,block_id" });
  if (error) return { ok: false, error: "No se ha podido guardar el resultado. Revisa tu conexión." };

  // Guardar un resultado implica que el bloque está hecho.
  await supabase
    .from("block_logs")
    .upsert({ user_id: userId, block_id: blockId, done: true }, { onConflict: "user_id,block_id" });

  const message = await blockRmAchievementMessage(userId, blockId, startedAt);
  revalidatePath("/", "layout");
  revalidatePath("/ranking");
  revalidatePath("/home");
  refresh();
  return { ok: true, message };
}

export async function deleteBlockResult(blockId: string): Promise<Result> {
  const userId = await athlete(blockId);
  if (!userId) return { ok: false, error: "No se ha podido borrar el resultado." };
  const supabase = await createClient();
  const { error } = await supabase.from("block_results").delete().eq("user_id", userId).eq("block_id", blockId);
  if (error) return { ok: false, error: "No se ha podido borrar el resultado." };
  revalidatePath("/", "layout");
  revalidatePath("/ranking");
  revalidatePath("/home");
  refresh();
  return { ok: true };
}
