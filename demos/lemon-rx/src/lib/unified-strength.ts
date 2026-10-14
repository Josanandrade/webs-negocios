import type { BuilderComplexItem, BuilderExerciseItem, BuilderItem, BuilderSection, StrengthSchemeRow } from "@/lib/types";

export type TrackedBuilderItem = BuilderExerciseItem | BuilderComplexItem;

export function sectionFormat(section: BuilderSection) {
  return section.format ?? (section.count_type === "rounds" ? "rounds" : "sets");
}

export function trackedBuilderItems(section: BuilderSection): TrackedBuilderItem[] {
  return section.items.filter((item): item is TrackedBuilderItem => (item.type === "exercise" || item.type === "complex") && item.track_load);
}

export function schemeSetCount(scheme: StrengthSchemeRow[] | null | undefined) {
  return (scheme ?? []).reduce((sum, row) => sum + Math.max(0, Number(row.sets || 0)), 0);
}

export function complexReps(item: BuilderComplexItem) {
  return item.movements.reduce((sum, row) => sum + Math.max(0, Number(row.reps || 0)), 0);
}

export function expectedWeightCount(item: TrackedBuilderItem, sectionCount: number) {
  const schemeCount = schemeSetCount(item.scheme);
  return schemeCount || sectionCount;
}

export function repsPerWeight(item: TrackedBuilderItem, sectionCount: number) {
  if (item.scheme?.length) {
    const reps = item.type === "complex" ? complexReps(item) : null;
    return item.scheme.flatMap((row) => Array.from({ length: row.sets }, () => reps ?? row.reps));
  }
  const reps = item.type === "complex" ? complexReps(item) : item.reps;
  return Array.from({ length: sectionCount }, () => reps);
}

export function hasPercentagePrescription(item: TrackedBuilderItem) {
  return Boolean(item.scheme?.length || item.percentage_min != null || item.percentage_max != null);
}

export function isTrackedBuilderItem(item: BuilderItem): item is TrackedBuilderItem {
  return (item.type === "exercise" || item.type === "complex") && item.track_load;
}
