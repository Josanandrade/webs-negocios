/**
 * Registro de fotografías. Hoy todas están vacías (null): no se han podido
 * obtener fotos propias del negocio con calidad suficiente, y no se usan
 * fotos de stock ni de otras clínicas.
 *
 * Para activar una foto: copiarla a public/assets/fisioterapia-hispalis/ con el
 * nombre indicado y sustituir `null` por la ruta. El diseño ya está preparado
 * (ver public/assets/fisioterapia-hispalis/README_ASSETS.md).
 */
const dir = "/assets/fisioterapia-hispalis";

type Photo = { src: string | null; alt: string; file: string };

export const photos: Record<"hero" | "portrait" | "clinic" | "facade", Photo> = {
  hero: {
    src: null,
    file: `${dir}/hero-clinica.webp`,
    alt: "Angélica Argüello tratando a un paciente en la clínica Fisioterapia Híspalis",
  },
  portrait: {
    src: null,
    file: `${dir}/angelica-retrato.webp`,
    alt: "Retrato de Angélica Argüello, fisioterapeuta de Fisioterapia Híspalis",
  },
  clinic: {
    src: null,
    file: `${dir}/consulta-01.webp`,
    alt: "Sala de tratamiento de Fisioterapia Híspalis",
  },
  facade: {
    src: null,
    file: `${dir}/fachada.webp`,
    alt: "Entrada de Fisioterapia Híspalis en la calle Betis, Dos Hermanas",
  },
};
