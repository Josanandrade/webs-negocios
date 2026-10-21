/*
 * Peñaflor Inmobiliaria · demo comercial
 * ---------------------------------------------------------------
 * CONTENIDO DE DEMOSTRACIÓN. Todos los inmuebles de este archivo son
 * FICTICIOS: no corresponden a viviendas reales de la agencia ni de
 * terceros ni están copiados de ningún portal. Las imágenes son
 * ilustraciones propias (assets/img, generadas por
 * demos/penaflor-inmobiliaria/tools/gen-images.mjs).
 *
 * Datos reales del negocio: solo el nombre, la zona (Camas / Aljarafe)
 * y el teléfono que facilitó Jose. No hay dirección, email, horario,
 * años de experiencia ni opiniones porque no se han podido verificar.
 */
window.PF = (function () {
  const CONFIG = {
    brand: 'Peñaflor Inmobiliaria',
    phone: '652 82 54 32',
    phoneHref: 'tel:+34652825432',
    // Formato internacional sin "+". Dejar '' para ocultar todos los botones de WhatsApp.
    whatsapp: '34652825432',
    area: 'Camas y el Aljarafe'
  };

  const ZONES = ['Camas', 'Castilleja de la Cuesta', 'Tomares', 'Santiponce', 'San Juan de Aznalfarache', 'Valencina', 'Gines', 'Salteras'];
  const TYPES = ['Piso', 'Ático', 'Casa', 'Adosado', 'Chalet', 'Dúplex', 'Local'];

  // tags: novedad | bajada | exclusiva | piscina | reformado | vistas | terraza | garaje | jardin
  const LIST = [
    {
      ref: 'PF-104', featured: true, op: 'venta', type: 'Piso', zone: 'Camas', area: 'Junto al paseo del río',
      title: 'Piso con balcón y vistas al río', price: 179000, m2: 98, beds: 3, baths: 2,
      tags: ['vistas', 'garaje', 'novedad'],
      cover: 'f-piso-rio.svg', gallery: ['salon-a.svg', 'cocina-a.svg', 'dormitorio-a.svg', 'bano.svg', 'terraza-rio.svg'],
      text: 'Tercera planta exterior con balcón corrido y vistas abiertas a la otra orilla. Salón amplio, cocina equipada con lavadero, tres dormitorios y dos baños. Plaza de garaje incluida y ascensor.',
      features: ['Ascensor', 'Plaza de garaje', 'Balcón', 'Aire acondicionado', 'Armarios empotrados']
    },
    {
      ref: 'PF-117', featured: true, op: 'venta', type: 'Chalet', zone: 'Valencina', area: 'Urbanización residencial',
      title: 'Chalet independiente con piscina', price: 418000, m2: 214, beds: 4, baths: 3, plot: 620,
      tags: ['piscina', 'jardin', 'exclusiva'],
      cover: 'f-chalet.svg', gallery: ['piscina.svg', 'salon-b.svg', 'cocina-b.svg', 'dormitorio-b.svg', 'bano.svg'],
      text: 'Vivienda de dos plantas sobre parcela de 620 m² con piscina, porche y olivo centenario. Salón con grandes ventanales al jardín, cocina abierta con isla y dormitorio principal en suite.',
      features: ['Piscina privada', 'Jardín', 'Porche', 'Garaje para dos coches', 'Suelo radiante', 'Placas solares']
    },
    {
      ref: 'PF-109', featured: true, op: 'venta', type: 'Casa', zone: 'Camas', area: 'Casco antiguo',
      title: 'Casa de pueblo reformada con patio', price: 215000, m2: 146, beds: 4, baths: 2, plot: 160,
      tags: ['reformado', 'bajada'], prevPrice: 229000,
      cover: 'f-casa-pueblo.svg', gallery: ['patio.svg', 'salon-b.svg', 'cocina-a.svg', 'dormitorio-a.svg', 'bano.svg'],
      text: 'Casa tradicional de dos plantas con reforma integral: instalaciones nuevas, carpintería de madera y patio andaluz con fuente. Cuatro dormitorios y azotea transitable.',
      features: ['Patio andaluz', 'Azotea', 'Reformada', 'Rejas de forja', 'Bomba de calor']
    },
    {
      ref: 'PF-121', featured: false, op: 'alquiler', type: 'Ático', zone: 'Tomares', area: 'Zona centro',
      title: 'Ático con terraza y pérgola', price: 1150, m2: 84, beds: 2, baths: 2,
      tags: ['terraza', 'novedad'],
      cover: 'f-atico.svg', gallery: ['terraza-rio.svg', 'salon-a.svg', 'cocina-b.svg', 'dormitorio-b.svg'],
      text: 'Ático luminoso con terraza de unos 35 m² con pérgola. Salón con salida directa a la terraza, dos dormitorios, el principal con baño propio. Se alquila amueblado.',
      features: ['Terraza 35 m²', 'Amueblado', 'Ascensor', 'Aire acondicionado', 'Trastero']
    },
    {
      ref: 'PF-112', featured: false, op: 'venta', type: 'Adosado', zone: 'Castilleja de la Cuesta', area: 'Zona residencial',
      title: 'Adosado de tres plantas con cochera', price: 239000, m2: 168, beds: 4, baths: 3, plot: 140,
      tags: ['garaje', 'jardin'],
      cover: 'f-adosado.svg', gallery: ['salon-b.svg', 'cocina-a.svg', 'dormitorio-a.svg', 'bano.svg', 'patio.svg'],
      text: 'Adosado en calle tranquila, cerca de colegios y comercios. Cochera en planta baja, salón con salida a patio trasero, cuatro dormitorios y azotea.',
      features: ['Cochera', 'Patio', 'Azotea', 'Aire acondicionado', 'Armarios empotrados']
    },
    {
      ref: 'PF-125', featured: false, op: 'alquiler', type: 'Piso', zone: 'Camas', area: 'Coca de la Piñera',
      title: 'Piso de 3 dormitorios con ascensor', price: 850, m2: 90, beds: 3, baths: 1,
      tags: ['novedad'],
      cover: 'f-piso-centro.svg', gallery: ['salon-a.svg', 'cocina-b.svg', 'dormitorio-b.svg', 'bano.svg'],
      text: 'Piso exterior en buen estado, con cocina independiente, salón con balcón y tres dormitorios. Bien comunicado con Sevilla y con todos los servicios a pie.',
      features: ['Ascensor', 'Balcón', 'Exterior', 'Aire acondicionado']
    },
    {
      ref: 'PF-114', featured: true, op: 'venta', type: 'Dúplex', zone: 'Gines', area: 'Zona centro',
      title: 'Dúplex con ventanal corrido', price: 264000, m2: 132, beds: 3, baths: 2,
      tags: ['terraza', 'exclusiva'],
      cover: 'f-duplex.svg', gallery: ['salon-b.svg', 'cocina-b.svg', 'dormitorio-a.svg', 'terraza-rio.svg', 'bano.svg'],
      text: 'Dúplex de diseño actual con salón a doble altura y ventanal corrido en la planta alta. Tres dormitorios, dos baños, terraza y plaza de garaje.',
      features: ['Doble altura', 'Terraza', 'Plaza de garaje', 'Domótica básica', 'Aerotermia']
    },
    {
      ref: 'PF-128', featured: false, op: 'venta', type: 'Piso', zone: 'San Juan de Aznalfarache', area: 'Cerca del metro',
      title: 'Bajo con jardín privado', price: 158000, m2: 82, beds: 2, baths: 1,
      tags: ['jardin', 'bajada'], prevPrice: 166000,
      cover: 'f-bajo-jardin.svg', gallery: ['salon-b.svg', 'cocina-a.svg', 'dormitorio-b.svg', 'bano.svg'],
      text: 'Planta baja con jardín privado de uso exclusivo. Dos dormitorios, cocina abierta y salón con salida directa al exterior. A pocos minutos andando de la parada de metro.',
      features: ['Jardín privado', 'Piscina comunitaria', 'Cocina abierta', 'Aire acondicionado']
    },
    {
      ref: 'PF-131', featured: false, op: 'venta', type: 'Casa', zone: 'Salteras', area: 'A las afueras',
      title: 'Casa con parcela entre olivos', price: 295000, m2: 156, beds: 3, baths: 2, plot: 1800,
      tags: ['jardin', 'novedad'],
      cover: 'f-parcela.svg', gallery: ['patio.svg', 'salon-b.svg', 'cocina-a.svg', 'dormitorio-a.svg', 'piscina.svg'],
      text: 'Casa de una planta en parcela de 1.800 m² rodeada de olivar. Porche, chimenea y espacio para huerto o piscina. Tranquilidad a pocos minutos del Aljarafe urbano.',
      features: ['Parcela 1.800 m²', 'Chimenea', 'Porche', 'Pozo', 'Una sola planta']
    },
    {
      ref: 'PF-122', featured: false, op: 'alquiler', type: 'Local', zone: 'Camas', area: 'Calle comercial',
      title: 'Local a pie de calle con escaparate', price: 690, m2: 110, beds: 0, baths: 1,
      tags: ['novedad'],
      cover: 'f-local.svg', gallery: ['f-local.svg'],
      text: 'Local diáfano con escaparate de 8 metros en calle de paso. Aseo, salida de humos y persiana motorizada. Apto para comercio u oficina.',
      features: ['Escaparate', 'Diáfano', 'Aseo', 'Salida de humos']
    },
    {
      ref: 'PF-119', featured: false, op: 'venta', type: 'Ático', zone: 'Santiponce', area: 'Zona nueva',
      title: 'Ático con terraza y trastero', price: 189000, m2: 76, beds: 2, baths: 2,
      tags: ['terraza', 'garaje'],
      cover: 'f-atico.svg', gallery: ['terraza-rio.svg', 'salon-a.svg', 'cocina-a.svg', 'dormitorio-b.svg', 'bano.svg'],
      text: 'Ático en edificio de pocos vecinos con terraza a dos orientaciones, garaje y trastero. Dos dormitorios con armarios empotrados y dos baños completos.',
      features: ['Terraza', 'Garaje', 'Trastero', 'Ascensor', 'Orientación sur']
    },
    {
      ref: 'PF-133', featured: false, op: 'alquiler', type: 'Adosado', zone: 'Valencina', area: 'Urbanización con piscina',
      title: 'Adosado con piscina comunitaria', price: 1300, m2: 150, beds: 4, baths: 3,
      tags: ['piscina', 'jardin'],
      cover: 'f-adosado.svg', gallery: ['piscina.svg', 'salon-b.svg', 'cocina-b.svg', 'dormitorio-a.svg'],
      text: 'Adosado en urbanización cerrada con piscina comunitaria y zonas verdes. Cuatro dormitorios, tres baños, patio y aparcamiento. Disponible para larga temporada.',
      features: ['Piscina comunitaria', 'Patio', 'Aparcamiento', 'Urbanización cerrada']
    }
  ];

  const TAGS = {
    novedad: 'Novedad', bajada: 'Ha bajado', exclusiva: 'Exclusiva', piscina: 'Piscina', reformado: 'Reformado',
    vistas: 'Vistas al río', terraza: 'Terraza', garaje: 'Garaje', jardin: 'Jardín'
  };

  return { CONFIG, ZONES, TYPES, LIST, TAGS };
})();
