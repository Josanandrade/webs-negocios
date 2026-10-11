"use client";

import { useState } from "react";
import type { Block } from "@/lib/types";

export type DayView = {
  date: string;
  name: string;
  short: string;
  isToday: boolean;
  blocks: Block[];
};

export function WeekDays({ days }: { days: DayView[] }) {
  // Todos cerrados al entrar. Se pueden abrir varios a la vez.
  const [open, setOpen] = useState<Set<string>>(() => new Set());

  function toggle(date: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  }

  return (
    <ol className="border-t border-line">
      {days.map((day) => {
        const empty = day.blocks.length === 0;
        const isOpen = open.has(day.date);
        const panelId = `dia-${day.date}`;

        if (empty) {
          return (
            <li key={day.date} className="border-b border-line">
              <div className="flex min-h-[4.5rem] items-center justify-between gap-4 px-1 text-chalk-3/70">
                <DayLabel day={day} />
                <span className="text-[14px]">Sin sesión</span>
              </div>
            </li>
          );
        }

        return (
          <li key={day.date} className="border-b border-line">
            <h2>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(day.date)}
                className="day-trigger group flex min-h-[4.5rem] w-full items-center justify-between gap-4 px-1 text-left"
              >
                <DayLabel day={day} />
                <Chevron open={isOpen} />
              </button>
            </h2>
            <div id={panelId} role="region" aria-label={`${day.name} ${day.short}`} className="accordion-panel" data-open={isOpen} inert={!isOpen}>
              <div>
                <div className="space-y-7 px-1 pb-8 pt-1">
                  {day.blocks.map((block) => (
                    <section key={block.id}>
                      {block.title && (
                        <h3 className="font-display text-[15px] font-bold uppercase tracking-[0.12em] text-lemon">
                          {block.title}
                        </h3>
                      )}
                      {block.content && (
                        <p className="workout-text mt-2 text-[19px] leading-[1.55] text-chalk sm:text-[20px]">
                          {block.content}
                        </p>
                      )}
                    </section>
                  ))}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function DayLabel({ day }: { day: DayView }) {
  return (
    <span className="flex items-baseline gap-3">
      <span className="font-display text-[26px] font-bold uppercase leading-none tracking-[0.01em]">
        {day.name}
      </span>
      <span className="font-display text-[17px] font-semibold uppercase tracking-[0.04em] text-chalk-3">
        {day.short}
      </span>
      {day.isToday && (
        <span className="self-center bg-lemon px-1.5 py-0.5 font-display text-[12px] font-bold uppercase tracking-[0.1em] text-lemon-ink">
          Hoy
        </span>
      )}
    </span>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden
      className="shrink-0 text-chalk-3 transition-transform duration-200 ease-[var(--ease-out)] group-hover:text-chalk motion-reduce:transition-none"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
    >
      <path d="M5 9l7 7 7-7" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square" />
    </svg>
  );
}
