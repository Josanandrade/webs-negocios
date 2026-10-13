"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { areas, audiences } from "@/lib/site";
import { AreaMark } from "./area-mark";
import { ArrowIcon } from "./icons";

export function AudienceTabs() {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = audiences[active];

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const last = audiences.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    if (e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="audience">
      <div className="audience__tabs" role="tablist" aria-label="¿Para quién buscas ayuda?">
        {audiences.map((a, i) => (
          <button
            key={a.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${a.id}`}
            aria-selected={i === active}
            aria-controls={`panel-${a.id}`}
            tabIndex={i === active ? 0 : -1}
            className="audience__tab"
            onClick={() => setActive(i)}
            onKeyDown={onKeyDown}
          >
            {a.tab}
          </button>
        ))}
      </div>

      <div
        key={current.id}
        role="tabpanel"
        id={`panel-${current.id}`}
        aria-labelledby={`tab-${current.id}`}
        className="audience__panel"
        tabIndex={0}
      >
        <div className="audience__intro">
          <h3>{current.title}</h3>
          <p>{current.body}</p>
        </div>

        <div className="audience__signals">
          <p className="audience__label">Quizá te suena algo de esto</p>
          <ul>
            {current.signals.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        <div className="audience__areas">
          <p className="audience__label">Áreas que pueden ayudar</p>
          <ul>
            {current.areas.map((id) => {
              const area = areas.find((x) => x.id === id)!;
              return (
                <li key={id}>
                  <a href={`#area-${id}`} className="area-link" data-area={id}>
                    <AreaMark area={id} className="area-link__mark" />
                    <span>
                      <strong>{area.name}</strong>
                      <span>{area.short}</span>
                    </span>
                    <ArrowIcon className="area-link__arrow" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
