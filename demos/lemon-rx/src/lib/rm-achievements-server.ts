import "server-only";
import { createClient } from "@/lib/supabase/server";
import { rmAchievementMessage, type RmAchievement } from "@/lib/rm-achievements";

const SELECT = "id, movement_name, rm_number, kg, previous_kg";

type BlockAchievement = RmAchievement & { source_block_id: string | null; achieved_at: string };

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

export async function recentBlockRmCelebration(userId: string) {
  const supabase = await createClient();
  const since = new Date(Date.now() - 20_000).toISOString();
  const { data } = await supabase
    .from("workout_post_achievements")
    .select(`${SELECT}, source_block_id, achieved_at`)
    .eq("user_id", userId)
    .eq("source", "block_result")
    .gte("achieved_at", since)
    .order("achieved_at", { ascending: false })
    .limit(8)
    .returns<BlockAchievement[]>();

  const rows = data ?? [];
  const latest = rows[0];
  if (!latest?.source_block_id) return null;
  const sameSave = rows
    .filter((row) => row.source_block_id === latest.source_block_id)
    .sort((a, b) => a.rm_number - b.rm_number);
  const message = rmAchievementMessage(sameSave);
  return message ? { id: latest.id, message } : null;
}
