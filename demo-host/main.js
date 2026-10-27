/* =========================================================
   Vida Mía · demo
   ---------------------------------------------------------
   CONFIG: rellena estos datos cuando el centro los confirme.
   Si "whatsapp" tiene número, el formulario abre WhatsApp con
   el mensaje ya redactado. Si está vacío, simula el envío.
   ========================================================= */
const CONFIG = {
  whatsapp: "",          // p. ej. "34600000000" (con prefijo, sin espacios)
  telefono: "",          // p. ej. "954 00 00 00"
  email: "",
  direccion: "",         // p. ej. "C/ Ejemplo 1, Sevilla"
  mapsUrl: "",
  horario: "",           // p. ej. "L–V 7:00–21:30 · S 9:00–13:00"
  instagram: "vidamiaentrenamiento",
  // Fotos disponibles en assets/fotos/<nombre>.jpg. Añade el nombre al subirla:
  // "hero", "sala-1", "sala-2", "sala-3", "sala-4", "sala-5"
  fotos: [],
  logo: "",              // p. ej. "assets/logo.png" (si está vacío se usa el sello provisional)
};

/* Entrenamientos (contenido de ejemplo, pendiente de confirmar) */
const TRAININGS = [
  {
    id: "personal", mode: "Entrenamiento personal",
    name: "Entrenamiento personal", meta: "1 persona",
    title: "Una hora, un entrenador, <em>un objetivo: el tuyo.</em>",
    desc: "Sesiones individuales en las que todo gira alrededor de ti: técnica, cargas, ritmo y descansos. La forma más rápida y segura de avanzar.",
    specs: [["Duración", "60 min"], ["Personas", "Solo tú"], ["Nivel", "Cualquiera"]],
    timeline: [["Movilidad", 10, "#C98B6E"], ["Fuerza", 30, "#3E5A9A"], ["Intervalos", 12, "#D9483B"], ["Calma", 8, "#8E857A"]],
    forYou: ["Buscas resultados concretos y medibles", "Vuelves tras una lesión o un parón largo", "Prefieres atención exclusiva y horario fijo"],
    from: 149,
  },
  {
    id: "pareja", mode: "Entrenamiento en pareja",
    name: "En pareja", meta: "2 personas",
    title: "Mejor <em>en compañía.</em>",
    desc: "Entrena con tu pareja, una amiga o tu hermano. Mismo entrenador, un plan adaptado a cada uno y un precio compartido.",
    specs: [["Duración", "60 min"], ["Personas", "2"], ["Nivel", "Cualquiera"]],
    timeline: [["Movilidad", 10, "#C98B6E"], ["Fuerza", 28, "#3E5A9A"], ["Retos en pareja", 14, "#D9483B"], ["Calma", 8, "#8E857A"]],
    forYou: ["Os motiváis mejor juntos", "Queréis compartir horario y constancia", "Buscáis atención personal a mejor precio"],
    from: 99,
  },
  {
    id: "grupo", mode: "Grupo reducido",
    name: "Grupos reducidos", meta: "Máx. 6",
    title: "La energía del grupo, <em>la atención de un personal.</em>",
    desc: "Grupos pequeños de verdad, con el entrenador corrigiendo a cada persona. Cada uno trabaja a su nivel dentro de la misma sesión.",
    specs: [["Duración", "60 min"], ["Personas", "4 a 6"], ["Nivel", "Cualquiera"]],
    timeline: [["Movilidad", 10, "#C98B6E"], ["Fuerza", 25, "#3E5A9A"], ["Circuito", 17, "#D9483B"], ["Calma", 8, "#8E857A"]],
    forYou: ["Te gusta el ambiente de grupo", "Quieres constancia con un horario fijo", "Buscas la mejor relación calidad-precio"],
    from: 59,
  },
  {
    id: "intervalos", mode: "Grupo reducido",
    name: "Acondicionamiento", meta: "Intervalos",
    title: "Remo, air bike y <em>el reloj en marcha.</em>",
    desc: "Sesiones por intervalos con remo, air bike, sacos de arena y trabajo funcional para ganar resistencia, quemar más y llegar más lejos.",
    specs: [["Duración", "45 min"], ["Personas", "4 a 6"], ["Nivel", "Intermedio"]],
    timeline: [["Calentar", 8, "#C98B6E"], ["Intervalos", 22, "#D9483B"], ["Sacos", 10, "#3E5A9A"], ["Calma", 5, "#8E857A"]],
    forYou: ["Quieres mejorar tu fondo y tu energía", "Te motiva el cronómetro y los retos", "Ya entrenas y buscas un paso más"],
    from: 59,
  },
  {
    id: "salud", mode: "Entrenamiento personal",
    name: "Salud y movilidad", meta: "+50 y readaptación",
    title: "Fuerza para <em>la vida diaria.</em>",
    desc: "Entrenamiento pensado para cuidar la espalda, las articulaciones y los huesos. Ideal a partir de los 50 o para volver a moverte con confianza tras una lesión.",
    specs: [["Duración", "50 min"], ["Personas", "1 a 4"], ["Nivel", "Suave"]],
    timeline: [["Movilidad", 15, "#C98B6E"], ["Fuerza", 22, "#3E5A9A"], ["Equilibrio", 8, "#D9483B"], ["Calma", 5, "#8E857A"]],
    forYou: ["Quieres ganar fuerza sin impacto", "Tienes molestias de espalda o rodilla", "Buscas autonomía y salud a largo plazo"],
    from: 59,
  },
];

