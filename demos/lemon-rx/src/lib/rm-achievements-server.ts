import "server-only";
import { createClient } from "@/lib/supabase/server";
import { rmAchievementMessage, type RmAchievement } from "@/lib/rm-achievements";

const SELECT = "id, movement_name, rm_number, kg, previous_kg";

export async function blockRmAchievementMessage(userId: string, blockId: string, since: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workout_post_achievements")
    .select(SELECT)
    .eq("user_id", userId)
    .eq("source_block_id", blockId)
    .gte("achieved_at", since)
    .order("achieved_at", { ascending: true })
    .returns<RmAchievement[]>();

  return rmAchievementMessage(data ?? []);
}

export async function historyRmAchievementMessage(historyId: number) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workout_post_achievements")
    .select(SELECT)
    .eq("history_id", historyId)
    .order("rm_number", { ascending: true })
    .returns<RmAchievement[]>();

  return rmAchievementMessage(data ?? []);
}
