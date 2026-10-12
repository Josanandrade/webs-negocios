import type { Division, Score, ScoreType } from "@/lib/types";

// Tipos de resultado que el admin puede asignar a un bloque. El orden es el del selector.
export const SCORE_TYPES: { value: ScoreType; label: string; hint: string }[] = [
  { value: "none", label: "Sin ranking", hint: "Los atletas solo lo marcan como hecho" },
  { value: "time", label: "Por tiempo", hint: "Menos tiempo, mejor. Con time cap cuentan las reps" },
  { value: "rounds_reps", label: "AMRAP (rondas + reps)", hint: "Más rondas y reps, mejor" },
  { value: "reps", label: "Reps o calorías", hint: "Más, mejor" },
  { value: "weight", label: "Peso (kg)", hint: "Más kilos, mejor" },
  {
    value: "intervals",
    label: "EMOM / intervalos",
    hint: "Sin posiciones: lista de quién lo hizo como estaba programado y quién lo adaptó",
  },
  { value: "load", label: "Fuerza: apuntar pesos", hint: "Sin ranking: cada atleta apunta sus kilos y quedan en su historial" },
];

/** Tipos con clasificación por posiciones (el resto, como EMOM, es una lista). */
export function isRanked(type: ScoreType) {
  return type !== "none" && type !== "intervals" && type !== "load";
}

/** Tipos cuyos resultados ven los demás (clasificación o lista). Los pesos de fuerza son personales. */
export function hasBoard(type: ScoreType) {
  return type !== "none" && type !== "load";
}

/** Si el atleta elige RX o Intermedio (en fuerza no aplica). */
export function hasDivision(type: ScoreType) {
  return type !== "load";
}

export const SCORE_TYPE_VALUES = SCORE_TYPES.map((t) => t.value);

export const DIVISIONS: { value: Division; label: string }[] = [
  { value: "rx", label: "RX" },
  { value: "intermediate", label: "Intermedio" },
];

export function divisionLabel(d: Division) {
  return d === "rx" ? "RX" : "Intermedio";
}

/** Texto corto del resultado: "8:05", "CAP · 145 reps", "5 + 12", "150 reps", "102,5 kg". */
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
      return s.kg != null ? `${String(Number(s.kg)).replace(".", ",")} kg` : "—";
    case "intervals":
      return s.as_prescribed ? "Como estaba programado" : "Adaptado";
    case "load":
      return s.kg != null ? `${String(Number(s.kg)).replace(".", ",")} kg` : "Pesos apuntados";
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

/** Valores del formulario de resultado, tal cual los escribe el atleta. */
export type ScoreDraft = {
  min: string;
  sec: string;
  capped: boolean;
  rounds: string;
  reps: string;
  kg: string;
  /** EMOM: "yes" si mantuvo todas las reps, "no" si tuvo que adaptar. */
  prescribed: "" | "yes" | "no";
  detail: string;
};

export function emptyDraft(s?: Score | null): ScoreDraft {
  return {
    min: s?.seconds != null ? String(Math.floor(s.seconds / 60)) : "",
    sec: s?.seconds != null ? String(s.seconds % 60) : "",
    capped: s?.capped ?? false,
    rounds: s?.rounds != null ? String(s.rounds) : "",
    reps: s?.reps != null ? String(s.reps) : "",
    kg: s?.kg != null ? String(Number(s.kg)).replace(".", ",") : "",
    prescribed: s?.as_prescribed == null ? "" : s.as_prescribed ? "yes" : "no",
    detail: s?.reps_detail ?? "",
  };
}

function int(v: string) {
  const t = v.trim();
  if (!/^\d+$/.test(t)) return null;
  return Number(t);
}

/**
 * Convierte el borrador en un resultado válido para el tipo de bloque, o
 * devuelve el mensaje de error que verá el atleta. Se usa en el navegador y
 * otra vez en el servidor (nunca se confía en lo que llega del cliente).
 */
export function parseScore(type: ScoreType, d: ScoreDraft): { ok: true; score: Score } | { ok: false; error: string } {
  const empty: Score = { seconds: null, capped: false, rounds: null, reps: null, kg: null, as_prescribed: null, reps_detail: "" };
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
      const t = d.kg.trim().replace(",", ".");
      if (!/^\d+(\.\d{1,2})?$/.test(t)) return { ok: false, error: "Escribe los kilos (por ejemplo 102,5)." };
      const kg = Number(t);
      if (kg <= 0 || kg >= 10000) return { ok: false, error: "Escribe los kilos (por ejemplo 102,5)." };
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
      const t = d.kg.trim().replace(",", ".");
      const detail = d.detail.trim();
      if (!t && !detail) return { ok: false, error: "Apunta el peso máximo o tus series." };
      if (detail.length > 500) return { ok: false, error: "Las series son demasiado largas (máximo 500 caracteres)." };
      let kg: number | null = null;
      if (t) {
        if (!/^\d+(\.\d{1,2})?$/.test(t) || Number(t) <= 0 || Number(t) >= 10000)
          return { ok: false, error: "Escribe los kilos (por ejemplo 102,5)." };
        kg = Number(t);
      }
      return { ok: true, score: { ...empty, kg, reps_detail: detail } };
    }
    default:
      return { ok: false, error: "Este bloque no tiene ranking." };
  }
}
