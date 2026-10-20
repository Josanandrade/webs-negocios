/*
 * Villalón · datos de la demo.
 *
 * CONTENIDO DE DEMOSTRACIÓN: todos los inmuebles de este archivo son
 * ficticios. No corresponden a viviendas reales de la agencia ni de
 * terceros, y sus imágenes son ilustraciones SVG propias (assets/art.js).
 * En el producto final esta lista vendría del panel de gestión.
 */
(function () {
  var CONFIG = {
    nombre: "Asesores Inmobiliarios Villalón",
    corto: "Villalón",
    direccion: "Plaza la Viña, 5, 1º B · 41020 Sevilla",
    zona: "Sevilla Este y alrededores",
    // Teléfono publicado en directorios (agenciasinmobiliarias.com.es).
    telefono: "650 20 58 14",
    // WhatsApp: número en formato internacional sin "+" ni espacios.
    // Pendiente de confirmar con la agencia; déjalo vacío ("") para ocultar
    // los botones de WhatsApp y que lleven al formulario de contacto.
    whatsapp: "34650205814",
    horario: "Lunes a viernes · 9:00–14:00 y 17:00–20:30"
  };

  var ZONAS = ["Sevilla Este", "Parque Alcosa", "Entrepuentes", "Santa Clara", "Torreblanca", "San Pablo"];
  var TIPOS = ["Piso", "Ático", "Dúplex", "Adosado", "Casa", "Local"];

  // estado: disponible | reservado | vendido | alquilado
  var INMUEBLES = [
    {
      id: "piso-sevilla-este-jardines", demo: true,
      titulo: "Piso con piscina comunitaria junto al parque", tipo: "Piso", operacion: "venta",
      precio: 189000, zona: "Sevilla Este", hab: 3, banos: 2, m2: 98, planta: "3ª con ascensor",
      estado: "disponible", destacado: true, arte: { forma: "bloque", tono: 0 },
      extras: ["Ascensor", "Garaje", "Trastero", "Piscina comunitaria", "Aire acondicionado", "Armarios empotrados"],
      descripcion: "Piso exterior de tres dormitorios en una urbanización cerrada con zonas verdes y piscina. Salón amplio con salida a terraza, cocina independiente con lavadero y dos baños completos, uno dentro del dormitorio principal. Plaza de garaje y trastero en el mismo edificio. A pocos minutos andando del parque, colegios y paradas de autobús."
    },
    {
      id: "atico-terraza-sevilla-este", demo: true,
      titulo: "Ático con terraza de 40 m² y vistas despejadas", tipo: "Ático", operacion: "venta",
      precio: 245000, zona: "Sevilla Este", hab: 3, banos: 2, m2: 105, planta: "Ático",
      estado: "disponible", destacado: true, arte: { forma: "atico", tono: 1 },
      extras: ["Terraza 40 m²", "Ascensor", "Garaje", "Piscina comunitaria", "Suelo radiante"],
      descripcion: "Último piso con una terraza en forma de L que rodea el salón, ideal para comer fuera buena parte del año. Tres dormitorios dobles, dos baños y cocina abierta reformada. Mucha luz natural todo el día. Incluye plaza de garaje."
    },
    {
      id: "adosado-entrepuentes", demo: true,
      titulo: "Adosado de cuatro dormitorios con patio y garaje", tipo: "Adosado", operacion: "venta",
      precio: 279000, zona: "Entrepuentes", hab: 4, banos: 3, m2: 160, planta: "Dos plantas",
      estado: "disponible", destacado: true, arte: { forma: "adosado", tono: 2 },
      extras: ["Garaje privado", "Patio", "Solárium", "Aire acondicionado", "Cocina amueblada"],
      descripcion: "Vivienda unifamiliar en calle tranquila, pensada para familias. Planta baja con salón, cocina y aseo; arriba cuatro dormitorios y dos baños. Patio trasero, solárium y garaje propio. Cerca de colegios, supermercados y del acceso a la SE-30."
    },
    {
      id: "piso-alcosa-reformado", demo: true,
      titulo: "Piso reformado para entrar a vivir", tipo: "Piso", operacion: "venta",
      precio: 129000, zona: "Parque Alcosa", hab: 3, banos: 1, m2: 78, planta: "2ª",
      estado: "reservado", destacado: false, arte: { forma: "bloque", tono: 3 },
      extras: ["Reformado", "Aire acondicionado", "Ventanas climalit"],
      descripcion: "Piso de tres dormitorios totalmente reformado: instalación eléctrica, baño y cocina nuevos. Buena opción como primera vivienda. Zona con todos los servicios y bien comunicada con el centro."
    },
    {
      id: "alquiler-sevilla-este-garaje", demo: true,
      titulo: "Piso en alquiler con garaje y piscina", tipo: "Piso", operacion: "alquiler",
      precio: 850, zona: "Sevilla Este", hab: 2, banos: 2, m2: 85, planta: "1ª con ascensor",
      estado: "disponible", destacado: true, arte: { forma: "bloque", tono: 4 },
      extras: ["Amueblado", "Garaje", "Ascensor", "Piscina comunitaria", "Aire acondicionado"],
      descripcion: "Piso de dos dormitorios y dos baños, amueblado y listo para entrar. Urbanización con piscina y plaza de garaje incluida en el precio. Se piden nóminas o garantía de solvencia."
    },
    {
      id: "casa-santa-clara-jardin", demo: true,
      titulo: "Casa con jardín en zona residencial", tipo: "Casa", operacion: "venta",
      precio: 335000, zona: "Santa Clara", hab: 4, banos: 2, m2: 190, planta: "Dos plantas",
      estado: "disponible", destacado: false, arte: { forma: "chalet", tono: 0 },
      extras: ["Jardín", "Garaje", "Chimenea", "Barbacoa", "Trastero"],
      descripcion: "Casa independiente en una de las zonas más tranquilas del distrito. Jardín delantero y trasero, salón con chimenea, cuatro dormitorios y garaje para dos coches. Para quien busca espacio sin irse lejos de la ciudad."
    },
    {
      id: "alquiler-alcosa-tres-dorm", demo: true,
      titulo: "Piso de tres dormitorios en alquiler", tipo: "Piso", operacion: "alquiler",
      precio: 690, zona: "Parque Alcosa", hab: 3, banos: 1, m2: 80, planta: "Bajo",
      estado: "disponible", destacado: false, arte: { forma: "bloque", tono: 2 },
      extras: ["Patio", "Aire acondicionado", "Cocina amueblada"],
      descripcion: "Planta baja con patio propio, tres dormitorios y cocina amueblada. Cerca del metro y de la zona comercial."
    },
    {
      id: "local-torreblanca", demo: true,
      titulo: "Local comercial a pie de calle", tipo: "Local", operacion: "alquiler",
      precio: 550, zona: "Torreblanca", hab: 0, banos: 1, m2: 70, planta: "Planta calle",
      estado: "disponible", destacado: false, arte: { forma: "local", tono: 1 },
      extras: ["Escaparate", "Persiana metálica", "Aseo", "Salida de humos"],
      descripcion: "Local diáfano con escaparate en calle de paso. Aseo y salida de humos. Adecuado para comercio, oficina o pequeña hostelería."
    },
    {
      id: "alquiler-san-pablo", demo: true,
      titulo: "Piso luminoso en alquiler", tipo: "Piso", operacion: "alquiler",
      precio: 750, zona: "San Pablo", hab: 2, banos: 1, m2: 65, planta: "4ª con ascensor",
      estado: "alquilado", destacado: false, arte: { forma: "bloque", tono: 1 },
      extras: ["Ascensor", "Amueblado", "Balcón"],
      descripcion: "Piso de dos dormitorios con balcón, amueblado y con ascensor."
    },
    {
      id: "piso-sevilla-este-vendido", demo: true,
      titulo: "Piso de tres dormitorios con plaza de garaje", tipo: "Piso", operacion: "venta",
      precio: 165000, zona: "Sevilla Este", hab: 3, banos: 2, m2: 90, planta: "2ª con ascensor",
      estado: "vendido", destacado: false, arte: { forma: "bloque", tono: 0 },
      extras: ["Ascensor", "Garaje", "Piscina comunitaria"],
      descripcion: "Piso familiar en urbanización con piscina."
    },
    {
      id: "duplex-sevilla-este", demo: true,
      titulo: "Dúplex con dos terrazas", tipo: "Dúplex", operacion: "venta",
      precio: 212000, zona: "Sevilla Este", hab: 3, banos: 2, m2: 110, planta: "4ª y 5ª",
      estado: "reservado", destacado: false, arte: { forma: "atico", tono: 3 },
      extras: ["Terraza", "Ascensor", "Garaje", "Trastero"],
      descripcion: "Dúplex con salón y cocina en la planta inferior y dormitorios arriba, con terraza en cada nivel."
    },
    {
      id: "piso-torreblanca", demo: true,
      titulo: "Piso económico de dos dormitorios", tipo: "Piso", operacion: "venta",
      precio: 98000, zona: "Torreblanca", hab: 2, banos: 1, m2: 68, planta: "1ª",
      estado: "disponible", destacado: false, arte: { forma: "bloque", tono: 4 },
      extras: ["Balcón", "Aire acondicionado"],
      descripcion: "Piso de dos dormitorios con balcón a la calle, buena distribución y gastos de comunidad bajos. Interesante también como inversión para alquilar."
    }
  ];

  // Los cambios hechos en /admin-demo se guardan solo en este navegador
  // (localStorage) para enseñar cómo el panel actualiza la web pública.
  var KEY = "villalon-demo-cambios";
  function leerCambios() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; }
  }
  function guardarCambios(c) {
    try { localStorage.setItem(KEY, JSON.stringify(c)); return true; } catch (e) { return false; }
  }
  function inmuebles() {
    var c = leerCambios();
    var lista = INMUEBLES.map(function (p) {
      var o = {}; for (var k in p) o[k] = p[k];
      var d = c[p.id]; if (d) for (var j in d) o[j] = d[j];
      return o;
    });
    (c.__nuevos || []).forEach(function (n) { lista.unshift(n); });
    return lista.filter(function (p) { return !(c.__borrados || []).includes(p.id); });
  }
  function precio(p) {
    var n = p.precio.toLocaleString("es-ES", { maximumFractionDigits: 0 });
    // toLocaleString no agrupa números de 4 cifras en es-ES
    if (p.precio >= 1000 && p.precio < 10000) n = String(p.precio).replace(/(\d)(\d{3})$/, "$1.$2");
    return n + (p.operacion === "alquiler" ? " €/mes" : " €");
  }
  var ESTADOS = { disponible: "Disponible", reservado: "Reservado", vendido: "Vendido", alquilado: "Alquilado" };

  window.VILLALON = {
    CONFIG: CONFIG, ZONAS: ZONAS, TIPOS: TIPOS, ESTADOS: ESTADOS, BASE: INMUEBLES,
    inmuebles: inmuebles, precio: precio, leerCambios: leerCambios, guardarCambios: guardarCambios,
    resetCambios: function () { try { localStorage.removeItem(KEY); } catch (e) {} },
    wa: function (texto) {
      if (!CONFIG.whatsapp) return null;
      return "https://wa.me/" + CONFIG.whatsapp + (texto ? "?text=" + encodeURIComponent(texto) : "");
    },
    tel: function () { return "tel:+34" + CONFIG.telefono.replace(/\s/g, ""); }
  };
})();
