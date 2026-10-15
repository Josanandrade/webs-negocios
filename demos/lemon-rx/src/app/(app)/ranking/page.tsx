import type { Metadata } from "next";
import Link from "next/link";
import { getViewer } from "@/lib/auth";
import { getAdjacentPublished, getPublishedWeek } from "@/lib/program";
import { getActivity, getRankingDayAthleteActivity, getWeekLeaderboard } from "@/lib/activity";
import { getMovements } from "@/lib/strength";
import { DIVISIONS, SCORE_TYPES, hasBoard, hasDivision } from "@/lib/scores";
import type { LeaderboardRow, RankingDayActivityRow, ScoreType, Sex } from "@/lib/types";
import { DAY_NAMES, isIsoDate, mondayOf, shortDate, todayIso, weekDates, weekRangeShort } from "@/lib/dates";
import { NoAccess } from "@/components/no-access";
import { RankingRows } from "@/components/ranking-rows";
import { ResultButton } from "@/components/block-tracker";

export const metadata: Metadata = { title: "Ranking" };

type RankingFilter = "all" | Sex;

const FILTERS: { value: RankingFilter; label: string; heading: string }[] = [
  { value: "all", label: "General", heading: "Clasificación general" },
  { value: "male", label: "Masculina", heading: "Clasificación masculina" },
  { value: "female", label: "Femenina", heading: "Clasificación femenina" },
];

