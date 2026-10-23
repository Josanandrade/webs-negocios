/* Datos de la demo. Todo lo que no está en CONFIG es de demostración:
   inmuebles, consultas y solicitudes son ficticios y van etiquetados como tales. */
window.MB = {
  CONFIG: {
    nombre: "Maite Bartrina Díaz",
    corto: "Maite Bartrina",
    zona: "Los Remedios · Sevilla",
    // Pendientes de confirmar con el negocio. Vacío oculta los botones de llamada/WhatsApp.
    telefono: "",
    whatsapp: "",
    email: "",
    direccion: ""
  },

  inmuebles: [
    {
      ref: "REF-001", titulo: "Piso con balcón corrido junto a República Argentina",
      tipo: "Piso", operacion: "venta", precio: 385000, zona: "Los Remedios",
      hab: 3, banos: 2, m2: 118, planta: "4ª con ascensor", estado: "disponible", publicado: true,
      arte: { kind: "bloque", hue: "#C98B5E", floors: 6, tree: true },
      desc: "Exterior a dos calles, salón con balcón corrido y tres dormitorios dobles. Cocina independiente con lavadero.",
      extras: ["Ascensor", "Exterior", "Balcón", "Aire acondicionado", "Trastero"]
    },
    {
      ref: "REF-002", titulo: "Ático con terraza y vistas al río",
      tipo: "Ático", operacion: "venta", precio: 545000, zona: "Los Remedios",
      hab: 2, banos: 2, m2: 96, planta: "Ático", estado: "reservado", publicado: true,
      arte: { kind: "atico", hue: "#E3C9A6", floors: 7, tree: false },
      desc: "Terraza de 40 m² orientada a poniente. Salón luminoso, dos dormitorios con baño propio.",
      extras: ["Terraza", "Vistas", "Ascensor", "Garaje opcional"]
    },
    {
      ref: "REF-003", titulo: "Piso familiar a un paso del parque de los Príncipes",
      tipo: "Piso", operacion: "alquiler", precio: 1350, zona: "Los Remedios",
      hab: 4, banos: 2, m2: 135, planta: "2ª con ascensor", estado: "disponible", publicado: true,
      arte: { kind: "bloque", hue: "#B6704F", floors: 5, tree: true },
      desc: "Cuatro dormitorios, salón comedor amplio y cocina reformada. Se alquila sin amueblar.",
      extras: ["Reformado", "Ascensor", "Calefacción", "Portero"]
    },
    {
      ref: "REF-004", titulo: "Local a pie de calle con escaparate doble",
      tipo: "Local", operacion: "alquiler", precio: 1900, zona: "Los Remedios",
      hab: 0, banos: 1, m2: 84, planta: "Bajo", estado: "alquilado", publicado: true,
      arte: { kind: "local", hue: "#D7B98E", floors: 4, tree: true },
      desc: "Local diáfano con doble escaparate y salida de humos. Ideal para comercio de barrio.",
      extras: ["Escaparate", "Diáfano", "Salida de humos"]
    },
    {
      ref: "REF-005", titulo: "Dúplex con patio en Triana",
      tipo: "Dúplex", operacion: "venta", precio: 329000, zona: "Triana",
      hab: 3, banos: 2, m2: 104, planta: "Bajo y 1ª", estado: "vendido", publicado: true,
      arte: { kind: "casa", hue: "#EBD9B4", floors: 2, tree: false },
      desc: "Dúplex con patio andaluz, dormitorio principal en suite y azotea transitable.",
      extras: ["Patio", "Azotea", "Suite"]
    },
    {
      ref: "REF-006", titulo: "Estudio reformado para inversión",
      tipo: "Estudio", operacion: "venta", precio: 149000, zona: "Tablada",
      hab: 1, banos: 1, m2: 42, planta: "3ª con ascensor", estado: "disponible", publicado: false,
      arte: { kind: "bloque", hue: "#A9B49A", floors: 4, tree: true },
      desc: "Estudio con cocina abierta, buena rentabilidad para alquiler de media estancia.",
      extras: ["Reformado", "Amueblado", "Ascensor"]
    },
    {
      ref: "REF-007", titulo: "Piso señorial de techos altos",
      tipo: "Piso", operacion: "venta", precio: 690000, zona: "Los Remedios",
      hab: 5, banos: 3, m2: 190, planta: "1ª con ascensor", estado: "borrador", publicado: false,
      arte: { kind: "bloque", hue: "#C2A07A", floors: 5, tree: true },
      desc: "Vivienda de grandes dimensiones con techos altos, dos salones y dependencias de servicio.",
      extras: ["Techos altos", "Dos salones", "Portero"]
    }
  ],

  consultas: [
    { nombre: "María López", ref: "REF-001", hace: "hace 12 min", canal: "Formulario web", texto: "Quería saber si podemos visitarla esta semana.", nueva: true },
    { nombre: "Javier Ortega", ref: "REF-003", hace: "hace 1 h", canal: "WhatsApp", texto: "¿Admiten mascotas? Somos una familia con un perro pequeño.", nueva: true },
    { nombre: "Lucía Herrera", ref: "REF-002", hace: "ayer", canal: "Formulario web", texto: "Si la reserva no sigue adelante, me gustaría que me avisara.", nueva: false },
    { nombre: "Antonio Ruiz", ref: "REF-001", hace: "ayer", canal: "Llamada", texto: "¿El trastero va incluido en el precio?", nueva: false },
    { nombre: "Carmen Vidal", ref: "REF-006", hace: "hace 2 días", canal: "Formulario web", texto: "Busco algo para inversión, ¿qué rentabilidad está dando?", nueva: false }
  ],

  propietarios: [
    { nombre: "Rafael Moreno", tel: "6•• ••• 412", zona: "Los Remedios", tipo: "Piso", fecha: "23 oct", nueva: true },
    { nombre: "Pilar Sánchez", tel: "6•• ••• 087", zona: "Triana", tipo: "Casa", fecha: "21 oct", nueva: true },
    { nombre: "Familia Gil", tel: "9•• ••• 530", zona: "Los Remedios", tipo: "Piso", fecha: "18 oct", nueva: false },
    { nombre: "Elena Navarro", tel: "6•• ••• 961", zona: "Tablada", tipo: "Local", fecha: "15 oct", nueva: false }
  ],

  visitas: [
    { dia: "Jue 24", hora: "10:30", ref: "REF-001", con: "María López" },
    { dia: "Jue 24", hora: "18:00", ref: "REF-003", con: "Javier Ortega" },
    { dia: "Sáb 26", hora: "11:00", ref: "REF-006", con: "Carmen Vidal" }
  ]
};

window.MB.fmtPrecio = function (p) {
  var s = String(Math.round(p.precio)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";
  return p.operacion === "alquiler" ? s + "/mes" : s;
};
window.MB.ESTADOS = {
  disponible: "Disponible", reservado: "Reservado", vendido: "Vendido",
  alquilado: "Alquilado", borrador: "Borrador"
};
