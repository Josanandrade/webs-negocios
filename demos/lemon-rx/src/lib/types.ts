export type Role = "admin" | "athlete";
export type PaymentStatus = "paid" | "pending";
export type AccessStatus = "pending" | "active" | "blocked";
export type WeekStatus = "draft" | "published";
export type ScoreType = "none" | "time" | "rounds_reps" | "reps" | "weight" | "intervals";
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

export type Block = {
  id: string;
  title: string;
  content: string;
  position: number;
  score_type: ScoreType;
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
  /** EMOM / intervalos adaptado: reps por ronda, escritas libremente. */
  reps_detail: string;
};

export type BlockResult = Score & {
  block_id: string;
  division: Division;
};

export type LeaderboardRow = BlockResult & {
  user_id: string;
  full_name: string;
  position: number;
  total: number;
};
