"use client";

import { useRef, useState } from "react";
import type { Area } from "@/content/jalis";

// Carta de tratamientos: pestañas accesibles (flechas, Inicio/Fin) con un
// cambio de panel corto. En móvil las pestañas se desplazan en horizontal.
export function TreatmentMenu({ areas }: { areas: Area[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (i: number, focus = false) => {
    const next = (i + areas.length) % areas.length;
    setActive(next);
    const el = tabs.current[next];
    if (focus) el?.focus();
    el?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  };

  const onKey = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowDown: active + 1,
      ArrowLeft: active - 1,
      ArrowUp: active - 1,
      Home: 0,
      End: areas.length - 1,
    };
    if (e.key in map) {
      e.preventDefault();
      select(map[e.key], true);
    }
  };

  const area = areas[active];

  return (
    <div className="menu">
      <div className="menu__tabs" role="tablist" aria-label="Áreas de tratamiento" onKeyDown={onKey}>
        {areas.map((a, i) => (
          <button
            key={a.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`tab-${a.id}`}
            aria-selected={i === active}
            aria-controls={`panel-${a.id}`}
            tabIndex={i === active ? 0 : -1}
            className="menu__tab"
            onClick={() => select(i)}
          >
            <span className="menu__index">{a.index}</span>
            <span className="menu__name">{a.name}</span>
            <span className="menu__count">{a.items.length}</span>
          </button>
        ))}
      </div>

      <div
        key={area.id}
        className="menu__panel"
        role="tabpanel"
        id={`panel-${area.id}`}
        aria-labelledby={`tab-${area.id}`}
        tabIndex={0}
      >
        <div className="menu__head">
          <p className="menu__panel-index">Nº {area.index}</p>
          <h3>{area.name}</h3>
          <p className="menu__lede">{area.lede}</p>
        </div>
        <ul className="menu__list">
          {area.items.map((t, i) => (
            <li key={t.name} style={{ "--i": i } as React.CSSProperties}>
              <div className="menu__item">
                <span className="menu__item-name">{t.name}</span>
                {t.note && <span className="menu__item-note">{t.note}</span>}
              </div>
              <span className="menu__leader" aria-hidden="true" />
              <span className="menu__meta">
                {t.duration && <span className="menu__dur">{t.duration}</span>}
                {t.price ? (
                  <span className="menu__price">{t.price}</span>
                ) : (
                  <span className="menu__ask">Consultar</span>
                )}
              </span>
            </li>
          ))}
        </ul>
        <p className="menu__fine">
          Precios de referencia publicados en su perfil de reservas. Pueden variar: el centro confirma el
          precio final al reservar.
        </p>
      </div>
    </div>
  );
}
