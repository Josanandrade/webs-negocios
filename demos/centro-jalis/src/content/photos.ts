// Huecos de fotografía. `src: null` = se muestra una composición de identidad.
// Para usar una foto real: copiar el archivo a public/assets/centro-jalis/ con
// el nombre indicado y cambiar `src` a "/assets/centro-jalis/<archivo>".
// Ver public/assets/centro-jalis/README_ASSETS.md.

export type PhotoSlot = {
  src: string | null;
  alt: string;
  /** Qué foto falta, visible en la composición mientras no exista. */
  brief: string;
  width: number;
  height: number;
};

export const photos = {
  hero: {
    src: null,
    alt: "Cabina de tratamientos de Jalis, en Castilleja de la Cuesta",
    brief: "Cabina principal",
    width: 1600,
    height: 2000,
  },
  facial: {
    src: null,
    alt: "Profesional de Jalis realizando un tratamiento facial",
    brief: "Tratamiento facial",
    width: 1600,
    height: 2000,
  },
  centro: {
    src: null,
    alt: "Recepción y zona de espera del centro",
    brief: "Recepción del centro",
    width: 2000,
    height: 1500,
  },
  equipo: {
    src: null,
    alt: "Equipo de profesionales de Jalis",
    brief: "Retrato del equipo",
    width: 1600,
    height: 2000,
  },
  fachada: {
    src: null,
    alt: "Fachada de Jalis en la calle Zambra",
    brief: "Fachada · calle Zambra",
    width: 2000,
    height: 1500,
  },
} satisfies Record<string, PhotoSlot>;

export type PhotoKey = keyof typeof photos;
