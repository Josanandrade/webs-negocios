/* Vista previa estática del área de gestión.
   No hay backend ni persistencia: las acciones solo cambian lo que se ve en pantalla
   y se pierden al recargar. */
(function () {
  var D = window.MB;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var view = $("[data-viewport]");
  var inm = D.inmuebles.map(function (p) { return Object.assign({}, p); });
  var con = D.consultas.map(function (c) { return Object.assign({}, c); });
  var pro = D.propietarios.map(function (c) { return Object.assign({}, c); });

  var ICON = {
    edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
    hide: '<svg viewBox="0 0 24 24"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="2.5"/><path d="M4 4l16 16"/></svg>',
    pub: '<svg viewBox="0 0 24 24"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="2.5"/></svg>',
    res: '<svg viewBox="0 0 24 24"><path d="M7 4h10v16l-5-4-5 4z"/></svg>',
    sold: '<svg viewBox="0 0 24 24"><path d="M5 12l4 4 10-10"/></svg>',
    call: '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
    wa: '<svg viewBox="0 0 24 24"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="2.5"/></svg>',
    cal: '<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>',
    up: '<svg viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5M4 20h16"/></svg>'
  };
  function ini(n) { return n.split(" ").map(function (w) { return w[0]; }).slice(0, 2).join(""); }
  function byRef(r) { return inm.filter(function (p) { return p.ref === r; })[0]; }
  function thumb(p, uid, tag) { return '<div class="thumb">' + D.art(p, { uid: uid }) + (tag === false ? "" : "<em>Ejemplo</em>") + "</div>"; }
  function pill(e) { return '<span class="pill ' + e + '">' + D.ESTADOS[e] + "</span>"; }

  /* Toasts */
  var toasts = $("[data-toasts]");
  function toast(msg) {
    var t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = "<b>Demo</b><span>" + msg + "</span>";
    toasts.appendChild(t);
    while (toasts.children.length > 3) toasts.removeChild(toasts.firstChild);
    setTimeout(function () { t.classList.add("out"); setTimeout(function () { t.remove(); }, 230); }, 3400);
  }

  function counters() {
    $("[data-c-inm]").textContent = inm.length;
    var nc = con.filter(function (c) { return c.nueva; }).length, np = pro.filter(function (c) { return c.nueva; }).length;
    $("[data-c-con]").textContent = nc || "";
    $("[data-c-pro]").textContent = np || "";
  }

  function countUp(root) {
    $$("[data-n]", root).forEach(function (el) {
      var n = +el.getAttribute("data-n");
      if (reduce || n === 0) { el.textContent = n; return; }
      var t0 = performance.now(), dur = 700;
      (function step(t) {
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(n * e);
        if (k < 1) requestAnimationFrame(step);
      })(t0);
    });
  }

  /* ---------- Vistas ---------- */
  var V = {};

  V.resumen = function () {
    var c = function (e) { return inm.filter(function (p) { return e.indexOf(p.estado) > -1; }).length; };
    var kp = [
      ["Inmuebles publicados", inm.filter(function (p) { return p.publicado; }).length, "en tu web", "#16181D", "#inmuebles"],
      ["Disponibles", c(["disponible"]), "listos para visitar", "#3F6B2A", "#inmuebles"],
      ["Reservados", c(["reservado"]), "con señal", "#B07A1E", "#inmuebles"],
      ["Vendidos / alquilados", c(["vendido", "alquilado"]), "este trimestre", "#A23B22", "#inmuebles"],
      ["Consultas recibidas", con.length, con.filter(function (x) { return x.nueva; }).length + " sin atender", "#6E7F4E", "#consultas"],
      ["Visitas pendientes", D.visitas.length, "esta semana", "#E9B98A", "#resumen"]
    ];
    var semanas = [["S36", 3], ["S37", 5], ["S38", 4], ["S39", 7], ["S40", 6], ["S41", 9], ["S42", 8], ["S43", 12]];
    var max = 12;
    return '<p class="note">Datos de demostración: así se vería el resumen con la actividad de la web.</p>' +
      '<section class="kpis">' + kp.map(function (k) {
        return '<a class="kpi" href="' + k[4] + '" style="--k:' + k[3] + '"><small>' + k[0] + '</small><b data-n="' + k[1] + '">0</b><i>' + k[2] + "</i></a>";
      }).join("") + "</section>" +
      '<section class="cols">' +
        '<div class="panel"><div class="panel-h"><h2>Consultas desde la web</h2><span>Últimas 8 semanas · ejemplo</span></div>' +
          '<div class="chart">' + semanas.map(function (s, i) {
            return '<div><em>' + s[1] + '</em><span style="height:' + Math.round(s[1] / max * 130) + 'px;--d:' + (i * 50) + 'ms"></span><small>' + s[0] + "</small></div>";
          }).join("") + "</div>" +
          '<div class="legend"><span>Cada consulta queda asociada a la referencia del inmueble.</span></div></div>' +
        '<div class="panel"><div class="panel-h"><h2>Próximas visitas</h2><a href="#consultas">Ver consultas</a></div><ul class="clean agenda">' +
          D.visitas.map(function (v) {
            return '<li><span class="when">' + v.dia + "<br>" + v.hora + '</span><div><b>' + v.con + '</b><br><small>' + byRef(v.ref).titulo + '</small></div><span class="ref">' + v.ref + "</span></li>";
          }).join("") + "</ul></div>" +
      "</section>" +
      '<section class="cols">' +
        '<div class="panel"><div class="panel-h"><h2>Últimas consultas</h2><a href="#consultas">Abrir bandeja</a></div><ul class="clean feed">' +
          con.slice(0, 4).map(function (q) {
            return '<li><span class="ava">' + ini(q.nombre) + '</span><div><p><b>' + q.nombre + "</b> · <span class=\"ref\">" + q.ref + "</span></p><p>“" + q.texto + '”</p></div><small>' + q.hace + "</small></li>";
          }).join("") + "</ul></div>" +
        '<div class="panel"><div class="panel-h"><h2>Quieren vender</h2><a href="#propietarios">Ver todas</a></div><ul class="clean feed">' +
          pro.slice(0, 3).map(function (q) {
            return '<li><span class="ava">' + ini(q.nombre) + '</span><div><p><b>' + q.nombre + "</b></p><p>" + q.tipo + " en " + q.zona + '</p></div><small>' + q.fecha + "</small></li>";
          }).join("") + "</ul></div>" +
      "</section>";
  };

  var filtro = "todos";
  V.inmuebles = function () {
    var estados = ["todos", "disponible", "reservado", "vendido", "alquilado", "borrador"];
    var n = function (e) { return e === "todos" ? inm.length : inm.filter(function (p) { return p.estado === e; }).length; };
    var list = inm.filter(function (p) { return filtro === "todos" || p.estado === filtro; });
    function acts(p, i) {
      return '<div class="actions">' +
        '<button class="icon-btn" data-act="editar" data-i="' + i + '" data-tip="Editar" aria-label="Editar ' + p.ref + '">' + ICON.edit + "<span>Editar</span></button>" +
        (p.publicado
          ? '<button class="icon-btn" data-act="ocultar" data-i="' + i + '" data-tip="Ocultar de la web" aria-label="Ocultar ' + p.ref + '">' + ICON.hide + "<span>Ocultar</span></button>"
          : '<button class="icon-btn" data-act="publicar" data-i="' + i + '" data-tip="Publicar en la web" aria-label="Publicar ' + p.ref + '">' + ICON.pub + "<span>Publicar</span></button>") +
        '<button class="icon-btn" data-act="reservado" data-i="' + i + '" data-tip="Marcar reservado" aria-label="Marcar ' + p.ref + ' como reservado">' + ICON.res + "<span>Reservado</span></button>" +
        '<button class="icon-btn" data-act="vendido" data-i="' + i + '" data-tip="' + (p.operacion === "alquiler" ? "Marcar alquilado" : "Marcar vendido") + '" aria-label="Marcar ' + p.ref + ' como cerrado">' + ICON.sold + "<span>" + (p.operacion === "alquiler" ? "Alquilado" : "Vendido") + "</span></button></div>";
    }
    function sw(p, i) {
      return '<span class="pub"><button class="switch" role="switch" aria-checked="' + p.publicado + '" data-act="toggle" data-i="' + i + '" aria-label="Publicado en la web: ' + p.ref + '"></button>' + (p.publicado ? "Publicado" : "Borrador") + "</span>";
    }
    return '<p class="note">Inmuebles de ejemplo · datos de demostración. Las acciones son una simulación: no se guarda nada.</p>' +
      '<div class="tabs" role="tablist" data-tabs>' + estados.map(function (e) {
        return '<button role="tab" aria-selected="' + (e === filtro) + '" data-f="' + e + '">' + (e === "todos" ? "Todos" : D.ESTADOS[e]) + "<b>" + n(e) + "</b></button>";
      }).join("") + '<span class="tabs-ind" data-tabs-ind></span></div>' +
      '<div class="table-wrap"><table><thead><tr><th>Foto</th><th>Referencia</th><th>Tipo</th><th>Ubicación</th><th>Precio</th><th>Estado</th><th>Web</th><th><span class="sr">Acciones</span></th></tr></thead><tbody>' +
      list.map(function (p) {
        var i = inm.indexOf(p);
        return '<tr data-row="' + i + '"><td>' + thumb(p, "t" + i) + '</td><td><span class="ref">' + p.ref + '</span><span class="t-title">' + p.titulo + '</span></td><td>' + p.tipo + '<br><span class="t-sub">' + (p.operacion === "venta" ? "Venta" : "Alquiler") + '</span></td><td>' + p.zona + '<br><span class="t-sub">Sevilla</span></td><td class="price">' + D.fmtPrecio(p) + '</td><td data-pill>' + pill(p.estado) + "</td><td>" + sw(p, i) + "</td><td>" + acts(p, i) + "</td></tr>";
      }).join("") + "</tbody></table></div>" +
      '<div class="cards">' + list.map(function (p) {
        var i = inm.indexOf(p);
        return '<article class="icard" data-row="' + i + '"><div class="icard-top">' + thumb(p, "k" + i) + '<div><span class="ref">' + p.ref + '</span><p style="margin:4px 0 2px;font-weight:600;line-height:1.25">' + p.titulo + '</p><p class="t-sub" style="margin:0">' + p.tipo + " · " + p.zona + '</p><p class="price" style="margin:6px 0 0">' + D.fmtPrecio(p) + '</p></div></div><div class="icard-foot"><span data-pill>' + pill(p.estado) + "</span>" + sw(p, i) + acts(p, i) + "</div></article>";
      }).join("") + "</div>";
  };

  var draft = { titulo: "", tipo: "Piso", operacion: "venta", precio: "", zona: "Los Remedios", hab: 3, banos: 2, m2: "", estado: "borrador" };
  V.nuevo = function () {
    var extras = ["Ascensor", "Exterior", "Terraza", "Balcón", "Garaje", "Trastero", "Aire acondicionado", "Calefacción", "Portero", "Piscina comunitaria", "Reformado", "Amueblado"];
    return '<p class="note">Formulario de ejemplo: así se daría de alta un inmueble. No se guarda ni se publica nada.</p>' +
      '<div class="editor"><form class="editor-form" data-editor novalidate>' +
        '<section class="fsec"><h2><span>01</span>Datos principales</h2><div class="fgrid">' +
          '<label class="f full">Título del anuncio<input name="titulo" placeholder="Piso exterior con balcón en Los Remedios" maxlength="80"></label>' +
          '<label class="f">Tipo de inmueble<select name="tipo"><option>Piso</option><option>Ático</option><option>Dúplex</option><option>Casa</option><option>Estudio</option><option>Local</option></select></label>' +
          '<div class="f">Operación<div class="seg" data-seg><i></i><button type="button" aria-pressed="true" data-op="venta">Venta</button><button type="button" aria-pressed="false" data-op="alquiler">Alquiler</button></div></div>' +
          '<label class="f">Precio (€)<input name="precio" inputmode="numeric" placeholder="385000"></label>' +
          '<label class="f">Ubicación<input name="zona" value="Los Remedios"></label>' +
        "</div></section>" +
        '<section class="fsec"><h2><span>02</span>Distribución</h2><div class="fgrid">' +
          '<div class="f">Habitaciones<div class="stepper" data-step="hab"><button type="button" data-d="-1" aria-label="Menos habitaciones">−</button><output>3</output><button type="button" data-d="1" aria-label="Más habitaciones">+</button></div></div>' +
          '<div class="f">Baños<div class="stepper" data-step="banos"><button type="button" data-d="-1" aria-label="Menos baños">−</button><output>2</output><button type="button" data-d="1" aria-label="Más baños">+</button></div></div>' +
          '<label class="f">Superficie (m²)<input name="m2" inputmode="numeric" placeholder="118"></label>' +
          '<label class="f">Estado<select name="estado"><option value="borrador">Borrador</option><option value="disponible">Disponible</option><option value="reservado">Reservado</option><option value="vendido">Vendido</option><option value="alquilado">Alquilado</option></select></label>' +
        "</div></section>" +
        '<section class="fsec"><h2><span>03</span>Descripción</h2><label class="f">Texto del anuncio<textarea name="desc" placeholder="Describe la vivienda: orientación, luz, reformas, lo que hay cerca…"></textarea></label></section>' +
        '<section class="fsec"><h2><span>04</span>Características</h2><div class="chips" data-chips>' + extras.map(function (x, i) {
          return '<button type="button" aria-pressed="' + (i < 2) + '">' + x + "</button>";
        }).join("") + "</div></section>" +
        '<section class="fsec"><h2><span>05</span>Fotografías</h2><div class="drop">' +
          [0, 1, 2].map(function (k) { return '<div class="ph">' + D.art(inm[k], { uid: "d" + k }) + "<b>Ejemplo</b></div>"; }).join("") +
          '<button type="button" data-fake="fotos">' + ICON.up + "Añadir fotos</button></div></section>" +
        '<div class="form-actions"><button type="button" class="btn btn-ghost" data-fake="borrador">Guardar borrador</button><button type="button" class="btn btn-alm" data-fake="publicar">Publicar en la web</button></div>' +
      "</form>" +
      '<aside class="preview"><p class="preview-label">Así se verá en tu web</p><div class="pcard" data-pcard></div><p class="preview-foot">La ficha se actualiza mientras escribes.</p></aside></div>';
  };

  function renderPreview(changed) {
    var el = $("[data-pcard]"); if (!el) return;
    var fake = { ref: "REF-NUEVO", tipo: draft.tipo, arte: { kind: { "Ático": "atico", "Casa": "casa", "Dúplex": "casa", "Local": "local" }[draft.tipo] || "bloque", hue: "#C98B5E", floors: 6, tree: true } };
    var precio = draft.precio ? D.fmtPrecio({ precio: +String(draft.precio).replace(/\D/g, ""), operacion: draft.operacion }) : (draft.operacion === "venta" ? "Precio de venta" : "Precio/mes");
    el.innerHTML = '<div class="pcard-art">' + D.art(fake, { uid: "pv" }) + pill(draft.estado) + '</div><div class="pcard-body"><span class="ref">REF-NUEVO · ' + (draft.operacion === "venta" ? "Venta" : "Alquiler") + '</span><p class="pcard-title" data-k="titulo">' + (draft.titulo || "Título del anuncio") + '</p><p class="pcard-specs" data-k="specs">' + draft.hab + " hab. · " + draft.banos + " baños · " + (draft.m2 || "—") + " m² · " + draft.zona + '</p><p class="pcard-price" data-k="precio">' + precio + "</p></div>";
    if (changed) { var t = $('[data-k="' + changed + '"]', el); if (t) t.classList.add("changed"); }
  }

  var sel = 0;
  V.consultas = function () {
    return '<p class="note">Consultas de ejemplo · datos de demostración. Así llegarían los mensajes del formulario de cada inmueble.</p>' +
      '<div class="inbox"><div class="ilist" data-ilist>' + con.map(function (q, i) {
        return '<button type="button" data-q="' + i + '" aria-current="' + (i === sel) + '"><span class="ava">' + ini(q.nombre) + '</span><div><b>' + q.nombre + '</b><p>Sobre <span class="ref">' + q.ref + "</span> · " + q.texto + '</p></div><span class="meta">' + q.hace + '<span class="dot' + (q.nueva ? "" : " off") + '"></span></span></button>';
      }).join("") + '</div><div class="detail" data-detail></div></div>';
  };
  function renderDetail(anim) {
    var q = con[sel], p = byRef(q.ref), el = $("[data-detail]");
    el.innerHTML = '<div class="detail-h"><span class="ava">' + ini(q.nombre) + '</span><div><h2>' + q.nombre + '</h2><p>' + q.canal + " · " + q.hace + "</p></div>" + (q.nueva ? '<span class="pill nueva">Nueva</span>' : '<span class="pill atendida">Atendida</span>') + "</div>" +
      '<div class="bubble">“' + q.texto + "”</div>" +
      '<div class="linked">' + thumb(p, "q") + '<div><span class="ref">' + p.ref + '</span><p style="font-weight:600">' + p.titulo + '</p><p class="t-sub">' + D.fmtPrecio(p) + " · " + D.ESTADOS[p.estado] + "</p></div></div>" +
      '<div class="detail-actions"><button class="btn btn-ghost" data-fake="ver">' + ICON.eye + "Ver consulta</button>" +
      '<button class="btn btn-ghost" data-fake="llamar">' + ICON.call + "Llamar</button>" +
      '<button class="btn btn-ghost" data-fake="wa">' + ICON.wa + "WhatsApp</button>" +
      (q.nueva ? '<button class="btn btn-dark" data-atender>' + ICON.sold + "Marcar como atendida</button>" : "") + "</div>";
    if (anim) { el.classList.remove("swap"); void el.offsetWidth; el.classList.add("swap"); }
  }

  V.propietarios = function () {
    var nuevas = pro.filter(function (x) { return x.nueva; }).length;
    return '<p class="note">Solicitudes de ejemplo · datos de demostración. Llegan desde el formulario “Quiero vender mi vivienda” de la web.</p>' +
      '<section class="funnel"><div class="kpi" style="--k:#A23B22"><small>Solicitudes este mes</small><b data-n="' + pro.length + '">0</b></div><div class="kpi" style="--k:#E9B98A"><small>Sin contactar</small><b data-n="' + nuevas + '">0</b></div><div class="kpi" style="--k:#6E7F4E"><small>Valoraciones agendadas</small><b data-n="1">0</b></div></section>' +
      '<div class="lead-form"><div>' +
        '<div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Teléfono</th><th>Zona</th><th>Tipo</th><th>Fecha</th><th>Estado</th><th><span class="sr">Acciones</span></th></tr></thead><tbody>' +
          pro.map(function (o, i) {
            return '<tr><td><b>' + o.nombre + '</b></td><td class="ref" style="color:var(--tinta-2)">' + o.tel + "</td><td>" + o.zona + "</td><td>" + o.tipo + '</td><td class="t-sub">' + o.fecha + '</td><td data-pro-pill="' + i + '">' + (o.nueva ? '<span class="pill nueva">Nueva</span>' : '<span class="pill atendida">Contactado</span>') + '</td><td><div class="actions"><button class="icon-btn" data-fake="llamar" data-tip="Llamar" aria-label="Llamar a ' + o.nombre + '">' + ICON.call + '</button><button class="icon-btn" data-agendar="' + i + '" data-tip="Agendar valoración" aria-label="Agendar valoración con ' + o.nombre + '">' + ICON.cal + "</button></div></td></tr>";
          }).join("") + "</tbody></table></div>" +
        '<div class="cards">' + pro.map(function (o, i) {
          return '<article class="icard"><div style="padding:14px 14px 10px"><div style="display:flex;justify-content:space-between;gap:8px"><b>' + o.nombre + '</b><span data-pro-pill="' + i + '">' + (o.nueva ? '<span class="pill nueva">Nueva</span>' : '<span class="pill atendida">Contactado</span>') + '</span></div><p class="t-sub" style="margin:4px 0 0">' + o.tipo + " · " + o.zona + " · " + o.fecha + '</p><p class="ref" style="margin:6px 0 0;color:var(--tinta-2)">' + o.tel + '</p></div><div class="icard-foot"><button class="btn btn-ghost btn-sm" data-fake="llamar">' + ICON.call + 'Llamar</button><button class="btn btn-dark btn-sm" data-agendar="' + i + '">' + ICON.cal + "Agendar valoración</button></div></article>";
        }).join("") + "</div></div>" +
        '<aside class="mini-form"><p class="t-sub">En tu web</p><p class="mf-t">Quiero vender mi vivienda</p><div class="mf-f">Nombre</div><div class="mf-f">Teléfono</div><div class="mf-f">Zona · Tipo de inmueble</div><div class="mf-b">Enviar solicitud</div><small>Cada envío aparece aquí como una nueva solicitud. Tu web no solo enseña inmuebles: también te trae cartera.</small></aside>' +
      "</div>";
  };

  var TITLES = { resumen: "Resumen", inmuebles: "Inmuebles", nuevo: "Nuevo inmueble", consultas: "Consultas", propietarios: "Captación de propietarios" };

  /* ---------- Navegación ---------- */
  var ind = $("[data-ind]");
  function moveInd(name) {
    var a = $('[data-nav] a[data-view="' + name + '"]');
    if (a) ind.style.transform = "translateY(" + a.offsetTop + "px)";
  }
  function moveTabsInd() {
    var t = $("[data-tabs] [aria-selected='true']"), i = $("[data-tabs-ind]");
    if (t && i) { i.style.width = t.offsetWidth + "px"; i.style.transform = "translateX(" + t.offsetLeft + "px)"; }
  }

  function route() {
    var name = (location.hash || "#resumen").slice(1);
    if (!V[name]) name = "resumen";
    $$("[data-view]").forEach(function (a) { a.toggleAttribute("aria-current", a.getAttribute("data-view") === name); if (a.hasAttribute("aria-current")) a.setAttribute("aria-current", "page"); });
    moveInd(name);
    $("[data-title]").textContent = TITLES[name];
    document.title = TITLES[name] + " · Vista previa del área de gestión";
    view.innerHTML = V[name]();
    countUp(view);
    if (name === "inmuebles") moveTabsInd();
    if (name === "nuevo") renderPreview();
    if (name === "consultas") renderDetail();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  window.addEventListener("resize", function () { moveTabsInd(); moveInd((location.hash || "#resumen").slice(1)); });

  /* ---------- Interacción (solo visual) ---------- */
  var MSG = {
    editar: "En el desarrollo final se abriría la ficha para editarla.",
    fotos: "En el desarrollo final podrías subir y ordenar las fotos desde aquí.",
    borrador: "En el desarrollo final se guardaría como borrador, sin aparecer en la web.",
    publicar: "En el desarrollo final el inmueble aparecería en tu web al momento.",
    ver: "Esta es la consulta completa, asociada a su inmueble.",
    llamar: "En el desarrollo final se marcaría el número del contacto.",
    wa: "En el desarrollo final se abriría WhatsApp con la conversación."
  };

  function refreshRow(i, which) {
    var p = inm[i];
    $$('[data-row="' + i + '"] [data-pill]').forEach(function (td) {
      td.innerHTML = pill(p.estado);
      var pl = td.firstChild; void pl.offsetWidth; pl.classList.add("flash");
    });
    if (which === "pub") {
      $$('[data-row="' + i + '"] .pub').forEach(function (s) {
        var b = s.querySelector(".switch"); b.setAttribute("aria-checked", String(p.publicado));
        s.lastChild.textContent = p.publicado ? "Publicado" : "Borrador";
      });
    }
  }

  view.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;

    if (b.hasAttribute("data-fake")) { toast(MSG[b.getAttribute("data-fake")]); return; }

    var act = b.getAttribute("data-act");
    if (act) {
      var i = +b.getAttribute("data-i"), p = inm[i];
      if (act === "editar") { toast(MSG.editar); return; }
      if (act === "reservado") { p.estado = "reservado"; refreshRow(i); toast(p.ref + " se vería como Reservado en tu web. No se ha guardado nada."); return; }
      if (act === "vendido") { p.estado = p.operacion === "alquiler" ? "alquilado" : "vendido"; refreshRow(i); toast(p.ref + " se vería como " + D.ESTADOS[p.estado] + " en tu web. No se ha guardado nada."); return; }
      if (act === "ocultar" || act === "publicar" || act === "toggle") {
        p.publicado = act === "toggle" ? !p.publicado : act === "publicar";
        refreshRow(i, "pub");
        $$('[data-row="' + i + '"]').forEach(function (r) { r.classList.toggle("row-gone", !p.publicado); });
        toast(p.publicado ? p.ref + " aparecería en tu web." : p.ref + " dejaría de verse en tu web.");
        return;
      }
    }

    var f = b.getAttribute("data-f");
    if (f) {
      var old = $("[data-tabs-ind]"), from = old ? [old.style.width, old.style.transform] : null;
      filtro = f; view.innerHTML = V.inmuebles();
      var ni = $("[data-tabs-ind]");
      if (from && !reduce) { ni.style.transition = "none"; ni.style.width = from[0]; ni.style.transform = from[1]; void ni.offsetWidth; ni.style.transition = ""; }
      moveTabsInd();
      var first = $('[data-tabs] [data-f="' + f + '"]'); if (first) first.focus();
      return;
    }

    if (b.hasAttribute("data-q")) {
      sel = +b.getAttribute("data-q");
      $$("[data-q]").forEach(function (x) { x.setAttribute("aria-current", String(x === b)); });
      renderDetail(true);
      if (window.innerWidth < 980) $("[data-detail]").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      return;
    }
    if (b.hasAttribute("data-atender")) {
      con[sel].nueva = false;
      var dot = $('[data-q="' + sel + '"] .dot'); if (dot) dot.classList.add("off");
      renderDetail(true); counters();
      toast("Consulta marcada como atendida (solo en esta vista previa).");
      return;
    }
    if (b.hasAttribute("data-agendar")) {
      var k = +b.getAttribute("data-agendar");
      pro[k].nueva = false; counters();
      $$('[data-pro-pill="' + k + '"]').forEach(function (td) { td.innerHTML = '<span class="pill atendida flash">Contactado</span>'; });
      toast("En el desarrollo final se crearía la cita de valoración con " + pro[k].nombre + ".");
      return;
    }

    var seg = b.closest("[data-seg]");
    if (seg) {
      draft.operacion = b.getAttribute("data-op");
      $$("button", seg).forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      seg.classList.toggle("alt", draft.operacion === "alquiler");
      renderPreview("precio"); return;
    }
    var st = b.closest("[data-step]");
    if (st) {
      var key = st.getAttribute("data-step");
      draft[key] = Math.max(0, Math.min(9, draft[key] + (+b.getAttribute("data-d"))));
      st.querySelector("output").textContent = draft[key];
      renderPreview("specs"); return;
    }
    if (b.closest("[data-chips]")) { b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")); return; }
  });

  view.addEventListener("input", function (e) {
    var t = e.target; if (!t.closest("[data-editor]") || !t.name || !(t.name in draft)) return;
    draft[t.name] = t.value;
    renderPreview({ titulo: "titulo", precio: "precio", m2: "specs", zona: "specs" }[t.name]);
  });
  view.addEventListener("change", function (e) {
    var t = e.target; if (!t.closest("[data-editor]")) return;
    if (t.name === "tipo" || t.name === "estado") { draft[t.name] = t.value; renderPreview(); }
  });

  $("[data-search]").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); toast("En el desarrollo final buscaría en toda tu cartera."); }
  });

  counters();
  route();
})();