/* Tarifas de ejemplo (€/mes según sesiones por semana) */
const PLANS = [
  {
    mode: "Grupo reducido", name: "Grupo reducido",
    desc: "Grupos pequeños con corrección individual.",
    prices: { 1: 59, 2: 95, 3: 125 },
    list: ["Máximo 6 personas por sesión", "Plan adaptado a tu nivel", "Revisión mensual de progreso", "Horario fijo reservado"],
  },
  {
    mode: "Entrenamiento personal", name: "Entrenamiento personal", featured: true, tag: "El más completo",
    desc: "Tu entrenador, tu hora y un plan 100% a medida.",
    prices: { 1: 149, 2: 279, 3: 389 },
    list: ["Sesiones 1:1 de 60 minutos", "Valoración y revisiones periódicas", "Pautas de hábitos y descanso", "Contacto directo con tu entrenador"],
  },
  {
    mode: "Entrenamiento en pareja", name: "En pareja",
    desc: "Precio por persona. Mismo entrenador, doble motivación.",
    prices: { 1: 99, 2: 179, 3: 245 },
    list: ["Sesiones de 60 minutos para dos", "Plan individual para cada uno", "Revisión mensual de progreso", "Ideal para mantener la constancia"],
  },
];

/* ========================================================= */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ICON = (id, cls = "") => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;

document.documentElement.classList.add("js");
$("#year").textContent = new Date().getFullYear();

/* ---------- Textura de ladrillo generada (tonos de la sala) ---------- */
(function brickTexture() {
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const tones = ["#B46A4E", "#A95B40", "#BE7A5E", "#9D5139", "#C88C72", "#B07460", "#A6634E", "#965440", "#C3876C", "#B9806A"];
  const bw = 52, bh = 16, g = 3.5, cols = 10, rows = 18;
  const W = cols * (bw + g), H = rows * (bh + g);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#D6C8BA"/>`;
  for (let r = 0; r < rows; r++) {
    const off = r % 2 ? (bw + g) / 2 : 0;
    for (let c = -1; c <= cols; c++) {
      const x = (c * (bw + g) + off).toFixed(1), y = (r * (bh + g) + g / 2).toFixed(1);
      const t = tones[Math.floor(rnd() * tones.length)];
      s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="2" fill="${t}" fill-opacity="${(0.86 + rnd() * 0.14).toFixed(2)}"/>`;
      const wash = rnd();
      if (wash > 0.62) s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="2" fill="#F1E4D8" fill-opacity="${(0.12 + (wash - 0.62) * 0.9).toFixed(2)}"/>`;
    }
  }
  s += `</svg>`;
  document.documentElement.style.setProperty("--brick-tex", `url("data:image/svg+xml,${encodeURIComponent(s)}")`);
})();

