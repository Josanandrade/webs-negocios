import Link from "next/link";
import { business } from "@/business.config";
import BrandName from "@/components/BrandName";
import styles from "./Treatments.module.css";

/** Índice de tratamientos: filas tipográficas que enlazan a cada especialidad. */
export default function Treatments() {
  return (
    <section id="tratamientos" className={`section ${styles.section}`} aria-labelledby="tratamientos-title">
      <div className={`wrap grid ${styles.head}`}>
        <h2 id="tratamientos-title" className={styles.title} data-reveal>
          Tratamientos
        </h2>
        <p className={`muted ${styles.intro}`} data-reveal style={{ ["--delay" as string]: "100ms" }}>
          Cada técnica tiene su momento. En la primera visita valoramos tu caso y decidimos cuáles
          te ayudan y en qué orden.
        </p>
      </div>

      <div className="wrap">
        <ul role="list" className={styles.list}>
          {business.services.map((s, i) => (
            <li key={s.slug} data-reveal style={{ ["--delay" as string]: `${i * 60}ms` }}>
              <Link href={`/especialidades/${s.slug}`} className={styles.row}>
                <span className={`label ${styles.kind}`}>{s.kind}</span>
                <span className={styles.name}>
                  <BrandName name={s.name} />
                  {s.fullName && <span className={styles.fullName}>{s.fullName}</span>}
                </span>
                <span className={styles.summary}>{s.summary}</span>
                <span className={styles.arrow} aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
