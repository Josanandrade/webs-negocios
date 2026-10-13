"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { categories, type CategoryId } from "@/content/salon";

export const CATEGORY_EVENT = "hg:category";

// Carta de servicios en pestañas. El indicador se desliza con transform
// (solo compositor) y el panel cambia sin animar alturas.
export function ServiceMenu() {
  const [active, setActive] = useState<CategoryId>("manos");
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const placeIndicator = useCallback(() => {
    const list = listRef.current;
    const tab = tabRefs.current[active];
    if (!list || !tab) return;
    list.style.setProperty("--ind-x", `${tab.offsetLeft}px`);
    list.style.setProperty("--ind-w", `${tab.offsetWidth}px`);
  }, [active]);

  useLayoutEffect(placeIndicator, [placeIndicator]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const ro = new ResizeObserver(placeIndicator);
    ro.observe(list);
    return () => ro.disconnect();
  }, [placeIndicator]);

  // Las tarjetas destacadas pueden abrir directamente una categoría.
  useEffect(() => {
    const onPick = (e: Event) => setActive((e as CustomEvent<CategoryId>).detail);
    window.addEventListener(CATEGORY_EVENT, onPick);
    return () => window.removeEventListener(CATEGORY_EVENT, onPick);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = categories.findIndex((c) => c.id === active);
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % categories.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + categories.length) % categories.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = categories.length - 1;
    else return;
    e.preventDefault();
    const id = categories[next].id;
    setActive(id);
    tabRefs.current[id]?.focus();
  };

  const current = categories.find((c) => c.id === active)!;

  return (
    <div className="menu">
      <div
        ref={listRef}
        className="menu__tabs"
        role="tablist"
        aria-label="Categorías de servicios"
        onKeyDown={onKeyDown}
      >
        <span className="menu__indicator" aria-hidden="true" />
        {categories.map((c) => (
          <button
            key={c.id}
            ref={(el) => {
              tabRefs.current[c.id] = el;
            }}
            id={`tab-${c.id}`}
            role="tab"
            type="button"
            aria-selected={c.id === active}
            aria-controls="menu-panel"
            tabIndex={c.id === active ? 0 : -1}
            className="menu__tab"
            onClick={() => setActive(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div
        id="menu-panel"
        role="tabpanel"
        aria-labelledby={`tab-${current.id}`}
        className="menu__panel"
        key={current.id}
      >
        <p className="menu__intro">{current.intro}</p>
        <ul className="menu__list">
          {current.services.map((s) => (
            <li key={s.name} className="menu__row">
              <div>
                <p className="menu__name">{s.name}</p>
                {(s.note || s.duration) && (
                  <p className="menu__meta">
                    {[s.note, s.duration?.replace(/ /g, "\u00a0")].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              <p className={`menu__price ${s.price ? "" : "is-ask"}`}>{s.price ?? "Consultar"}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
