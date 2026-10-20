/*
 * CONTENIDO DE DEMOSTRACIÓN
 * -------------------------
 * Todos los inmuebles de este archivo son FICTICIOS. No corresponden a
 * propiedades reales ni a anuncios de ningún portal. Las imágenes son
 * ilustraciones propias (assets/inmuebles/*.svg).
 * En el producto final este listado vendría del panel de administración.
 */
window.JL_INMUEBLES = [
  {
    id: "casa-mairena", demo: true, destacado: true,
    titulo: "Casa adosada con patio en Mairena del Aljarafe",
    tipo: "Casa", operacion: "venta", estado: "disponible", precio: 289000,
    localidad: "Mairena del Aljarafe", zona: "Aljarafe",
    hab: 4, banos: 2, m2: 160,
    extras: ["Garaje", "Terraza", "Patio", "Aire acondicionado", "Trastero"],
    fotos: ["ext-adosado", "salon-a", "cocina-a", "dormitorio-a", "patio"],
    resumen: "Cuatro dormitorios, garaje propio y patio trasero en una calle tranquila.",
    descripcion: "Vivienda adosada en dos plantas pensada para una familia que necesita espacio. En planta baja, salón con salida al patio, cocina independiente y aseo. Arriba, cuatro dormitorios y dos baños, con una terraza que da a la fachada principal. Cochera cerrada y trastero.",
  },
  {
    id: "piso-sevilla", demo: true, destacado: true,
    titulo: "Piso reformado en Sevilla, zona Nervión",
    tipo: "Piso", operacion: "venta", estado: "reservado", precio: 219000,
    localidad: "Sevilla", zona: "Nervión",
    hab: 3, banos: 1, m2: 92,
    extras: ["Ascensor", "Aire acondicionado", "Reformado", "Exterior"],
    fotos: ["ext-piso", "salon-b", "cocina-b", "dormitorio-b", "bano"],
    resumen: "Exterior, con ascensor y listo para entrar a vivir.",
    descripcion: "Piso exterior en una cuarta planta con ascensor. Reforma reciente de cocina y baño, carpintería nueva y suelos de tarima. Tres dormitorios, salón luminoso con balcón y buena conexión con transporte público y comercios.",
  },
  {
    id: "chalet-bollullos", demo: true, destacado: false,
    titulo: "Chalet con piscina en Bollullos de la Mitación",
    tipo: "Chalet", operacion: "alquiler", estado: "alquilado", precio: 1200,
    localidad: "Bollullos de la Mitación", zona: "Aljarafe",
    hab: 4, banos: 3, m2: 210,
    extras: ["Piscina", "Jardín", "Garaje", "Terraza", "Amueblado"],
    fotos: ["ext-chalet", "salon-c", "cocina-c", "dormitorio-a", "bano"],
    resumen: "Parcela con piscina y jardín, en alquiler de larga temporada.",
    descripcion: "Chalet independiente en urbanización, con piscina privada, jardín y porche. Cuatro dormitorios, uno de ellos en planta baja, y tres baños completos. Se alquila amueblado para larga temporada.",
  },
  {
    id: "atico-tomares", demo: true, destacado: true,
    titulo: "Ático con terraza de 40 m² en Tomares",
    tipo: "Ático", operacion: "venta", estado: "disponible", precio: 245000,
    localidad: "Tomares", zona: "Aljarafe",
    hab: 2, banos: 2, m2: 85,
    extras: ["Terraza", "Ascensor", "Garaje", "Piscina comunitaria", "Aire acondicionado"],
    fotos: ["ext-atico", "salon-b", "cocina-a", "dormitorio-b", "bano"],
    resumen: "Terraza privada con vistas, plaza de garaje y piscina comunitaria.",
    descripcion: "Ático de dos dormitorios con una terraza de unos 40 m² perfecta para comer fuera buena parte del año. Dos baños, cocina abierta al salón, plaza de garaje y trastero en el mismo edificio. Urbanización con piscina comunitaria.",
  },
  {
    id: "casa-umbrete", demo: true, destacado: false,
    titulo: "Casa de pueblo con patio en Umbrete",
    tipo: "Casa", operacion: "venta", estado: "disponible", precio: 159000,
    localidad: "Umbrete", zona: "Aljarafe",
    hab: 3, banos: 2, m2: 140,
    extras: ["Patio", "Azotea", "Chimenea"],
    fotos: ["ext-pueblo", "salon-c", "cocina-c", "dormitorio-a", "patio"],
    resumen: "Casa de dos plantas con patio interior, a pocos minutos de la plaza.",
    descripcion: "Casa tradicional de dos plantas con fachada encalada y patio interior. Salón con chimenea, cocina amplia, tres dormitorios y dos baños. Azotea transitable. Una buena base para quien quiere vivir en el pueblo con todo a mano.",
  },
  {
    id: "piso-bormujos", demo: true, destacado: true,
    titulo: "Piso con piscina comunitaria en Bormujos",
    tipo: "Piso", operacion: "alquiler", estado: "disponible", precio: 850,
    localidad: "Bormujos", zona: "Aljarafe",
    hab: 3, banos: 2, m2: 98,
    extras: ["Piscina comunitaria", "Garaje", "Ascensor", "Aire acondicionado"],
    fotos: ["ext-bajo", "salon-a", "cocina-b", "dormitorio-b", "bano"],
    resumen: "Tres dormitorios, plaza de garaje y zonas comunes con piscina.",
    descripcion: "Piso de tres dormitorios y dos baños en residencial cerrado con piscina y zonas verdes. Cocina equipada, aire acondicionado en todas las estancias y plaza de garaje incluida en el precio.",
  },
  {
    id: "chalet-espartinas", demo: true, destacado: false,
    titulo: "Chalet independiente en Espartinas",
    tipo: "Chalet", operacion: "venta", estado: "disponible", precio: 395000,
    localidad: "Espartinas", zona: "Aljarafe",
    hab: 5, banos: 3, m2: 260,
    extras: ["Piscina", "Jardín", "Garaje", "Terraza", "Trastero", "Aire acondicionado"],
    fotos: ["ext-chalet", "salon-a", "cocina-c", "dormitorio-b", "patio"],
    resumen: "Cinco dormitorios en parcela de unos 600 m² con piscina.",
    descripcion: "Chalet de una sola familia en parcela de unos 600 m², con piscina, jardín y aparcamiento interior para dos coches. Cinco dormitorios, tres baños, salón con chimenea y una cocina grande con office.",
  },
  {
    id: "piso-gines", demo: true, destacado: false,
    titulo: "Piso de dos dormitorios con terraza en Gines",
    tipo: "Piso", operacion: "alquiler", estado: "disponible", precio: 720,
    localidad: "Gines", zona: "Aljarafe",
    hab: 2, banos: 1, m2: 70,
    extras: ["Terraza", "Amueblado", "Aire acondicionado"],
    fotos: ["ext-piso", "salon-c", "cocina-a", "dormitorio-a", "bano"],
    resumen: "Amueblado, con terraza y cerca de todos los servicios.",
    descripcion: "Piso de dos dormitorios amueblado y con terraza. Cocina independiente, baño completo y aire acondicionado. Ideal para pareja o una persona que trabaja en Sevilla y busca algo más tranquilo.",
  }
];

// Posición aproximada (en % sobre el mapa esquemático) de cada localidad.
window.JL_PUEBLOS = {
  "Sevilla": { x: 84, y: 33 },
  "Tomares": { x: 62, y: 46 },
  "Mairena del Aljarafe": { x: 56, y: 70 },
  "Bormujos": { x: 50, y: 52 },
  "Gines": { x: 46, y: 36 },
  "Espartinas": { x: 31, y: 42 },
  "Umbrete": { x: 15, y: 52 },
  "Bollullos de la Mitación": { x: 26, y: 76 }
};
