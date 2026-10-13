"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { loadSetWeights, parseScore, type ScoreDraft } from "@/lib/scores";
import type { ComplexMovementRow, StrengthSchemeRow } from "@/lib/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Result = { ok: true } | { ok: false; error: string };

type StrengthBlockRow = {
  score_type: string;
  strength_scheme: StrengthSchemeRow[] | null;
  is_emom: boolean;
  emom_rounds: number | null;
  emom_reps: number | null;
  reps_per_set: number | null;
  is_complex: boolean;
  complex_movements: ComplexMovementRow[] | null;
};

function repsInComplex(rows: ComplexMovementRow[] | null) {
  return (rows ?? []).reduce((sum, row) => sum + Math.max(0, Number(row.reps || 0)), 0);
}

function totalLoad(block: StrengthBlockRow, parsed: { kg: number | null; reps_detail: string }) {
  const saved = loadSetWeights(parsed.reps_detail);
  if (block.is_emom) {
    const rounds = Math.max(0, Number(block.emom_rounds || 0));
    const reps = block.is_complex ? repsInComplex(block.complex_movements) : Math.max(0, Number(block.emom_reps || 0));
    if (!rounds || !reps) return null;
    const weights = saved?.length === rounds
      ? saved
      : parsed.kg != null
        ? Array.from({ length: rounds }, () => parsed.kg as number)
        : [];
    if (weights.length !== rounds) return null;
    return weights.reduce((sum, kg) => sum + kg * reps, 0);
  }

  if (saved?.length) {
    const scheme = (block.strength_scheme ?? []).flatMap((row) =>
      Array.from({ length: Math.max(0, Number(row.sets || 0)) }, () => Math.max(0, Number(row.reps || 0))),
    );
    const complexReps = repsInComplex(block.complex_movements);
    const reps = block.is_complex ? saved.map(() => complexReps) : scheme;
    if (reps.length === saved.length && reps.every((v) => v > 0)) {
      return saved.reduce((sum, kg, i) => sum + kg * reps[i], 0);
    }
  }

  const sets = Math.max(0, Number(block.strength_scheme?.reduce((sum, row) => sum + Number(row.sets || 0), 0) || 0));
  const reps = block.is_complex ? repsInComplex(block.complex_movements) : Math.max(0, Number(block.reps_per_set || 0));
  if (parsed.kg != null && sets > 0 && reps > 0) return parsed.kg * sets * reps;
  return parsed.kg;
}

export async function saveStrengthResult(blockId: string, draft: ScoreDraft): Promise<Result> {
  const viewer = await getViewer();
  if (!viewer.canViewProgram || !UUID.test(blockId)) return { ok: false, error: "No se ha podido guardar el resultado." };

  const supabase = await createClient();
  const { data: block } = await supabase
    .from("workout_blocks")
    .select("score_type, strength_scheme, is_emom, emom_rounds, emom_reps, reps_per_set, is_complex, complex_movements")
    .eq("id", blockId)
    .maybeSingle<StrengthBlockRow>();

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
  const total_load = totalLoad(block, parsed.score);
  const { error } = await supabase.from("block_results").upsert({
    user_id: viewer.profile.id,
    block_id: blockId,
    division: "rx",
    ...parsed.score,
    total_load,
  }, { onConflict: "user_id,block_id" });
  if (error) return { ok: false, error: "No se ha podido guardar el resultado. Revisa tu conexión." };
  await supabase.from("block_logs").upsert({ user_id: viewer.profile.id, block_id: blockId, done: true }, { onConflict: "user_id,block_id" });
  revalidatePath("/", "layout");
  revalidatePath("/ranking");
  return { ok: true };
}
