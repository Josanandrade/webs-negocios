/*
 * Hogar Inmobiliaria · datos de la demo
 *
 * CONTENIDO DE DEMOSTRACIÓN: todos los inmuebles de este archivo son ficticios.
 * No corresponden a viviendas reales de Hogar Inmobiliaria ni de terceros, y sus
 * imágenes son ilustraciones SVG generadas en assets/art.js (no fotos de portales).
 *
 * En el producto final estos datos vendrán del panel privado de administración.
 * En la demo, /admin-demo guarda los cambios en el navegador (localStorage) para
 * que se vean en la web pública del mismo dispositivo.
 */
(function () {
  // ── Configuración del negocio ─────────────────────────────────────────────
  // Teléfono público (Páginas Amarillas y periódico La Semana, abril 2026).
  // WHATSAPP: cambia solo esta línea si el número de WhatsApp es otro.
  var CONFIG = {
    nombre: 'Hogar Inmobiliaria',
    whatsapp: '34624044858',
    telefono: '624 044 858',
    telefonoHref: '+34624044858',
    email: 'hogartuinmobiliaria@hotmail.com',
    direccion: 'C. San Sebastián, 21',
    localidad: '41701 Dos Hermanas (Sevilla)',
    horario: 'Lunes a viernes, 10:00–13:30 y 17:30–20:30',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hogar+Inmobiliaria+Calle+San+Sebasti%C3%A1n+Dos+Hermanas'
  };

  var ZONAS = ['Dos Hermanas centro', 'Vista Azul', 'Montequinto', 'Entrenúcleos', 'El Arenal', 'Fuente del Rey', 'Sevilla Este', 'Sevilla', 'Alcalá de Guadaíra', 'Coria del Río'];
  var TIPOS = ['Piso', 'Ático', 'Dúplex', 'Adosado', 'Casa', 'Chalet', 'Local'];
  var ESTADOS = ['Disponible', 'Reservado', 'Vendido', 'Alquilado'];
  var EXTRAS = [
    ['garaje', 'Garaje'], ['terraza', 'Terraza'], ['ascensor', 'Ascensor'], ['piscina', 'Piscina'],
    ['patio', 'Patio o jardín'], ['trastero', 'Trastero'], ['aire', 'Aire acondicionado'],
    ['colegios', 'Colegios cerca'], ['amueblado', 'Amueblado'], ['reformado', 'Reformado']
  ];

  // ── Inmuebles ficticios (DEMO) ────────────────────────────────────────────
  var INMUEBLES = [
    {
      id: 'adosado-vista-azul', ref: 'HI-0412', destacado: true, publicado: true,
      titulo: 'Adosado con patio en Vista Azul', tipo: 'Adosado', operacion: 'Venta', estado: 'Disponible',
      precio: 239000, zona: 'Vista Azul', localidad: 'Dos Hermanas', hab: 4, banos: 2, m2: 132,
      extras: ['garaje', 'patio', 'piscina', 'aire', 'colegios', 'trastero'],
      arte: { fachada: 'adosado', pared: '#F6E6D3', acento: '#D65A36' },
      resumen: 'Cuatro dormitorios, patio trasero y piscina comunitaria en una urbanización tranquila.',
      descripcion: [
        'Adosado de dos plantas pensado para una familia que necesita espacio. En la planta baja, salón comedor con salida directa al patio, cocina independiente con lavadero y un aseo de cortesía.',
        'Arriba, cuatro dormitorios: el principal con baño propio y armario empotrado, y otros tres que comparten un segundo baño completo. La urbanización tiene piscina comunitaria y zona de juegos, y la plaza de garaje está incluida en el precio.'
      ]
    },
    {
      id: 'piso-centro-dos-hermanas', ref: 'HI-0398', destacado: true, publicado: true,
      titulo: 'Piso reformado en el centro', tipo: 'Piso', operacion: 'Venta', estado: 'Disponible',
      precio: 159000, zona: 'Dos Hermanas centro', localidad: 'Dos Hermanas', hab: 3, banos: 1, m2: 88,
      extras: ['ascensor', 'terraza', 'reformado', 'aire', 'colegios'],
      arte: { fachada: 'piso', pared: '#EFD9C4', acento: '#4F7A5B' },
      resumen: 'A un paseo de todo: tiendas, colegios y transporte.',
      descripcion: [
        'Piso exterior en tercera planta con ascensor, reformado hace poco: cocina nueva, suelos de porcelánico y ventanas de aluminio con rotura de puente térmico.',
        'Tres dormitorios, baño completo con plato de ducha y una terraza pequeña orientada al sur donde cabe una mesa para desayunar. Ideal como primera vivienda.'
      ]
    },
    {
      id: 'chalet-montequinto', ref: 'HI-0377', destacado: true, publicado: true,
      titulo: 'Chalet con piscina en Montequinto', tipo: 'Chalet', operacion: 'Venta', estado: 'Disponible',
      precio: 389000, zona: 'Montequinto', localidad: 'Dos Hermanas', hab: 5, banos: 3, m2: 240,
      extras: ['garaje', 'piscina', 'patio', 'terraza', 'aire', 'trastero', 'colegios'],
      arte: { fachada: 'chalet', pared: '#FBF3E6', acento: '#23304A' },
      resumen: 'Parcela con piscina propia, porche y garaje para dos coches.',
      descripcion: [
        'Chalet independiente sobre parcela con jardín, piscina privada y porche cubierto. La casa se reparte en dos plantas y una buhardilla que hoy se usa como sala de juegos.',
        'Cinco dormitorios y tres baños, salón con chimenea y cocina amplia con office. Garaje cerrado para dos coches y trastero. Cerca del metro y de varios colegios.'
      ]
    },
    {
      id: 'piso-entrenucleos-alquiler', ref: 'HI-0421', destacado: true, publicado: true,
      titulo: 'Piso familiar en Entrenúcleos', tipo: 'Piso', operacion: 'Alquiler', estado: 'Disponible',
      precio: 950, zona: 'Entrenúcleos', localidad: 'Dos Hermanas', hab: 3, banos: 2, m2: 105,
      extras: ['garaje', 'piscina', 'ascensor', 'aire', 'trastero', 'colegios'],
      arte: { fachada: 'piso', pared: '#E3ECEA', acento: '#D65A36' },
      resumen: 'Urbanización con piscina y zonas verdes, plaza de garaje incluida.',
      descripcion: [
        'Piso de obra reciente en una urbanización cerrada con piscina, pistas y zonas verdes. Tres dormitorios, dos baños y salón con salida a balcón.',
        'Se alquila sin amueblar, con cocina equipada, aire acondicionado por conductos, plaza de garaje y trastero. Contrato de larga duración.'
      ]
    },
    {
      id: 'atico-sevilla-este', ref: 'HI-0405', destacado: false, publicado: true,
      titulo: 'Ático con terraza en Sevilla Este', tipo: 'Ático', operacion: 'Venta', estado: 'Reservado',
      precio: 215000, zona: 'Sevilla Este', localidad: 'Sevilla', hab: 3, banos: 2, m2: 96,
      extras: ['terraza', 'ascensor', 'garaje', 'aire'],
      arte: { fachada: 'atico', pared: '#F1E2D0', acento: '#F2B544' },
      resumen: 'Terraza de 30 m² con vistas despejadas y mucha luz todo el día.',
      descripcion: [
        'Ático en edificio con ascensor y garaje. Lo mejor es la terraza, de unos 30 m², donde caben una mesa grande y una zona de sombra para las tardes.',
        'Tres dormitorios, dos baños (uno en suite) y cocina abierta al salón. Muy luminoso por su orientación este-oeste.'
      ]
    },
    {
      id: 'casa-el-arenal', ref: 'HI-0389', destacado: false, publicado: true,
      titulo: 'Casa de dos plantas en El Arenal', tipo: 'Casa', operacion: 'Venta', estado: 'Disponible',
      precio: 175000, zona: 'El Arenal', localidad: 'Dos Hermanas', hab: 3, banos: 2, m2: 150,
      extras: ['patio', 'terraza', 'colegios'],
      arte: { fachada: 'casa', pared: '#FFFFFF', acento: '#B4462A' },
      resumen: 'Casa con patio interior y azotea, en calle tranquila.',
      descripcion: [
        'Casa entre medianeras de dos plantas, con patio interior que da luz a la planta baja y azotea transitable.',
        'Tres dormitorios, dos baños y un salón amplio. Necesita una actualización a gusto del comprador, lo que se refleja en el precio.'
      ]
    },
    {
      id: 'duplex-fuente-del-rey', ref: 'HI-0416', destacado: false, publicado: true,
      titulo: 'Dúplex luminoso en Fuente del Rey', tipo: 'Dúplex', operacion: 'Venta', estado: 'Disponible',
      precio: 198000, zona: 'Fuente del Rey', localidad: 'Dos Hermanas', hab: 3, banos: 2, m2: 118,
      extras: ['terraza', 'garaje', 'aire', 'trastero'],
      arte: { fachada: 'duplex', pared: '#F4E9DA', acento: '#4F7A5B' },
      resumen: 'Dos plantas, terraza en el dormitorio principal y garaje.',
      descripcion: [
        'Dúplex en planta alta con escalera interior. Abajo, salón con chimenea, cocina y aseo; arriba, tres dormitorios y baño, con terraza en el principal.',
        'Plaza de garaje y trastero en el mismo edificio.'
      ]
    },
    {
      id: 'piso-oromana-alquiler', ref: 'HI-0424', destacado: false, publicado: true,
      titulo: 'Piso junto al parque de Oromana', tipo: 'Piso', operacion: 'Alquiler', estado: 'Disponible',
      precio: 780, zona: 'Alcalá de Guadaíra', localidad: 'Alcalá de Guadaíra', hab: 2, banos: 1, m2: 75,
      extras: ['amueblado', 'aire', 'ascensor'],
      arte: { fachada: 'piso', pared: '#F3DCCB', acento: '#23304A' },
      resumen: 'Amueblado y listo para entrar, a dos pasos del parque.',
      descripcion: [
        'Piso de dos dormitorios amueblado y con electrodomésticos, en edificio con ascensor.',
        'Salón comedor con balcón, cocina independiente y baño con bañera. Zona tranquila con el parque de Oromana al lado.'
      ]
    },
    // Solo visibles en el panel (completan el resumen 12 · 8 · 2 · 1 · 1)
    {
      id: 'local-avenida', ref: 'HI-0359', destacado: false, publicado: true,
      titulo: 'Local comercial a pie de calle', tipo: 'Local', operacion: 'Alquiler', estado: 'Disponible',
      precio: 650, zona: 'Dos Hermanas centro', localidad: 'Dos Hermanas', hab: 0, banos: 1, m2: 70,
      extras: ['aire'],
      arte: { fachada: 'local', pared: '#EFE3D3', acento: '#D65A36' },
      resumen: 'Local diáfano con escaparate en zona de paso.',
      descripcion: ['Local diáfano de 70 m² con escaparate, aseo y salida de humos. Listo para abrir.']
    },
    {
      id: 'adosado-condequinto', ref: 'HI-0340', destacado: false, publicado: true,
      titulo: 'Adosado en Condequinto', tipo: 'Adosado', operacion: 'Venta', estado: 'Reservado',
      precio: 265000, zona: 'Montequinto', localidad: 'Dos Hermanas', hab: 4, banos: 3, m2: 145,
      extras: ['garaje', 'piscina', 'patio'],
      arte: { fachada: 'adosado', pared: '#F1E6DA', acento: '#4F7A5B' },
      resumen: 'Adosado de esquina con piscina comunitaria.',
      descripcion: ['Adosado de esquina con jardín en tres lados, cuatro dormitorios y piscina comunitaria.']
    },
    {
      id: 'piso-tiro-de-linea', ref: 'HI-0322', destacado: false, publicado: true,
      titulo: 'Piso en Tiro de Línea', tipo: 'Piso', operacion: 'Venta', estado: 'Vendido',
      precio: 132000, zona: 'Sevilla', localidad: 'Sevilla', hab: 3, banos: 1, m2: 80,
      extras: ['ascensor'],
      arte: { fachada: 'piso', pared: '#EADBC8', acento: '#B4462A' },
      resumen: 'Piso de tres dormitorios con ascensor.',
      descripcion: ['Piso de tres dormitorios en edificio con ascensor.']
    },
    {
      id: 'chalet-coria-alquiler', ref: 'HI-0331', destacado: false, publicado: true,
      titulo: 'Chalet con jardín en Coria del Río', tipo: 'Chalet', operacion: 'Alquiler', estado: 'Alquilado',
      precio: 1200, zona: 'Coria del Río', localidad: 'Coria del Río', hab: 4, banos: 2, m2: 180,
      extras: ['garaje', 'piscina', 'patio'],
      arte: { fachada: 'chalet', pared: '#F7EEDF', acento: '#F2B544' },
      resumen: 'Chalet con piscina y jardín.',
      descripcion: ['Chalet de cuatro dormitorios con piscina y jardín, alquilado por temporada larga.']
    }
  ];

  var KEY = 'hogar-demo-inmuebles-v1';

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) { /* sin almacenamiento: se usan los datos de serie */ }
    return clone(INMUEBLES);
  }

  function save(list) {
    try { window.localStorage.setItem(KEY, JSON.stringify(list)); return true; } catch (e) { return false; }
  }

  function reset() {
    try { window.localStorage.removeItem(KEY); } catch (e) { /* nada */ }
    return clone(INMUEBLES);
  }

  function isModified() {
    try { return !!window.localStorage.getItem(KEY); } catch (e) { return false; }
  }

  function euros(n) {
    return Math.round(n).toLocaleString('es-ES').replace(/,/g, '.');
  }

  function precio(p) {
    return euros(p.precio) + (p.operacion === 'Alquiler' ? ' €/mes' : ' €');
  }

  function wa(text) {
    return 'https://wa.me/' + CONFIG.whatsapp + (text ? '?text=' + encodeURIComponent(text) : '');
  }

  function extraLabel(key) {
    for (var i = 0; i < EXTRAS.length; i++) if (EXTRAS[i][0] === key) return EXTRAS[i][1];
    return key;
  }

  window.HOGAR = {
    config: CONFIG, zonas: ZONAS, tipos: TIPOS, estados: ESTADOS, extras: EXTRAS,
    load: load, save: save, reset: reset, isModified: isModified,
    euros: euros, precio: precio, wa: wa, extraLabel: extraLabel
  };
})();
