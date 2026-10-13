"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isIsoDate } from "@/lib/dates";
import { SCORE_TYPE_VALUES } from "@/lib/scores";
import type { ComplexMovementRow, ScoreType, StrengthSchemeRow } from "@/lib/types";

type Result = { ok: true; at?: string } | { ok: false; error: string };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ProgramBlockInput = {
  id: string;
  title: string;
  content: string;
  score_type: ScoreType;
  sets_count: number | null;
  reps_per_set: number | null;
  movement_id: string | null;
  strength_scheme: StrengthSchemeRow[] | null;
  is_complex: boolean;
  complex_movements: ComplexMovementRow[] | null;
  rm_reference_movement_id: string | null;
  is_emom: boolean;
  emom_reps: number | null;
  emom_interval_seconds: number | null;
  emom_rounds: number | null;
  emom_percentage: number | null;
};
export type ProgramDayInput = { date: string; blocks: ProgramBlockInput[] };

function cleanScheme(value: unknown): StrengthSchemeRow[] | null {
  if (!Array.isArray(value)) return null;
  const rows = value.slice(0, 50).map((row) => {
    const r = row as Partial<StrengthSchemeRow>;
    return { sets: Number(r.sets), reps: Number(r.reps), percentage: Number(r.percentage) };
  });
  if (!rows.length || rows.some((r) => !Number.isInteger(r.sets) || r.sets < 1 || r.sets > 100 || !Number.isInteger(r.reps) || r.reps < 1 || r.reps > 100 || !Number.isFinite(r.percentage) || r.percentage <= 0 || r.percentage > 200)) return null;
  return rows;
}

function cleanComplex(value: unknown): ComplexMovementRow[] | null {
  if (!Array.isArray(value)) return null;
  const rows = value.slice(0, 20).map((row) => {
    const r = row as Partial<ComplexMovementRow>;
    return { movement_id: String(r.movement_id ?? ""), reps: Number(r.reps) };
  });
  if (!rows.length || rows.some((r) => !UUID.test(r.movement_id) || !Number.isInteger(r.reps) || r.reps < 1 || r.reps > 100)) return null;
  return rows;
}

function cleanInt(value: unknown, min: number, max: number) {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}
function cleanPct(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 && n <= 200 ? n : null;
}

export async function saveProgramWeek(weekId: string, days: ProgramDayInput[]): Promise<Result> {
  await requireAdmin();
  if (!UUID.test(weekId)) return { ok: false, error: "Semana no válida." };

  const clean: ProgramDayInput[] = [];
  for (const day of days) {
    if (!isIsoDate(day.date)) return { ok: false, error: "Fecha no válida." };
    const blocks = day.blocks.filter((b) => UUID.test(b.id)).map((b) => {
      const score_type = SCORE_TYPE_VALUES.includes(b.score_type) ? b.score_type : "none";
      const isLoad = score_type === "load";
      const isComplex = isLoad && Boolean(b.is_complex);
      const isEmom = isLoad && Boolean(b.is_emom);
      const complexMovements = isComplex ? cleanComplex(b.complex_movements) : null;
      const movementId = isLoad && !isComplex && b.movement_id && UUID.test(b.movement_id) ? b.movement_id : null;
      const rmReferenceMovementId = isComplex && b.rm_reference_movement_id && UUID.test(b.rm_reference_movement_id) ? b.rm_reference_movement_id : null;
      const scheme = isLoad && !isEmom ? cleanScheme(b.strength_scheme) : null;
      const emomReps = isEmom && !isComplex ? cleanInt(b.emom_reps, 1, 100) : null;
      const emomIntervalSeconds = isEmom ? cleanInt(b.emom_interval_seconds, 1, 3600) : null;
      const emomRounds = isEmom ? cleanInt(b.emom_rounds, 1, 100) : null;
      const emomPercentage = isEmom ? cleanPct(b.emom_percentage) : null;

      return {
        id: b.id,
        title: String(b.title).slice(0, 80),
        content: String(b.content).slice(0, 20000),
        score_type,
        sets_count: null,
        reps_per_set: null,
        movement_id: movementId,
        strength_scheme: scheme,
        is_complex: isComplex,
        complex_movements: complexMovements,
        rm_reference_movement_id: rmReferenceMovementId,
        is_emom: isEmom,
        emom_reps: emomReps,
        emom_interval_seconds: emomIntervalSeconds,
        emom_rounds: emomRounds,
        emom_percentage: emomPercentage,
      };
    }).filter((b) => b.title.trim() || b.content.trim() || b.score_type === "load");

    for (const b of blocks) {
      if (b.score_type !== "load") continue;
      if (b.is_complex && !b.complex_movements?.length) return { ok: false, error: `Añade al menos un movimiento al Complex de ${b.title || "fuerza"}.` };
      if (!b.is_complex && !b.movement_id) return { ok: false, error: `Elige un movimiento en ${b.title || "fuerza"}.` };
      if (b.is_complex && !b.rm_reference_movement_id) return { ok: false, error: `Elige el RM de referencia del Complex de ${b.title || "fuerza"}.` };
      if (b.is_emom && (!b.emom_interval_seconds || !b.emom_rounds || !b.emom_percentage || (!b.is_complex && !b.emom_reps))) return { ok: false, error: `Completa rondas, intervalo, repeticiones y %1RM del EMOM de ${b.title || "fuerza"}.` };
      if (!b.is_emom && !b.strength_scheme?.length) return { ok: false, error: `Añade al menos un tramo de series/reps/% en ${b.title || "fuerza"}.` };
    }
    clean.push({ date: day.date, blocks });
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("save_week_content", { p_week_id: weekId, p_days: clean });
  if (error) return { ok: false, error: "No se ha podido guardar. Revisa la programación y vuelve a intentarlo." };
  revalidatePath("/", "layout");
  return { ok: true, at: new Date().toISOString() };
}