export type Role = "admin" | "athlete";
export type PaymentStatus = "paid" | "pending";
export type AccessStatus = "pending" | "active" | "blocked";
export type WeekStatus = "draft" | "published";
export type ScoreType = "none" | "time" | "rounds_reps" | "reps" | "weight" | "intervals" | "load";
export type Division = "rx" | "intermediate";
export type Sex = "male" | "female";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  payment_status: PaymentStatus;
  access_status: AccessStatus;
  sex: Sex | null;
  phone: string | null;
  avatar_url: string | null;
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

export type ComplexMovementRow = {
  movement_id: string;
  reps: number;
};

export type BuilderExerciseItem = {
  id: string;
  type: "exercise";
  movement_id: string;
  reps: number;
  instruction: string;
  /** Si es true, el atleta informa de los kg y este ejercicio suma al volumen total. */
  track_load: boolean;
};

export type BuilderRestItem = {
  id: string;
  type: "rest";
  /** Texto libre: 30\", 90\", 2 min, 2–3 min, etc. Nunca se rellena por defecto. */
  duration: string;
};

export type BuilderNoteItem = {
  id: string;
  type: "note";
  text: string;
};

export type BuilderItem = BuilderExerciseItem | BuilderRestItem | BuilderNoteItem;

export type BuilderSection = {
  id: string;
  label: string;
  count_type: "sets" | "rounds";
  count_min: number;
  count_max: number;
  items: BuilderItem[];
};

export type BuilderExerciseView = BuilderExerciseItem & { movement_name: string };
export type BuilderItemView = BuilderExerciseView | BuilderRestItem | BuilderNoteItem;
export type BuilderSectionView = Omit<BuilderSection, "items"> & { items: BuilderItemView[] };

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
  is_complex: boolean;
  complex_movements: ComplexMovementRow[] | null;
  rm_reference_movement_id: string | null;
  is_emom: boolean;
  emom_reps: number | null;
  emom_interval_seconds: number | null;
  emom_rounds: number | null;
  emom_percentage: number | null;
  /** Constructor libre. Null significa que el bloque usa el modelo clásico. */
  builder_sections: BuilderSection[] | null;
  movement?: MovementRef | null;
  rm_reference_movement?: MovementRef | null;
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
  /** Carga total movida en un bloque de fuerza: suma de kg × reps de todas las series/rondas. */
  total_load: number | null;
  as_prescribed: boolean | null;
  reps_detail: string;
};

export type BlockResult = Score & {
  block_id: string;
  division: Division;
};

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
  avatar_url: string | null;
  sex: Sex;
  position: number;
  total: number;
};
