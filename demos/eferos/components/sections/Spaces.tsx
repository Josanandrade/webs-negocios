import { business } from "@/business.config";
import PhotoFrame from "@/components/PhotoFrame";
import styles from "./Spaces.module.css";

/**
 * "Dónde te tratamos": tira editorial de fotografías + los tres espacios.
 *
 * La tira es una fila con scroll horizontal nativo (táctil, trackpad, teclado).
 * En escritorio, si el navegador soporta animaciones ligadas al scroll y el
 * usuario no pide movimiento reducido, la fila se desplaza lateralmente mientras
 * la página baja. Es CSS puro (animation-timeline: view()), sin JavaScript.
 */
export default function Spaces() {
  return (
    <section id="centro" className={`section ${styles.section}`} aria-labelledby="centro-title">
      <div className={`wrap grid ${styles.head}`}>
        <div className={styles.heading}>
          <p className="label mark">El centro</p>
          <h2 id="centro-title" className={styles.title}>
            Dónde te tratamos
          </h2>
        </div>
        <p className={`muted ${styles.intro}`}>
          En el corazón de {business.address.locality}, {business.address.landmark.toLowerCase()}. Y
          cuando no puedes venir, vamos nosotros.
        </p>
      </div>

      <div
        className={styles.strip}
        role="region"
        aria-label="Fotografías del centro"
        tabIndex={0}
      >
        <ul role="list" className={styles.track}>
          {business.gallery.map((photo, i) => (
            <li
              key={`${photo.caption}-${i}`}
              className={styles.shot}
              style={{ ["--r" as string]: photo.width / photo.height }}
            >
              <figure>
                <PhotoFrame
                  src={photo.src}
                  alt={photo.alt}
                  label={photo.caption}
                  ratio={`${photo.width} / ${photo.height}`}
                  sizes="(max-width: 900px) 80vw, 45vw"
                  showLabel={false}
                />
                <figcaption className="label">{photo.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>

      <div className="wrap">
        <ul role="list" className={styles.spaces}>
          {business.spaces.map((space) => (
            <li key={space.id} className={styles.space} data-reveal>
              <p className="label">{space.where}</p>
              <h3 className={styles.spaceTitle}>{space.title}</h3>
              <p className={styles.spaceText}>{space.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
