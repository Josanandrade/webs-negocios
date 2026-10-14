"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { areas, business, photos, type Area, type Group } from "@/content/site";

type Id = Area["id"];
const ids = areas.map((a) => a.id) as Id[];
const isId = (v: string): v is Id => (ids as string[]).includes(v);

// El área activa vive en el hash (#color, #facial…): la carta de la portada
// y cualquier enlace compartido abren directamente su apartado.
const TAB_EVENT = "cg:area";
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

const PREVIEW = 6;

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
            <span className="svc__name">
              {s.name}
              {s.note && <span className="svc__note">{s.note}</span>}
            </span>
            <span className="svc__time">{s.time}</span>
            <span className="svc__price">{s.price}</span>
          </li>
        ))}
      </ul>
      {extra > 1 && (
        <button
          type="button"
          className="group__more"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Ver menos" : `Ver los ${group.items.length} servicios`}
        </button>
      )}
      {group.note && <p className="group__note">{group.note}</p>}
    </div>
  );
}

export default function ServiceCatalog() {
  const hash = useSyncExternalStore(subscribeHash, readHash, () => "");
  const active: Id = isId(hash) ? hash : "cabello";
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const list = useRef<HTMLDivElement>(null);

  // En móvil la lista de áreas se desplaza en horizontal: mantiene visible
  // el área activa, también cuando se llega desde la carta de la portada.
  useEffect(() => {
    const row = list.current;
    const tab = tabs.current[ids.indexOf(active)];
    if (!row || !tab || row.scrollWidth <= row.clientWidth) return;
    const delta = tab.getBoundingClientRect().left - row.getBoundingClientRect().left;
    row.scrollTo({ left: row.scrollLeft + delta - 16, behavior: "instant" });
  }, [active]);

  const select = (id: Id, focus = false) => {
    history.replaceState(null, "", `#${id}`);
    window.dispatchEvent(new Event(TAB_EVENT));
    if (focus) tabs.current[ids.indexOf(id)]?.focus({ preventScroll: true });
  };

  // Flechas en ambos ejes: la lista es vertical en escritorio y horizontal en móvil.
  const onKey = (e: KeyboardEvent) => {
    const i = ids.indexOf(active);
    const next =
      e.key === "ArrowDown" || e.key === "ArrowRight" ? (i + 1) % ids.length
      : e.key === "ArrowUp" || e.key === "ArrowLeft" ? (i - 1 + ids.length) % ids.length
      : e.key === "Home" ? 0
      : e.key === "End" ? ids.length - 1
      : -1;
    if (next < 0) return;
    e.preventDefault();
    select(ids[next], true);
  };

  return (
    <div className="catalog">
      <div ref={list} className="catalog__tabs" role="tablist" aria-label="Áreas del centro" onKeyDown={onKey}>
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
            aria-controls={`panel-${a.id}`}
            tabIndex={active === a.id ? 0 : -1}
            className="catalog__tab"
            onClick={() => select(a.id)}
          >
            {a.label}
          </button>
        ))}
      </div>

      {areas.map((a) => {
        const photo = photos[a.id];
        return (
          <section
            key={a.id}
            id={`panel-${a.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${a.id}`}
            hidden={active !== a.id}
            className="catalog__panel"
            tabIndex={0}
          >
            <header className="catalog__head">
              <h3 className="catalog__title">{a.label}</h3>
              <p className="catalog__lead">{a.lead}</p>
              {photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="catalog__photo" src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
              )}
            </header>
            <div className="catalog__groups">
              {a.groups.map((g) => (
                <GroupList key={g.title} group={g} />
              ))}
            </div>
            <div className="catalog__cta">
              <a className="btn btn--solid" href={business.booking} target="_blank" rel="noopener noreferrer">
                Reservar en Booksy
              </a>
              <a className="btn btn--ghost" href={business.phone.href}>
                Llamar al {business.phone.display}
              </a>
            </div>
          </section>
        );
      })}
    </div>
  );
}
