/* Inmo Abades · datos de demostración compartidos por la web y la preview del panel.
   Todos los inmuebles, consultas y solicitudes son FICTICIOS y están etiquetados como tal. */
(function () {
  var CONFIG = {
    name: "Inmo Abades",
    area: "Sevilla Centro",
    // Pendiente de confirmar con el negocio. Si se rellena, aparecen los botones de llamada y WhatsApp.
    phone: "",
    whatsapp: "",
  };

  var PROPERTIES = [
    {
      ref: "AB-101", title: "Piso con balcones a calle peatonal", type: "Piso", op: "venta",
      zone: "Santa Cruz", price: 385000, beds: 3, baths: 2, m2: 112, status: "disponible", published: true,
      art: { kind: "fachada", wall: "#E9C46A", floors: 3, seed: 3 },
      features: ["Balcones de forja", "Techos altos", "Suelo hidráulico", "Ascensor"],
      blurb: "Tres dormitorios exteriores en una calle peatonal del barrio, con luz de mañana y balcones a la calle.",
      views: 412, leads: 9, updated: "hace 2 días",
    },
    {
      ref: "AB-102", title: "Ático con terraza y vistas a la Giralda", type: "Ático", op: "venta",
      zone: "Alfalfa", price: 459000, beds: 2, baths: 2, m2: 96, status: "reservado", published: true,
      art: { kind: "atico", wall: "#F1E4CF", floors: 2, seed: 7 },
      features: ["Terraza de 40 m²", "Vistas despejadas", "Aire acondicionado", "Trastero"],
      blurb: "Dos dormitorios y una terraza pensada para vivir fuera buena parte del año.",
      views: 638, leads: 14, updated: "ayer",
    },
    {
      ref: "AB-103", title: "Casa-patio para reformar a su gusto", type: "Casa", op: "venta",
      zone: "San Bartolomé", price: 690000, beds: 5, baths: 3, m2: 248, status: "disponible", published: true,
      art: { kind: "patio", wall: "#FBF7EF", floors: 2, seed: 11 },
      features: ["Patio central", "Azotea transitable", "Dos plantas", "Pozo original"],
      blurb: "Casa de dos plantas alrededor de un patio con columnas. Necesita reforma; la estructura acompaña.",
      views: 287, leads: 6, updated: "hace 4 días",
    },
    {
      ref: "AB-104", title: "Apartamento junto a la calle Adriano", type: "Apartamento", op: "alquiler",
      zone: "Arenal", price: 1150, beds: 1, baths: 1, m2: 58, status: "disponible", published: true,
      art: { kind: "fachada", wall: "#B5502F", floors: 4, seed: 5 },
      features: ["Amueblado", "Reformado", "Calefacción", "Cerca del río"],
      blurb: "Un dormitorio, reformado y amueblado, para entrar a vivir a cinco minutos del Paseo Colón.",
      views: 521, leads: 11, updated: "hoy",
    },
    {
      ref: "AB-105", title: "Piso luminoso frente a las Setas", type: "Piso", op: "alquiler",
      zone: "Encarnación", price: 1450, beds: 2, baths: 2, m2: 84, status: "alquilado", published: true,
      art: { kind: "fachada", wall: "#D9A06B", floors: 4, seed: 9 },
      features: ["Exterior", "Ascensor", "Cocina equipada", "Armarios empotrados"],
      blurb: "Dos dormitorios exteriores en una finca con ascensor junto a la plaza de la Encarnación.",
      views: 344, leads: 8, updated: "hace 1 semana",
    },
    {
      ref: "AB-106", title: "Local a pie de calle con escaparate", type: "Local", op: "venta",
      zone: "San Lorenzo", price: 210000, beds: 0, baths: 1, m2: 74, status: "vendido", published: true,
      art: { kind: "local", wall: "#E7D8BE", floors: 2, seed: 2 },
      features: ["Escaparate doble", "Altura libre 3,6 m", "Licencia previa", "Aseo"],
      blurb: "Local diáfano con dos huecos de escaparate en una calle de paso.",
      views: 198, leads: 4, updated: "hace 2 semanas",
    },
    {
      ref: "AB-107", title: "Dúplex con patio interior", type: "Dúplex", op: "venta",
      zone: "Museo", price: 320000, beds: 2, baths: 1, m2: 88, status: "borrador", published: false,
      art: { kind: "patio", wall: "#F4EBDD", floors: 3, seed: 13 },
      features: ["Patio privado", "Dos alturas", "Vigas de madera"],
      blurb: "Borrador pendiente de fotos.",
      views: 0, leads: 0, updated: "borrador",
    },
    {
      ref: "AB-108", title: "Piso de dos dormitorios en calle Feria", type: "Piso", op: "alquiler",
      zone: "Feria", price: 1300, beds: 2, baths: 1, m2: 76, status: "disponible", published: true,
      art: { kind: "fachada", wall: "#8FA79A", floors: 3, seed: 4 },
      features: ["Balcón", "Reformado", "Mascotas bienvenidas", "Lavadero"],
      blurb: "Dos dormitorios reformados con balcón a la calle, en pleno ambiente del jueves.",
      views: 266, leads: 5, updated: "hace 3 días",
    },
  ];

  var STATUS = {
    disponible: { label: "Disponible", tone: "ok" },
    reservado: { label: "Reservado", tone: "warn" },
    vendido: { label: "Vendido", tone: "done" },
    alquilado: { label: "Alquilado", tone: "done" },
    borrador: { label: "Borrador", tone: "draft" },
  };

  function fmt(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function price(p) {
    var n = fmt(p.price);
    return p.op === "alquiler" ? n + " €/mes" : n + " €";
  }

  window.ABADES = { CONFIG: CONFIG, PROPERTIES: PROPERTIES, STATUS: STATUS, price: price, fmt: fmt };
})();
