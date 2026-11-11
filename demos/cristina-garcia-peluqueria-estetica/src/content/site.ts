// Datos del centro. Todo lo que aparece aquí procede de su agenda pública
// en Booksy y de su ficha de empresa; precios y duraciones tal y como los
// publica el propio centro.

export const business = {
  name: "Cristina García",
  fullName: "Cristina García Peluquería & Estética",
  tagline: "Peluquería & Estética",
  town: "Bollullos de la Mitación",
  address: {
    street: "Avenida del Aljarafe, 1",
    city: "41110 Bollullos de la Mitación, Sevilla",
  },
  phone: { display: "954 49 15 88", href: "tel:+34954491588" },
  booking:
    "https://booksy.com/es-es/124211_cristina-garcia-peluqueria-estetica_peluqueria_29850_bollullos-de-la-mitacion",
  maps:
    "https://www.google.com/maps/search/?api=1&query=Cristina+Garc%C3%ADa+Peluquer%C3%ADa+%26+Est%C3%A9tica%2C+Avenida+del+Aljarafe+1%2C+Bollullos+de+la+Mitaci%C3%B3n",
  instagram: { handle: "@cristinagpeluqueriaestetica", href: "https://www.instagram.com/cristinagpeluqueriaestetica/" },
  facebook: "https://www.facebook.com/Cristinagpeluqueriaestetica",
  experience: "Más de 18 años de experiencia",
} as const;

export const rating = {
  score: "4,9",
  total: 378,
  source: "Booksy",
  // Reparto de estrellas publicado en Booksy (5 → 1).
  stars: [367, 7, 1, 1, 2] as const,
};

/** Frases breves, literales, de reseñas verificadas en Booksy. */
export const quotes = [
  { text: "Atención de calidad y trato inmejorable.", author: "Artacho", service: "Corte y marcar largo" },
  {
    text: "Son todas profesionales y muy agradables.",
    author: "Mercedes",
    service: "Corte caballero",
  },
] as const;

export const team = [
  { name: "Cristina García", role: "Al frente del centro" },
  { name: "Mercedes" },
  { name: "Jennifer" },
  { name: "María José" },
  { name: "Arantxa" },
] as const;

// Domingo = 0. Minutos desde medianoche.
type Slot = readonly [number, number];
export const hours: Record<number, { day: string; slots: readonly Slot[] }> = {
  0: { day: "Domingo", slots: [] },
  1: { day: "Lunes", slots: [] },
  2: { day: "Martes", slots: [[600, 840], [900, 1140]] },
  3: { day: "Miércoles", slots: [[600, 840], [900, 1140]] },
  4: { day: "Jueves", slots: [[600, 840], [900, 1140]] },
  5: { day: "Viernes", slots: [[600, 840], [900, 1140]] },
  6: { day: "Sábado", slots: [[540, 780]] },
};

export const amenities = [
  "Aparcamiento",
  "Acceso para movilidad reducida",
  "Pago con tarjeta",
  "Wi-Fi",
  "Adaptado para peques",
  "Programa de fidelidad",
] as const;

/** Lo más reservado según la propia agenda del centro. */
export const popular = [
  { name: "Corte mujer", price: "11,50 €" },
  { name: "Cejas señora", price: "5 €" },
  { name: "Cejas y labio", price: "8 €" },
] as const;

export type Service = { name: string; price: string; time?: string; note?: string };
export type Group = { title: string; note?: string; items: readonly Service[] };
export type Area = {
  id: "cabello" | "color" | "eventos" | "mirada" | "manos" | "facial" | "cuerpo" | "depilacion";
  label: string;
  lead: string;
  signature: { name: string; price: string };
  groups: readonly Group[];
};

