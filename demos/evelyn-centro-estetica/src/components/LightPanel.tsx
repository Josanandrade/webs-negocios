import Image from "next/image";

type Props = {
  variant: "hero" | "facial" | "space";
  photo: { src: string; alt: string } | null;
  className?: string;
  children?: React.ReactNode;
  priority?: boolean;
  sizes?: string;
  /** Firma tipográfica decorativa sobre el panel. */
  mark?: string;
};

/**
 * Marco fotográfico. Con foto real muestra la imagen; sin ella, un panel de
 * luz neutro y decorativo (no simula ninguna fotografía del centro).
 */
export function LightPanel({ variant, photo, className = "", children, priority, sizes = "100vw", mark }: Props) {
  return (
    <figure className={`panel panel--${variant} ${className}`}>
      {photo ? (
        <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} className="panel__img" />
      ) : (
        <div className="panel__light" aria-hidden="true">
          <span className="panel__glow" />
          <span className="panel__grain" />
        </div>
      )}
      {mark ? (
        <span className="panel__mark" aria-hidden="true">
          {mark}
        </span>
      ) : null}
      {children ? <figcaption className="panel__caption">{children}</figcaption> : null}
    </figure>
  );
}
