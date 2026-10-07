import { business } from "@/business.config";
import PhotoStrip from "@/components/PhotoStrip";
import styles from "./Spaces.module.css";

/**
 * "Dónde te tratamos": tira de fotografías reales (PhotoStrip) + los tres espacios.
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

      <PhotoStrip photos={business.gallery} label="Fotografías del centro" />

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
