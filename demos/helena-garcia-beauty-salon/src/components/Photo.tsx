import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { photos, type PhotoKey } from "@/content/photos";

const ASSET_DIR = "assets/helena-garcia-beauty-salon";

function hasAsset(file: string) {
  return existsSync(path.join(process.cwd(), "public", ASSET_DIR, file));
}

type Props = {
  slot: PhotoKey;
  sizes: string;
  className?: string;
  eager?: boolean;
};

// Foto real si existe; si no, una composición de marca con la misma proporción
// y una etiqueta que dice qué foto va ahí (para enseñarla al salón).
export function Photo({ slot, sizes, className = "", eager }: Props) {
  const p = photos[slot];
  const ratio = `${p.width} / ${p.height}`;

  if (hasAsset(p.file)) {
    return (
      <figure className={`photo ${className}`} style={{ aspectRatio: ratio }}>
        <Image
          src={`/${ASSET_DIR}/${p.file}`}
          alt={p.alt}
          width={p.width}
          height={p.height}
          sizes={sizes}
          quality={85}
          {...(eager ? { loading: "eager", fetchPriority: "high" } : {})}
        />
      </figure>
    );
  }

  return (
    <figure className={`photo photo--slot tone-${p.tone} ${className}`} style={{ aspectRatio: ratio }}>
      <span className="photo__nail" aria-hidden="true" />
      <span className="photo__nail photo__nail--2" aria-hidden="true" />
      <figcaption className="photo__label">
        <span className="photo__tag">Foto real pendiente</span>
        {p.label}
      </figcaption>
    </figure>
  );
}
