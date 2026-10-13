import type { Metadata } from "next";
import Link from "next/link";
import { getViewer } from "@/lib/auth";
import { getAdjacentPublished, getPublishedWeek } from "@/lib/program";
import { getActivity, getWeekLeaderboard } from "@/lib/activity";
import { getMovements, getUserRm1Map } from "@/lib/strength";
import { DAY_NAMES, currentWeekStart, isIsoDate, mondayOf, shortDate, todayIso, weekDates, weekRangeShort } from "@/lib/dates";
import { NoAccess } from "@/components/no-access";
import { WeekDays, type DayView } from "@/components/day-accordion";

export const metadata: Metadata = { title: "Programación" };

export default async function ProgramPage({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const thisWeek = currentWeekStart();
  const start = isIsoDate(sp.semana) ? mondayOf(sp.semana) : thisWeek;
  const [viewer, week, adjacent] = await Promise.all([getViewer(), getPublishedWeek(start), getAdjacentPublished(start)]);
  if (!viewer.canViewProgram) return <NoAccess name={viewer.profile.full_name.split(" ")[0]} pending={viewer.profile.access_status === "pending"} />;

  const today = todayIso();
  const me = viewer.profile.id;
  const blocks = week?.days.flatMap((d) => d.workout_blocks) ?? [];
  const blockIds = blocks.map((b) => b.id);
  const rmMovementIds = blocks.filter((b) => b.score_type === "load").map((b) => b.is_complex ? b.rm_reference_movement_id : b.movement_id).filter((id): id is string => Boolean(id));
  const [activity, board, rm1Map, movements] = await Promise.all([getActivity(me, blockIds), getWeekLeaderboard(week?.id ?? null), getUserRm1Map(me, rmMovementIds), getMovements()]);
  const movementMap = Object.fromEntries(movements.map((m) => [m.id, m.name]));

  const days: DayView[] = weekDates(start).map((date, i) => {
    const day = week?.days.find((d) => d.date === date);
    return {
      date,
      name: DAY_NAMES[i],
      short: shortDate(date),
      isToday: date === today,
      blocks: (day?.workout_blocks ?? []).filter((b) => b.title.trim() || b.content.trim() || b.score_type === "load").map((b) => {
        const rmId = b.is_complex ? b.rm_reference_movement_id : b.movement_id;
        const rm1 = rmId ? rm1Map[rmId] : undefined;
        const suggestedSets = !b.is_emom && rm1 && b.strength_scheme?.length
          ? b.strength_scheme.flatMap((row) => Array.from({ length: row.sets }, () => ({ reps: b.is_complex ? 1 : row.reps, percentage: row.percentage, kg: Math.round((rm1 * row.percentage / 100) * 100) / 100 })))
          : [];
        const suggestedEmomKg = b.is_emom && rm1 && b.emom_percentage ? Math.round((rm1 * b.emom_percentage / 100) * 100) / 100 : undefined;
        const complexMovementDetails = b.is_complex ? (b.complex_movements ?? []).map((row) => ({ ...row, name: movementMap[row.movement_id] ?? "Movimiento" })) : [];
        return { ...b, suggestedSets, suggestedEmomKg, complexMovementDetails, log: activity.logs[b.id] ?? null, result: activity.results[b.id] ?? null, board: board[b.id] ?? [] };
      }),
    };
  });

  const label = start === thisWeek ? "Esta semana" : start < thisWeek ? "Semana anterior" : "Próxima semana";
  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-6 md:px-6 md:pt-10">
      <div className="flex items-end justify-between gap-3"><div><p className="eyebrow">{label}</p><h1 className="mt-1 font-display text-[44px] font-extrabold uppercase leading-[0.9] tracking-[0.005em] sm:text-[56px]"><span className="sr-only">Semana del </span>{weekRangeShort(start)}</h1></div><WeekPager prev={adjacent.prev} next={adjacent.next} /></div>
      <div className="mt-8" key={start}>{week ? <div className="enter"><WeekDays days={days} meId={me} /></div> : <EmptyWeek isCurrent={start === thisWeek} latest={adjacent.prev} />}</div>
      {start !== thisWeek && <p className="mt-8"><Link href="/" className="press inline-flex h-11 items-center text-[15px] font-semibold text-chalk-2 hover:text-chalk">Ir a la semana actual</Link></p>}
    </main>
  );
}

function WeekPager({ prev, next }: { prev: string | null; next: string | null }) {
  const base = "press flex h-12 w-12 items-center justify-center rounded-sm border border-line-strong text-chalk";
  const off = "flex h-12 w-12 items-center justify-center rounded-sm border border-line text-chalk-3/40";
  return <nav aria-label="Cambiar de semana" className="flex shrink-0 gap-2 pb-1">{prev ? <Link href={`/?semana=${prev}`} className={base} aria-label="Semana anterior" scroll={false}><Arrow dir="left" /></Link> : <span className={off} aria-hidden><Arrow dir="left" /></span>}{next ? <Link href={`/?semana=${next}`} className={base} aria-label="Semana siguiente" scroll={false}><Arrow dir="right" /></Link> : <span className={off} aria-hidden><Arrow dir="right" /></span>}</nav>;
}
function Arrow({ dir }: { dir: "left" | "right" }) { return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden><path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square" /></svg>; }
function EmptyWeek({ isCurrent, latest }: { isCurrent: boolean; latest: string | null }) { return <div className="border-t border-line pt-8"><p className="font-display text-[26px] font-bold uppercase leading-tight">{isCurrent ? "La programación de esta semana aún no está publicada" : "No hay programación para esta semana"}</p><p className="mt-3 text-[17px] text-chalk-2">Vuelve a mirar en un rato.</p>{latest && <Link href={`/?semana=${latest}`} className="btn-secondary mt-8">Ver la última semana publicada</Link>}</div>; }