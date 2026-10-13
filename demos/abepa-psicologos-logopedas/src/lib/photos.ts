// Huecos de fotografía. `null` = composición gráfica de la identidad.
// Para usar una foto real: dejar el archivo en
// public/assets/abepa-psicologos-logopedas/ y rellenar la entrada, p. ej.
//   centro: { src: "/assets/abepa-psicologos-logopedas/centro-sala.webp", alt: "Sala de logopedia del centro", width: 1600, height: 1200 }
// Ver public/assets/abepa-psicologos-logopedas/README_ASSETS.md.

export type Photo = { src: string; alt: string; width: number; height: number } | null;

export const photos: Record<"centro" | "sala", Photo> = {
  centro: null,
  sala: null,
};

// Retratos del equipo por nombre (mismo formato). Sin foto se muestran iniciales.
export const portraits: Record<string, Photo> = {};
