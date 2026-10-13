import type { CSSProperties } from "react";
import { business } from "@/business.config";
import { reviewThemes } from "@/lib/content";
import { ArrowIcon, StarIcon } from "../Icons";
import styles from "./Reviews.module.css";

export function Reviews() {
  const { rating } = business;
  return (
    <section className={styles.section} aria-labelledby="reviews-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.score} data-reveal>
          <p className="eyebrow">Opiniones de pacientes</p>
          <h2 id="reviews-title" className="visually-hidden">
            Opiniones de pacientes
          </h2>
          <p className={styles.value}>
            {rating.value}
            <span>/5</span>
          </p>
          <p className={styles.stars} aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <StarIcon key={i} />
            ))}
          </p>
          <p className={styles.count}>Con {rating.count} opiniones públicas de pacientes.</p>
          <a className={styles.link} href={business.address.mapsUrl} target="_blank" rel="noopener">
            Ver opiniones en Google <ArrowIcon />
          </a>
        </div>

        <div className={styles.themes}>
          <p className={styles.intro} data-reveal>
            Lo que más se repite cuando los pacientes hablan de Angélica:
          </p>
          <ul role="list">
            {reviewThemes.map((t, i) => (
              <li key={t.title} data-reveal style={{ "--reveal-delay": `${i * 80}ms` } as CSSProperties}>
                <h3>{t.title}</h3>
                <p>{t.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