/* ---------- Fotos y logo (ver CONFIG.fotos y CONFIG.logo) ----------
   Mientras no haya foto, se ve el hueco ilustrado con su etiqueta. */
$$("[data-photo]").forEach((fig) => {
  if (!CONFIG.fotos.includes(fig.dataset.photo)) return;
  const src = `assets/fotos/${fig.dataset.photo}.jpg`;
  const img = new Image();
  img.className = "photo-img";
  img.alt = fig.dataset.label || "";
  img.decoding = "async";
  img.onload = () => { fig.prepend(img); requestAnimationFrame(() => fig.classList.add("has-photo")); };
  img.src = src;
});
(function logo() {
  if (!CONFIG.logo) return;
  const img = new Image();
  img.onload = () => $$("[data-logo]").forEach((el) => { el.innerHTML = `<img src="${img.src}" alt="">`; });
  img.src = CONFIG.logo;
})();

/* ---------- Nav: fondo al hacer scroll + enlace activo ---------- */
const nav = $("#nav");
const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 12);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

const navLinks = $$(".nav-links a");
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${e.target.id}`));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach((s) => sectionObs.observe(s));

/* ---------- Titular: palabra a palabra ---------- */
$$("[data-split]").forEach((h) => {
  let i = 0;
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.append(part);
          const w = document.createElement("span");
          w.className = "w"; w.style.setProperty("--wi", i++); w.textContent = part;
          frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  walk(h);
  requestAnimationFrame(() => requestAnimationFrame(() => h.classList.add("is-in")));
});

/* ---------- Entradas al aparecer (con escalonado por grupo) ---------- */
const inObs = new IntersectionObserver((entries) => {
  const batch = entries.filter((e) => e.isIntersecting);
  batch.forEach((e, idx) => {
    e.target.style.setProperty("--delay", `${Math.min(idx, 6) * 70}ms`);
    e.target.classList.add("is-in");
    inObs.unobserve(e.target);
  });
}, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
$$("[data-in]").forEach((el) => inObs.observe(el));

/* ---------- Cronómetro LED + tarjeta de sesión ---------- */
(function timer() {
  const WORK = 20, REST = 10;
  const led = $(".led"), tEl = $("#ledTime"), rEl = $("#ledRound"), sEl = $("#ledState");
  const items = $$("#sessionList li"), bar = $("#sessionBar");
  let round = 3, left = WORK, resting = false, step = 1, running = false, id;
  const pad = (n) => String(n).padStart(2, "0");
  const paintSession = () => {
    items.forEach((li, i) => { li.classList.toggle("done", i < step); li.classList.toggle("now", i === step); });
  };
  const paint = () => {
    tEl.textContent = `00:${pad(left)}`;
    rEl.textContent = round;
    sEl.textContent = resting ? "DESCANSO" : "TRABAJO";
    led.classList.toggle("is-rest", resting);
    const total = WORK + REST, elapsed = resting ? WORK + (REST - left) : WORK - left;
    bar.style.transform = `scaleX(${((step + elapsed / total) / items.length).toFixed(3)})`;
  };
  const tick = () => {
    left--;
    if (left < 0) {
      if (!resting) { resting = true; left = REST; }
      else {
        resting = false; left = WORK; round = round >= 9 ? 1 : round + 1;
        step = (step + 1) % (items.length + 1);
        if (step === items.length) { step = 0; }
        paintSession();
      }
    }
    paint();
  };
  paintSession(); paint();
  if (reduceMotion) return;
  const start = () => { if (!running) { running = true; id = setInterval(tick, 1000); } };
  const stop = () => { running = false; clearInterval(id); };
  new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop())).observe(led);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
})();

/* ---------- Entrenamientos: pestañas con indicador deslizante ---------- */
(function trainings() {
  const list = $("#trList"), panel = $("#trPanelInner"), indicator = $(".tr-indicator", list);
  TRAININGS.forEach((t, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "tr-tab"; b.role = "tab"; b.id = `tab-${t.id}`;
    b.setAttribute("aria-controls", "trPanel");
    b.setAttribute("aria-selected", i === 0 ? "true" : "false");
    b.tabIndex = i === 0 ? 0 : -1;
    b.innerHTML = `<span class="n">0${i + 1}</span><span class="t">${t.name}</span><span class="m">${t.meta}</span>`;
    b.addEventListener("click", () => select(i));
    list.append(b);
  });
  const tabs = $$(".tr-tab", list);
  let current = -1, swapTimer;

  const moveIndicator = (i) => {
    const tab = tabs[i];
    indicator.style.setProperty("--x", `${tab.offsetLeft}px`);
    indicator.style.setProperty("--y", `${tab.offsetTop}px`);
    indicator.style.setProperty("--w", `${tab.offsetWidth}px`);
    indicator.style.setProperty("--h", `${tab.offsetHeight}px`);
    if (list.scrollWidth > list.clientWidth) {
      list.scrollTo({ left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2, behavior: reduceMotion ? "auto" : "smooth" });
    }
  };
  const render = (t) => {
    const total = t.timeline.reduce((a, s) => a + s[1], 0);
    return `
      <div class="tr-kicker"><span class="mono">${t.meta}</span><span class="sample-badge">Contenido de ejemplo</span></div>
      <h3 class="tr-title">${t.title}</h3>
      <p class="tr-desc">${t.desc}</p>
      <dl class="tr-specs">${t.specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
      <p class="tr-sub">Así es una sesión · ${total} min</p>
      <div class="tr-timeline" aria-hidden="true">${t.timeline.map(([n, m, c], i) => `<span style="--f:${m};--c:${c};--i:${i}">${m}′</span>`).join("")}</div>
      <div class="tr-legend">${t.timeline.map(([n, m, c]) => `<span><i style="--c:${c}"></i>${n} · ${m}′</span>`).join("")}</div>
      <ul class="tr-for">${t.forYou.map((f) => `<li>${ICON("check")}${f}</li>`).join("")}</ul>
      <div class="tr-cta">
        <button class="btn btn-brick" type="button" data-pick="${t.mode}">Quiero probarlo ${ICON("arrow", "i")}</button>
        <span class="from">desde <b>${t.from} €</b>/mes</span>
      </div>`;
  };
  const select = (i, focus = false) => {
    if (i === current) return;
    tabs.forEach((b, k) => { b.setAttribute("aria-selected", String(k === i)); b.tabIndex = k === i ? 0 : -1; });
    if (focus) tabs[i].focus();
    moveIndicator(i);
    const first = current === -1;
    current = i;
    clearTimeout(swapTimer);
    if (first || reduceMotion) { panel.innerHTML = render(TRAININGS[i]); return; }
    panel.classList.remove("is-in");
    panel.classList.add("is-out");
    swapTimer = setTimeout(() => {
      panel.innerHTML = render(TRAININGS[i]);
      panel.classList.remove("is-out");
      void panel.offsetWidth;
      panel.classList.add("is-in");
    }, 170);
  };
  list.addEventListener("keydown", (e) => {
    const k = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (k) { e.preventDefault(); select((current + k + tabs.length) % tabs.length, true); }
    if (e.key === "Home") { e.preventDefault(); select(0, true); }
    if (e.key === "End") { e.preventDefault(); select(tabs.length - 1, true); }
  });
  select(0);
  new ResizeObserver(() => moveIndicator(current)).observe(list);
  document.fonts?.ready.then(() => moveIndicator(current));
})();

/* ---------- Tarifas: selector de frecuencia + rueda de dígitos ---------- */
(function pricing() {
  const wrap = $("#plans"), freq = $("#freq"), pill = $(".freq-pill", freq);
  const DIGITS = 3;
  const roller = () =>
    Array.from({ length: DIGITS }, (_, k) =>
      `<span class="digit" style="--k:${k}"><span class="digit-col">${"0123456789".split("").map((d) => `<span>${d}</span>`).join("")}</span></span>`
    ).join("");
  wrap.innerHTML = PLANS.map((p) => `
    <article class="plan ${p.featured ? "plan--featured" : ""}" data-in>
      ${p.tag ? `<span class="plan-tag">${p.tag}</span>` : ""}
      <h3 class="plan-name">${p.name}</h3>
      <p class="plan-desc">${p.desc}</p>
      <div class="plan-price" aria-live="polite"><span class="val" aria-hidden="true">${roller()}</span><span class="cur">€</span><span class="sr" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)"></span></div>
      <p class="plan-per"></p>
      <ul class="plan-list">${p.list.map((l) => `<li>${ICON("check")}${l}</li>`).join("")}</ul>
      <button class="btn ${p.featured ? "btn-brick" : "btn-ghost"} btn-lg btn-block" type="button" data-pick="${p.mode}">Empezar con una prueba</button>
    </article>`).join("");
  $$("[data-in]", wrap).forEach((el) => inObs.observe(el));

  const cards = $$(".plan", wrap);
  const set = (n) => {
    $$("button", freq).forEach((b) => b.setAttribute("aria-checked", String(+b.dataset.freq === n)));
    pill.style.setProperty("--i", n - 1);
    cards.forEach((card, i) => {
      const price = PLANS[i].prices[n];
      const str = String(price).padStart(DIGITS, " ");
      $$(".digit", card).forEach((d, k) => {
        const ch = str[k];
        d.style.width = ch === " " ? "0" : "";
        d.style.opacity = ch === " " ? "0" : "1";
        d.firstElementChild.style.setProperty("--d", ch === " " ? 0 : ch);
      });
      const perSession = Math.round(price / (n * 4.33));
      $(".plan-per", card).innerHTML = `al mes · ${n} ${n === 1 ? "sesión" : "sesiones"}/semana · <b>≈ ${perSession} €</b>/sesión`;
      $(".sr", card).textContent = `${price} euros al mes`;
    });
  };
  freq.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) set(+b.dataset.freq); });
  freq.addEventListener("keydown", (e) => {
    const k = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!k) return;
    e.preventDefault();
    const cur = +$('[aria-checked="true"]', freq).dataset.freq;
    const n = Math.min(3, Math.max(1, cur + k));
    set(n); $(`[data-freq="${n}"]`, freq).focus();
  });
  set(2);
})();

/* ---------- Acordeón con altura animada ---------- */
$$(".acc-item").forEach((d) => {
  d.removeAttribute("name");
  const sum = $("summary", d), body = $(".acc-body", d);
  const close = (item) => {
    item.classList.remove("is-open");
    const done = () => { if (!item.classList.contains("is-open")) item.open = false; };
    reduceMotion ? done() : $(".acc-body", item).addEventListener("transitionend", done, { once: true });
  };
  sum.addEventListener("click", (e) => {
    e.preventDefault();
    if (d.classList.contains("is-open")) return close(d);
    $$(".acc-item.is-open").forEach(close);
    d.open = true;
    requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add("is-open")));
  });
});

/* ---------- Toasts ---------- */
const toaster = $("#toaster");
function toast(title, text = "") {
  const li = document.createElement("li");
  li.className = "toast is-entering";
  li.innerHTML = `<span class="ic">${ICON("check")}</span><div><b>${title}</b>${text ? `<span>${text}</span>` : ""}</div>`;
  toaster.append(li);
  const restack = () => [...toaster.children].reverse().forEach((t, i) => t.style.setProperty("--offset", i));
  restack();
  requestAnimationFrame(() => requestAnimationFrame(() => li.classList.remove("is-entering")));
  setTimeout(() => {
    li.classList.add("is-leaving");
    setTimeout(() => { li.remove(); restack(); }, 320);
  }, 4200);
  if (toaster.children.length > 3) toaster.firstElementChild.remove();
}

/* ---------- Elegir entrenamiento desde cualquier botón ---------- */
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-pick]");
  if (!b) return;
  const input = $$('input[name="modalidad"]').find((i) => i.value === b.dataset.pick);
  if (input) input.checked = true;
  $("#contacto").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  toast(`Hemos marcado «${b.dataset.pick}»`, "Solo te queda dejarnos tu nombre y teléfono.");
});

/* ---------- Canales de contacto ---------- */
(function channels() {
  const rows = [];
  const row = (icon, title, value, href) =>
    href
      ? `<li><a class="channel" href="${href}" ${href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}><span class="ic">${ICON(icon)}</span><span><b>${title}</b><small>${value}</small></span>${ICON("arrow", "go")}</a></li>`
      : `<li><div class="channel"><span class="ic">${ICON(icon)}</span><span><b>${title}</b><small>${value}</small></span><span class="pending">Por confirmar</span></div></li>`;
  rows.push(CONFIG.whatsapp
    ? row("wa", "WhatsApp", "Escríbenos y te respondemos en el día", `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent("Hola, he visto vuestra web y quería información sobre Vida Mía.")}`)
    : row("wa", "WhatsApp", "Respuesta personal, sin bots"));
  if (CONFIG.telefono) rows.push(row("phone", "Teléfono", CONFIG.telefono, `tel:${CONFIG.telefono.replace(/\s/g, "")}`));
  rows.push(row("ig", "Instagram", `@${CONFIG.instagram}`, `https://www.instagram.com/${CONFIG.instagram}/`));
  rows.push(CONFIG.direccion ? row("pin", "Dónde estamos", CONFIG.direccion, CONFIG.mapsUrl || null) : row("pin", "Dónde estamos", "Dirección del centro"));
  rows.push(row("clock", "Horario", CONFIG.horario || "Siempre con cita previa"));
  $("#channels").innerHTML = rows.join("");
})();