/** Clasificaciones del día con vista general por defecto y detalle desplegable por atleta. */
export default async function RankingPage({ searchParams }: PageProps<"/ranking">) {
  const sp = await searchParams;
  const today = todayIso();
  const requested = isIsoDate(sp.dia) ? sp.dia : today;
  const start = mondayOf(requested);
  const filter = parseRankingFilter(sp.genero);

  const [viewer, week, adjacent] = await Promise.all([getViewer(), getPublishedWeek(start), getAdjacentPublished(start)]);
  if (!viewer.canViewProgram) {
    return <NoAccess name={viewer.profile.full_name.split(" ")[0]} pending={viewer.profile.access_status === "pending"} />;
  }
  const allOn = (date: string) => week?.days.find((d) => d.date === date)?.workout_blocks ?? [];
  const scoredOn = (date: string) => allOn(date).filter((b) => hasBoard(b.score_type));

  let day = requested;
  if (!isIsoDate(sp.dia) && scoredOn(day).length === 0) {
    const days = weekDates(start).filter((d) => scoredOn(d).length > 0);
    day = days.filter((d) => d <= today).at(-1) ?? days[0] ?? day;
  }

  const me = viewer.profile.id;
  const blocks = scoredOn(day);
  const dayBlocks = allOn(day);
  const ids = blocks.map((b) => b.id);
  const [board, activity, dayActivity, movements] = await Promise.all([
    getWeekLeaderboard(week?.id ?? null),
    getActivity(me, ids),
    getRankingDayAthleteActivity(week?.id ?? null, day),
    getMovements(),
  ]);
  const detailsByUser = groupActivity(dayActivity);
  const movementNames = Object.fromEntries(movements.map((movement) => [movement.id, movement.name]));
  const dates = weekDates(start);
  const label = (t: string) => SCORE_TYPES.find((s) => s.value === t)?.label ?? "";
  const activeFilter = FILTERS.find((f) => f.value === filter) ?? FILTERS[0];

  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 md:px-6 md:pt-10">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Ranking · {weekRangeShort(start)}</p>
          <h1 className="mt-1 font-display text-[40px] font-extrabold uppercase leading-[0.9] sm:text-[52px]">
            {DAY_NAMES[dates.indexOf(day)]} <span className="text-chalk-3">{shortDate(day)}</span>
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
          const has = scoredOn(date).length > 0;
          return (
            <Link
              key={date}
              href={rankingHref(date, filter)}
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

      <nav aria-label="Filtrar clasificación por género" className="mt-6 grid grid-cols-3 overflow-hidden rounded-sm border border-line-strong">
        {FILTERS.map((option) => {
          const active = option.value === filter;
          return (
            <Link
              key={option.value}
              href={rankingHref(day, option.value)}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={`press flex min-h-12 items-center justify-center px-2 text-center font-display text-[14px] font-bold uppercase tracking-[0.05em] sm:text-[15px] ${
                active ? "bg-lemon text-ink" : "border-l border-line first:border-l-0 text-chalk-3 hover:text-chalk"
              }`}
            >
              {option.label}
            </Link>
          );
        })}
      </nav>
      <p className="mt-2 text-[13px] text-chalk-3">{activeFilter.heading} · Pulsa en un atleta para ver su sesión completa.</p>

      {blocks.length === 0 ? (
        <p className="mt-8 text-[17px] text-chalk-3">
          {week ? "Este día no hay ningún bloque con ranking." : "No hay programación publicada esta semana."}
        </p>
      ) : (
        <div className="mt-8 space-y-10">
          {blocks.map((b) => {
            const rows = board[b.id] ?? [];
            const visibleRows = filter === "all" ? rows : rows.filter((r) => r.sex === filter);
            const divided = hasDivision(b.score_type);
            const rankingProps = { dayBlocks, detailsByUser, movementNames };
            return (
              <section key={b.id} aria-labelledby={`r-${b.id}`}>
                <h2 id={`r-${b.id}`} className="font-display text-[22px] font-bold uppercase tracking-[0.06em] text-lemon">
                  {b.title || "Bloque"}
                </h2>
                <p className="text-[14px] text-chalk-3">{label(b.score_type)}</p>
                {b.content && <p className="workout-text mt-2 line-clamp-4 text-[16px] leading-[1.5] text-chalk-2">{b.content}</p>}

                {b.score_type !== "load" ? (
                  <div className="mt-4">
                    <ResultButton block={{ ...b, log: activity.logs[b.id] ?? null, result: activity.results[b.id] ?? null, board: rows }} />
                  </div>
                ) : (
                  <p className="mt-3 text-[13px] text-chalk-3">El peso se registra y edita desde la programación del día. El ranking usa los kilos totales movidos.</p>
                )}

                {divided ? (
                  <div className="mt-5 grid gap-6 md:grid-cols-2">
                    {DIVISIONS.map((d) => {
                      const list = rerankRows(visibleRows.filter((r) => r.division === d.value), b.score_type);
                      return (
                        <div key={d.value}>
                          <h3 className="flex items-baseline justify-between border-b-2 border-line-strong pb-2 font-display text-[17px] font-bold uppercase tracking-[0.06em]">
                            {d.label}
                            <span className="text-[14px] font-semibold text-chalk-3">{list.length} {list.length === 1 ? "atleta" : "atletas"}</span>
                          </h3>
                          {list.length === 0 ? <p className="py-3 text-[15px] text-chalk-3">Sin resultados todavía.</p> : <RankingRows rows={list} type={b.score_type} meId={me} {...rankingProps} />}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-5">
                    {(() => {
                      const list = rerankRows(visibleRows, b.score_type);
                      return (
                        <>
                          <div className="flex items-baseline justify-between border-b-2 border-line-strong pb-2">
                            <h3 className="font-display text-[17px] font-bold uppercase tracking-[0.06em]">{activeFilter.heading}</h3>
                            <span className="text-[14px] font-semibold text-chalk-3">{list.length} {list.length === 1 ? "atleta" : "atletas"}</span>
                          </div>
                          {list.length === 0 ? <p className="py-3 text-[15px] text-chalk-3">Sin resultados todavía.</p> : <RankingRows rows={list} type={b.score_type} meId={me} {...rankingProps} />}
                        </>
                      );
                    })()}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <p className="mt-10">
        <Link href={`/?semana=${start}`} className="press inline-flex h-11 items-center text-[15px] font-semibold text-chalk-2 hover:text-chalk">
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

function parseRankingFilter(value: string | string[] | undefined): RankingFilter {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "male" || candidate === "female" ? candidate : "all";
}

function rankingHref(day: string, filter: RankingFilter) {
  const params = new URLSearchParams({ dia: day });
  if (filter !== "all") params.set("genero", filter);
  return `/ranking?${params.toString()}`;
}

function scoreSortKey(type: ScoreType, row: LeaderboardRow) {
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
    .map((row) => ({ row, key: scoreSortKey(type, row) }))
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

function WeekLink({ to, label, dir, filter }: { to: string | null; label: string; dir: "left" | "right"; filter: RankingFilter }) {
  const icon = (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square" />
    </svg>
  );
  if (!to) return <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-sm border border-line text-chalk-3/40">{icon}</span>;
  return <Link href={rankingHref(to, filter)} aria-label={label} scroll={false} className="press flex h-12 w-12 items-center justify-center rounded-sm border border-line-strong text-chalk">{icon}</Link>;
}
