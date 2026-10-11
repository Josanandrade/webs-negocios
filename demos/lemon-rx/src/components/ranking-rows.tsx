import { formatScore } from "@/lib/scores";
import type { LeaderboardRow, ScoreType } from "@/lib/types";

export function ordinal(n: number) {
  return `${n}º`;
}

/** Filas de una clasificación (una categoría de un bloque). Resalta al usuario actual. */
export function RankingRows({ rows, type, meId }: { rows: LeaderboardRow[]; type: ScoreType; meId: string }) {
  return (
    <ol>
      {rows.map((r) => {
        const me = r.user_id === meId;
        return (
          <li key={r.user_id} className={`flex items-baseline gap-3 border-b border-line py-2.5 last:border-b-0 ${me ? "text-lemon" : ""}`}>
            <span className="w-9 shrink-0 font-display text-[18px] font-bold">{ordinal(r.position)}</span>
            <span className="min-w-0 flex-1 truncate text-[16px] font-semibold">
              {r.full_name}
              {me && <span className="ml-1.5 font-normal text-chalk-3">(tú)</span>}
            </span>
            <span className="shrink-0 font-display text-[18px] font-bold">{formatScore(type, r)}</span>
          </li>
        );
      })}
    </ol>
  );
}
