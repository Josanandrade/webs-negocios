"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { BuilderSection } from "@/lib/types";
import { expectedWeightCount, repsPerWeight, trackedBuilderItems } from "@/lib/unified-strength";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Result = { ok: true } | { ok: false; error: string };

export type FreeStrengthDraft = {
  sections: Array<{
    section_id: string;
    count: number;
    exercises: Array<{ item_id: string; weights: string[] }>;
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

export async function saveFreeStrengthResult(blockId: string, draft: FreeStrengthDraft): Promise<Result> {
  const viewer = await getViewer();
  if (!viewer.canViewProgram || !UUID.test(blockId)) return { ok: false, error: "No se ha podido guardar el resultado." };

  const supabase = await createClient();
  const { data: block } = await supabase.from("workout_blocks").select("score_type, builder_sections").eq("id", blockId).maybeSingle<FreeStrengthBlockRow>();
  if (!block || block.score_type !== "load" || !Array.isArray(block.builder_sections) || !block.builder_sections.length) return { ok: false, error: "Este bloque no usa el constructor de fuerza." };

  const submittedSections = Array.isArray(draft?.sections) ? draft.sections : [];
  let totalLoadKg = 0;
  let maxKg: number | null = null;
  let trackedCount = 0;
  const savedSections: Array<{ section_id: string; count: number; exercises: Array<{ item_id: string; weights: number[] }> }> = [];

  for (const section of block.builder_sections) {
    const submitted = submittedSections.find((row) => row.section_id === section.id);
    const count = section.count_min === section.count_max ? section.count_min : Number(submitted?.count);
    if (!Number.isInteger(count) || count < section.count_min || count > section.count_max) return { ok: false, error: `Indica cuántos ${section.count_type === "rounds" ? "rounds" : "sets"} has hecho en ${section.label || "una sección"}.` };

    const savedExercises: Array<{ item_id: string; weights: number[] }> = [];
    for (const item of trackedBuilderItems(section)) {
      trackedCount += 1;
      const exercise = submitted?.exercises?.find((row) => row.item_id === item.id);
      const expected = expectedWeightCount(item, count);
      const rawWeights = Array.isArray(exercise?.weights) ? exercise.weights.slice(0, expected) : [];
      if (rawWeights.length !== expected) return { ok: false, error: "Completa todos los pesos antes de guardar." };
      const parsed = rawWeights.map(parseKg);
      if (parsed.some((kg) => kg == null)) return { ok: false, error: "Revisa los pesos. Deben ser números mayores que 0." };
      const weights = parsed as number[];
      const reps = repsPerWeight(item, count);
      if (reps.length !== weights.length || reps.some((value) => value <= 0)) return { ok: false, error: "No se ha podido calcular el volumen de uno de los tramos." };
      weights.forEach((kg, index) => {
        totalLoadKg += kg * reps[index];
        maxKg = maxKg == null ? kg : Math.max(maxKg, kg);
      });
      savedExercises.push({ item_id: item.id, weights });
    }
    savedSections.push({ section_id: section.id, count, exercises: savedExercises });
  }

  if (!trackedCount || maxKg == null) return { ok: false, error: "Este bloque no tiene ningún ejercicio con carga para registrar." };
  const reps_detail = JSON.stringify({ version: 2, sections: savedSections });
  const { error } = await supabase.from("block_results").upsert({
    user_id: viewer.profile.id,
    block_id: blockId,
    division: "rx",
    seconds: null,
    capped: false,
    rounds: null,
    reps: null,
    kg: maxKg,
    total_load: Math.round(totalLoadKg * 100) / 100,
    as_prescribed: null,
    reps_detail,
  }, { onConflict: "user_id,block_id" });
  if (error) return { ok: false, error: "No se ha podido guardar el resultado. Revisa tu conexión." };
  await supabase.from("block_logs").upsert({ user_id: viewer.profile.id, block_id: blockId, done: true }, { onConflict: "user_id,block_id" });
  revalidatePath("/", "layout");
  revalidatePath("/ranking");
  return { ok: true };
}