export const areas: readonly Area[] = [
  {
    id: "cabello",
    label: "Corte y peinado",
    lead: "Cortes para toda la familia, marcados por largo de melena y rituales para el cuero cabelludo.",
    signature: { name: "Corte mujer", price: "11,50 €" },
    groups: [
      {
        title: "Corte",
        items: [
          { name: "Corte mujer", price: "11,50 €", time: "25 min" },
          { name: "Corte caballero", price: "11,50 €", time: "25 min" },
          { name: "Corte y marcar, cabello corto", price: "19 €", time: "40 min" },
          { name: "Corte y marcar, cabello medio", price: "20 €", time: "1 h" },
          { name: "Corte y marcar, cabello largo", price: "22 €", time: "1 h" },
          { name: "Corte y marcar, extra largo", price: "25 €", time: "1 h 30 min" },
          { name: "Corte niña o niño, 0 a 5 años", price: "8 €", time: "20 min" },
          { name: "Corte niña o niño, 6 a 9 años", price: "9 €", time: "20 min" },
          { name: "Corte de flequillo", price: "4,50 €", time: "10 min" },
        ],
      },
      {
        title: "Peinado",
        items: [
          { name: "Marcar cabello corto", price: "11,50 €", time: "30 min" },
          { name: "Marcar cabello medio", price: "12 €", time: "40 min" },
          { name: "Marcar cabello largo", price: "12,50 €", time: "1 h" },
          { name: "Marcar cabello extra extra largo", price: "19 €", time: "1 h 30 min" },
          { name: "Marcar con difusor", price: "6 €", time: "30 min" },
        ],
      },
      {
        title: "Tratamiento capilar",
        items: [
          { name: "Decode Zero o HOP con vapor y peinado", price: "50 €", time: "1 h 30 min" },
          { name: "Reset Calm Ritual, cuero cabelludo con caspa", price: "15 €", time: "30 min" },
          { name: "Reset Calm Ritual, cuero cabelludo sensible", price: "15 €", time: "30 min" },
          { name: "Reset Detox Ritual, cuero cabelludo graso", price: "15 €", time: "30 min" },
          { name: "Champú, mascarilla y acondicionador", price: "7 €", time: "15 min" },
        ],
      },
      {
        title: "Extensiones de cabello natural",
        items: [
          { name: "Colocar extensiones adhesivas", price: "100 €", time: "Más de 1 h" },
          { name: "Retirar extensiones adhesivas", price: "50 €", time: "Más de 1 h" },
        ],
      },
    ],
  },
  {
    id: "color",
    label: "Color y mechas",
    lead: "Tinte con o sin amoniaco, mechas clásicas y balayage, con matiz Eclat o sin matizar. El precio va por largo de melena.",
    signature: { name: "Balayage con matiz, cabello medio", price: "60 €" },
    groups: [
      {
        title: "Mechas y balayage",
        items: [
          { name: "Balayage con matiz Eclat, cabello medio", price: "60 €", time: "2 h" },
          { name: "Balayage con matiz Eclat, cabello largo", price: "66 €", time: "2 h 30 min" },
          { name: "Balayage con matiz Eclat, extra largo", price: "75 €", time: "2 h 30 min" },
          { name: "Balayage sin matizar, cabello largo", price: "56 €", time: "2 h" },
          { name: "Mechas clásicas con matiz Eclat, cabello medio", price: "55 €", time: "2 h" },
          { name: "Mechas clásicas con matiz Eclat, cabello largo", price: "60 €", time: "2 h 30 min" },
          { name: "Mechas clásicas con matiz Eclat, extra largo", price: "65 €", time: "2 h" },
          { name: "Mechas clásicas sin matizar, cabello medio", price: "46 €", time: "1 h" },
        ],
      },
      {
        title: "Color",
        items: [
          { name: "Color raíz con 30 % de amoniaco", price: "15,50 €", time: "1 h" },
          { name: "Color raíz sin amoniaco", price: "20 €", time: "1 h" },
          { name: "Color media melena con 30 % de amoniaco", price: "19 €", time: "1 h" },
          { name: "Color media melena sin amoniaco", price: "26 €", time: "1 h" },
          { name: "Color cabello largo con 30 % de amoniaco", price: "22 €", time: "1 h" },
          { name: "Color cabello largo sin amoniaco", price: "28 €", time: "1 h" },
          { name: "Color extra largo sin amoniaco", price: "30 €", time: "1 h" },
          { name: "Color extra extra largo sin amoniaco", price: "32 €", time: "1 h" },
        ],
      },
    ],
  },
  {
    id: "eventos",
    label: "Novias y eventos",
    lead: "Peinado y maquillaje para novias, madrinas e invitadas, con prueba previa. Las invitadas pueden elegir centro o domicilio.",
    signature: { name: "Novia, peinado y maquillaje con pruebas", price: "300 €" },
    groups: [
      {
        title: "Novias y madrinas",
        items: [
          { name: "Novia: peinado, maquillaje y pruebas", price: "300 €", time: "4 h" },
          { name: "Peinado de novia con prueba", price: "170 €", time: "2 h" },
          { name: "Maquillaje de novia con prueba", price: "170 €", time: "2 h" },
          { name: "Madrina con mantilla y prueba", price: "150 €", time: "3 h" },
          { name: "Peinado de madrina con prueba", price: "100 €", time: "1 h" },
        ],
      },
      {
        title: "Invitadas",
        items: [
          { name: "Maquillaje de invitada en el centro", price: "37 €", time: "1 h" },
          { name: "Maquillaje de invitada a domicilio", price: "50 €", time: "1 h 30 min" },
          { name: "Peinado de invitada a domicilio", price: "50 €", time: "1 h 30 min" },
        ],
      },
    ],
  },
  {
    id: "mirada",
    label: "Cejas y pestañas",
    lead: "Diseño y color de cejas, laminado, lifting y mantenimiento de extensiones de pestañas.",
    signature: { name: "Laminado de cejas y lifting de pestañas", price: "50 €" },
    groups: [
      {
        title: "Cejas y pestañas",
        items: [
          { name: "Cejas señora", price: "5 €", time: "20 min" },
          { name: "Cejas y labio", price: "8 €", time: "30 min" },
          { name: "Color en cejas", price: "3 €", time: "15 min" },
          { name: "Laminado de cejas", price: "26,50 €", time: "30 min" },
          { name: "Laminado de cejas y lifting de pestañas", price: "50 €", time: "1 h" },
          { name: "Relleno de extensiones de pestañas", price: "40 €", time: "1 h 30 min" },
          { name: "Retirada de extensiones de pestañas", price: "20 €", time: "45 min" },
        ],
      },
    ],
  },
  {
    id: "manos",
    label: "Manos y pies",
    lead: "Manicura tradicional, esmaltado permanente y uñas acrílicas, con color liso, francesa o decoración.",
    signature: { name: "Esmaltado permanente", price: "14 €" },
    groups: [
      {
        title: "Manos y pies",
        items: [
          { name: "Limar y esmaltar", price: "5,50 €", time: "20 min" },
          { name: "Manicura tradicional", price: "8,50 €", time: "30 min" },
          { name: "Esmaltado permanente", price: "14 €", time: "40 min" },
          { name: "Retirada de permanente", price: "8 €", time: "40 min" },
          { name: "Relleno acrílico", price: "Desde 23,50 €", time: "1 h 15 min" },
        ],
      },
    ],
  },
  {
    id: "facial",
    label: "Tratamientos faciales",
    lead: "Higiene facial, tratamiento ARÛDE y Dermapen, en sesión suelta o en bono. Es la carta más amplia del centro.",
    signature: { name: "Tratamiento facial ARÛDE", price: "65 €" },
    groups: [
      {
        title: "Faciales destacados",
        items: [
          { name: "Tratamiento facial ARÛDE", price: "65 €", time: "1 h" },
          { name: "ARÛDE, bono de 6 sesiones", price: "330 €", time: "1 h por sesión" },
          { name: "Tratamiento facial Dermapen", price: "60 €", time: "1 h" },
          { name: "Dermapen, bono de 5 sesiones", price: "250 €", time: "1 h por sesión" },
          { name: "Higiene facial con extracción y pack Montibello", price: "60 €", time: "1 h 30 min" },
        ],
        note: "El resto de tratamientos faciales está en la agenda online.",
      },
    ],
  },
  {
    id: "cuerpo",
    label: "Corporal y bronceado",
    lead: "Tratamientos corporales Montibello y quemagrasa, peeling y rayos UVA.",
    signature: { name: "Piel de seda, piernas", price: "40 €" },
    groups: [
      {
        title: "Tratamientos corporales",
        items: [
          { name: "Piel de seda, piernas", price: "40 €", time: "1 h" },
          { name: "Quemagrasa Montibello Body Treat", price: "63 €", time: "1 h 15 min" },
          { name: "Peeling corporal", price: "65 €", time: "1 h 30 min" },
          { name: "Fast Burner, 1 sesión", price: "65 €", time: "1 h 30 min" },
          { name: "Fat Burner, 6 sesiones", price: "378 €", time: "1 h 30 min por sesión" },
        ],
      },
      {
        title: "Rayos UVA",
        note: "Sin cita, por orden de llegada.",
        items: [
          { name: "Sesión suelta", price: "7 €", time: "5 min" },
          { name: "Bono de 10 sesiones", price: "55 €", time: "5 min por sesión" },
        ],
      },
    ],
  },
  {
    id: "depilacion",
    label: "Depilación láser y cera",
    lead: "Láser por tamaño de zona, a precio cerrado, y cera fría o caliente para mujer y hombre.",
    signature: { name: "Láser, zona pequeña", price: "10 €" },
    groups: [
      {
        title: "Depilación láser",
        items: [
          { name: "Zona pequeña", note: "Labio, entrecejo, mentón, manos o pies", price: "10 €", time: "15 min" },
          {
            name: "Zona media",
            note: "Brazos completos, lumbar, medias piernas, muslos o glúteos",
            price: "25 €",
            time: "30 min",
          },
          {
            name: "Zona grande",
            note: "Piernas completas, espalda, pecho con abdomen u hombros, o ingles con axilas y una zona pequeña",
            price: "50 €",
            time: "30 min",
          },
        ],
      },
      {
        title: "Cera",
        items: [
          { name: "Ingles brasileñas", price: "9,50 €", time: "20 min" },
          { name: "Ingles completas y perianal", price: "18 €", time: "30 min" },
          { name: "Cejas caballero", price: "6 €", time: "20 min" },
          { name: "Brazos enteros caballero", price: "12 €", time: "30 min" },
        ],
        note: "Más zonas de cera disponibles en la agenda online.",
      },
    ],
  },
];

/**
 * Fotografías propias del centro. Vacío hasta contar con fotos autorizadas:
 * la web está diseñada para funcionar sin ellas. Cada clave sustituye el
 * fondo tipográfico de su bloque por la imagen.
 */
export const photos: Partial<Record<"salon" | Area["id"], { src: string; alt: string }>> = {};
