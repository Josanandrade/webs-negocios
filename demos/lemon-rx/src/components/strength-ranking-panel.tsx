"use client";

import { useState } from "react";
import { RankingRows } from "@/components/ranking-rows";
import type { LeaderboardRow } from "@/lib/types";

export function StrengthRankingPanel({ rows, meId }: { rows: LeaderboardRow[]; meId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="-mt-5 rounded-sm border border-line bg-ink-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="day-trigger flex h-12 w-full items-center justify-between px-4 text-left text-[15px] font-semibold text-chalk-2"
      >
        <span>
          Clasificación del día
          <span className="ml-2 text-chalk-3">{rows.length}</span>
        </span>
        <span aria-hidden className="text-chalk-3">{open ? "Ocultar" : "Ver"}</span>
      </button>
      {open && (
        <div className="enter border-t border-line px-4 pb-4">
          {rows.length === 0 ? (
            <p className="py-3 text-[15px] text-chalk-3">Sin resultados todavía.</p>
          ) : (
            <RankingRows rows={rows} type="load" meId={meId} />
          )}
        </div>
      )}
    </div>
  );
}
