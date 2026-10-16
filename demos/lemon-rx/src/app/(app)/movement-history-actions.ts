"use server";

import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { BuilderSection, ComplexMovementRow, ScoreType, StrengthSchemeRow } from "@/lib/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type HistoryBlock = {
  id: string;
  content: string;
  score_type: ScoreType;
  movement_id: string | null;
  complex_movements: ComplexMovementRow[] | null;
  builder_sections: BuilderSection[] | null;
};

type MovementRef = { id: string; name: string };

export type MovementHistoryEntry = {
  block_id: string;
  date: string;
  title: string;
  content: string;
  score_type: ScoreType;
  movement_id: string | null;
  strength_scheme: StrengthSchemeRow[] | null;
  sets_count: number | null;
  reps_per_set: number | null;
  is_complex: boolean;
  complex_movements: ComplexMovementRow[] | null;
  rm_reference_movement_id: string | null;
  is_emom: boolean;
  emom_reps: number | null;
  emom_interval_seconds: number | null;
  emom_rounds: number | null;
  emom_percentage: number | null;
  builder_sections: BuilderSection[] | null;
  done: boolean;
  note: string;
  kg: number | null;
  total_load: number | null;
  reps_detail: string;
};

export type MovementHistoryGroup = {
  movement_id: string;
  movement_name: string;
  entries: MovementHistoryEntry[];
};

type HistoryResult =
  | { ok: true; movements: MovementHistoryGroup[] }
  | { ok: false; error: string };

function builderMovementIds(sections: BuilderSection[] | null) {
  const ids: string[] = [];
  for (const section of sections ?? []) {
    for (const item of section.items ?? []) {
      if (item.type === "exercise") ids.push(item.movement_id);
      if (item.type === "complex") ids.push(...item.movements.map((row) => row.movement_id));
    }
  }
  return ids;
}

function textMovementIds(content: string, movements: MovementRef[]) {
  const found = new Set<string>();
  const lines = content.split(/\r?\n/).map((line) => line.trim().toLocaleLowerCase("es-ES")).filter(Boolean);

  for (const line of lines) {
    const matches = movements
      .filter((movement) => line.includes(movement.name.toLocaleLowerCase("es-ES")))
      .sort((a, b) => b.name.length - a.name.length);
    const accepted: MovementRef[] = [];
    for (const movement of matches) {
      const name = movement.name.toLocaleLowerCase("es-ES");
      if (accepted.some((longer) => longer.name.toLocaleLowerCase("es-ES").includes(name))) continue;
      accepted.push(movement);
      found.add(movement.id);
    }
  }
  return [...found];
}

function movementIdsForBlock(block: HistoryBlock, movements: MovementRef[]) {
  const ids = new Set<string>();
  if (block.movement_id) ids.add(block.movement_id);
  for (const row of block.complex_movements ?? []) ids.add(row.movement_id);
  for (const id of builderMovementIds(block.builder_sections)) ids.add(id);

  // Compatibilidad retroactiva: los bloques anteriores al constructor estructurado
  // guardaban Strength/Weightlifting como texto libre.
  if (ids.size === 0 && block.content.trim()) {
    for (const id of textMovementIds(block.content, movements)) ids.add(id);
  }
  return [...ids].filter((id) => UUID.test(id));
}

export async function getBlockMovementHistories(blockId: string): Promise<HistoryResult> {
  const viewer = await getViewer();
  if (!viewer.canViewProgram || !UUID.test(blockId)) return { ok: false, error: "No se ha podido cargar el historial." };

  const supabase = await createClient();
  const [{ data: block, error: blockError }, { data: movements, error: movementsError }] = await Promise.all([
    supabase
      .from("workout_blocks")
      .select("id, content, score_type, movement_id, complex_movements, builder_sections")
      .eq("id", blockId)
      .maybeSingle<HistoryBlock>(),
    supabase
      .from("movements")
      .select("id, name")
      .eq("is_active", true)
      .order("sort_order")
      .returns<MovementRef[]>(),
  ]);

  if (blockError || movementsError || !block) return { ok: false, error: "No se ha podido cargar el historial." };
  if (block.score_type !== "load" && block.score_type !== "weight") return { ok: true, movements: [] };

  const movementMap = new Map((movements ?? []).map((movement) => [movement.id, movement]));
  const ids = movementIdsForBlock(block, movements ?? []).filter((id) => movementMap.has(id)).slice(0, 12);
  if (ids.length === 0) return { ok: true, movements: [] };

  const groups = await Promise.all(ids.map(async (movementId): Promise<MovementHistoryGroup | null> => {
    const { data, error } = await supabase.rpc("movement_training_history", {
      p_movement_id: movementId,
      p_exclude_block_id: blockId,
    });
    if (error) return null;
    const movement = movementMap.get(movementId)!;
    const entries = ((data ?? []) as MovementHistoryEntry[]).map((entry) => ({
      ...entry,
      kg: entry.kg == null ? null : Number(entry.kg),
      total_load: entry.total_load == null ? null : Number(entry.total_load),
      sets_count: entry.sets_count == null ? null : Number(entry.sets_count),
      reps_per_set: entry.reps_per_set == null ? null : Number(entry.reps_per_set),
      emom_reps: entry.emom_reps == null ? null : Number(entry.emom_reps),
      emom_interval_seconds: entry.emom_interval_seconds == null ? null : Number(entry.emom_interval_seconds),
      emom_rounds: entry.emom_rounds == null ? null : Number(entry.emom_rounds),
      emom_percentage: entry.emom_percentage == null ? null : Number(entry.emom_percentage),
    }));
    return { movement_id: movement.id, movement_name: movement.name, entries };
  }));

  if (groups.some((group) => group == null)) return { ok: false, error: "No se ha podido cargar el historial." };
  return { ok: true, movements: groups as MovementHistoryGroup[] };
}
