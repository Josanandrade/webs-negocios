import Image from "next/image";
import type { Photo } from "@/lib/photos";

// Muestra la foto real si existe; si no, una composición sobria (luz de
// ventana sobre pared encalada) con una etiqueta discreta de hueco reservado.
export function PhotoSlot({ photo, label, className = "", sizes }: { photo: Photo; label: string; className?: string; sizes: string }) {
  if (photo) {
    return (
      <figure className={`photo ${className}`}>
        <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes={sizes} />
      </figure>
    );
  }
  return (
    <div className={`photo photo--placeholder ${className}`} role="img" aria-label={`Espacio reservado para una foto real: ${label}`}>
      <span className="photo__light" />
      <span className="photo__frame" />
      <span className="photo__tag">Foto real · {label}</span>
    </div>
  );
}
