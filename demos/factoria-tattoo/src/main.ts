import "./styles.css";
import {
  artistById,
  artists,
  studio,
  styleById,
  styles,
  works,
  type Artist,
  type StyleId,
  type Work,
} from "./data";

const $ = <T extends Element>(selector: string, root: ParentNode = document): T => {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Falta el elemento ${selector}`);
  return el;
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const NEW_TAB = '<span class="sr-only"> (se abre en una pestaña nueva)</span>';

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Pieza del portfolio: foto real si existe, placa gráfica del estilo si no. */
function plate(work: Pick<Work, "style" | "src" | "alt">, size: "tile" | "large" = "tile"): string {
  const style = styleById(work.style);
  if (work.src) {
    return `<img class="plate__img" src="${work.src}" alt="${escapeHtml(work.alt)}" loading="lazy" decoding="async" />`;
  }
  return `
    <span class="plate plate--${style.id} plate--${size}" role="img" aria-label="${escapeHtml(style.name)}">
      <span class="plate__glyph" aria-hidden="true">${style.glyph}</span>
      <span class="plate__name" aria-hidden="true">${style.name}</span>
    </span>`;
}

/* ---------- Menú móvil ---------- */
function initMenu(): void {
  const toggle = $<HTMLButtonElement>("[data-menu-toggle]");
  const menu = $<HTMLElement>("[data-menu]");
  const header = $<HTMLElement>("[data-header]");

  const setOpen = (open: boolean) => {
    if (open) {
      menu.style.setProperty("--nav-top", `${header.getBoundingClientRect().bottom}px`);
    }
    toggle.setAttribute("aria-expanded", String(open));
    header.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  };

  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  menu.addEventListener("click", (event) => {
    if ((event.target as Element).closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia("(min-width: 900px)").addEventListener("change", () => setOpen(false));
}

/* ---------- Buscador de estilo (hero) ---------- */
function finderResult(id: StyleId | "otro"): string {
  if (id === "otro") {
    return `
      <p class="finder__match">Se trabaja en todos los estilos.</p>
      <p>Cuéntanos la idea y te decimos qué artista del equipo encaja con ella.</p>
      <div class="finder__actions"><a class="btn btn--ink" href="#cita">Preparar consulta</a></div>`;
  }
  const style = styleById(id);
  const artist = artistById(style.artistId);
  if (artist) {
    return `
      <p class="finder__match"><span class="finder__style">${style.name}</span> <span aria-hidden="true">/</span> <span class="sr-only">con</span> ${artist.name}, ${artist.alias}</p>
      <p>${style.summary}</p>
      <div class="finder__actions">
        <a class="btn btn--ink" href="#artista-${artist.id}">Ver a ${artist.alias}</a>
        <a class="btn btn--line" href="#cita" data-preset="${style.id}">Pedir cita</a>
      </div>`;
  }
  return `
    <p class="finder__match"><span class="finder__style">${style.name}</span> <span aria-hidden="true">/</span> <span class="sr-only">con</span> artista del equipo</p>
    <p>${style.summary} Hay artistas del estudio que lo trabajan: te ponemos en contacto con quien encaje con tu idea.</p>
    <div class="finder__actions">
      <a class="btn btn--ink" href="#cita" data-preset="${style.id}">Preparar consulta</a>
      <a class="btn btn--line" href="#trabajos" data-filter-link="${style.id}">Ver trabajos</a>
    </div>`;
}

function initFinder(onPreset: (id: StyleId) => void, onFilter: (id: StyleId) => void): void {
  const chips = $<HTMLElement>("[data-finder-chips]");
  const result = $<HTMLElement>("[data-finder-result]");
  const options: { id: StyleId | "otro"; label: string }[] = [
    ...styles.map((s) => ({ id: s.id, label: s.name })),
    { id: "otro", label: "Otro estilo" },
  ];

  chips.innerHTML = options
    .map(
      (o) => `
      <label class="chip">
        <input type="radio" name="finder" value="${o.id}" />
        <span>${o.label}</span>
      </label>`,
    )
    .join("");

  chips.addEventListener("change", (event) => {
    const input = event.target as HTMLInputElement;
    result.innerHTML = finderResult(input.value as StyleId | "otro");
    if (!reducedMotion.matches) {
      result.animate(
        [
          { opacity: 0, transform: "translateY(6px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 220, easing: EASE_OUT },
      );
    }
  });

  result.addEventListener("click", (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>("a");
    if (!link) return;
    if (link.dataset.preset) onPreset(link.dataset.preset as StyleId);
    if (link.dataset.filterLink) onFilter(link.dataset.filterLink as StyleId);
  });
}

/* ---------- Índice de estilos ---------- */
function initStyleIndex(onPreset: (id: StyleId) => void, onFilter: (id: StyleId) => void): void {
  const list = $<HTMLOListElement>("[data-style-index]");
  list.innerHTML = styles
    .map((style) => {
      const artist = artistById(style.artistId);
      const who = artist
        ? `<a class="style-row__who" href="#artista-${artist.id}">${artist.name}, ${artist.alias}</a>`
        : `<span class="style-row__who">Artistas del equipo</span>`;
      return `
      <li class="style-row">
        <span class="style-row__glyph" aria-hidden="true">${style.glyph}</span>
        <div class="style-row__body">
          <h3 class="style-row__name">${style.name}</h3>
          <p class="style-row__summary">${style.summary}</p>
        </div>
        <div class="style-row__meta">
          ${who}
          <span class="style-row__links">
            <a href="#trabajos" data-filter-link="${style.id}">Trabajos<span class="sr-only"> de ${style.name}</span></a>
            <a href="#cita" data-preset="${style.id}">Consulta<span class="sr-only"> de ${style.name}</span></a>
          </span>
        </div>
      </li>`;
    })
    .join("");

  list.addEventListener("click", (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>("a");
    if (!link) return;
    if (link.dataset.preset) onPreset(link.dataset.preset as StyleId);
    if (link.dataset.filterLink) onFilter(link.dataset.filterLink as StyleId);
  });
}

/* ---------- Equipo ---------- */
function artistCard(artist: Artist): string {
  const own = works.filter((w) => w.artistId === artist.id).slice(0, 3);
  const styleNames = artist.styles.map((id) => styleById(id).name).join(", ");
  return `
    <article class="artist" id="artista-${artist.id}" aria-labelledby="artist-${artist.id}-name">
      <header class="artist__head">
        <p class="artist__alias" aria-hidden="true">${artist.alias}</p>
        <h3 class="artist__name" id="artist-${artist.id}-name">${artist.name} <span class="sr-only">(${artist.alias})</span></h3>
        <dl class="artist__facts">
          <div><dt>Estilo</dt><dd>${styleNames}</dd></div>
          <div><dt>En el estudio</dt><dd>${artist.role}</dd></div>
        </dl>
        <p class="artist__bio">${artist.bio}</p>
        <div class="artist__actions">
          <a class="btn btn--ink" href="#cita" data-preset="${artist.styles[0]}">Pedir cita con ${artist.alias}</a>
          <a class="btn btn--line" href="${artist.instagram.url}" rel="noopener" target="_blank">${artist.instagram.handle}${NEW_TAB}</a>
        </div>
      </header>
      <ul class="artist__works" aria-label="Trabajos de ${artist.name}">
        ${own.map((w) => `<li><button class="work" type="button" data-work="${w.id}"><span class="work__media" aria-hidden="true">${plate(w)}</span><span class="sr-only">${styleById(w.style).name}, ${artist.alias}. Ampliar</span></button></li>`).join("")}
      </ul>
    </article>`;
}

function initArtists(onPreset: (id: StyleId) => void): void {
  const root = $<HTMLElement>("[data-artists]");
  root.innerHTML = artists.map(artistCard).join("");
  root.addEventListener("click", (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>("a[data-preset]");
    if (link?.dataset.preset) onPreset(link.dataset.preset as StyleId);
  });
}

/* ---------- Portfolio con filtro y visor ---------- */
type Filter = StyleId | "todos";

function initWorks(): (id: StyleId) => void {
  const grid = $<HTMLUListElement>("[data-works]");
  const filters = $<HTMLElement>("[data-filters]");
  const status = $<HTMLElement>("[data-works-status]");
  let current: Filter = "todos";

  const options: { id: Filter; label: string }[] = [
    { id: "todos", label: "Todos" },
    ...styles.map((s) => ({ id: s.id as Filter, label: s.name })),
  ];
  filters.innerHTML = options
    .map((o) => `<button class="filter" type="button" data-filter="${o.id}" aria-pressed="${o.id === current}">${o.label}</button>`)
    .join("");

  grid.innerHTML = works
    .map((w) => {
      const artist = artistById(w.artistId);
      const caption = artist ? `${styleById(w.style).name}, ${artist.alias}` : styleById(w.style).name;
      return `
      <li class="works__item works__item--${w.shape}" data-style="${w.style}" data-vt="${w.id}">
        <button class="work" type="button" data-work="${w.id}">
          <span class="work__media" aria-hidden="true">${plate(w)}</span>
          <span class="work__caption" aria-hidden="true">${caption}</span>
          <span class="sr-only">${caption}. Ampliar</span>
        </button>
      </li>`;
    })
    .join("");
  // Asignado vía CSSOM (la CSP bloquea atributos style en línea).
  grid.querySelectorAll<HTMLLIElement>("[data-vt]").forEach((item) => {
    item.style.setProperty("view-transition-name", `work-${item.dataset.vt}`);
  });

  const apply = (next: Filter) => {
    current = next;
    filters.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.filter === next));
    });
    let visible = 0;
    grid.querySelectorAll<HTMLLIElement>(".works__item").forEach((item) => {
      const show = next === "todos" || item.dataset.style === next;
      item.hidden = !show;
      if (show) visible++;
    });
    const label = next === "todos" ? "todos los estilos" : styleById(next).name;
    status.textContent = `${visible} trabajos de ${label}`;
  };

  const setFilter = (next: Filter) => {
    if (next === current) return;
    if (document.startViewTransition && !reducedMotion.matches) {
      document.startViewTransition(() => apply(next));
    } else {
      apply(next);
    }
  };

  filters.addEventListener("click", (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>("[data-filter]");
    if (button) setFilter(button.dataset.filter as Filter);
  });

  return (id: StyleId) => apply(id);
}

function initLightbox(): void {
  const dialog = $<HTMLDialogElement>("[data-lightbox]");
  const media = $<HTMLElement>("[data-lightbox-media]");
  const title = $<HTMLElement>("[data-lightbox-title]");
  const text = $<HTMLElement>("[data-lightbox-text]");
  const actions = $<HTMLElement>("[data-lightbox-actions]");
  let opener: HTMLElement | null = null;

  document.addEventListener("click", (event) => {
    const trigger = (event.target as Element).closest<HTMLButtonElement>("[data-work]");
    if (!trigger) return;
    const work = works.find((w) => w.id === trigger.dataset.work);
    if (!work) return;
    const style = styleById(work.style);
    const artist = artistById(work.artistId);

    media.innerHTML = plate(work, "large");
    title.textContent = artist ? `${style.name}, por ${artist.alias}` : style.name;
    text.textContent = style.summary;
    actions.innerHTML = artist
      ? `<a class="btn btn--ink" href="${artist.instagram.url}" rel="noopener" target="_blank">Ver más de ${artist.alias}${NEW_TAB}</a>`
      : `<a class="btn btn--ink" href="${studio.instagram.url}" rel="noopener" target="_blank">Ver más en Instagram${NEW_TAB}</a>`;
    opener = trigger;
    dialog.showModal();
  });

  $("[data-lightbox-close]").addEventListener("click", () => dialog.close());
  // Clic en el fondo (fuera del contenido) cierra el visor.
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => opener?.focus());
}

/* ---------- Consulta: compone un mensaje, no envía nada ---------- */
function initConsult(): (id: StyleId) => void {
  const form = $<HTMLFormElement>("[data-consult]");
  const select = $<HTMLSelectElement>("[data-consult-style]");
  const preview = $<HTMLOutputElement>("[data-consult-preview]");
  const copy = $<HTMLButtonElement>("[data-copy]");
  const copyStatus = $<HTMLElement>("[data-copy-status]");

  select.insertAdjacentHTML(
    "beforeend",
    styles.map((s) => `<option value="${s.id}">${s.name}</option>`).join(""),
  );

  const compose = (): string => {
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    const styleId = value("style");
    const style = styleId ? styleById(styleId as StyleId) : undefined;
    const artist = artistById(style?.artistId);

    const parts = ["Hola, Factoría. Me gustaría pedir cita para un tatuaje."];
    if (style) parts.push(`Estilo: ${style.name}${artist ? ` (con ${artist.alias})` : ""}.`);
    else parts.push("Aún no tengo claro el estilo.");
    if (value("zone")) parts.push(`Zona: ${value("zone")}.`);
    if (value("size")) parts.push(`Tamaño: ${value("size")}.`);
    if (value("color")) parts.push(`Color: ${value("color")}.`);
    if (value("idea")) parts.push(`Idea: ${value("idea")}`);
    parts.push("Puedo enviaros referencias. ¡Gracias!");
    return parts.join("\n");
  };

  const render = () => {
    preview.textContent = compose();
    copyStatus.textContent = "";
  };

  form.addEventListener("input", render);
  form.addEventListener("submit", (event) => event.preventDefault());
  render();

  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(compose());
      copyStatus.textContent = "Mensaje copiado. Pégalo en Instagram.";
    } catch {
      const range = document.createRange();
      range.selectNodeContents(preview);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      copyStatus.textContent = "Mensaje seleccionado. Cópialo con el menú de tu dispositivo.";
    }
  });

  return (id: StyleId) => {
    select.value = id;
    render();
  };
}

/* ---------- Ubicaciones ---------- */
function initLocations(): void {
  $<HTMLUListElement>("[data-locations]").innerHTML = studio.locations
    .map(
      (l) => `
      <li class="location">
        <p class="location__street">${l.street}</p>
        <p class="location__postal">${l.postal}</p>
        <a class="location__map" href="${l.maps}" rel="noopener" target="_blank">Cómo llegar<span class="sr-only"> a ${l.street} (Google Maps, se abre en una pestaña nueva)</span></a>
      </li>`,
    )
    .join("");
}

/* ---------- Arranque ---------- */
const presetConsult = initConsult();
const filterWorks = initWorks();
initMenu();
initFinder(presetConsult, filterWorks);
initStyleIndex(presetConsult, filterWorks);
initArtists(presetConsult);
initLightbox();
initLocations();

// La transferencia del stencil se dispara cuando la fuente ya está lista para
// que el trazo violeta no salte de métrica a mitad de animación.
document.fonts.ready.then(() => document.documentElement.classList.add("is-ready"));
