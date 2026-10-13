import Image from "next/image";
import type { PhotoSlot } from "@/content/photos";
import { Mark } from "./Mark";

// Encuadre de cada recorte dentro del círculo (escala y desplazamiento).
const crops = {
  whole: "pompom__mark--whole",
  head: "pompom__mark--head",
  tail: "pompom__mark--tail",
} as const;

/*
  Marco circular de la marca. Con foto, la recorta en círculo; sin foto,
  enseña un encuadre del caniche: decorativo, sin texto de relleno.
*/
export function Pompom({
  photo,
  sizes,
  priority = false,
  className = "",
}: {
  photo: PhotoSlot;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`pompom pompom--${photo.tone} ${className}`}>
      {photo.src ? (
        <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} quality={75} />
      ) : (
        <Mark
          className={`pompom__mark ${crops[photo.crop]}`}
          ear={photo.tone === "mist" ? "var(--pink)" : "var(--paper)"}
          cut={photo.tone === "ink" ? "var(--ink)" : photo.tone === "pink" ? "var(--pink)" : "var(--mist)"}
        />
      )}
    </div>
  );
}
