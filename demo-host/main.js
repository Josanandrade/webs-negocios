(() => {
  const WA_NUMBER = "34645177628";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  $("#y").textContent = new Date().getFullYear();

  /* Nav: border on scroll + mobile menu */
  const nav = $(".nav");
  const fab = $(".wa-fab");
  const hero = $(".hero");
  const onScroll = () => {
    nav.classList.toggle("scrolled", scrollY > 8);
    fab.classList.toggle("show", scrollY > hero.offsetHeight * 0.6);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const burger = $("#burger");
  const menu = $("#menu");
  const closeMenu = () => { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); };
  burger.addEventListener("click", () => {
    const open = !menu.classList.contains("open");
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("a", menu).forEach(a => a.addEventListener("click", closeMenu));
  addEventListener("keydown", e => { if (e.key === "Escape") closeMenu(); });

  /* Reveal on scroll, staggered by siblings */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      io.unobserve(en.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  $$("[data-reveal]").forEach(el => {
    const sibs = $$(":scope > [data-reveal]", el.parentElement);
    el.style.setProperty("--d", `${Math.min(sibs.indexOf(el), 5) * 70}ms`);
    io.observe(el);
  });

  /* Stage tabs */
  const tabs = $(".tabs");
  const tabBtns = $$(".tab", tabs);
  const select = btn => {
    tabBtns.forEach(b => {
      const on = b === btn;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(b.getAttribute("aria-controls"));
      panel.hidden = !on;
      panel.classList.toggle("is-active", on);
    });
    tabs.dataset.active = btn.dataset.stage;
  };
  tabBtns.forEach((b, i) => {
    b.addEventListener("click", () => select(b));
    b.addEventListener("keydown", e => {
      const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      const next = tabBtns[(i + d + tabBtns.length) % tabBtns.length];
      next.focus(); select(next);
    });
  });
  tabs.dataset.active = "1";

  /* Steps progress line */
  const steps = $("#steps");
  const stepEls = $$(".step", steps);
  const updateSteps = () => {
    const r = steps.getBoundingClientRect();
    const mid = innerHeight * 0.6;
    const p = Math.max(0, Math.min(1, (mid - r.top) / r.height));
    steps.style.setProperty("--p", p.toFixed(3));
    stepEls.forEach(s => s.classList.toggle("lit", s.getBoundingClientRect().top < mid));
  };
  if (reduce) { steps.style.setProperty("--p", 1); stepEls.forEach(s => s.classList.add("lit")); }
  else { addEventListener("scroll", updateSteps, { passive: true }); updateSteps(); }

  /* Timetable filter */
  const chips = $$(".chip");
  const slots = $$(".slot:not(.empty)");
  chips.forEach(c => c.addEventListener("click", () => {
    chips.forEach(x => { x.classList.toggle("is-on", x === c); x.setAttribute("aria-pressed", String(x === c)); });
    const f = c.dataset.filter;
    slots.forEach(s => s.classList.toggle("dim", f !== "all" && s.dataset.s !== f));
  }));

  /* FAQ: animate height via grid rows, keep one open */
  const details = $$(".faq details");
  details.forEach(d => {
    const sum = $("summary", d);
    sum.addEventListener("click", e => {
      e.preventDefault();
      if (d.open) {
        d.classList.remove("is-open");
        setTimeout(() => { if (!d.classList.contains("is-open")) d.open = false; }, reduce ? 0 : 300);
      } else {
        details.forEach(o => { if (o !== d && o.open) { o.classList.remove("is-open"); setTimeout(() => { if (!o.classList.contains("is-open")) o.open = false; }, 300); } });
        d.open = true;
        requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add("is-open")));
      }
    });
  });

  /* Info form → WhatsApp message */
  const form = $("#form");
  const preview = $("#preview");
  const buildMsg = () => {
    const fd = new FormData(form);
    const nombre = (fd.get("nombre") || "").trim();
    const curso = (fd.get("curso") || "").trim();
    const etapa = fd.get("etapa");
    const focos = fd.getAll("foco");
    const extra = (fd.get("mensaje") || "").trim();
    let m = `Hola, ${nombre ? `soy ${nombre} y ` : ""}me gustaría pedir información sobre el apoyo escolar en Semilla.`;
    m += `\nEtapa: ${etapa}${curso ? ` (${curso})` : ""}.`;
    if (focos.length) m += `\nNos gustaría trabajar: ${focos.join(", ")}.`;
    if (extra) m += `\n${extra}`;
    return m;
  };
  const refresh = () => { preview.textContent = buildMsg(); };
  form.addEventListener("input", refresh);
  form.addEventListener("change", refresh);
  refresh();
  form.addEventListener("submit", e => {
    e.preventDefault();
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(buildMsg())}`, "_blank", "noopener");
  });

  /* Generic WhatsApp links get a friendly default text */
  const defaultText = encodeURIComponent("Hola, me gustaría pedir información sobre el apoyo escolar en Semilla.");
  $$("a.js-wa").forEach(a => { a.href = `https://wa.me/${WA_NUMBER}?text=${defaultText}`; });
})();
