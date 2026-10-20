/*
 * Julio Puig Real Estate · demo comercial
 * ---------------------------------------------------------------
 * CONTENIDO DE DEMOSTRACIÓN. Todos los inmuebles de este archivo son
 * FICTICIOS: no corresponden a viviendas reales de la agencia ni de
 * terceros. Las imágenes son ilustraciones propias (assets/img).
 * En el producto final este listado vendría del panel de gestión.
 */
window.JP_CONFIG = {
  brand: 'Julio Puig Real Estate',
  advisor: 'Julio Puig',
  // Teléfono publicado por la agencia en su ficha de habitaclia. Confirmar antes de enviar.
  phone: '633 71 77 14',
  // WhatsApp en formato internacional sin "+" ni espacios. Dejar '' para ocultar los enlaces directos.
  whatsapp: '34633717714',
  email: 'juliopuig.inmobiliaria@gmail.com',
  address: 'C/ Cervantes, 70 · 41100 Coria del Río (Sevilla)',
  zone: ['Coria del Río', 'Gelves', 'La Puebla del Río', 'Palomares del Río', 'Almensilla', 'Villamanrique de la Condesa', 'Sevilla']
};

window.JP_DEMO_PROPERTIES = [
  {
    ref: 'JP-101', demo: true, featured: true,
    title: 'Casa adosada con patio y cochera', type: 'Casa adosada', town: 'Coria del Río', area: 'Zona centro',
    op: 'venta', price: 189000, status: 'disponible',
    beds: 4, baths: 2, m2: 142, plot: null,
    features: ['Garaje', 'Patio', 'Terraza', 'Aire acondicionado', 'Trastero'],
    cover: 'f-adosados-coria.svg', gallery: ['salon-a.svg', 'cocina-a.svg', 'dormitorio-a.svg', 'patio-a.svg'],
    summary: 'Dos plantas, patio trasero y cochera propia, a pocos minutos andando del centro.',
    description: 'Vivienda adosada de dos plantas pensada para el día a día de una familia. En planta baja, salón con salida al patio, cocina independiente y un aseo. Arriba, cuatro dormitorios y baño completo, con terraza en el dormitorio principal. Cochera para un coche y trastero.',
    map: { x: 330, y: 352 }
  },
  {
    ref: 'JP-102', demo: true, featured: true,
    title: 'Piso reformado con terraza', type: 'Piso', town: 'Gelves', area: 'Junto al puerto deportivo',
    op: 'venta', price: 149000, status: 'disponible',
    beds: 3, baths: 1, m2: 88, plot: null,
    features: ['Ascensor', 'Terraza', 'Reformado', 'Armarios empotrados'],
    cover: 'f-piso-gelves.svg', gallery: ['salon-b.svg', 'cocina-b.svg', 'dormitorio-b.svg', 'bano-a.svg'],
    summary: 'Tercera planta con ascensor, reforma reciente y terraza a la calle.',
    description: 'Piso exterior de tres dormitorios con reforma integral: cocina amueblada, baño con plato de ducha y suelos nuevos. Terraza de uso diario orientada a la calle y edificio con ascensor. Listo para entrar a vivir.',
    map: { x: 372, y: 248 }
  },
  {
    ref: 'JP-103', demo: true, featured: true,
    title: 'Chalet independiente con piscina', type: 'Chalet', town: 'Palomares del Río', area: 'Urbanización residencial',
    op: 'venta', price: 345000, status: 'disponible',
    beds: 4, baths: 3, m2: 210, plot: 620,
    features: ['Piscina', 'Garaje', 'Jardín', 'Terraza', 'Placas solares', 'Aire acondicionado'],
    cover: 'f-chalet-palomares.svg', gallery: ['piscina-a.svg', 'salon-c.svg', 'cocina-c.svg', 'dormitorio-a.svg', 'bano-b.svg'],
    summary: 'Parcela de 620 m² con piscina, jardín y garaje para dos coches.',
    description: 'Chalet de líneas actuales en parcela de 620 m². Salón amplio con ventanales hacia la piscina, cocina abierta con isla, cuatro dormitorios (uno en planta baja) y tres baños. Garaje cubierto para dos coches y zona de barbacoa.',
    map: { x: 282, y: 270 }
  },
  {
    ref: 'JP-104', demo: true, featured: false,
    title: 'Piso luminoso en Triana', type: 'Piso', town: 'Sevilla', area: 'Triana',
    op: 'venta', price: 265000, status: 'reservado',
    beds: 2, baths: 2, m2: 78, plot: null,
    features: ['Ascensor', 'Aire acondicionado', 'Balcón'],
    cover: 'f-piso-triana.svg', gallery: ['salon-a.svg', 'cocina-b.svg', 'dormitorio-b.svg', 'bano-b.svg'],
    summary: 'Dos dormitorios y dos baños en finca con ascensor, cerca del río.',
    description: 'Piso de dos dormitorios con baño en suite, salón con balcón y cocina equipada. Finca con ascensor en una calle tranquila del barrio, cerca de comercios y transporte.',
    map: { x: 455, y: 128 }
  },
  {
    ref: 'JP-105', demo: true, featured: false,
    title: 'Casa de pueblo para reformar', type: 'Casa', town: 'La Puebla del Río', area: 'Casco urbano',
    op: 'venta', price: 79000, status: 'disponible',
    beds: 3, baths: 1, m2: 120, plot: 160,
    features: ['Patio', 'Para reformar', 'Azotea'],
    cover: 'f-casa-puebla.svg', gallery: ['patio-a.svg', 'salon-b.svg', 'cocina-c.svg'],
    summary: 'Fachada tradicional, patio y azotea. Buena base para reformar a tu gusto.',
    description: 'Casa de una planta y media con fachada tradicional, patio central y azotea transitable. Necesita reforma, lo que permite redistribuirla a tu medida. Ideal como primera vivienda o inversión.',
    map: { x: 318, y: 470 }
  },
  {
    ref: 'JP-106', demo: true, featured: true,
    title: 'Ático con terraza y vistas', type: 'Ático', town: 'Coria del Río', area: 'Zona río',
    op: 'alquiler', price: 850, status: 'disponible',
    beds: 2, baths: 1, m2: 70, plot: null,
    features: ['Terraza', 'Ascensor', 'Amueblado', 'Aire acondicionado'],
    cover: 'f-atico-coria.svg', gallery: ['terraza-a.svg', 'salon-c.svg', 'cocina-a.svg', 'dormitorio-b.svg'],
    summary: 'Terraza de 30 m² con pérgola. Se alquila amueblado.',
    description: 'Ático de dos dormitorios con una terraza que se convierte en una estancia más: pérgola, zona de comedor y vistas despejadas. Se alquila amueblado y con electrodomésticos. Edificio con ascensor.',
    map: { x: 352, y: 366 }
  },
  {
    ref: 'JP-107', demo: true, featured: false,
    title: 'Pareado con piscina comunitaria', type: 'Casa pareada', town: 'Almensilla', area: 'Zona residencial',
    op: 'venta', price: 229000, status: 'disponible',
    beds: 4, baths: 2, m2: 156, plot: 240,
    features: ['Piscina comunitaria', 'Garaje', 'Jardín', 'Terraza'],
    cover: 'f-pareado-almensilla.svg', gallery: ['salon-b.svg', 'cocina-a.svg', 'dormitorio-a.svg', 'piscina-a.svg'],
    summary: 'Casa pareada con jardín propio y urbanización con piscina.',
    description: 'Pareado de dos plantas con jardín delantero y trasero, cuatro dormitorios y dos baños. La urbanización cuenta con piscina comunitaria y zonas verdes. Garaje en parcela.',
    map: { x: 212, y: 300 }
  },
  {
    ref: 'JP-108', demo: true, featured: false,
    title: 'Casa de campo entre olivos', type: 'Casa de campo', town: 'Villamanrique de la Condesa', area: 'Afueras',
    op: 'venta', price: 198000, status: 'disponible',
    beds: 3, baths: 2, m2: 180, plot: 1200,
    features: ['Porche', 'Parcela', 'Chimenea', 'Pozo'],
    cover: 'f-casa-villamanrique.svg', gallery: ['salon-c.svg', 'cocina-c.svg', 'dormitorio-b.svg', 'bano-a.svg'],
    summary: 'Parcela de 1.200 m² con olivos y porche corrido.',
    description: 'Casa de una planta con porche corrido, salón con chimenea y tres dormitorios. Parcela de 1.200 m² con olivos y pozo. Tranquilidad a poca distancia del pueblo.',
    map: { x: 92, y: 444 }
  },
  {
    ref: 'JP-109', demo: true, featured: false,
    title: 'Piso de tres dormitorios', type: 'Piso', town: 'Coria del Río', area: 'Zona centro',
    op: 'alquiler', price: 690, status: 'alquilado',
    beds: 3, baths: 1, m2: 90, plot: null,
    features: ['Ascensor', 'Balcón'],
    cover: 'f-piso-coria.svg', gallery: ['salon-a.svg', 'cocina-b.svg', 'dormitorio-a.svg'],
    summary: 'Piso exterior con balcón, cerca de colegios y comercios.',
    description: 'Piso exterior de tres dormitorios con balcón, salón comedor y cocina con lavadero. Cerca de colegios, comercios y parada de autobús.',
    map: { x: 340, y: 340 }
  },
  {
    ref: 'JP-110', demo: true, featured: false,
    title: 'Adosado en esquina', type: 'Casa adosada', town: 'Gelves', area: 'Zona residencial',
    op: 'venta', price: 238000, status: 'reservado',
    beds: 4, baths: 3, m2: 165, plot: 190,
    features: ['Garaje', 'Terraza', 'Patio', 'Trastero'],
    cover: 'f-adosado-gelves.svg', gallery: ['salon-c.svg', 'cocina-a.svg', 'dormitorio-b.svg', 'bano-b.svg'],
    summary: 'Vivienda en esquina, más luz y patio en dos fachadas.',
    description: 'Adosado de esquina con tres plantas: salón y cocina en planta baja, cuatro dormitorios y dos baños en la primera, y buhardilla con terraza. Patio en L y garaje.',
    map: { x: 380, y: 262 }
  },
  {
    ref: 'JP-111', demo: true, featured: false,
    title: 'Bajo con patio privado', type: 'Piso', town: 'Coria del Río', area: 'Barrio',
    op: 'venta', price: 112000, status: 'vendido',
    beds: 2, baths: 1, m2: 75, plot: null,
    features: ['Patio', 'Aire acondicionado'],
    cover: 'f-bajo-coria.svg', gallery: ['patio-a.svg', 'salon-b.svg', 'dormitorio-a.svg'],
    summary: 'Planta baja con patio privado, sin escaleras.',
    description: 'Vivienda en planta baja con patio privado de uso exclusivo. Dos dormitorios, salón y cocina. Sin escaleras, cómoda para personas mayores.',
    map: { x: 320, y: 360 }
  },
  {
    ref: 'JP-112', demo: true, featured: false,
    title: 'Loft junto al río', type: 'Loft', town: 'Gelves', area: 'Centro',
    op: 'alquiler', price: 520, status: 'disponible',
    beds: 1, baths: 1, m2: 45, plot: null,
    features: ['Amueblado', 'Aire acondicionado'],
    cover: 'f-loft-gelves.svg', gallery: ['salon-b.svg', 'cocina-b.svg', 'bano-a.svg'],
    summary: 'Espacio diáfano amueblado, ideal para una o dos personas.',
    description: 'Loft diáfano con zona de dormitorio separada por un mueble, cocina integrada y baño completo. Se alquila amueblado.',
    map: { x: 364, y: 236 }
  }
];