/* ---------- Formulario ---------- */
(function form() {
  const f = $("#form"), btn = $("#submitBtn");
  const original = f.innerHTML;
  const val = (n) => f.elements[n]?.value?.trim() || "";
  const flag = (el, bad) => { el.classList.remove("is-invalid"); if (bad) { void el.offsetWidth; el.classList.add("is-invalid"); } };

  const message = () => {
    const horas = $$('input[name="horario"]:checked', f).map((i) => i.value);
    return [
      `Hola, soy ${val("nombre")}. Me gustaría reservar una sesión de prueba en Vida Mía.`,
      `• Modalidad: ${$('input[name="modalidad"]:checked', f)?.value || "Aún no lo sé"}`,
      `• Objetivo: ${$('input[name="objetivo"]:checked', f)?.value || "-"}`,
      horas.length ? `• Me viene mejor: ${horas.join(", ")}` : "",
      `• Teléfono: ${val("telefono")}`,
      val("mensaje") ? `• ${val("mensaje")}` : "",
    ].filter(Boolean).join("\n");
  };

  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameBad = val("nombre").length < 2;
    const telBad = val("telefono").replace(/\D/g, "").length < 9;
    const consentBad = !f.elements.privacidad.checked;
    flag(f.elements.nombre.closest(".field"), nameBad);
    flag(f.elements.telefono.closest(".field"), telBad);
    flag(f.elements.privacidad.closest(".consent"), consentBad);
    if (nameBad || telBad || consentBad) {
      (nameBad ? f.elements.nombre : telBad ? f.elements.telefono : f.elements.privacidad).focus();
      return;
    }
    const text = message();
    if (CONFIG.whatsapp) {
      window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
      return;
    }
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner" aria-hidden="true"></span><span class="btn-label">Enviando…</span>`;
    setTimeout(() => {
      const name = val("nombre");
      f.innerHTML = `
        <div class="form-done" role="status">
          <span class="badge">${ICON("check")}</span>
          <h3>¡Gracias, ${name.replace(/[<>&"]/g, "")}!</h3>
          <p>Hemos recibido tu solicitud. Te escribiremos para cerrar el día y la hora de tu sesión de prueba.</p>
          <button class="btn btn-ghost" type="button" id="again">Enviar otra solicitud</button>
        </div>`;
      f.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      toast("Solicitud enviada", "Te contactaremos muy pronto.");
      $("#again").addEventListener("click", () => { f.innerHTML = original; });
    }, 900);
  });
  f.addEventListener("input", (e) => e.target.closest(".is-invalid")?.classList.remove("is-invalid"));
})();

