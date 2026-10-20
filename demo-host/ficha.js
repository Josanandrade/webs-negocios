(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const DATA = window.JL_INMUEBLES;
  const id = new URLSearchParams(location.search).get("id");
  const p = DATA.find(x => x.id === id) || DATA[0];
  const base = "../";
  const LABEL = { ext: "Fachada", salon: "Salón", cocina: "Cocina", dormitorio: "Dormitorio", bano: "Baño", patio: "Exterior" };
  const label = f => LABEL[f.split("-")[0]] || "Foto";

  JL.bind();
  document.title = p.titulo + " · Jesús Losada";

  // Galería deslizable
  const track = $("#track"), thumbs = $("#thumbs"), count = $("#count");
  track.innerHTML = p.fotos.map((f, i) => `<figure class="fx-slide"><img src="${JLUI.img(base, f)}" alt="Ilustración de ${label(f).toLowerCase()} · ${p.titulo}" width="800" height="560" ${i ? 'loading="lazy"' : ""}><figcaption>${label(f)}</figcaption></figure>`).join("");
  thumbs.innerHTML = p.fotos.map((f, i) => `<button type="button" aria-label="Ver ${label(f)}" data-i="${i}"><img src="${JLUI.img(base, f)}" alt=""></button>`).join("");
  let cur = 0;
  const go = i => { i = (i + p.fotos.length) % p.fotos.length; track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" }); };
  const sync = () => {
    cur = Math.round(track.scrollLeft / track.clientWidth);
    count.textContent = `${cur + 1} / ${p.fotos.length}`;
    [...thumbs.children].forEach((b, i) => b.classList.toggle("on", i === cur));
  };
  track.addEventListener("scroll", () => requestAnimationFrame(sync), { passive: true });
  thumbs.addEventListener("click", e => { const b = e.target.closest("button"); if (b) go(+b.dataset.i); });
  $(".fx-arrow.prev").addEventListener("click", () => go(cur - 1));
  $(".fx-arrow.next").addEventListener("click", () => go(cur + 1));
  track.addEventListener("keydown", e => { if (e.key === "ArrowRight") go(cur + 1); if (e.key === "ArrowLeft") go(cur - 1); });
  sync();

  // Datos
  const op = p.operacion === "venta" ? "Venta" : "Alquiler";
  $("#badges").innerHTML = `<span class="b-op">${op}</span><span class="st st-${p.estado}">${JLUI.ESTADO[p.estado]}</span><span class="b-tipo">${p.tipo}</span>`;
  $("#titulo").textContent = p.titulo;
  $("#place").innerHTML = JLUI.ICON.pin + p.localidad + (p.zona !== p.localidad ? " · " + p.zona : "");
  $("#price").textContent = JL.euros(p.precio, p.operacion);
  $("#facts").innerHTML = [
    [JLUI.ICON.hab, p.hab, "Habitaciones"], [JLUI.ICON.banos, p.banos, p.banos === 1 ? "Baño" : "Baños"],
    [JLUI.ICON.m2, p.m2 + " m²", "Construidos"]
  ].map(([i, v, l]) => `<li>${i}<b>${v}</b><small>${l}</small></li>`).join("");
  $("#desc").textContent = p.descripcion;
  $("#feat").innerHTML = [`Tipo: ${p.tipo}`, `Operación: ${op}`, ...p.extras].map(t => `<li>${JLUI.ICON.check}${t}</li>`).join("");
  $("#map").innerHTML = JLUI.mapa(p.localidad);
  $("#gmaps").href = "https://www.google.com/maps/search/" + encodeURIComponent(p.localidad + ", Sevilla");
  $("#ref").textContent = "Ref. " + p.id.toUpperCase() + " · contenido de demostración";
  $("#bar-op").textContent = op + " · " + p.localidad;
  $("#bar-price").textContent = JL.euros(p.precio, p.operacion);

  const waMsg = `Hola Jesús, me interesa "${p.titulo}" (${JL.euros(p.precio, p.operacion)}). ¿Me das más información?`;
  $("#wa-direct").href = $("#bar-wa").href = JL.wa(waMsg);
  [$("#wa-direct"), $("#bar-wa")].forEach(a => { a.target = "_blank"; a.rel = "noopener"; });

  // Hoja "Quiero información"
  const dlg = $("#info"), f = $("#info-form");
  $("#info-prop").textContent = p.titulo + " · " + JL.euros(p.precio, p.operacion);
  f.mensaje.value = "Me interesa esta vivienda y me gustaría recibir más información.";
  document.querySelectorAll("[data-open-info]").forEach(b => b.addEventListener("click", () => {
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    setTimeout(() => f.nombre.focus(), 60);
  }));
  $(".sheet-x").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  f.addEventListener("submit", e => {
    e.preventDefault();
    let ok = true;
    f.querySelectorAll("[required]").forEach(i => { const bad = !i.value.trim(); i.classList.toggle("bad", bad); if (bad) ok = false; });
    if (!ok) return f.querySelector(".bad").focus();
    const msg = `Hola Jesús, soy ${f.nombre.value} (${f.telefono.value}).\nInmueble: ${p.titulo} · ${JL.euros(p.precio, p.operacion)}\n${f.mensaje.value}` + (f.visita.checked ? "\nMe gustaría concertar una visita." : "");
    dlg.close();
    JLUI.toast("Abriendo WhatsApp con tu solicitud…");
    window.open(JL.wa(msg), "_blank", "noopener");
  });

  // Relacionados
  const more = DATA.filter(x => x.id !== p.id && x.estado !== "vendido")
    .sort((a, b) => (b.operacion === p.operacion) - (a.operacion === p.operacion)).slice(0, 3);
  $("#more").innerHTML = more.map(x => JLUI.card(x, base)).join("");
})();
