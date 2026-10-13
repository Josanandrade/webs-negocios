// Huecos de fotografía. Si el archivo existe en
// public/assets/clinica-veterinaria-camas/ se muestra la foto real; si no, una
// composición de color con la misma proporción (sin saltos de layout).
// Qué foto va en cada hueco: docs/README_ASSETS.md (interno, no se publica).

export type Tone = "cobalt" | "sky" | "sun" | "ink";

type Slot = {
  file: string;
  width: number;
  height: number;
  alt: string;
  tone: Tone;
  caption?: string;
};

export const photos = {
  hero: {
    file: "hero-paciente.jpg",
    width: 1200,
    height: 1500,
    alt: "Un perro en la camilla de la consulta, tranquilo junto a la veterinaria",
    tone: "cobalt",
  },
  consulta: {
    file: "consulta.jpg",
    width: 1200,
    height: 1200,
    alt: "Exploración de un gato en la consulta de la clínica",
    tone: "sky",
    caption: "En consulta",
  },
  equipo: {
    file: "equipo.jpg",
    width: 1500,
    height: 1000,
    alt: "El equipo de Clínica Veterinaria Camas en la clínica",
    tone: "sun",
    caption: "El equipo",
  },
  peluqueria: {
    file: "peluqueria.jpg",
    width: 1200,
    height: 1200,
    alt: "Un perro recién arreglado en la peluquería de la clínica",
    tone: "sun",
    caption: "Peluquería",
  },
  fachada: {
    file: "fachada.jpg",
    width: 1500,
    height: 1125,
    alt: "Fachada de Clínica Veterinaria Camas en la calle Santa Paula, 6",
    tone: "ink",
    caption: "Calle Santa Paula, 6",
  },
} satisfies Record<string, Slot>;

export type PhotoKey = keyof typeof photos;
