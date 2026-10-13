// Huecos de fotografía de la demo. Si el archivo existe en
// public/assets/helena-garcia-beauty-salon/ se muestra la foto real; si no,
// una composición de marca con la misma proporción (sin saltos de layout).
// Ver public/assets/helena-garcia-beauty-salon/README_ASSETS.md

export type Tone = "cherry" | "lilac" | "butter" | "blush" | "ink";

type Slot = {
  file: string;
  width: number;
  height: number;
  alt: string;
  tone: Tone;
  label: string; // qué foto real va aquí (visible en la demo)
};

export const photos = {
  hero: {
    file: "hero-manos.jpg",
    width: 1080,
    height: 1350,
    alt: "Manicura rusa recién terminada en Helena García Beauty Salon",
    tone: "cherry",
    label: "Manos con manicura terminada, luz natural",
  },
  helena: {
    file: "helena.jpg",
    width: 1080,
    height: 1350,
    alt: "Helena García trabajando en su mesa de manicura",
    tone: "lilac",
    label: "Helena trabajando, retrato vertical",
  },
  feed1: {
    file: "feed-rusa.jpg",
    width: 1080,
    height: 1920,
    alt: "Detalle de manicura rusa con semipermanente",
    tone: "cherry",
    label: "Manicura rusa · detalle de cutícula",
  },
  feed2: {
    file: "feed-salon.jpg",
    width: 1080,
    height: 1920,
    alt: "Interior del salón en el Edificio Cerro Colarte",
    tone: "butter",
    label: "El salón por dentro",
  },
  feed3: {
    file: "feed-lifting.jpg",
    width: 1080,
    height: 1920,
    alt: "Resultado de un lifting de pestañas",
    tone: "blush",
    label: "Lifting de pestañas · antes y después",
  },
  feed4: {
    file: "feed-pedicura.jpg",
    width: 1080,
    height: 1920,
    alt: "Pedicura terminada con semipermanente",
    tone: "lilac",
    label: "Pedicura terminada",
  },
  feed5: {
    file: "feed-colores.jpg",
    width: 1080,
    height: 1920,
    alt: "Carta de colores de semipermanente del salón",
    tone: "ink",
    label: "Carta de colores",
  },
} satisfies Record<string, Slot>;

export type PhotoKey = keyof typeof photos;
