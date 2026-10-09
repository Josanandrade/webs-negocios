// Tipos de la API (espejo de los modelos de FastAPI).

export interface Job {
  id: string;
  document_id: string | null;
  kind: "ingest" | "generate" | "extract_facts";
  status: "pending" | "running" | "succeeded" | "failed" | "cancelled";
  stage: string;
  progress_current: number;
  progress_total: number;
  message: string | null;
  attempts: number;
  max_attempts: number;
  last_error: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  checkpoint: Record<string, unknown>;
}

export interface DocumentInfo {
  id: string;
  title: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  status: "uploaded" | "processing" | "ready" | "error";
  page_count: number | null;
  text_layer: "native" | "partial" | "scanned" | null;
  stats: Record<string, unknown>;
  error: string | null;
  created_at: string;
  question_count: number;
  latest_job: Job | null;
}

export interface Section {
  id: string;
  parent_id: string | null;
  level: number;
  ordinal: number;
  title: string;
  start_page: number;
  end_page: number;
  source: string;
  chunks: number;
  eligible_chunks: number;
  children: Section[];
}

export interface PageSummary {
  page_number: number;
  extraction_method: "native" | "ocr";
  ocr_confidence: number | null;
  quality_score: number;
  is_eligible: boolean;
  quality_flags: string[];
  char_count: number;
}

export interface SectionCoverage {
  section_id: string | null;
  title: string;
  start_page: number | null;
  end_page: number | null;
  questions: number;
  facts: number;
  facts_unused: number;
  eligible_chunks: number;
}

export interface Coverage {
  total_questions: number;
  sections: SectionCoverage[];
  correct_label_distribution: Record<string, number>;
  correct_is_longest_ratio: number | null;
  low_coverage_sections: string[];
}

export interface CandidateSummary {
  by_status: Record<string, number>;
  top_reasons: [string, number][];
}

export type Difficulty = "easy" | "medium" | "hard";
export type QuestionStatus = "generated" | "auto_validated" | "manually_reviewed" | "discarded";

export interface Option {
  label: string;
  text: string;
  is_correct: boolean;
}

export interface Source {
  role: "answer" | "distractor" | "context";
  option_label: string | null;
  page_number: number;
  quote: string;
  char_start: number | null;
  char_end: number | null;
  context_before: string | null;
  context_after: string | null;
}

export interface Question {
  id: string;
  seq: number;
  document_id: string;
  document_title: string;
  section_id: string | null;
  section_title: string | null;
  stem: string;
  question_type: string;
  difficulty: Difficulty;
  status: QuestionStatus;
  explanation: string | null;
  confidence: number | null;
  tags: string[];
  created_at: string;
  reviewed_at: string | null;
  edited_at: string | null;
  options: Option[];
  sources: Source[] | null;
  generation: Record<string, unknown> | null;
  history: { at: string; changes: Record<string, unknown> }[] | null;
}

export interface Page<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface QuizQuestion {
  ordinal: number;
  question_id: string | null;
  stem: string;
  options: { label: string; text: string }[];
  difficulty: Difficulty;
  document_title: string;
  section_title: string | null;
  top_section_title: string | null;
  selected_label: string | null;
  answered: boolean;
  revealed: boolean;
  is_correct: boolean | null;
  correct_label: string | null;
  explanation: string | null;
  source_page: number | null;
  source_quote: string | null;
}

export interface QuizSummary {
  id: string;
  title: string;
  mode: "practice" | "exam";
  status: "in_progress" | "finished" | "abandoned";
  penalty: number;
  total: number;
  answered: number;
  correct: number | null;
  wrong: number | null;
  blank: number | null;
  net: number | null;
  score: number | null;
  time_limit_seconds: number | null;
  expires_at: string | null;
  remaining_seconds: number | null;
  started_at: string;
  finished_at: string | null;
  source_quiz_id: string | null;
  config: Record<string, unknown>;
}

export interface Quiz extends QuizSummary {
  questions: QuizQuestion[];
}

export interface QuizCreate {
  title?: string;
  document_ids?: string[];
  section_ids?: string[];
  difficulties?: Difficulty[];
  tags?: string[];
  only_reviewed?: boolean;
  selection: "random" | "unseen" | "failed" | "weak";
  count: number;
  mode: "practice" | "exam";
  penalty: number;
  time_limit_minutes?: number;
  shuffle_options?: boolean;
}

export interface Breakdown {
  key: string | null;
  title: string | null;
  answered: number;
  correct: number;
  wrong: number;
  blank: number;
  accuracy: number | null;
}

export interface Stats {
  quizzes_finished: number;
  quizzes_in_progress: number;
  totals: Breakdown;
  average_score: number | null;
  best_score: number | null;
  scores: { quiz_id: string; title: string; mode: string; finished_at: string; total: number; score: number }[];
  by_topic: Breakdown[];
  by_difficulty: Breakdown[];
  most_failed: {
    question_id: string | null;
    stem: string;
    top_section_title: string | null;
    attempts: number;
    wrong: number;
    last_result: "correct" | "wrong" | "blank";
  }[];
  coverage: { active_questions: number; seen: number; unseen: number; mastered: number; to_review: number };
}

export interface Me {
  id: string;
  email: string;
  display_name: string | null;
}
