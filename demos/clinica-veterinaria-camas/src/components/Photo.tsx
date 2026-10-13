import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { photos, type PhotoKey } from "@/content/photos";

const ASSET_DIR = "assets/clinica-veterinaria-camas";

function hasAsset(file: string) {
  return existsSync(path.join(process.cwd(), "public", ASSET_DIR, file));
}

type Props = {
  slot: PhotoKey;
  sizes: string;
  className?: string;
  eager?: boolean;
};

// Foto real si existe; si no, una composición de color de marca con la misma
// proporción.
export function Photo({ slot, sizes, className = "", eager }: Props) {
  const p = photos[slot];
  const ratio = `${p.width} / ${p.height}`;
  const caption = "caption" in p ? p.caption : undefined;

  if (hasAsset(p.file)) {
    return (
      <figure className={`photo ${className}`} style={{ aspectRatio: ratio }}>
        <Image
          src={`/${ASSET_DIR}/${p.file}`}
          alt={p.alt}
          width={p.width}
          height={p.height}
          sizes={sizes}
          quality={80}
          {...(eager ? { loading: "eager", fetchPriority: "high" } : {})}
        />
        {caption ? <figcaption className="photo__caption">{caption}</figcaption> : null}
      </figure>
    );
  }

  return (
    <figure className={`photo photo--art tone-${p.tone} ${className}`} style={{ aspectRatio: ratio }}>
      <span className="photo__orb photo__orb--a" aria-hidden="true" />
      <span className="photo__orb photo__orb--b" aria-hidden="true" />
      <span className="photo__grain" aria-hidden="true" />
      {caption ? <figcaption className="photo__caption">{caption}</figcaption> : null}
    </figure>
  );
}
