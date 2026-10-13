import type { Photo } from "@/components/PhotoSlot";
import { assetBase } from "./site";

// Fotografías reales del centro. Cuando el negocio las facilite, basta con
// guardar el archivo en public/assets/esperanza-ruiz-logopedia/ y rellenar la
// entrada correspondiente (ver README_ASSETS.md). Mientras sean `null`, la web
// muestra composiciones de identidad diseñadas para ese hueco.
export const photos: Record<"retrato" | "consulta" | "sesion" | "materiales", Photo> = {
  retrato: null, // `${assetBase}/esperanza-retrato.webp` · 1200×1500
  consulta: null, // `${assetBase}/consulta-principal.webp` · 1600×1200
  sesion: null, // `${assetBase}/sesion-logopedia.webp` · 1600×1200
  materiales: null, // `${assetBase}/detalle-materiales.webp` · 1200×1200
};

export const photoBase = assetBase;