/*
 * Simulación de "los cambios del panel se ven en la web":
 * /admin-demo guarda cambios en localStorage de ESTE navegador y la web
 * pública los aplica. No hay servidor ni base de datos.
 */
window.JP_STORE = (function () {
  var KEY = 'jp-demo-overrides-v1';
  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function write(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); return true; } catch (e) { return false; } }
  function all() {
    var o = read();
    var list = (o.added || []).slice().reverse().concat(window.JP_DEMO_PROPERTIES);
    return list.map(function (p) { return Object.assign({}, p, (o.edits || {})[p.ref] || {}); }).filter(function (p) { return !(o.removed || []).includes(p.ref); });
  }
  return {
    all: all,
    get: function (ref) { return all().find(function (p) { return p.ref === ref; }); },
    save: function (ref, patch) { var o = read(); o.edits = o.edits || {}; o.edits[ref] = Object.assign({}, o.edits[ref], patch); return write(o); },
    add: function (p) { var o = read(); o.added = o.added || []; o.added.push(p); return write(o); },
    remove: function (ref) { var o = read(); o.removed = o.removed || []; o.removed.push(ref); return write(o); },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} },
    touched: function () { var o = read(); return !!(o.edits && Object.keys(o.edits).length) || !!(o.added && o.added.length) || !!(o.removed && o.removed.length); }
  };
})();

window.JP_FMT = {
  price: function (p) {
    var n = new Intl.NumberFormat('es-ES').format(p.price);
    return p.op === 'alquiler' ? n + ' €/mes' : n + ' €';
  },
  status: { disponible: 'Disponible', reservado: 'Reservado', vendido: 'Vendido', alquilado: 'Alquilado' },
  wa: function (text) {
    var n = window.JP_CONFIG.whatsapp;
    return n ? 'https://wa.me/' + n + '?text=' + encodeURIComponent(text) : null;
  }
};
