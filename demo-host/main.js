(() => {
  // Móvil público del salón (Fresha / directorios). WhatsApp sin confirmar: cambiar aquí si usan otro número.
  const WA_NUMBER = "34623580199";
  const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
  const root = document.documentElement;
  root.classList.remove("no-js");
  root.classList.add("js");

  // Enlaces de WhatsApp con mensaje preparado.
  const bindWa = (a) => {
    a.href = waLink(a.dataset.wa);
    a.target = "_blank";
    a.rel = "noopener";
  };
  document.querySelectorAll("[data-wa]").forEach(bindWa);

  // Cabecera al hacer scroll.
  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Menú móvil.
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("menu");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    menu.hidden = !open;
  };
  toggle.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  window.addEventListener("resize", () => { if (window.innerWidth > 1020) setMenu(false); });

  // Aparición suave.
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  // Grupos de chips de selección única.
  const singleSelect = (buttons, onPick) => {
    buttons.forEach((b) => b.addEventListener("click", () => {
      buttons.forEach((o) => { o.classList.toggle("is-on", o === b); o.setAttribute("aria-pressed", String(o === b)); });
      onPick(b);
    }));
  };

  // "¿Cómo es tu pelo?": solo propone servicios que el salón ya ofrece.
  const hairName = { liso: "liso", ondulado: "ondulado", rizado: "rizado", encrespado: "con encrespamiento" };
  const goalName = { luz: "darle luz", canas: "cubrir las canas", manejable: "que sea más manejable", evento: "un peinado para un evento" };
  const advice = {
    luz: {
      liso: ["Mechas balayage", "Luz que nace en medios y puntas y crece sin marcar raíz. En liso se ve el degradado limpio y elegante."],
      ondulado: ["Mechas balayage", "La onda reparte la luz sola: un balayage suave queda natural y se mantiene meses."],
      rizado: ["Balayage para rizo", "Iluminamos por mechones para que cada rizo tenga su reflejo, cuidando la hidratación."],
      encrespado: ["Mechas + queratina", "Primero damos luz y después sellamos con queratina para que el color brille y no se encrespe."],
    },
    canas: {
      liso: ["Tinte de cabello", "Color uniforme de raíz a puntas, con un tono elegido contigo que cubra la cana y favorezca a tu piel."],
      ondulado: ["Tinte + reflejos", "Cubrimos la cana y añadimos reflejos para que el crecimiento se note menos."],
      rizado: ["Tinte de cabello", "Cobertura completa con productos que respetan el rizo y lo dejan brillante."],
      encrespado: ["Tinte + tratamiento", "Cubrimos la cana y terminamos con un tratamiento que aporta suavidad y brillo."],
    },
    manejable: {
      liso: ["Tratamiento de queratina", "Más brillo y un pelo que se seca antes y se peina solo."],
      ondulado: ["Alisado permanente", "Si quieres olvidarte de la plancha, el alisado deja el pelo liso durante meses."],
      rizado: ["Corte para pelo rizado", "Un buen corte pensado para el rizo cambia todo: menos volumen donde no lo quieres y más definición."],
      encrespado: ["Tratamiento de queratina", "Controla el encrespamiento sin perder movimiento. Ideal para la humedad y el calor de aquí."],
    },
    evento: {
      liso: ["Trenzado o recogido", "Trenzas y recogidos que se mantienen todo el día, pensados para tu vestido y tu cara."],
      ondulado: ["Ondas y trenzado", "Aprovechamos tu onda natural para un semirrecogido con trenza que dura toda la celebración."],
      rizado: ["Recogido de rizo", "Recogemos el rizo sin aplastarlo, para que se luzca con definición."],
      encrespado: ["Queratina + peinado", "Unos días antes, queratina; el día del evento, peinado. Así llega el pelo perfecto."],
    },
  };
  const finder = { hair: "liso", goal: "luz" };
  const fTitle = document.getElementById("finder-title");
  const fText = document.getElementById("finder-text");
  const fWa = document.getElementById("finder-wa");
  const renderFinder = () => {
    const [title, text] = advice[finder.goal][finder.hair];
    fTitle.textContent = title;
    fText.textContent = text;
    fWa.dataset.wa = `Hola Sinfo, tengo el pelo ${hairName[finder.hair]} y me gustaría ${goalName[finder.goal]}. ¿Me recomiendas ${title.toLowerCase()}? Quería pedir cita.`;
    bindWa(fWa);
  };
  singleSelect(document.querySelectorAll("[data-hair]"), (b) => { finder.hair = b.dataset.hair; renderFinder(); });
  singleSelect(document.querySelectorAll("[data-goal]"), (b) => { finder.goal = b.dataset.goal; renderFinder(); });
  renderFinder();

  // Filtros de galería.
  const shots = document.querySelectorAll(".shot");
  singleSelect(document.querySelectorAll("[data-filter]"), (b) => {
    const f = b.dataset.filter;
    shots.forEach((s) => s.classList.toggle("is-hidden", f !== "todo" && s.dataset.cat !== f));
  });

  // Formulario de cita: prepara un mensaje de WhatsApp, no envía nada a ningún servidor.
  const form = document.getElementById("cita-form");
  const hint = document.getElementById("franja-hint");
  const tarde = form.querySelector('input[name="franja"][value="por la tarde"]');
  const manana = form.querySelector('input[name="franja"][value="por la mañana"]');
  form.querySelectorAll('input[name="dia"]').forEach((r) => r.addEventListener("change", () => {
    const sabado = form.dia.value === "sábado";
    tarde.disabled = sabado;
    hint.hidden = !sabado;
    if (sabado) manana.checked = true;
  }));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = form.nombre.value.trim();
    if (!nombre) {
      form.nombre.classList.add("is-invalid");
      form.nombre.focus();
      return;
    }
    form.nombre.classList.remove("is-invalid");
    const msg = `Hola Sinfo, soy ${nombre}. Me gustaría pedir cita para ${form.servicio.value.toLowerCase()} el ${form.dia.value} ${form.franja.value}. ¿Qué hueco tienes?`;
    window.open(waLink(msg), "_blank", "noopener");
  });
})();
