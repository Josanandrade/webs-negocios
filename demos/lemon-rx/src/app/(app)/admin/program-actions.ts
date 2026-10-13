"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isIsoDate } from "@/lib/dates";
import { SCORE_TYPE_VALUES } from "@/lib/scores";
import type { ScoreType } from "@/lib/types";

type Result = { ok: true; at?: string } | { ok: false; error: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ProgramBlockInput = {
  id: string;
  title: string;
  content: string;
  score_type: ScoreType;
  sets_count: number | null;
  reps_per_set: number | null;
};

export type ProgramDayInput = { date: string; blocks: ProgramBlockInput[] };

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
    const blocks = day.blocks
      .filter((b) => UUID.test(b.id))
      .map((b) => {
        const score_type = SCORE_TYPE_VALUES.includes(b.score_type) ? b.score_type : "none";
        return {
          id: b.id,
          title: String(b.title).slice(0, 80),
          content: String(b.content).slice(0, 20000),
          score_type,
          sets_count: score_type === "load" ? cleanInt(b.sets_count, 1, 50) : null,
          reps_per_set: score_type === "load" ? cleanInt(b.reps_per_set, 1, 1000) : null,
        };
      })
      .filter((b) => b.title.trim() || b.content.trim());
    clean.push({ date: day.date, blocks });
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("save_week_content", { p_week_id: weekId, p_days: clean });
  if (error) return { ok: false, error: "No se ha podido guardar. Revisa tu conexión y vuelve a intentarlo." };

  revalidatePath("/", "layout");
  return { ok: true, at: new Date().toISOString() };
}
