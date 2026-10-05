import Image from "next/image";
import styles from "./PhotoFrame.module.css";

type Props = {
  src: string | null;
  alt: string;
  /** Texto del hueco mientras no haya fotografía real */
  label: string;
  ratio?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Marco fotográfico. Con `src` muestra la imagen optimizada (next/image).
 * Sin `src` dibuja un hueco diseñado con la retícula de medición de la marca,
 * listo para sustituirse desde business.config.ts.
 */
export default function PhotoFrame({
  src,
  alt,
  label,
  ratio = "4 / 5",
  sizes = "(max-width: 900px) 100vw, 50vw",
  priority = false,
  className = "",
  children,
}: Props) {
  return (
    <div className={`${styles.frame} ${className}`} style={{ aspectRatio: ratio }}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={styles.img} />
      ) : (
        <div className={styles.placeholder} role="img" aria-label={alt}>
          <span className={styles.corner} data-pos="tl" />
          <span className={styles.corner} data-pos="tr" />
          <span className={styles.corner} data-pos="bl" />
          <span className={styles.corner} data-pos="br" />
          <svg className={styles.reticle} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
            <circle cx="50" cy="50" r="30" />
            <path d="M50 4v24M50 72v24M4 50h24M72 50h24" />
          </svg>
          <span className={`label ${styles.tag}`}>Foto · {label}</span>
        </div>
      )}
      {children}
    </div>
  );
}
