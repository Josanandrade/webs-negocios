import type { Metadata } from "next";
import Link from "next/link";
import { getViewer } from "@/lib/auth";
import { getAdjacentPublished, getPublishedWeek } from "@/lib/program";
import { getActivity, getWeekLeaderboard } from "@/lib/activity";
import { DIVISIONS, SCORE_TYPES } from "@/lib/scores";
import { DAY_NAMES, isIsoDate, mondayOf, shortDate, todayIso, weekDates, weekRangeShort } from "@/lib/dates";
import { NoAccess } from "@/components/no-access";
import { RankingRows } from "@/components/ranking-rows";
import { ResultButton } from "@/components/block-tracker";

export const metadata: Metadata = { title: "Ranking" };

/** Clasificaciones del día: una por cada bloque con ranking, separadas en RX e Intermedio. */
export default async function RankingPage({ searchParams }: PageProps<"/ranking">) {
  const sp = await searchParams;
  const today = todayIso();
  const requested = isIsoDate(sp.dia) ? sp.dia : today;
  const start = mondayOf(requested);

  const [viewer, week, adjacent] = await Promise.all([getViewer(), getPublishedWeek(start), getAdjacentPublished(start)]);
  if (!viewer.canViewProgram) {
    return <NoAccess name={viewer.profile.full_name.split(" ")[0]} pending={viewer.profile.access_status === "pending"} />;
  }
  const scoredOn = (date: string) =>
    week?.days.find((d) => d.date === date)?.workout_blocks.filter((b) => b.score_type !== "none") ?? [];

  // Sin día elegido y hoy sin WOD con ranking: el último día de la semana que sí lo tenga.
  let day = requested;
  if (!isIsoDate(sp.dia) && scoredOn(day).length === 0) {
    const days = weekDates(start).filter((d) => scoredOn(d).length > 0);
    day = days.filter((d) => d <= today).at(-1) ?? days[0] ?? day;
  }

  const me = viewer.profile.id;
  const ids = scoredOn(day).map((b) => b.id);
  const [board, activity] = await Promise.all([getWeekLeaderboard(week?.id ?? null), getActivity(me, ids)]);
  const blocks = scoredOn(day);
  const dates = weekDates(start);
  const label = (t: string) => SCORE_TYPES.find((s) => s.value === t)?.label ?? "";

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
          <WeekLink to={adjacent.prev} label="Semana anterior" dir="left" />
          <WeekLink to={adjacent.next} label="Semana siguiente" dir="right" />
        </nav>
      </div>

      <nav aria-label="Días de la semana" className="mt-6 grid grid-cols-7 border-b border-line">
        {dates.map((date, i) => {
          const active = date === day;
          const has = scoredOn(date).length > 0;
          return (
            <Link
              key={date}
              href={`/ranking?dia=${date}`}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={`press relative flex h-16 flex-col items-center justify-center gap-0.5 ${
                active ? "text-chalk" : has ? "text-chalk-2 hover:text-chalk" : "text-chalk-3/60"
              }`}
            >
              <span className="font-display text-[15px] font-bold uppercase tracking-[0.06em]">{DAY_NAMES[i].slice(0, 2)}</span>
              <span className="font-display text-[20px] font-semibold leading-none">{Number(date.slice(8))}</span>
              <span
                aria-hidden
                className={`absolute right-1/2 top-2 h-1.5 w-1.5 translate-x-[1.1rem] rounded-full ${has ? "bg-lemon" : "bg-transparent"}`}
              />
              <span className="sr-only">{has ? ", con ranking" : ", sin ranking"}</span>
              {active && <span aria-hidden className="absolute inset-x-1 -bottom-px h-[3px] bg-lemon" />}
            </Link>
          );
        })}
      </nav>

      {blocks.length === 0 ? (
        <p className="mt-8 text-[17px] text-chalk-3">
          {week ? "Este día no hay ningún WOD con ranking." : "No hay programación publicada esta semana."}
        </p>
      ) : (
        <div className="mt-8 space-y-10">
          {blocks.map((b) => {
            const rows = board[b.id] ?? [];
            return (
              <section key={b.id} aria-labelledby={`r-${b.id}`}>
                <h2 id={`r-${b.id}`} className="font-display text-[22px] font-bold uppercase tracking-[0.06em] text-lemon">
                  {b.title || "Bloque"}
                </h2>
                <p className="text-[14px] text-chalk-3">{label(b.score_type)}</p>
                {b.content && (
                  <p className="workout-text mt-2 line-clamp-4 text-[16px] leading-[1.5] text-chalk-2">{b.content}</p>
                )}
                <div className="mt-4">
                  <ResultButton
                    block={{ ...b, log: activity.logs[b.id] ?? null, result: activity.results[b.id] ?? null, board: rows }}
                  />
                </div>
                <div className="mt-4 grid gap-6 md:grid-cols-2">
                  {DIVISIONS.map((d) => {
                    const list = rows.filter((r) => r.division === d.value);
                    return (
                      <div key={d.value}>
                        <h3 className="flex items-baseline justify-between border-b-2 border-line-strong pb-2 font-display text-[17px] font-bold uppercase tracking-[0.06em]">
                          {d.label}
                          <span className="text-[14px] font-semibold text-chalk-3">
                            {list.length} {list.length === 1 ? "atleta" : "atletas"}
                          </span>
                        </h3>
                        {list.length === 0 ? (
                          <p className="py-3 text-[15px] text-chalk-3">Sin resultados todavía.</p>
                        ) : (
                          <RankingRows rows={list} type={b.score_type} meId={me} />
                        )}
                      </div>
                    );
                  })}
                </div>
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

function WeekLink({ to, label, dir }: { to: string | null; label: string; dir: "left" | "right" }) {
  const icon = (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square" />
    </svg>
  );
  if (!to)
    return (
      <span aria-hidden className="flex h-12 w-12 items-center justify-center rounded-sm border border-line text-chalk-3/40">
        {icon}
      </span>
    );
  return (
    <Link href={`/ranking?dia=${to}`} aria-label={label} scroll={false} className="press flex h-12 w-12 items-center justify-center rounded-sm border border-line-strong text-chalk">
      {icon}
    </Link>
  );
}
