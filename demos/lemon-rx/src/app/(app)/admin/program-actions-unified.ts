"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { BuilderItem, BuilderSection, BuilderSectionFormat, ComplexMovementRow, StrengthSchemeRow } from "@/lib/types";
import { saveProgramWeek, type ProgramBlockInput, type ProgramDayInput } from "./program-actions";

type Result = { ok: true; at?: string } | { ok: false; error: string };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function cleanPct(value: unknown) {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 && n <= 200 ? Math.round(n * 100) / 100 : null;
}

function cleanScheme(value: unknown): StrengthSchemeRow[] | null {
  if (value == null) return null;
  if (!Array.isArray(value) || !value.length || value.length > 50) return null;
  const rows = value.map((row) => {
    const r = row as Partial<StrengthSchemeRow>;
    return { sets: Number(r.sets), reps: Number(r.reps), percentage: Number(r.percentage) };
  });
  if (rows.some((row) => !Number.isInteger(row.sets) || row.sets < 1 || row.sets > 100 || !Number.isInteger(row.reps) || row.reps < 1 || row.reps > 500 || !Number.isFinite(row.percentage) || row.percentage <= 0 || row.percentage > 200)) return null;
  return rows;
}

function cleanComplexMovements(value: unknown): ComplexMovementRow[] | null {
  if (!Array.isArray(value) || !value.length || value.length > 30) return null;
  const rows = value.map((row) => {
    const r = row as Partial<ComplexMovementRow>;
    return { movement_id: String(r.movement_id ?? ""), reps: Number(r.reps) };
  });
  if (rows.some((row) => !UUID.test(row.movement_id) || !Number.isInteger(row.reps) || row.reps < 1 || row.reps > 100)) return null;
  return rows;
}

function cleanUnifiedBuilder(value: unknown): BuilderSection[] | null {
  if (!Array.isArray(value) || value.length < 1 || value.length > 100) return null;
  const sections: BuilderSection[] = [];
  for (const rawSection of value) {
    const section = rawSection as Partial<BuilderSection>;
    const id = String(section.id ?? "");
    if (!UUID.test(id) || !Array.isArray(section.items) || !section.items.length || section.items.length > 100) return null;
    const format: BuilderSectionFormat = section.format === "free" || section.format === "emom" || section.format === "rounds" || section.format === "sets"
      ? section.format
      : section.count_type === "rounds" ? "rounds" : "sets";
    const countType = format === "emom" || format === "rounds" ? "rounds" : "sets";
    const countMin = format === "free" ? 1 : Number(section.count_min);
    const countMax = format === "free" ? 1 : Number(section.count_max);
    if (!Number.isInteger(countMin) || !Number.isInteger(countMax) || countMin < 1 || countMax < countMin || countMax > 100) return null;
    const emomInterval = format === "emom" ? Number(section.emom_interval_seconds) : null;
    if (format === "emom" && (!Number.isInteger(emomInterval) || emomInterval < 1 || emomInterval > 3600)) return null;

    const items: BuilderItem[] = [];
    for (const rawItem of section.items) {
      const item = rawItem as Partial<BuilderItem> & Record<string, unknown>;
      const itemId = String(item.id ?? "");
      if (!UUID.test(itemId)) return null;
      if (item.type === "exercise") {
        const movementId = String(item.movement_id ?? "");
        const reps = Number(item.reps);
        if (!UUID.test(movementId) || !Number.isInteger(reps) || reps < 1 || reps > 500) return null;
        const trackLoad = Boolean(item.track_load);
        const rawScheme = item.scheme;
        const scheme = trackLoad ? cleanScheme(rawScheme) : null;
        if (trackLoad && rawScheme != null && scheme == null) return null;
        const rawMin = trackLoad ? cleanPct(item.percentage_min) : null;
        const rawMax = trackLoad ? cleanPct(item.percentage_max) : null;
        const percentageMin = scheme?.length ? null : rawMin ?? rawMax;
        const percentageMax = scheme?.length ? null : rawMax ?? rawMin;
        if (percentageMin != null && percentageMax != null && percentageMax < percentageMin) return null;
        items.push({ id: itemId, type: "exercise", movement_id: movementId, reps, instruction: String(item.instruction ?? "").trim().slice(0, 120), track_load: trackLoad, percentage_min: percentageMin, percentage_max: percentageMax, scheme });
      } else if (item.type === "complex") {
        const movements = cleanComplexMovements(item.movements);
        if (!movements) return null;
        const trackLoad = Boolean(item.track_load);
        const ref = item.rm_reference_movement_id ? String(item.rm_reference_movement_id) : null;
        if (ref && (!UUID.test(ref) || !movements.some((row) => row.movement_id === ref))) return null;
        const rawScheme = item.scheme;
        const scheme = trackLoad ? cleanScheme(rawScheme) : null;
        if (trackLoad && rawScheme != null && scheme == null) return null;
        const rawMin = trackLoad ? cleanPct(item.percentage_min) : null;
        const rawMax = trackLoad ? cleanPct(item.percentage_max) : null;
        const percentageMin = scheme?.length ? null : rawMin ?? rawMax;
        const percentageMax = scheme?.length ? null : rawMax ?? rawMin;
        if (percentageMin != null && percentageMax != null && percentageMax < percentageMin) return null;
        const hasPct = Boolean(scheme?.length || percentageMin != null || percentageMax != null);
        if (trackLoad && hasPct && !ref) return null;
        items.push({ id: itemId, type: "complex", movements, rm_reference_movement_id: ref, instruction: String(item.instruction ?? "").trim().slice(0, 120), track_load: trackLoad, percentage_min: percentageMin, percentage_max: percentageMax, scheme });
      } else if (item.type === "rest") {
        const duration = String(item.duration ?? "").trim().slice(0, 40);
        if (!duration) return null;
        items.push({ id: itemId, type: "rest", duration });
      } else if (item.type === "note") {
        const text = String(item.text ?? "").trim().slice(0, 300);
        if (!text) return null;
        items.push({ id: itemId, type: "note", text });
      } else return null;
    }
    if (!items.some((item) => (item.type === "exercise" || item.type === "complex") && item.track_load)) return null;
    sections.push({ id, label: String(section.label ?? "").trim().slice(0, 30), count_type: countType, count_min: countMin, count_max: countMax, format, emom_interval_seconds: format === "emom" ? emomInterval : null, items });
  }
  return sections;
}

