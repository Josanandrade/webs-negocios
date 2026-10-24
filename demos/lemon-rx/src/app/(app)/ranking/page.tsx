import type { Metadata } from "next";
import { getViewer } from "@/lib/auth";
import { getAdjacentPublished, getPublishedWeek } from "@/lib/program";
import { getActivity, getDayLeaderboard, getRankingDayAthleteActivity } from "@/lib/activity";
import { getMovementsByIds } from "@/lib/strength";
import { hasBoard } from "@/lib/scores";
import type { Sex } from "@/lib/types";
import { isIsoDate, mondayOf, todayIso, weekDates } from "@/lib/dates";
import { NoAccess } from "@/components/no-access";
import { RankingExperience } from "@/components/ranking-experience";

export const metadata: Metadata = { title: "Ranking" };

type RankingFilter = "all" | Sex;

/** Clasificaciones del día. Los filtros General/Masculina/Femenina funcionan en cliente sin nueva navegación. */
export default async function RankingPage({ searchParams }: PageProps<"/ranking">) {
  const sp = await searchParams;
  const today = todayIso();
  const requested = isIsoDate(sp.dia) ? sp.dia : today;
  const start = mondayOf(requested);
  const initialFilter = parseRankingFilter(sp.genero);

  const [viewer, week, adjacent] = await Promise.all([getViewer(), getPublishedWeek(start), getAdjacentPublished(start)]);
  if (!viewer.canViewProgram) {
    return <NoAccess name={viewer.profile.full_name.split(" ")[0]} pending={viewer.profile.access_status === "pending"} />;
  }

  const allOn = (date: string) => week?.days.find((candidate) => candidate.date === date)?.workout_blocks ?? [];
  const scoredOn = (date: string) => allOn(date).filter((block) => hasBoard(block.score_type));

  let day = requested;
  if (!isIsoDate(sp.dia) && scoredOn(day).length === 0) {
    const availableDays = weekDates(start).filter((date) => scoredOn(date).length > 0);
    day = availableDays.filter((date) => date <= today).at(-1) ?? availableDays[0] ?? day;
  }

  const meId = viewer.profile.id;
  const blocks = scoredOn(day);
  const dayBlocks = allOn(day);
  const blockIds = blocks.map((block) => block.id);
  const usedMovementIds: string[] = [];
  for (const block of dayBlocks) {
    if (block.movement_id) usedMovementIds.push(block.movement_id);
    if (block.rm_reference_movement_id) usedMovementIds.push(block.rm_reference_movement_id);
    for (const row of block.complex_movements ?? []) usedMovementIds.push(row.movement_id);
    for (const section of block.builder_sections ?? []) {
      for (const item of section.items) {
        if (item.type === "exercise") usedMovementIds.push(item.movement_id);
        if (item.type === "complex") {
          if (item.rm_reference_movement_id) usedMovementIds.push(item.rm_reference_movement_id);
          for (const movement of item.movements) usedMovementIds.push(movement.movement_id);
        }
      }
    }
  }
  const movementIds = [...new Set(usedMovementIds)];
  const [board, activity, dayActivity, movements] = await Promise.all([
    getDayLeaderboard(week?.id ?? null, day),
    getActivity(meId, blockIds),
    getRankingDayAthleteActivity(week?.id ?? null, day),
    getMovementsByIds(movementIds),
  ]);

  const movementNames = Object.fromEntries(movements.map((movement) => [movement.id, movement.name]));
  const dates = weekDates(start);
  const dayHasRanking = Object.fromEntries(dates.map((date) => [date, scoredOn(date).length > 0]));

  return (
    <RankingExperience
      start={start}
      day={day}
      dates={dates}
      dayHasRanking={dayHasRanking}
      adjacent={adjacent}
      meId={meId}
      blocks={blocks}
      dayBlocks={dayBlocks}
      board={board}
      activity={activity}
      dayActivity={dayActivity}
      movementNames={movementNames}
      weekExists={Boolean(week)}
      initialFilter={initialFilter}
    />
  );
}

function parseRankingFilter(value: string | string[] | undefined): RankingFilter {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "male" || candidate === "female" ? candidate : "all";
}
