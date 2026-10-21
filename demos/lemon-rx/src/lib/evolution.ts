import "server-only";
import { createClient } from "@/lib/supabase/server";

export type EvolutionPeriod = {
  available: boolean;
  from: string | null;
  to: string | null;
  compliance: { programmed: number; completed: number; pct: number | null };
  wods: {
    scored: number;
    comparable: number;
    avg_position: number | null;
    avg_participants: number | null;
    avg_top_pct: number | null;
  };
  strength: {
    programmed_sessions: number;
    sessions: number;
    volume_sessions: number;
    total_load: number;
    peak_kg: number | null;
    rm_comparable_sessions: number;
    avg_peak_pct_rm: number | null;
    max_peak_pct_rm: number | null;
  };
  notes_count: number;
};

export type EvolutionRm = {
  movement_id: string;
  movement_name: string;
  current_rm: number;
  baseline_rm: number | null;
  change_kg: number | null;
  change_pct: number | null;
};

export type AthleteEvolution = {
  version: 1;
  weeks: number;
  as_of: string;
  current: EvolutionPeriod;
  previous: EvolutionPeriod;
  trends: {
    compliance_points: number | null;
    wod_position_improvement: number | null;
    wod_relative_improvement_points: number | null;
    strength_volume_pct: number | null;
  };
  rms: EvolutionRm[];
};

export type CoachEvolutionAthlete = {
  user_id: string;
  full_name: string;
  access_status: string;
  current: EvolutionPeriod;
  previous: EvolutionPeriod;
  trends: AthleteEvolution["trends"];
  rm_improvements: number;
};

export type CoachEvolution = {
  version: 1;
  weeks: number;
  as_of: string;
  summary: {
    athletes_with_data: number;
    avg_compliance_pct: number | null;
    athletes_improving_wods: number;
    athletes_improving_rm: number;
    completed_blocks?: number;
  };
  athletes: CoachEvolutionAthlete[];
};

export type EvolutionWindow = 4 | 8 | 12;
export type CoachEvolutionWindow = 1 | EvolutionWindow;

function n(value: unknown) {
  return value == null ? null : Number(value);
}

function normalizePeriod(value: EvolutionPeriod): EvolutionPeriod {
  return {
    ...value,
    available: Boolean(value?.available),
    compliance: {
      programmed: Number(value.compliance?.programmed ?? 0),
      completed: Number(value.compliance?.completed ?? 0),
      pct: n(value.compliance?.pct),
    },
    wods: {
      scored: Number(value.wods?.scored ?? 0),
      comparable: Number(value.wods?.comparable ?? 0),
      avg_position: n(value.wods?.avg_position),
      avg_participants: n(value.wods?.avg_participants),
      avg_top_pct: n(value.wods?.avg_top_pct),
    },
    strength: {
      programmed_sessions: Number(value.strength?.programmed_sessions ?? 0),
      sessions: Number(value.strength?.sessions ?? 0),
      volume_sessions: Number(value.strength?.volume_sessions ?? 0),
      total_load: Number(value.strength?.total_load ?? 0),
      peak_kg: n(value.strength?.peak_kg),
      rm_comparable_sessions: Number(value.strength?.rm_comparable_sessions ?? 0),
      avg_peak_pct_rm: n(value.strength?.avg_peak_pct_rm),
      max_peak_pct_rm: n(value.strength?.max_peak_pct_rm),
    },
    notes_count: Number(value.notes_count ?? 0),
  };
}

function normalizeTrends(value: AthleteEvolution["trends"]) {
  return {
    compliance_points: n(value?.compliance_points),
    wod_position_improvement: n(value?.wod_position_improvement),
    wod_relative_improvement_points: n(value?.wod_relative_improvement_points),
    strength_volume_pct: n(value?.strength_volume_pct),
  };
}

export async function getAthleteEvolution(userId: string, weeks: EvolutionWindow = 4): Promise<AthleteEvolution | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("athlete_evolution_metrics", { p_user_id: userId, p_weeks: weeks });
  if (error || !data) return null;
  const raw = data as AthleteEvolution;
  return {
    ...raw,
    current: normalizePeriod(raw.current),
    previous: normalizePeriod(raw.previous),
    trends: normalizeTrends(raw.trends),
    rms: Array.isArray(raw.rms) ? raw.rms.map((row) => ({
      ...row,
      current_rm: Number(row.current_rm),
      baseline_rm: n(row.baseline_rm),
      change_kg: n(row.change_kg),
      change_pct: n(row.change_pct),
    })) : [],
  };
}

export async function getCoachEvolution(weeks: CoachEvolutionWindow = 1): Promise<CoachEvolution | null> {
  const supabase = await createClient();
  const request = weeks === 1
    ? supabase.rpc("coach_current_week_metrics")
    : supabase.rpc("coach_evolution_metrics", { p_weeks: weeks });
  const { data, error } = await request;
  if (error || !data) return null;
  const raw = data as CoachEvolution;
  return {
    ...raw,
    summary: {
      athletes_with_data: Number(raw.summary?.athletes_with_data ?? 0),
      avg_compliance_pct: n(raw.summary?.avg_compliance_pct),
      athletes_improving_wods: Number(raw.summary?.athletes_improving_wods ?? 0),
      athletes_improving_rm: Number(raw.summary?.athletes_improving_rm ?? 0),
      completed_blocks: raw.summary?.completed_blocks == null ? undefined : Number(raw.summary.completed_blocks),
    },
    athletes: Array.isArray(raw.athletes) ? raw.athletes.map((row) => ({
      ...row,
      current: normalizePeriod(row.current),
      previous: normalizePeriod(row.previous),
      trends: normalizeTrends(row.trends),
      rm_improvements: Number(row.rm_improvements ?? 0),
    })) : [],
  };
}
