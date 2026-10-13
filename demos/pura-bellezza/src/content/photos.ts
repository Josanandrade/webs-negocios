import type { PhotoKey } from "./site";

/*
  Registro de fotografías de la demo.

  No hemos usado ninguna foto: no hay material propio del centro que podamos
  descargar y verificar, y no queremos stock que se haga pasar por suyo.
  Cada hueco muestra una composición gráfica de la marca hasta que llegue la
  foto real.

  Para sustituir una: deja el archivo en public/assets/pura-bellezza/ y
  rellena `src` (y revisa `alt`). Ver README_ASSETS.md.
*/

export type Photo = {
  src?: string;
  alt: string;
  /** Composición de reserva mientras no hay foto. */
  motif: "glow" | "ripple" | "lash" | "almond" | "wave" | "door";
};

export const photos: Record<PhotoKey, Photo> = {
  hero: {
    alt: "Cabina de tratamiento de Pura Bellezza con luz natural",
    motif: "glow",
  },
  facial: {
    alt: "Higiene facial en cabina",
    motif: "ripple",
  },
  lashes: {
    alt: "Detalle de extensiones de pestañas pelo a pelo",
    motif: "lash",
  },
  nails: {
    alt: "Manicura semipermanente en tono nude",
    motif: "almond",
  },
  body: {
    alt: "Tratamiento corporal de radiofrecuencia",
    motif: "wave",
  },
  space: {
    alt: "Fachada del centro en la avenida de la Constitución",
    motif: "door",
  },
};
