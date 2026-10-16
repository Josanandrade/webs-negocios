"use client";

import { useState, useTransition } from "react";
import { getBlockMovementHistories, type MovementHistoryEntry, type MovementHistoryGroup } from "@/app/(app)/movement-history-actions";
import { formatKg, loadSetWeights } from "@/lib/scores";
import type { BuilderComplexItem, BuilderExerciseItem, BuilderSection, StrengthSchemeRow } from "@/lib/types";

type SavedV2 = {
  version: 2;
  sections: Array<{
    section_id: string;
    count: number;
    exercises: Array<{ item_id: string; weights: number[] }>;
  }>;
};

type MatchingBuilderItem = BuilderExerciseItem | BuilderComplexItem;

function readSavedV2(value: string): SavedV2 | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<SavedV2>;
    if (parsed.version !== 2 || !Array.isArray(parsed.sections)) return null;
    return parsed as SavedV2;
  } catch {
    return null;
  }
}

function pct(value: number) {
  return Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
}

function schemeText(rows: StrengthSchemeRow[]) {
  return rows.map((row) => `${row.sets > 1 ? `${row.sets}×${row.reps}` : row.reps} · ${pct(row.percentage)}%`).join(" · ");
}

function sectionCount(section: BuilderSection, saved: SavedV2 | null) {
  const actual = saved?.sections.find((row) => row.section_id === section.id)?.count;
  if (actual) return `${actual} ${section.count_type === "rounds" ? "rounds" : "sets"}`;
  const count = section.count_min === section.count_max ? String(section.count_min) : `${section.count_min}–${section.count_max}`;
  return `${count} ${section.count_type === "rounds" ? "rounds" : "sets"}`;
}

function matchesMovement(item: MatchingBuilderItem, movementId: string) {
  if (item.type === "exercise") return item.movement_id === movementId;
  return item.movements.some((row) => row.movement_id === movementId);
}

function percentageText(item: MatchingBuilderItem) {
  if (item.scheme?.length) return schemeText(item.scheme);
  const min = item.percentage_min;
  const max = item.percentage_max ?? min;
  if (min == null || max == null) return null;
  return min === max ? `${pct(min)}%` : `${pct(min)}–${pct(max)}%`;
}

function builderDetails(entry: MovementHistoryEntry, movementId: string) {
  const saved = readSavedV2(entry.reps_detail);
  const prescription: string[] = [];
  const weights: string[] = [];

  for (const section of entry.builder_sections ?? []) {
    for (const item of section.items ?? []) {
      if (item.type !== "exercise" && item.type !== "complex") continue;
      if (!matchesMovement(item, movementId)) continue;

      const parts = [section.label || "Bloque"];
      if (item.scheme?.length) {
        parts.push(schemeText(item.scheme));
      } else {
        parts.push(sectionCount(section, saved));
        if (item.type === "exercise" && item.reps) parts.push(`${item.reps} reps`);
        if (item.type === "complex") parts.push("Complex");
        const percentage = percentageText(item);
        if (percentage) parts.push(percentage);
      }
      prescription.push(parts.join(" · "));

      const savedSection = saved?.sections.find((row) => row.section_id === section.id);
      const exercise = savedSection?.exercises.find((row) => row.item_id === item.id);
      if (exercise?.weights?.length) {
        weights.push(`${section.label || "Bloque"}: ${exercise.weights.map((kg) => `${formatKg(kg)} kg`).join(" · ")}`);
      }
    }
  }

  return { prescription, weights };
}

function legacySnippet(content: string, movementName: string) {
  const lines = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const needle = movementName.toLocaleLowerCase("es-ES");
  const matching = lines
    .filter((line) => line.toLocaleLowerCase("es-ES").includes(needle))
    .sort((a, b) => a.length - b.length);
  const value = matching[0] ?? lines[0] ?? "";
  return value.length > 180 ? `${value.slice(0, 177)}…` : value;
}

function legacyDetails(entry: MovementHistoryEntry, movementName: string) {
  const prescription: string[] = [];
  const weights: string[] = [];

  if (entry.is_emom) {
    const parts = ["EMOM"];
    if (entry.emom_rounds) parts.push(`${entry.emom_rounds} rondas`);
    if (entry.emom_reps) parts.push(`${entry.emom_reps} reps`);
    if (entry.emom_percentage != null) parts.push(`${pct(entry.emom_percentage)}%`);
    prescription.push(parts.join(" · "));
  } else if (entry.strength_scheme?.length) {
    prescription.push(schemeText(entry.strength_scheme));
  } else {
    const snippet = legacySnippet(entry.content, movementName);
    if (snippet) prescription.push(snippet);
  }

  const setWeights = loadSetWeights(entry.reps_detail);
  if (setWeights?.length) weights.push(setWeights.map((kg) => `${formatKg(kg)} kg`).join(" · "));
  else if (entry.kg != null) weights.push(`${formatKg(entry.kg)} kg`);

  return { prescription, weights };
}

