import type { Division, Score, ScoreType, Sex } from "@/lib/types";

export const SCORE_TYPES: { value: ScoreType; label: string; hint: string }[] = [
  { value: "none", label: "Sin ranking", hint: "Los atletas solo lo marcan como hecho" },
  { value: "time", label: "Por tiempo", hint: "Menos tiempo, mejor. Con time cap cuentan las reps" },
  { value: "rounds_reps", label: "AMRAP (rondas + reps)", hint: "Más rondas y reps, mejor" },
  { value: "reps", label: "Reps o calorías", hint: "Más, mejor" },
  { value: "weight", label: "Peso (kg)", hint: "Más kilos, mejor" },
  { value: "intervals", label: "EMOM / intervalos", hint: "Sin posiciones: lista de quién lo hizo como estaba programado y quién lo adaptó" },
  { value: "load", label: "Fuerza / Weightlifting", hint: "Ranking por carga total movida. Sin RX/Intermedio" },
];

export function isRanked(type: ScoreType) {
  return type !== "none" && type !== "intervals";
}

export function hasBoard(type: ScoreType) {
  return type !== "none";
}

export function hasDivision(type: ScoreType) {
  return type !== "load";
}

export const SCORE_TYPE_VALUES = SCORE_TYPES.map((t) => t.value);

export const DIVISIONS: { value: Division; label: string }[] = [
  { value: "rx", label: "RX" },
  { value: "intermediate", label: "Intermedio" },
];

export const SEXES: { value: Sex; label: string }[] = [
  { value: "male", label: "Hombres" },
  { value: "female", label: "Mujeres" },
];

export function divisionLabel(d: Division) {
  return d === "rx" ? "RX" : "Intermedio";
}

export function sexLabel(s: Sex) {
  return s === "male" ? "Hombre" : "Mujer";
}

export function formatKg(value: number) {
  return Number(value).toLocaleString("es-ES", { maximumFractionDigits: 2 });
}

export function loadSetWeights(detail: string): number[] | null {
  if (!detail) return null;
  try {
    const parsed: unknown = JSON.parse(detail);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const values = parsed.map(Number);
    if (values.some((v) => !Number.isFinite(v) || v <= 0 || v >= 10000)) return null;
    return values;
  } catch {
    return null;
  }
}

export function formatLoadWeights(detail: string) {
  const values = loadSetWeights(detail);
  if (values) return values.map((kg, i) => `Serie ${i + 1}: ${formatKg(kg)} kg`);
  // Un JSON estructurado de fuerza debe ser interpretado por su vista específica,
  // nunca caer al fallback que imprime reps_detail como texto.
  if (detail.trim() && safeTextDetail(detail) == null) return [];
  return null;
}

/**
 * Devuelve detalle escrito por una persona, pero nunca estructuras JSON internas.
 * Esto actúa como última barrera para que reps_detail técnico no llegue a la UI.
 */
export function safeTextDetail(detail: string | null | undefined): string | null {
  const value = detail?.trim();
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (parsed !== null && typeof parsed === "object") return null;
  } catch {
    // No es JSON: puede mostrarse como texto introducido por el atleta.
  }
  return value;
}

export function formatScore(type: ScoreType, s: Score) {
  switch (type) {
    case "time":
      if (s.capped) return `CAP · ${s.reps ?? 0} reps`;
      return s.seconds != null ? formatSeconds(s.seconds) : "—";
    case "rounds_reps":
      return `${s.rounds ?? 0} + ${s.reps ?? 0}`;
    case "reps":
      return `${s.reps ?? 0} reps`;
    case "weight":
      return s.kg != null ? `${formatKg(s.kg)} kg` : "—";
    case "intervals":
      return s.as_prescribed ? "Como estaba programado" : "Adaptado";
    case "load": {
      const load = s.total_load ?? s.kg;
      return load != null ? `${formatKg(load)} kg` : "—";
    }
    default:
      return "";
  }
}

