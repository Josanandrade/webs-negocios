/*
 * Inmobiliaria Alves · demo comercial
 * ---------------------------------------------------------------
 * CONTENIDO DE DEMOSTRACIÓN. Todos los inmuebles de este archivo son
 * FICTICIOS: no corresponden a viviendas reales de la agencia ni de
 * terceros y no están copiados de ningún portal. Precios, superficies y
 * barrios son de ejemplo. Las imágenes son ilustraciones propias
 * (assets/img, generadas por demos/inmobiliaria-alves/tools/gen-images.mjs).
 *
 * Únicos datos facilitados por el cliente: nombre, teléfono/WhatsApp y zona.
 */
(function () {
  const CONFIG = {
    brand: 'Alves',
    legal: 'Inmobiliaria Alves',
    phone: '619 214 928',
    phoneIntl: '+34 619 214 928',
    phoneHref: 'tel:+34619214928',
    whatsapp: '34619214928',
    city: 'Sevilla'
  };

  const TYPES = ['Piso', 'Ático', 'Casa', 'Chalet', 'Local'];
  const ZONES = ['Triana', 'Nervión', 'Los Remedios', 'Macarena', 'Casco Antiguo', 'Sevilla Este', 'Aljarafe'];
  const EXTRAS = ['Terraza', 'Garaje', 'Piscina', 'Ascensor', 'Aire acondicionado', 'Patio', 'Trastero', 'Amueblado'];

  const LISTINGS = [
    {
      id: 'casa-triana', ref: 'AL-101', featured: true,
      title: 'Casa de dos plantas con patio', type: 'Casa', zone: 'Triana',
      op: 'venta', price: 385000, beds: 3, baths: 2, m2: 148,
      extras: ['Patio', 'Aire acondicionado', 'Terraza'],
      cover: 'f-casa-triana.svg', gallery: ['patio-a.svg', 'salon-a.svg', 'cocina-a.svg', 'dormitorio-a.svg', 'bano-a.svg'],
      summary: 'Casa con patio interior y azotea, a un paseo del río.',
      description: 'Vivienda unifamiliar de dos plantas organizada alrededor de un patio con zócalo de azulejo. En planta baja, salón comedor con salida al patio y cocina independiente. Arriba, tres dormitorios y dos baños completos. Azotea transitable para tender y para las tardes de verano.'
    },
    {
      id: 'piso-nervion', ref: 'AL-102', featured: true,
      title: 'Piso exterior de 3 dormitorios', type: 'Piso', zone: 'Nervión',
      op: 'venta', price: 289000, beds: 3, baths: 2, m2: 112,
      extras: ['Ascensor', 'Garaje', 'Aire acondicionado', 'Trastero'],
      cover: 'f-piso-nervion.svg', gallery: ['salon-b.svg', 'cocina-a.svg', 'dormitorio-b.svg', 'bano-a.svg'],
      summary: 'Exterior, con plaza de garaje y trastero en el mismo edificio.',
      description: 'Piso exterior en planta intermedia con mucha luz durante la mañana. Salón amplio con balcón a la calle, cocina con lavadero, tres dormitorios (el principal con baño en suite) y un segundo baño completo. Plaza de garaje y trastero incluidos en el precio.'
    },
    {
      id: 'atico-centro', ref: 'AL-103', featured: true,
      title: 'Ático con terraza y vistas', type: 'Ático', zone: 'Casco Antiguo',
      op: 'venta', price: 425000, beds: 2, baths: 2, m2: 96,
      extras: ['Terraza', 'Ascensor', 'Aire acondicionado'],
      cover: 'f-atico-centro.svg', gallery: ['terraza-a.svg', 'salon-a.svg', 'dormitorio-a.svg', 'bano-a.svg'],
      summary: 'Última planta con terraza de uso diario en pleno centro.',
      description: 'Ático de dos dormitorios con terraza a la que se accede desde el salón. Cocina abierta, dos baños y armarios empotrados. Edificio con ascensor. Una vivienda pensada para vivir el centro sin renunciar al exterior.'
    },
    {
      id: 'piso-remedios-alquiler', ref: 'AL-104', featured: true,
      title: 'Piso amueblado para entrar a vivir', type: 'Piso', zone: 'Los Remedios',
      op: 'alquiler', price: 1150, beds: 2, baths: 1, m2: 84,
      extras: ['Amueblado', 'Ascensor', 'Aire acondicionado'],
      cover: 'f-piso-remedios.svg', gallery: ['salon-b.svg', 'dormitorio-b.svg', 'cocina-a.svg', 'bano-a.svg'],
      summary: 'Alquiler de larga temporada, amueblado y con electrodomésticos.',
      description: 'Piso de dos dormitorios totalmente amueblado, con cocina equipada y aire acondicionado en salón y dormitorios. Edificio con ascensor y portero. Pensado para alquiler de larga temporada.'
    },
    {
      id: 'chalet-aljarafe', ref: 'AL-105', featured: true,
      title: 'Chalet con piscina y jardín', type: 'Chalet', zone: 'Aljarafe',
      op: 'venta', price: 545000, beds: 4, baths: 3, m2: 230,
      extras: ['Piscina', 'Garaje', 'Terraza', 'Aire acondicionado'],
      cover: 'f-chalet-aljarafe.svg', gallery: ['salon-a.svg', 'cocina-a.svg', 'dormitorio-a.svg', 'terraza-a.svg', 'bano-a.svg'],
      summary: 'Independiente, con piscina y a pocos minutos de Sevilla.',
      description: 'Chalet independiente de líneas actuales con salón abierto al jardín y a la piscina. Cuatro dormitorios, tres baños y garaje cubierto. Una opción para quien busca espacio exterior cerca de la ciudad.'
    },
    {
      id: 'casa-macarena', ref: 'AL-106',
      title: 'Casa de tres plantas para reformar', type: 'Casa', zone: 'Macarena',
      op: 'venta', price: 239000, beds: 4, baths: 2, m2: 176,
      extras: ['Patio', 'Terraza'],
      cover: 'f-casa-macarena.svg', gallery: ['patio-a.svg', 'salon-b.svg', 'dormitorio-b.svg'],
      summary: 'Mucho espacio y buena distribución para adaptarla a tu gusto.',
      description: 'Casa de tres plantas con patio y azotea que necesita actualización. Estructura en buen estado y distribución fácil de adaptar. Una oportunidad para quien quiere hacer su casa a medida.'
    },
    {
      id: 'piso-este', ref: 'AL-107',
      title: 'Piso con piscina comunitaria', type: 'Piso', zone: 'Sevilla Este',
      op: 'venta', price: 189000, beds: 3, baths: 2, m2: 98,
      extras: ['Piscina', 'Garaje', 'Ascensor', 'Trastero'],
      cover: 'f-piso-este.svg', gallery: ['salon-a.svg', 'cocina-a.svg', 'dormitorio-a.svg', 'bano-a.svg'],
      summary: 'Urbanización cerrada con piscina, garaje y trastero.',
      description: 'Piso de tres dormitorios en urbanización cerrada con piscina y zonas comunes. Salón con terraza acristalada, cocina con lavadero y dos baños. Garaje y trastero en el mismo edificio.'
    },
    {
      id: 'piso-nervion-alquiler', ref: 'AL-108',
      title: 'Piso luminoso junto a zona comercial', type: 'Piso', zone: 'Nervión',
      op: 'alquiler', price: 1350, beds: 3, baths: 2, m2: 105,
      extras: ['Ascensor', 'Aire acondicionado', 'Garaje'],
      cover: 'f-piso-nervion.svg', gallery: ['salon-b.svg', 'dormitorio-b.svg', 'cocina-a.svg'],
      summary: 'Tres dormitorios, garaje y bien comunicado.',
      description: 'Piso exterior de tres dormitorios y dos baños con plaza de garaje. Cerca de comercios, transporte y colegios. Se alquila sin amueblar.'
    },
    {
      id: 'atico-triana-alquiler', ref: 'AL-109',
      title: 'Ático con terraza en alquiler', type: 'Ático', zone: 'Triana',
      op: 'alquiler', price: 1250, beds: 1, baths: 1, m2: 62,
      extras: ['Terraza', 'Amueblado', 'Aire acondicionado'],
      cover: 'f-atico-centro.svg', gallery: ['terraza-a.svg', 'salon-a.svg', 'dormitorio-a.svg'],
      summary: 'Un dormitorio y una terraza que se usa todo el año.',
      description: 'Ático de un dormitorio, amueblado, con terraza privada. Salón con cocina abierta y baño completo. Ideal para una o dos personas.'
    },
    {
      id: 'local-centro', ref: 'AL-110',
      title: 'Local a pie de calle con escaparate', type: 'Local', zone: 'Casco Antiguo',
      op: 'alquiler', price: 1600, beds: 0, baths: 1, m2: 120,
      extras: ['Aire acondicionado'],
      cover: 'f-local-centro.svg', gallery: ['salon-b.svg'],
      summary: 'Escaparate amplio en calle con paso de gente.',
      description: 'Local diáfano a pie de calle con gran escaparate y aseo. Apto para comercio u oficina.'
    }
  ];

  const fmtPrice = (l) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0, useGrouping: 'always' }).format(l.price) + ' €' + (l.op === 'alquiler' ? '/mes' : '');

  window.ALVES = { CONFIG, TYPES, ZONES, EXTRAS, LISTINGS, fmtPrice };
})();
