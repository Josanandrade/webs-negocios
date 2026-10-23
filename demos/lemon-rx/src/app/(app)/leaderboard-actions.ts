"use server";

import { getDayLeaderboard } from "@/lib/activity";
import { getViewer } from "@/lib/auth";
import { isIsoDate } from "@/lib/dates";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function loadDayLeaderboard(weekId: string | null, date: string) {
  if (!weekId || !UUID.test(weekId) || !isIsoDate(date)) return {};
  const viewer = await getViewer();
  if (!viewer.canViewProgram) return {};
  return getDayLeaderboard(weekId, date);
}
