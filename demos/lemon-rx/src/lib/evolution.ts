import "server-only";
import { createClient } from "@/lib/supabase/server";

export type EvolutionPeriod = {
  available: boolean;
  from: string | null;
  to: string | null;
  compliance: {
    programmed: number;
    completed: number;
    pct: number | null;
  };
  wods: {
    scored: number;
    comparable: number;
    avg_top_pct: number | null;
  };
  strength: {
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
    wod_relative_improvement_points: number | null;
    strength_volume_pct: number | null;
  };
  rms: EvolutionRm[];
};

export type EvolutionWindow = 4 | 8 | 12;

function n(value: unknown) {
  return value == null ? null : Number(value);
}

function normalizePeriod(value: EvolutionPeriod): EvolutionPeriod {
  return {
    ...value,
    compliance: {
      programmed: Number(value.compliance?.programmed ?? 0),
      completed: Number(value.compliance?.completed ?? 0),
      pct: n(value.compliance?.pct),
    },
    wods: {
      scored: Number(value.wods?.scored ?? 0),
      comparable: Number(value.wods?.comparable ?? 0),
      avg_top_pct: n(value.wods?.avg_top_pct),
    },
    strength: {
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

export async function getAthleteEvolution(userId: string, weeks: EvolutionWindow = 4): Promise<AthleteEvolution | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("athlete_evolution_metrics", {
    p_user_id: userId,
    p_weeks: weeks,
  });
  if (error || !data) return null;

  const raw = data as AthleteEvolution;
  return {
    ...raw,
    current: normalizePeriod(raw.current),
    previous: normalizePeriod(raw.previous),
    trends: {
      compliance_points: n(raw.trends?.compliance_points),
      wod_relative_improvement_points: n(raw.trends?.wod_relative_improvement_points),
      strength_volume_pct: n(raw.trends?.strength_volume_pct),
    },
    rms: Array.isArray(raw.rms) ? raw.rms.map((row) => ({
      ...row,
      current_rm: Number(row.current_rm),
      baseline_rm: n(row.baseline_rm),
      change_kg: n(row.change_kg),
      change_pct: n(row.change_pct),
    })) : [],
  };
}
