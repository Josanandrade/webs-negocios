export type Role = "admin" | "athlete";
export type PaymentStatus = "paid" | "pending";
export type AccessStatus = "pending" | "active" | "blocked";
export type WeekStatus = "draft" | "published";
export type ScoreType = "none" | "time" | "rounds_reps" | "reps" | "weight" | "intervals" | "load";
export type Division = "rx" | "intermediate";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  payment_status: PaymentStatus;
  access_status: AccessStatus;
  created_at: string;
};

export type Settings = {
  auto_block_unpaid: boolean;
  show_past_weeks: boolean;
};

export type StrengthSchemeRow = {
  sets: number;
  reps: number;
  percentage: number;
};

export type MovementRef = {
  id: string;
  name: string;
};

export type Block = {
  id: string;
  title: string;
  content: string;
  position: number;
  score_type: ScoreType;
  sets_count: number | null;
  reps_per_set: number | null;
  movement_id: string | null;
  strength_scheme: StrengthSchemeRow[] | null;
  movement?: MovementRef | null;
};

export type Day = {
  id: string;
  date: string;
  day_of_week: number;
  workout_blocks: Block[];
};

export type Week = {
  id: string;
  start_date: string;
  end_date: string;
  status: WeekStatus;
  published_at: string | null;
  updated_at: string;
};

export type WeekWithDays = Week & { days: Day[] };

/** Marca y nota de un atleta en un bloque. */
export type BlockLog = {
  block_id: string;
  done: boolean;
  note: string;
  updated_at: string;
};

/** Valores de un resultado. Qué campos se usan depende del score_type del bloque. */
export type Score = {
  seconds: number | null;
  capped: boolean;
  rounds: number | null;
  reps: number | null;
  kg: number | null;
  /** EMOM / intervalos: true si mantuvo todas las reps en todos los intervalos. */
  as_prescribed: boolean | null;
  /** EMOM: detalle libre. Fuerza: kilos por serie serializados. */
  reps_detail: string;
};

export type BlockResult = Score & {
  block_id: string;
  division: Division;
};

/** Una entrada del historial de un atleta: un bloque que marcó, comentó o puntuó. */
export type HistoryEntry = Partial<Score> & {
  block_id: string;
  date: string;
  title: string;
  content: string;
  score_type: ScoreType;
  done: boolean;
  note: string;
  division: Division | null;
};

export type LeaderboardRow = BlockResult & {
  user_id: string;
  full_name: string;
  position: number;
  total: number;
};