export function formatSeconds(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

export type ScoreDraft = {
  min: string;
  sec: string;
  capped: boolean;
  rounds: string;
  reps: string;
  kg: string;
  setKgs: string[];
  prescribed: "" | "yes" | "no";
  detail: string;
};

type ScoreInput = Omit<ScoreDraft, "setKgs"> & { setKgs?: string[] };

export function emptyDraft(s?: Score | null, setsCount?: number | null): ScoreDraft {
  const savedSets = loadSetWeights(s?.reps_detail ?? "");
  const count = setsCount && setsCount > 0 ? setsCount : savedSets?.length ?? 0;
  return {
    min: s?.seconds != null ? String(Math.floor(s.seconds / 60)) : "",
    sec: s?.seconds != null ? String(s.seconds % 60) : "",
    capped: s?.capped ?? false,
    rounds: s?.rounds != null ? String(s.rounds) : "",
    reps: s?.reps != null ? String(s.reps) : "",
    kg: s?.kg != null ? String(Number(s.kg)).replace(".", ",") : "",
    setKgs: Array.from({ length: count }, (_, i) => savedSets?.[i] != null ? formatKg(savedSets[i]) : ""),
    prescribed: s?.as_prescribed == null ? "" : s.as_prescribed ? "yes" : "no",
    detail: savedSets ? "" : safeTextDetail(s?.reps_detail) ?? "",
  };
}

function int(v: string) {
  const t = v.trim();
  if (!/^\d+$/.test(t)) return null;
  return Number(t);
}

function kilos(v: string) {
  const t = v.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;
  const kg = Number(t);
  return kg > 0 && kg < 10000 ? kg : null;
}

export function parseScore(
  type: ScoreType,
  d: ScoreInput,
  expectedSets?: number | null,
): { ok: true; score: Score } | { ok: false; error: string } {
  const empty: Score = {
    seconds: null,
    capped: false,
    rounds: null,
    reps: null,
    kg: null,
    total_load: null,
    as_prescribed: null,
    reps_detail: "",
  };
  switch (type) {
    case "time": {
      if (d.capped) {
        const reps = int(d.reps);
        if (reps == null || reps > 100000) return { ok: false, error: "Escribe cuántas reps hiciste." };
        return { ok: true, score: { ...empty, capped: true, reps } };
      }
      const min = d.min.trim() === "" ? 0 : int(d.min);
      const sec = d.sec.trim() === "" ? 0 : int(d.sec);
      if (min == null || sec == null || sec > 59) return { ok: false, error: "Escribe el tiempo en minutos y segundos (0–59)." };
      const seconds = min * 60 + sec;
      if (seconds < 1 || seconds > 86400) return { ok: false, error: "Escribe tu tiempo." };
      return { ok: true, score: { ...empty, seconds } };
    }
    case "rounds_reps": {
      const rounds = int(d.rounds);
      const reps = d.reps.trim() === "" ? 0 : int(d.reps);
      if (rounds == null || rounds > 10000) return { ok: false, error: "Escribe las rondas completas." };
      if (reps == null || reps > 100000) return { ok: false, error: "Las reps extra deben ser un número." };
      return { ok: true, score: { ...empty, rounds, reps } };
    }
    case "reps": {
      const reps = int(d.reps);
      if (reps == null || reps > 100000) return { ok: false, error: "Escribe cuántas reps o calorías hiciste." };
      return { ok: true, score: { ...empty, reps } };
    }
    case "weight": {
      const kg = kilos(d.kg);
      if (kg == null) return { ok: false, error: "Escribe los kilos (por ejemplo 102,5)." };
      return { ok: true, score: { ...empty, kg } };
    }
    case "intervals": {
      if (d.prescribed === "yes") return { ok: true, score: { ...empty, as_prescribed: true } };
      if (d.prescribed !== "no") return { ok: false, error: "Dinos si mantuviste todas las repeticiones en todos los intervalos." };
      const detail = d.detail.trim();
      if (!detail) return { ok: false, error: "Escribe cuántas repeticiones hiciste por ronda." };
      if (detail.length > 500) return { ok: false, error: "El detalle es demasiado largo (máximo 500 caracteres)." };
      return { ok: true, score: { ...empty, as_prescribed: false, reps_detail: detail } };
    }
    case "load": {
      if (expectedSets && expectedSets > 0) {
        const series = d.setKgs ?? [];
        if (series.length !== expectedSets) return { ok: false, error: "Faltan series o rondas por completar." };
        const values = series.map(kilos);
        const missing = values.findIndex((v) => v == null);
        if (missing >= 0) return { ok: false, error: `Escribe los kilos de la serie o ronda ${missing + 1}.` };
        const kgValues = values as number[];
        return { ok: true, score: { ...empty, kg: Math.max(...kgValues), reps_detail: JSON.stringify(kgValues) } };
      }
      const kg = d.kg.trim() ? kilos(d.kg) : null;
      const detail = d.detail.trim();
      if (d.kg.trim() && kg == null) return { ok: false, error: "Escribe los kilos (por ejemplo 102,5)." };
      if (detail.length > 500) return { ok: false, error: "Las series son demasiado largas (máximo 500 caracteres)." };
      if (kg == null && !detail) return { ok: false, error: "Apunta el peso utilizado." };
      return { ok: true, score: { ...empty, kg, reps_detail: detail } };
    }
    default:
      return { ok: false, error: "Este bloque no tiene ranking." };
  }
}
