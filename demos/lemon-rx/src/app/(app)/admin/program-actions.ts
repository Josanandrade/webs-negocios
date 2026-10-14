"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isIsoDate } from "@/lib/dates";
import { SCORE_TYPE_VALUES } from "@/lib/scores";
import type { BuilderItem, BuilderSection, ComplexMovementRow, ScoreType, StrengthSchemeRow } from "@/lib/types";

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
  builder_sections: BuilderSection[] | null;
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

function cleanPct(value: unknown) {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 && n <= 200 ? Math.round(n * 100) / 100 : null;
}

function cleanBuilder(value: unknown): BuilderSection[] | null {
  if (value == null) return null;
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) return null;
  const sections: BuilderSection[] = [];
  for (const rawSection of value) {
    const s = rawSection as Partial<BuilderSection>;
    if (!UUID.test(String(s.id ?? ""))) return null;
    const countMin = Number(s.count_min);
    const countMax = Number(s.count_max);
    if (!Number.isInteger(countMin) || !Number.isInteger(countMax) || countMin < 1 || countMax < countMin || countMax > 100) return null;
    const countType = s.count_type === "rounds" ? "rounds" : s.count_type === "sets" ? "sets" : null;
    if (!countType || !Array.isArray(s.items) || s.items.length < 1 || s.items.length > 100) return null;
    const items: BuilderItem[] = [];
    for (const rawItem of s.items) {
      const item = rawItem as Partial<BuilderItem> & Record<string, unknown>;
      const id = String(item.id ?? "");
      if (!UUID.test(id)) return null;
      if (item.type === "exercise") {
        const movementId = String(item.movement_id ?? "");
        const reps = Number(item.reps);
        if (!UUID.test(movementId) || !Number.isInteger(reps) || reps < 1 || reps > 500) return null;
        const rawMin = cleanPct(item.percentage_min);
        const rawMax = cleanPct(item.percentage_max);
        const percentageMin = rawMin ?? rawMax;
        const percentageMax = rawMax ?? rawMin;
        if (percentageMin != null && percentageMax != null && percentageMax < percentageMin) return null;
        items.push({
          id,
          type: "exercise",
          movement_id: movementId,
          reps,
          instruction: String(item.instruction ?? "").trim().slice(0, 120),
          track_load: Boolean(item.track_load),
          percentage_min: Boolean(item.track_load) ? percentageMin : null,
          percentage_max: Boolean(item.track_load) ? percentageMax : null,
        });
      } else if (item.type === "rest") {
        const duration = String(item.duration ?? "").trim().slice(0, 40);
        if (!duration) return null;
        items.push({ id, type: "rest", duration });
      } else if (item.type === "note") {
        const text = String(item.text ?? "").trim().slice(0, 300);
        if (!text) return null;
        items.push({ id, type: "note", text });
      } else return null;
    }
    sections.push({ id: String(s.id), label: String(s.label ?? "").trim().slice(0, 30), count_type: countType, count_min: countMin, count_max: countMax, items });
  }
  return sections;
}

function cleanInt(value: unknown, min: number, max: number) {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
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
      const builderSections = isLoad ? cleanBuilder(b.builder_sections) : null;
      const usesBuilder = isLoad && Array.isArray(b.builder_sections);
      const isComplex = isLoad && !usesBuilder && Boolean(b.is_complex);
      const isEmom = isLoad && !usesBuilder && Boolean(b.is_emom);
      const complexMovements = isComplex ? cleanComplex(b.complex_movements) : null;
      const movementId = isLoad && !usesBuilder && !isComplex && b.movement_id && UUID.test(b.movement_id) ? b.movement_id : null;
      const rmReferenceMovementId = isComplex && b.rm_reference_movement_id && UUID.test(b.rm_reference_movement_id) ? b.rm_reference_movement_id : null;
      const scheme = isLoad && !usesBuilder && !isEmom ? cleanScheme(b.strength_scheme) : null;
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
        builder_sections: builderSections,
      };
    }).filter((b) => b.title.trim() || b.content.trim() || b.score_type === "load");

    for (const b of blocks) {
      if (b.score_type !== "load") continue;
      if (Array.isArray(b.builder_sections)) {
        if (!b.builder_sections.length) return { ok: false, error: `Añade al menos un bloque en ${b.title || "fuerza"}.` };
        const exercises = b.builder_sections.flatMap((section) => section.items.filter((item) => item.type === "exercise"));
        if (!exercises.length) return { ok: false, error: `Añade al menos un ejercicio en ${b.title || "fuerza"}.` };
        if (!exercises.some((item) => item.type === "exercise" && item.track_load)) return { ok: false, error: `Marca al menos un ejercicio como “Registrar carga” en ${b.title || "fuerza"} para poder calcular el ranking.` };
        continue;
      }
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

  const builderWrites = clean.flatMap((day) => day.blocks).map((block) =>
    supabase.from("workout_blocks").update({ builder_sections: block.builder_sections }).eq("id", block.id),
  );
  const builderResults = await Promise.all(builderWrites);
  if (builderResults.some((result) => result.error)) {
    return { ok: false, error: "La programación se ha guardado, pero no se ha podido guardar el constructor de fuerza. Vuelve a intentarlo." };
  }

  revalidatePath("/", "layout");
  return { ok: true, at: new Date().toISOString() };
}
