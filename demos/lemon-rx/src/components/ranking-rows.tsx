"use client";

import { useState } from "react";
import { Avatar } from "@/components/avatar";
import { divisionLabel, formatKg, formatScore, isRanked, safeTextDetail } from "@/lib/scores";
import type { Block, LeaderboardRow, RankingDayActivityRow, Score, ScoreType } from "@/lib/types";

export function ordinal(n: number) {
  return `${n}º`;
}

type RankingRowsProps = {
  rows: LeaderboardRow[];
  type: ScoreType;
  meId: string;
  dayBlocks?: Block[];
  detailsByUser?: Record<string, RankingDayActivityRow[]>;
  movementNames?: Record<string, string>;
};

type SavedStrengthResult = {
  version?: number;
  sections?: Array<{
    section_id: string;
    exercises?: Array<{ item_id: string; weights?: number[] }>;
    completed_item_ids?: string[];
  }>;
};

/** Filas de una clasificación. En Ranking puede desplegar la sesión completa del atleta. */
export function RankingRows({ rows, type, meId, dayBlocks, detailsByUser, movementNames = {} }: RankingRowsProps) {
  const [openUser, setOpenUser] = useState<string | null>(null);
  const canExpand = Boolean(dayBlocks && detailsByUser);
  const ranked = isRanked(type);

  const list = ranked ? "ol" : "ul";
  const List = list;

  return (
    <List>
      {rows.map((r) => {
        const me = r.user_id === meId;
        const open = canExpand && openUser === r.user_id;
        const safeDetail = safeTextDetail(r.reps_detail);
        const summary = (
          <>
            {ranked && <span className="w-9 shrink-0 font-display text-[18px] font-bold">{ordinal(r.position)}</span>}
            <Avatar url={r.avatar_url} name={r.full_name} size="md" />
            <span className={`min-w-0 flex-1 truncate text-[16px] font-semibold ${me ? "text-lemon" : ""}`}>
              {r.full_name}
              {me && <span className="ml-1.5 font-normal text-chalk-3">(tú)</span>}
            </span>
            <span className={`shrink-0 font-display ${ranked ? "text-[18px]" : "text-[14px] uppercase tracking-[0.06em]"} font-bold ${!ranked && r.as_prescribed ? "text-lemon" : ""}`}>
              {!ranked && r.as_prescribed ? "✓ " : ""}{formatScore(type, r)}
            </span>
            {canExpand && <span aria-hidden className={`ml-1 shrink-0 text-chalk-3 transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>}
          </>
        );

        return (
          <li key={r.user_id} className={`border-b border-line last:border-b-0 ${me ? "text-lemon" : ""}`}>
            {canExpand ? (
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenUser((current) => current === r.user_id ? null : r.user_id)}
                className="press flex w-full items-center gap-3 py-2.5 text-left"
              >
                {summary}
              </button>
            ) : (
              <div className="flex items-center gap-3 py-2.5">{summary}</div>
            )}
            {!ranked && !r.as_prescribed && safeDetail && !canExpand && (
              <p className="mt-1 pb-2.5 pl-12 whitespace-pre-wrap text-[15px] leading-[1.45] text-chalk-3">{safeDetail}</p>
            )}
            {open && dayBlocks && detailsByUser && (
              <AthleteDayDetails
                blocks={dayBlocks}
                activity={detailsByUser[r.user_id] ?? []}
                movementNames={movementNames}
              />
            )}
          </li>
        );
      })}
    </List>
  );
}

function AthleteDayDetails({ blocks, activity, movementNames }: {
  blocks: Block[];
  activity: RankingDayActivityRow[];
  movementNames: Record<string, string>;
}) {
  const byBlock = new Map(activity.map((row) => [row.block_id, row]));
  const ordered = [...blocks].sort((a, b) => a.position - b.position);
  return (
    <div className="mb-3 ml-0 rounded-sm border border-line bg-ink px-3 py-1 text-chalk sm:ml-12">
      {ordered.map((block) => {
        const row = byBlock.get(block.id);
        const score = row?.has_result ? toScore(row) : null;
        const extra = row?.has_result ? loadDetails(block, row, movementNames) : [];
        const genericDetail = row?.has_result && block.score_type !== "load" ? safeTextDetail(row.reps_detail) : null;
        return (
          <div key={block.id} className="border-b border-line py-3 last:border-b-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-display text-[15px] font-bold uppercase tracking-[0.06em] text-lemon">{block.title || "Bloque"}</p>
                {block.content && <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-[13px] leading-[1.4] text-chalk-3">{block.content}</p>}
              </div>
              <div className="text-right">
                {score ? (
                  <p className="font-display text-[17px] font-bold text-chalk">{formatScore(block.score_type, score)}</p>
                ) : (
                  <p className="text-[13px] font-semibold text-chalk-3">Sin resultado</p>
                )}
                {row?.division && block.score_type !== "load" && <p className="text-[12px] uppercase tracking-[0.06em] text-chalk-3">{divisionLabel(row.division)}</p>}
              </div>
            </div>
            {extra.length > 0 && <div className="mt-2 space-y-1">{extra.map((line, i) => <p key={`${line}-${i}`} className="text-[13px] text-chalk-2">{line}</p>)}</div>}
            {genericDetail && <p className="mt-2 whitespace-pre-wrap text-[13px] text-chalk-2">{genericDetail}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-semibold uppercase tracking-[0.05em]">
              <span className={row?.done ? "text-lemon" : "text-chalk-3"}>{row?.done ? "✓ Hecho" : "No marcado como hecho"}</span>
            </div>
            {row?.note && (
              <div className="mt-2 rounded-sm border-l-2 border-lemon/60 bg-ink-2 px-3 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-chalk-3">Nota del atleta</p>
                <p className="mt-1 whitespace-pre-wrap text-[14px] leading-[1.45] text-chalk">{row.note}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function toScore(row: RankingDayActivityRow): Score {
  return {
    seconds: row.seconds,
    capped: Boolean(row.capped),
    rounds: row.rounds,
    reps: row.reps,
    kg: row.kg,
    total_load: row.total_load,
    as_prescribed: row.as_prescribed,
    reps_detail: row.reps_detail ?? "",
  };
}

function strengthItemName(block: Block, sectionId: string, itemId: string, movementNames: Record<string, string>) {
  const section = block.builder_sections?.find((candidate) => candidate.id === sectionId);
  const item = section?.items.find((candidate) => (candidate.type === "exercise" || candidate.type === "complex") && candidate.id === itemId);
  let name = "Movimiento";
  if (item?.type === "exercise") name = movementNames[item.movement_id] ?? "Ejercicio";
  if (item?.type === "complex") name = `Complex · ${item.movements.map((movement) => movementNames[movement.movement_id] ?? "Movimiento").join(" + ")}`;
  return { section, item, name };
}

function loadDetails(block: Block, row: RankingDayActivityRow, movementNames: Record<string, string>): string[] {
  const raw = row.reps_detail;
  if (!raw) return row.kg != null ? [`Peso máximo: ${formatKg(row.kg)} kg`] : [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      const weights = parsed.map(Number).filter((value) => Number.isFinite(value) && value > 0);
      return weights.length ? [`Pesos: ${weights.map((kg) => `${formatKg(kg)} kg`).join(" · ")}`] : [];
    }
    if (parsed && typeof parsed === "object") {
      const saved = parsed as SavedStrengthResult;
      if ((saved.version === 2 || saved.version === 3) && Array.isArray(saved.sections)) {
        const lines: string[] = [];
        for (const savedSection of saved.sections) {
          for (const exercise of savedSection.exercises ?? []) {
            const { section, name } = strengthItemName(block, savedSection.section_id, exercise.item_id, movementNames);
            const weights = (exercise.weights ?? []).map(Number).filter((value) => Number.isFinite(value) && value > 0);
            if (!weights.length) continue;
            lines.push(`${section?.label ? `${section.label} · ` : ""}${name}: ${weights.map((kg) => `${formatKg(kg)} kg`).join(" · ")}`);
          }
          for (const itemId of savedSection.completed_item_ids ?? []) {
            const { section, name } = strengthItemName(block, savedSection.section_id, itemId, movementNames);
            lines.push(`${section?.label ? `${section.label} · ` : ""}${name}: ✓ Hecho`);
          }
        }
        if (row.total_load != null) lines.push(`Volumen total: ${formatKg(row.total_load)} kg`);
        return lines;
      }
      return [];
    }
  } catch {
    const text = safeTextDetail(raw);
    return text ? [text] : [];
  }
  return [];
}
