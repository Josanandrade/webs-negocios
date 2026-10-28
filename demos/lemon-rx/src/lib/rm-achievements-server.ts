import "server-only";
import { createClient } from "@/lib/supabase/server";
import { rmAchievementMessage, type RmAchievement, type RmCelebration } from "@/lib/rm-achievements";

const SELECT = "id, movement_name, rm_number, kg, previous_kg";
type PendingAchievement = RmAchievement & {
  history_id: number;
  source_block_id: string | null;
  achieved_at: string;
};

function toCelebration(rows: RmAchievement[]): RmCelebration | null {
  const message = rmAchievementMessage(rows);
  if (!message || rows.length === 0) return null;
  return { id: rows[rows.length - 1].id, achievementIds: rows.map((row) => row.id), message };
}

export async function blockRmAchievementMessage(userId: string, blockId: string, since: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workout_post_achievements")
    .select(SELECT)
    .eq("user_id", userId)
    .eq("source_block_id", blockId)
    .not("post_id", "is", null)
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
    .not("post_id", "is", null)
    .order("rm_number", { ascending: true })
    .returns<RmAchievement[]>();

  return rmAchievementMessage(data ?? []);
}

export async function recentRmCelebration(userId: string): Promise<RmCelebration | null> {
  const supabase = await createClient();
  const since = new Date(Date.now() - 30_000).toISOString();
  const { data } = await supabase
    .from("workout_post_achievements")
    .select(`${SELECT}, history_id, source_block_id, achieved_at`)
    .eq("user_id", userId)
    .is("post_id", null)
    .gte("achieved_at", since)
    .order("achieved_at", { ascending: false })
    .limit(10)
    .returns<PendingAchievement[]>();

  const rows = data ?? [];
  const latest = rows[0];
  if (!latest) return null;
  const sameSave = rows
    .filter((row) => row.history_id === latest.history_id)
    .sort((a, b) => a.rm_number - b.rm_number);
  return toCelebration(sameSave);
}

export async function recentBlockRmCelebration(userId: string): Promise<RmCelebration | null> {
  const supabase = await createClient();
  const since = new Date(Date.now() - 20_000).toISOString();
  const { data } = await supabase
    .from("workout_post_achievements")
    .select(`${SELECT}, history_id, source_block_id, achieved_at`)
    .eq("user_id", userId)
    .eq("source", "block_result")
    .not("post_id", "is", null)
    .gte("achieved_at", since)
    .order("achieved_at", { ascending: false })
    .limit(8)
    .returns<PendingAchievement[]>();

  const rows = data ?? [];
  const latest = rows[0];
  if (!latest?.source_block_id) return null;
  const sameSave = rows
    .filter((row) => row.source_block_id === latest.source_block_id)
    .sort((a, b) => a.rm_number - b.rm_number);
  return toCelebration(sameSave);
}
