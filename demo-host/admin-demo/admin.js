/*
 * Panel de gestión · VISTA DEMO.
 * No hay login, servidor ni base de datos: los cambios se guardan en
 * localStorage para que la web pública de este mismo navegador los muestre.
 */
(function () {
  var V = window.VILLALON, A = window.VILLALON_ART;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var EXTRAS = ["Ascensor", "Garaje", "Terraza", "Piscina comunitaria", "Trastero", "Aire acondicionado", "Jardín", "Patio", "Amueblado", "Armarios empotrados", "Calefacción", "Reformado"];
  var FORMAS = { "Piso": "bloque", "Ático": "atico", "Dúplex": "atico", "Adosado": "adosado", "Casa": "chalet", "Local": "local" };
  var CAMPOS = ["titulo", "precio", "descripcion", "operacion", "estado", "hab", "banos", "m2", "zona", "tipo", "extras", "destacado"];

  /* acceso */
  var guardado = false;
  try { guardado = sessionStorage.getItem("villalon-demo-login") === "1"; } catch (e) {}
  function entrar() { $("#login").hidden = true; $("#app").hidden = false; }
  if (guardado) entrar();
  $("#login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    try { sessionStorage.setItem("villalon-demo-login", "1"); } catch (err) {}
    entrar();
  });

  var hoy = new Date();
  $("#fecha").textContent = hoy.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }).replace(/^./, function (c) { return c.toUpperCase(); });

  /* pestañas */
  $$(".adm-tabs [data-tab]").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".adm-tabs [data-tab]").forEach(function (x) { x.classList.toggle("is-on", x === b); });
      $("#tab-inmuebles").hidden = b.dataset.tab !== "inmuebles";
      $("#tab-solicitudes").hidden = b.dataset.tab !== "solicitudes";
      window.scrollTo(0, 0);
    });
  });

  /* datos */
  var lista;
  function cargar() { lista = V.inmuebles(); }
  function guardar(p, esNuevo) {
    var c = V.leerCambios();
    if (esNuevo || (c.__nuevos || []).some(function (n) { return n.id === p.id; })) {
      c.__nuevos = (c.__nuevos || []).filter(function (n) { return n.id !== p.id; });
      c.__nuevos.unshift(p);
    } else {
      var d = {};
      CAMPOS.forEach(function (k) { d[k] = p[k]; });
      c[p.id] = d;
    }
    V.guardarCambios(c);
  }
  function borrar(id) {
    var c = V.leerCambios();
    c.__nuevos = (c.__nuevos || []).filter(function (n) { return n.id !== id; });
    if (V.BASE.some(function (b) { return b.id === id; })) c.__borrados = (c.__borrados || []).concat(id);
    V.guardarCambios(c);
  }

  /* resumen */
  function stats() {
    var n = function (e) { return lista.filter(function (p) { return p.estado === e; }).length; };
    var S = [["Publicados", lista.length, "total"], ["Disponibles", n("disponible"), "disp"], ["Reservados", n("reservado"), "res"], ["Vendidos", n("vendido"), "ven"], ["Alquilados", n("alquilado"), "alq"]];
    $("#stats").innerHTML = S.map(function (s) { return '<div class="adm-stat adm-stat--' + s[2] + '"><b>' + s[1] + "</b><span>" + s[0] + "</span></div>"; }).join("");
  }

  /* listado */
  function thumb(p) { return p.foto ? '<img src="' + p.foto + '" alt="">' : A.portada(p); }
  function filas() {
    var q = $("#q").value.trim().toLowerCase(), fe = $("#f-estado").value;
    var res = lista.filter(function (p) {
      return (!fe || p.estado === fe) && (!q || (p.titulo + " " + p.zona + " " + p.tipo).toLowerCase().indexOf(q) > -1);
    });
    $("#filas").innerHTML = res.length ? res.map(function (p) {
      return '<div class="adm-fila" role="row" data-id="' + p.id + '">' +
        '<div class="adm-fila__inm" role="cell"><div class="adm-fila__img">' + thumb(p) + '</div><div><b>' + p.titulo + "</b><small>" + p.tipo + " · " + p.zona + (p.hab ? " · " + p.hab + " hab." : "") + " · " + p.m2 + " m²</small></div></div>" +
        '<div class="adm-fila__precio" role="cell">' + V.precio(p) + "</div>" +
        '<div class="adm-fila__op" role="cell"><span class="adm-op adm-op--' + p.operacion + '">' + (p.operacion === "venta" ? "Venta" : "Alquiler") + "</span></div>" +
        '<div role="cell"><label class="adm-estado adm-estado--' + p.estado + '"><span class="sr">Estado</span><select data-estado>' +
          Object.keys(V.ESTADOS).map(function (k) { return '<option value="' + k + '"' + (k === p.estado ? " selected" : "") + ">" + V.ESTADOS[k] + "</option>"; }).join("") +
        "</select></label></div>" +
        '<div role="cell"><button type="button" class="adm-star' + (p.destacado ? " is-on" : "") + '" data-star aria-pressed="' + !!p.destacado + '" aria-label="Destacar en portada">★</button></div>' +
        '<div role="cell"><button type="button" class="adm-editar" data-editar>Editar</button></div>' +
      "</div>";
    }).join("") : '<p class="adm-vacio">No hay inmuebles con ese filtro.</p>';
  }
  function refrescar() { cargar(); stats(); filas(); }
  refrescar();
  $("#q").addEventListener("input", filas);
  $("#f-estado").addEventListener("change", filas);

  $("#filas").addEventListener("change", function (e) {
    if (!e.target.matches("[data-estado]")) return;
    var p = porId(e.target.closest(".adm-fila").dataset.id);
    p.estado = e.target.value;
    guardar(p);
    refrescar();
    toast("Estado cambiado a <b>" + V.ESTADOS[p.estado].toLowerCase() + "</b>. Ya se ve así en tu web.", p);
  });
  $("#filas").addEventListener("click", function (e) {
    var fila = e.target.closest(".adm-fila"); if (!fila) return;
    var p = porId(fila.dataset.id);
    if (e.target.closest("[data-star]")) {
      p.destacado = !p.destacado; guardar(p); refrescar();
      toast(p.destacado ? "Destacado: aparece en la portada de tu web." : "Ya no aparece entre los destacados.", p);
    } else if (e.target.closest("[data-editar]") || (!e.target.closest("select,label") && window.matchMedia("(max-width: 899px)").matches)) {
      abrir(p);
    }
  });
  function porId(id) { return lista.find(function (p) { return p.id === id; }); }

  /* editor */
  var modal = $("#modal"), ed = $("#editor"), actual = null, esNuevo = false, fotosSesion = [];
  V.TIPOS.forEach(function (t) { $("#ed-tipo").add(new Option(t, t)); });
  V.ZONAS.forEach(function (z) { $("#ed-zona").add(new Option(z, z)); });
  function pintaExtras(sel) {
    var todos = EXTRAS.slice();
    sel.forEach(function (x) { if (todos.indexOf(x) < 0) todos.push(x); });
    $("#ed-extras").innerHTML = todos.map(function (x) {
      return '<label class="adm-check"><input type="checkbox" value="' + x + '"' + (sel.indexOf(x) > -1 ? " checked" : "") + "><span>" + x + "</span></label>";
    }).join("");
  }
  function pintaFotos(p) {
    var g = p.foto || !p.arte ? [] : A.galeria(p);
    $("#ed-fotos").innerHTML = fotosSesion.map(function (u) { return '<figure><img src="' + u + '" alt=""><figcaption>Nueva</figcaption></figure>'; }).join("") +
      g.map(function (f, i) { return "<figure>" + f.svg + (i === 0 && !fotosSesion.length ? "<figcaption>Portada</figcaption>" : "") + "</figure>"; }).join("") +
      (!g.length && !fotosSesion.length ? '<p class="adm-sinfotos">Todavía no hay fotos.</p>' : "");
  }
  function unidad() { $("#ed-unidad").textContent = ed.operacion.value === "alquiler" ? "(€/mes)" : "(€)"; ed.precio.step = ed.operacion.value === "alquiler" ? 10 : 500; }
  ed.operacion.addEventListener("change", unidad);

  function abrir(p) {
    esNuevo = !p;
    fotosSesion = [];
    actual = p ? JSON.parse(JSON.stringify(p)) : {
      id: "nuevo-" + Date.now().toString(36), demo: true, titulo: "", tipo: "Piso", operacion: "venta", precio: "", zona: V.ZONAS[0],
      hab: 3, banos: 1, m2: 90, planta: "—", estado: "disponible", destacado: false, extras: [], descripcion: "", arte: { forma: "bloque", tono: Math.floor(Math.random() * 5) }
    };
    $("#ed-titulo").textContent = esNuevo ? "Nuevo inmueble" : "Editar inmueble";
    ["titulo", "precio", "descripcion", "operacion", "estado", "hab", "banos", "m2", "zona", "tipo"].forEach(function (k) { ed[k].value = actual[k]; });
    ed.destacado.checked = !!actual.destacado;
    pintaExtras(actual.extras || []);
    pintaFotos(actual);
    unidad();
    $("#ed-borrar").hidden = esNuevo;
    $$(".campo--error", ed).forEach(function (c) { c.classList.remove("campo--error"); });
    modal.hidden = false;
    document.body.classList.add("adm-bloq");
    $(".adm-editor__body").scrollTop = 0;
    setTimeout(function () { (esNuevo ? ed.titulo : $(".adm-x")).focus(); }, 30);
  }
  function cerrar() { modal.hidden = true; document.body.classList.remove("adm-bloq"); }
  $$("[data-cerrar]", modal).forEach(function (b) { b.addEventListener("click", cerrar); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) cerrar(); });
  $("#nuevo").addEventListener("click", function () { abrir(null); });

  $("#ed-file").addEventListener("change", function (e) {
    Array.prototype.forEach.call(e.target.files, function (f) { fotosSesion.push(URL.createObjectURL(f)); });
    pintaFotos(actual);
    toast("Fotos añadidas a la ficha. En la demo no se suben a ningún servidor.");
    e.target.value = "";
  });
  ed.tipo.addEventListener("change", function () { if (actual && actual.arte) { actual.arte.forma = FORMAS[ed.tipo.value] || "bloque"; pintaFotos(actual); } });

  ed.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    [ed.titulo, ed.precio].forEach(function (i) {
      var mal = !String(i.value).trim();
      i.closest(".campo").classList.toggle("campo--error", mal);
      if (mal && ok) { i.focus(); ok = false; }
    });
    if (!ok) return;
    actual.titulo = ed.titulo.value.trim();
    actual.precio = Math.max(0, Math.round(+ed.precio.value));
    actual.descripcion = ed.descripcion.value.trim() || "Pide más información a la agencia.";
    ["operacion", "estado", "zona", "tipo"].forEach(function (k) { actual[k] = ed[k].value; });
    ["hab", "banos", "m2"].forEach(function (k) { actual[k] = Math.max(0, +ed[k].value || 0); });
    actual.extras = $$("#ed-extras input:checked").map(function (i) { return i.value; });
    actual.destacado = ed.destacado.checked;
    if (esNuevo) actual.arte.forma = FORMAS[actual.tipo] || "bloque";
    guardar(actual, esNuevo);
    cerrar();
    refrescar();
    toast(esNuevo ? "Inmueble publicado. Ya aparece en tu web." : "Cambios guardados. Ya se ven en tu web.", actual);
  });
  $("#ed-borrar").addEventListener("click", function () {
    if (!confirm("¿Eliminar «" + actual.titulo + "»? Dejará de verse en la web.")) return;
    borrar(actual.id); cerrar(); refrescar();
    toast("Inmueble eliminado de la web.");
  });

  /* aviso inferior */
  var tt;
  function toast(html, p) {
    var t = $("#toast");
    t.innerHTML = "<span>" + html + "</span>" + (p ? '<a href="../inmueble/?id=' + encodeURIComponent(p.id) + '" target="_blank" rel="noopener">Ver en la web</a>' : "");
    t.hidden = false;
    clearTimeout(tt); tt = setTimeout(function () { t.hidden = true; }, 5000);
  }

  $("#reset").addEventListener("click", function () {
    V.resetCambios(); refrescar(); toast("Demo restablecida con los inmuebles de ejemplo.");
  });

  /* solicitudes de ejemplo */
  var SOL = [
    ["valoracion", "Solicitud de valoración", "Piso · Sevilla Este", "Hoy, 10:42", "Quiere vender un piso de 3 dormitorios con garaje."],
    ["info", "Pide información", "Ático con terraza de 40 m²", "Ayer, 19:15", "Pregunta si se puede visitar esta semana por la tarde."],
    ["alquiler", "Quiere alquilar su vivienda", "Casa · Santa Clara", "Ayer, 12:03", "Busca inquilino de larga duración y gestión del alquiler."]
  ];
  $("#solicitudes").innerHTML = SOL.map(function (s) {
    return '<article class="adm-solc adm-solc--' + s[0] + '"><header><span>' + s[1] + "</span><time>" + s[3] + "</time></header><b>" + s[2] + "</b><p>" + s[4] + '</p><div><button type="button" class="adm-editar">Llamar</button><button type="button" class="adm-editar">WhatsApp</button></div></article>';
  }).join("") + '<p class="adm-nota">Solicitudes de ejemplo. En la web real llegan aquí y a tu correo cada vez que alguien rellena un formulario.</p>';
})();
