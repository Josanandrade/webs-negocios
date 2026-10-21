"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { BlockView } from "@/components/block-tracker";
import type { StrengthBlockView } from "@/components/strength-block-tracker";
import type { FreeStrengthBlockView } from "@/components/free-strength-block-tracker";
import { Toast, useToast } from "@/components/toast";
import type { BuilderSectionView } from "@/lib/types";

const BlockTracker = dynamic(
  () => import("@/components/block-tracker").then((mod) => mod.BlockTracker),
  { ssr: false, loading: () => <BlockLoading /> },
);
const StrengthBlockTracker = dynamic(
  () => import("@/components/strength-block-tracker").then((mod) => mod.StrengthBlockTracker),
  { ssr: false, loading: () => <BlockLoading /> },
);
const FreeStrengthBlockTracker = dynamic(
  () => import("@/components/free-strength-block-tracker").then((mod) => mod.FreeStrengthBlockTracker),
  { ssr: false, loading: () => <BlockLoading /> },
);
const BlockMovementHistory = dynamic(
  () => import("@/components/block-movement-history").then((mod) => mod.BlockMovementHistory),
  { ssr: false },
);
const StrengthRankingPanel = dynamic(
  () => import("@/components/strength-ranking-panel").then((mod) => mod.StrengthRankingPanel),
  { ssr: false },
);

export type ExtendedBlockView = BlockView & { suggestedSets?: { reps: number; percentage: number; kg: number }[]; builderSectionsView?: BuilderSectionView[] };
export type DayView = { date: string; name: string; short: string; isToday: boolean; blocks: ExtendedBlockView[] };

const CLOSE_ANIMATION_MS = 240;

export function WeekDays({ days, meId }: { days: DayView[]; meId: string }) {
  const { toast, show } = useToast();
  const [open, setOpen] = useState<string | null>(null);
  const [mountedDays, setMountedDays] = useState<Set<string>>(() => new Set());
  const unmountTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)");
    const applyScrollState = () => {
      const lock = mobile.matches && open === null;
      document.documentElement.style.overflowY = lock ? "hidden" : "";
      document.body.style.overflowY = lock ? "hidden" : "";
      if (lock) window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    applyScrollState();
    mobile.addEventListener("change", applyScrollState);
    return () => {
      mobile.removeEventListener("change", applyScrollState);
      document.documentElement.style.overflowY = "";
      document.body.style.overflowY = "";
    };
  }, [open]);

  useEffect(() => () => {
    Object.values(unmountTimers.current).forEach(clearTimeout);
  }, []);

  function mountDay(date: string) {
    const pending = unmountTimers.current[date];
    if (pending) {
      clearTimeout(pending);
      delete unmountTimers.current[date];
    }
    setMountedDays((current) => {
      if (current.has(date)) return current;
      const next = new Set(current);
      next.add(date);
      return next;
    });
  }

  function unmountDayAfterClose(date: string) {
    const pending = unmountTimers.current[date];
    if (pending) clearTimeout(pending);
    unmountTimers.current[date] = setTimeout(() => {
      setMountedDays((current) => {
        if (!current.has(date)) return current;
        const next = new Set(current);
        next.delete(date);
        return next;
      });
      delete unmountTimers.current[date];
    }, CLOSE_ANIMATION_MS);
  }

  function toggle(date: string, trigger: HTMLElement) {
    const previous = open;
    const opening = open !== date;
    if (opening) mountDay(date);
    setOpen(opening ? date : null);

    if (previous && previous !== date) unmountDayAfterClose(previous);
    if (!opening) unmountDayAfterClose(date);

    if (opening && window.matchMedia("(max-width: 767px)").matches) {
      window.setTimeout(() => {
        const dayRow = trigger.closest("li");
        if (!dayRow) return;
        const header = document.querySelector("header");
        const headerHeight = header?.getBoundingClientRect().height ?? 56;
        const top = window.scrollY + dayRow.getBoundingClientRect().top - headerHeight;
        window.scrollTo({
          top: Math.max(0, top),
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        });
      }, 260);
    }
  }

  const rowHeight = "min-h-[clamp(3rem,6.4dvh,4.25rem)]";

  return <><ol className="border-t border-line">{days.map((day) => {
    const empty = day.blocks.length === 0;
    const isOpen = open === day.date;
    const isMounted = mountedDays.has(day.date);
    const panelId = `dia-${day.date}`;
    if (empty) return <li key={day.date} className="border-b border-line"><div className={`flex ${rowHeight} items-center justify-between gap-4 px-1 text-chalk-3/70`}><DayLabel day={day} /><span className="text-[14px]">Sin sesión</span></div></li>;
    return <li key={day.date} className="border-b border-line"><h2><button type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={(e) => toggle(day.date, e.currentTarget)} className={`day-trigger group flex ${rowHeight} w-full items-center justify-between gap-4 px-1 text-left`}><DayLabel day={day} /><span className="flex items-center gap-3"><DayProgress blocks={day.blocks} /><Chevron open={isOpen} /></span></button></h2><div id={panelId} role="region" aria-label={`${day.name} ${day.short}`} className="accordion-panel" data-open={isOpen} inert={!isOpen}><div>{isMounted && <div className="space-y-7 px-1 pb-8 pt-1">{day.blocks.map((block) => {
      if (block.score_type !== "load") return <BlockTracker key={block.id} block={block} meId={meId} notify={show} />;
      const tracker = Array.isArray(block.builder_sections)
        ? <FreeStrengthBlockTracker block={block as FreeStrengthBlockView} notify={show} />
        : <StrengthBlockTracker block={block as StrengthBlockView} notify={show} />;
      return <div key={block.id} className="space-y-7">{tracker}<BlockMovementHistory blockId={block.id} /><StrengthRankingPanel rows={block.board} meId={meId} /></div>;
    })}</div>}</div></div></li>;
  })}</ol><Toast toast={toast} className="bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-8" /></>;
}

function BlockLoading() {
  return <div className="border-t border-line py-6" aria-hidden><div className="skeleton h-5 w-36" /><div className="skeleton mt-4 h-11 w-full" /></div>;
}
function DayProgress({ blocks }: { blocks: ExtendedBlockView[] }) { const done = blocks.filter((b) => b.log?.done).length; if (done === 0) return null; const all = done === blocks.length; return <span className={`font-display text-[15px] font-bold uppercase tracking-[0.06em] ${all ? "text-lemon" : "text-chalk-3"}`} aria-label={all ? "Todo hecho" : `${done} de ${blocks.length} hechos`}>{all ? "✓ Hecho" : `${done}/${blocks.length}`}</span>; }
function DayLabel({ day }: { day: DayView }) { return <span className="flex items-baseline gap-3"><span className="font-display text-[26px] font-bold uppercase leading-none tracking-[0.01em]">{day.name}</span><span className="font-display text-[17px] font-semibold uppercase tracking-[0.04em] text-chalk-3">{day.short}</span>{day.isToday && <span className="self-center bg-lemon px-1.5 py-0.5 font-display text-[12px] font-bold uppercase tracking-[0.1em] text-lemon-ink">Hoy</span>}</span>; }
function Chevron({ open }: { open: boolean }) { return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden className="shrink-0 text-chalk-3 transition-transform duration-200 ease-[var(--ease-out)] group-hover:text-chalk motion-reduce:transition-none" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}><path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square" /></svg>; }
