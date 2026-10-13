/*
  Contenido de la demo. Solo datos encontrados en fuentes públicas del negocio
  (Booksy, Instagram, Facebook, TikTok). Lo que no se ha podido verificar no
  aparece: ni dirección exacta, ni precios, ni nombres del equipo.
  Detalle de fuentes y descartes: docs/INTERNAL_AUDIT.md (no se publica).
*/

export const site = {
  name: "El Caniche Rosa",
  tagline: "Peluquería y estética canina",
  town: "Tomares, Sevilla",
  phone: {
    display: "611 50 05 43",
    href: "tel:+34611500543",
  },
  // Sin confirmar que el número atienda WhatsApp: desactivado.
  whatsappEnabled: false,
  whatsappHref: "https://wa.me/34611500543",
  booksy:
    "https://booksy.com/es-es/106635_el-caniche-rosa_servicios-para-mascotas_29919_tomares",
  maps: "https://www.google.com/maps/search/?api=1&query=El+Caniche+Rosa+peluquer%C3%ADa+canina+Tomares",
  rating: { score: "5,0", count: "más de 200 opiniones", source: "Booksy" },
  social: [
    { label: "Instagram", handle: "@elcanicherosa.tomares", href: "https://www.instagram.com/elcanicherosa.tomares/" },
    { label: "TikTok", handle: "@elcanicherosa", href: "https://www.tiktok.com/@elcanicherosa" },
    { label: "Facebook", handle: "El caniche rosa", href: "https://www.facebook.com/elcanicherosa.pelucanina/" },
  ],
  // Patrón coincidente en Booksy y en un directorio; horas exactas, en Booksy.
  hours: [
    { days: "Lunes, miércoles y viernes", when: "Mañanas" },
    { days: "Martes y jueves", when: "Tardes" },
    { days: "Sábado y domingo", when: "Cerrado" },
  ],
} as const;

export type ServiceId = "corte" | "arreglo" | "deslanado" | "unas";

export type Service = {
  id: ServiceId;
  name: string;
  short: string;
  body: string;
  forWho: string;
};

// Servicios tal como aparecen en su agenda de Booksy.
export const services: Service[] = [
  {
    id: "corte",
    name: "Baño y corte",
    short: "El cambio de look completo.",
    body: "Baño, secado y cepillado, y después corte a máquina o a tijera según el estilo que quieras y lo que pida su pelo.",
    forWho: "Caniches, bichones, yorkshires, malteses, schnauzers… perros con pelo que no para de crecer.",
  },
  {
    id: "arreglo",
    name: "Baño y arreglo",
    short: "Mantenimiento entre corte y corte.",
    body: "Baño completo y arreglo higiénico: ojos, almohadillas y zona sanitaria repasados para que esté cómodo hasta el próximo corte.",
    forWho: "Perros a los que no les toca corte todavía, pero ya lo están pidiendo.",
  },
  {
    id: "deslanado",
    name: "Baño y deslanado",
    short: "Fuera el pelo muerto, sin tocar su manto.",
    body: "Baño y retirada del subpelo que suelta en la muda. Respira mejor la piel, pasa mejor el calor y deja menos pelo por casa.",
    forWho: "Golden, labradores, pastores, nórdicos… perros de doble capa que no se cortan.",
  },
  {
    id: "unas",
    name: "Corte de uñas",
    short: "Un momento, y como nuevo.",
    body: "Uñas a su largo para que camine bien y no se le enganchen. Un servicio corto, también para perros nerviosos.",
    forWho: "Cualquier perro, entre visita y visita.",
  },
];

// Lo que incluyen los paquetes de baño según su agenda online.
export const included = [
  "Baño completo",
  "Secado y cepillado a fondo",
  "Vaciado de muda",
  "Corte de uñas",
  "Limpieza de oídos",
  "Rasurado de la zona sanitaria",
];

export type CoatId = "crece" | "muda" | "mantener" | "unas";

export const coats: { id: CoatId; label: string; hint: string; service: ServiceId; note: string }[] = [
  {
    id: "crece",
    label: "Su pelo crece y crece",
    hint: "caniche, bichón, yorkshire",
    service: "corte",
    note: "Este tipo de pelo no se cae solo: necesita corte para no enredarse. Como orientación, cada 6 a 8 semanas.",
  },
  {
    id: "muda",
    label: "Suelta pelo por todas partes",
    hint: "golden, labrador, pastor",
    service: "deslanado",
    note: "Su manto no se corta, se cuida. El deslanado saca el subpelo muerto, sobre todo en primavera y otoño.",
  },
  {
    id: "mantener",
    label: "Le cortamos hace poco",
    hint: "solo necesita un repaso",
    service: "arreglo",
    note: "Un baño y un arreglo higiénico alargan el corte y le mantienen cómodo hasta la siguiente visita.",
  },
  {
    id: "unas",
    label: "Solo le suenan las uñas",
    hint: "clac, clac, por el pasillo",
    service: "unas",
    note: "Si las oyes en el suelo, toca cortarlas. Es rápido y lo puedes reservar suelto.",
  },
];

export const promises = [
  {
    title: "A su ritmo",
    body: "Cada perro llega con su carácter. Primero confianza, luego tijeras. Si necesita una pausa, la tiene.",
  },
  {
    title: "Su pelo manda",
    body: "Tiempo y precio dependen del tamaño y del estado del manto. Si hay muchos nudos, lo sabrás antes de empezar.",
  },
  {
    title: "Higiene de verdad",
    body: "Oídos, uñas y zona sanitaria van incluidos en los baños. Lo que no se ve también cuenta.",
  },
];

export const faqs = [
  {
    q: "¿Cómo pido cita?",
    a: "Lo más rápido es Booksy: ves los huecos libres, eliges servicio y te llega la confirmación al móvil. Si lo prefieres, llama al 611 50 05 43.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "Depende del tamaño de tu perro, del servicio y del estado del pelo. En Booksy tienes el precio orientativo de cada servicio; si hay nudos de más, se habla contigo antes.",
  },
  {
    q: "¿Qué incluye el baño?",
    a: "Los paquetes de baño incluyen secado, cepillado, vaciado de muda, corte de uñas, limpieza de oídos y rasurado de la zona sanitaria.",
  },
  {
    q: "Mi perro está muy enredado, ¿qué hago?",
    a: "Tráelo igualmente. Se valora el manto al llegar y se elige lo más cómodo para él; a veces un corte más corto es la opción más amable.",
  },
  {
    q: "¿Cada cuánto debería venir?",
    a: "Como orientación: perros de pelo que crece, cada 6 a 8 semanas; perros de doble capa, en cada muda; uñas, cuando se oigan al andar.",
  },
];
