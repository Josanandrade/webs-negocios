// Contenido público de la demo. Solo datos contrastados con canales del estudio
// o de sus artistas. Cualquier dato nuevo debe validarse antes de añadirse aquí.

export type StyleId = "neotradicional" | "tradicional" | "fine-line" | "realismo";

export interface Style {
  id: StyleId;
  name: string;
  glyph: string;
  /** Descripción general del estilo, no de un artista concreto. */
  summary: string;
  /** Artista del equipo confirmado para este estilo, si lo hay. */
  artistId?: string;
}

export interface Artist {
  id: string;
  name: string;
  alias: string;
  role: string;
  styles: StyleId[];
  bio: string;
  instagram: { handle: string; url: string };
}

export interface Work {
  id: string;
  style: StyleId;
  artistId?: string;
  /** Ruta en /assets/factoria-tattoo/ cuando el estudio entregue la foto. */
  src?: string;
  alt: string;
  /** Proporción de la pieza en la rejilla. */
  shape: "tall" | "wide" | "square";
}

export const studio = {
  name: "Factoría Tattoo",
  city: "Sevilla",
  phone: { label: "604 90 20 57", href: "tel:+34604902057" },
  instagram: { handle: "@factoriatattoo_", url: "https://www.instagram.com/factoriatattoo_/" },
  links: { label: "Todos los enlaces", url: "https://linktr.ee/factoriatattoo_" },
  // WhatsApp sin confirmar como canal propio: se activa cuando el estudio lo valide.
  whatsapp: null as string | null,
  locations: [
    {
      id: "andalucia",
      street: "Av. de Andalucía, 10",
      postal: "41005 Sevilla",
      maps: "https://www.google.com/maps/search/?api=1&query=Factor%C3%ADa%20Tattoo%2C%20Av.%20de%20Andaluc%C3%ADa%2010%2C%2041005%20Sevilla",
    },
    {
      id: "balbino",
      street: "C/ Balbino Marrón, 3",
      postal: "41018 Sevilla",
      maps: "https://www.google.com/maps/search/?api=1&query=Calle%20Balbino%20Marr%C3%B3n%203%2C%2041018%20Sevilla",
    },
  ],
};

export const artists: Artist[] = [
  {
    id: "sebas",
    name: "Sebas Pérez",
    alias: "Inkieto",
    role: "Tatuador y copropietario",
    styles: ["neotradicional"],
    bio: "Tatuador especializado en neotradicional y uno de los dueños del estudio. Su trabajo más reciente lo publica en su Instagram.",
    instagram: { handle: "@inkieto_tattoo", url: "https://www.instagram.com/inkieto_tattoo/" },
  },
];

export const styles: Style[] = [
  {
    id: "neotradicional",
    name: "Neotradicional",
    glyph: "Nt",
    summary: "La base tradicional con más detalle, volumen y una paleta más amplia.",
    artistId: "sebas",
  },
  {
    id: "tradicional",
    name: "Tradicional",
    glyph: "Tr",
    summary: "Contorno grueso, color plano y diseños que se leen a distancia.",
  },
  {
    id: "fine-line",
    name: "Fine line",
    glyph: "Fl",
    summary: "Trazo fino y preciso para piezas delicadas, lettering y detalle pequeño.",
  },
  {
    id: "realismo",
    name: "Realismo",
    glyph: "Re",
    summary: "Luces, sombras y texturas trabajadas para que la pieza parezca una imagen.",
  },
];

export const works: Work[] = [
  { id: "w1", style: "neotradicional", artistId: "sebas", alt: "Pieza neotradicional de Inkieto", shape: "tall" },
  { id: "w2", style: "fine-line", alt: "Pieza de fine line", shape: "square" },
  { id: "w3", style: "realismo", alt: "Pieza de realismo", shape: "square" },
  { id: "w4", style: "tradicional", alt: "Pieza tradicional", shape: "tall" },
  { id: "w5", style: "neotradicional", artistId: "sebas", alt: "Pieza neotradicional de Inkieto", shape: "square" },
  { id: "w6", style: "fine-line", alt: "Pieza de fine line", shape: "square" },
  { id: "w7", style: "tradicional", alt: "Pieza tradicional", shape: "wide" },
  { id: "w8", style: "realismo", alt: "Pieza de realismo", shape: "square" },
  { id: "w9", style: "neotradicional", artistId: "sebas", alt: "Pieza neotradicional de Inkieto", shape: "square" },
  { id: "w10", style: "fine-line", alt: "Pieza de fine line", shape: "square" },
  { id: "w11", style: "realismo", alt: "Pieza de realismo", shape: "square" },
  { id: "w12", style: "tradicional", alt: "Pieza tradicional", shape: "wide" },
];

export const styleById = (id: StyleId): Style => {
  const style = styles.find((s) => s.id === id);
  if (!style) throw new Error(`Estilo desconocido: ${id}`);
  return style;
};

export const artistById = (id: string | undefined): Artist | undefined =>
  artists.find((a) => a.id === id);
