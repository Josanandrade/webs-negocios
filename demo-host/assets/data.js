/* Fincas Encarna · datos de la demo.
   Los inmuebles son DATOS DE DEMOSTRACIÓN: no son inmuebles reales de la agencia. */
window.FE = {
  config: {
    name: "Fincas Encarna",
    legal: "Fincas Encarna Sociedad de Gestión Inmobiliaria S.L.",
    since: 2004,
    phone: "670 764 040",
    phoneHref: "tel:+34670764040",
    // Vacío oculta los botones de WhatsApp. Pendiente de confirmar que el móvil tiene WhatsApp.
    whatsapp: "34670764040",
    address: "Calle Guadalajara, 29",
    cp: "41014 Sevilla",
    area: "Bellavista · Sevilla"
  },

  listings: [
    {
      id: "EJ-101", title: "Piso de 3 dormitorios con terraza", type: "Piso", op: "venta",
      zone: "Bellavista", price: 168000, beds: 3, baths: 2, m2: 96, status: "disponible",
      art: "bloque", tone: 0, featured: true,
      text: "Vivienda exterior en tercera planta con ascensor, salón a la calle y terraza cerrada. Cocina independiente con lavadero.",
      tags: ["Ascensor", "Terraza", "Aire acondicionado", "Exterior"]
    },
    {
      id: "EJ-102", title: "Casa adosada con patio", type: "Casa", op: "venta",
      zone: "Pedro Salvador", price: 245000, beds: 4, baths: 2, m2: 142, status: "reservado",
      art: "adosada", tone: 1, featured: true,
      text: "Casa en dos plantas con patio trasero, cochera y azotea transitable. Para entrar a vivir con pequeñas reformas.",
      tags: ["Patio", "Cochera", "Azotea", "Trastero"]
    },
    {
      id: "EJ-103", title: "Ático con vistas despejadas", type: "Ático", op: "venta",
      zone: "La Palmera", price: 289000, beds: 2, baths: 2, m2: 88, status: "disponible",
      art: "atico", tone: 2, featured: true,
      text: "Ático luminoso con terraza de 30 m² orientada al sur, plaza de garaje y piscina comunitaria.",
      tags: ["Terraza 30 m²", "Garaje", "Piscina", "Orientación sur"]
    },
    {
      id: "EJ-104", title: "Piso reformado cerca del Metro", type: "Piso", op: "alquiler",
      zone: "Bellavista", price: 850, beds: 2, baths: 1, m2: 70, status: "disponible",
      art: "bloque", tone: 3,
      text: "Piso reformado y amueblado, a pocos minutos a pie de la parada de Metro. Ideal para pareja.",
      tags: ["Amueblado", "Reformado", "Metro cerca"]
    },
    {
      id: "EJ-105", title: "Local comercial a pie de calle", type: "Local", op: "alquiler",
      zone: "Bellavista", price: 690, beds: 0, baths: 1, m2: 64, status: "alquilado",
      art: "local", tone: 1,
      text: "Local diáfano con escaparate de 5 metros y salida de humos. Apto para varios usos.",
      tags: ["Escaparate", "Diáfano", "Salida de humos"]
    },
    {
      id: "EJ-106", title: "Chalet independiente con piscina", type: "Chalet", op: "venta",
      zone: "Dos Hermanas", price: 395000, beds: 5, baths: 3, m2: 210, status: "vendido",
      art: "chalet", tone: 2,
      text: "Chalet en parcela de 450 m² con piscina, porche y barbacoa. Garaje para dos coches.",
      tags: ["Piscina", "Parcela 450 m²", "Porche", "Garaje doble"]
    },
    {
      id: "EJ-107", title: "Piso de 4 dormitorios para familia", type: "Piso", op: "venta",
      zone: "Heliópolis", price: 212000, beds: 4, baths: 2, m2: 118, status: "disponible",
      art: "bloque", tone: 2,
      text: "Amplio piso en urbanización con zonas comunes y portero. Cuatro dormitorios y dos baños completos.",
      tags: ["Zonas comunes", "Portero", "Calefacción"]
    },
    {
      id: "EJ-108", title: "Estudio junto a la Avenida", type: "Piso", op: "alquiler",
      zone: "La Palmera", price: 620, beds: 1, baths: 1, m2: 42, status: "disponible",
      art: "atico", tone: 0,
      text: "Estudio con cocina americana y mucha luz. Gastos de comunidad incluidos.",
      tags: ["Comunidad incluida", "Luminoso", "Cocina americana"]
    }
  ],

  statusLabel: {
    disponible: "Disponible", reservado: "Reservado", vendido: "Vendido",
    alquilado: "Alquilado", borrador: "Borrador"
  }
};
