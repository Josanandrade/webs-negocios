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

/**
 * Un Complex de una sola ejecución y sin esquema representa una búsqueda de peso máximo:
 * se guarda/rankea por el peso de la barra, no por la suma de kg de sus movimientos internos.
 * El constructor puede persistir esa única ejecución como `free` o como `sets`, por lo que
 * la decisión depende de que haya exactamente 1 ejecución, no del nombre del formato.
 */
export function isMaxLoadComplex(section: BuilderSection, item: TrackedBuilderItem) {
  return item.type === "complex"
    && section.count_min === 1
    && section.count_max === 1
    && !(item.scheme?.length);
}

export function isSingleMaxLoadComplexBlock(sections: BuilderSection[] | null | undefined) {
  const tracked = (sections ?? []).flatMap((section) => trackedBuilderItems(section).map((item) => ({ section, item })));
  return tracked.length === 1 && isMaxLoadComplex(tracked[0].section, tracked[0].item);
}

export function expectedWeightCount(item: TrackedBuilderItem, sectionCount: number) {
  const schemeCount = schemeSetCount(item.scheme);
  return schemeCount || sectionCount;
}

export function repsPerWeight(item: TrackedBuilderItem, sectionCount: number) {
  if (item.scheme?.length) {
    return item.scheme.flatMap((row) => Array.from({ length: row.sets }, () => item.type === "complex" ? complexReps(item) * row.reps : row.reps));
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
