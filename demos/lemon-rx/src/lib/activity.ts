import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BlockLog, BlockResult, HistoryEntry, LeaderboardRow } from "@/lib/types";

export type Activity = {
  logs: Record<string, BlockLog>;
  results: Record<string, BlockResult>;
};

const EMPTY: Activity = { logs: {}, results: {} };

/**
 * Marcas, notas y resultados de un usuario en unos bloques concretos.
 * La RLS solo deja leer los propios, salvo a los admins.
 */
export async function getActivity(userId: string, blockIds: string[]): Promise<Activity> {
  if (blockIds.length === 0) return EMPTY;
  const supabase = await createClient();
  const [logs, results] = await Promise.all([
    supabase
      .from("block_logs")
      .select("block_id, done, note, updated_at")
      .eq("user_id", userId)
      .in("block_id", blockIds)
      .returns<BlockLog[]>(),
    supabase
      .from("block_results")
      .select("block_id, division, seconds, capped, rounds, reps, kg, as_prescribed, reps_detail")
      .eq("user_id", userId)
      .in("block_id", blockIds)
      .returns<BlockResult[]>(),
  ]);
  return {
    logs: Object.fromEntries((logs.data ?? []).map((l) => [l.block_id, l])),
    results: Object.fromEntries((results.data ?? []).map((r) => [r.block_id, { ...r, kg: r.kg == null ? null : Number(r.kg) }])),
  };
}

/** Ranking de todos los bloques puntuables de una semana, agrupado por bloque. */
export async function getWeekLeaderboard(weekId: string | null): Promise<Record<string, LeaderboardRow[]>> {
  if (!weekId) return {};
  const supabase = await createClient();
  const { data } = await supabase.rpc("week_leaderboard", { p_week_id: weekId });
  const byBlock: Record<string, LeaderboardRow[]> = {};
  for (const row of (data ?? []) as LeaderboardRow[]) {
    (byBlock[row.block_id] ??= []).push({
      ...row,
      kg: row.kg == null ? null : Number(row.kg),
      position: Number(row.position),
      total: Number(row.total),
    });
  }
  return byBlock;
}

export type RecentNote = {
  user_id: string;
  block_id: string;
  note: string;
  updated_at: string;
  full_name: string;
  block_title: string;
  date: string | null;
};

type RecentNoteRow = {
  user_id: string;
  block_id: string;
  note: string;
  updated_at: string;
  profiles: { full_name: string } | null;
  workout_blocks: { title: string; days: { date: string } | null } | null;
};

/** Últimas notas de los atletas (solo admins: la RLS no devuelve notas ajenas a nadie más). */
export async function getRecentNotes(limit = 6): Promise<RecentNote[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("block_logs")
    .select("user_id, block_id, note, updated_at, profiles(full_name), workout_blocks(title, days(date))")
    .neq("note", "")
    .order("updated_at", { ascending: false })
    .limit(limit)
    .returns<RecentNoteRow[]>();
  return (data ?? []).map(toRecentNote);
}

function toRecentNote(r: RecentNoteRow): RecentNote {
  return {
    user_id: r.user_id,
    block_id: r.block_id,
    note: r.note,
    updated_at: r.updated_at,
    full_name: r.profiles?.full_name || "Sin nombre",
    block_title: r.workout_blocks?.title || "Bloque",
    date: r.workout_blocks?.days?.date ?? null,
  };
}

/** Notas de un atleta, las más recientes primero (para la ficha de admin). */
export async function getUserNotes(userId: string, limit = 30): Promise<RecentNote[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("block_logs")
    .select("user_id, block_id, note, updated_at, profiles(full_name), workout_blocks(title, days(date))")
    .eq("user_id", userId)
    .neq("note", "")
    .order("updated_at", { ascending: false })
    .limit(limit)
    .returns<RecentNoteRow[]>();
  return (data ?? []).map(toRecentNote);
}

/**
 * Historial de un atleta: cada bloque que ha marcado, comentado o puntuado, el
 * más reciente primero. Incluye semanas que ya no se ven en la programación.
 * Solo funciona para uno mismo o para un admin (lo comprueba la función SQL).
 */
export async function getHistory(userId: string): Promise<HistoryEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("training_history", { p_user_id: userId });
  return ((data ?? []) as HistoryEntry[]).map((r) => ({ ...r, kg: r.kg == null ? null : Number(r.kg) }));
}
