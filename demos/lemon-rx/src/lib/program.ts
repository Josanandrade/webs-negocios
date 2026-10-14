import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { WeekWithDays } from "@/lib/types";

const WEEK_SELECT =
  "id, start_date, end_date, status, published_at, updated_at, days(id, date, day_of_week, workout_blocks(id, title, content, position, score_type, sets_count, reps_per_set, movement_id, strength_scheme, is_complex, complex_movements, rm_reference_movement_id, is_emom, emom_reps, emom_interval_seconds, emom_rounds, emom_percentage, builder_sections, movement:movements!workout_blocks_movement_id_fkey(id,name), rm_reference_movement:movements!workout_blocks_rm_reference_movement_id_fkey(id,name)))";

function sortWeek(week: WeekWithDays): WeekWithDays {
  week.days.sort((a, b) => a.day_of_week - b.day_of_week);
  week.days.forEach((d) => d.workout_blocks.sort((a, b) => a.position - b.position));
  return week;
}

export async function getPublishedWeek(start: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("weeks")
    .select(WEEK_SELECT)
    .eq("status", "published")
    .eq("start_date", start)
    .maybeSingle<WeekWithDays>();
  return data ? sortWeek(data) : null;
}

export async function getAdjacentPublished(start: string) {
  const supabase = await createClient();
  const [prev, next] = await Promise.all([
    supabase.from("weeks").select("start_date").eq("status", "published").lt("start_date", start).order("start_date", { ascending: false }).limit(1).maybeSingle<{ start_date: string }>(),
    supabase.from("weeks").select("start_date").eq("status", "published").gt("start_date", start).order("start_date", { ascending: true }).limit(1).maybeSingle<{ start_date: string }>(),
  ]);
  return { prev: prev.data?.start_date ?? null, next: next.data?.start_date ?? null };
}

export async function getWeekById(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("weeks").select(WEEK_SELECT).eq("id", id).maybeSingle<WeekWithDays>();
  return data ? sortWeek(data) : null;
}
