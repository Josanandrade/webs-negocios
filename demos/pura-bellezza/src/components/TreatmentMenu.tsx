"use client";

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { categories, type CategoryId } from "@/content/site";
import { BookButton } from "./Booking";

/*
  La carta: pestañas accesibles (patrón WAI-ARIA tabs) con un indicador que
  se desliza con transform, sin re-layout. El panel entra con un fundido
  corto; con reduced-motion no se mueve nada.
*/
export function TreatmentMenu() {
  const [active, setActive] = useState<CategoryId>("rostro");
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useLayoutEffect(() => {
    const place = () => {
      const tab = tabRefs.current[active];
      const list = listRef.current;
      if (!tab || !list) return;
      list.style.setProperty("--ix", `${tab.offsetLeft}px`);
      list.style.setProperty("--iw", `${tab.offsetWidth}px`);
    };
    place();
    // El indicador solo se anima a partir de la primera colocación.
    const raf = requestAnimationFrame(() => {
      if (listRef.current) listRef.current.dataset.ready = "true";
    });
    window.addEventListener("resize", place);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", place);
    };
  }, [active]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const ids = categories.map((c) => c.id);
    const i = ids.indexOf(active);
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (i + 1) % ids.length;
    if (e.key === "ArrowLeft") next = (i - 1 + ids.length) % ids.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = ids.length - 1;
    if (next === null) return;
    e.preventDefault();
    setActive(ids[next]);
    tabRefs.current[ids[next]]?.focus();
  };

  const current = categories.find((c) => c.id === active)!;

  return (
    <div className="menu">
      <div
        ref={listRef}
        className="menu__tabs"
        role="tablist"
        aria-label="Familias de tratamientos"
        onKeyDown={onKeyDown}
      >
        <span className="menu__indicator" aria-hidden="true">
          {categories.map((c) => (
            <span key={c.id}>{c.name}</span>
          ))}
        </span>
        {categories.map((c) => (
          <button
            key={c.id}
            ref={(el) => {
              tabRefs.current[c.id] = el;
            }}
            id={`tab-${c.id}`}
            type="button"
            role="tab"
            aria-selected={active === c.id}
            aria-controls={`panel-${c.id}`}
            tabIndex={active === c.id ? 0 : -1}
            className="menu__tab"
            onClick={() => setActive(c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div
        key={current.id}
        id={`panel-${current.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${current.id}`}
        className="menu__panel"
        tabIndex={0}
      >
        <p className="menu__intro">{current.intro}</p>
        <ul className="menu__list">
          {current.items.map((item) => (
            <li key={item.name} className="menu__item">
              <h3>{item.name}</h3>
              <p>{item.note}</p>
            </li>
          ))}
        </ul>
        <BookButton category={current.id} className="btn btn--soft">
          Pedir cita de {current.name.toLowerCase()}
        </BookButton>
      </div>
    </div>
  );
}