/* ---------- Menú móvil: hoja inferior que se arrastra para cerrar ---------- */
(function sheetMenu() {
  const sheet = $("#sheet"), overlay = $("#sheetOverlay"), btn = $(".menu-btn");
  let startY = 0, dy = 0, t0 = 0, dragging = false;
  const open = () => {
    sheet.hidden = overlay.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => { sheet.classList.add("is-open"); overlay.classList.add("is-open"); }));
    document.body.style.overflow = "hidden";
    btn.setAttribute("aria-expanded", "true");
    setTimeout(() => $("a", sheet).focus({ preventScroll: true }), 50);
  };
  const close = () => {
    sheet.style.removeProperty("--drag");
    sheet.classList.remove("is-open", "is-dragging"); overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    btn.setAttribute("aria-expanded", "false");
    setTimeout(() => { if (!sheet.classList.contains("is-open")) sheet.hidden = overlay.hidden = true; }, 450);
  };
  btn.addEventListener("click", open);
  overlay.addEventListener("click", close);
  addEventListener("keydown", (e) => { if (e.key === "Escape" && sheet.classList.contains("is-open")) { close(); btn.focus(); } });
  $$("a", sheet).forEach((a) => a.addEventListener("click", close));

  sheet.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a")) return;
    dragging = true; startY = e.clientY; dy = 0; t0 = performance.now();
    sheet.setPointerCapture(e.pointerId);
    sheet.classList.add("is-dragging");
  });
  sheet.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const raw = e.clientY - startY;
    dy = raw > 0 ? raw : -Math.sqrt(-raw) * 2; // resistencia hacia arriba
    sheet.style.setProperty("--drag", `${dy}px`);
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    sheet.classList.remove("is-dragging");
    const v = dy / (performance.now() - t0);
    if (dy > sheet.offsetHeight * 0.3 || v > 0.45) close();
    else sheet.style.setProperty("--drag", "0px");
  };
  sheet.addEventListener("pointerup", end);
  sheet.addEventListener("pointercancel", end);
})();

/* ---------- CTA fija en móvil ---------- */
(function dock() {
  const dock = $("#dock");
  let heroOut = false, contactIn = false;
  const upd = () => dock.classList.toggle("is-visible", heroOut && !contactIn);
  new IntersectionObserver(([e]) => { heroOut = !e.isIntersecting; upd(); }).observe($(".hero-actions"));
  new IntersectionObserver(([e]) => { contactIn = e.isIntersecting; upd(); }, { rootMargin: "0px 0px -20% 0px" }).observe($("#contacto"));
  new IntersectionObserver(([e]) => { if (e.isIntersecting) { contactIn = true; upd(); } }).observe($(".footer"));
})();
