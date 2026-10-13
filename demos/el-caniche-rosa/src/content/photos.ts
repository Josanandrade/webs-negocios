/*
  Huecos de foto. Ahora mismo ninguno tiene foto real: no se ha podido
  descargar ni verificar material propio del negocio. Cada hueco muestra una
  composición gráfica de la marca. Al llegar las fotos, se dejan en
  public/assets/el-caniche-rosa/ y se rellena `src` (ver README_ASSETS.md).
*/
export type PhotoSlot = {
  src: string | null;
  alt: string;
  // Recorte del caniche que se ve mientras no hay foto.
  crop: "whole" | "head" | "tail";
  tone: "pink" | "ink" | "mist";
};

export const photos = {
  hero: { src: null, alt: "Caniche recién arreglado en El Caniche Rosa", crop: "whole", tone: "ink" },
  look1: { src: null, alt: "Corte terminado de un perro de pelo rizado", crop: "head", tone: "pink" },
  look2: { src: null, alt: "Perro de doble capa después del deslanado", crop: "tail", tone: "mist" },
  look3: { src: null, alt: "Perro pequeño recién bañado y peinado", crop: "whole", tone: "ink" },
} satisfies Record<string, PhotoSlot>;
