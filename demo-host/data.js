/*
 * Global Soluciones Inmobiliarias · datos de la DEMO COMERCIAL
 *
 * IMPORTANTE: todos los inmuebles de este archivo son CONTENIDO DE DEMOSTRACIÓN.
 * Son ficticios (no corresponden a ninguna propiedad real ni a anuncios de
 * portales) y sus imágenes son ilustraciones SVG propias (assets/inmuebles/).
 * En el producto final estos datos llegarían del panel privado de gestión.
 *
 * Los cambios que se hacen en /admin-demo se guardan solo en el navegador de
 * quien la prueba (localStorage) para que la web pública los refleje.
 */
(function () {
  var CONFIG = {
    nombre: 'Global Soluciones Inmobiliarias',
    // WhatsApp: número en formato internacional sin "+" ni espacios.
    // 654 700 166 es el móvil público de la agencia (habitaclia, terrenos.es).
    // Falta confirmar que tiene WhatsApp. Para cambiarlo, edita solo esta línea.
    whatsapp: '34654700166',
    telefono: '654 700 166',
    telefonoHref: 'tel:+34654700166',
    email: 'globalsoluciones2010@gmail.com',
    direccion: 'Av. de los Poetas, 31',
    cp: '41806 Umbrete (Sevilla)',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Global+Soluciones+Inmobiliarias+Avenida+de+los+Poetas+31+Umbrete'
  };

  var TIPOS = ['Chalet', 'Adosado', 'Pareado', 'Piso', 'Ático', 'Casa de pueblo', 'Terreno', 'Nave', 'Local'];
  var ZONAS = ['Umbrete', 'Espartinas', 'Bormujos', 'Benacazón', 'Villanueva del Ariscal', 'Bollullos de la Mitación', 'Almensilla', 'Sanlúcar la Mayor', 'Gines', 'Tomares', 'Sevilla'];
  var ESTADOS = ['Disponible', 'Reservado', 'Vendido', 'Alquilado'];
  var EXTRAS = ['Garaje', 'Terraza', 'Ascensor', 'Piscina', 'Jardín', 'Trastero', 'Aire acondicionado', 'Calefacción', 'Armarios empotrados', 'Patio', 'Barbacoa', 'Placas solares'];

  function fotos(ref, n) {
    var out = [];
    for (var i = 1; i <= n; i++) out.push('assets/inmuebles/' + ref + '-' + i + '.svg');
    return out;
  }

  // DEMO · inmuebles ficticios
  var BASE = [
    { ref: 'gs101', titulo: 'Chalet independiente con piscina', tipo: 'Chalet', op: 'Venta', precio: 389000, zona: 'Espartinas', barrio: 'Urbanización residencial', hab: 4, banos: 3, m2: 210, parcela: 620, estado: 'Disponible', destacado: true,
      extras: ['Piscina', 'Garaje', 'Jardín', 'Aire acondicionado', 'Armarios empotrados', 'Barbacoa'],
      desc: 'Vivienda de dos plantas en parcela llana, con salón a doble orientación que se abre al porche y a la piscina. Cocina amplia con office, dormitorio principal con baño en suite y vestidor, y tres dormitorios más en planta alta. Garaje cubierto para dos coches y zona de barbacoa.', n: 6 },
    { ref: 'gs102', titulo: 'Adosado en esquina con patio', tipo: 'Adosado', op: 'Venta', precio: 214000, zona: 'Umbrete', barrio: 'Zona residencial', hab: 4, banos: 2, m2: 145, parcela: 190, estado: 'Disponible', destacado: true,
      extras: ['Patio', 'Garaje', 'Terraza', 'Trastero', 'Aire acondicionado'],
      desc: 'Adosado de esquina con más luz que el resto de la manzana. Planta baja con salón, cocina independiente y aseo; arriba, cuatro dormitorios y baño completo. Patio trasero, terraza en cubierta y plaza de garaje.', n: 5 },
    { ref: 'gs103', titulo: 'Piso de tres dormitorios con terraza', tipo: 'Piso', op: 'Alquiler', precio: 950, zona: 'Bormujos', barrio: 'Cerca de servicios', hab: 3, banos: 2, m2: 98, estado: 'Disponible', destacado: false,
      extras: ['Ascensor', 'Terraza', 'Garaje', 'Piscina', 'Aire acondicionado'],
      desc: 'Piso en residencial con piscina comunitaria. Salón con salida a terraza, cocina equipada, dos baños y tres dormitorios. Plaza de garaje incluida. Disponible para larga temporada.', n: 5 },
    { ref: 'gs104', titulo: 'Casa de pueblo reformada', tipo: 'Casa de pueblo', op: 'Venta', precio: 168000, zona: 'Villanueva del Ariscal', barrio: 'Casco urbano', hab: 3, banos: 2, m2: 132, parcela: 160, estado: 'Reservado', destacado: false,
      extras: ['Patio', 'Terraza', 'Aire acondicionado'],
      desc: 'Casa tradicional con fachada encalada, rejas y patio interior, reformada por completo. Conserva la distribución de toda la vida con instalaciones nuevas. A dos pasos del centro del pueblo.', n: 5 },
    { ref: 'gs105', titulo: 'Solar urbano para vivienda unifamiliar', tipo: 'Terreno', op: 'Venta', precio: 62000, zona: 'Umbrete', barrio: 'Suelo urbano', hab: 0, banos: 0, m2: 280, estado: 'Disponible', destacado: false,
      extras: [],
      desc: 'Parcela urbana con acceso por vial asfaltado, lista para proyectar una vivienda unifamiliar. Te ayudamos a revisar la edificabilidad con el ayuntamiento antes de decidir.', n: 2 },
    { ref: 'gs106', titulo: 'Ático con terraza y pérgola', tipo: 'Ático', op: 'Venta', precio: 259000, zona: 'Sevilla', barrio: 'Nervión', hab: 2, banos: 2, m2: 84, estado: 'Disponible', destacado: true,
      extras: ['Terraza', 'Ascensor', 'Aire acondicionado', 'Trastero'],
      desc: 'Ático con terraza de uso propio orientada al oeste, perfecta para las tardes. Dos dormitorios, dos baños y cocina abierta al salón. Edificio con ascensor y trastero.', n: 5 },
    { ref: 'gs107', titulo: 'Pareado con jardín y piscina', tipo: 'Pareado', op: 'Alquiler', precio: 1250, zona: 'Bollullos de la Mitación', barrio: 'Urbanización', hab: 4, banos: 3, m2: 170, parcela: 350, estado: 'Alquilado', destacado: false,
      extras: ['Piscina', 'Jardín', 'Garaje', 'Barbacoa', 'Aire acondicionado'],
      desc: 'Pareado amplio con jardín y piscina propia. Salón con chimenea, cocina con salida al porche y cuatro dormitorios.', n: 5 },
    { ref: 'gs108', titulo: 'Nave diáfana con puerta para camión', tipo: 'Nave', op: 'Venta', precio: 118000, zona: 'Sanlúcar la Mayor', barrio: 'Polígono industrial', hab: 0, banos: 1, m2: 300, estado: 'Disponible', destacado: false,
      extras: ['Aseo', 'Oficina'],
      desc: 'Nave diáfana con altura libre amplia, puerta seccional para camión, oficina y aseo. Buena salida a la autovía.', n: 2 },
    { ref: 'gs109', titulo: 'Chalet con porche y piscina', tipo: 'Chalet', op: 'Venta', precio: 245000, zona: 'Benacazón', barrio: 'Urbanización', hab: 3, banos: 2, m2: 150, parcela: 500, estado: 'Vendido', destacado: false,
      extras: ['Piscina', 'Jardín', 'Garaje'],
      desc: 'Chalet de una planta con porche y piscina en parcela de 500 m².', n: 5 },
    { ref: 'gs110', titulo: 'Local comercial a pie de calle', tipo: 'Local', op: 'Alquiler', precio: 690, zona: 'Gines', barrio: 'Calle comercial', hab: 0, banos: 1, m2: 85, estado: 'Disponible', destacado: false,
      extras: ['Aire acondicionado', 'Escaparate'],
      desc: 'Local diáfano con escaparate amplio, aseo y salida de humos. Listo para entrar a trabajar.', n: 2 },
    { ref: 'gs111', titulo: 'Piso luminoso junto a la plaza', tipo: 'Piso', op: 'Venta', precio: 139000, zona: 'Almensilla', barrio: 'Centro', hab: 3, banos: 1, m2: 88, estado: 'Disponible', destacado: false,
      extras: ['Ascensor', 'Terraza', 'Armarios empotrados'],
      desc: 'Piso exterior de tres dormitorios, con terraza al salón y ascensor. Ideal como primera vivienda o para invertir.', n: 5 },
    { ref: 'gs112', titulo: 'Adosado de cuatro dormitorios', tipo: 'Adosado', op: 'Alquiler', precio: 1100, zona: 'Tomares', barrio: 'Aljamar', hab: 4, banos: 3, m2: 160, parcela: 180, estado: 'Reservado', destacado: false,
      extras: ['Garaje', 'Piscina', 'Patio', 'Aire acondicionado'],
      desc: 'Adosado en urbanización con piscina comunitaria, garaje y patio. Cuatro dormitorios y tres baños.', n: 5 }
  ];
  BASE.forEach(function (p) { p.fotos = fotos(p.ref, p.n); p.demo = true; delete p.n; });

  var KEY = 'gs-demo-inmuebles-v1';
  var LEADS = 'gs-demo-solicitudes-v1';

  function read(k) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  window.GS = {
    config: CONFIG, tipos: TIPOS, zonas: ZONAS, estados: ESTADOS, extras: EXTRAS,
    base: BASE,
    // Inmuebles tal y como los vería la web: los del panel demo si se han tocado.
    all: function () { var s = read(KEY); return Array.isArray(s) ? s : clone(BASE); },
    save: function (list) { return write(KEY, list); },
    reset: function () { try { localStorage.removeItem(KEY); localStorage.removeItem(LEADS); } catch (e) {} },
    edited: function () { return Array.isArray(read(KEY)); },
    get: function (ref) { return this.all().filter(function (p) { return p.ref === ref; })[0] || null; },
    leads: function () { return read(LEADS) || []; },
    addLead: function (l) { var a = read(LEADS) || []; l.fecha = new Date().toISOString(); a.unshift(l); write(LEADS, a.slice(0, 20)); },
    price: function (p) {
      // es-ES no agrupa los miles con 4 cifras ("1250"); lo hacemos a mano.
      var n = String(Math.round(Number(p.precio || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return p.op === 'Alquiler' ? n + ' €/mes' : n + ' €';
    },
    wa: function (text) { return 'https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(text); }
  };
})();
