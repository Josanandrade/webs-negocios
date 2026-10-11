"use client";

import { useState } from "react";
import { BlockTracker, type BlockView } from "@/components/block-tracker";
import { Toast, useToast } from "@/components/toast";

export type DayView = {
  date: string;
  name: string;
  short: string;
  isToday: boolean;
  blocks: BlockView[];
};

export function WeekDays({ days, meId }: { days: DayView[]; meId: string }) {
  const { toast, show } = useToast();
  // Todos cerrados al entrar. Solo un día abierto a la vez: abrir uno cierra el resto.
  const [open, setOpen] = useState<string | null>(null);

  function toggle(date: string, trigger: HTMLElement) {
    const opening = open !== date;
    setOpen(opening ? date : null);
    // Si se cierra un día más arriba, el contenido sube y la cabecera pulsada
    // puede quedar fuera de pantalla: la traemos de vuelta cuando acaba la animación.
    if (opening && open !== null) {
      window.setTimeout(() => {
        if (trigger.getBoundingClientRect().top < 0) {
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          trigger.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
        }
      }, 240);
    }
  }

  return (
    <>
    <ol className="border-t border-line">
      {days.map((day) => {
        const empty = day.blocks.length === 0;
        const isOpen = open === day.date;
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
                onClick={(e) => toggle(day.date, e.currentTarget)}
                className="day-trigger group flex min-h-[4.5rem] w-full items-center justify-between gap-4 px-1 text-left"
              >
                <DayLabel day={day} />
                <span className="flex items-center gap-3">
                  <DayProgress blocks={day.blocks} />
                  <Chevron open={isOpen} />
                </span>
              </button>
            </h2>
            <div id={panelId} role="region" aria-label={`${day.name} ${day.short}`} className="accordion-panel" data-open={isOpen} inert={!isOpen}>
              <div>
                <div className="space-y-7 px-1 pb-8 pt-1">
                  {day.blocks.map((block) => (
                    <BlockTracker key={block.id} block={block} meId={meId} notify={show} />
                  ))}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
    <Toast toast={toast} className="bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-8" />
    </>
  );
}

/** "2/3" bloques hechos; tick completo cuando están todos. */
function DayProgress({ blocks }: { blocks: BlockView[] }) {
  const done = blocks.filter((b) => b.log?.done).length;
  if (done === 0) return null;
  const all = done === blocks.length;
  return (
    <span
      className={`font-display text-[15px] font-bold uppercase tracking-[0.06em] ${all ? "text-lemon" : "text-chalk-3"}`}
      aria-label={all ? "Todo hecho" : `${done} de ${blocks.length} hechos`}
    >
      {all ? "✓ Hecho" : `${done}/${blocks.length}`}
    </span>
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
