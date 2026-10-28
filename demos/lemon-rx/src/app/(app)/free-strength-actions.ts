"use server";

import { refresh, revalidatePath } from "next/cache";
import { getViewer } from "@/lib/auth";
import { blockRmAchievementMessage } from "@/lib/rm-achievements-server";
import { createClient } from "@/lib/supabase/server";
import type { BuilderSection } from "@/lib/types";
import { expectedWeightCount, isMaxLoadComplex, isSingleMaxLoadComplexBlock, repsPerWeight, trackedBuilderItems } from "@/lib/unified-strength";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Result = { ok: true; message?: string } | { ok: false; error: string };

export type FreeStrengthDraft = {
  sections: Array<{
    section_id: string;
    count: number;
    exercises: Array<{ item_id: string; weights: string[] }>;
    completed_item_ids: string[];
  }>;
};

type FreeStrengthBlockRow = { score_type: string; builder_sections: BuilderSection[] | null };

function parseKg(value: unknown) {
  const raw = String(value ?? "").trim().replace(",", ".");
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0 || n > 2000) return null;
  return Math.round(n * 100) / 100;
}

function completionItems(section: BuilderSection) {
  return section.items.filter((item) => (item.type === "exercise" || item.type === "complex") && !item.track_load);
}

export async function saveFreeStrengthResult(blockId: string, draft: FreeStrengthDraft): Promise<Result> {
  const viewer = await getViewer();
  if (!viewer.canViewProgram || !UUID.test(blockId)) return { ok: false, error: "No se ha podido guardar el resultado." };

  const startedAt = new Date().toISOString();
  const supabase = await createClient();
  const { data: block } = await supabase.from("workout_blocks").select("score_type, builder_sections").eq("id", blockId).maybeSingle<FreeStrengthBlockRow>();
  if (!block || block.score_type !== "load" || !Array.isArray(block.builder_sections) || !block.builder_sections.length) return { ok: false, error: "Este bloque no usa el constructor de fuerza." };

  const submittedSections = Array.isArray(draft?.sections) ? draft.sections : [];
  const maxComplexBlock = isSingleMaxLoadComplexBlock(block.builder_sections);
  let totalLoadKg = 0;
  let maxKg: number | null = null;
  let recordableCount = 0;
  const savedSections: Array<{ section_id: string; count: number; exercises: Array<{ item_id: string; weights: number[] }>; completed_item_ids: string[] }> = [];

  for (const section of block.builder_sections) {
    const submitted = submittedSections.find((row) => row.section_id === section.id);
    const count = section.count_min === section.count_max ? section.count_min : Number(submitted?.count);
    if (!Number.isInteger(count) || count < section.count_min || count > section.count_max) return { ok: false, error: `Indica cuántos ${section.count_type === "rounds" ? "rounds" : "sets"} has hecho en ${section.label || "una sección"}.` };

    const savedExercises: Array<{ item_id: string; weights: number[] }> = [];
    for (const item of trackedBuilderItems(section)) {
      recordableCount += 1;
      const exercise = submitted?.exercises?.find((row) => row.item_id === item.id);
      const expected = expectedWeightCount(item, count);
      const rawWeights = Array.isArray(exercise?.weights) ? exercise.weights.slice(0, expected) : [];
      if (rawWeights.length !== expected) return { ok: false, error: "Completa todos los pesos antes de guardar." };
      const parsed = rawWeights.map(parseKg);
      if (parsed.some((kg) => kg == null)) return { ok: false, error: "Revisa los pesos. Deben ser números mayores que 0." };
      const weights = parsed as number[];

      if (isMaxLoadComplex(section, item)) {
        weights.forEach((kg) => {
          totalLoadKg += kg;
          maxKg = maxKg == null ? kg : Math.max(maxKg, kg);
        });
      } else {
        const reps = repsPerWeight(item, count);
        if (reps.length !== weights.length || reps.some((value) => value <= 0)) return { ok: false, error: "No se ha podido calcular el volumen de uno de los tramos." };
        weights.forEach((kg, index) => {
          totalLoadKg += kg * reps[index];
          maxKg = maxKg == null ? kg : Math.max(maxKg, kg);
        });
      }
      savedExercises.push({ item_id: item.id, weights });
    }

    const doneItems = completionItems(section);
    recordableCount += doneItems.length;
    const submittedDone = new Set(Array.isArray(submitted?.completed_item_ids) ? submitted.completed_item_ids : []);
    for (const item of doneItems) {
      if (!submittedDone.has(item.id)) return { ok: false, error: "Marca como hechos todos los movimientos pendientes antes de guardar." };
    }
    const completedItemIds = doneItems.map((item) => item.id);
    savedSections.push({ section_id: section.id, count, exercises: savedExercises, completed_item_ids: completedItemIds });
  }

  if (!recordableCount) return { ok: false, error: "Este bloque no tiene ningún movimiento para registrar." };
  const reps_detail = JSON.stringify({ version: 3, sections: savedSections });
  const { error } = await supabase.from("block_results").upsert({
    user_id: viewer.profile.id,
    block_id: blockId,
    division: "rx",
    seconds: null,
    capped: false,
    rounds: null,
    reps: null,
    kg: maxKg,
    total_load: maxKg == null || maxComplexBlock ? null : Math.round(totalLoadKg * 100) / 100,
    as_prescribed: null,
    reps_detail,
  }, { onConflict: "user_id,block_id" });
  if (error) return { ok: false, error: "No se ha podido guardar el resultado. Revisa tu conexión." };
  await supabase.from("block_logs").upsert({ user_id: viewer.profile.id, block_id: blockId, done: true }, { onConflict: "user_id,block_id" });
  const message = await blockRmAchievementMessage(viewer.profile.id, blockId, startedAt);
  revalidatePath("/", "layout");
  revalidatePath("/ranking");
  revalidatePath("/home");
  refresh();
  return { ok: true, message };
}
