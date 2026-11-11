"use client";

import { useId, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { areas, business, type Area, type Group } from "@/content/site";

type Id = Area["id"];
const ids = areas.map((a) => a.id) as Id[];
const isId = (v: string): v is Id => (ids as string[]).includes(v);

// La pestaña activa vive en el hash (#cabello, #color…), así los accesos
// de la portada y cualquier enlace compartido abren directamente su área.
const TAB_EVENT = "mb:tab";
function subscribeHash(cb: () => void) {
  const onNav = () => {
    cb();
    if (isId(location.hash.slice(1))) {
      requestAnimationFrame(() => document.getElementById("servicios")?.scrollIntoView({ block: "start" }));
    }
  };
  window.addEventListener("hashchange", onNav);
  window.addEventListener(TAB_EVENT, cb);
  return () => {
    window.removeEventListener("hashchange", onNav);
    window.removeEventListener(TAB_EVENT, cb);
  };
}
const readHash = () => location.hash.slice(1);

const PREVIEW = 5;

function GroupList({ group }: { group: Group }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const extra = group.items.length - PREVIEW;
  const items = open || extra <= 1 ? group.items : group.items.slice(0, PREVIEW);
  return (
    <div className="group">
      <h4 className="group__title">{group.title}</h4>
      <ul className="group__list" id={listId}>
        {items.map((s) => (
          <li key={s.name} className="svc">
            <span className="svc__name">{s.name}</span>
            {s.price ? (
              <span className="svc__meta">
                <span className="svc__time">{s.time}</span>
                <span className="svc__price">{s.price}</span>
              </span>
            ) : (
              <span className="svc__note">{s.note}</span>
            )}
          </li>
        ))}
      </ul>
      {extra > 1 && (
        <button type="button" className="group__more" aria-expanded={open} aria-controls={listId} onClick={() => setOpen((v) => !v)}>
          {open ? "Ver menos" : `Ver los ${group.items.length}`}
        </button>
      )}
    </div>
  );
}

export default function ServiceMenu() {
  const hash = useSyncExternalStore(subscribeHash, readHash, () => "");
  const active: Id = isId(hash) ? hash : "cabello";
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (id: Id, focus = false) => {
    history.replaceState(null, "", `#${id}`);
    window.dispatchEvent(new Event(TAB_EVENT));
    if (focus) tabs.current[ids.indexOf(id)]?.focus();
  };

  const onKey = (e: KeyboardEvent) => {
    const i = ids.indexOf(active);
    const next =
      e.key === "ArrowRight" ? (i + 1) % ids.length
      : e.key === "ArrowLeft" ? (i - 1 + ids.length) % ids.length
      : e.key === "Home" ? 0
      : e.key === "End" ? ids.length - 1
      : -1;
    if (next < 0) return;
    e.preventDefault();
    select(ids[next], true);
  };

  return (
    <div className="menu">
      <div className="menu__tabs" role="tablist" aria-label="Áreas del salón" onKeyDown={onKey}>
        {areas.map((a, i) => (
          <button
            key={a.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`tab-${a.id}`}
            aria-selected={active === a.id}
            aria-controls={a.id}
            tabIndex={active === a.id ? 0 : -1}
            className="menu__tab"
            onClick={() => select(a.id)}
          >
            <span className="menu__tab-index" aria-hidden="true">{a.index}</span>
            {a.label}
          </button>
        ))}
      </div>

      {areas.map((a) => (
        <section
          key={a.id}
          id={a.id}
          role="tabpanel"
          aria-labelledby={`tab-${a.id}`}
          hidden={active !== a.id}
          className="menu__panel"
          data-tone={a.id === "cabello" || a.id === "laser" ? "ink" : "cal"}
          tabIndex={0}
        >
          <header className="menu__head">
            <p className="eyebrow">{a.kicker}</p>
            <h3 className="menu__title">{a.label}</h3>
            <p className="menu__lead">{a.lead}</p>
          </header>
          <div className="menu__groups">
            {a.groups.map((g) => (
              <GroupList key={g.title} group={g} />
            ))}
          </div>
          <div className="menu__cta">
            {a.id === "laser" ? (
              <>
                <a className="btn btn--accent" href={business.whatsapp.href} target="_blank" rel="noopener noreferrer">
                  Consultar por WhatsApp
                </a>
                <a className="btn btn--line" href={business.phone.href}>
                  Llamar al {business.phone.display}
                </a>
              </>
            ) : (
              <>
                <a className="btn btn--accent" href={business.booking} target="_blank" rel="noopener noreferrer">
                  Reservar {a.label.toLowerCase()} en Booksy
                </a>
                <a className="btn btn--line" href={business.whatsapp.href} target="_blank" rel="noopener noreferrer">
                  Preguntar por WhatsApp
                </a>
              </>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
