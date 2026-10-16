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
  show_evolution_as_athlete: boolean;
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
  track_load: boolean;
  percentage_min: number | null;
  percentage_max: number | null;
  scheme?: StrengthSchemeRow[] | null;
};

export type BuilderComplexItem = {
  id: string;
  type: "complex";
  movements: ComplexMovementRow[];
  rm_reference_movement_id: string | null;
  instruction: string;
  track_load: boolean;
  percentage_min: number | null;
  percentage_max: number | null;
  scheme?: StrengthSchemeRow[] | null;
};

export type BuilderRestItem = {
  id: string;
  type: "rest";
  duration: string;
};

export type BuilderNoteItem = {
  id: string;
  type: "note";
  text: string;
};

export type BuilderItem = BuilderExerciseItem | BuilderComplexItem | BuilderRestItem | BuilderNoteItem;
export type BuilderSectionFormat = "sets" | "rounds" | "emom" | "free";

export type BuilderSection = {
  id: string;
  label: string;
  count_type: "sets" | "rounds";
  count_min: number;
  count_max: number;
  format?: BuilderSectionFormat;
  emom_interval_seconds?: number | null;
  items: BuilderItem[];
};

export type BuilderSchemeTargetRow = StrengthSchemeRow & { kg: number | null };

export type BuilderExerciseView = BuilderExerciseItem & {
  movement_name: string;
  rm_1: number | null;
  suggested_kg_min: number | null;
  suggested_kg_max: number | null;
  scheme_targets?: BuilderSchemeTargetRow[];
};

export type BuilderComplexView = BuilderComplexItem & {
  movement_details: Array<ComplexMovementRow & { name: string }>;
  rm_reference_name: string | null;
  rm_1: number | null;
  suggested_kg_min: number | null;
  suggested_kg_max: number | null;
  scheme_targets?: BuilderSchemeTargetRow[];
};

export type BuilderItemView = BuilderExerciseView | BuilderComplexView | BuilderRestItem | BuilderNoteItem;
export type BuilderSectionView = Omit<BuilderSection, "items"> & { items: BuilderItemView[] };

export type MovementRef = { id: string; name: string };

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
  builder_sections: BuilderSection[] | null;
  movement?: MovementRef | null;
  rm_reference_movement?: MovementRef | null;
};

export type Day = { id: string; date: string; day_of_week: number; workout_blocks: Block[] };
export type Week = { id: string; start_date: string; end_date: string; status: WeekStatus; published_at: string | null; updated_at: string };
export type WeekWithDays = Week & { days: Day[] };

export type BlockLog = { block_id: string; done: boolean; note: string; updated_at: string };

export type Score = {
  seconds: number | null;
  capped: boolean;
  rounds: number | null;
  reps: number | null;
  kg: number | null;
  total_load: number | null;
  as_prescribed: boolean | null;
  reps_detail: string;
};

export type BlockResult = Score & { block_id: string; division: Division };

export type HistoryEntry = Partial<Score> & {
  block_id: string;
  date: string;
  title: string;
  content: string;
  score_type: ScoreType;
  done: boolean;
  note: string;
  division: Division | null;
  builder_sections?: BuilderSection[] | null;
};

export type LeaderboardRow = BlockResult & {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  sex: Sex;
  position: number;
  total: number;
};

export type RankingDayActivityRow = {
  user_id: string;
  block_id: string;
  block_title: string;
  block_content: string;
  block_position: number;
  score_type: ScoreType;
  builder_sections: BuilderSection[] | null;
  done: boolean;
  note: string;
  has_result: boolean;
  division: Division | null;
  seconds: number | null;
  capped: boolean | null;
  rounds: number | null;
  reps: number | null;
  kg: number | null;
  total_load: number | null;
  as_prescribed: boolean | null;
  reps_detail: string | null;
};
