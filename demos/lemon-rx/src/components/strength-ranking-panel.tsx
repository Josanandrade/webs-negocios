"use client";

import { useState } from "react";
import { RankingRows } from "@/components/ranking-rows";
import { SEXES } from "@/lib/scores";
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
        <div className="enter space-y-5 border-t border-line px-4 pb-4 pt-3">
          {SEXES.map((sex) => {
            const list = rows.filter((row) => row.sex === sex.value);
            return (
              <div key={sex.value}>
                <h4 className="border-b border-line pb-2 font-display text-[16px] font-bold uppercase tracking-[0.08em] text-lemon">
                  {sex.label}
                </h4>
                {list.length === 0 ? (
                  <p className="py-3 text-[15px] text-chalk-3">Sin resultados todavía.</p>
                ) : (
                  <RankingRows rows={list} type="load" meId={meId} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
