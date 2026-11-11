// Manifiesto de fotografías de la demo.
//
// Cada hueco tiene un archivo esperado en `public/assets/boutique-mgi/`.
// Si el archivo existe en el momento del build, se muestra la foto real.
// Si no existe, se muestra una composición editorial de sustitución.
// Para cambiar una foto: copiar el .webp con el nombre exacto y volver a
// hacer build. No hay que tocar código. Ver README_ASSETS.md.

export type Tone = "ink" | "clay" | "sand" | "stone";

export type PhotoSlot = {
  file: string;
  width: number;
  height: number;
  alt: string;
  // Composición de sustitución mientras no haya foto real.
  fallback: { tone: Tone; glyph: string; caption: string };
};

export const photos = {
  hero: {
    file: "hero-centro.webp",
    width: 1600,
    height: 2000,
    alt: "Interior de la Boutique de belleza MG&I en Sevilla",
    fallback: { tone: "ink", glyph: "&", caption: "MG&I · Sevilla" },
  },
  facial: {
    file: "tratamiento-facial.webp",
    width: 1600,
    height: 2000,
    alt: "Tratamiento facial en MG&I",
    fallback: { tone: "sand", glyph: "Piel", caption: "Tratamiento facial" },
  },
  profesional: {
    file: "profesional.webp",
    width: 1600,
    height: 2000,
    alt: "Profesional de MG&I en el centro",
    fallback: { tone: "clay", glyph: "M", caption: "El equipo" },
  },
  detalle01: {
    file: "detalle-01.webp",
    width: 1200,
    height: 1500,
    alt: "Detalle del trabajo con hilo en MG&I",
    fallback: { tone: "stone", glyph: "Hilo", caption: "Detalle" },
  },
  detalle02: {
    file: "detalle-02.webp",
    width: 1200,
    height: 1500,
    alt: "Detalle de un tratamiento facial en MG&I",
    fallback: { tone: "sand", glyph: "G", caption: "Detalle" },
  },
  instalaciones01: {
    file: "instalaciones-01.webp",
    width: 2000,
    height: 1500,
    alt: "Cabina de tratamientos de MG&I",
    fallback: { tone: "stone", glyph: "I", caption: "La cabina" },
  },
  resultado01: {
    file: "resultado-01.webp",
    width: 1600,
    height: 1600,
    alt: "Resultado real de un diseño de cejas con hilo en MG&I, publicado con consentimiento",
    fallback: { tone: "clay", glyph: "Tu mirada", caption: "Resultados reales" },
  },
} satisfies Record<string, PhotoSlot>;

export type PhotoKey = keyof typeof photos;
