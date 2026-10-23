(function () {
  var D = window.ABADES;
  var art = window.ABADES_ART;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var visible = D.PROPERTIES.filter(function (p) { return p.published && p.status !== "borrador"; });
  var zones = unique(visible.map(function (p) { return p.zone; }));
  var types = unique(visible.map(function (p) { return p.type; }));
  function unique(a) { return a.filter(function (v, i) { return a.indexOf(v) === i; }).sort(); }

  /* Header */
  var top = $("[data-top]");
  addEventListener("scroll", function () { top.classList.toggle("is-scrolled", scrollY > 8); }, { passive: true });

  /* Hero gate */
  $("[data-hero-art]").innerHTML = art({ kind: "patio", wall: "#FBF7EF", floors: 2, seed: 21 }, "Ilustración de un patio sevillano");
  var gate = $(".gate");
  setTimeout(function () { gate.classList.add("is-open"); }, reduce ? 0 : 450);

  /* Live card rotating through the latest listings */
  var live = $("[data-live]");
  var liveI = 0;
  var liveList = visible.filter(function (p) { return p.status === "disponible"; });
  function showLive() {
    var p = liveList[liveI % liveList.length];
    live.classList.remove("is-in");
    setTimeout(function () {
      $("[data-live-title]").textContent = p.type + " en " + p.zone;
      $("[data-live-meta]").textContent = p.ref + " · " + D.price(p);
      live.classList.add("is-in");
    }, reduce ? 0 : 320);
    liveI++;
  }
  setTimeout(showLive, reduce ? 0 : 1500);
  if (!reduce) setInterval(function () { if (!document.hidden) showLive(); }, 4200);

  /* Streets marquee */
  var streets = ["Santa Cruz", "Alfalfa", "Arenal", "San Bartolomé", "Encarnación", "Feria", "San Lorenzo", "Museo", "San Vicente", "El Salvador", "Santa Catalina", "San Gil"];
  $("[data-streets]").innerHTML = streets.concat(streets).map(function (s, i) {
    return "<span" + (i >= streets.length ? ' aria-hidden="true"' : "") + ">" + s + "</span>";
  }).join("");

  /* Finder selects */
  function fill(sel, list, first) {
    sel.innerHTML = (first ? '<option value="">' + first + "</option>" : "") + list.map(function (v) { return "<option>" + v + "</option>"; }).join("");
  }
  fill($("[data-zone]"), zones, "Todo el centro");
  fill($("[data-type]"), types, "Cualquiera");
  fill($("[data-zone-sell]"), streets.slice().sort().concat(["Otra zona"]));

  /* Cards */
  var grid = $("[data-grid]");
  grid.innerHTML = visible.map(function (p, i) {
    var st = D.STATUS[p.status];
    var badge = p.status === "disponible" ? "" : '<span class="card__badge card__badge--' + st.tone + '">' + st.label + "</span>";
    var facts = [p.m2 + " m²"];
    if (p.beds) facts.unshift(p.beds + " hab.");
    facts.splice(p.beds ? 1 : 0, 0, p.baths + (p.baths > 1 ? " baños" : " baño"));
    return (
      '<button type="button" class="card reveal' + (st.tone === "done" ? " card--sold" : "") + '" style="--d:' + (i % 3) * 70 + 'ms" data-ref="' + p.ref + '" data-op="' + p.op + '" data-zone="' + p.zone + '" data-type="' + p.type + '">' +
      '<div class="card__art">' + art(p.art, "Ilustración de ejemplo: " + p.title) + "</div>" + badge +
      '<span class="card__demo">Ejemplo</span>' +
      '<div class="card__body"><span class="card__ref"><span>' + p.ref + " · " + p.zone + "</span><span>" + (p.op === "venta" ? "Venta" : "Alquiler") + "</span></span>" +
      "<h3>" + p.title + "</h3>" +
      '<span class="card__price">' + D.price(p) + "</span>" +
      '<span class="card__facts">' + facts.map(function (f) { return "<span>" + f + "</span>"; }).join("") + "</span></div></button>"
    );
  }).join("");

  var state = { op: "", zone: "", type: "" };
  var count = $("[data-count]");
  function apply() {
    var n = 0;
    $$(".card", grid).forEach(function (c) {
      var ok = (!state.op || c.dataset.op === state.op) && (!state.zone || c.dataset.zone === state.zone) && (!state.type || c.dataset.type === state.type);
      var wasHidden = c.classList.contains("is-hidden");
      c.classList.toggle("is-hidden", !ok);
      if (ok) {
        n++;
        if (wasHidden) {
          c.classList.remove("is-in");
          void c.offsetWidth;
          c.classList.add("is-in");
        }
      }
    });
    count.textContent = n === 0 ? "No hay inmuebles con esos filtros ahora mismo." : n + (n === 1 ? " inmueble" : " inmuebles");
    $$(".chip").forEach(function (b) { b.classList.toggle("is-on", b.dataset.filter === state.op); });
  }
  $$(".chip").forEach(function (b) {
    b.addEventListener("click", function () { state.op = b.dataset.filter; apply(); });
  });

  /* Finder segmented control + submit */
  var seg = $(".seg");
  var finderOp = "venta";
  $$("button", seg).forEach(function (b) {
    b.addEventListener("click", function () {
      finderOp = b.dataset.op;
      $$("button", seg).forEach(function (x) { x.setAttribute("aria-checked", String(x === b)); });
      seg.toggleAttribute("data-alt", finderOp === "alquiler");
    });
  });
  $("[data-finder]").addEventListener("submit", function (e) {
    e.preventDefault();
    state = { op: finderOp, zone: $("[data-zone]").value, type: $("[data-type]").value };
    apply();
    $("#inmuebles").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  });

  /* Ficha */
  var sheet = $("[data-sheet]");
  var current;
  grid.addEventListener("click", function (e) {
    var c = e.target.closest(".card");
    if (c) openSheet(c.dataset.ref);
  });
  function openSheet(ref) {
    var p = D.PROPERTIES.filter(function (x) { return x.ref === ref; })[0];
    current = p;
    $("[data-sheet-art]").innerHTML = art(p.art, "Ilustración de ejemplo: " + p.title);
    $("[data-sheet-ref]").textContent = p.ref;
    $("[data-sheet-zone]").textContent = p.zone + " · " + (p.op === "venta" ? "Venta" : "Alquiler");
    $("[data-sheet-title]").textContent = p.title;
    $("[data-sheet-price]").textContent = D.price(p) + (p.status !== "disponible" ? " · " + D.STATUS[p.status].label : "");
    var f = [];
    if (p.beds) f.push(p.beds + " dormitorios");
    f.push(p.baths + (p.baths > 1 ? " baños" : " baño"), p.m2 + " m²", p.type);
    $("[data-sheet-facts]").innerHTML = f.map(function (x) { return "<li>" + x + "</li>"; }).join("");
    $("[data-sheet-blurb]").textContent = p.blurb;
    $("[data-sheet-feats]").innerHTML = p.features.map(function (x) { return "<li>" + x + "</li>"; }).join("");
    $("[data-ask-done]").hidden = true;
    $("[data-ask] button").hidden = false;
    sheet.showModal();
    requestAnimationFrame(function () { sheet.classList.add("is-in"); });
  }
  function closeSheet() {
    sheet.classList.remove("is-in");
    setTimeout(function () { sheet.close(); }, reduce ? 0 : 200);
  }
  $("[data-close]").addEventListener("click", closeSheet);
  sheet.addEventListener("cancel", function (e) { e.preventDefault(); closeSheet(); });
  sheet.addEventListener("click", function (e) { if (e.target === sheet) closeSheet(); });
  $("[data-ask]").addEventListener("submit", function (e) {
    e.preventDefault();
    $("[data-ask-ref]").textContent = current.ref;
    $("[data-ask-done]").hidden = false;
    $("[data-ask] button").hidden = true;
  });

  /* Sell form (demo only, nothing is sent) */
  var sell = $("[data-sell]");
  sell.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = $$("input[required]", sell).filter(function (i) { return !i.value.trim(); });
    $$("input", sell).forEach(function (i) { i.classList.remove("is-bad"); });
    if (bad.length) {
      bad.forEach(function (i) { void i.offsetWidth; i.classList.add("is-bad"); });
      bad[0].focus();
      return;
    }
    var done = $("[data-sell-done]");
    done.hidden = false;
    requestAnimationFrame(function () { done.classList.add("is-in"); });
  });

  /* Contact actions */
  var actions = $("[data-contact]");
  var html = "";
  if (D.CONFIG.phone) html += '<a class="btn btn--ink" href="tel:' + D.CONFIG.phone.replace(/\s/g, "") + '">Llamar · ' + D.CONFIG.phone + "</a>";
  if (D.CONFIG.whatsapp) html += '<a class="btn btn--almagra" href="https://wa.me/34' + D.CONFIG.whatsapp.replace(/\s/g, "") + '" target="_blank" rel="noopener">WhatsApp</a>';
  html += '<a class="btn btn--almagra" href="#vender">Quiero vender</a><a class="btn btn--ink" href="#inmuebles">Ver inmuebles</a>';
  actions.innerHTML = html;

  /* Panel mockup: tiny loop that shows a status change and an incoming lead */
  $$("[data-mock-art]").forEach(function (el) {
    var p = visible[+el.dataset.mockArt];
    el.innerHTML = art(p.art, "");
  });
  var flip = $("[data-mock-flip]");
  var toast = $("[data-mock-toast]");
  var leads = $("[data-mock-leads]");
  var mockOn = false;
  function mockLoop() {
    if (!mockOn || document.hidden) return;
    setTimeout(function () { flip.className = "pill pill--warn"; flip.textContent = "Reservado"; }, 900);
    setTimeout(function () { toast.classList.add("is-in"); leads.textContent = "13"; leads.classList.add("bump"); }, 2200);
    setTimeout(function () { toast.classList.remove("is-in"); leads.classList.remove("bump"); }, 5600);
    setTimeout(function () { flip.className = "pill pill--ok"; flip.textContent = "Disponible"; leads.textContent = "12"; }, 6600);
  }

  /* Reveal on scroll */
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach(function (el, i) {
      if (!el.style.getPropertyValue("--d") && el.parentElement) {
        var sib = $$(".reveal", el.parentElement).indexOf(el);
        el.style.setProperty("--d", Math.min(sib, 5) * 60 + "ms");
      }
      io.observe(el);
    });
    var mo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !mockOn) { mockOn = true; mockLoop(); mockTimer = setInterval(mockLoop, 7600); }
        else if (!en.isIntersecting && mockOn) { mockOn = false; clearInterval(mockTimer); }
      });
    }, { threshold: 0.4 });
    var mockTimer;
    mo.observe($(".mock"));
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  apply();
})();
