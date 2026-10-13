import { Avatar } from "@/components/avatar";
import { formatScore, isRanked } from "@/lib/scores";
import type { LeaderboardRow, ScoreType } from "@/lib/types";

export function ordinal(n: number) {
  return `${n}º`;
}

/** Filas de una clasificación. Resalta al usuario actual y muestra su foto de perfil. */
export function RankingRows({ rows, type, meId }: { rows: LeaderboardRow[]; type: ScoreType; meId: string }) {
  if (!isRanked(type)) {
    return (
      <ul>
        {rows.map((r) => {
          const me = r.user_id === meId;
          return (
            <li key={r.user_id} className="border-b border-line py-2.5 last:border-b-0">
              <div className="flex items-center gap-3">
                <Avatar url={r.avatar_url} name={r.full_name} size="md" />
                <span className={`min-w-0 flex-1 truncate text-[16px] font-semibold ${me ? "text-lemon" : ""}`}>
                  {r.full_name}
                  {me && <span className="ml-1.5 font-normal text-chalk-3">(tú)</span>}
                </span>
                <span
                  className={`shrink-0 font-display text-[14px] font-bold uppercase tracking-[0.06em] ${
                    r.as_prescribed ? "text-lemon" : "text-chalk-2"
                  }`}
                >
                  {r.as_prescribed ? "✓ " : ""}
                  {formatScore(type, r)}
                </span>
              </div>
              {!r.as_prescribed && r.reps_detail && (
                <p className="mt-1 pl-12 whitespace-pre-wrap text-[15px] leading-[1.45] text-chalk-3">{r.reps_detail}</p>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ol>
      {rows.map((r) => {
        const me = r.user_id === meId;
        return (
          <li key={r.user_id} className={`flex items-center gap-3 border-b border-line py-2.5 last:border-b-0 ${me ? "text-lemon" : ""}`}>
            <span className="w-9 shrink-0 font-display text-[18px] font-bold">{ordinal(r.position)}</span>
            <Avatar url={r.avatar_url} name={r.full_name} size="md" />
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
