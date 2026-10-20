(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const DATA = window.JL_INMUEBLES;

  JL.bind();
  $$("[data-email]").forEach(a => { if (a.hidden) a.closest("li").hidden = true; });

  // Menú móvil
  const burger = $(".burger"), menu = $("#menu");
  burger.addEventListener("click", () => {
    const open = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!open));
    menu.classList.toggle("open", !open);
    document.body.classList.toggle("lock", !open);
  });
  $$("#menu a").forEach(a => a.addEventListener("click", () => {
    burger.setAttribute("aria-expanded", "false"); menu.classList.remove("open"); document.body.classList.remove("lock");
  }));
  const nav = $(".nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 10);
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  // Buscador
  const form = $("#finder"), locSel = $("#f-loc"), maxSel = $("#f-max");
  [...new Set(DATA.map(p => p.localidad))].sort((a, b) => a.localeCompare(b, "es"))
    .forEach(l => locSel.insertAdjacentHTML("beforeend", `<option>${l}</option>`));
  const PRICES = {
    venta: [["", "Sin límite"], [150000, "Hasta 150.000 €"], [200000, "Hasta 200.000 €"], [250000, "Hasta 250.000 €"], [300000, "Hasta 300.000 €"], [400000, "Hasta 400.000 €"]],
    alquiler: [["", "Sin límite"], [700, "Hasta 700 €/mes"], [900, "Hasta 900 €/mes"], [1200, "Hasta 1.200 €/mes"], [1500, "Hasta 1.500 €/mes"]]
  };
  function fillPrices(op) { maxSel.innerHTML = PRICES[op].map(([v, t]) => `<option value="${v}">${t}</option>`).join(""); }

  const state = { op: "venta", tipo: "", loc: "", max: "" };
  const grid = $("#grid"), empty = $("#empty"), chips = $("#chips");

  function render() {
    // Lo vendido no se muestra en la web; lo reservado o alquilado sí, marcado.
    let list = DATA.filter(p => p.operacion === state.op && p.estado !== "vendido");
    if (state.tipo) list = list.filter(p => p.tipo === state.tipo);
    if (state.loc) list = list.filter(p => p.localidad === state.loc);
    if (state.max) list = list.filter(p => p.precio <= +state.max);
    list.sort((a, b) => (b.destacado - a.destacado) || ((a.estado !== "disponible") - (b.estado !== "disponible")));
    grid.innerHTML = list.map((p, i) => JLUI.card(p, "", i === 0 && list.length > 2)).join("");
    empty.hidden = list.length > 0;
    $("#list-title").textContent = state.op === "venta" ? "Viviendas en venta" : "Viviendas en alquiler";
    const parts = [state.tipo, state.loc, state.max && $("#f-max").selectedOptions[0].textContent].filter(Boolean);
    chips.innerHTML = `<span class="count">${list.length} ${list.length === 1 ? "inmueble" : "inmuebles"}</span>` +
      parts.map(t => `<span class="chip">${t}</span>`).join("") +
      (parts.length ? `<button class="chip chip-x" type="button" id="clear">Quitar filtros ×</button>` : "");
    const clr = $("#clear");
    if (clr) clr.addEventListener("click", () => { form.tipo.value = ""; form.loc.value = ""; form.max.value = ""; Object.assign(state, { tipo: "", loc: "", max: "" }); render(); });
  }

  $$('input[name="op"]', form).forEach(r => r.addEventListener("change", () => {
    state.op = r.value; fillPrices(state.op); state.max = ""; render();
  }));
  form.addEventListener("submit", e => {
    e.preventDefault();
    Object.assign(state, { tipo: form.tipo.value, loc: form.loc.value, max: form.max.value });
    render();
    $("#inmuebles").scrollIntoView({ behavior: "smooth" });
  });
  fillPrices("venta"); render();

  // Propietarios: vender / alquilar
  function setMode(mode) {
    $$(".tabs [role=tab]").forEach(t => t.setAttribute("aria-selected", String(t.dataset.mode === mode)));
    $$(".owners-text").forEach(el => el.hidden = el.dataset.for !== mode);
    $("#valora-title").textContent = mode === "vender" ? "Solicitar valoración" : "Quiero alquilar mi propiedad";
    $("#valora-btn").textContent = mode === "vender" ? "Quiero valorar mi vivienda" : "Quiero alquilar mi vivienda";
    $("#valora-form").dataset.mode = mode;
  }
  $$(".tabs [role=tab]").forEach(t => t.addEventListener("click", () => setMode(t.dataset.mode)));
  $$("[data-tab]").forEach(a => a.addEventListener("click", () => setMode(a.dataset.tab)));
  setMode("vender");

  function check(f) {
    let ok = true;
    $$("[required]", f).forEach(i => { const bad = !i.value.trim(); i.classList.toggle("bad", bad); if (bad) ok = false; });
    if (!ok) $(".bad", f).focus();
    return ok;
  }

  $("#valora-form").addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target; if (!check(f)) return;
    const vender = f.dataset.mode !== "alquilar";
    const msg = `Hola Jesús, ${vender ? "quiero una valoración de mi vivienda" : "quiero alquilar mi vivienda"}.\n` +
      `Nombre: ${f.nombre.value}\nTeléfono: ${f.telefono.value}\n` + (f.email.value ? `Email: ${f.email.value}\n` : "") +
      `Localidad: ${f.localidad.value}\nTipo: ${f.tipo.value}`;
    $(".form-ok", f).hidden = false;
    window.open(JL.wa(msg), "_blank", "noopener");
  });

  $("#contact-form").addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target; if (!check(f)) return;
    const msg = `Hola Jesús, soy ${f.nombre.value} (${f.telefono.value}). ${f.motivo.value}.` + (f.mensaje.value ? `\n${f.mensaje.value}` : "");
    JLUI.toast("Abriendo WhatsApp con tu mensaje…");
    window.open(JL.wa(msg), "_blank", "noopener");
  });

  $("#home-map").innerHTML = JLUI.mapa();
})();
