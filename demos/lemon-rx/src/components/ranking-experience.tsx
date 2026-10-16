"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RankingRows } from "@/components/ranking-rows";
import { ResultButton } from "@/components/block-tracker";
import { DIVISIONS, SCORE_TYPES, hasDivision } from "@/lib/scores";
import type { Block, BlockLog, BlockResult, LeaderboardRow, RankingDayActivityRow, ScoreType, Sex } from "@/lib/types";
import { DAY_NAMES, shortDate, weekRangeShort } from "@/lib/dates";

type RankingFilter = "all" | Sex;

type Activity = {
  logs: Record<string, BlockLog>;
  results: Record<string, BlockResult>;
};

type Props = {
  start: string;
  day: string;
  dates: string[];
  dayHasRanking: Record<string, boolean>;
  adjacent: { prev: string | null; next: string | null };
  meId: string;
  blocks: Block[];
  dayBlocks: Block[];
  board: Record<string, LeaderboardRow[]>;
  activity: Activity;
  dayActivity: RankingDayActivityRow[];
  movementNames: Record<string, string>;
  weekExists: boolean;
  initialFilter: RankingFilter;
};

const FILTERS: { value: RankingFilter; label: string; heading: string }[] = [
  { value: "all", label: "General", heading: "Clasificación general" },
  { value: "male", label: "Masculina", heading: "Clasificación masculina" },
  { value: "female", label: "Femenina", heading: "Clasificación femenina" },
];

