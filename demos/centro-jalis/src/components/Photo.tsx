import Image from "next/image";
import { photos, type PhotoKey } from "@/content/photos";

type Props = {
  slot: PhotoKey;
  className?: string;
  sizes?: string;
  priority?: boolean;
  tone?: "dark" | "light";
};

// Foto real si existe; si no, una composición de identidad que deja claro qué
// imagen va en ese hueco sin fingir que es del centro.
export function Photo({ slot, className = "", sizes = "100vw", priority, tone = "dark" }: Props) {
  const p = photos[slot];
  if (p.src) {
    return (
      <div className={`photo ${className}`}>
        <Image src={p.src} alt={p.alt} fill sizes={sizes} priority={priority} quality={80} />
      </div>
    );
  }
  return (
    <div className={`photo photo--placeholder photo--${tone} ${className}`} role="img" aria-label={`Espacio para fotografía: ${p.alt}`}>
      <svg className="photo__lines" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <circle cx="200" cy="230" r="150" />
        <circle cx="200" cy="230" r="118" />
        <path d="M0 430 H400" />
        <path d="M0 438 H400" />
      </svg>
      <span className="photo__j" aria-hidden="true">J</span>
      <span className="photo__brief" aria-hidden="true">
        <span className="photo__dot" /> Foto real · {p.brief}
      </span>
    </div>
  );
}
