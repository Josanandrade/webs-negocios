import Image from "next/image";
import { photos } from "@/content/photos";
import type { PhotoKey } from "@/content/site";

type Props = {
  name: PhotoKey;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/*
  Hueco de foto. Con `src` pinta la foto real; sin ella, una composición
  de línea fina sobre el degradado de la marca (decorativa, aria-hidden).
*/
export function Photo({ name, sizes, priority, className }: Props) {
  const photo = photos[name];

  return (
    <div className={`photo ${className ?? ""}`} data-motif={photo.motif}>
      {photo.src ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          priority={priority}
          quality={80}
        />
      ) : (
        <Motif motif={photo.motif} />
      )}
    </div>
  );
}

function Motif({ motif }: { motif: (typeof photos)[PhotoKey]["motif"] }) {
  return (
    <svg
      className="motif"
      viewBox="0 0 200 260"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {motif === "glow" && (
        <g fill="none" stroke="currentColor" strokeWidth="0.6">
          <ellipse cx="100" cy="130" rx="78" ry="108" opacity="0.55" />
          <path
            d="M64 70 C65 80 68 83 78 84 C68 85 65 88 64 98 C63 88 60 85 50 84 C60 83 63 80 64 70 Z"
            fill="currentColor"
            stroke="none"
            opacity="0.5"
          />
        </g>
      )}
      {motif === "ripple" && (
        <g fill="none" stroke="currentColor" strokeWidth="0.6">
          {[18, 34, 50, 66, 82, 98].map((r, i) => (
            <circle key={r} cx="100" cy="150" r={r} opacity={1 - i * 0.14} />
          ))}
        </g>
      )}
      {motif === "lash" && (
        <g fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round">
          <path d="M40 140 Q100 176 160 140" />
          {Array.from({ length: 13 }, (_, i) => {
            const t = i / 12;
            const x = 40 + t * 120;
            const y = 140 + Math.sin(Math.PI * t) * 18;
            const lean = (t - 0.5) * 26;
            const len = 22 + Math.sin(Math.PI * t) * 16;
            return (
              <path
                key={i}
                d={`M${x.toFixed(1)} ${y.toFixed(1)} q${(lean * 0.3).toFixed(1)} ${(len * 0.6).toFixed(1)} ${lean.toFixed(1)} ${len.toFixed(1)}`}
              />
            );
          })}
        </g>
      )}
      {motif === "almond" && (
        <g fill="none" stroke="currentColor" strokeWidth="0.7">
          {[-34, -12, 10, 32].map((x, i) => (
            <path
              key={x}
              transform={`translate(${100 + x} ${118 + Math.abs(i - 1.5) * 10}) rotate(${(i - 1.5) * 7})`}
              d="M0 -46 C14 -46 16 -20 16 6 L16 46 L-16 46 L-16 6 C-16 -20 -14 -46 0 -46 Z"
            />
          ))}
        </g>
      )}
      {motif === "wave" && (
        <g fill="none" stroke="currentColor" strokeWidth="0.6">
          {Array.from({ length: 9 }, (_, i) => (
            <path
              key={i}
              d={`M-10 ${70 + i * 16} C 40 ${50 + i * 16}, 70 ${100 + i * 16}, 110 ${80 + i * 16} S 180 ${60 + i * 16}, 210 ${84 + i * 16}`}
              opacity={0.35 + (i % 3) * 0.25}
            />
          ))}
        </g>
      )}
      {motif === "door" && (
        <g fill="none" stroke="currentColor" strokeWidth="0.7">
          <rect x="54" y="60" width="92" height="170" rx="46" />
          <rect x="66" y="74" width="68" height="142" rx="34" opacity="0.45" />
          <line x1="20" y1="230" x2="180" y2="230" />
        </g>
      )}
    </svg>
  );
}
