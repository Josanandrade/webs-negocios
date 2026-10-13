import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./ArchFrame.module.css";

type Props = {
  /** Ruta en /public. Si no hay foto todavía, se pinta una composición de marca. */
  src?: string | null;
  alt?: string;
  tone?: "olive" | "sand" | "clay";
  className?: string;
  sizes?: string;
  priority?: boolean;
  children?: ReactNode;
};

/**
 * Marco en arco (motivo de marca). Preparado para recibir la fotografía real
 * del negocio: basta con rellenar `src` (ver README_ASSETS.md). Mientras tanto
 * muestra una composición abstracta que no simula ser una foto.
 */
export function ArchFrame({ src, alt = "", tone = "olive", className = "", sizes = "(min-width: 900px) 40vw, 90vw", priority, children }: Props) {
  return (
    <div className={`${styles.arch} ${styles[tone]} ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={styles.photo} />
      ) : (
        <div className={styles.art} aria-hidden="true">
          <span className={styles.glow} />
          <svg className={styles.lines} viewBox="0 0 400 520" preserveAspectRatio="xMidYMax slice">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const inset = 34 + i * 30;
              const r = 200 - inset;
              return (
                <path
                  key={i}
                  d={`M${inset} 540 V${200 + i * 6} A${r} ${r} 0 0 1 ${400 - inset} ${200 + i * 6} V540`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity={0.5 - i * 0.05}
                />
              );
            })}
          </svg>
          <span className={styles.grain} />
        </div>
      )}
      {children ? <div className={styles.content}>{children}</div> : null}
    </div>
  );
}
