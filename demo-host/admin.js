/*
 * Panel de gestión · VISTA DEMO
 * No hay backend: todo vive en memoria y se pierde al recargar.
 * Sirve para enseñar al cliente cómo gestionaría sus inmuebles.
 */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ESTADO = { disponible: "Disponible", reservado: "Reservado", vendido: "Vendido", alquilado: "Alquilado" };
  const FEATS = ["Garaje", "Terraza", "Ascensor", "Piscina", "Piscina comunitaria", "Jardín", "Patio", "Trastero", "Aire acondicionado", "Amueblado", "Chimenea", "Exterior"];

  // Los 8 inmuebles públicos + 4 que solo existen en el panel (también ficticios).
  const items = window.JL_INMUEBLES.map(p => ({ ...p, fotos: [...p.fotos], extras: [...p.extras], web: true })).concat([
    { id: "piso-castilleja", titulo: "Piso en Castilleja de la Cuesta", tipo: "Piso", operacion: "venta", estado: "disponible", precio: 168000, localidad: "Castilleja de la Cuesta", hab: 3, banos: 1, m2: 88, extras: ["Ascensor", "Exterior"], fotos: ["ext-piso", "salon-b", "cocina-b"], descripcion: "Piso de tres dormitorios, exterior y con ascensor.", destacado: false },
    { id: "casa-valencina", titulo: "Casa en Valencina de la Concepción", tipo: "Casa", operacion: "venta", estado: "disponible", precio: 265000, localidad: "Valencina de la Concepción", hab: 4, banos: 2, m2: 150, extras: ["Patio", "Garaje"], fotos: ["ext-pueblo", "salon-c", "patio"], descripcion: "Casa de dos plantas con patio y cochera.", destacado: false },
    { id: "duplex-sanjuan", titulo: "Dúplex en San Juan de Aznalfarache", tipo: "Dúplex", operacion: "venta", estado: "reservado", precio: 189000, localidad: "San Juan de Aznalfarache", hab: 3, banos: 2, m2: 105, extras: ["Terraza", "Ascensor"], fotos: ["ext-atico", "salon-a", "dormitorio-b"], descripcion: "Dúplex con terraza y vistas.", destacado: false },
    { id: "adosado-mairena-2", titulo: "Adosado en Mairena del Aljarafe", tipo: "Casa", operacion: "venta", estado: "vendido", precio: 275000, localidad: "Mairena del Aljarafe", hab: 4, banos: 3, m2: 170, extras: ["Garaje", "Patio"], fotos: ["ext-adosado", "salon-c", "cocina-a"], descripcion: "Adosado en esquina con patio.", destacado: false }
  ]);
  const img = f => f.startsWith("blob:") ? f : "../assets/inmuebles/" + f + ".svg";
  let filtro = "todos", q = "", editing = null;

  function toast(msg) {
    const t = $(".toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 3800);
  }

  // Acceso
  $("#login-form").addEventListener("submit", e => {
    e.preventDefault(); $("#login").classList.add("out"); document.body.classList.add("in");
    setTimeout(() => $("#login").hidden = true, 400);
  });
  if (location.hash === "#panel") { $("#login").hidden = true; document.body.classList.add("in"); }

  function stats() {
    const c = k => items.filter(i => i.estado === k).length;
    const s = [["Publicados", items.length, "todos"], ["Disponibles", c("disponible"), "disponible"], ["Reservados", c("reservado"), "reservado"], ["Vendidos", c("vendido"), "vendido"], ["Alquilados", c("alquilado"), "alquilado"]];
    $("#stats").innerHTML = s.map(([l, n, k]) => `<button type="button" class="stat stat-${k}${filtro === k ? " on" : ""}" data-f="${k}"><b>${n}</b><span>${l}</span></button>`).join("");
    $("#filters").innerHTML = s.map(([l, , k]) => `<button type="button" class="fchip${filtro === k ? " on" : ""}" data-f="${k}">${k === "todos" ? "Todos" : ESTADO[k]}</button>`).join("");
  }

  function row(p) {
    const op = p.operacion === "venta" ? "Venta" : "Alquiler";
    const opts = Object.entries(ESTADO).map(([k, v]) => `<option value="${k}"${p.estado === k ? " selected" : ""}>${v}</option>`).join("");
    return `<article class="row" data-id="${p.id}">
      <img class="row-img" src="${img(p.fotos[0] || "ext-piso")}" alt="">
      <div class="row-main">
        <b class="row-t">${p.titulo}</b>
        <small>${p.localidad} · ${p.tipo} · ${p.hab} hab · ${p.m2} m²</small>
      </div>
      <div class="row-price"><b>${JL.euros(p.precio, p.operacion)}</b><small class="op op-${p.operacion}">${op}</small></div>
      <label class="row-state st-${p.estado}"><span class="sr">Estado</span><select data-act="estado">${opts}</select></label>
      <div class="row-acts">
        <button type="button" class="ic star${p.destacado ? " on" : ""}" data-act="star" aria-label="Destacar" title="Destacar en la portada">★</button>
        <button type="button" class="b b-ghost b-sm" data-act="edit">Editar</button>
        <button type="button" class="ic del" data-act="del" aria-label="Eliminar" title="Eliminar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg></button>
      </div>
    </article>`;
  }

  function render() {
    stats();
    let list = items.filter(p => filtro === "todos" || p.estado === filtro);
    if (q) list = list.filter(p => (p.titulo + " " + p.localidad).toLowerCase().includes(q));
    $("#list").innerHTML = list.length ? `<div class="list-head"><span>Inmueble</span><span>Precio</span><span>Estado</span><span></span></div>` + list.map(row).join("")
      : `<p class="none">No hay inmuebles con este filtro.</p>`;
  }

  document.addEventListener("click", e => {
    const f = e.target.closest("[data-f]"); if (f) { filtro = f.dataset.f; render(); return; }
    if (e.target.closest("[data-soon]")) toast("En la demo solo está activo el listado de inmuebles.");
    const a = e.target.closest("[data-act]"); if (!a || a.tagName === "SELECT") return;
    const p = items.find(i => i.id === a.closest(".row").dataset.id);
    if (a.dataset.act === "star") { p.destacado = !p.destacado; render(); toast(p.destacado ? "Destacado: aparecerá primero en tu web." : "Ya no está destacado."); }
    if (a.dataset.act === "edit") open(p);
    if (a.dataset.act === "del") askDelete(p);
  });
  document.addEventListener("change", e => {
    if (e.target.dataset.act !== "estado") return;
    const p = items.find(i => i.id === e.target.closest(".row").dataset.id);
    p.estado = e.target.value; render();
    toast(`"${p.titulo}" ahora está ${ESTADO[p.estado].toLowerCase()}. Tu web lo mostraría al instante.`);
  });
  $("#q").addEventListener("input", e => { q = e.target.value.trim().toLowerCase(); render(); });

  // Eliminar con confirmación y opción de deshacer
  const conf = $("#confirm");
  function askDelete(p, fromEditor) {
    $("#confirm-t").textContent = `¿Eliminar "${p.titulo}"?`;
    conf.showModal();
    conf.onclick = e => {
      const v = e.target.value; if (!v) return;
      conf.close();
      if (v !== "si") return;
      const idx = items.indexOf(p); items.splice(idx, 1);
      if (fromEditor) ed.close();
      render(); toast("Inmueble eliminado (en la demo vuelve al recargar).");
    };
  }

  // Editor
  const ed = $("#editor"), form = $("#ed-form");
  $("#feats").innerHTML = FEATS.map(f => `<label class="feat"><input type="checkbox" value="${f}"><span>${f}</span></label>`).join("");
  let fotos = [];
  function drawPhotos() {
    $("#photos").innerHTML = fotos.map((f, i) => `<button type="button" class="ph${i === 0 ? " cover" : ""}" data-i="${i}" aria-label="Foto ${i + 1}"><img src="${img(f)}" alt="">${i === 0 ? "<em>Portada</em>" : ""}<span class="ph-x" data-x="${i}" aria-label="Quitar">×</span></button>`).join("") +
      `<label class="ph ph-add"><input type="file" accept="image/*" multiple><span>＋</span><small>Subir fotos</small></label>`;
  }
  $("#photos").addEventListener("click", e => {
    const x = e.target.closest("[data-x]");
    if (x) { fotos.splice(+x.dataset.x, 1); drawPhotos(); return; }
    const b = e.target.closest(".ph[data-i]");
    if (b && +b.dataset.i > 0) { fotos.unshift(...fotos.splice(+b.dataset.i, 1)); drawPhotos(); toast("Nueva foto de portada."); }
  });
  $("#photos").addEventListener("change", e => {
    [...e.target.files].forEach(file => fotos.push(URL.createObjectURL(file)));
    drawPhotos(); toast("Fotos añadidas (solo en tu pantalla, no se suben en la demo).");
  });
  const setUnit = () => $("#ed-unit").textContent = form.operacion.value === "alquiler" ? "€/mes" : "€";
  $$('input[name="operacion"]', form).forEach(r => r.addEventListener("change", setUnit));

  function open(p) {
    editing = p || null;
    const d = p || { titulo: "", precio: "", operacion: "venta", estado: "disponible", tipo: "Piso", descripcion: "", hab: 3, banos: 2, m2: "", localidad: "", extras: [], fotos: [], destacado: false };
    $("#ed-title").textContent = p ? "Editar inmueble" : "Nuevo inmueble";
    $("#ed-del").hidden = !p;
    ["titulo", "descripcion", "hab", "banos", "m2", "localidad"].forEach(k => form[k].value = d[k]);
    form.precio.value = d.precio ? JL.miles(d.precio) : "";
    form.operacion.value = d.operacion; form.estado.value = d.estado; form.tipo.value = d.tipo; form.destacado.checked = !!d.destacado;
    $$("#feats input").forEach(c => c.checked = d.extras.includes(c.value));
    fotos = [...d.fotos]; drawPhotos(); setUnit();
    $$(".bad", form).forEach(i => i.classList.remove("bad"));
    ed.showModal(); ed.querySelector(".ed-body").scrollTop = 0;
  }
  $("#add").addEventListener("click", () => open());
  $("#add-m").addEventListener("click", () => open());
  $(".ed-x").addEventListener("click", () => ed.close());
  $("#ed-del").addEventListener("click", () => askDelete(editing, true));

  form.addEventListener("submit", e => {
    e.preventDefault();
    const precio = +String(form.precio.value).replace(/\D/g, "");
    form.titulo.classList.toggle("bad", !form.titulo.value.trim());
    form.precio.classList.toggle("bad", !precio);
    if (!form.titulo.value.trim() || !precio) { $(".bad", form).focus(); return; }
    const d = {
      titulo: form.titulo.value.trim(), precio, operacion: form.operacion.value, estado: form.estado.value, tipo: form.tipo.value,
      descripcion: form.descripcion.value, hab: +form.hab.value || 0, banos: +form.banos.value || 0, m2: +form.m2.value || 0,
      localidad: form.localidad.value.trim() || "Sin localidad", extras: $$("#feats input:checked").map(c => c.value),
      fotos: fotos.length ? fotos : ["ext-piso"], destacado: form.destacado.checked
    };
    if (editing) Object.assign(editing, d);
    else items.unshift({ id: "nuevo-" + Date.now(), ...d });
    ed.close(); filtro = "todos"; render();
    toast(editing ? "Cambios guardados. En tu web se verían al momento." : "Inmueble publicado. Aparecería ya en tu web.");
  });

  render();
})();
