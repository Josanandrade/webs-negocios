import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BlockLog, BlockResult, BuilderSection, HistoryEntry, LeaderboardRow, RankingDayActivityRow } from "@/lib/types";

export type Activity = {
  logs: Record<string, BlockLog>;
  results: Record<string, BlockResult>;
};

export type HistoryEntryV2 = HistoryEntry & { builder_sections: BuilderSection[] | null };

const EMPTY: Activity = { logs: {}, results: {} };

export async function getActivity(userId: string, blockIds: string[]): Promise<Activity> {
  if (blockIds.length === 0) return EMPTY;
  const supabase = await createClient();
  const [logs, results] = await Promise.all([
    supabase.from("block_logs").select("block_id, done, note, updated_at").eq("user_id", userId).in("block_id", blockIds).returns<BlockLog[]>(),
    supabase.from("block_results").select("block_id, division, seconds, capped, rounds, reps, kg, total_load, as_prescribed, reps_detail").eq("user_id", userId).in("block_id", blockIds).returns<BlockResult[]>(),
  ]);
  return {
    logs: Object.fromEntries((logs.data ?? []).map((l) => [l.block_id, l])),
    results: Object.fromEntries((results.data ?? []).map((r) => [r.block_id, { ...r, kg: r.kg == null ? null : Number(r.kg), total_load: r.total_load == null ? null : Number(r.total_load) }])),
  };
}

function leaderboardByBlock(data: LeaderboardRow[] | null | undefined): Record<string, LeaderboardRow[]> {
  const byBlock: Record<string, LeaderboardRow[]> = {};
  for (const row of data ?? []) {
    (byBlock[row.block_id] ??= []).push({
      ...row,
      kg: row.kg == null ? null : Number(row.kg),
      total_load: row.total_load == null ? null : Number(row.total_load),
      position: Number(row.position),
      total: Number(row.total),
    });
  }
  return byBlock;
}

export async function getWeekLeaderboard(weekId: string | null): Promise<Record<string, LeaderboardRow[]>> {
  if (!weekId) return {};
  const supabase = await createClient();
  const { data } = await supabase.rpc("week_leaderboard_v2", { p_week_id: weekId });
  return leaderboardByBlock((data ?? []) as LeaderboardRow[]);
}

export async function getDayLeaderboard(weekId: string | null, date: string): Promise<Record<string, LeaderboardRow[]>> {
  if (!weekId) return {};
  const supabase = await createClient();
  const { data } = await supabase.rpc("day_leaderboard_v2", { p_week_id: weekId, p_date: date });
  return leaderboardByBlock((data ?? []) as LeaderboardRow[]);
}

export async function getRankingDayAthleteActivity(weekId: string | null, date: string): Promise<RankingDayActivityRow[]> {
  if (!weekId) return [];
  const supabase = await createClient();
  const { data } = await supabase.rpc("ranking_day_athlete_activity", { p_week_id: weekId, p_date: date });
  return ((data ?? []) as RankingDayActivityRow[]).map((row) => ({ ...row, block_position: Number(row.block_position), kg: row.kg == null ? null : Number(row.kg), total_load: row.total_load == null ? null : Number(row.total_load) }));
}

export type RecentNote = { user_id: string; block_id: string; note: string; updated_at: string; full_name: string; block_title: string; date: string | null };
type RecentNoteRow = { user_id: string; block_id: string; note: string; updated_at: string; profiles: { full_name: string } | null; workout_blocks: { title: string; days: { date: string } | null } | null };

export async function getRecentNotes(limit = 6): Promise<RecentNote[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("block_logs").select("user_id, block_id, note, updated_at, profiles(full_name), workout_blocks(title, days(date))").neq("note", "").order("updated_at", { ascending: false }).limit(limit).returns<RecentNoteRow[]>();
  return (data ?? []).map(toRecentNote);
}

function toRecentNote(r: RecentNoteRow): RecentNote {
  return { user_id: r.user_id, block_id: r.block_id, note: r.note, updated_at: r.updated_at, full_name: r.profiles?.full_name || "Sin nombre", block_title: r.workout_blocks?.title || "Bloque", date: r.workout_blocks?.days?.date ?? null };
}

export async function getUserNotes(userId: string, limit = 30): Promise<RecentNote[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("block_logs").select("user_id, block_id, note, updated_at, profiles(full_name), workout_blocks(title, days(date))").eq("user_id", userId).neq("note", "").order("updated_at", { ascending: false }).limit(limit).returns<RecentNoteRow[]>();
  return (data ?? []).map(toRecentNote);
}

export async function getHistory(userId: string): Promise<HistoryEntryV2[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("training_history_v2", { p_user_id: userId });
  return ((data ?? []) as HistoryEntryV2[]).map((r) => ({
    ...r,
    kg: r.kg == null ? null : Number(r.kg),
    total_load: r.total_load == null ? null : Number(r.total_load),
    builder_sections: Array.isArray(r.builder_sections) ? r.builder_sections : null,
  }));
}
