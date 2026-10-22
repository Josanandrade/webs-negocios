import Link from "next/link";
import { divisionLabel, formatKg, formatLoadWeights, formatScore, hasDivision, safeTextDetail } from "@/lib/scores";
import { DAY_NAMES, isoDayOfWeek, shortDate } from "@/lib/dates";
import type { BuilderSection, HistoryEntry, Score } from "@/lib/types";

type HistoryDisplayEntry = HistoryEntry & { builder_sections?: BuilderSection[] | null };

type SavedStrengthResult = {
  version?: number;
  sections?: Array<{
    section_id?: string;
    exercises?: Array<{ item_id?: string; weights?: unknown[] }>;
    completed_item_ids?: string[];
  }>;
};

function fold(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function unifiedStrengthLines(detail: string, builder: BuilderSection[] | null | undefined): string[] | null {
  if (!detail) return null;
  try {
    const parsed = JSON.parse(detail) as SavedStrengthResult;
    if ((parsed?.version !== 2 && parsed?.version !== 3) || !Array.isArray(parsed.sections)) return null;
    const builderSections = builder ?? [];
    const lines: string[] = [];
    for (const savedSection of parsed.sections) {
      const section = savedSection.section_id ? builderSections.find((candidate) => candidate.id === savedSection.section_id) : null;
      const label = section?.label || "Bloque";
      const exercises = Array.isArray(savedSection.exercises) ? savedSection.exercises : [];
      exercises.forEach((exercise, index) => {
        const weights = Array.isArray(exercise.weights) ? exercise.weights.map(Number).filter((kg) => Number.isFinite(kg) && kg > 0) : [];
        if (!weights.length) return;
        const exerciseLabel = exercises.length > 1 ? ` · Ejercicio ${index + 1}` : "";
        lines.push(`${label}${exerciseLabel}: ${weights.map((kg) => `${formatKg(kg)} kg`).join(" / ")}`);
      });
      for (const itemId of savedSection.completed_item_ids ?? []) {
        const item = section?.items.find((candidate) => (candidate.type === "exercise" || candidate.type === "complex") && candidate.id === itemId);
        const kind = item?.type === "complex" ? "Complex" : "Movimiento";
        lines.push(`${label} · ${kind}: ✓ Hecho`);
      }
    }
    return lines.length ? lines : null;
  } catch {
    return null;
  }
}

export function HistoryList({ entries, q, action, emptyText }: { entries: HistoryDisplayEntry[]; q: string; action: string; emptyText: string }) {
  const term = fold(q.trim());
  const list = term ? entries.filter((e) => fold(`${e.title}\n${e.content}\n${e.note}`).includes(term)) : entries;
  const days = [...new Set(list.map((e) => e.date))];

  return (
    <>
      <form action={action} role="search" className="mt-6 flex gap-2">
        <label htmlFor="q" className="sr-only">Buscar en el historial</label>
        <input id="q" name="q" type="search" defaultValue={q} placeholder="Buscar: squat, clean, Fran…" className="field min-w-0 flex-1" />
        <button type="submit" className="btn-secondary shrink-0">Buscar</button>
      </form>
      {term && <p className="mt-3 text-[15px] text-chalk-3">{list.length} {list.length === 1 ? "bloque" : "bloques"} con «{q.trim()}» · <Link href={action} className="press font-semibold text-chalk-2 hover:text-chalk">Ver todo</Link></p>}

      {list.length === 0 ? (
        <p className="mt-8 text-[17px] text-chalk-3">{term ? "No hay nada que coincida con la búsqueda." : emptyText}</p>
      ) : (
        <div className="mt-6 space-y-8">
          {days.map((date) => (
            <section key={date} aria-labelledby={`h-${date}`}>
              <h2 id={`h-${date}`} className="border-b-2 border-line-strong pb-2 font-display text-[20px] font-bold uppercase tracking-[0.04em]">{DAY_NAMES[isoDayOfWeek(date) - 1]} <span className="text-chalk-3">{shortDate(date)}</span></h2>
              <ul>{list.filter((e) => e.date === date).map((e) => <HistoryRow key={e.block_id} e={e} />)}</ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

function HistoryRow({ e }: { e: HistoryDisplayEntry }) {
  const hasResult = e.division != null;
  const score: Score = {
    seconds: e.seconds ?? null,
    capped: e.capped ?? false,
    rounds: e.rounds ?? null,
    reps: e.reps ?? null,
    kg: e.kg ?? null,
    total_load: e.total_load ?? null,
    as_prescribed: e.as_prescribed ?? null,
    reps_detail: e.reps_detail ?? "",
  };
  const strengthLines = e.score_type === "load" ? (unifiedStrengthLines(score.reps_detail, e.builder_sections) ?? formatLoadWeights(score.reps_detail)) : null;
  const safeFreeDetail = e.score_type !== "load" ? safeTextDetail(score.reps_detail) : null;

  return (
    <li className="border-b border-line py-3 last:border-b-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 truncate font-display text-[15px] font-bold uppercase tracking-[0.1em] text-lemon">{e.title || "Bloque"}</p>
        {!hasResult && <span className="shrink-0 font-display text-[13px] font-bold uppercase tracking-[0.08em] text-chalk-3">{e.done ? "✓ Hecho" : "Nota"}</span>}
      </div>
      {e.content && <p className="workout-text mt-1 line-clamp-3 text-[15px] leading-[1.45] text-chalk-3">{e.content}</p>}
      {hasResult && (
        <p className="mt-2"><span className="font-display text-[20px] font-bold">{formatScore(e.score_type, score)}</span>{hasDivision(e.score_type) && <span className="ml-2 text-[15px] text-chalk-3">{divisionLabel(e.division!)}</span>}</p>
      )}
      {strengthLines ? (
        <div className="mt-2 space-y-1 text-[15px] leading-[1.45]">{strengthLines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}</div>
      ) : safeFreeDetail ? (
        <p className="mt-1 whitespace-pre-wrap text-[16px] leading-[1.45]">{safeFreeDetail}</p>
      ) : null}
      {e.note && <p className="mt-2 whitespace-pre-wrap border-l-2 border-lemon pl-3 text-[16px] leading-[1.5]">{e.note}</p>}
    </li>
  );
}
