"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { parseScore, type ScoreDraft } from "@/lib/scores";
import type { StrengthSchemeRow } from "@/lib/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Result = { ok: true } | { ok: false; error: string };

export async function saveStrengthResult(blockId: string, draft: ScoreDraft): Promise<Result> {
  const viewer = await getViewer();
  if (!viewer.canViewProgram || !UUID.test(blockId)) return { ok: false, error: "No se ha podido guardar el resultado." };

  const supabase = await createClient();
  const { data: block } = await supabase
    .from("workout_blocks")
    .select("score_type, strength_scheme, is_emom, emom_rounds")
    .eq("id", blockId)
    .maybeSingle<{ score_type: string; strength_scheme: StrengthSchemeRow[] | null; is_emom: boolean; emom_rounds: number | null }>();

  if (!block || block.score_type !== "load") return { ok: false, error: "Este bloque no es de fuerza." };

  const roundWeights = Array.isArray(draft?.setKgs) ? draft.setKgs.map((v) => String(v ?? "")) : [];
  const hasRoundWeights = block.is_emom && roundWeights.some((v) => v.trim() !== "");
  const expectedSets = block.is_emom
    ? (hasRoundWeights ? block.emom_rounds : null)
    : block.strength_scheme?.reduce((sum, row) => sum + Number(row.sets || 0), 0) || null;

  const safeDraft: ScoreDraft = {
    min: "", sec: "", capped: false, rounds: "", reps: "",
    kg: String(draft?.kg ?? ""),
    setKgs: roundWeights.slice(0, 100),
    prescribed: "",
    detail: "",
  };

  const parsed = parseScore("load", safeDraft, expectedSets);
  if (!parsed.ok) return parsed;
  const { error } = await supabase.from("block_results").upsert({ user_id: viewer.profile.id, block_id: blockId, division: "rx", ...parsed.score }, { onConflict: "user_id,block_id" });
  if (error) return { ok: false, error: "No se ha podido guardar el resultado. Revisa tu conexión." };
  await supabase.from("block_logs").upsert({ user_id: viewer.profile.id, block_id: blockId, done: true }, { onConflict: "user_id,block_id" });
  revalidatePath("/", "layout");
  return { ok: true };
}