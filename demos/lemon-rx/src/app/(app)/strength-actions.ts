"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { parseScore, type ScoreDraft } from "@/lib/scores";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Result = { ok: true } | { ok: false; error: string };

export async function saveStrengthResult(blockId: string, draft: ScoreDraft): Promise<Result> {
  const viewer = await getViewer();
  if (!viewer.canViewProgram || !UUID.test(blockId)) return { ok: false, error: "No se ha podido guardar el resultado." };

  const supabase = await createClient();
  const { data: block } = await supabase
    .from("workout_blocks")
    .select("score_type, sets_count")
    .eq("id", blockId)
    .maybeSingle<{ score_type: string; sets_count: number | null }>();

  if (!block || block.score_type !== "load") return { ok: false, error: "Este bloque no es de fuerza." };

  const safeDraft: ScoreDraft = {
    min: "",
    sec: "",
    capped: false,
    rounds: "",
    reps: "",
    kg: String(draft?.kg ?? ""),
    setKgs: Array.isArray(draft?.setKgs) ? draft.setKgs.slice(0, 50).map((v) => String(v ?? "")) : [],
    prescribed: "",
    detail: String(draft?.detail ?? "").slice(0, 500),
  };

  const parsed = parseScore("load", safeDraft, block.sets_count);
  if (!parsed.ok) return parsed;

  const { error } = await supabase
    .from("block_results")
    .upsert(
      { user_id: viewer.profile.id, block_id: blockId, division: "rx", ...parsed.score },
      { onConflict: "user_id,block_id" },
    );
  if (error) return { ok: false, error: "No se ha podido guardar el resultado. Revisa tu conexión." };

  await supabase
    .from("block_logs")
    .upsert({ user_id: viewer.profile.id, block_id: blockId, done: true }, { onConflict: "user_id,block_id" });

  revalidatePath("/", "layout");
  return { ok: true };
}
