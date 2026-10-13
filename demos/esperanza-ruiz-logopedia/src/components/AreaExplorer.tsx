"use client";

import { useEffect, useState } from "react";
import { areas, type Area } from "@/lib/site";
import { AUDIENCE_EVENT, type AudienceFilter } from "./audience-event";
import { CheckIcon } from "./icons";

const filters: { id: AudienceFilter; label: string }[] = [
  { id: "todas", label: "Todas las áreas" },
  { id: "infancia", label: "Infancia" },
  { id: "adultos", label: "Adultos" },
  { id: "neuro", label: "Daño neurológico" },
];

const numerals = ["01", "02", "03", "04", "05", "06"];

export function AreaExplorer() {
  const [filter, setFilter] = useState<AudienceFilter>("todas");

  useEffect(() => {
    const onSelect = (e: Event) => setFilter((e as CustomEvent<AudienceFilter>).detail);
    // Los enlaces directos a un área (#area-voz…) muestran siempre todas.
    const onHash = () => {
      if (!window.location.hash.startsWith("#area-")) return;
      setFilter("todas");
      requestAnimationFrame(() => document.querySelector(window.location.hash)?.scrollIntoView());
    };
    window.addEventListener(AUDIENCE_EVENT, onSelect);
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener(AUDIENCE_EVENT, onSelect);
      window.removeEventListener("hashchange", onHash);
    };
  }, []);

  const matches = (a: Area) => filter === "todas" || a.forWhom.includes(filter);

  return (
    <div>
      <div
        role="group"
        aria-label="Filtrar áreas por perfil"
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0"
      >
        {filters.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.id)}
              className={`min-h-11 shrink-0 rounded-full px-5 text-[0.95rem] font-bold transition-colors duration-200 ${
                active ? "bg-ink text-paper" : "bg-paper text-ink ring-1 ring-ink/15 hover:ring-ink/40"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <p className="sr-only" aria-live="polite">
        {filter === "todas"
          ? `Mostrando las ${areas.length} áreas`
          : `Mostrando ${areas.filter(matches).length} áreas para ${filters.find((f) => f.id === filter)?.label}`}
      </p>

      <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {areas.map((a, i) => {
          if (!matches(a)) return null;
          return (
            <li
              key={a.id}
              id={`area-${a.id}`}
              className="rise flex flex-col rounded-[28px] bg-paper p-6 shadow-[0_18px_40px_-28px_rgb(29_61_50/0.5)] ring-1 ring-ink/10 md:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="font-serif text-sm italic text-terracotta">{numerals[i]}</span>
              </div>
              <h3 className="mt-2 text-[1.55rem]">{a.title}</h3>
              <p className="mt-1 text-sm font-bold uppercase tracking-[0.08em] text-ink-soft">{a.clinical}</p>
              <p className="mt-4 text-ink-soft">{a.summary}</p>
              <p className="mt-5 text-sm font-bold text-ink">Puede ser útil si…</p>
              <ul className="mt-2 space-y-2">
                {a.signs.map((s) => (
                  <li key={s} className="flex gap-2.5 text-[0.98rem]">
                    <CheckIcon className="mt-1 size-4 shrink-0 text-green" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
