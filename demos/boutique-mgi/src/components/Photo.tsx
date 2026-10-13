import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { photos, type PhotoKey } from "@/content/photos";

const ASSET_DIR = "assets/boutique-mgi";

function hasAsset(file: string) {
  return existsSync(path.join(process.cwd(), "public", ASSET_DIR, file));
}

type Props = {
  slot: PhotoKey;
  sizes: string;
  className?: string;
  eager?: boolean;
};

// Muestra la foto real si existe; si no, una composición editorial con la
// misma proporción, para que el layout no cambie al sustituirla (CLS 0).
export function Photo({ slot, sizes, className, eager }: Props) {
  const p = photos[slot];
  const ratio = `${p.width} / ${p.height}`;

  if (hasAsset(p.file)) {
    return (
      <figure className={`photo ${className ?? ""}`} style={{ aspectRatio: ratio }}>
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

  const { tone, glyph, caption } = p.fallback;
  return (
    <figure
      className={`photo photo--fallback tone-${tone} ${className ?? ""}`}
      style={{ aspectRatio: ratio }}
      aria-hidden="true"
    >
      <svg className="photo__thread" viewBox="0 0 400 500" preserveAspectRatio="none">
        <path d="M-10 380 C 90 330, 140 120, 250 150 S 380 330, 420 90" />
      </svg>
      <span className={`photo__glyph ${glyph.length > 2 ? "is-word" : ""}`}>{glyph}</span>
      <figcaption className="photo__caption">{caption}</figcaption>
    </figure>
  );
}
