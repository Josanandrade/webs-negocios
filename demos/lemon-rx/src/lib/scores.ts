import type { Division, Score, ScoreType } from "@/lib/types";

// Tipos de resultado que el admin puede asignar a un bloque. El orden es el del selector.
export const SCORE_TYPES: { value: ScoreType; label: string; hint: string }[] = [
  { value: "none", label: "Sin ranking", hint: "Los atletas solo lo marcan como hecho" },
  { value: "time", label: "Por tiempo", hint: "Menos tiempo, mejor. Con time cap cuentan las reps" },
  { value: "rounds_reps", label: "AMRAP (rondas + reps)", hint: "Más rondas y reps, mejor" },
  { value: "reps", label: "Reps o calorías", hint: "Más, mejor" },
  { value: "weight", label: "Peso (kg)", hint: "Más kilos, mejor" },
];

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
};

export function emptyDraft(s?: Score | null): ScoreDraft {
  return {
    min: s?.seconds != null ? String(Math.floor(s.seconds / 60)) : "",
    sec: s?.seconds != null ? String(s.seconds % 60) : "",
    capped: s?.capped ?? false,
    rounds: s?.rounds != null ? String(s.rounds) : "",
    reps: s?.reps != null ? String(s.reps) : "",
    kg: s?.kg != null ? String(Number(s.kg)).replace(".", ",") : "",
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
  const empty: Score = { seconds: null, capped: false, rounds: null, reps: null, kg: null };
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
    default:
      return { ok: false, error: "Este bloque no tiene ranking." };
  }
}
