import Image from "next/image";
import { Wave } from "./Wave";

export type Photo = { src: string; alt: string; width: number; height: number } | null;

type Variant = "portrait" | "room" | "detail";

const palettes: Record<Variant, { bg: string; wave: string; shape: string }> = {
  portrait: { bg: "bg-green-deep", wave: "#d9a547", shape: "bg-green" },
  room: { bg: "bg-sand-deep", wave: "#a8502f", shape: "bg-blush" },
  detail: { bg: "bg-sage", wave: "#2c5848", shape: "bg-paper" },
};

/**
 * Hueco de fotografía sustituible. Con `photo` muestra la imagen real del
 * centro; sin ella, una composición de identidad (ondas + formas) que funciona
 * como ilustración por derecho propio. Nunca se muestra "foto pendiente".
 */
export function PhotoSlot({
  photo,
  variant,
  className = "",
  shape = "arch",
  sizes = "(min-width: 1024px) 40vw, 90vw",
  priority = false,
  label,
  words,
}: {
  photo: Photo;
  variant: Variant;
  className?: string;
  shape?: "arch" | "rounded";
  sizes?: string;
  priority?: boolean;
  /** Pequeño texto editorial dentro de la composición (solo en fallback). */
  label?: string;
  /** Palabras editoriales grandes dentro de la composición (solo en fallback). */
  words?: string[];
}) {
  const radius = shape === "arch" ? "arch" : "rounded-[28px]";

  if (photo) {
    return (
      <div className={`relative overflow-hidden ${radius} ${className}`}>
        <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }

  const p = palettes[variant];
  return (
    <div aria-hidden className={`grain relative overflow-hidden ${radius} ${p.bg} ${className}`}>
      <div className={`absolute -right-[18%] -top-[10%] aspect-square w-[75%] rounded-full opacity-60 ${p.shape}`} />
      <div className={`absolute -bottom-[22%] -left-[20%] aspect-square w-[70%] rounded-full opacity-40 ${p.shape}`} />
      <Wave
        className={`absolute inset-x-0 h-[22%] w-full ${words ? "top-[64%]" : "top-[46%]"}`}
        lines={5}
        stroke={p.wave}
        amplitude={18}
      />
      <Wave
        className={`absolute inset-x-0 h-[14%] w-full opacity-60 ${words ? "top-[84%]" : "top-[66%]"}`}
        lines={3}
        stroke={p.wave}
        amplitude={10}
      />
      {words && (
        <ul className="absolute left-[14%] top-[24%] font-serif text-[clamp(1.5rem,5vw,2.6rem)] leading-[1.12] text-paper sm:left-[9%] sm:top-[22%]">
          {words.map((w, i) => (
            <li key={w} className={i % 2 ? "italic text-albero" : ""} style={{ paddingLeft: `${i * 0.6}em` }}>
              {w}
            </li>
          ))}
        </ul>
      )}
      {label && (
        <span
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-serif text-sm italic ${variant === "portrait" ? "text-paper/80" : "text-ink/70"}`}
        >
          {label}
        </span>
      )}
    </div>
  );
}
