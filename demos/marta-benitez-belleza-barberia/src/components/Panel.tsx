import { photos, type Area } from "@/content/site";

// Panel de imagen de cada área. Mientras no haya fotografía real del salón
// se pinta una composición tipográfica (no simula ser una foto); en cuanto
// se añade una entrada en `photos`, aparece la imagen en su lugar.
export default function Panel({ id, glyph, caption }: { id: Area["id"] | "salon"; glyph: string; caption: string }) {
  const photo = photos[id];
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="panel panel--photo" src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />;
  }
  return (
    <div className={`panel panel--${id}`} aria-hidden="true">
      <span className="panel__glyph">{glyph}</span>
      <span className="panel__caption">{caption}</span>
    </div>
  );
}
