/*
 * Inmobiliaria Inmomairena · demo comercial
 * ---------------------------------------------------------------
 * CONTENIDO DE DEMOSTRACIÓN. Todos los inmuebles de este archivo son
 * FICTICIOS: no corresponden a viviendas reales de la agencia ni de
 * terceros ni están copiados de ningún portal. Las imágenes son
 * ilustraciones propias (assets/img, generadas por
 * demos/inmomairena/tools/gen-images.mjs).
 *
 * En la web final este listado vendría del panel privado. En la demo,
 * /admin-demo guarda los cambios en el navegador (localStorage) y la
 * web pública los lee, para que el cliente vea el efecto en su móvil.
 */
(function () {
  const CONFIG = {
    brand: 'Inmomairena',
    legal: 'Inmobiliaria Inmomairena',
    phone: '633 57 35 99',
    phoneHref: 'tel:+34633573599',
    // WhatsApp en formato internacional sin "+". Pendiente de confirmar que el número tiene WhatsApp.
    // Dejar '' para ocultar todos los botones de WhatsApp.
    whatsapp: '34633573599',
    town: 'Mairena del Aljarafe',
    zones: ['Mairena del Aljarafe', 'Bormujos', 'Tomares', 'San Juan de Aznalfarache', 'Gelves', 'Palomares del Río', 'Almensilla', 'Espartinas']
  };

  const TYPES = ['Piso', 'Ático', 'Casa', 'Adosado', 'Pareado', 'Chalet', 'Loft', 'Local'];
  const STATUS = {
    disponible: 'Disponible',
    reservado: 'Reservado',
    vendido: 'Vendido',
    alquilado: 'Alquilado'
  };

  const SEED = [
    {
      id: 'chalet-simon-verde', demo: true, featured: true,
      title: 'Chalet con piscina y jardín', type: 'Chalet', town: 'Mairena del Aljarafe', area: 'Simón Verde',
      op: 'venta', price: 465000, status: 'disponible',
      beds: 4, baths: 3, m2: 236, plot: 540,
      features: ['Piscina', 'Jardín', 'Garaje doble', 'Aire acondicionado', 'Placas solares', 'Barbacoa'],
      cover: 'f-chalet-simon-verde.svg', gallery: ['piscina-a.svg', 'salon-c.svg', 'cocina-a.svg', 'dormitorio-a.svg', 'bano-b.svg'],
      summary: 'Parcela de 540 m² en una de las zonas más tranquilas de Mairena.',
      description: 'Chalet independiente de dos plantas con salón de doble altura abierto al jardín y a la piscina. Cocina amplia con office, cuatro dormitorios (el principal en suite con vestidor) y tres baños. Garaje cubierto para dos coches, zona de barbacoa y placas solares para el agua caliente. A pocos minutos en coche de colegios, comercios y del acceso a Sevilla.',
      map: { x: 248, y: 196 }
    },
    {
      id: 'piso-ciudad-expo', demo: true, featured: true,
      title: 'Piso de 3 dormitorios junto al metro', type: 'Piso', town: 'Mairena del Aljarafe', area: 'Ciudad Expo',
      op: 'venta', price: 198000, status: 'disponible',
      beds: 3, baths: 2, m2: 104, plot: null,
      features: ['Ascensor', 'Piscina comunitaria', 'Plaza de garaje', 'Trastero', 'Aire acondicionado'],
      cover: 'f-piso-ciudad-expo.svg', gallery: ['salon-a.svg', 'cocina-b.svg', 'dormitorio-b.svg', 'bano-a.svg'],
      summary: 'Urbanización con piscina, garaje y trastero, a un paseo de la parada de metro.',
      description: 'Piso exterior en urbanización cerrada con piscina y zonas verdes. Salón luminoso con salida a terraza, cocina independiente con lavadero, tres dormitorios y dos baños completos. Incluye plaza de garaje y trastero en el mismo edificio. Ideal para quien trabaja en Sevilla y quiere vivir con más espacio y sin depender del coche.',
      map: { x: 300, y: 226 }
    },
    {
      id: 'atico-cavaleri', demo: true, featured: true,
      title: 'Ático con terraza de 40 m²', type: 'Ático', town: 'Mairena del Aljarafe', area: 'Cavaleri',
      op: 'venta', price: 239000, status: 'reservado',
      beds: 2, baths: 2, m2: 92, plot: null,
      features: ['Terraza', 'Ascensor', 'Plaza de garaje', 'Orientación sur', 'Armarios empotrados'],
      cover: 'f-atico-cavaleri.svg', gallery: ['terraza-a.svg', 'salon-b.svg', 'cocina-c.svg', 'dormitorio-a.svg'],
      summary: 'Última planta con terraza orientada al sur y vistas despejadas.',
      description: 'Ático de dos dormitorios con terraza de unos 40 m² a la que se sale desde el salón. Dormitorio principal con baño en suite, cocina equipada y garaje en el mismo edificio. Mucha luz durante todo el día y una terraza pensada para usarla todo el año.',
      map: { x: 270, y: 240 }
    },
    {
      id: 'adosado-bormujos', demo: true, featured: true,
      title: 'Adosado reformado con patio', type: 'Adosado', town: 'Bormujos', area: 'Zona residencial',
      op: 'venta', price: 255000, status: 'disponible',
      beds: 4, baths: 3, m2: 160, plot: 190,
      features: ['Patio', 'Cochera', 'Reformado', 'Azotea', 'Aire acondicionado'],
      cover: 'f-adosado-bormujos.svg', gallery: ['salon-b.svg', 'cocina-a.svg', 'dormitorio-b.svg', 'patio-a.svg', 'bano-a.svg'],
      summary: 'Tres plantas, reforma reciente y patio trasero para el día a día de una familia.',
      description: 'Vivienda adosada con reforma integral reciente: cocina nueva abierta al salón, suelos y carpintería renovados. Cuatro dormitorios, tres baños, patio trasero y azotea transitable. Cochera propia en planta baja.',
      map: { x: 196, y: 150 }
    },
    {
      id: 'piso-lepanto-alquiler', demo: true, featured: true,
      title: 'Piso amueblado para entrar a vivir', type: 'Piso', town: 'Mairena del Aljarafe', area: 'Lepanto',
      op: 'alquiler', price: 890, status: 'disponible',
      beds: 2, baths: 1, m2: 78, plot: null,
      features: ['Amueblado', 'Ascensor', 'Aire acondicionado', 'Balcón'],
      cover: 'f-piso-lepanto.svg', gallery: ['salon-a.svg', 'cocina-b.svg', 'dormitorio-a.svg', 'bano-a.svg'],
      summary: 'Alquiler de larga temporada, amueblado y con electrodomésticos.',
      description: 'Piso de dos dormitorios totalmente amueblado, con electrodomésticos y aire acondicionado en todas las estancias. Edificio con ascensor y comercios a pie de calle. Alquiler de larga temporada con contrato y estudio de solvencia.',
      map: { x: 286, y: 212 }
    },
    {
      id: 'casa-casco-antiguo', demo: true, featured: false,
      title: 'Casa de pueblo con patio andaluz', type: 'Casa', town: 'Mairena del Aljarafe', area: 'Casco antiguo',
      op: 'venta', price: 215000, status: 'disponible',
      beds: 3, baths: 2, m2: 148, plot: 175,
      features: ['Patio', 'Azotea', 'Para actualizar', 'Techos altos'],
      cover: 'f-casa-casco.svg', gallery: ['patio-a.svg', 'salon-c.svg', 'cocina-c.svg', 'dormitorio-b.svg'],
      summary: 'Fachada tradicional, patio central y azotea, a pie del centro.',
      description: 'Casa tradicional de una planta y media en pleno casco antiguo, con patio central, techos altos y azotea. Conserva el carácter de las casas de pueblo del Aljarafe y admite actualización a tu gusto. A pocos pasos de la plaza, comercios y servicios.',
      map: { x: 262, y: 206 }
    },
    {
      id: 'pareado-tomares', demo: true, featured: false,
      title: 'Pareado con jardín y piscina comunitaria', type: 'Pareado', town: 'Tomares', area: 'Urbanización',
      op: 'venta', price: 329000, status: 'disponible',
      beds: 4, baths: 3, m2: 178, plot: 260,
      features: ['Jardín', 'Piscina comunitaria', 'Garaje', 'Buhardilla', 'Aire acondicionado'],
      cover: 'f-pareado-tomares.svg', gallery: ['salon-b.svg', 'cocina-a.svg', 'dormitorio-a.svg', 'piscina-a.svg', 'bano-b.svg'],
      summary: 'Jardín propio, buhardilla y piscina comunitaria en urbanización cerrada.',
      description: 'Pareado en urbanización cerrada con piscina comunitaria. Salón con chimenea y salida al jardín, cocina independiente, cuatro dormitorios y buhardilla diáfana para despacho o juegos. Garaje cerrado.',
      map: { x: 348, y: 168 }
    },
    {
      id: 'chalet-palomares', demo: true, featured: false,
      title: 'Villa moderna de una planta', type: 'Chalet', town: 'Palomares del Río', area: 'Urbanización residencial',
      op: 'venta', price: 389000, status: 'vendido',
      beds: 3, baths: 2, m2: 185, plot: 700,
      features: ['Piscina', 'Jardín', 'Una planta', 'Domótica', 'Garaje'],
      cover: 'f-chalet-palomares.svg', gallery: ['piscina-a.svg', 'salon-c.svg', 'cocina-a.svg', 'dormitorio-b.svg'],
      summary: 'Todo en una planta, parcela de 700 m² y piscina.',
      description: 'Villa de una sola planta y líneas actuales, con grandes ventanales al jardín y piscina. Tres dormitorios, dos baños, domótica y garaje. Parcela llana de 700 m².',
      map: { x: 230, y: 312 }
    },
    {
      id: 'piso-san-juan', demo: true, featured: false,
      title: 'Piso con vistas a Sevilla', type: 'Piso', town: 'San Juan de Aznalfarache', area: 'San Juan Alto',
      op: 'venta', price: 165000, status: 'disponible',
      beds: 3, baths: 1, m2: 86, plot: null,
      features: ['Vistas', 'Ascensor', 'Terraza', 'Reformado'],
      cover: 'f-piso-san-juan.svg', gallery: ['salon-a.svg', 'cocina-c.svg', 'dormitorio-b.svg', 'bano-a.svg'],
      summary: 'Reformado, con terraza y vistas a Sevilla desde el salón.',
      description: 'Piso reformado en la parte alta de San Juan con vistas abiertas hacia Sevilla. Tres dormitorios, baño completo, cocina amueblada y terraza. Muy bien comunicado con el metro.',
      map: { x: 382, y: 224 }
    },
    {
      id: 'casa-almensilla', demo: true, featured: false,
      title: 'Casa de campo entre olivos', type: 'Casa', town: 'Almensilla', area: 'Afueras',
      op: 'venta', price: 279000, status: 'reservado',
      beds: 3, baths: 2, m2: 165, plot: 1800,
      features: ['Parcela', 'Porche', 'Pozo', 'Chimenea', 'Olivos'],
      cover: 'f-casa-almensilla.svg', gallery: ['salon-c.svg', 'cocina-c.svg', 'dormitorio-a.svg', 'patio-a.svg'],
      summary: 'Parcela de 1.800 m² con olivos y porche, a diez minutos de Mairena.',
      description: 'Casa de una planta con porche corrido, chimenea en el salón y parcela de 1.800 m² con olivos. Tranquilidad total sin alejarse de los servicios del Aljarafe.',
      map: { x: 206, y: 366 }
    },
    {
      id: 'loft-gelves-alquiler', demo: true, featured: false,
      title: 'Loft junto al puerto deportivo', type: 'Loft', town: 'Gelves', area: 'Puerto deportivo',
      op: 'alquiler', price: 750, status: 'alquilado',
      beds: 1, baths: 1, m2: 58, plot: null,
      features: ['Amueblado', 'Terraza', 'Aire acondicionado'],
      cover: 'f-loft-gelves.svg', gallery: ['salon-b.svg', 'cocina-b.svg', 'bano-b.svg'],
      summary: 'Diáfano, amueblado y con terraza, cerca del río.',
      description: 'Loft diáfano y luminoso, amueblado, con terraza y aire acondicionado. A pocos minutos andando del puerto deportivo de Gelves.',
      map: { x: 348, y: 296 }
    },
    {
      id: 'local-mairena-alquiler', demo: true, featured: false,
      title: 'Local comercial a pie de calle', type: 'Local', town: 'Mairena del Aljarafe', area: 'Ciudad Aljarafe',
      op: 'alquiler', price: 1100, status: 'disponible',
      beds: 0, baths: 1, m2: 120, plot: null,
      features: ['Escaparate', 'Esquina', 'Salida de humos', 'Diáfano'],
      cover: 'f-local-mairena.svg', gallery: ['salon-b.svg', 'bano-a.svg'],
      summary: 'Local en esquina con escaparate en una calle con mucho paso.',
      description: 'Local diáfano de 120 m² en esquina, con dos escaparates, aseo y salida de humos. Apto para comercio, oficina o restauración en una zona con mucho movimiento.',
      map: { x: 316, y: 190 }
    }
  ];

  const KEY = 'inmomairena-demo-v1';

  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  const Store = {
    all() {
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) { const list = JSON.parse(raw); if (Array.isArray(list)) return list; }
      } catch (e) { /* almacenamiento no disponible: usamos los datos de ejemplo */ }
      return clone(SEED);
    },
    save(list) {
      try { localStorage.setItem(KEY, JSON.stringify(list)); return true; }
      catch (e) { return false; }
    },
    get(id) { return this.all().find(p => p.id === id); },
    reset() { try { localStorage.removeItem(KEY); } catch (e) {} },
    isModified() { try { return !!localStorage.getItem(KEY); } catch (e) { return false; } }
  };

  const fmt = {
    price(p) {
      const n = new Intl.NumberFormat('es-ES').format(p.price);
      return p.op === 'alquiler' ? `${n} €/mes` : `${n} €`;
    },
    op(p) { return p.op === 'alquiler' ? 'Alquiler' : 'Venta'; },
    status(p) { return STATUS[p.status] || p.status; }
  };

  // Una imagen puede ser un nombre de archivo de assets/img o un data: URL subido desde el panel.
  function img(src, base) { return /^data:|^https?:/.test(src) ? src : `${base}assets/img/${src}`; }

  window.IM = { CONFIG, TYPES, STATUS, SEED, Store, fmt, img };
})();