export function RankingExperience({
  start,
  day,
  dates,
  dayHasRanking,
  adjacent,
  meId,
  blocks,
  dayBlocks,
  board,
  activity,
  dayActivity,
  movementNames,
  weekExists,
  initialFilter,
}: Props) {
  const [filter, setFilter] = useState<RankingFilter>(initialFilter);

  useEffect(() => {
    setFilter(initialFilter);
  }, [day, initialFilter]);

  const detailsByUser = groupActivity(dayActivity);
  const activeFilter = FILTERS.find((candidate) => candidate.value === filter) ?? FILTERS[0];
  const dayIndex = Math.max(0, dates.indexOf(day));

  function chooseFilter(next: RankingFilter) {
    if (next === filter) return;
    setFilter(next);
    window.history.replaceState(window.history.state, "", rankingHref(day, next));
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 md:px-6 md:pt-10">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Ranking · {weekRangeShort(start)}</p>
          <h1 className="mt-1 font-display text-[40px] font-extrabold uppercase leading-[0.9] sm:text-[52px]">
            {DAY_NAMES[dayIndex]} <span className="text-chalk-3">{shortDate(day)}</span>
          </h1>
        </div>
        <nav aria-label="Cambiar de semana" className="flex shrink-0 gap-2 pb-1">
          <WeekLink to={adjacent.prev} label="Semana anterior" dir="left" filter={filter} />
          <WeekLink to={adjacent.next} label="Semana siguiente" dir="right" filter={filter} />
        </nav>
      </div>

      <nav aria-label="Días de la semana" className="mt-6 grid grid-cols-7 border-b border-line">
        {dates.map((date, i) => {
          const active = date === day;
          const has = Boolean(dayHasRanking[date]);
          return (
            <Link
              key={date}
              href={rankingHref(date, filter)}
              prefetch={false}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={`press relative flex h-16 flex-col items-center justify-center gap-0.5 ${
                active ? "text-chalk" : has ? "text-chalk-2 hover:text-chalk" : "text-chalk-3/60"
              }`}
            >
              <span className="font-display text-[15px] font-bold uppercase tracking-[0.06em]">{DAY_NAMES[i].slice(0, 2)}</span>
              <span className="font-display text-[20px] font-semibold leading-none">{Number(date.slice(8))}</span>
              <span aria-hidden className={`absolute right-1/2 top-2 h-1.5 w-1.5 translate-x-[1.1rem] rounded-full ${has ? "bg-lemon" : "bg-transparent"}`} />
              <span className="sr-only">{has ? ", con ranking" : ", sin ranking"}</span>
              {active && <span aria-hidden className="absolute inset-x-1 -bottom-px h-[3px] bg-lemon" />}
            </Link>
          );
        })}
      </nav>

      <div role="tablist" aria-label="Filtrar clasificación por género" className="mt-6 grid grid-cols-3 overflow-hidden rounded-sm border border-line-strong">
        {FILTERS.map((option) => {
          const active = option.value === filter;
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => chooseFilter(option.value)}
              className={`press flex min-h-12 items-center justify-center px-2 text-center font-display text-[14px] font-bold uppercase tracking-[0.05em] sm:text-[15px] ${
                active ? "bg-lemon text-ink" : "border-l border-line first:border-l-0 text-chalk-3 hover:text-chalk"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[13px] text-chalk-3">{activeFilter.heading} · Pulsa en un atleta para ver su sesión completa.</p>

      {blocks.length === 0 ? (
        <p className="mt-8 text-[17px] text-chalk-3">
          {weekExists ? "Este día no hay ningún bloque con ranking." : "No hay programación publicada esta semana."}
        </p>
      ) : (
        <div className="mt-8 space-y-10">
          {blocks.map((block) => {
            const rows = board[block.id] ?? [];
            const visibleRows = filter === "all" ? rows : rows.filter((row) => row.sex === filter);
            const divided = hasDivision(block.score_type);
            const rankingProps = { dayBlocks, detailsByUser, movementNames };
            const scoreLabel = SCORE_TYPES.find((score) => score.value === block.score_type)?.label ?? "";

            return (
              <section key={block.id} aria-labelledby={`r-${block.id}`}>
                <h2 id={`r-${block.id}`} className="font-display text-[22px] font-bold uppercase tracking-[0.06em] text-lemon">
                  {block.title || "Bloque"}
                </h2>
                <p className="text-[14px] text-chalk-3">{scoreLabel}</p>
                {block.content && <p className="workout-text mt-2 line-clamp-4 text-[16px] leading-[1.5] text-chalk-2">{block.content}</p>}

                {block.score_type !== "load" ? (
                  <div className="mt-4">
                    <ResultButton block={{ ...block, log: activity.logs[block.id] ?? null, result: activity.results[block.id] ?? null, board: rows }} />
                  </div>
                ) : (
                  <p className="mt-3 text-[13px] text-chalk-3">El peso se registra y edita desde la programación del día. El ranking usa los kilos totales movidos.</p>
                )}

                {divided ? (
                  <div className="mt-5 grid gap-6 md:grid-cols-2">
                    {DIVISIONS.map((division) => {
                      const list = rerankRows(visibleRows.filter((row) => row.division === division.value), block.score_type);
                      return (
                        <div key={division.value}>
                          <h3 className="flex items-baseline justify-between border-b-2 border-line-strong pb-2 font-display text-[17px] font-bold uppercase tracking-[0.06em]">
                            {division.label}
                            <span className="text-[14px] font-semibold text-chalk-3">{list.length} {list.length === 1 ? "atleta" : "atletas"}</span>
                          </h3>
                          {list.length === 0 ? <p className="py-3 text-[15px] text-chalk-3">Sin resultados todavía.</p> : <RankingRows rows={list} type={block.score_type} meId={meId} {...rankingProps} />}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-5">
                    <div className="flex items-baseline justify-between border-b-2 border-line-strong pb-2">
                      <h3 className="font-display text-[17px] font-bold uppercase tracking-[0.06em]">{activeFilter.heading}</h3>
                      <span className="text-[14px] font-semibold text-chalk-3">{visibleRows.length} {visibleRows.length === 1 ? "atleta" : "atletas"}</span>
                    </div>
                    {(() => {
                      const list = rerankRows(visibleRows, block.score_type);
                      return list.length === 0 ? <p className="py-3 text-[15px] text-chalk-3">Sin resultados todavía.</p> : <RankingRows rows={list} type={block.score_type} meId={meId} {...rankingProps} />;
                    })()}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <p className="mt-10">
        <Link href={`/?semana=${start}`} prefetch={false} className="press inline-flex h-11 items-center text-[15px] font-semibold text-chalk-2 hover:text-chalk">
          Ir a la programación de esta semana
        </Link>
      </p>
    </main>
  );
}

function groupActivity(rows: RankingDayActivityRow[]) {
  const grouped: Record<string, RankingDayActivityRow[]> = {};
  for (const row of rows) (grouped[row.user_id] ??= []).push(row);
  return grouped;
}

function parseScoreSortKey(type: ScoreType, row: LeaderboardRow) {
  switch (type) {
    case "time":
      if (!row.capped && row.seconds != null) return row.seconds;
      if (row.capped && row.reps != null) return 1_000_000 - row.reps;
      return Number.POSITIVE_INFINITY;
    case "rounds_reps":
      return row.rounds != null ? -(row.rounds * 1_000_000 + (row.reps ?? 0)) : Number.POSITIVE_INFINITY;
    case "reps":
      return row.reps != null ? -row.reps : Number.POSITIVE_INFINITY;
    case "weight":
      return row.kg != null ? -row.kg : Number.POSITIVE_INFINITY;
    case "load": {
      const load = row.total_load ?? row.kg;
      return load != null ? -load : Number.POSITIVE_INFINITY;
    }
    case "intervals":
      return row.as_prescribed == null ? Number.POSITIVE_INFINITY : row.as_prescribed ? 0 : 1;
    default:
      return Number.POSITIVE_INFINITY;
  }
}

function rerankRows(rows: LeaderboardRow[], type: ScoreType): LeaderboardRow[] {
  const sorted = rows
    .map((row) => ({ row, key: parseScoreSortKey(type, row) }))
    .filter((entry) => Number.isFinite(entry.key))
    .sort((a, b) => a.key - b.key || a.row.full_name.localeCompare(b.row.full_name, "es"));

  let position = 0;
  let previousKey: number | null = null;
  return sorted.map(({ row, key }, index) => {
    if (previousKey === null || key !== previousKey) position = index + 1;
    previousKey = key;
    return { ...row, position, total: sorted.length };
  });
}

function rankingHref(day: string, filter: RankingFilter) {
  const params = new URLSearchParams({ dia: day });
  if (filter !== "all") params.set("genero", filter);
  return `/ranking?${params.toString()}`;
}

function WeekLink({ to, label, dir, filter }: { to: string | null; label: string; dir: "left" | "right"; filter: RankingFilter }) {
  const icon = (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square" />
    </svg>
  );
  if (!to) return <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-sm border border-line text-chalk-3/40">{icon}</span>;
  return <Link href={rankingHref(to, filter)} prefetch={false} aria-label={label} scroll={false} className="press flex h-12 w-12 items-center justify-center rounded-sm border border-line-strong text-chalk">{icon}</Link>;
}
