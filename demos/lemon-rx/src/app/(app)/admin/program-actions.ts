"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isIsoDate } from "@/lib/dates";
import { SCORE_TYPE_VALUES } from "@/lib/scores";
import type { ScoreType, StrengthSchemeRow } from "@/lib/types";

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
};
export type ProgramDayInput = { date: string; blocks: ProgramBlockInput[] };

function cleanScheme(value: unknown): StrengthSchemeRow[] | null {
  if (!Array.isArray(value)) return null;
  const rows = value.slice(0, 20).map((row) => {
    const r = row as Partial<StrengthSchemeRow>;
    return { sets: Number(r.sets), reps: Number(r.reps), percentage: Number(r.percentage) };
  });
  if (!rows.length || rows.some((r) => !Number.isInteger(r.sets) || r.sets < 1 || r.sets > 50 || !Number.isInteger(r.reps) || r.reps < 1 || r.reps > 100 || !Number.isFinite(r.percentage) || r.percentage <= 0 || r.percentage > 200)) return null;
  return rows;
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
      const scheme = isLoad && !isComplex ? cleanScheme(b.strength_scheme) : null;
      const movementId = isLoad && !isComplex && b.movement_id && UUID.test(b.movement_id) ? b.movement_id : null;
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
      };
    }).filter((b) => b.title.trim() || b.content.trim());
    clean.push({ date: day.date, blocks });
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("save_week_content", { p_week_id: weekId, p_days: clean });
  if (error) return { ok: false, error: "No se ha podido guardar. Revisa la programación y vuelve a intentarlo." };
  revalidatePath("/", "layout");
  return { ok: true, at: new Date().toISOString() };
}