function detailsFor(entry: MovementHistoryEntry, movementId: string, movementName: string) {
  const builder = entry.builder_sections?.length ? builderDetails(entry, movementId) : null;
  if (builder && (builder.prescription.length || builder.weights.length)) return builder;
  return legacyDetails(entry, movementName);
}

function dateLabel(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" }).format(new Date(year, month - 1, day));
}

function EntryCard({ entry, movement }: { entry: MovementHistoryEntry; movement: MovementHistoryGroup }) {
  const details = detailsFor(entry, movement.movement_id, movement.movement_name);
  return <article className="border-t border-line py-3 first:border-t-0 first:pt-0">
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <p className="font-display text-[16px] font-bold uppercase text-chalk">{dateLabel(entry.date)}</p>
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-chalk-3">{entry.title}</p>
    </div>
    {details.prescription.map((line, index) => <p key={`p-${index}`} className="mt-1 text-[14px] leading-snug text-chalk-2">{line}</p>)}
    {details.weights.length > 0 ? <div className="mt-2 space-y-1">{details.weights.map((line, index) => <p key={`w-${index}`} className="text-[14px] font-semibold text-lemon">{line}</p>)}</div> : <p className="mt-2 text-[13px] text-chalk-3">Marcado como hecho · sin pesos registrados</p>}
    {entry.total_load != null && <p className="mt-1 text-[12px] text-chalk-3">Volumen total del bloque: <strong className="text-chalk-2">{formatKg(entry.total_load)} kg</strong></p>}
    {entry.note.trim() && <div className="mt-2 border-l-2 border-line-strong pl-3"><p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-chalk-3">Tu nota</p><p className="mt-0.5 text-[14px] italic leading-snug text-chalk-2">{entry.note}</p></div>}
  </article>;
}

export function BlockMovementHistory({ blockId }: { blockId: string }) {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<MovementHistoryGroup[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !open;
    setOpen(next);
    if (!next || groups) return;
    setError(null);
    startTransition(async () => {
      const result = await getBlockMovementHistories(blockId);
      if (!result.ok) return setError(result.error);
      setGroups(result.movements);
      setSelectedId(result.movements[0]?.movement_id ?? null);
    });
  }

  const selected = groups?.find((group) => group.movement_id === selectedId) ?? groups?.[0] ?? null;

  return <section className="rounded-sm border border-line bg-ink-2 px-4 py-3">
    <button type="button" onClick={toggle} aria-expanded={open} className="press flex min-h-11 w-full items-center justify-between gap-4 text-left">
      <span><span className="eyebrow block">Tu progreso</span><span className="mt-0.5 block text-[15px] font-semibold text-chalk">Ver historial de movimientos</span></span>
      <span aria-hidden className={`text-[20px] text-chalk-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>⌄</span>
    </button>
    {open && <div className="border-t border-line pt-3">
      {pending && !groups && <p className="text-[14px] text-chalk-3">Cargando historial…</p>}
      {error && <p className="text-[14px] text-red-300">{error}</p>}
      {!pending && !error && groups?.length === 0 && <p className="text-[14px] text-chalk-3">No hemos podido identificar movimientos de este bloque en el catálogo.</p>}
      {(groups?.length ?? 0) > 1 && <div className="mb-3 flex gap-2 overflow-x-auto pb-1">{groups!.map((group) => <button key={group.movement_id} type="button" onClick={() => setSelectedId(group.movement_id)} className={`press shrink-0 rounded-full border px-3 py-1.5 text-[13px] font-semibold ${selected?.movement_id === group.movement_id ? "border-lemon bg-lemon/10 text-lemon" : "border-line-strong text-chalk-2"}`}>{group.movement_name}</button>)}</div>}
      {selected && <div>
        <p className="mb-2 font-display text-[18px] font-bold uppercase text-chalk">{selected.movement_name}</p>
        {selected.entries.length > 0 ? selected.entries.map((entry) => <EntryCard key={entry.block_id} entry={entry} movement={selected} />) : <p className="text-[14px] text-chalk-3">Aún no has registrado ningún bloque de este movimiento.</p>}
      </div>}
    </div>}
  </section>;
}
