(() => {
  "use strict";
  document.documentElement.classList.replace("no-js", "js");

  // Móvil del centro. WhatsApp sin confirmar: se asume el mismo número.
  const WA_NUMBER = "34653595206";
  const waLink = (msg) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  document.querySelectorAll("[data-wa-direct]").forEach((a) => {
    a.href = waLink("Hola, me gustaría información para pedir cita en Bellanela.");
    a.target = "_blank";
    a.rel = "noopener";
  });

  // Menú móvil
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("menu");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    menu.hidden = !open;
  };
  toggle.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });

  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Aparición al hacer scroll
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  // Buscador por preocupación: solo tratamientos confirmados en la carta.
  const CONCERNS = {
    acne: { t: "Granitos y acné", d: "Para pieles con tendencia grasa, granitos o puntos negros. Empezamos limpiando y equilibrando la piel.", items: [["Facial para acné", "Pensado para pieles con granitos."], ["Extracción facial", "Retirada de puntos negros e impurezas."], ["Peeling químico", "Si tu piel lo tolera, ayuda a renovarla."]] },
    textura: { t: "Poros y textura", d: "Cuando la piel se nota áspera o con poros marcados, trabajamos la renovación de la capa superficial.", items: [["Microdermoabrasión", "Exfoliación mecánica para afinar la textura."], ["Dermaplaning", "Exfoliación manual y retirada de pelusa."], ["Higiene facial", "Limpieza profunda como punto de partida."]] },
    apagada: { t: "Piel apagada", d: "Para recuperar luminosidad cuando la piel se ve cansada o sin brillo.", items: [["Dermaplaning", "Deja la piel lisa y con más luz."], ["Higiene facial", "Limpieza y puesta a punto."], ["Peeling químico", "Renueva y unifica."]] },
    tono: { t: "Manchas y tono", d: "Para un tono más uniforme. Antes valoramos tu piel y la época del año.", items: [["Peeling químico", "Renovación para un tono más uniforme."], ["Microdermoabrasión", "Exfoliación que acompaña al tratamiento."]] },
    hombre: { t: "Piel masculina", d: "La piel del hombre suele ser más gruesa y grasa, y sufre con el afeitado. Tiene su propio tratamiento.", items: [["Facial masculino", "Tratamiento facial pensado para él."], ["Extracción facial", "Para puntos negros y poros."]] },
    celulitis: { t: "Celulitis", d: "Trabajamos por zonas y por sesiones, con un plan que se ajusta a tu caso.", items: [["Tratamiento de celulitis", "Plan por sesiones según la zona."], ["Remodelación corporal", "Si además quieres trabajar el contorno."]] },
    contorno: { t: "Contorno corporal", d: "Para modelar zonas concretas del cuerpo con un plan de sesiones.", items: [["Remodelación corporal", "Trabajo de contorno por zonas."], ["Tratamiento de celulitis", "Complemento cuando hay piel de naranja."]] },
    vello: { t: "Cejas y vello facial", d: "Precisión para dar forma a la ceja y retirar el vello del rostro sin cera.", items: [["Depilación con hilo", "Cejas, labio y rostro."], ["Dermaplaning", "Retira la pelusa facial al exfoliar."]] }
  };
  const chips = document.querySelectorAll("[data-concern]");
  const panel = document.querySelector(".finder__panel");
  const fTitle = document.getElementById("finder-title");
  const fText = document.getElementById("finder-text");
  const fList = document.getElementById("finder-list");
  const fCta = document.getElementById("finder-cta");
  const selectEl = document.querySelector('#booking select[name="servicio"]');
  let currentFirst = "";
  const showConcern = (key) => {
    const c = CONCERNS[key];
    fTitle.textContent = c.t;
    fText.textContent = c.d;
    fList.innerHTML = "";
    c.items.forEach(([name, desc], i) => {
      const li = document.createElement("li");
      li.innerHTML = `<b>${String(i + 1).padStart(2, "0")}</b><strong></strong><span></span>`;
      li.querySelector("strong").textContent = name;
      li.querySelector("span").textContent = desc;
      fList.appendChild(li);
    });
    currentFirst = c.items[0][0];
    chips.forEach((b) => b.setAttribute("aria-selected", String(b.dataset.concern === key)));
    panel.classList.remove("is-swap"); void panel.offsetWidth; panel.classList.add("is-swap");
  };
  chips.forEach((b) => b.addEventListener("click", () => showConcern(b.dataset.concern)));
  showConcern("acne");
  fCta.addEventListener("click", () => { if (selectEl) selectEl.value = currentFirst; });

  // Días de apertura próximos (L–V). Tarde solo jueves.
  const OPEN_DAYS = [1, 2, 3, 4, 5];
  const daysBox = document.getElementById("days");
  const tarde = document.getElementById("franja-tarde");
  const manana = document.querySelector('input[name="franja"][value="mañana"]');
  const fmtDow = new Intl.DateTimeFormat("es-ES", { weekday: "short" });
  const d0 = new Date(); d0.setHours(12, 0, 0, 0);
  let added = 0;
  for (let i = 0; added < 8 && i < 20; i++) {
    const d = new Date(d0); d.setDate(d0.getDate() + i);
    if (!OPEN_DAYS.includes(d.getDay())) continue;
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const label = document.createElement("label");
    label.innerHTML = `<input type="radio" name="dia" value="${iso}" data-dow="${d.getDay()}"><span>${fmtDow.format(d).replace(".", "")}<b>${d.getDate()}</b></span>`;
    daysBox.appendChild(label);
    added++;
  }
  const syncFranja = () => {
    const sel = daysBox.querySelector("input:checked");
    const isThu = sel && sel.dataset.dow === "4";
    tarde.disabled = sel ? !isThu : false;
    if (tarde.disabled && tarde.checked) manana.checked = true;
  };
  daysBox.addEventListener("change", syncFranja);

  // Solicitud de cita → mensaje de WhatsApp (no se envía nada a ningún servidor).
  const form = document.getElementById("booking");
  const err = document.getElementById("booking-error");
  const done = document.getElementById("booking-done");
  const preview = document.getElementById("booking-preview");
  const send = document.getElementById("booking-send");
  const showError = (m) => { err.textContent = m; err.hidden = false; done.hidden = true; };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    err.hidden = true;
    const data = new FormData(form);
    const servicio = data.get("servicio");
    const dia = data.get("dia");
    const nombre = (data.get("nombre") || "").trim();
    if (!servicio) return showError("Elige qué tratamiento te interesa.");
    if (!dia) return showError("Elige el día que te viene mejor.");
    if (!nombre) return showError("Escribe tu nombre para saber quién pide la cita.");
    const d = new Date(`${dia}T12:00:00`);
    const fecha = d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
    const msg = [
      `Hola, soy ${nombre}. Me gustaría pedir cita en Bellanela.`,
      `Tratamiento: ${servicio}`,
      `Día: ${fecha}, por la ${data.get("franja")}`
    ].join("\n");
    preview.textContent = msg;
    send.href = waLink(msg);
    done.hidden = false;
    done.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  // Abierto ahora (hora de España). L–X 10–14, J 10–21, V 10–15.
  const HOURS = { 1: [600, 840], 2: [600, 840], 3: [600, 840], 4: [600, 1260], 5: [600, 900] };
  const openNow = document.getElementById("open-now");
  try {
    const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    const mins = (Number(get("hour")) % 24) * 60 + Number(get("minute"));
    const h = HOURS[dow];
    const open = !!h && mins >= h[0] && mins < h[1];
    openNow.textContent = open ? "Abierto ahora" : "Ahora cerrado · escríbenos y te respondemos";
    openNow.classList.toggle("is-open", open);
    openNow.hidden = false;
    const row = document.querySelector(`.hours tr[data-day="${dow}"]`);
    if (row) row.classList.add("is-today");
  } catch (_) { /* sin indicador */ }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