function shadowItem(item: BuilderItem): Exclude<BuilderItem, { type: "complex" }> {
  if (item.type !== "complex") {
    if (item.type === "exercise") return { ...item, scheme: null };
    return item;
  }
  const movementId = item.rm_reference_movement_id ?? item.movements[0]?.movement_id ?? "";
  const reps = item.movements.reduce((sum, row) => sum + row.reps, 0);
  const firstPct = item.scheme?.[0]?.percentage ?? item.percentage_min;
  return {
    id: item.id,
    type: "exercise",
    movement_id: movementId,
    reps: Math.max(1, reps),
    instruction: item.instruction,
    track_load: item.track_load,
    percentage_min: firstPct ?? null,
    percentage_max: firstPct ?? null,
    scheme: null,
  };
}

function shadowBuilder(sections: BuilderSection[]): BuilderSection[] {
  return sections.map((section) => ({
    id: section.id,
    label: section.label,
    count_type: section.format === "emom" || section.format === "rounds" ? "rounds" : "sets",
    count_min: section.format === "free" ? 1 : section.count_min,
    count_max: section.format === "free" ? 1 : section.count_max,
    items: section.items.map(shadowItem),
  }));
}

export async function saveUnifiedProgramWeek(weekId: string, days: ProgramDayInput[]): Promise<Result> {
  await requireAdmin();
  const cleanedDays: ProgramDayInput[] = [];
  for (const day of days) {
    const blocks: ProgramBlockInput[] = [];
    for (const block of day.blocks) {
      if (Array.isArray(block.builder_sections)) {
        const cleaned = cleanUnifiedBuilder(block.builder_sections);
        if (!cleaned) return { ok: false, error: `Revisa el constructor de ${block.title || "Strength / Weightlifting"}. Comprueba ejercicios, tramos, Complex, EMOM y descansos.` };
        blocks.push({ ...block, builder_sections: cleaned });
      } else blocks.push(block);
    }
    cleanedDays.push({ date: day.date, blocks });
  }

  const compatibilityDays: ProgramDayInput[] = cleanedDays.map((day) => ({
    date: day.date,
    blocks: day.blocks.map((block) => Array.isArray(block.builder_sections) ? { ...block, builder_sections: shadowBuilder(block.builder_sections) } : block),
  }));
  const result = await saveProgramWeek(weekId, compatibilityDays);
  if (!result.ok) return result;

  const supabase = await createClient();
  const writes = cleanedDays.flatMap((day) => day.blocks)
    .filter((block) => Array.isArray(block.builder_sections))
    .map((block) => supabase.from("workout_blocks").update({ builder_sections: block.builder_sections }).eq("id", block.id));
  const saved = await Promise.all(writes);
  if (saved.some((row) => row.error)) return { ok: false, error: "La semana se ha guardado, pero falta guardar parte del constructor unificado. Vuelve a pulsar Guardar." };
  revalidatePath("/", "layout");
  return { ok: true, at: new Date().toISOString() };
}
